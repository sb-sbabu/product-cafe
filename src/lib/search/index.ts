/**
 * Café Finder: Main Search Engine
 * Orchestrates query processing, intent classification, search, and ranking
 */

import type {
    SearchQuery,
    SearchResponse,
    SearchContext,
    SearchConfig,
    SearchMetrics,
} from './types';
import { processQuery } from './queryProcessor';
import { classifyIntent } from './intentClassifier';
import { extractEntities } from './entityExtractor';
import { searchIndex, countResults } from './searchIndex';
import { synthesizeAnswer } from './answerSynthesizer';

// Default config (inline to avoid import issues)
const DEFAULT_CONFIG: SearchConfig = {
    maxResultsPerType: 10,
    minScoreThreshold: 0.1,
    fuzzyMatching: true,
    fuzzyThreshold: 0.4,
    synonymExpansion: true,
    answerSynthesis: true,
    weights: {
        intentMatch: 0.35,
        semanticScore: 0.25,
        keywordScore: 0.15,
        freshness: 0.10,
        popularity: 0.10,
        contextBoost: 0.05,
    },
};

// ============================================
// SEARCH ENGINE CLASS
// ============================================

class CafeFinderEngine {
    private config: SearchConfig;
    private initialized = false;

    constructor(config: Partial<SearchConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Initialize the search engine
     */
    initialize(): void {
        if (this.initialized) return;

        console.log('[CafeFinder] Initializing search engine...');
        searchIndex.initialize();
        this.initialized = true;
        console.log('[CafeFinder] Search engine ready');
    }

    /**
     * Perform a search
     */
    search(rawQuery: string, context?: SearchContext): SearchResponse {
        const startTime = performance.now();

        // Ensure initialized
        if (!this.initialized) {
            try {
                this.initialize();
            } catch (initError) {
                console.error('[CafeFinder] Failed to initialize:', initError);
                return this.createEmptyResponse(rawQuery, startTime, 'Search engine initialization failed');
            }
        }

        // Handle null/undefined/empty query
        if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
            return this.createEmptyResponse('', startTime);
        }

        // Track timing
        const metrics: Partial<SearchMetrics> = {
            timestamp: new Date().toISOString(),
        };

        try {
            // ============================================
            // STEP 1: Query Processing
            // ============================================
            const queryProcessingStart = performance.now();

            const processedQuery = processQuery(rawQuery, context);

            // If query processing failed (empty result), return early
            if (!processedQuery.normalized && !processedQuery.tokens.length) {
                return this.createEmptyResponse(rawQuery, startTime);
            }

            // Extract entities
            const entities = extractEntities(rawQuery, processedQuery.tokens);

            // Classify intent
            const intent = classifyIntent(rawQuery, processedQuery.tokens);

            const query: SearchQuery = {
                ...processedQuery,
                entities,
                intent,
            };

            metrics.queryProcessingMs = performance.now() - queryProcessingStart;

            // ============================================
            // STEP 2: Search Execution
            // ============================================
            const searchExecutionStart = performance.now();

            // Get search terms (use expanded tokens for better recall)
            const searchTerms = query.expandedTokens.length > 0
                ? query.expandedTokens.join(' ')
                : query.normalized;

            // Guard against empty search terms
            if (!searchTerms.trim()) {
                return this.createEmptyResponse(rawQuery, startTime);
            }

            // Execute searches across all indexes
            const rawResults = searchIndex.searchAll(
                searchTerms,
                entities,
                this.config.maxResultsPerType
            );

            metrics.searchExecutionMs = performance.now() - searchExecutionStart;

            // ============================================
            // STEP 3: Re-ranking (boost by intent)
            // ============================================
            const rerankResults = this.rerankByIntent(rawResults, query);

            // ============================================
            // STEP 4: Answer Synthesis (placeholder for now)
            // ============================================
            const answerSynthesisStart = performance.now();

            // Perform answer synthesis
            const answer = synthesizeAnswer(query, rerankResults, this.config);

            metrics.answerSynthesisMs = performance.now() - answerSynthesisStart;

            // ============================================
            // STEP 5: Build Response
            // ============================================
            metrics.totalTimeMs = performance.now() - startTime;

            const response: SearchResponse = {
                query,
                answer,
                results: rerankResults,
                totalCount: countResults(rerankResults),
                metrics: metrics as SearchMetrics,
                suggestions: this.generateSuggestions(query, rerankResults),
            };

            // Debug logging (use console.debug which can be filtered)
            console.debug(`[CafeFinder] Search: "${rawQuery}" → ${response.totalCount} results in ${metrics.totalTimeMs?.toFixed(1)}ms (${intent.primary})`);

            return response;
        } catch (error) {
            console.error('[CafeFinder] Search failed:', error);
            return this.createEmptyResponse(
                rawQuery,
                startTime,
                error instanceof Error ? error.message : 'Search failed'
            );
        }
    }

