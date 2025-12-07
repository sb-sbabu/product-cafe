/**
 * Template for FAQ answers
 */

import { SynthesizedAnswer, FAQResult } from '../types';

export function generateFAQAnswer(
    faq: FAQResult
): SynthesizedAnswer {
    return {
        type: 'INSTANT_ANSWER',
        confidence: 0.85,
        text: faq.answerSummary || faq.answer,
        actions: [
            {
                label: 'Read Full FAQ',
                url: `/support/faq/${faq.id}`,
                icon: 'help-circle',
                primary: false
            }
        ],
        sources: [
            {
                title: faq.question,
                url: `/support/faq/${faq.id}`,
                type: 'faq'
            }
        ]
    };
}
