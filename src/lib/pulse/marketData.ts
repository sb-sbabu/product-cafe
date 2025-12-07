// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Market Intelligence Database
// Comprehensive profiles for healthcare market signals, M&A, and funding
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// MARKET SIGNAL TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MarketSignalType =
    | 'FUNDING'
    | 'MA'           // Merger & Acquisition
    | 'PARTNERSHIP'
    | 'IPO'
    | 'DIVESTITURE'
    | 'EXPANSION';

export type FundingRound =
    | 'SEED'
    | 'SERIES_A'
    | 'SERIES_B'
    | 'SERIES_C'
    | 'SERIES_D_PLUS'
    | 'GROWTH'
    | 'DEBT'
    | 'UNKNOWN';

export type DealSize =
    | 'MEGA'      // $1B+
    | 'LARGE'     // $500M-$1B
    | 'MID'       // $100M-$500M
    | 'SMALL'     // $10M-$100M
    | 'MICRO'     // <$10M
    | 'UNDISCLOSED';

export type MarketSegment =
    | 'PAYER'
    | 'PROVIDER'
    | 'PHARMA'
    | 'MEDTECH'
    | 'DIGITAL_HEALTH'
    | 'SERVICES';

// ─────────────────────────────────────────────────────────────────────────────
// MARKET METADATA INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketMetadata {
    signalType: MarketSignalType;
    dealSize?: DealSize;
    valuationAmount?: number;           // in millions USD
    fundingRound?: FundingRound;
    segment: MarketSegment;
    acquirer?: string;
    target?: string;
    investors?: string[];
    strategicRationale?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL TYPE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SignalTypeProfile {
    id: MarketSignalType;
    name: string;
    icon: string;
    color: string;
    description: string;
}

export const MARKET_SIGNAL_TYPES: SignalTypeProfile[] = [
    {
        id: 'FUNDING',
        name: 'Funding',
        icon: '💰',
        color: '#10B981',
        description: 'Venture capital, private equity, and growth investments.',
    },
    {
        id: 'MA',
        name: 'M&A',
        icon: '🤝',
        color: '#8B5CF6',
        description: 'Mergers, acquisitions, and consolidation activity.',
    },
    {
        id: 'PARTNERSHIP',
        name: 'Partnership',
        icon: '🔗',
        color: '#3B82F6',
        description: 'Strategic partnerships, JVs, and alliances.',
    },
    {
        id: 'IPO',
        name: 'IPO/SPAC',
        icon: '📈',
        color: '#F59E0B',
        description: 'Initial public offerings and SPAC transactions.',
    },
    {
        id: 'DIVESTITURE',
        name: 'Divestiture',
        icon: '📤',
        color: '#EF4444',
        description: 'Asset sales, spin-offs, and carve-outs.',
    },
    {
        id: 'EXPANSION',
        name: 'Expansion',
        icon: '🌍',
        color: '#06B6D4',
        description: 'Geographic or product line expansion.',
    },
];

export const SIGNAL_TYPE_BY_ID = new Map<MarketSignalType, SignalTypeProfile>(
    MARKET_SIGNAL_TYPES.map(t => [t.id, t])
);

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SegmentProfile {
    id: MarketSegment;
    name: string;
    icon: string;
    color: string;
}

export const MARKET_SEGMENTS: SegmentProfile[] = [
    { id: 'PAYER', name: 'Payer', icon: '🏦', color: '#3B82F6' },
    { id: 'PROVIDER', name: 'Provider', icon: '🏥', color: '#10B981' },
    { id: 'PHARMA', name: 'Pharma/Life Sciences', icon: '💊', color: '#8B5CF6' },
    { id: 'MEDTECH', name: 'MedTech', icon: '🔬', color: '#EC4899' },
    { id: 'DIGITAL_HEALTH', name: 'Digital Health', icon: '📱', color: '#06B6D4' },
    { id: 'SERVICES', name: 'Services', icon: '⚙️', color: '#F59E0B' },
];

export const SEGMENT_BY_ID = new Map<MarketSegment, SegmentProfile>(
    MARKET_SEGMENTS.map(s => [s.id, s])
);

// ─────────────────────────────────────────────────────────────────────────────
// DEAL SIZE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const DEAL_SIZE_CONFIG: Record<DealSize, { label: string; color: string; minValue: number }> = {
    MEGA: { label: '$1B+', color: 'text-purple-700', minValue: 1000 },
    LARGE: { label: '$500M-$1B', color: 'text-blue-700', minValue: 500 },
    MID: { label: '$100M-$500M', color: 'text-cyan-700', minValue: 100 },
    SMALL: { label: '$10M-$100M', color: 'text-green-700', minValue: 10 },
    MICRO: { label: '<$10M', color: 'text-gray-600', minValue: 0 },
    UNDISCLOSED: { label: 'Undisclosed', color: 'text-gray-400', minValue: -1 },
};

