// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Competitor Intelligence Database
// Comprehensive competitor profiles for US Healthcare RCM/Eligibility market
// ═══════════════════════════════════════════════════════════════════════════

export type CompetitorTier = 1 | 2 | 3;
export type CompetitorCategory = 'RCM' | 'Eligibility' | 'Prior Auth' | 'EDI' | 'AI/ML' | 'EHR' | 'Payer Tech';

export interface CompetitorProfile {
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

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1: Direct Competitors (Primary threat level)
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_1_COMPETITORS: CompetitorProfile[] = [
    {
        id: 'waystar',
        name: 'Waystar',
        tier: 1,
        category: 'RCM',
        description: 'End-to-end revenue cycle management platform. Direct competitor in claims, eligibility, and prior auth.',
        website: 'waystar.com',
        founded: 2017,
        hq: 'Louisville, KY',
        employees: '1,500+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#3B82F6',
    },
    {
        id: 'change-healthcare',
        name: 'Change Healthcare',
        tier: 1,
        category: 'RCM',
        description: 'Major healthcare technology company focused on payment accuracy and clinical connectivity. Now part of Optum.',
        website: 'changehealthcare.com',
        founded: 2007,
        hq: 'Nashville, TN',
        employees: '15,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#8B5CF6',
    },
    {
        id: 'trizetto',
        name: 'Trizetto (Cognizant)',
        tier: 1,
        category: 'Payer Tech',
        description: 'Cognizant subsidiary providing payer platforms, claims processing, and network management.',
        website: 'cognizant.com/trizetto',
        founded: 1997,
        hq: 'Denver, CO',
        employees: '5,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#EC4899',
    },
    {
        id: 'inovalon',
        name: 'Inovalon',
        tier: 1,
        category: 'RCM',
        description: 'Cloud-based data analytics and revenue cycle solutions for health plans and providers.',
        website: 'inovalon.com',
        founded: 1998,
        hq: 'Bowie, MD',
        employees: '3,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#10B981',
    },
    {
        id: 'r1-rcm',
        name: 'R1 RCM',
        tier: 1,
        category: 'RCM',
        description: 'Technology-driven RCM company serving hospitals and health systems.',
        website: 'r1rcm.com',
        founded: 2003,
        hq: 'Chicago, IL',
        employees: '28,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#F59E0B',
    },
    {
        id: 'experian-health',
        name: 'Experian Health',
        tier: 1,
        category: 'Eligibility',
        description: 'Patient access, identity, and eligibility verification solutions.',
        website: 'experian.com/health',
        founded: 1996,
        hq: 'Franklin, TN',
        employees: '1,500+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#EF4444',
    },
    {
        id: 'edifecs',
        name: 'Edifecs',
        tier: 1,
        category: 'EDI',
        description: 'Healthcare data exchange and interoperability platform for payers and providers.',
        website: 'edifecs.com',
        founded: 1996,
        hq: 'Bellevue, WA',
        employees: '500+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#6366F1',
    },
    {
        id: 'cotiviti',
        name: 'Cotiviti',
        tier: 1,
        category: 'RCM',
        description: 'Payment accuracy and quality analytics for health plans.',
        website: 'cotiviti.com',
        founded: 1979,
        hq: 'Atlanta, GA',
        employees: '5,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#14B8A6',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2: Adjacent Players (Strategic watch)
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_2_COMPETITORS: CompetitorProfile[] = [
    {
        id: 'optum',
        name: 'Optum',
        tier: 2,
        category: 'RCM',
        description: 'UnitedHealth Group subsidiary. Massive health services company with RCM, analytics, and care delivery.',
        website: 'optum.com',
        hq: 'Eden Prairie, MN',
        employees: '100,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#F97316',
    },
    {
        id: 'epic',
        name: 'Epic Systems',
        tier: 2,
        category: 'EHR',
        description: 'Dominant EHR vendor with growing RCM and patient access capabilities.',
        website: 'epic.com',
        founded: 1979,
        hq: 'Verona, WI',
        employees: '12,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#8B5CF6',
    },
    {
        id: 'oracle-health',
        name: 'Oracle Health (Cerner)',
        tier: 2,
        category: 'EHR',
        description: 'Former Cerner, now Oracle Health. Major EHR with revenue cycle modules.',
        website: 'oracle.com/health',
        founded: 1979,
        hq: 'Kansas City, MO',
        employees: '28,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#DC2626',
    },
    {
        id: 'athenahealth',
        name: 'athenahealth',
        tier: 2,
        category: 'RCM',
        description: 'Cloud-based practice management and RCM for ambulatory providers.',
        website: 'athenahealth.com',
        founded: 1997,
        hq: 'Watertown, MA',
        employees: '5,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#0EA5E9',
    },
    {
        id: 'zelis',
        name: 'Zelis',
        tier: 2,
        category: 'Payer Tech',
        description: 'Healthcare payments and cost management for payers.',
        website: 'zelis.com',
        founded: 2016,
        hq: 'Bedminster, NJ',
        employees: '2,500+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#22C55E',
    },
    {
        id: 'veradigm',
        name: 'Veradigm (Allscripts)',
        tier: 2,
        category: 'EHR',
        description: 'Healthcare IT company spun from Allscripts, focused on data and analytics.',
        website: 'veradigm.com',
        founded: 2022,
        hq: 'Chicago, IL',
        employees: '2,000+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#A855F7',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3: Emerging AI/ML Disruptors (Innovation watch)
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_3_COMPETITORS: CompetitorProfile[] = [
    {
        id: 'cohere-health',
        name: 'Cohere Health',
        tier: 3,
        category: 'Prior Auth',
        description: 'AI-powered prior authorization platform. Series C funded.',
        website: 'coherehealth.com',
        founded: 2019,
        hq: 'Boston, MA',
        employees: '300+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#06B6D4',
    },
    {
        id: 'infinitus',
        name: 'Infinitus Systems',
        tier: 3,
        category: 'AI/ML',
        description: 'Voice AI for healthcare benefit verification. Automates phone calls.',
        website: 'infinitus.ai',
        founded: 2019,
        hq: 'San Francisco, CA',
        employees: '100+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#8B5CF6',
    },
    {
        id: 'tennr',
        name: 'Tennr',
        tier: 3,
        category: 'AI/ML',
        description: 'AI document processing for healthcare operations. Y Combinator backed.',
        website: 'tennr.com',
        founded: 2021,
        hq: 'New York, NY',
        employees: '50+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#F43F5E',
    },
    {
        id: 'akasa',
        name: 'Akasa',
        tier: 3,
        category: 'AI/ML',
        description: 'Generative AI for revenue cycle automation. Series B funded.',
        website: 'akasa.com',
        founded: 2019,
        hq: 'South San Francisco, CA',
        employees: '150+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: true,
        color: '#10B981',
    },
    {
        id: 'medal',
        name: 'MEDAL.AI',
        tier: 3,
        category: 'AI/ML',
        description: 'AI for clinical operations and revenue cycle. Focus on denials management.',
        website: 'medal.ai',
        founded: 2020,
        hq: 'San Francisco, CA',
        employees: '30+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#FBBF24',
    },
    {
        id: 'olive-ai',
        name: 'Olive AI',
        tier: 3,
        category: 'AI/ML',
        description: 'Healthcare automation platform. Pivoted focus, facing challenges.',
        website: 'oliveai.com',
        founded: 2012,
        hq: 'Columbus, OH',
        employees: '500+',
        signalCount: 0,
        lastSignalAt: null,
        watchlisted: false,
        color: '#84CC16',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Combined exports
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_COMPETITORS: CompetitorProfile[] = [
    ...TIER_1_COMPETITORS,
    ...TIER_2_COMPETITORS,
    ...TIER_3_COMPETITORS,
];

export const COMPETITOR_BY_ID = new Map<string, CompetitorProfile>(
    ALL_COMPETITORS.map(c => [c.id, c])
);

export function getCompetitorById(id: string): CompetitorProfile | undefined {
    return COMPETITOR_BY_ID.get(id);
}

export function getCompetitorsByTier(tier: CompetitorTier): CompetitorProfile[] {
    return ALL_COMPETITORS.filter(c => c.tier === tier);
}

export function getWatchlistedCompetitors(): CompetitorProfile[] {
    return ALL_COMPETITORS.filter(c => c.watchlisted);
}

// Pattern matching for entity extraction
export const COMPETITOR_PATTERNS: Array<{ pattern: string; competitorId: string }> =
    ALL_COMPETITORS.flatMap(c => [
        { pattern: c.name.toLowerCase(), competitorId: c.id },
        // Add common variations
        ...(c.name.includes('(')
            ? [{ pattern: c.name.split('(')[0].trim().toLowerCase(), competitorId: c.id }]
            : []),
    ]);
