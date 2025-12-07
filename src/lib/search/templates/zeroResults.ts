/**
 * Template for Zero Results
 */

import { SynthesizedAnswer, SearchQuery } from '../types';

export function generateZeroResultsAnswer(
    query: SearchQuery
): SynthesizedAnswer {
    return {
        type: 'ZERO_RESULTS',
        confidence: 1.0,
        text: `I couldn't find any exact matches for "${query.raw}".`,
        actions: [
            {
                label: 'Start a Discussion',
                url: `/discuss/new?topic=${encodeURIComponent(query.raw)}`,
                icon: 'message-square',
                primary: true
            },
            {
                label: 'Browse Resource Library',
                url: '/library',
                icon: 'book-open',
                primary: false
            }
        ],
        sources: [],
        steps: [
            'Try checking your spelling',
            'Try simpler keywords',
            'Browse by category in the Library'
        ]
    };
}