export const FUNDING_ROUND_CONFIG: Record<FundingRound, { label: string; color: string }> = {
    SEED: { label: 'Seed', color: 'bg-lime-100 text-lime-700' },
    SERIES_A: { label: 'Series A', color: 'bg-green-100 text-green-700' },
    SERIES_B: { label: 'Series B', color: 'bg-cyan-100 text-cyan-700' },
    SERIES_C: { label: 'Series C', color: 'bg-blue-100 text-blue-700' },
    SERIES_D_PLUS: { label: 'Series D+', color: 'bg-purple-100 text-purple-700' },
    GROWTH: { label: 'Growth', color: 'bg-amber-100 text-amber-700' },
    DEBT: { label: 'Debt', color: 'bg-gray-100 text-gray-700' },
    UNKNOWN: { label: 'Unknown', color: 'bg-gray-50 text-gray-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// DETECTION PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

const SIGNAL_TYPE_PATTERNS: Array<{ patterns: string[]; type: MarketSignalType }> = [
    { patterns: ['raises', 'funding', 'investment', 'round', 'million', 'venture', 'backed', 'secures'], type: 'FUNDING' },
    { patterns: ['acquires', 'acquisition', 'merger', 'merges', 'buys', 'purchase', 'takeover', 'deal'], type: 'MA' },
    { patterns: ['partners', 'partnership', 'alliance', 'collaboration', 'joint venture', 'teams up'], type: 'PARTNERSHIP' },
    { patterns: ['ipo', 'public offering', 'spac', 'goes public', 'stock market', 'nasdaq', 'nyse'], type: 'IPO' },
    { patterns: ['divests', 'divestiture', 'sells', 'spin-off', 'carve-out', 'offloads'], type: 'DIVESTITURE' },
    { patterns: ['expands', 'expansion', 'enters', 'launches in', 'new market', 'international'], type: 'EXPANSION' },
];

const SEGMENT_PATTERNS: Array<{ patterns: string[]; segment: MarketSegment }> = [
    { patterns: ['payer', 'insurer', 'health plan', 'medicare advantage', 'managed care', 'anthem', 'cigna', 'humana', 'aetna'], segment: 'PAYER' },
    { patterns: ['provider', 'hospital', 'health system', 'clinic', 'physician', 'hca', 'tenet', 'ascension'], segment: 'PROVIDER' },
    { patterns: ['pharma', 'pharmaceutical', 'drug', 'pfizer', 'johnson', 'novartis', 'roche', 'abbvie'], segment: 'PHARMA' },
    { patterns: ['medtech', 'medical device', 'diagnostic', 'medtronic', 'abbott', 'stryker', 'boston scientific'], segment: 'MEDTECH' },
    { patterns: ['digital health', 'telehealth', 'healthtech', 'teladoc', 'livongo', 'amwell', 'app'], segment: 'DIGITAL_HEALTH' },
    { patterns: ['services', 'consulting', 'revenue cycle', 'billing', 'outsourcing', 'bpo'], segment: 'SERVICES' },
];

const FUNDING_PATTERNS: Array<{ patterns: string[]; round: FundingRound }> = [
    { patterns: ['seed', 'pre-seed'], round: 'SEED' },
    { patterns: ['series a', 'series-a'], round: 'SERIES_A' },
    { patterns: ['series b', 'series-b'], round: 'SERIES_B' },
    { patterns: ['series c', 'series-c'], round: 'SERIES_C' },
    { patterns: ['series d', 'series e', 'series f', 'series-d'], round: 'SERIES_D_PLUS' },
    { patterns: ['growth equity', 'growth round', 'late stage'], round: 'GROWTH' },
    { patterns: ['debt', 'credit', 'loan'], round: 'DEBT' },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function detectMarketSignalType(text: string): MarketSignalType | null {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();

    for (const { patterns, type } of SIGNAL_TYPE_PATTERNS) {
        if (patterns.some(p => lower.includes(p))) {
            return type;
        }
    }
    return null;
}

export function detectMarketSegment(text: string): MarketSegment | null {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();

    for (const { patterns, segment } of SEGMENT_PATTERNS) {
        if (patterns.some(p => lower.includes(p))) {
            return segment;
        }
    }
    return null;
}

export function detectFundingRound(text: string): FundingRound {
    if (!text || typeof text !== 'string') return 'UNKNOWN';
    const lower = text.toLowerCase();

    for (const { patterns, round } of FUNDING_PATTERNS) {
        if (patterns.some(p => lower.includes(p))) {
            return round;
        }
    }
    return 'UNKNOWN';
}

export function extractValuation(text: string): { amount: number; size: DealSize } | null {
    if (!text || typeof text !== 'string') return null;

    // Match patterns like "$500 million", "$1.2 billion", "$50M"
    const patterns = [
        /\$(\d+(?:\.\d+)?)\s*(billion|b)/i,
        /\$(\d+(?:\.\d+)?)\s*(million|m)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const num = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            const amount = unit.startsWith('b') ? num * 1000 : num;

            let size: DealSize;
            if (amount >= 1000) size = 'MEGA';
            else if (amount >= 500) size = 'LARGE';
            else if (amount >= 100) size = 'MID';
            else if (amount >= 10) size = 'SMALL';
            else size = 'MICRO';

            return { amount, size };
        }
    }

    return null;
}

export function formatValuation(amountInMillions: number): string {
    if (amountInMillions >= 1000) {
        return `$${(amountInMillions / 1000).toFixed(1)}B`;
    }
    return `$${amountInMillions.toFixed(0)}M`;
}

// Known investors for mention detection
const INVESTORS = [
    'Andreessen Horowitz', 'a16z', 'Sequoia', 'General Catalyst', 'Kleiner Perkins',
    'GV', 'NEA', 'Venrock', 'Oak HC/FT', 'Andreessen', 'General Atlantic',
    'KKR', 'Blackstone', 'TPG', 'Carlyle', 'Warburg Pincus', 'Vista Equity',
    'Insight Partners', 'Thoma Bravo', 'Francisco Partners', 'WCAS', 'Bain Capital',
];

const INVESTORS_LOWER = new Map(INVESTORS.map(i => [i.toLowerCase(), i]));

export function getInvestorMentions(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    const found: string[] = [];
    const lower = text.toLowerCase();
    const seen = new Set<string>();

    for (const [lowerName, originalName] of INVESTORS_LOWER) {
        if (lower.includes(lowerName) && !seen.has(originalName)) {
            found.push(originalName);
            seen.add(originalName);
        }
    }

    return found;
}
