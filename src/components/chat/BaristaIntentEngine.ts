/**
 * BARISTA Intent Engine
 * Deterministic intent classification for 100+ query patterns
 * 
 * Uses keyword matching and pattern detection for <100ms response times
 * 0% hallucination - every response maps to real data
 */

// ═══════════════════════════════════════════════════════════════════════════
// INTENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type IntentCategory =
    | 'toast'
    | 'lop'
    | 'pulse'
    | 'expert'
    | 'community'
    | 'library'
    | 'navigation'
    | 'stats'
    | 'help'
    | 'unknown';

export interface Intent {
    category: IntentCategory;
    action: string;
    confidence: number;
    entities: Record<string, string>;
    originalQuery: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTENT PATTERNS - 100+ PATTERNS ORGANIZED BY MODULE
// ═══════════════════════════════════════════════════════════════════════════

interface PatternConfig {
    patterns: string[];
    action: string;
    extractors?: string[]; // Entity extractors like {topic}, {skill}, {company}
}

const INTENT_PATTERNS: Record<IntentCategory, PatternConfig[]> = {
    // ─────────────────────────────────────────────────────────────────────────
    // TOAST-X INTENTS (20+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    toast: [
        { action: 'my_recognitions', patterns: ['my recognitions', 'recognitions i received', 'toasts for me', 'toasts i got', 'who toasted me', 'my toast', 'show my toast', 'my toasts'] },
        { action: 'recent', patterns: ['recent toasts', 'latest toasts', 'new toasts', 'recent recognitions', 'recent toast', 'latest toast'] },
        { action: 'give', patterns: ['give a toast', 'recognize someone', 'send toast', 'send recognition', 'toast someone', 'give toast'] },
        { action: 'standing_ovation', patterns: ['standing ovation', 'give standing ovation', 'nominate for standing'] },
        { action: 'leaderboard', patterns: ['leaderboard', 'top performers', 'rankings', 'who is leading', 'top givers', 'most recognized'] },
        { action: 'badges', patterns: ['my badges', 'earned badges', 'badge progress', 'badges i have'] },
        { action: 'awards', patterns: ['my awards', 'earned awards', 'awards i have'] },
        { action: 'given', patterns: ['toasts i gave', 'recognitions i gave', 'who did i toast', 'my given toasts', 'toast i gave'] },
        { action: 'team_toasts', patterns: ['team toasts', 'recognize team', 'team recognition', 'team toast'] },
        { action: 'trending', patterns: ['trending toasts', 'popular toasts', 'viral toasts', 'trending toast'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // LOP INTENTS (15+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    lop: [
        { action: 'upcoming', patterns: ['upcoming lop', 'next session', 'next lop', 'upcoming session', 'whats next on lop', 'upcoming sessions', 'next lop session', 'future sessions'] },
        { action: 'recent', patterns: ['last lop', 'recent sessions', 'latest lop', 'last session', 'previous lop', 'lop sessions', 'show lop', 'recent lop', 'last week lop', 'week lop', 'weekly lop', 'past sessions', 'completed sessions', 'previous sessions', 'show sessions'] },
        { action: 'last_two', patterns: ['last 2 lops', 'last two sessions', 'recent 2 sessions', 'past 2 lops', 'last two lop'] },
        { action: 'essential', patterns: ['essential sessions', 'must watch', 'recommended sessions', 'essential lop', 'best lop', 'top lop'] },
        { action: 'by_topic', patterns: ['lop on', 'sessions about', 'lop about', 'learn about'], extractors: ['topic'] },
        { action: 'learning_paths', patterns: ['learning paths', 'learning journey', 'path to', 'curated paths'] },
        { action: 'my_progress', patterns: ['my lop progress', 'lop progress', 'what have i watched', 'my sessions'] },
        { action: 'popular', patterns: ['popular sessions', 'most watched', 'top sessions', 'best sessions'] },
        { action: 'by_speaker', patterns: ['sessions by', 'talks by', 'lop by'], extractors: ['speaker'] },
        { action: 'featured', patterns: ['featured session', 'featured lop', 'highlight session'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // PULSE INTENTS (20+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    pulse: [
        { action: 'latest', patterns: ['latest on pulse', 'pulse news', 'market updates', 'whats on pulse', 'latest signals'] },
        { action: 'competitive', patterns: ['competitive intel', 'competitor news', 'competitive intelligence', 'competition updates'] },
        { action: 'by_company', patterns: ['latest on', 'news about', 'updates on', 'what about'], extractors: ['company'] },
        { action: 'regulatory', patterns: ['regulatory updates', 'compliance news', 'regulations', 'regulatory changes', 'cms updates'] },
        { action: 'market', patterns: ['market trends', 'market news', 'industry trends', 'market updates'] },
        { action: 'technology', patterns: ['tech signals', 'technology news', 'tech updates', 'innovation news'] },
        { action: 'unread', patterns: ['unread signals', 'new signals', 'unread pulse', 'signals i missed'] },
        { action: 'bookmarked', patterns: ['bookmarked signals', 'saved signals', 'my bookmarks'] },
        { action: 'competitors', patterns: ['competitors', 'competitor list', 'tracked competitors', 'watchlist'] },
        { action: 'waystar', patterns: ['waystar', 'waystar news', 'latest on waystar'] },
        { action: 'trizetto', patterns: ['trizetto', 'trizetto news', 'cognizant trizetto'] },
        { action: 'inovalon', patterns: ['inovalon', 'inovalon news'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // EXPERT/PEOPLE INTENTS (25+ patterns) - Healthcare-focused
    // ─────────────────────────────────────────────────────────────────────────
    expert: [
        // Generic skill patterns (with entity extraction)
        { action: 'find_by_skill', patterns: ['expert in', 'experts in', 'find expert', 'who knows', 'specialist in', 'specialists in', 'from community'], extractors: ['skills'] },
        // Healthcare interoperability standards
        { action: 'edi', patterns: ['edi expert', 'expert in edi', 'experts in edi', 'who knows edi', 'edi specialist', 'edi integration'] },
        { action: 'fhir', patterns: ['fhir expert', 'expert in fhir', 'experts in fhir', 'who knows fhir', 'fhir specialist', 'fhir api'] },
        { action: 'x12', patterns: ['x12 expert', 'expert in x12', 'experts in x12', 'who knows x12', 'x12 specialist', '837 expert', '835 expert'] },
        { action: 'hl7', patterns: ['hl7 expert', 'expert in hl7', 'experts in hl7', 'who knows hl7', 'hl7 specialist'] },
        // Domain expertise
        { action: 'ehr', patterns: ['ehr expert', 'expert in ehr', 'experts in ehr', 'who knows ehr', 'ehr specialist', 'epic expert', 'cerner expert'] },
        { action: 'claims', patterns: ['claims expert', 'expert in claims', 'experts in claims', 'claims specialist', 'who knows claims', 'claims processing'] },
        { action: 'api', patterns: ['api expert', 'expert in api', 'experts in api', 'api design expert', 'rest api expert'] },
        { action: 'rcm', patterns: ['rcm expert', 'expert in rcm', 'revenue cycle expert', 'billing expert'] },
        { action: 'product', patterns: ['product expert', 'product management expert', 'pm expert'] },
        { action: 'design', patterns: ['design expert', 'ux expert', 'ui expert', 'accessibility expert'] },
        { action: 'data', patterns: ['data expert', 'analytics expert', 'data science expert'] },
        { action: 'leadership', patterns: ['leadership expert', 'management expert', 'team leads'] },
        { action: 'my_team', patterns: ['my team', 'team members', 'people on my team'] },
        { action: 'directory', patterns: ['people directory', 'find people', 'employee search'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // COMMUNITY/DISCUSSION INTENTS (15+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    community: [
        { action: 'recent', patterns: ['main discussions', 'recent discussions', 'latest discussions', 'community talks'] },
        { action: 'new', patterns: ['new discussions', 'today discussions', 'started today'] },
        { action: 'open', patterns: ['open questions', 'unanswered questions', 'questions without answers'] },
        { action: 'trending', patterns: ['trending topics', 'hot discussions', 'popular discussions', 'trending discussions'] },
        { action: 'by_tag', patterns: ['discussions on', 'discussions about', 'topics about'], extractors: ['tag'] },
        { action: 'my_posts', patterns: ['my discussions', 'my posts', 'discussions i started'] },
        { action: 'my_replies', patterns: ['my replies', 'answers i gave', 'my comments'] },
        { action: 'resolved', patterns: ['resolved discussions', 'answered questions', 'solved questions'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // LIBRARY INTENTS (15+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    library: [
        { action: 'playbooks', patterns: ['latest playbooks', 'new playbooks', 'playbooks', 'product playbooks'] },
        { action: 'grab_go', patterns: ['grab and go', 'quick resources', 'grab go', 'ready to use'] },
        { action: 'templates', patterns: ['templates', 'document templates', 'prd template', 'okr template'] },
        { action: 'popular', patterns: ['popular resources', 'most viewed', 'top resources', 'trending resources'] },
        { action: 'new', patterns: ['new resources', 'latest resources', 'recently added'] },
        { action: 'by_pillar', patterns: ['resources on', 'documents about', 'library for'], extractors: ['topic'] },
        { action: 'process', patterns: ['process docs', 'process documentation', 'how to'] },
        { action: 'research', patterns: ['research reports', 'user research', 'market research'] },
        { action: 'strategy', patterns: ['strategy docs', 'product strategy', 'roadmap'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // NAVIGATION INTENTS (10+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    navigation: [
        { action: 'home', patterns: ['go home', 'take me home', 'home page', 'open home'] },
        { action: 'toast', patterns: ['open toast', 'go to toast', 'toast page'] },
        { action: 'lop', patterns: ['open lop', 'go to lop', 'lop page', 'love of product'] },
        { action: 'pulse', patterns: ['open pulse', 'go to pulse', 'pulse page'] },
        { action: 'library', patterns: ['open library', 'go to library', 'library page'] },
        { action: 'community', patterns: ['open community', 'go to community', 'discussions page'] },
        { action: 'profile', patterns: ['my profile', 'open profile', 'go to profile'] },
        { action: 'settings', patterns: ['settings', 'my settings', 'preferences'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // STATS INTENTS (10+ patterns)
    // ─────────────────────────────────────────────────────────────────────────
    stats: [
        { action: 'love_points', patterns: ['love points', 'my points', 'how many points', 'point balance', 'my credits'] },
        { action: 'activity', patterns: ['my activity', 'recent activity', 'what did i do'] },
        { action: 'recognition_stats', patterns: ['my recognition stats', 'recognition summary', 'toast stats'] },
        { action: 'engagement', patterns: ['my engagement', 'engagement score', 'participation'] },
    ],

    // ─────────────────────────────────────────────────────────────────────────
    // HELP INTENTS (includes greetings)
    // ─────────────────────────────────────────────────────────────────────────
    help: [
        { action: 'greeting', patterns: ['hi', 'hello', 'hey', 'hi there', 'hello there', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings', 'yo', 'hiya'] },
        { action: 'capabilities', patterns: ['what can you do', 'help', 'what can you help with', 'capabilities', 'what do you know', 'options'] },
        { action: 'how_to', patterns: ['how do i', 'how to', 'teach me'], extractors: ['topic'] },
    ],

    // Unknown - fallback
    unknown: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

// Common companies for Pulse
const COMPANIES = [
    'waystar', 'trizetto', 'inovalon', 'experian', 'edifecs', 'rhyme', 'jopari', 'pverify',
    'access healthcare', 'omega', 'gebbs', 'ags health', 'cognizant', 'optum', 'change healthcare'
];

// Common skills for Expert search - Healthcare focused
const SKILLS = [
    // Healthcare interoperability
    'edi', 'fhir', 'x12', 'hl7', 'ccd', 'ccda', '837', '835', '270', '271', '276', '277',
    // Healthcare domains
    'ehr', 'claims', 'rcm', 'revenue cycle', 'billing', 'coding', 'payer', 'provider',
    'eligibility', 'prior auth', 'prior authorization', 'clearinghouse',
    // Technical
    'api', 'rest', 'graphql', 'microservices', 'aws', 'azure', 'gcp',
    // Product & Design
    'product', 'ux', 'ui', 'design', 'accessibility', 'a11y',
    // Data
    'data', 'analytics', 'sql', 'python', 'machine learning', 'ai',
    // Process
    'agile', 'scrum', 'okr', 'prd', 'research', 'strategy'
];

// ═══════════════════════════════════════════════════════════════════════════
// SYNONYM NORMALIZATION - Handle term variations
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Synonym mapping for common term variations
 * Maps user terminology to canonical form
 */
const SYNONYMS: Record<string, string> = {
    // Toast synonyms
    'kudos': 'toast',
    'shoutout': 'toast',
    'shout out': 'toast',
    'shoutouts': 'toast',
    'appreciation': 'toast',
    'props': 'toast',
    'thanks': 'toast',
    'recognition': 'toast',
    'recognitions': 'toasts',
    // LOP synonyms
    'talks': 'lop',
    'talk': 'lop',
    'sessions': 'lop sessions',
    'product talk': 'lop',
    'product talks': 'lop',
    'monthly talk': 'lop',
    'love of product session': 'lop session',
    // Pulse synonyms
    'intel': 'pulse',
    'intelligence': 'pulse',
    'news': 'signals',
    'updates': 'signals',
    'market news': 'market signals',
    'competitor news': 'competitive signals',
    // Expert synonyms
    'specialist': 'expert',
    'specialists': 'experts',
    'sme': 'expert',
    'guru': 'expert',
    'who knows': 'expert in',
    'who is good at': 'expert in',
    'find someone who': 'expert in',
    // Community synonyms
    'questions': 'discussions',
    'q&a': 'discussions',
    'qa': 'discussions',
    'forum': 'community',
    'threads': 'discussions',
    // Library synonyms
    'docs': 'documents',
    'documentation': 'documents',
    'guide': 'playbook',
    'guides': 'playbooks',
    'template': 'templates',
    'grab and go': 'grab & go',
};

/**
 * Normalize query by replacing synonyms with canonical terms
 */
const normalizeSynonyms = (query: string): string => {
    let normalized = query.toLowerCase();

    // Sort synonyms by length (longest first) to avoid partial replacements
    const sortedSynonyms = Object.entries(SYNONYMS)
        .sort((a, b) => b[0].length - a[0].length);

    for (const [synonym, canonical] of sortedSynonyms) {
        const regex = new RegExp(`\\b${synonym}\\b`, 'gi');
        normalized = normalized.replace(regex, canonical);
    }

    return normalized;
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPORAL PARSING - Handle date-based queries
// ═══════════════════════════════════════════════════════════════════════════

interface TemporalInfo {
    range: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'recent' | null;
    startDate?: Date;
    endDate?: Date;
}

/**
 * Extract temporal information from query
 */
const parseTemporalInfo = (query: string): TemporalInfo => {
    const lowerQuery = query.toLowerCase();
    const now = new Date();

    // Today
    if (/\btoday\b/.test(lowerQuery)) {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { range: 'today', startDate: start, endDate: now };
    }

    // Yesterday
    if (/\byesterday\b/.test(lowerQuery)) {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { range: 'yesterday', startDate: start, endDate: end };
    }

    // This week
    if (/\bthis week\b/.test(lowerQuery)) {
        const start = new Date(now);
        start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        return { range: 'this_week', startDate: start, endDate: now };
    }

    // Last week
    if (/\blast week\b|\bpast week\b|\bweek'?s?\b/.test(lowerQuery)) {
        const end = new Date(now);
        end.setDate(end.getDate() - end.getDay()); // Start of this week
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 7);
        return { range: 'last_week', startDate: start, endDate: end };
    }

    // This month
    if (/\bthis month\b/.test(lowerQuery)) {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { range: 'this_month', startDate: start, endDate: now };
    }

    // Last month
    if (/\blast month\b/.test(lowerQuery)) {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { range: 'last_month', startDate: start, endDate: end };
    }

    // Recent/latest (default to last 7 days)
    if (/\brecent\b|\blatest\b|\bnew\b/.test(lowerQuery)) {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return { range: 'recent', startDate: start, endDate: now };
    }

    return { range: null };
};

// ═══════════════════════════════════════════════════════════════════════════
// FUZZY MATCHING & TYPO TOLERANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common typos and misspellings map
 */
const COMMON_TYPOS: Record<string, string> = {
    // Toast/Recognition typos
    'tost': 'toast',
    'tosat': 'toast',
    'recongnition': 'recognition',
    'recgnition': 'recognition',
    'recogniton': 'recognition',
    'leaderborad': 'leaderboard',
    'leaderboad': 'leaderboard',
    // Expert typos
    'expret': 'expert',
    'expart': 'expert',
    'expertin': 'expert in',
    'epxert': 'expert',
    'specalist': 'specialist',
    // LOP typos
    'sessons': 'sessions',
    'sessioon': 'session',
    'upcomming': 'upcoming',
    'upcomig': 'upcoming',
    // Pulse typos
    'singal': 'signal',
    'singals': 'signals',
    'competitve': 'competitive',
    'competive': 'competitive',
    'regulartory': 'regulatory',
    // Skills typos
    'fihr': 'fhir',
    'fhri': 'fhir',
    'clams': 'claims',
    'cliam': 'claim',
    'biling': 'billing',
    'billig': 'billing',
    'eligiblity': 'eligibility',
    'eligibity': 'eligibility',
    // Community typos
    'discusion': 'discussion',
    'discusions': 'discussions',
    'comunity': 'community',
    'communtiy': 'community',
    // Library typos
    'playboks': 'playbooks',
    'templats': 'templates',
    // General typos
    'lastest': 'latest',
    'recnet': 'recent',
    'resent': 'recent',
    'shwo': 'show',
    'sohw': 'show',
    'whats': 'what is',
    'wheres': 'where is',
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;

    // Create matrix
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],      // deletion
                    dp[i][j - 1],      // insertion
                    dp[i - 1][j - 1]   // substitution
                );
            }
        }
    }

    return dp[m][n];
};

/**
 * Check if two strings are similar (fuzzy match)
 * @param input User input word
 * @param target Pattern word
 * @param threshold Maximum allowed distance (default: 2 for short words, 3 for longer)
 */
const isFuzzyMatch = (input: string, target: string): boolean => {
    if (input === target) return true;
    if (input.length < 3 || target.length < 3) return false; // Don't fuzzy match very short words

    const distance = levenshteinDistance(input, target);
    const maxLength = Math.max(input.length, target.length);
    const threshold = maxLength <= 5 ? 1 : maxLength <= 8 ? 2 : 3;

    return distance <= threshold;
};

/**
 * Correct common typos in query
 */
const correctTypos = (query: string): string => {
    let corrected = query.toLowerCase();

    // Apply common typo corrections
    for (const [typo, correct] of Object.entries(COMMON_TYPOS)) {
        const regex = new RegExp(`\\b${typo}\\b`, 'gi');
        corrected = corrected.replace(regex, correct);
    }

    return corrected;
};

/**
 * Parse skills with AND/OR logic
 * e.g., "fhir and x12" -> { skills: ['fhir', 'x12'], operator: 'AND' }
 * e.g., "fhir or edi" -> { skills: ['fhir', 'edi'], operator: 'OR' }
 */
const parseSkillsWithLogic = (skillString: string): { skills: string[]; operator: 'AND' | 'OR' } => {
    // Normalize "and or" to just "or" (user might say "fhir and or edi")
    const normalized = skillString.replace(/\s+and\s+or\s+/gi, ' or ');

    // Determine operator
    const hasAnd = /\s+and\s+/i.test(normalized);
    const hasOr = /\s+or\s+/i.test(normalized);
    const operator: 'AND' | 'OR' = hasAnd && !hasOr ? 'AND' : 'OR';

    // Split by operator
    const delimiter = hasAnd ? /\s+and\s+/i : hasOr ? /\s+or\s+/i : /[,]/;
    const rawSkills = normalized.split(delimiter).map(s => s.trim().toLowerCase()).filter(Boolean);

    // Clean up skills (remove trailing question marks, etc.)
    const skills = rawSkills.map(s => s.replace(/[?!.,]+$/, '').trim());

    return { skills, operator };
};

/**
 * Extract entities from query based on known patterns
 */
const extractEntities = (query: string, extractors?: string[]): Record<string, string> => {
    const entities: Record<string, string> = {};
    const lowerQuery = query.toLowerCase();

    if (extractors?.includes('company')) {
        for (const company of COMPANIES) {
            if (lowerQuery.includes(company)) {
                entities.company = company;
                break;
            }
        }
        // Also check for generic company pattern
        const companyMatch = lowerQuery.match(/(?:on|about|for)\s+(\w+)/);
        if (!entities.company && companyMatch) {
            entities.company = companyMatch[1];
        }
    }

    // Multi-skill extraction with AND/OR logic
    if (extractors?.includes('skills')) {
        const skillsMatch = lowerQuery.match(/(?:experts? in|who knows|specialists? in|from community)\s+(.+?)(?:\?|$)/);
        if (skillsMatch) {
            const { skills, operator } = parseSkillsWithLogic(skillsMatch[1]);
            entities.skills = skills.join(',');
            entities.operator = operator;
        }
    }

    // Legacy single skill extraction
    if (extractors?.includes('skill')) {
        for (const skill of SKILLS) {
            if (lowerQuery.includes(skill)) {
                entities.skill = skill;
                break;
            }
        }
        // Generic skill extraction
        const skillMatch = lowerQuery.match(/(?:expert in|who knows|specialist in)\s+(.+?)(?:\?|$)/);
        if (!entities.skill && skillMatch) {
            entities.skill = skillMatch[1].trim();
        }
    }

    if (extractors?.includes('topic')) {
        const topicMatch = lowerQuery.match(/(?:about|on|for)\s+(.+?)(?:\?|$)/);
        if (topicMatch) {
            entities.topic = topicMatch[1].trim();
        }
    }

    if (extractors?.includes('speaker')) {
        const speakerMatch = lowerQuery.match(/(?:by|from)\s+(.+?)(?:\?|$)/);
        if (speakerMatch) {
            entities.speaker = speakerMatch[1].trim();
        }
    }

    if (extractors?.includes('tag')) {
        const tagMatch = lowerQuery.match(/(?:on|about|tagged)\s+(.+?)(?:\?|$)/);
        if (tagMatch) {
            entities.tag = tagMatch[1].trim();
        }
    }

    return entities;
};

// ═══════════════════════════════════════════════════════════════════════════
// INTENT CLASSIFIER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Classify user query into an intent
 * Uses exact pattern matching for deterministic, fast results
 * Now with synonym normalization and temporal parsing
 */
export const classifyIntent = (query: string): Intent => {
    if (!query || typeof query !== 'string') {
        return {
            category: 'unknown',
            action: 'empty',
            confidence: 0,
            entities: {},
            originalQuery: query || '',
        };
    }

    // Step 0: Correct common typos (expret -> expert, tost -> toast, etc.)
    const correctedQuery = correctTypos(query);

    // Step 1: Normalize synonyms (kudos -> toast, shoutout -> toast, etc.)
    const normalizedQuery = normalizeSynonyms(correctedQuery);
    const lowerQuery = normalizedQuery.trim();

    // Step 2: Extract temporal info (last week, yesterday, etc.)
    const temporalInfo = parseTemporalInfo(query);

    let bestMatch: { category: IntentCategory; action: string; confidence: number; extractors?: string[] } | null = null;
    let bestMatchLength = 0;

    // Check each category
    for (const [category, patterns] of Object.entries(INTENT_PATTERNS) as [IntentCategory, PatternConfig[]][]) {
        for (const config of patterns) {
            for (const pattern of config.patterns) {
                // Check if pattern is contained in normalized query
                if (lowerQuery.includes(pattern)) {
                    // Prefer longer matches (more specific)
                    if (pattern.length > bestMatchLength) {
                        bestMatchLength = pattern.length;
                        bestMatch = {
                            category,
                            action: config.action,
                            confidence: Math.min(0.95, 0.7 + (pattern.length / 50)),
                            extractors: config.extractors,
                        };
                    }
                }
            }
        }
    }

    if (bestMatch) {
        const entities = extractEntities(lowerQuery, bestMatch.extractors);

        // Add temporal info to entities if present
        if (temporalInfo.range) {
            entities.temporalRange = temporalInfo.range;
            if (temporalInfo.startDate) {
                entities.startDate = temporalInfo.startDate.toISOString();
            }
            if (temporalInfo.endDate) {
                entities.endDate = temporalInfo.endDate.toISOString();
            }
        }

        return {
            category: bestMatch.category,
            action: bestMatch.action,
            confidence: bestMatch.confidence,
            entities,
            originalQuery: query,
        };
    }

    // Fallback: Try to infer from keywords in normalized query
    const fallbackCategory = inferCategoryFromKeywords(lowerQuery);

    const fallbackEntities: Record<string, string> = {};
    if (temporalInfo.range) {
        fallbackEntities.temporalRange = temporalInfo.range;
    }

    return {
        category: fallbackCategory,
        action: 'search',
        confidence: 0.4,
        entities: fallbackEntities,
        originalQuery: query,
    };
};

/**
 * Infer category from general keywords when no pattern matches
 */
const inferCategoryFromKeywords = (query: string): IntentCategory => {
    const categoryKeywords: Record<IntentCategory, string[]> = {
        toast: ['toast', 'recognition', 'badge', 'award', 'celebrate'],
        lop: ['lop', 'session', 'video', 'watch', 'learning'],
        pulse: ['pulse', 'signal', 'news', 'competitor', 'market'],
        expert: ['expert', 'who', 'find', 'person', 'team'],
        community: ['discussion', 'question', 'answer', 'topic', 'forum'],
        library: ['document', 'playbook', 'template', 'resource', 'library'],
        navigation: ['go', 'open', 'navigate', 'take me'],
        stats: ['point', 'stat', 'metric', 'score', 'credit'],
        help: ['help', 'what can', 'how'],
        unknown: [],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords) as [IntentCategory, string[]][]) {
        for (const keyword of keywords) {
            if (query.includes(keyword)) {
                return category;
            }
        }
    }

    return 'unknown';
};

// ═══════════════════════════════════════════════════════════════════════════
// QUICK REPLY GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate contextual quick replies based on intent
 */
export const generateQuickReplies = (intent: Intent): { id: string; label: string; value: string; icon: string }[] => {
    const baseReplies = [
        { id: 'help', label: 'What else?', value: 'What else can you help with?', icon: '❓' },
    ];

    switch (intent.category) {
        case 'toast':
            return [
                { id: 'leaderboard', label: 'Leaderboard', value: 'Show me the leaderboard', icon: '🏆' },
                { id: 'give', label: 'Give Toast', value: 'I want to give a toast', icon: '🎉' },
                { id: 'badges', label: 'My Badges', value: 'Show my badges', icon: '🏅' },
                ...baseReplies,
            ];
        case 'lop':
            return [
                { id: 'upcoming', label: 'Upcoming', value: 'Show upcoming LOP', icon: '📅' },
                { id: 'essential', label: 'Essential', value: 'Show essential sessions', icon: '⭐' },
                { id: 'paths', label: 'Learning Paths', value: 'Show learning paths', icon: '🎯' },
                ...baseReplies,
            ];
        case 'pulse':
            return [
                { id: 'competitive', label: 'Competitors', value: 'Show competitive intel', icon: '📊' },
                { id: 'regulatory', label: 'Regulatory', value: 'Show regulatory updates', icon: '📋' },
                { id: 'waystar', label: 'Waystar', value: 'Latest on Waystar', icon: '🔍' },
                ...baseReplies,
            ];
        case 'expert':
            return [
                { id: 'claims', label: 'Claims Expert', value: 'Find expert in claims', icon: '👤' },
                { id: 'ehr', label: 'EHR Expert', value: 'Find expert in EHR', icon: '👤' },
                { id: 'team', label: 'My Team', value: 'Show my team', icon: '👥' },
                ...baseReplies,
            ];
        case 'community':
            return [
                { id: 'trending', label: 'Trending', value: 'Show trending discussions', icon: '🔥' },
                { id: 'open', label: 'Open Questions', value: 'Show open questions', icon: '❓' },
                ...baseReplies,
            ];
        case 'library':
            return [
                { id: 'playbooks', label: 'Playbooks', value: 'Show latest playbooks', icon: '📚' },
                { id: 'templates', label: 'Templates', value: 'Show templates', icon: '📄' },
                { id: 'grab_go', label: 'Grab & Go', value: 'Show Grab and Go', icon: '⚡' },
                ...baseReplies,
            ];
        case 'stats':
            return [
                { id: 'points', label: 'Love Points', value: 'My love points', icon: '❤️' },
                { id: 'activity', label: 'Activity', value: 'My recent activity', icon: '📈' },
                ...baseReplies,
            ];
        default:
            return [
                { id: 'discover', label: 'Discover', value: 'Show me latest playbooks', icon: '🔍' },
                { id: 'lop', label: 'LOP', value: 'Show upcoming LOP', icon: '📺' },
                { id: 'toast', label: 'Toast', value: 'Show recent toasts', icon: '🎉' },
                { id: 'pulse', label: 'Pulse', value: 'Latest on Pulse', icon: '📊' },
                ...baseReplies,
            ];
    }
};
