/**
 * Café Finder: Main Search Engine
 * Orchestrates query processing, intent classification, search, and ranking
 */

import type {
    SearchQuery,
    SearchResponse,
    SearchContext,
    SearchConfig,
    SearchResult,
    SearchMetrics,
    DEFAULT_SEARCH_CONFIG,
} from './types';
import { processQuery } from './queryProcessor';
import { classifyIntent } from './intentClassifier';
import { extractEntities } from './entityExtractor';
import { searchIndex, flattenResults, countResults } from './searchIndex';

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
        if (!this.initialized) this.initialize();

        // Track timing
        const metrics: Partial<SearchMetrics> = {
            timestamp: new Date().toISOString(),
        };

        // ============================================
        // STEP 1: Query Processing
        // ============================================
        const queryProcessingStart = performance.now();

        const processedQuery = processQuery(rawQuery, context);

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

        // Execute searches across all indexes
        const rawResults = searchIndex.searchAll(
            searchTerms,
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

        // TODO: Implement in Phase 3
        const answer = undefined;

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

        console.log(`[CafeFinder] Search completed in ${metrics.totalTimeMs?.toFixed(2)}ms`);
        console.log(`[CafeFinder] Intent: ${intent.primary} (${(intent.confidence * 100).toFixed(0)}%)`);
        console.log(`[CafeFinder] Entities:`, entities.map(e => `${e.type}:${e.normalizedValue}`));
        console.log(`[CafeFinder] Results: ${response.totalCount}`);

        return response;
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
