/**
 * Café Finder: Domain-Specific Synonyms
 * Maps terms to their synonyms for query expansion
 */

// ============================================
// TOOL SYNONYMS
// ============================================

export const TOOL_SYNONYMS: Record<string, string[]> = {
    // Development
    jira: ['atlassian', 'issue tracker', 'ticket system', 'bug tracker', 'issue management', 'backlog', 'sprint board'],
    confluence: ['atlassian', 'wiki', 'documentation', 'docs', 'knowledge base', 'kb', 'pages'],
    github: ['git', 'code', 'repository', 'repo', 'source control', 'version control', 'pull request', 'pr', 'commit'],
    azure: ['azure devops', 'ado', 'microsoft azure', 'cloud', 'deployment', 'pipelines'],
    vscode: ['code editor', 'ide', 'visual studio code'],
    postman: ['api testing', 'api client', 'endpoints'],

    // Communication & Collaboration
    slack: ['messaging', 'chat', 'im', 'instant message', 'dm', 'channel'],
    teams: ['microsoft teams', 'ms teams', 'video call', 'meeting', 'calls'],
    outlook: ['email', 'mail', 'calendar', 'microsoft outlook', 'inbox', 'invite'],
    zoom: ['video conference', 'meeting', 'webinar', 'call'],

    // Product & Design
    figma: ['design', 'prototype', 'mockup', 'ui design', 'wireframe', 'ux', 'styles'],
    miro: ['whiteboard', 'brainstorm', 'diagram', 'flowchart', 'mind map', 'canvas'],
    productboard: ['roadmap', 'feature ideas', 'insights', 'prioritization'],
    notion: ['notes', 'wiki', 'documentation', 'workspace', 'task list'],

    // Management & Ops
    smartsheet: ['spreadsheet', 'project tracker', 'timeline', 'gantt', 'project plan'],
    servicenow: ['itsm', 'it service', 'service desk', 'snow', 'help ticket', 'incident'],
    workday: ['hr', 'payroll', 'time off', 'benefits', 'pto', 'expense'],
    okta: ['sso', 'login', 'authentication', 'mfa', 'password'],
    sharepoint: ['microsoft sharepoint', 'file storage', 'document library', 'intranet'],
};

// ============================================
// TOPIC SYNONYMS
// ============================================

export const TOPIC_SYNONYMS: Record<string, string[]> = {
    // Healthcare Domain
    cob: ['coordination of benefits', 'coordination', 'multiple coverage', 'dual coverage', 'primary payer'],
    rcm: ['revenue cycle management', 'revenue cycle', 'billing', 'collections', 'denials'],
    claims: ['claim processing', 'claim adjudication', 'claims management', 'reimbursement'],
    eligibility: ['member eligibility', 'coverage verification', 'enrollment status', 'benefits check'],
    enrollment: ['member enrollment', 'signup', 'registration', 'onboarding', 'member intake'],
    compliance: ['regulatory', 'regulation', 'audit', 'hipaa', 'cms', 'security compliance'],
    hipaa: ['privacy', 'data privacy', 'phi', 'protected health information', 'patient data'],
    medicare: ['cms', 'government program', 'senior', 'part a', 'part b', 'part d', 'advantage'],
    medicaid: ['state program', 'magi', 'low income', 'chip'],
    subrogation: ['recovery', 'third party liability', 'tpl', 'accident claims', 'lien'],
    eob: ['explanation of benefits', 'benefit explanation', 'member statement', 'claim summary'],
    era: ['electronic remittance advice', 'remittance', '835', 'payment advice'],
    edi: ['electronic data interchange', '837', '270', '271', 'x12', 'file transfer'],
    npi: ['national provider identifier', 'provider id', 'provider number', 'doctor id'],
    prior_auth: ['prior authorization', 'pre-auth', 'approval', 'referral', 'utilization management'],

    // Product & Engineering
    prd: ['product requirements', 'product spec', 'requirements document', 'spec', 'feature spec'],
    okr: ['objectives key results', 'objectives', 'goals', 'kpi', 'metrics', 'targets'],
    lop: ['love of product', 'product talk', 'presentation', 'session', 'demo day', 'showcase'],
    agile: ['scrum', 'kanban', 'sprint', 'standup', 'retrospective'],
    cicd: ['continuous integration', 'deployment', 'pipeline', 'build', 'release'],
};

