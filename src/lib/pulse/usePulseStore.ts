import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PulseState, PulseSignal, SignalDomain, PulseFilter, SignalPriority } from './types';
import { fetchNewsSignals, getLastFetchTimestamp, canRefresh, getRateLimitStatus } from './newsService';
import { ALL_COMPETITORS, type CompetitorProfile } from './competitorData';

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

const initialState: PulseState = {
    signals: [],
    competitors: initializeCompetitors(),
    selectedCompetitorId: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    filter: {},
    activeDomain: 'ALL',
    stats: {
        total: 0,
        unread: 0,
        byDomain: { COMPETITIVE: 0, REGULATORY: 0, TECHNOLOGY: 0, MARKET: 0, NEWS: 0 },
        byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
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
                    const signals = await fetchNewsSignals(force);
                    const lastFetchedAt = getLastFetchTimestamp();

                    // Preserve read state from existing signals
                    const existingSignals = get().signals;
                    const readSignalIds = new Set(existingSignals.filter(s => s.isRead).map(s => s.id));
                    const bookmarkedIds = new Set(existingSignals.filter(s => s.isBookmarked).map(s => s.id));

                    const mergedSignals = signals.map((s: PulseSignal) => ({
                        ...s,
                        isRead: readSignalIds.has(s.id),
                        isBookmarked: bookmarkedIds.has(s.id),
                    }));

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
            partialize: (state) => ({
                signals: state.signals,
                activeDomain: state.activeDomain,
                filter: state.filter,
                // Persist only watchlist state for competitors (not signal counts)
                competitorWatchlist: state.competitors
                    .filter(c => c.watchlisted)
                    .map(c => c.id),
            }),
            // Merge watchlist on hydration
            merge: (persisted, current) => {
                const persistedState = persisted as Partial<PulseState & { competitorWatchlist?: string[] }>;
                const watchlistedIds = new Set(persistedState.competitorWatchlist || []);

                return {
                    ...current,
                    ...persistedState,
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
