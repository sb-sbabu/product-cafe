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
import { TOOL_SYNONYMS, TOPIC_SYNONYMS, TEAM_SYNONYMS } from './synonyms';

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
            /who (?:is|knows|can help)/i,
            /contact (?:info|information|details)/i,
            /(?:find|reach|talk to|message|email)\s+(?:someone|person|expert)/i,
            /expert (?:in|on|for|about)/i,
            /(?:slack|teams|email) (?:for|of)/i,
        ],
        keywords: ['who', 'contact', 'expert', 'person', 'email', 'slack', 'teams', 'reach out', 'talk to'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.85,
    },

    // FIND_TOOL
    {
        intent: 'FIND_TOOL',
        patterns: [
            /(?:where is|open|launch|go to)\s+\w+/i,
            /link to\s+\w+/i,
        ],
        keywords: Object.keys(TOOL_SYNONYMS),
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.90,
    },

    // TOOL_ACCESS
    {
        intent: 'TOOL_ACCESS',
        patterns: [
            /(?:get|request|need|want)\s+(?:\w+\s+)?access/i,
            /how (?:do i|to|can i)\s+(?:get|request)\s+\w+/i,
            /access (?:to|for)\s+\w+/i,
            /\w+\s+access request/i,
            /request\s+\w+\s+(?:access|permission)/i,
        ],
        keywords: ['access', 'permission', 'request', 'login', 'account'],
        expectedResult: 'ACTIONABLE_ANSWER',
        baseConfidence: 0.90,
    },

    // FIND_FAQ
    {
        intent: 'FIND_FAQ',
        patterns: [
            /how (?:do|does|can|should|would|to)/i,
            /what (?:is|are|does|do)/i,
            /when (?:do|does|should|is)/i,
            /where (?:do|does|can|is)/i,
            /why (?:do|does|is|are)/i,
            /can i\s+/i,
            /is there\s+/i,
        ],
        keywords: ['how', 'what', 'when', 'where', 'why', 'faq', 'question'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.75,
    },

    // EXPLAIN_CONCEPT
    {
        intent: 'EXPLAIN_CONCEPT',
        patterns: [
            /what is (?:a |an |the )?/i,
            /(?:explain|define|meaning of)\s+/i,
            /what does\s+\w+\s+mean/i,
            /tell me about\s+/i,
        ],
        keywords: ['what is', 'explain', 'define', 'meaning', 'understand', 'about'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.85,
    },

    // LEARN_PROCESS
    {
        intent: 'LEARN_PROCESS',
        patterns: [
            /how does\s+.+\s+work/i,
            /process (?:for|of)\s+/i,
            /steps (?:for|to)\s+/i,
            /procedure (?:for|to)\s+/i,
        ],
        keywords: ['process', 'steps', 'procedure', 'workflow', 'how does'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.80,
    },

    // COMPARE
    {
        intent: 'COMPARE',
        patterns: [
            /\w+\s+(?:vs|versus|or)\s+\w+/i,
            /difference between\s+/i,
            /compare\s+/i,
            /\w+\s+compared to\s+\w+/i,
        ],
        keywords: ['vs', 'versus', 'compare', 'difference', 'between'],
        expectedResult: 'DIRECT_ANSWER',
        baseConfidence: 0.85,
    },

    // FIND_RESOURCE
    {
        intent: 'FIND_RESOURCE',
        patterns: [
            /(?:find|search|look for|show)\s+(?:a |the )?\w+/i,
            /\w+\s+(?:template|guide|document|doc|checklist)/i,
        ],
        keywords: ['find', 'search', 'document', 'template', 'guide', 'resource', 'file'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.70,
    },

    // FIND_TEAM
    {
        intent: 'FIND_TEAM',
        patterns: [
            /(?:who|which team)\s+(?:works on|owns|manages)/i,
            /\w+\s+team\b/i,
            /team (?:for|of)\s+/i,
        ],
        keywords: [...Object.keys(TEAM_SYNONYMS), 'team', 'group', 'department'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.80,
    },

    // START_DISCUSSION
    {
        intent: 'START_DISCUSSION',
        patterns: [
            /(?:ask|discuss|question about)\s+/i,
            /i have a question/i,
            /need help with/i,
        ],
        keywords: ['ask', 'discuss', 'question', 'help with'],
        expectedResult: 'ACTIONABLE_ANSWER',
        baseConfidence: 0.75,
    },

    // CONTACT_EXPERT
    {
        intent: 'CONTACT_EXPERT',
        patterns: [
            /talk to (?:someone|expert|person)/i,
            /reach out to/i,
            /who can help/i,
        ],
        keywords: ['talk to', 'reach out', 'contact', 'help', 'expert'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.80,
    },

    // NAVIGATE
    {
        intent: 'NAVIGATE',
        patterns: [
            /go to\s+/i,
            /open\s+/i,
            /show me\s+/i,
            /take me to\s+/i,
        ],
        keywords: ['go', 'open', 'show', 'navigate', 'take me'],
        expectedResult: 'NAVIGATION',
        baseConfidence: 0.85,
    },

    // LOP_NEXT
    {
        intent: 'LOP_NEXT',
        patterns: [
            /next lop/i,
            /upcoming (?:lop|product talk|session)/i,
            /when is (?:the )?(?:next )?lop/i,
        ],
        keywords: ['next lop', 'upcoming lop', 'when lop'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.90,
    },

    // LOP_FIND
    {
        intent: 'LOP_FIND',
        patterns: [
            /lop (?:about|on|for)\s+/i,
            /product talk (?:about|on)\s+/i,
            /session (?:about|on)\s+/i,
        ],
        keywords: ['lop', 'product talk', 'session', 'presentation'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.85,
    },

    // LOP_SPEAKER
    {
        intent: 'LOP_SPEAKER',
        patterns: [
            /who (?:spoke|presented|talked) (?:about|on)/i,
            /\w+(?:'s| 's) lop/i,
            /lop by\s+\w+/i,
        ],
        keywords: ['spoke', 'presented', 'speaker', 'by'],
        expectedResult: 'ENTITY_CARD',
        baseConfidence: 0.80,
    },

    // BROWSE
    {
        intent: 'BROWSE',
        patterns: [
            /(?:all|list|browse|show)\s+(?:the )?\w+s?\b/i,
        ],
        keywords: ['all', 'list', 'browse', 'show'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.70,
    },

    // RECENT
    {
        intent: 'RECENT',
        patterns: [
            /(?:recent|new|latest|fresh)\s+/i,
            /what's new/i,
        ],
        keywords: ['recent', 'new', 'latest', 'fresh'],
        expectedResult: 'RESOURCE_LIST',
        baseConfidence: 0.75,
    },

    // POPULAR
    {
        intent: 'POPULAR',
        patterns: [
            /(?:popular|top|trending|most used)\s+/i,
        ],
        keywords: ['popular', 'top', 'trending', 'most used', 'best'],
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
    if (/^(show|open|go|find|get|list|browse|take|navigate)\b/i.test(normalized)) {
        return 'COMMAND';
    }

    // Name pattern (capitalized words, 2-4 words)
    const words = query.trim().split(/\s+/);
    if (words.length >= 1 && words.length <= 4) {
        const allCapitalized = words.every(w => /^[A-Z]/.test(w));
        if (allCapitalized) {
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
        score += 0.1;
    }

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
        if (score > 0) {
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

    // If no patterns matched, fall back to GENERAL_SEARCH
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
    const secondary = scores.slice(1, 4).map(s => ({
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
