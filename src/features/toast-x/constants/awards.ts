/**
 * Toast X - Awards Constants
 * All award definitions frozen for immutability
 */

import type { Award, AwardType, AwardDefinitions, CompanyValue } from '../types';

/**
 * Complete definitions of all awards
 */
export const AWARDS: AwardDefinitions = Object.freeze({
    // ═══════════════════════════════════════════════════════════════════════
    // VALUE AWARDS (One per value)
    // ═══════════════════════════════════════════════════════════════════════
    MAVERICK: Object.freeze({
        type: 'MAVERICK' as AwardType,
        name: 'The Maverick',
        description: 'For challenging assumptions, bold approaches, and unexpected solutions',
        icon: '🎨',
        color: '#845EC2',
        value: 'DO_IT_DIFFERENTLY' as CompanyValue,
        isSpecial: false,
    }),

    HEARTBEAT: Object.freeze({
        type: 'HEARTBEAT' as AwardType,
        name: 'The Heartbeat',
        description: 'For patient-centered decisions, empathy, and payer-provider connection',
        icon: '💗',
        color: '#FF6B6B',
        value: 'HEALTHCARE_IS_PERSONAL' as CompanyValue,
        isSpecial: false,
    }),

    BRIDGE_BUILDER: Object.freeze({
        type: 'BRIDGE_BUILDER' as AwardType,
        name: 'The Bridge Builder',
        description: 'For exceptional cross-team collaboration and One Team spirit',
        icon: '🌟',
        color: '#FFD93D',
        value: 'BE_ALL_IN' as CompanyValue,
        isSpecial: false,
    }),

    OWNER: Object.freeze({
        type: 'OWNER' as AwardType,
        name: 'The Owner',
        description: 'For taking responsibility, "if not me who?", and driving to results',
        icon: '🦁',
        color: '#26C6DA',
        value: 'OWN_THE_OUTCOME' as CompanyValue,
        isSpecial: false,
    }),

    GUARDIAN: Object.freeze({
        type: 'GUARDIAN' as AwardType,
        name: 'The Guardian',
        description: 'For integrity, speaking up, and protecting customers & patients',
        icon: '🛡️',
        color: '#4B7BEC',
        value: 'DO_THE_RIGHT_THING' as CompanyValue,
        isSpecial: false,
    }),

    EXPLORER: Object.freeze({
        type: 'EXPLORER' as AwardType,
        name: 'The Explorer',
        description: 'For learning, curiosity, innovation, and data-driven insights',
        icon: '🚀',
        color: '#6BCB77',
        value: 'EXPLORE_FEARLESSLY' as CompanyValue,
        isSpecial: false,
    }),

    // ═══════════════════════════════════════════════════════════════════════
    // SPECIAL AWARDS
    // ═══════════════════════════════════════════════════════════════════════
    TOAST_OF_THE_MONTH: Object.freeze({
        type: 'TOAST_OF_THE_MONTH' as AwardType,
        name: 'Toast of the Month',
        description: 'Most impactful recognition of the month',
        icon: '⭐',
        color: '#FFD700',
        isSpecial: true,
    }),

    VALUES_CHAMPION: Object.freeze({
        type: 'VALUES_CHAMPION' as AwardType,
        name: 'Values Champion',
        description: 'Received awards across all 6 values - rare and prestigious',
        icon: '🌈',
        color: '#FF6B6B',
        isSpecial: true,
    }),

    GRATITUDE_GURU: Object.freeze({
        type: 'GRATITUDE_GURU' as AwardType,
        name: 'Gratitude Guru',
        description: 'Given 50+ recognitions to others - celebrating the celebrators',
        icon: '🎁',
        color: '#26C6DA',
        isSpecial: true,
    }),

    QUARTERLY_GEM: Object.freeze({
        type: 'QUARTERLY_GEM' as AwardType,
        name: 'Quarterly Gem',
        description: 'Leadership-selected exceptional contributor',
        icon: '💎',
        color: '#45AAF2',
        isSpecial: true,
    }),

    SUNSHINE_AWARD: Object.freeze({
        type: 'SUNSHINE_AWARD' as AwardType,
        name: 'Sunshine Award',
        description: 'For consistently bringing positivity and lifting others up',
        icon: '🌻',
        color: '#FED330',
        isSpecial: true,
    }),

    BULLSEYE: Object.freeze({
        type: 'BULLSEYE' as AwardType,
        name: 'Bullseye',
        description: 'For exceptional precision and quality in work',
        icon: '🎯',
        color: '#FF4757',
        isSpecial: true,
    }),

    PUZZLE_MASTER: Object.freeze({
        type: 'PUZZLE_MASTER' as AwardType,
        name: 'Puzzle Master',
        description: 'For solving complex, seemingly impossible problems',
        icon: '🧩',
        color: '#5352ED',
        isSpecial: true,
    }),

    MENTOR_STAR: Object.freeze({
        type: 'MENTOR_STAR' as AwardType,
        name: 'Mentor Star',
        description: "For exceptional guidance and support of others' growth",
        icon: '🎓',
        color: '#2F3542',
        isSpecial: true,
    }),

    FIRE_STARTER: Object.freeze({
        type: 'FIRE_STARTER' as AwardType,
        name: 'Fire Starter',
        description: 'For igniting new initiatives that gained momentum',
        icon: '🔥',
        color: '#FF6348',
        isSpecial: true,
    }),

    CALM_IN_THE_STORM: Object.freeze({
        type: 'CALM_IN_THE_STORM' as AwardType,
        name: 'Calm In The Storm',
        description: 'For exceptional composure and leadership during crisis',
        icon: '🌊',
        color: '#2D98DA',
        isSpecial: true,
    }),
});

/**
 * Array of all award types for iteration
 */
export const AWARD_TYPE_LIST: readonly AwardType[] = Object.freeze([
    'MAVERICK', 'HEARTBEAT', 'BRIDGE_BUILDER', 'OWNER', 'GUARDIAN', 'EXPLORER',
    'TOAST_OF_THE_MONTH', 'VALUES_CHAMPION', 'GRATITUDE_GURU', 'QUARTERLY_GEM',
    'SUNSHINE_AWARD', 'BULLSEYE', 'PUZZLE_MASTER', 'MENTOR_STAR',
    'FIRE_STARTER', 'CALM_IN_THE_STORM',
] as const);

/**
 * Get value awards only
 */
export const VALUE_AWARDS: readonly AwardType[] = Object.freeze([
    'MAVERICK', 'HEARTBEAT', 'BRIDGE_BUILDER', 'OWNER', 'GUARDIAN', 'EXPLORER',
] as const);

/**
 * Get special awards only
 */
export const SPECIAL_AWARDS: readonly AwardType[] = Object.freeze([
    'TOAST_OF_THE_MONTH', 'VALUES_CHAMPION', 'GRATITUDE_GURU', 'QUARTERLY_GEM',
    'SUNSHINE_AWARD', 'BULLSEYE', 'PUZZLE_MASTER', 'MENTOR_STAR',
    'FIRE_STARTER', 'CALM_IN_THE_STORM',
] as const);

/**
 * Get award definition by type
 */
export const getAwardDefinition = (type: AwardType): Award => {
    return AWARDS[type];
};

/**
 * Get the award type for a specific company value
 */
export const getAwardForValue = (value: CompanyValue): AwardType | undefined => {
    for (const award of Object.values(AWARDS)) {
        if (award.value === value) {
            return award.type;
        }
    }
    return undefined;
};
