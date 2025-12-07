/**
 * Template for Concept Explanations
 */

import { SynthesizedAnswer, FAQResult, SearchQuery } from '../types';

export function generateConceptAnswer(
    query: SearchQuery,
    bestMatch: FAQResult
): SynthesizedAnswer {
    // If it's a specific "what is X" question, we treat it as a concept explanation

    return {
        type: 'CONCEPT_EXPLANATION',
        confidence: 0.9,
        text: bestMatch.answer, // Use full answer for concepts usually
        keyPoints: bestMatch.tags, // Using tags as proxy for related concepts
        actions: [],
        sources: [
            {
                title: bestMatch.question,
                url: `/library/concept/${bestMatch.id}`,
                type: 'faq'
            }
        ]
    };
}
