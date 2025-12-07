/**
 * Template for person search results
 */

import type { SynthesizedAnswer, PersonResult, SearchQuery } from '../types';

export function generatePersonAnswer(
    query: SearchQuery,
    person: PersonResult
): SynthesizedAnswer {
    // const isSelf = query.raw.toLowerCase().includes('my '); // Unused for now

    return {
        type: 'PERSON_CARD',
        confidence: 0.95,
        text: `Here is the contact information for ${person.name}.`,
        featuredResult: person,
        actions: [
            {
                label: 'Start Chat',
                url: person.teamsDeepLink || '#',
                icon: 'message',
                primary: true
            },
            {
                label: 'View Profile',
                url: `/profile/${person.id}`,
                icon: 'user',
                primary: false
            },
            {
                label: 'Email',
                url: `mailto:${person.email}`,
                icon: 'mail',
                primary: false
            }
        ],
        sources: []
    };
}