    /**
     * Create an empty response (for errors or empty queries)
     */
    private createEmptyResponse(
        rawQuery: string,
        startTime: number,
        errorMessage?: string
    ): SearchResponse {
        const emptyResults = {
            people: [],
            tools: [],
            faqs: [],
            resources: [],
            discussions: [],
            lopSessions: [],
        };

        return {
            query: {
                raw: rawQuery,
                normalized: rawQuery?.toLowerCase?.()?.trim?.() || '',
                tokens: [],
                expandedTokens: [],
                entities: [],
                intent: {
                    primary: 'GENERAL_SEARCH',
                    confidence: 0,
                    secondary: [],
                    queryType: 'KEYWORD',
                    expectedResult: 'MIXED',
                },
            },
            answer: undefined,
            results: emptyResults,
            totalCount: 0,
            metrics: {
                totalTimeMs: performance.now() - startTime,
                queryProcessingMs: 0,
                searchExecutionMs: 0,
                answerSynthesisMs: 0,
                timestamp: new Date().toISOString(),
            },
            suggestions: errorMessage
                ? ['Try a different search', 'Browse all resources']
                : this.generateSuggestions(
                    { raw: rawQuery, normalized: '', tokens: [], expandedTokens: [], entities: [], intent: { primary: 'GENERAL_SEARCH', confidence: 0, secondary: [], queryType: 'KEYWORD', expectedResult: 'MIXED' } },
                    emptyResults
                ),
        };
    }

    /**
     * Re-rank results based on detected intent
     */
    private rerankByIntent(
        results: ReturnType<typeof searchIndex.searchAll>,
        query: SearchQuery
    ): ReturnType<typeof searchIndex.searchAll> {
        const { intent, entities } = query;

        // Apply intent-based boosts
        switch (intent.primary) {
            case 'FIND_PERSON':
            case 'CONTACT_EXPERT':
                // Boost people results
                results.people = results.people.map(r => ({
                    ...r,
                    score: Math.min(r.score * 1.3, 1),
                }));
                break;

            case 'FIND_TOOL':
            case 'TOOL_ACCESS':
                // Boost tool results
                results.tools = results.tools.map(r => ({
                    ...r,
                    score: Math.min(r.score * 1.3, 1),
                }));
                break;

            case 'FIND_FAQ':
            case 'EXPLAIN_CONCEPT':
            case 'LEARN_PROCESS':
                // Boost FAQ results
                results.faqs = results.faqs.map(r => ({
                    ...r,
                    score: Math.min(r.score * 1.3, 1),
                }));
                break;

            case 'FIND_RESOURCE':
            case 'BROWSE':
                // Boost resource results
                results.resources = results.resources.map(r => ({
                    ...r,
                    score: Math.min(r.score * 1.2, 1),
                }));
                break;

            case 'START_DISCUSSION':
                // Boost discussion results
                results.discussions = results.discussions.map(r => ({
                    ...r,
                    score: Math.min(r.score * 1.2, 1),
                }));
                break;
        }

        // Apply entity-based boosts
        for (const entity of entities) {
            if (entity.type === 'PERSON') {
                // If person name detected, boost exact name matches
                results.people = results.people.map(r => {
                    if (r.name.toLowerCase().includes(entity.normalizedValue)) {
                        return { ...r, score: Math.min(r.score * 1.5, 1) };
                    }
                    return r;
                });
            }

            if (entity.type === 'TOOL') {
                // If tool name detected, boost exact tool matches
                results.tools = results.tools.map(r => {
                    if (r.name.toLowerCase().includes(entity.normalizedValue)) {
                        return { ...r, score: Math.min(r.score * 1.5, 1) };
                    }
                    return r;
                });
            }
        }

        // Re-sort each result type by boosted score
        results.people.sort((a, b) => b.score - a.score);
        results.tools.sort((a, b) => b.score - a.score);
        results.faqs.sort((a, b) => b.score - a.score);
        results.resources.sort((a, b) => b.score - a.score);
        results.discussions.sort((a, b) => b.score - a.score);

        return results;
    }

    /**
     * Generate search suggestions
     */
    private generateSuggestions(
        query: SearchQuery,
        results: ReturnType<typeof searchIndex.searchAll>
    ): string[] {
        const suggestions: string[] = [];

        // If no results, suggest related queries
        if (countResults(results) === 0) {
            const { entities } = query;

            if (entities.length > 0) {
                const entity = entities[0];
                if (entity.type === 'TOPIC') {
                    suggestions.push(`${entity.normalizedValue} guide`);
                    suggestions.push(`${entity.normalizedValue} faq`);
                    suggestions.push(`${entity.normalizedValue} expert`);
                }
            }

            suggestions.push('Browse all resources');
            suggestions.push('Start a discussion');
        }

        return suggestions;
    }

    /**
     * Quick search for autocomplete (faster, fewer results)
     */
    quickSearch(rawQuery: string, limit = 5): {
        people: ReturnType<typeof searchIndex.searchPeople>;
        faqs: ReturnType<typeof searchIndex.searchFAQs>;
        resources: ReturnType<typeof searchIndex.searchResources>;
    } {
        if (!this.initialized) this.initialize();

        return {
            people: searchIndex.searchPeople(rawQuery, limit),
            faqs: searchIndex.searchFAQs(rawQuery, limit),
            resources: searchIndex.searchResources(rawQuery, limit),
        };
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const cafeFinder = new CafeFinderEngine();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export { processQuery } from './queryProcessor';
export { classifyIntent, isFindIntent, isActionIntent, isLearnIntent } from './intentClassifier';
export { extractEntities, getEntitiesByType, hasEntityType, getBestEntity } from './entityExtractor';
export { searchIndex, flattenResults, countResults, getTopResult } from './searchIndex';
export { getSynonyms, getCanonical, areSynonyms } from './synonyms';
export * from './types';
