/**
 * Café Finder: Intent Classifier
 * Pattern-based intent detection with confidence scoring
 */

import type {
    IntentType,
    IntentResult,
    QueryType,
    ExpectedResultType,
} from './types';
import { classifyTokens, normalizeQuery, matchesPattern } from './queryProcessor';
import { TOOL_SYNONYMS, TEAM_SYNONYMS } from './synonyms';

// ============================================
// INTENT PATTERNS
// ============================================

interface IntentPattern {
    intent: IntentType;
    patterns: RegExp[];
    keywords: string[];
    expectedResult: ExpectedResultType;
    baseConfidence: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
    // FIND_PERSON
    {
        intent: 'FIND_PERSON',
        patterns: [
            /who (?:is|knows|can help|owns|manages|leads)/i,
            /contact (?:info|information|details|for)/i,
            /(?:find|reach|talk to|message|email|contact)\s+(?:someone|person|expert|lead)/i,
            /expert (?:in|on|for|about)/i,
            /(?:slack|teams|email) (?:for|of)\s+\w+/i,
            /whose (?:team|responsibility)/i,
        ],
        keywords: ['who', 'contact', 'expert', 'person', 'email', 'slack', 'teams', 'reach out', 'talk to', 'owner', 'lead'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.85,
    },

    // FIND_TOOL
    {
        intent: 'FIND_TOOL',
        patterns: [
            /(?:where is|open|launch|go to|start)\s+\w+/i,
            /link to\s+\w+/i,
            /(?:url|address|site) (?:for|of)/i,
            /access \w+ tool/i,
        ],
        keywords: Object.keys(TOOL_SYNONYMS),
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.90,
    },

    // TOOL_ACCESS
    {
        intent: 'TOOL_ACCESS',
        patterns: [
            /(?:get|request|need|want|grant)\s+(?:\w+\s+)?access/i,
            /how (?:do i|to|can i)\s+(?:get|request|gain)\s+\w+/i,
            /access (?:to|for)\s+\w+/i,
            /\w+\s+access (?:request|form)/i,
            /request\s+\w+\s+(?:access|permission|license)/i,
            /no access to/i,
            /locked out of/i,
        ],
        keywords: ['access', 'permission', 'request', 'login', 'account', 'license', 'approval'],
        expectedResult: 'ACTIONABLE_ANSWER',
        baseConfidence: 0.90,
    },

    // FIND_FAQ
    {
        intent: 'FIND_FAQ',
        patterns: [
            /how (?:do|does|can|should|would|to)/i,
            /what (?:is|are|does|do|happens if)\s+\w+/i,
            /when (?:do|does|should|is|will)/i,
            /where (?:do|does|can|is)\s+\w+/i,
            /why (?:do|does|is|are)\s+\w+/i,
            /can i\s+/i,
            /is there\s+/i,
            /do i need to/i,
        ],
        keywords: ['how', 'what', 'when', 'where', 'why', 'faq', 'question', 'help', 'troubleshoot'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.75,
    },

    // EXPLAIN_CONCEPT
    {
        intent: 'EXPLAIN_CONCEPT',
        patterns: [
            /what is (?:a |an |the )?\w+/i,
            /(?:explain|define|meaning of|definition of)\s+/i,
            /what does\s+\w+\s+(?:mean|stand for)/i,
            /tell me about\s+\w+/i,
            /overview of\s+\w+/i,
        ],
        keywords: ['what is', 'explain', 'define', 'meaning', 'understand', 'about', 'concept', 'term'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.85,
    },

    // LEARN_PROCESS
    {
        intent: 'LEARN_PROCESS',
        patterns: [
            /how (?:does|do)\s+.+\s+work/i,
            /process (?:for|of)\s+/i,
            /steps (?:for|to)\s+/i,
            /procedure (?:for|to)\s+/i,
            /workflow (?:for|of)/i,
            /guide (?:for|to)/i,
            /walkthrough/i,
        ],
        keywords: ['process', 'steps', 'procedure', 'workflow', 'how does', 'guide', 'tutorial', ' SOP'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.80,
    },

    // COMPARE
    {
        intent: 'COMPARE',
        patterns: [
            /\w+\s+(?:vs|versus|or|compared to)\s+\w+/i,
            /difference between\s+/i,
            /compare\s+/i,
            /(?:pros|cons|advantages) of/i,
        ],
        keywords: ['vs', 'versus', 'compare', 'difference', 'between', 'better', 'preference'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.85,
    },

    // FIND_RESOURCE
    {
        intent: 'FIND_RESOURCE',
        patterns: [
            /(?:find|search|look for|show|get)\s+(?:a |the )?(?:document|file|deck|preso)/i,
            /\w+\s+(?:template|guide|document|doc|checklist|playbook|slides)/i,
            /where is the \w+ (?:doc|file)/i,
            /example of/i,
        ],
        keywords: ['find', 'search', 'document', 'template', 'guide', 'resource', 'file', 'slide', 'deck'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.70,
    },

    // FIND_TEAM
    {
        intent: 'FIND_TEAM',
        patterns: [
            /(?:who|which team)\s+(?:works on|owns|manages|handles)/i,
            /\w+\s+team\b/i,
            /team (?:for|of|behind)\s+/i,
            /org chart/i,
        ],
        keywords: [...Object.keys(TEAM_SYNONYMS), 'team', 'group', 'department', 'squad', 'pod'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.80,
    },

    // START_DISCUSSION
    {
        intent: 'START_DISCUSSION',
        patterns: [
            /(?:ask|discuss|question about)\s+/i,
            /i have a question/i,
            /need (?:help|advice) with/i,
            /anyone (?:know|seen)/i,
            /problem with/i,
        ],
        keywords: ['ask', 'discuss', 'question', 'help with', 'issue', 'problem', 'advice'],
        expectedResult: 'ACTIONABLE_ANSWER',
        baseConfidence: 0.75,
    },

    // CONTACT_EXPERT
    {
        intent: 'CONTACT_EXPERT',
        patterns: [
            /talk to (?:someone|expert|person|human)/i,
            /reach out to/i,
            /who can (?:help|assist)/i,
            /connect with/i,
            /schedule (?:time|meeting) with/i,
        ],
        keywords: ['talk to', 'reach out', 'contact', 'help', 'expert', 'connect'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.80,
    },

    // NAVIGATE
    {
        intent: 'NAVIGATE',
        patterns: [
            /go to\s+/i,
            /open\s+(?:page|section|tab)/i,
            /show me\s+(?:my )?\w+/i,
            /take me to\s+/i,
            /navigate to/i,
        ],
        keywords: ['go', 'open', 'show', 'navigate', 'take me', 'view'],
        expectedResult: 'NAVIGATION',
        baseConfidence: 0.85,
    },

    // LOP_NEXT
    {
        intent: 'LOP_NEXT',
        patterns: [
            /next (?:lop|product talk|session)/i,
            /upcoming (?:lop|product talk|session)/i,
            /when is (?:the )?(?:next )?(?:lop|talk)/i,
            /future (?:lop|session)/i,
        ],
        keywords: ['next lop', 'upcoming lop', 'when lop', 'next talk'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.90,
    },

    // LOP_FIND
    {
        intent: 'LOP_FIND',
        patterns: [
            /(?:lop|product talk|session) (?:about|on|for)\s+/i,
            /watch (?:lop|talk)/i,
            /recording of/i,
            /previous (?:lop|talk)/i,
        ],
        keywords: ['lop', 'product talk', 'session', 'presentation', 'recording', 'watch'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.85,
    },

    // LOP_SPEAKER
    {
        intent: 'LOP_SPEAKER',
        patterns: [
            /who (?:spoke|presented|talked) (?:about|on|at)/i,
            /\w+(?:'s| 's) lop/i,
            /lop by\s+\w+/i,
            /presenter for/i,
        ],
        keywords: ['spoke', 'presented', 'speaker', 'by', 'presenter'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.80,
    },

    // BROWSE
    {
        intent: 'BROWSE',
        patterns: [
            /(?:all|list|browse|show)\s+(?:the )?\w+s?\b/i,
            /directory of/i,
            /catalog/i,
        ],
        keywords: ['all', 'list', 'browse', 'show', 'catalog', 'directory'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.70,
    },

    // RECENT
    {
        intent: 'RECENT',
        patterns: [
            /(?:recent|new|latest|fresh|created)\s+/i,
            /what's new/i,
            /recently added/i,
            /just (?:added|updated)/i,
        ],
        keywords: ['recent', 'new', 'latest', 'fresh', 'updated'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.75,
    },

    // POPULAR
    {
        intent: 'POPULAR',
        patterns: [
            /(?:popular|top|trending|most used|essential)\s+/i,
            /best (?:rated|viewed)/i,
            /hot/i,
        ],
        keywords: ['popular', 'top', 'trending', 'most used', 'best', 'hot'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.75,
    },
];

// ============================================
// QUERY TYPE DETECTION
// ============================================

function detectQueryType(query: string): QueryType {
    const normalized = normalizeQuery(query);

    // Question patterns
    if (/^(how|what|who|where|when|why|which|can|is|does|do|are|will|would|could|should)\b/i.test(normalized)) {
        return 'QUESTION';
    }

    // Command patterns
    if (/^(show|open|go|find|get|list|browse|take|navigate|search|fetch)\b/i.test(normalized)) {
        return 'COMMAND';
    }

    // Name pattern (capitalized words, 2-4 words)
    // Heuristic: check original query for casing
    const words = query.trim().split(/\s+/);
    if (words.length >= 1 && words.length <= 4) {
        // If >50% of words start with capital letter, plausible name
        const capitalizedCount = words.filter(w => /^[A-Z]/.test(w)).length;
        if (capitalizedCount > 0 && capitalizedCount >= words.length / 2) {
            return 'NAME';
        }
    }

    // Short queries are usually keywords
    if (words.length <= 2) {
        return 'KEYWORD';
    }

    return 'PHRASE';
}

// ============================================
// MAIN CLASSIFIER
// ============================================

/**
 * Check if query contains any of the keywords
 */
function containsKeyword(tokens: string[], keywords: string[]): boolean {
    const tokenSet = new Set(tokens.map(t => t.toLowerCase()));
    return keywords.some(kw => {
        const kwParts = kw.toLowerCase().split(/\s+/);
        // All parts of the keyword phrase must be present
        return kwParts.every(part => tokenSet.has(part));
    });
}

/**
 * Calculate intent score based on patterns and keywords
 */
function calculateIntentScore(
    query: string,
    tokens: string[],
    pattern: IntentPattern
): number {
    let score = 0;

    // Check pattern matches
    if (matchesPattern(query, pattern.patterns)) {
        score += pattern.baseConfidence;
    }

    // Check keyword matches (additive boost)
    if (containsKeyword(tokens, pattern.keywords)) {
        // Boost depends on uniqueness - if pattern matched, simpler keyword is less special
        // If pattern didn't match, keyword carries more weight but starts lower
        score += score > 0 ? 0.15 : 0.3;
    }

    // Cap at 1.0
    return Math.min(score, 1.0);
}

/**
 * Classify the intent of a search query
 */
export function classifyIntent(
    query: string,
    tokens: string[]
): IntentResult {
    const normalized = normalizeQuery(query);
    const classified = classifyTokens(tokens);

    // Score all intents
    const scores: Array<{ intent: IntentType; score: number; expectedResult: ExpectedResultType }> = [];

    for (const pattern of INTENT_PATTERNS) {
        const score = calculateIntentScore(normalized, classified.all, pattern);
        if (score > 0.3) { // Minimum threshold to even consider
            scores.push({
                intent: pattern.intent,
                score,
                expectedResult: pattern.expectedResult,
            });
        }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Detect query type
    const queryType = detectQueryType(query);

    // If no patterns matched significantly (or at all)
    if (scores.length === 0) {
        return {
            primary: 'GENERAL_SEARCH',
            confidence: 0.5,
            secondary: [],
            queryType,
            expectedResult: 'MIXED',
        };
    }

    const primary = scores[0];

    // Filter secondary intents - must be relevant enough relative to primary
    // e.g. if primary is 0.9, secondary must be > 0.45
    const separateThreshold = 0.4;
    const secondary = scores.slice(1, 4)
        .filter(s => s.score >= separateThreshold)
        .map(s => ({
            intent: s.intent,
            confidence: s.score,
        }));

    return {
        primary: primary.intent,
        confidence: primary.score,
        secondary,
        queryType,
        expectedResult: primary.expectedResult,
    };
}

/**
 * Check if intent is a "find" type (seeking something)
 */
export function isFindIntent(intent: IntentType): boolean {
    return [
        'FIND_PERSON',
        'FIND_TOOL',
        'FIND_RESOURCE',
        'FIND_FAQ',
        'FIND_TEAM',
    ].includes(intent);
}

/**
 * Check if intent is an "action" type (wanting to do something)
 */
export function isActionIntent(intent: IntentType): boolean {
    return [
        'TOOL_ACCESS',
        'START_DISCUSSION',
        'CONTACT_EXPERT',
        'NAVIGATE',
    ].includes(intent);
}

/**
 * Check if intent is a "learn" type (wanting to understand)
 */
export function isLearnIntent(intent: IntentType): boolean {
    return [
        'EXPLAIN_CONCEPT',
        'LEARN_PROCESS',
        'COMPARE',
    ].includes(intent);
}
