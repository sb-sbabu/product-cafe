/**
 * Café Finder: Query Processor
 * Tokenizes, normalizes, and expands search queries
 */

import { getSynonyms, getCanonical } from './synonyms';
import type { SearchQuery, SearchContext } from './types';

// ============================================
// TOKENIZATION
// ============================================

/**
 * Common stop words (but we keep them for intent detection)
 */
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can',
]);

/**
 * Intent-indicating words (keep these for intent classification)
 */
const INTENT_WORDS = new Set([
    'how', 'what', 'who', 'where', 'when', 'why', 'which',
    'find', 'get', 'access', 'request', 'show', 'open', 'go',
    'contact', 'message', 'email', 'talk', 'reach',
    'learn', 'explain', 'define', 'meaning', 'understand',
    'compare', 'vs', 'versus', 'difference', 'between',
    'all', 'list', 'browse', 'recent', 'new', 'latest', 'popular', 'top',
    'next', 'upcoming', 'when',
]);

/**
 * Tokenize a query string
 */
export function tokenize(query: string): string[] {
    // Split on whitespace and punctuation, keeping words
    return query
        .split(/[\s,;!?()[\]{}'"]+/)
        .filter(token => token.length > 0);
}

/**
 * Normalize a token (lowercase, trim, remove accents)
 */
export function normalizeToken(token: string): string {
    return token
        .toLowerCase()
        .trim()
        // Remove accents
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Remove non-alphanumeric except hyphen
        .replace(/[^a-z0-9-]/g, '');
}

/**
 * Normalize an entire query
 */
export function normalizeQuery(query: string): string {
    return query
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ');
}

// ============================================
// TOKEN CLASSIFICATION
// ============================================

export interface ClassifiedTokens {
    /** All tokens */
    all: string[];
    /** Intent-indicating words */
    intentWords: string[];
    /** Content keywords (non-stop, non-intent) */
    keywords: string[];
    /** Stop words */
    stopWords: string[];
}

/**
 * Classify tokens into categories
 */
export function classifyTokens(tokens: string[]): ClassifiedTokens {
    const intentWords: string[] = [];
    const keywords: string[] = [];
    const stopWords: string[] = [];

    for (const token of tokens) {
        const normalized = normalizeToken(token);
        if (!normalized) continue;

        if (INTENT_WORDS.has(normalized)) {
            intentWords.push(normalized);
        } else if (STOP_WORDS.has(normalized)) {
            stopWords.push(normalized);
        } else {
            keywords.push(normalized);
        }
    }

    return {
        all: tokens.map(normalizeToken).filter(Boolean),
        intentWords,
        keywords,
        stopWords,
    };
}

// ============================================
// SYNONYM EXPANSION
// ============================================

/**
 * Expand tokens with synonyms
 */
export function expandWithSynonyms(tokens: string[]): string[] {
    const expanded = new Set<string>();

    for (const token of tokens) {
        const normalized = normalizeToken(token);
        if (!normalized) continue;

        // Add original
        expanded.add(normalized);

        // Add canonical form
        const canonical = getCanonical(normalized);
        expanded.add(canonical);

        // Add synonyms
        const synonyms = getSynonyms(normalized);
        for (const synonym of synonyms) {
            expanded.add(synonym.toLowerCase());
        }
    }

    return Array.from(expanded);
}

// ============================================
// QUOTED PHRASE HANDLING
// ============================================

/**
 * Extract quoted phrases and remaining tokens
 */
export function extractQuotedPhrases(query: string): {
    phrases: string[];
    remainder: string;
} {
    const phrases: string[] = [];
    let remainder = query;

    // Match double-quoted phrases
    const doubleQuoteRegex = /"([^"]+)"/g;
    let match;

    while ((match = doubleQuoteRegex.exec(query)) !== null) {
        phrases.push(match[1]);
        remainder = remainder.replace(match[0], ' ');
    }

    // Match single-quoted phrases
    const singleQuoteRegex = /'([^']+)'/g;
    while ((match = singleQuoteRegex.exec(query)) !== null) {
        phrases.push(match[1]);
        remainder = remainder.replace(match[0], ' ');
    }

    return {
        phrases,
        remainder: remainder.trim().replace(/\s+/g, ' '),
    };
}

// ============================================
// MAIN QUERY PROCESSOR
// ============================================

/**
 * Process a raw search query
 */
export function processQuery(
    rawQuery: string,
    context?: SearchContext
): Omit<SearchQuery, 'entities' | 'intent'> {
    // Handle empty query
    if (!rawQuery || !rawQuery.trim()) {
        return {
            raw: '',
            normalized: '',
            tokens: [],
            expandedTokens: [],
            context,
        };
    }

    // Normalize
    const normalized = normalizeQuery(rawQuery);

    // Extract quoted phrases
    const { phrases, remainder } = extractQuotedPhrases(rawQuery);

    // Tokenize
    const tokens = tokenize(remainder);
    const normalizedTokens = tokens.map(normalizeToken).filter(Boolean);

    // Add quoted phrases as single tokens
    const allTokens = [...normalizedTokens, ...phrases.map(p => p.toLowerCase())];

    // Expand with synonyms
    const expandedTokens = expandWithSynonyms(allTokens);

    return {
        raw: rawQuery,
        normalized,
        tokens: allTokens,
        expandedTokens,
        context,
    };
}

/**
 * Check if query matches a pattern
 */
export function matchesPattern(query: string, patterns: RegExp[]): boolean {
    const normalized = normalizeQuery(query);
    return patterns.some(pattern => pattern.test(normalized));
}

/**
 * Extract pattern groups from query
 */
export function extractPatternGroups(
    query: string,
    pattern: RegExp
): string[] | null {
    const normalized = normalizeQuery(query);
    const match = normalized.match(pattern);
    return match ? Array.from(match).slice(1) : null;
}
