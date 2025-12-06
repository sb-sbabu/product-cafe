/**
 * Café Finder: Domain-Specific Synonyms
 * Maps terms to their synonyms for query expansion
 */

// ============================================
// TOOL SYNONYMS
// ============================================

export const TOOL_SYNONYMS: Record<string, string[]> = {
    jira: ['atlassian', 'issue tracker', 'ticket system', 'bug tracker', 'issue management'],
    confluence: ['atlassian', 'wiki', 'documentation', 'docs', 'knowledge base'],
    smartsheet: ['spreadsheet', 'project tracker', 'timeline', 'gantt'],
    slack: ['messaging', 'chat', 'im', 'instant message'],
    teams: ['microsoft teams', 'ms teams', 'video call', 'meeting'],
    outlook: ['email', 'mail', 'calendar', 'microsoft outlook'],
    sharepoint: ['microsoft sharepoint', 'file storage', 'document library'],
    figma: ['design', 'prototype', 'mockup', 'ui design', 'wireframe'],
    miro: ['whiteboard', 'brainstorm', 'diagram', 'flowchart'],
    notion: ['notes', 'wiki', 'documentation', 'workspace'],
    github: ['git', 'code', 'repository', 'repo', 'source control', 'version control'],
    azure: ['azure devops', 'ado', 'microsoft azure', 'cloud'],
    servicenow: ['itsm', 'it service', 'service desk', 'snow'],
};

// ============================================
// TOPIC SYNONYMS
// ============================================

export const TOPIC_SYNONYMS: Record<string, string[]> = {
    cob: ['coordination of benefits', 'coordination', 'multiple coverage', 'dual coverage'],
    rcm: ['revenue cycle management', 'revenue cycle', 'billing', 'collections'],
    claims: ['claim processing', 'claim adjudication', 'claims management'],
    eligibility: ['member eligibility', 'coverage verification', 'enrollment'],
    enrollment: ['member enrollment', 'signup', 'registration', 'onboarding'],
    compliance: ['regulatory', 'regulation', 'audit', 'hipaa', 'cms'],
    hipaa: ['privacy', 'security', 'phi', 'protected health information'],
    medicare: ['cms', 'government program', 'senior', 'part a', 'part b', 'part d'],
    medicaid: ['state program', 'magi', 'low income'],
    subrogation: ['recovery', 'third party liability', 'tpl', 'accident'],
    eob: ['explanation of benefits', 'benefit explanation', 'member statement'],
    era: ['electronic remittance advice', 'remittance', '835'],
    edi: ['electronic data interchange', '837', '270', '271', 'x12'],
    npi: ['national provider identifier', 'provider id', 'provider number'],
    prd: ['product requirements', 'product spec', 'requirements document', 'spec'],
    okr: ['objectives key results', 'objectives', 'goals', 'kpi'],
    lop: ['love of product', 'product talk', 'presentation', 'session'],
};

// ============================================
// ACTION SYNONYMS
// ============================================

export const ACTION_SYNONYMS: Record<string, string[]> = {
    access: ['get access', 'permission', 'login', 'account', 'request access'],
    request: ['submit', 'apply', 'ask for', 'get'],
    find: ['search', 'look for', 'locate', 'discover', 'where is'],
    learn: ['understand', 'study', 'know about', 'read about'],
    contact: ['reach out', 'message', 'email', 'talk to', 'connect with'],
    help: ['assist', 'support', 'guidance', 'how to'],
    create: ['make', 'new', 'add', 'start', 'build'],
    update: ['edit', 'modify', 'change', 'revise'],
    delete: ['remove', 'cancel', 'revoke'],
    approve: ['accept', 'sign off', 'confirm', 'authorize'],
    review: ['check', 'look at', 'examine', 'assess'],
};

// ============================================
// RESOURCE TYPE SYNONYMS
// ============================================

export const RESOURCE_TYPE_SYNONYMS: Record<string, string[]> = {
    template: ['boilerplate', 'starter', 'example', 'sample'],
    guide: ['how to', 'tutorial', 'walkthrough', 'instructions', 'documentation'],
    faq: ['frequently asked', 'common questions', 'q&a', 'questions'],
    video: ['recording', 'watch', 'tutorial video', 'demo'],
    presentation: ['slides', 'deck', 'ppt', 'powerpoint', 'keynote'],
    document: ['doc', 'file', 'paper', 'article'],
    checklist: ['list', 'steps', 'procedure', 'process'],
    playbook: ['runbook', 'handbook', 'manual', 'guide'],
};

// ============================================
// TEAM SYNONYMS
// ============================================

export const TEAM_SYNONYMS: Record<string, string[]> = {
    platform: ['platform team', 'infrastructure', 'core platform', 'engineering'],
    rcm: ['revenue cycle', 'rcm team', 'billing team'],
    analytics: ['data', 'data team', 'bi', 'business intelligence', 'reporting'],
    product: ['product team', 'pm', 'product management'],
    design: ['ux', 'ui', 'design team', 'user experience'],
    engineering: ['development', 'dev', 'developers', 'software'],
    it: ['information technology', 'tech support', 'helpdesk', 'it support'],
    hr: ['human resources', 'people team', 'people ops'],
    legal: ['compliance', 'legal team', 'counsel'],
};

// ============================================
// COMBINED SYNONYM LOOKUP
// ============================================

/**
 * All synonyms combined for quick lookup
 */
export const ALL_SYNONYMS: Record<string, string[]> = {
    ...TOOL_SYNONYMS,
    ...TOPIC_SYNONYMS,
    ...ACTION_SYNONYMS,
    ...RESOURCE_TYPE_SYNONYMS,
    ...TEAM_SYNONYMS,
};

/**
 * Reverse lookup: given a synonym, find the canonical term
 */
export const REVERSE_SYNONYMS: Record<string, string> = {};

// Build reverse lookup
Object.entries(ALL_SYNONYMS).forEach(([canonical, synonyms]) => {
    synonyms.forEach(synonym => {
        REVERSE_SYNONYMS[synonym.toLowerCase()] = canonical;
    });
});

/**
 * Get synonyms for a term
 */
export function getSynonyms(term: string): string[] {
    const normalized = term.toLowerCase().trim();

    // Direct lookup
    if (ALL_SYNONYMS[normalized]) {
        return [normalized, ...ALL_SYNONYMS[normalized]];
    }

    // Reverse lookup (term is itself a synonym)
    const canonical = REVERSE_SYNONYMS[normalized];
    if (canonical) {
        return [canonical, ...ALL_SYNONYMS[canonical]];
    }

    return [normalized];
}

/**
 * Get canonical form of a term
 */
export function getCanonical(term: string): string {
    const normalized = term.toLowerCase().trim();
    return REVERSE_SYNONYMS[normalized] || normalized;
}

/**
 * Check if two terms are synonymous
 */
export function areSynonyms(term1: string, term2: string): boolean {
    const canonical1 = getCanonical(term1);
    const canonical2 = getCanonical(term2);
    return canonical1 === canonical2;
}
