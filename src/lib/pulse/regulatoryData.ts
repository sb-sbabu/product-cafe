// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Regulatory Intelligence Database
// Comprehensive profiles for US Healthcare regulatory agencies
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// REGULATORY AGENCIES
// ─────────────────────────────────────────────────────────────────────────────

export type RegulatoryAgency = 'CMS' | 'ONC' | 'HHS' | 'FDA' | 'FTC' | 'STATE';

export interface AgencyProfile {
    id: RegulatoryAgency;
    name: string;
    fullName: string;
    color: string;
    icon: string;
    focus: string[];
    description: string;
}

export const REGULATORY_AGENCIES: AgencyProfile[] = [
    {
        id: 'CMS',
        name: 'CMS',
        fullName: 'Centers for Medicare & Medicaid Services',
        color: '#1E40AF', // Blue
        icon: '🏛️',
        focus: ['Medicare', 'Medicaid', 'ACA', 'Payment rules', 'Quality measures'],
        description: 'Primary regulator for Medicare, Medicaid, and marketplace plans.',
    },
    {
        id: 'ONC',
        name: 'ONC',
        fullName: 'Office of the National Coordinator for Health IT',
        color: '#059669', // Green
        icon: '💻',
        focus: ['Health IT', 'Interoperability', 'FHIR', 'Information blocking', 'Certification'],
        description: 'Leads national health IT efforts including interoperability rules.',
    },
    {
        id: 'HHS',
        name: 'HHS',
        fullName: 'Department of Health & Human Services',
        color: '#7C3AED', // Purple
        icon: '⚕️',
        focus: ['HIPAA', 'Public health', 'Policy', 'Enforcement'],
        description: 'Parent department overseeing healthcare policy and HIPAA enforcement.',
    },
    {
        id: 'FDA',
        name: 'FDA',
        fullName: 'Food & Drug Administration',
        color: '#DC2626', // Red
        icon: '💊',
        focus: ['Medical devices', 'AI/ML', 'Software as Medical Device', 'Approvals'],
        description: 'Regulates medical devices, including AI/ML in healthcare.',
    },
    {
        id: 'FTC',
        name: 'FTC',
        fullName: 'Federal Trade Commission',
        color: '#EA580C', // Orange
        icon: '⚖️',
        focus: ['Competition', 'M&A review', 'Consumer protection', 'Data privacy'],
        description: 'Reviews healthcare M&A and enforces competition laws.',
    },
    {
        id: 'STATE',
        name: 'State',
        fullName: 'State Insurance Departments',
        color: '#6366F1', // Indigo
        icon: '🗺️',
        focus: ['State mandates', 'Insurance regulations', 'Prior auth laws', 'Surprise billing'],
        description: 'State-level insurance and healthcare regulations.',
    },
];

export const AGENCY_BY_ID = new Map<RegulatoryAgency, AgencyProfile>(
    REGULATORY_AGENCIES.map(a => [a.id, a])
);

// ─────────────────────────────────────────────────────────────────────────────
// REGULATORY TOPICS (Aligned with Availity's business focus)
// ─────────────────────────────────────────────────────────────────────────────

export type RegulatoryTopic =
    | 'prior_authorization'
    | 'interoperability'
    | 'price_transparency'
    | 'patient_access'
    | 'claims_processing'
    | 'data_privacy'
    | 'value_based_care'
    | 'surprise_billing'
    | 'ai_regulation'
    | 'cybersecurity';

export interface TopicProfile {
    id: RegulatoryTopic;
    name: string;
    icon: string;
    color: string;
    relevance: 'critical' | 'high' | 'medium'; // To Availity
    agencies: RegulatoryAgency[];
}

