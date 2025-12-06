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
// INPUT VALIDATION CONSTANTS
// ============================================

/** Maximum allowed query length to prevent DoS */
const MAX_QUERY_LENGTH = 500;

/** Minimum query length to trigger search */
const MIN_QUERY_LENGTH = 1;

/** Patterns that could indicate malicious input */
const SUSPICIOUS_PATTERNS = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
];

// ============================================
// MAIN QUERY PROCESSOR
// ============================================

/**
 * Sanitize input to remove potentially harmful characters
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove control characters (except newline, tab)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Trim excessive whitespace
        .trim();
}

/**
 * Check if query contains suspicious patterns
 */
export function containsSuspiciousPatterns(query: string): boolean {
    return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(query));
}

/**
 * Validate query input
 */
export function validateQuery(rawQuery: unknown): { valid: boolean; error?: string; sanitized: string } {
    // Type check
    if (rawQuery === null || rawQuery === undefined) {
        return { valid: false, error: 'Query is required', sanitized: '' };
    }

    if (typeof rawQuery !== 'string') {
        return { valid: false, error: 'Query must be a string', sanitized: '' };
    }

    // Sanitize
    const sanitized = sanitizeInput(rawQuery);

    // Minimum length check
    if (sanitized.length < MIN_QUERY_LENGTH) {
        return { valid: false, error: 'Query is too short', sanitized };
    }

    // Maximum length check
    if (sanitized.length > MAX_QUERY_LENGTH) {
        return {
            valid: false,
            error: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
            sanitized: sanitized.slice(0, MAX_QUERY_LENGTH)
        };
    }

    // Suspicious pattern check (warn but allow)
    if (containsSuspiciousPatterns(sanitized)) {
        console.warn('[QueryProcessor] Suspicious pattern detected in query:', sanitized.slice(0, 50));
    }

    return { valid: true, sanitized };
}

/**
 * Process a raw search query
 */
export function processQuery(
    rawQuery: string,
    context?: SearchContext
): Omit<SearchQuery, 'entities' | 'intent'> {
    // Validate and sanitize input
    const validation = validateQuery(rawQuery);

    // Handle empty/invalid query
    if (!validation.valid || !validation.sanitized.trim()) {
        return {
            raw: '',
            normalized: '',
            tokens: [],
            expandedTokens: [],
            context,
        };
    }

    const sanitizedQuery = validation.sanitized;

    try {
        // Normalize
        const normalized = normalizeQuery(sanitizedQuery);

        // Extract quoted phrases
        const { phrases, remainder } = extractQuotedPhrases(sanitizedQuery);

        // Tokenize
        const tokens = tokenize(remainder);
        const normalizedTokens = tokens.map(normalizeToken).filter(Boolean);

        // Add quoted phrases as single tokens
        const allTokens = [...normalizedTokens, ...phrases.map(p => p.toLowerCase())];

        // Expand with synonyms (limit to prevent explosion)
        const expandedTokens = expandWithSynonyms(allTokens).slice(0, 50);

        return {
            raw: sanitizedQuery,
            normalized,
            tokens: allTokens,
            expandedTokens,
            context,
        };
    } catch (error) {
        console.error('[QueryProcessor] Error processing query:', error);
        // Return safe fallback
        return {
            raw: sanitizedQuery,
            normalized: sanitizedQuery.toLowerCase().trim(),
            tokens: sanitizedQuery.toLowerCase().split(/\s+/).filter(Boolean),
            expandedTokens: [],
            context,
        };
    }
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
