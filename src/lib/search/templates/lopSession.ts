/**
 * Template for LOP Session answers
 */

import type { SynthesizedAnswer, LOPSessionResult, SearchQuery } from '../types';

export function generateLopAnswer(
    query: SearchQuery,
    session: LOPSessionResult
): SynthesizedAnswer {
    const isNext = query.intent.primary === 'LOP_NEXT';

    let text = `Searching for LOP sessions about "${query.normalized}".`;

    if (isNext) {
        const date = new Date(session.sessionDate).toLocaleDateString();
        text = `The next Love of Product session is "${session.title}" on ${date}.`;
    }

    return {
        type: 'LOP_SESSION',
        confidence: 0.95,
        text,
        featuredResult: session,
        actions: [
            {
                label: 'Watch Recording',
                url: session.videoUrl || '#',
                icon: 'video',
                primary: true
            },
            {
                label: 'View Slides',
                url: session.slidesUrl || '#',
                icon: 'presentation',
                primary: false
            }
        ],
        sources: []
    };
}
