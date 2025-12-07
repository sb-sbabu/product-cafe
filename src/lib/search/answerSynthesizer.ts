/**
 * Café Finder: Answer Synthesizer
 * Generates human-readable answers from search results based on intent
 */

import {
    SearchQuery,
    SearchResponse,
    SynthesizedAnswer,
    SearchConfig
} from './types';
import {
    getTopResult,
    countResults
} from './searchIndex';
import {
    generatePersonAnswer,
    generateToolAnswer,
    generateFAQAnswer,
    generateConceptAnswer,
    generateLopAnswer,
    generateZeroResultsAnswer
} from './templates';

/**
 * Synthesize an answer from the query and results
 */
export function synthesizeAnswer(
    query: SearchQuery,
    results: SearchResponse['results'],
    config: SearchConfig
): SynthesizedAnswer | undefined {
    if (!config.answerSynthesis) return undefined;

    const topResult = getTopResult(results);
    const resultCount = countResults(results);

    // 1. Handle Zero Results
    if (resultCount === 0 || !topResult) {
        return generateZeroResultsAnswer(query);
    }

    // 2. Intent-specific generation
    const intent = query.intent.primary;
    const scoreThreshold = 0.7; // Minimum score to confidentaly answer

    // If top result is weak, maybe don't generate an instant answer unless it's a direct question
    if (topResult.score < 0.6 && intent !== 'EXPLAIN_CONCEPT') {
        return undefined;
    }

    switch (intent) {
        case 'FIND_PERSON':
        case 'CONTACT_EXPERT':
        case 'FIND_TEAM': // Often maps to a lead person
            if (topResult.type === 'person') {
                return generatePersonAnswer(query, topResult);
            }
            break;

        case 'FIND_TOOL':
        case 'TOOL_ACCESS':
            if (topResult.type === 'tool') {
                return generateToolAnswer(query, topResult);
            }
            // Fallback: If looking for tool but found resource/guide
            if (topResult.type === 'resource' && query.intent.primary === 'TOOL_ACCESS') {
                // Could act as tool answer if we had a generic resource template
            }
            break;

        case 'FIND_FAQ':
            if (topResult.type === 'faq') {
                return generateFAQAnswer(topResult);
            }
            break;

        case 'EXPLAIN_CONCEPT':
        case 'LEARN_PROCESS':
            if (topResult.type === 'faq') {
                return generateConceptAnswer(query, topResult);
            }
            break;

        case 'LOP_NEXT':
        case 'LOP_FIND':
        case 'LOP_SPEAKER':
            if (topResult.type === 'lop_session') {
                return generateLopAnswer(query, topResult);
            }
            break;
    }

    // 3. Fallback to generic Top Result if very high confidence match (e.g. exact name match)
    // and no specific intent handler caught it.
    if (topResult.score > 0.9) {
        if (topResult.type === 'person') return generatePersonAnswer(query, topResult);
        if (topResult.type === 'tool') return generateToolAnswer(query, topResult);
        if (topResult.type === 'faq') return generateFAQAnswer(topResult);
        if (topResult.type === 'lop_session') return generateLopAnswer(query, topResult);
    }

    return undefined;
}