export const REGULATORY_TOPICS: TopicProfile[] = [
    {
        id: 'prior_authorization',
        name: 'Prior Authorization',
        icon: '✅',
        color: '#10B981',
        relevance: 'critical',
        agencies: ['CMS', 'STATE'],
    },
    {
        id: 'interoperability',
        name: 'Interoperability',
        icon: '🔗',
        color: '#3B82F6',
        relevance: 'critical',
        agencies: ['ONC', 'CMS'],
    },
    {
        id: 'price_transparency',
        name: 'Price Transparency',
        icon: '💵',
        color: '#F59E0B',
        relevance: 'high',
        agencies: ['CMS', 'HHS'],
    },
    {
        id: 'patient_access',
        name: 'Patient Access',
        icon: '👤',
        color: '#8B5CF6',
        relevance: 'high',
        agencies: ['ONC', 'CMS'],
    },
    {
        id: 'claims_processing',
        name: 'Claims & Billing',
        icon: '📄',
        color: '#EC4899',
        relevance: 'critical',
        agencies: ['CMS', 'STATE'],
    },
    {
        id: 'data_privacy',
        name: 'Data Privacy',
        icon: '🔒',
        color: '#6366F1',
        relevance: 'high',
        agencies: ['HHS', 'FTC'],
    },
    {
        id: 'value_based_care',
        name: 'Value-Based Care',
        icon: '📊',
        color: '#14B8A6',
        relevance: 'medium',
        agencies: ['CMS'],
    },
    {
        id: 'surprise_billing',
        name: 'Surprise Billing',
        icon: '🚫',
        color: '#EF4444',
        relevance: 'high',
        agencies: ['HHS', 'CMS', 'STATE'],
    },
    {
        id: 'ai_regulation',
        name: 'AI in Healthcare',
        icon: '🤖',
        color: '#06B6D4',
        relevance: 'high',
        agencies: ['FDA', 'ONC', 'HHS'],
    },
    {
        id: 'cybersecurity',
        name: 'Cybersecurity',
        icon: '🛡️',
        color: '#84CC16',
        relevance: 'high',
        agencies: ['HHS', 'CMS'],
    },
];

export const TOPIC_BY_ID = new Map<RegulatoryTopic, TopicProfile>(
    REGULATORY_TOPICS.map(t => [t.id, t])
);

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT ASSESSMENT
// ─────────────────────────────────────────────────────────────────────────────

export type ImpactLevel = 'critical' | 'high' | 'moderate' | 'low';
export type AffectedEntity = 'payers' | 'providers' | 'vendors' | 'patients';

