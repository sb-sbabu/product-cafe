// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Technology Intelligence Database
// Comprehensive profiles for healthcare technology tracks and trends
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// TECHNOLOGY TRACKS
// ─────────────────────────────────────────────────────────────────────────────

export type TechnologyTrack =
    | 'AI_ML'
    | 'INTEROPERABILITY'
    | 'CLOUD'
    | 'SECURITY'
    | 'RPA'
    | 'BLOCKCHAIN';

export interface TrackProfile {
    id: TechnologyTrack;
    name: string;
    icon: string;
    color: string;
    description: string;
    keywords: string[];
    maturity: 'emerging' | 'growing' | 'mature';
    relevance: 'critical' | 'high' | 'medium';
}

export const TECHNOLOGY_TRACKS: TrackProfile[] = [
    {
        id: 'AI_ML',
        name: 'AI & Machine Learning',
        icon: '🤖',
        color: '#8B5CF6',
        description: 'Artificial intelligence, machine learning, NLP, and predictive analytics in healthcare.',
        keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'predictive', 'chatbot', 'llm', 'generative ai', 'copilot'],
        maturity: 'growing',
        relevance: 'critical',
    },
    {
        id: 'INTEROPERABILITY',
        name: 'Interoperability',
        icon: '🔗',
        color: '#3B82F6',
        description: 'FHIR, HL7, data exchange, APIs, and health information exchange.',
        keywords: ['fhir', 'hl7', 'interoperability', 'api', 'hie', 'tefca', 'qhin', 'data exchange', 'carin', 'da vinci'],
        maturity: 'mature',
        relevance: 'critical',
    },
    {
        id: 'CLOUD',
        name: 'Cloud & Infrastructure',
        icon: '☁️',
        color: '#06B6D4',
        description: 'Cloud migration, SaaS, multi-tenant, and infrastructure modernization.',
        keywords: ['cloud', 'aws', 'azure', 'gcp', 'saas', 'multi-tenant', 'kubernetes', 'microservices', 'serverless'],
        maturity: 'mature',
        relevance: 'high',
    },
    {
        id: 'SECURITY',
        name: 'Security & Privacy',
        icon: '🛡️',
        color: '#EF4444',
        description: 'Cybersecurity, zero trust, HIPAA compliance, and data protection.',
        keywords: ['cybersecurity', 'security', 'zero trust', 'ransomware', 'breach', 'hipaa', 'encryption', 'mfa', 'soc2'],
        maturity: 'mature',
        relevance: 'critical',
    },
    {
        id: 'RPA',
        name: 'Automation & RPA',
        icon: '⚙️',
        color: '#F59E0B',
        description: 'Robotic process automation, workflow automation, and intelligent automation.',
        keywords: ['rpa', 'automation', 'workflow', 'robotic process', 'intelligent automation', 'bots', 'uipath', 'automation anywhere'],
        maturity: 'growing',
        relevance: 'high',
    },
    {
        id: 'BLOCKCHAIN',
        name: 'Blockchain & DLT',
        icon: '⛓️',
        color: '#10B981',
        description: 'Distributed ledger, smart contracts, and decentralized identity.',
        keywords: ['blockchain', 'distributed ledger', 'smart contract', 'decentralized', 'web3', 'nft'],
        maturity: 'emerging',
        relevance: 'medium',
    },
];

export const TRACK_BY_ID = new Map<TechnologyTrack, TrackProfile>(
    TECHNOLOGY_TRACKS.map(t => [t.id, t])
);

// ─────────────────────────────────────────────────────────────────────────────
// TREND TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TrendDirection = 'rising' | 'stable' | 'declining';
export type TrendSignificance = 'breakthrough' | 'significant' | 'notable' | 'minor';

