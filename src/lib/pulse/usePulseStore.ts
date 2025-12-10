import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PulseState, PulseSignal, SignalDomain, PulseFilter, SignalPriority } from './types';
import { fetchNewsSignals, getLastFetchTimestamp, canRefresh, getRateLimitStatus } from './newsService';
import { ALL_COMPETITORS, type CompetitorProfile } from './competitorData';
import { processSignal } from './notifications';

// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Zustand Store
// State management with persistence & filtering
// ═══════════════════════════════════════════════════════════════════════════

interface PulseActions {
    // Data fetching
    fetchSignals: (force?: boolean) => Promise<void>;

    // Signal management
    markAsRead: (signalId: string) => void;
    markAllAsRead: () => void;
    toggleBookmark: (signalId: string) => void;

    // Filtering
    setFilter: (filter: Partial<PulseFilter>) => void;
    setActiveDomain: (domain: SignalDomain | 'ALL') => void;
    setSelectedCompetitor: (competitorId: string | null) => void;
    clearFilters: () => void;

    // Competitor management
    toggleCompetitorWatchlist: (competitorId: string) => void;
    getCompetitorsWithSignals: () => CompetitorProfile[];

    // Computed
    getFilteredSignals: () => PulseSignal[];
    getRateLimitInfo: () => { used: number; remaining: number; nextRefreshIn: number; canRefresh: boolean; lastFetch: string | null };
}

type PulseStore = PulseState & PulseActions;

// Initialize competitors from database
const initializeCompetitors = (): CompetitorProfile[] => {
    return ALL_COMPETITORS.map(c => ({ ...c, signalCount: 0, lastSignalAt: null }));
};

// ═══════════════════════════════════════════════════════════════════════════
// DEMO SIGNALS — US Healthcare focused signals for hackathon demo
// ═══════════════════════════════════════════════════════════════════════════
const generateDemoSignals = (): PulseSignal[] => {
    const now = Date.now();
    const demoData: Array<{
        title: string;
        summary: string;
        domain: SignalDomain;
        priority: SignalPriority;
        companies?: string[];
    }> = [
            // COMPETITIVE
            { title: "Waystar announces AI-powered prior authorization platform", summary: "New ML-based system promises 40% faster auth decisions. Direct competition to Availity.", domain: 'COMPETITIVE', priority: 'critical', companies: ['Waystar'] },
            { title: "Change Healthcare resumes operations after Optum integration", summary: "Full platform integration complete. Combined entity now serves 5,000+ hospitals.", domain: 'COMPETITIVE', priority: 'high', companies: ['Change Healthcare', 'Optum'] },
            { title: "R1 RCM expands AI claims processing nationwide", summary: "Generative AI tools now available to all 900+ health system clients.", domain: 'COMPETITIVE', priority: 'high', companies: ['R1 RCM'] },
            { title: "Experian Health partners with major payer network", summary: "New eligibility verification partnership covers 180M+ lives.", domain: 'COMPETITIVE', priority: 'high', companies: ['Experian Health'] },
            // REGULATORY
            { title: "CMS announces 2025 interoperability requirements", summary: "New FHIR R4 mandates for all payers by January 2025. Prior auth data sharing rules finalized.", domain: 'REGULATORY', priority: 'critical' },
            { title: "HHS updates HIPAA compliance framework", summary: "Enhanced security requirements for health data exchange. 180-day implementation timeline.", domain: 'REGULATORY', priority: 'high' },
            { title: "Medicare Advantage payment rates increase 3.5%", summary: "CMS finalizes 2025 rates. Positive impact for payers and RCM vendors.", domain: 'REGULATORY', priority: 'medium' },
            // TECHNOLOGY
            { title: "Epic Systems launches new payer platform module", summary: "Direct payer connectivity embedded in EHR. Could reduce need for clearinghouse connections.", domain: 'TECHNOLOGY', priority: 'high', companies: ['Epic'] },
            { title: "Akasa raises $60M for generative AI RCM automation", summary: "Series C funding to accelerate AI-driven denials management. Direct threat to traditional vendors.", domain: 'TECHNOLOGY', priority: 'high', companies: ['Akasa'] },
            { title: "Cohere Health expands AI prior auth to 20 new payers", summary: "Rapid payer adoption of intelligent prior authorization. Processing 2M+ auths monthly.", domain: 'TECHNOLOGY', priority: 'medium', companies: ['Cohere Health'] },
            // MARKET
            { title: "UnitedHealth Group Q4 revenue exceeds expectations", summary: "Optum segment shows 12% YoY growth. Healthcare services demand strong.", domain: 'MARKET', priority: 'medium', companies: ['Optum'] },
            { title: "PE firm acquires mid-market RCM company for $800M", summary: "Consolidation trend continues in healthcare IT. Third major RCM acquisition this quarter.", domain: 'MARKET', priority: 'medium' },
            // NEWS
            { title: "Healthcare IT spending projected to grow 8% in 2025", summary: "Gartner report highlights AI, interoperability, and patient experience priorities.", domain: 'NEWS', priority: 'low' },
            { title: "Infinitus Systems announces voice AI partnership", summary: "AI-powered benefit verification calls now handling 50% of volume for 15-hospital network.", domain: 'NEWS', priority: 'medium', companies: ['Infinitus'] },
        ];

    return demoData.map((d, i) => ({
        id: `demo-pulse-${i}`,
        title: d.title,
        summary: d.summary,
        url: '#',
        domain: d.domain,
        signalType: 'NEWS' as const,
        priority: d.priority,
        relevanceScore: d.priority === 'critical' ? 0.95 : d.priority === 'high' ? 0.8 : 0.6,
        importanceScore: d.priority === 'critical' ? 0.9 : d.priority === 'high' ? 0.7 : 0.5,
        source: { id: 'demo', name: 'Demo', tier: 1, type: 'api' as const },
        publishedAt: new Date(now - i * 3600000).toISOString(),
        processedAt: new Date(now - i * 3600000).toISOString(),
        entities: { companies: d.companies || [], people: [], topics: [], products: [], regulations: [] },
        isRead: false,
        isBookmarked: false,
    }));
};

