/**
 * Toast X - Company Values Constants
 * The 6 core values with complete definitions
 * Frozen for immutability
 */

import type { CompanyValue, ValueDefinition, ValueDefinitions } from '../types';

/**
 * Complete definitions of all company values
 * Used throughout Toast X for recognition anchoring
 */
export const COMPANY_VALUES: ValueDefinitions = Object.freeze({
    DO_IT_DIFFERENTLY: Object.freeze({
        id: 'DO_IT_DIFFERENTLY' as CompanyValue,
        name: 'We Do It Differently',
        shortName: 'Do It Differently',
        description: 'We question assumptions, redefine the industry standard, and create unexpected solutions using a holistic perspective and bold approach.',
        icon: '🚀',
        color: '#845EC2',
        gradient: 'linear-gradient(135deg, #845EC2 0%, #D65DB1 100%)',
        awardName: 'The Maverick',
        awardIcon: '🎨',
        behaviors: Object.freeze([
            'Challenged the status quo',
            'Proposed an unconventional solution',
            'Brought a fresh perspective that changed thinking',
            'Took a bold risk that paid off',
            'Questioned "the way we\'ve always done it"',
        ]),
    }),

    HEALTHCARE_IS_PERSONAL: Object.freeze({
        id: 'HEALTHCARE_IS_PERSONAL' as CompanyValue,
        name: 'Healthcare Is Personal',
        shortName: 'Healthcare Is Personal',
        description: 'We consider patient experience in every decision we make, and we connect the dots between payers and providers.',
        icon: '💜',
        color: '#FF6B6B',
        gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFB4A2 100%)',
        awardName: 'The Heartbeat',
        awardIcon: '💗',
        behaviors: Object.freeze([
            'Put the patient at the center of a decision',
            'Went beyond the requirement to improve patient experience',
            'Connected payer-provider dots in a meaningful way',
            'Showed deep empathy in their work',
            'Made healthcare less confusing for real people',
        ]),
    }),

    BE_ALL_IN: Object.freeze({
        id: 'BE_ALL_IN' as CompanyValue,
        name: 'Be All In',
        shortName: 'Be All In',
        description: 'We work across silos and embrace diverse perspectives to tackle hard problems head-on — together. One Team. One Mission. One Availity.',
        icon: '🤝',
        color: '#FFD93D',
        gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF9F1C 100%)',
        awardName: 'The Bridge Builder',
        awardIcon: '🌟',
        behaviors: Object.freeze([
            'Broke down silos to bring teams together',
            'Volunteered to help outside their area',
            'Embraced a perspective different from their own',
            'Demonstrated exceptional teamwork',
            'Put collective success above personal recognition',
        ]),
    }),

    OWN_THE_OUTCOME: Object.freeze({
        id: 'OWN_THE_OUTCOME' as CompanyValue,
        name: 'Own The Outcome',
        shortName: 'Own The Outcome',
        description: '"If not us, then who?" Regardless of our role, we each own the impact on customers, colleagues, and patients.',
        icon: '🎯',
        color: '#26C6DA',
        gradient: 'linear-gradient(135deg, #26C6DA 0%, #00ACC1 100%)',
        awardName: 'The Owner',
        awardIcon: '🦁',
        behaviors: Object.freeze([
            'Took full responsibility without being asked',
            'Saw something broken and fixed it',
            "Didn't pass the buck when things got hard",
            'Delivered impact beyond their job description',
            'Asked "if not me, then who?"',
        ]),
    }),

    DO_THE_RIGHT_THING: Object.freeze({
        id: 'DO_THE_RIGHT_THING' as CompanyValue,
        name: 'Do The Right Thing',
        shortName: 'Do The Right Thing',
        description: 'When we say we are going to do something, we do it with the highest integrity. We earn trust and protect our customers, patients, and each other.',
        icon: '⚖️',
        color: '#4B7BEC',
        gradient: 'linear-gradient(135deg, #4B7BEC 0%, #3498DB 100%)',
        awardName: 'The Guardian',
        awardIcon: '🛡️',
        behaviors: Object.freeze([
            "Spoke up when something wasn't right",
            'Kept their word even when it was hard',
            'Protected customer/patient interests',
            'Chose integrity over the easy path',
            'Demonstrated trustworthiness in a visible way',
        ]),
    }),

    EXPLORE_FEARLESSLY: Object.freeze({
        id: 'EXPLORE_FEARLESSLY' as CompanyValue,
        name: 'Explore Fearlessly',
        shortName: 'Explore Fearlessly',
        description: "We stay curious and don't rest on our laurels. Our passion for continuous learning and data-driven insights gives us the knowledge to create market-leading innovation.",
        icon: '🔭',
        color: '#6BCB77',
        gradient: 'linear-gradient(135deg, #6BCB77 0%, #4ECDC4 100%)',
        awardName: 'The Explorer',
        awardIcon: '🚀',
        behaviors: Object.freeze([
            'Learned something new and shared it',
            'Experimented with a new approach',
            'Used data to discover unexpected insights',
            "Pushed boundaries of what's possible",
            'Stayed curious when others were content',
        ]),
    }),
});

/**
 * Array of all company values for iteration
 */
export const COMPANY_VALUE_LIST: readonly CompanyValue[] = Object.freeze([
    'DO_IT_DIFFERENTLY',
    'HEALTHCARE_IS_PERSONAL',
    'BE_ALL_IN',
    'OWN_THE_OUTCOME',
    'DO_THE_RIGHT_THING',
    'EXPLORE_FEARLESSLY',
] as const);

/**
 * Get a value definition by its ID
 */
export const getValueDefinition = (value: CompanyValue): ValueDefinition => {
    return COMPANY_VALUES[value];
};
