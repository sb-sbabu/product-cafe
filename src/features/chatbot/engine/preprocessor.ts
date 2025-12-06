/**
 * DETERMINISTIC NLU PREPROCESSOR
 * Handles text normalization, tokenization, and synonym expansion
 */

// Synonym dictionary for entity expansion
export const synonymDictionary: Record<string, string[]> = {
    // Tools
    jira: ['jira', 'atlassian', 'issue tracker', 'ticket system', 'tickets'],
    confluence: ['confluence', 'wiki', 'knowledge base', 'docs'],
    smartsheet: ['smartsheet', 'sheets', 'project sheets', 'roadmap tool'],
    servicenow: ['servicenow', 'snow', 'service now', 'it portal'],
    sharepoint: ['sharepoint', 'sp', 'share point'],
    teams: ['teams', 'ms teams', 'microsoft teams'],

    // Actions
    access: ['access', 'permission', 'login', 'get into', 'use'],
    request: ['request', 'ask for', 'need', 'want', 'get'],
    find: ['find', 'search', 'look for', 'where is', 'locate'],
    learn: ['learn', 'teach me', 'how to', 'understand', 'explain'],
    help: ['help', 'assist', 'support', 'guidance'],

    // Content types
    template: ['template', 'form', 'format', 'document template'],
    prd: ['prd', 'product requirements', 'requirements doc', 'spec'],
    guide: ['guide', 'tutorial', 'how-to', 'instructions'],

    // Topics
    release: ['release', 'deploy', 'deployment', 'go live', 'launch'],
    onboarding: ['onboarding', 'new hire', 'getting started', 'new here'],
    healthcare: ['healthcare', 'health care', 'medical', 'clinical'],
    rcm: ['rcm', 'revenue cycle', 'billing', 'claims'],
    cob: ['cob', 'coordination of benefits', 'multiple coverage'],
};

// Stop words to remove
const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'although', 'though', 'unless', 'since', 'however', 'therefore',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'this', 'that',
    'please', 'thanks', 'thank', 'hi', 'hello', 'hey',
]);

export interface PreprocessResult {
    original: string;
    lowercased: string;
    tokens: string[];
    tokensWithoutStopWords: string[];
    expandedTokens: string[];
}

/**
 * Preprocess user input for NLU
 * Includes validation and sanitization for robustness
 */
export function preprocess(input: string | null | undefined): PreprocessResult {
    // Handle null/undefined/non-string input
    if (!input || typeof input !== 'string') {
        return {
            original: '',
            lowercased: '',
            tokens: [],
            tokensWithoutStopWords: [],
            expandedTokens: [],
        };
    }

    // Limit input length to prevent DoS (max 1000 chars)
    const MAX_INPUT_LENGTH = 1000;
    const sanitizedInput = input.slice(0, MAX_INPUT_LENGTH);

    // 1. Lowercase
    const lowercased = sanitizedInput.toLowerCase().trim();

    // If empty after trimming, return early
    if (!lowercased) {
        return {
            original: sanitizedInput,
            lowercased: '',
            tokens: [],
            tokensWithoutStopWords: [],
            expandedTokens: [],
        };
    }

    // 2. Remove punctuation and tokenize
    const cleaned = lowercased.replace(/[^\w\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);

    // 3. Remove stop words
    const tokensWithoutStopWords = tokens.filter(token => !stopWords.has(token));

    // 4. Expand with synonyms
    const expandedTokens: string[] = [];
    const seenExpansions = new Set<string>();

    for (const token of tokensWithoutStopWords) {
        expandedTokens.push(token);

        // Check if this token is a synonym and add the canonical form
        for (const [canonical, synonyms] of Object.entries(synonymDictionary)) {
            if (synonyms.includes(token) && !seenExpansions.has(canonical)) {
                expandedTokens.push(canonical);
                seenExpansions.add(canonical);
            }
        }
    }

    return {
        original: sanitizedInput,
        lowercased,
        tokens,
        tokensWithoutStopWords,
        expandedTokens,
    };
}

/**
 * Check if a phrase matches in the input
 */
export function phraseMatch(input: string, phrase: string): boolean {
    const normalizedInput = input.toLowerCase();
    const normalizedPhrase = phrase.toLowerCase();
    return normalizedInput.includes(normalizedPhrase);
}

/**
 * Check if input contains any of the given keywords
 */
export function containsAny(tokens: string[], keywords: string[]): boolean {
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
    return tokens.some(token => keywordSet.has(token.toLowerCase()));
}

/**
 * Check if input contains all of the given keywords
 */
export function containsAll(tokens: string[], keywords: string[]): boolean {
    const tokenSet = new Set(tokens.map(t => t.toLowerCase()));
    return keywords.every(keyword => tokenSet.has(keyword.toLowerCase()));
}