// ============================================
// ACTION SYNONYMS
// ============================================

export const ACTION_SYNONYMS: Record<string, string[]> = {
    access: ['get access', 'permission', 'login', 'account', 'request access', 'sign in', 'auth'],
    request: ['submit', 'apply', 'ask for', 'get', 'order', 'requisition'],
    find: ['search', 'look for', 'locate', 'discover', 'where is', 'show me', 'list'],
    learn: ['understand', 'study', 'know about', 'read about', 'explore', 'tutorials'],
    contact: ['reach out', 'message', 'email', 'talk to', 'connect with', 'ping', 'call'],
    help: ['assist', 'support', 'guidance', 'how to', 'troubleshoot', 'fix'],
    create: ['make', 'new', 'add', 'start', 'build', 'generate', 'spin up'],
    update: ['edit', 'modify', 'change', 'revise', 'correct', 'improve'],
    delete: ['remove', 'cancel', 'revoke', 'archive', 'trash'],
    approve: ['accept', 'sign off', 'confirm', 'authorize', 'green light'],
    review: ['check', 'look at', 'examine', 'assess', 'audit', 'verify'],
    share: ['send', 'distribute', 'collaborate', 'invite'],
    download: ['save', 'export', 'get file', 'offline'],
};

// ============================================
// RESOURCE TYPE SYNONYMS
// ============================================

export const RESOURCE_TYPE_SYNONYMS: Record<string, string[]> = {
    template: ['boilerplate', 'starter', 'example', 'sample', 'skeleton', 'pattern'],
    guide: ['how to', 'tutorial', 'walkthrough', 'instructions', 'documentation', 'manual', 'handbook'],
    faq: ['frequently asked', 'common questions', 'q&a', 'questions', 'help center', 'knowledge base'],
    video: ['recording', 'watch', 'tutorial video', 'demo', 'clip', 'session recording'],
    presentation: ['slides', 'deck', 'ppt', 'powerpoint', 'keynote', 'slidedeck'],
    document: ['doc', 'file', 'paper', 'article', 'pdf', 'sheet', 'report'],
    checklist: ['list', 'steps', 'procedure', 'process', 'todo', 'tasks'],
    playbook: ['runbook', 'handbook', 'manual', 'guide', 'sop', 'standard operating procedure'],
    case_study: ['example', 'success story', 'customer story', 'reference'],
};

// ============================================
// TEAM SYNONYMS
// ============================================

export const TEAM_SYNONYMS: Record<string, string[]> = {
    platform: ['platform team', 'infrastructure', 'core platform', 'engineering', 'devops', 'sre'],
    rcm: ['revenue cycle', 'rcm team', 'billing team', 'finance'],
    analytics: ['data', 'data team', 'bi', 'business intelligence', 'reporting', 'data science'],
    product: ['product team', 'pm', 'product management', 'product ops'],
    design: ['ux', 'ui', 'design team', 'user experience', 'creative', 'research'],
    engineering: ['development', 'dev', 'developers', 'software', 'eng', 'tech'],
    it: ['information technology', 'tech support', 'helpdesk', 'it support', 'service desk'],
    hr: ['human resources', 'people team', 'people ops', 'recruiting', 'talent'],
    legal: ['compliance', 'legal team', 'counsel', 'privacy'],
    sales: ['gtm', 'go to market', 'account executives', 'revenue'],
    marketing: ['growth', 'brand', 'content', 'social'],
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
