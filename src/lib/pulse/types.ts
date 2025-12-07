// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Market Intelligence Platform
// Core Type Definitions (PRD-Aligned)
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL DOMAINS (from PRD §2.1)
// ─────────────────────────────────────────────────────────────────────────────

export type SignalDomain =
    | 'COMPETITIVE'   // Competitor moves, products, M&A
    | 'REGULATORY'    // CMS, ONC, HHS, state regulations
    | 'TECHNOLOGY'    // AI/ML, FHIR, interoperability
    | 'MARKET'        // Funding, M&A, payer/provider trends
    | 'NEWS';         // Breaking news, events, general

export const DOMAIN_CONFIG: Record<SignalDomain, { label: string; icon: string; color: string }> = {
    COMPETITIVE: { label: 'Competitive', icon: '💓', color: 'rose' },
    REGULATORY: { label: 'Regulatory', icon: '📜', color: 'amber' },
    TECHNOLOGY: { label: 'Technology', icon: '🔬', color: 'cyan' },
    MARKET: { label: 'Market', icon: '💰', color: 'emerald' },
    NEWS: { label: 'News', icon: '📰', color: 'slate' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL TYPES (from PRD §2.2-2.5)
// ─────────────────────────────────────────────────────────────────────────────

export type SignalType =
    // Competitive
    | 'PRODUCT_LAUNCH'
    | 'M_AND_A'
    | 'FUNDING'
    | 'PARTNERSHIP'
    | 'LEADERSHIP'
    | 'HIRING'
    | 'PATENT'
    | 'CUSTOMER_WIN'
    // Regulatory
    | 'PROPOSED_RULE'
    | 'FINAL_RULE'
    | 'GUIDANCE'
    | 'ENFORCEMENT'
    | 'DEADLINE'
    // Market
    | 'EARNINGS'
    | 'MARKET_REPORT'
    // General
    | 'NEWS'
    | 'EVENT';

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY & URGENCY (from PRD §3.3)
// ─────────────────────────────────────────────────────────────────────────────

export type SignalPriority = 'critical' | 'high' | 'medium' | 'low';

export const PRIORITY_CONFIG: Record<SignalPriority, { label: string; color: string; bgColor: string }> = {
    critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
    high: { label: 'High', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
    medium: { label: 'Medium', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
    low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL SOURCE (from PRD §3.1)
// ─────────────────────────────────────────────────────────────────────────────

export type SourceTier = 1 | 2 | 3 | 4;

export interface SignalSource {
    id: string;
    name: string;
    tier: SourceTier;
    type: 'api' | 'rss' | 'crawl' | 'manual';
    favicon?: string;
    url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITIES (from PRD §3.3)
// ─────────────────────────────────────────────────────────────────────────────

export interface SignalEntities {
    companies: string[];
    people: Array<{ name: string; role?: string; company?: string }>;
    topics: string[];
    products: string[];
    regulations: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE SIGNAL TYPE (from PRD §3.2)
// ─────────────────────────────────────────────────────────────────────────────

export interface PulseSignal {
    // Identity
    id: string;
    hash?: string; // For deduplication

    // Content
    title: string;
    summary: string;
    url: string;
    imageUrl?: string;

    // Timestamps
    publishedAt: string;
    processedAt: string;

    // Classification
    domain: SignalDomain;
    signalType: SignalType;
    priority: SignalPriority;

    // Scoring (0-1 range)
    relevanceScore: number;
    importanceScore: number;

    // Entities
    entities: SignalEntities;

    // Source
    source: SignalSource;
    relatedSignals?: string[];

    // UI State
    isRead: boolean;
    isBookmarked?: boolean;
    notes?: string;

    // Regulatory metadata (only for REGULATORY domain signals)
    regulatory?: import('./regulatoryData').RegulatoryMetadata;

    // Technology metadata (only for TECHNOLOGY domain signals)
    technology?: import('./technologyData').TrendMetadata;

    // Market metadata (only for MARKET domain signals)
    market?: import('./marketData').MarketMetadata;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPETITORS (from PRD §2.2)
// ─────────────────────────────────────────────────────────────────────────────

export type CompetitorTier = 1 | 2 | 3;
export type CompetitorCategory = 'RCM' | 'Eligibility' | 'Prior Auth' | 'EDI' | 'AI/ML' | 'EHR' | 'Payer Tech';

export interface Competitor {
    id: string;
    name: string;
    tier: CompetitorTier;
    category: CompetitorCategory;
    description?: string;
    website?: string;
    founded?: number;
    hq?: string;
    employees?: string;
    signalCount: number;
    lastSignalAt: string | null;
    watchlisted: boolean;
    color: string;
}

// Tier 1: Direct Competitors - now exported from competitorData.ts
// Re-export for backward compatibility
export { TIER_1_COMPETITORS } from './competitorData';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface PulseFilter {
    domain?: SignalDomain;
    priority?: SignalPriority;
    competitors?: string[];
    topics?: string[];
    dateRange?: { start: string; end: string };
    search?: string;
    onlyUnread?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface PulseState {
    // Data
    signals: PulseSignal[];
    competitors: Competitor[];

    // UI State
    isLoading: boolean;
    error: string | null;
    lastFetchedAt: string | null;
    selectedCompetitorId: string | null;

    // Filters
    filter: PulseFilter;
    activeDomain: SignalDomain | 'ALL';

    // Stats
    stats: {
        total: number;
        unread: number;
        byDomain: Record<SignalDomain, number>;
        byPriority: Record<SignalPriority, number>;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// API RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

export const API_CONFIG = {
    // NewsAPI limit: 100 calls/day
    // Strategy: 6-hour cache = max 4 scheduled fetches/day
    CACHE_DURATION_MS: 6 * 60 * 60 * 1000, // 6 hours
    MAX_CALLS_PER_DAY: 100,
    SAFE_CALLS_PER_DAY: 12, // Conservative budget

    // Keywords for healthcare + competitive intelligence
    QUERY_KEYWORDS: [
        'healthcare',
        'Waystar',
        'Availity',
        'Optum',
        'Change Healthcare',
        'prior authorization',
        'CMS regulation',
        'FHIR',
        'RCM',
        'claims processing',
    ],
} as const;