const initialState: PulseState = {
    signals: generateDemoSignals(), // Pre-populate with demo signals
    competitors: initializeCompetitors(),
    selectedCompetitorId: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    filter: {},
    activeDomain: 'ALL',
    stats: {
        total: 14,
        unread: 14,
        byDomain: { COMPETITIVE: 4, REGULATORY: 3, TECHNOLOGY: 3, MARKET: 2, NEWS: 2 },
        byPriority: { critical: 2, high: 5, medium: 5, low: 2 },
    },
};

function calculateStats(signals: PulseSignal[]): PulseState['stats'] {
    const byDomain: Record<SignalDomain, number> = { COMPETITIVE: 0, REGULATORY: 0, TECHNOLOGY: 0, MARKET: 0, NEWS: 0 };
    const byPriority: Record<SignalPriority, number> = { critical: 0, high: 0, medium: 0, low: 0 };

    let unread = 0;
    signals.forEach(s => {
        byDomain[s.domain]++;
        byPriority[s.priority]++;
        if (!s.isRead) unread++;
    });

    return { total: signals.length, unread, byDomain, byPriority };
}

export const usePulseStore = create<PulseStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────────
            // Data Fetching
            // ─────────────────────────────────────────────────────────────────────

            fetchSignals: async (force = false) => {
                set({ isLoading: true, error: null });

                try {
                    const apiSignals = await fetchNewsSignals(force);
                    const lastFetchedAt = getLastFetchTimestamp();

                    // Preserve read state from existing signals
                    const existingSignals = get().signals;
                    const readSignalIds = new Set(existingSignals.filter(s => s.isRead).map(s => s.id));
                    const bookmarkedIds = new Set(existingSignals.filter(s => s.isBookmarked).map(s => s.id));

                    // ═══════════════════════════════════════════════════════════
                    // DEMO SIGNAL PRESERVATION
                    // Always keep demo signals to ensure rich demo experience
                    // Merge API signals with existing demo signals
                    // ═══════════════════════════════════════════════════════════

                    // Get existing demo signals (those starting with 'demo-pulse-')
                    const existingDemoSignals = existingSignals.filter(s => s.id.startsWith('demo-pulse-'));

                    // Merge: API signals first, then demo signals that aren't duplicates
                    const apiSignalTitles = new Set(apiSignals.map(s => s.title.toLowerCase()));
                    const uniqueDemoSignals = existingDemoSignals.filter(
                        demo => !apiSignalTitles.has(demo.title.toLowerCase())
                    );

                    // Combine: real API signals + demo signals for full experience
                    const allSignals = [...apiSignals, ...uniqueDemoSignals];

                    const mergedSignals = allSignals.map((s: PulseSignal) => ({
                        ...s,
                        isRead: readSignalIds.has(s.id) ? true : s.isRead,
                        isBookmarked: bookmarkedIds.has(s.id) ? true : s.isBookmarked,
                    }));

                    // ═══════════════════════════════════════════════════════════
                    // INTELLIGENT NOTIFICATION INTEGRATION
                    // Process new signals through the notification engine
                    // ═══════════════════════════════════════════════════════════
                    const existingIds = new Set(existingSignals.map(s => s.id));
                    const newSignals = mergedSignals.filter(s => !existingIds.has(s.id));

                    // Process each new signal through the intelligent engine
                    newSignals.forEach(signal => {
                        processSignal(signal);
                    });

                    set({
                        signals: mergedSignals,
                        isLoading: false,
                        lastFetchedAt,
                        stats: calculateStats(mergedSignals),
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Failed to fetch signals',
                    });
                }
            },

            // ─────────────────────────────────────────────────────────────────────
            // Signal Management
            // ─────────────────────────────────────────────────────────────────────

            markAsRead: (signalId: string) => {
                set(state => {
                    const signals = state.signals.map(s =>
                        s.id === signalId ? { ...s, isRead: true } : s
                    );
                    return { signals, stats: calculateStats(signals) };
                });
            },

            markAllAsRead: () => {
                set(state => {
                    const signals = state.signals.map(s => ({ ...s, isRead: true }));
                    return { signals, stats: calculateStats(signals) };
                });
            },

            toggleBookmark: (signalId: string) => {
                set(state => ({
                    signals: state.signals.map(s =>
                        s.id === signalId ? { ...s, isBookmarked: !s.isBookmarked } : s
                    ),
                }));
            },

            // ─────────────────────────────────────────────────────────────────────
            // Filtering
            // ─────────────────────────────────────────────────────────────────────

            setFilter: (newFilter: Partial<PulseFilter>) => {
                set(state => ({
                    filter: { ...state.filter, ...newFilter },
                }));
            },

            setActiveDomain: (domain: SignalDomain | 'ALL') => {
                set({ activeDomain: domain });
            },

            setSelectedCompetitor: (competitorId: string | null) => {
                set({ selectedCompetitorId: competitorId });
            },

            clearFilters: () => {
                set({ filter: {}, activeDomain: 'ALL', selectedCompetitorId: null });
            },

            // ─────────────────────────────────────────────────────────────────────
            // Competitor Management
            // ─────────────────────────────────────────────────────────────────────

            toggleCompetitorWatchlist: (competitorId: string) => {
                set(state => ({
                    competitors: state.competitors.map(c =>
                        c.id === competitorId ? { ...c, watchlisted: !c.watchlisted } : c
                    ),
                }));
            },

            getCompetitorsWithSignals: () => {
                const { signals, competitors } = get();

                // Pre-build pattern lookup for O(1) matching
                const patternToCompetitorId = new Map<string, string>();
                competitors.forEach(c => {
                    // Add full name
                    patternToCompetitorId.set(c.name.toLowerCase(), c.id);
                    // Add first word (e.g., "Waystar" from "Waystar Holdings")
                    const firstName = c.name.toLowerCase().split(' ')[0];
                    if (firstName.length > 3) { // Only if meaningful
                        patternToCompetitorId.set(firstName, c.id);
                    }
                    // Add name without parenthetical (e.g., "Trizetto" from "Trizetto (Cognizant)")
                    if (c.name.includes('(')) {
                        const baseName = c.name.split('(')[0].trim().toLowerCase();
                        patternToCompetitorId.set(baseName, c.id);
                    }
                });

                // Calculate signal counts per competitor
                const signalCounts = new Map<string, { count: number; lastAt: string | null }>();

                signals.forEach(signal => {
                    const matchedIds = new Set<string>(); // Avoid double-counting

                    signal.entities.companies.forEach(company => {
                        const companyLower = company.toLowerCase().trim();

                        // Direct match
                        let matchedId = patternToCompetitorId.get(companyLower);

                        // Partial match (if company name contains competitor name)
                        if (!matchedId) {
                            for (const [pattern, id] of patternToCompetitorId) {
                                if (pattern.length > 4 && companyLower.includes(pattern)) {
                                    matchedId = id;
                                    break;
                                }
                            }
                        }

                        if (matchedId && !matchedIds.has(matchedId)) {
                            matchedIds.add(matchedId);
                            const existing = signalCounts.get(matchedId) || { count: 0, lastAt: null };
                            signalCounts.set(matchedId, {
                                count: existing.count + 1,
                                lastAt: existing.lastAt || signal.publishedAt,
                            });
                        }
                    });
                });

                return competitors.map(c => ({
                    ...c,
                    signalCount: signalCounts.get(c.id)?.count || 0,
                    lastSignalAt: signalCounts.get(c.id)?.lastAt || null,
                }));
            },

            getFilteredSignals: () => {
                const { signals, filter, activeDomain, selectedCompetitorId, competitors } = get();

                return signals.filter(s => {
                    // Domain filter
                    if (activeDomain !== 'ALL' && s.domain !== activeDomain) return false;

                    // Priority filter
                    if (filter.priority && s.priority !== filter.priority) return false;

                    // Unread filter
                    if (filter.onlyUnread && s.isRead) return false;

                    // Competitor filter
                    if (selectedCompetitorId) {
                        const selectedCompetitor = competitors.find(c => c.id === selectedCompetitorId);
                        if (selectedCompetitor) {
                            const companyNames = s.entities.companies.map(c => c.toLowerCase());
                            const competitorName = selectedCompetitor.name.toLowerCase();
                            const hasMatch = companyNames.some(name =>
                                name.includes(competitorName.split(' ')[0]) ||
                                competitorName.includes(name)
                            );
                            if (!hasMatch) return false;
                        }
                    }

                    // Search filter
                    if (filter.search) {
                        const q = filter.search.toLowerCase();
                        const searchable = `${s.title} ${s.summary} ${s.entities.companies.join(' ')} ${s.entities.topics.join(' ')}`.toLowerCase();
                        if (!searchable.includes(q)) return false;
                    }

                    return true;
                });
            },

            // ─────────────────────────────────────────────────────────────────────
            // Rate Limit Info
            // ─────────────────────────────────────────────────────────────────────

            getRateLimitInfo: () => {
                const { used, remaining, nextRefreshIn } = getRateLimitStatus();
                return {
                    used,
                    remaining,
                    nextRefreshIn,
                    canRefresh: canRefresh(),
                    lastFetch: getLastFetchTimestamp(),
                };
            },
        }),
        {
            name: 'cafe-pulse-store',
            // Don't persist signals - always use demo/fresh data
            partialize: (state) => ({
                activeDomain: state.activeDomain,
                filter: state.filter,
                // Persist only watchlist state for competitors (not signal counts)
                competitorWatchlist: state.competitors
                    .filter(c => c.watchlisted)
                    .map(c => c.id),
            }),
            // Merge watchlist on hydration - ALWAYS preserve demo signals
            merge: (persisted, current) => {
                const persistedState = persisted as Partial<PulseState & { competitorWatchlist?: string[] }>;
                const watchlistedIds = new Set(persistedState.competitorWatchlist || []);

                // ALWAYS use demo signals from initialState (current) since we don't persist signals
                // This guarantees demo data is always available
                const signals = current.signals.length > 0 ? current.signals : generateDemoSignals();

                return {
                    // Start with current (which has demo signals from initialState)
                    ...current,
                    // Apply only non-signal persisted state (activeDomain, filter)
                    activeDomain: persistedState.activeDomain ?? current.activeDomain,
                    filter: persistedState.filter ?? current.filter,
                    // ALWAYS use demo signals, never overwrite with empty/undefined
                    signals,
                    stats: calculateStats(signals),
                    // Restore watchlist state to competitors
                    competitors: current.competitors.map(c => ({
                        ...c,
                        watchlisted: watchlistedIds.has(c.id) || c.watchlisted,
                    })),
                };
            },
        }
    )
);