export const IMPACT_CONFIG: Record<ImpactLevel, { label: string; color: string; bgColor: string }> = {
    critical: { label: 'Critical Impact', color: 'text-red-700', bgColor: 'bg-red-100' },
    high: { label: 'High Impact', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    moderate: { label: 'Moderate Impact', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    low: { label: 'Low Impact', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export const ENTITY_CONFIG: Record<AffectedEntity, { label: string; icon: string }> = {
    payers: { label: 'Payers', icon: '🏢' },
    providers: { label: 'Providers', icon: '🏥' },
    vendors: { label: 'Vendors', icon: '💼' },
    patients: { label: 'Patients', icon: '👤' },
};

// ─────────────────────────────────────────────────────────────────────────────
// REGULATORY METADATA (for PulseSignal extension)
// ─────────────────────────────────────────────────────────────────────────────

export interface RegulatoryMetadata {
    agency: RegulatoryAgency;
    topic: RegulatoryTopic;
    impactLevel: ImpactLevel;
    affectedEntities: AffectedEntity[];
    effectiveDate?: string | null;      // ISO date
    commentDeadline?: string | null;    // ISO date
    federalRegisterUrl?: string;
    docketNumber?: string;              // e.g., "CMS-0057-P"
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN MATCHING FOR SIGNAL CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export const AGENCY_PATTERNS: Array<{ patterns: string[]; agency: RegulatoryAgency }> = [
    { patterns: ['cms', 'centers for medicare', 'medicare', 'medicaid', 'cmmi'], agency: 'CMS' },
    { patterns: ['onc', 'office of national coordinator', 'health it certification'], agency: 'ONC' },
    { patterns: ['hhs', 'health and human services', 'department of health'], agency: 'HHS' },
    { patterns: ['fda', 'food and drug', 'fda approval', 'fda clearance'], agency: 'FDA' },
    { patterns: ['ftc', 'federal trade commission', 'antitrust'], agency: 'FTC' },
];

export const TOPIC_PATTERNS: Array<{ patterns: string[]; topic: RegulatoryTopic }> = [
    { patterns: ['prior auth', 'prior authorization', 'gold card', 'pa requirements'], topic: 'prior_authorization' },
    { patterns: ['fhir', 'interoperability', 'data exchange', 'information blocking', 'tefca'], topic: 'interoperability' },
    { patterns: ['price transparency', 'hospital pricing', 'machine-readable'], topic: 'price_transparency' },
    { patterns: ['patient access', 'patient portal', 'patient data'], topic: 'patient_access' },
    { patterns: ['claims', 'billing', 'coding', 'x12', 'edi transaction'], topic: 'claims_processing' },
    { patterns: ['hipaa', 'privacy', 'phi', 'protected health information'], topic: 'data_privacy' },
    { patterns: ['value-based', 'apm', 'alternative payment', 'quality measure'], topic: 'value_based_care' },
    { patterns: ['surprise billing', 'no surprises', 'out-of-network'], topic: 'surprise_billing' },
    { patterns: ['artificial intelligence', 'machine learning', 'ai in health', 'algorithm'], topic: 'ai_regulation' },
    { patterns: ['cybersecurity', 'ransomware', 'hipaa security', 'breach'], topic: 'cybersecurity' },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function detectAgency(text: string): RegulatoryAgency | null {
    const lower = text.toLowerCase();
    for (const { patterns, agency } of AGENCY_PATTERNS) {
        if (patterns.some(p => lower.includes(p))) {
            return agency;
        }
    }
    return null;
}

export function detectTopic(text: string): RegulatoryTopic | null {
    const lower = text.toLowerCase();
    for (const { patterns, topic } of TOPIC_PATTERNS) {
        if (patterns.some(p => lower.includes(p))) {
            return topic;
        }
    }
    return null;
}

export function calculateImpactLevel(
    _agency: RegulatoryAgency,
    topic: RegulatoryTopic,
    signalType: string
): ImpactLevel {
    const topicProfile = TOPIC_BY_ID.get(topic);

    // Final rules have higher impact than proposed
    if (signalType === 'FINAL_RULE') {
        if (topicProfile?.relevance === 'critical') return 'critical';
        return 'high';
    }

    // Enforcement actions are always high impact
    if (signalType === 'ENFORCEMENT') return 'high';

    // Proposed rules based on topic relevance
    if (signalType === 'PROPOSED_RULE') {
        if (topicProfile?.relevance === 'critical') return 'high';
        if (topicProfile?.relevance === 'high') return 'moderate';
        return 'low';
    }

    // Guidance is typically moderate
    return 'moderate';
}

export function getAffectedEntities(topic: RegulatoryTopic): AffectedEntity[] {
    // Define which entities are affected by each topic
    const topicEntities: Record<RegulatoryTopic, AffectedEntity[]> = {
        prior_authorization: ['payers', 'providers', 'vendors'],
        interoperability: ['payers', 'providers', 'vendors', 'patients'],
        price_transparency: ['payers', 'providers', 'patients'],
        patient_access: ['payers', 'providers', 'patients'],
        claims_processing: ['payers', 'providers', 'vendors'],
        data_privacy: ['payers', 'providers', 'vendors', 'patients'],
        value_based_care: ['payers', 'providers'],
        surprise_billing: ['payers', 'providers', 'patients'],
        ai_regulation: ['payers', 'vendors'],
        cybersecurity: ['payers', 'providers', 'vendors'],
    };

    return topicEntities[topic] || ['payers', 'providers'];
}

// Days until a date (negative if past)
export function daysUntil(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    try {
        const target = new Date(dateStr);
        if (isNaN(target.getTime())) return null;
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
}