export interface TrendMetadata {
    track: TechnologyTrack;
    direction: TrendDirection;
    significance: TrendSignificance;
    adoptionStage?: 'innovation' | 'early_adoption' | 'early_majority' | 'late_majority' | 'laggards';
    vendorMentions?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INNOVATION INDICATORS (for patent/product detection)
// ─────────────────────────────────────────────────────────────────────────────

export const INNOVATION_PATTERNS: Array<{ patterns: string[]; type: 'patent' | 'product' | 'research' | 'partnership' }> = [
    { patterns: ['patent', 'patents', 'intellectual property', 'ip filing'], type: 'patent' },
    { patterns: ['launches', 'announces', 'introduces', 'unveils', 'releases', 'debuts'], type: 'product' },
    { patterns: ['study', 'research', 'published', 'findings', 'pilot', 'trial'], type: 'research' },
    { patterns: ['partners with', 'partnership', 'collaboration', 'teams up', 'joint venture'], type: 'partnership' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const TREND_DIRECTION_CONFIG: Record<TrendDirection, { label: string; icon: string; color: string }> = {
    rising: { label: 'Rising', icon: '📈', color: 'text-green-600' },
    stable: { label: 'Stable', icon: '➡️', color: 'text-blue-600' },
    declining: { label: 'Declining', icon: '📉', color: 'text-red-600' },
};

export const SIGNIFICANCE_CONFIG: Record<TrendSignificance, { label: string; color: string; bgColor: string }> = {
    breakthrough: { label: 'Breakthrough', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    significant: { label: 'Significant', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    notable: { label: 'Notable', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    minor: { label: 'Minor', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export const MATURITY_CONFIG: Record<'emerging' | 'growing' | 'mature', { label: string; color: string }> = {
    emerging: { label: 'Emerging', color: 'text-purple-600' },
    growing: { label: 'Growing', color: 'text-green-600' },
    mature: { label: 'Mature', color: 'text-blue-600' },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS (with memoization for performance)
// ─────────────────────────────────────────────────────────────────────────────

// Pre-build keyword-to-track map for O(1) lookup
const KEYWORD_TRACK_MAP = new Map<string, TechnologyTrack>();
TECHNOLOGY_TRACKS.forEach(track => {
    track.keywords.forEach(kw => {
        KEYWORD_TRACK_MAP.set(kw.toLowerCase(), track.id);
    });
});

export function detectTechnologyTrack(text: string): TechnologyTrack | null {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();

    // Check against pre-built keyword map (efficient)
    for (const track of TECHNOLOGY_TRACKS) {
        if (track.keywords.some(kw => lower.includes(kw))) {
            return track.id;
        }
    }
    return null;
}

export function detectInnovationType(text: string): 'patent' | 'product' | 'research' | 'partnership' | null {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();
    for (const { patterns, type } of INNOVATION_PATTERNS) {
        if (patterns.some(p => lower.includes(p))) {
            return type;
        }
    }
    return null;
}

export function calculateTrendSignificance(
    track: TechnologyTrack,
    innovationType: 'patent' | 'product' | 'research' | 'partnership' | null,
    sourceScore: number
): TrendSignificance {
    const trackProfile = TRACK_BY_ID.get(track);

    // Clamp source score to valid range
    const score = Math.max(0, Math.min(1, sourceScore || 0));

    // Product launches from critical tracks are significant
    if (innovationType === 'product' && trackProfile?.relevance === 'critical') {
        return score > 0.7 ? 'breakthrough' : 'significant';
    }

    // Patents are always notable
    if (innovationType === 'patent') return 'notable';

    // High-relevance tracks get higher significance
    if (trackProfile?.relevance === 'critical') return 'significant';
    if (trackProfile?.relevance === 'high') return 'notable';

    return 'minor';
}

// Expanded vendor list with case-insensitive pre-processing
const VENDOR_LIST = [
    'Epic', 'Cerner', 'Oracle Health', 'Microsoft', 'Google', 'Amazon', 'AWS',
    'Salesforce', 'Olive AI', 'Veradigm', 'Change Healthcare', 'Optum',
    'MEDITECH', 'athenahealth', 'eClinicalWorks', 'NextGen', 'AllScripts',
    'Nuance', 'IBM Watson', '3M Health', 'Cognizant', 'Accenture',
    'Inovalon', 'Health Catalyst', 'Innovaccer', 'Particle Health',
];

const VENDOR_LOWER_MAP = new Map<string, string>(
    VENDOR_LIST.map(v => [v.toLowerCase(), v])
);

export function getVendorMentions(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    const found: string[] = [];
    const lower = text.toLowerCase();
    const seen = new Set<string>();

    for (const [lowerName, originalName] of VENDOR_LOWER_MAP) {
        if (lower.includes(lowerName) && !seen.has(originalName)) {
            found.push(originalName);
            seen.add(originalName);
        }
    }

    return found;
}

// Helper to get all tracks sorted by relevance
export function getTracksByRelevance(): TrackProfile[] {
    const order: Record<'critical' | 'high' | 'medium', number> = {
        critical: 0,
        high: 1,
        medium: 2,
    };
    return [...TECHNOLOGY_TRACKS].sort((a, b) => order[a.relevance] - order[b.relevance]);
}
