/**
 * Toast X - Awards & Badges Types
 * Recognition honors and milestone achievements
 */

import type { CompanyValue } from './values';

// ═══════════════════════════════════════════════════════════════════════════
// AWARDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Award types - special honors for exceptional value embodiment
 */
export type AwardType =
    // Value Awards (1 per value)
    | 'MAVERICK'           // Do It Differently
    | 'HEARTBEAT'          // Healthcare Is Personal
    | 'BRIDGE_BUILDER'     // Be All In
    | 'OWNER'              // Own The Outcome
    | 'GUARDIAN'           // Do The Right Thing
    | 'EXPLORER'           // Explore Fearlessly
    // Special Awards
    | 'TOAST_OF_THE_MONTH'
    | 'VALUES_CHAMPION'
    | 'GRATITUDE_GURU'
    | 'QUARTERLY_GEM'
    | 'SUNSHINE_AWARD'
    | 'BULLSEYE'
    | 'PUZZLE_MASTER'
    | 'MENTOR_STAR'
    | 'FIRE_STARTER'
    | 'CALM_IN_THE_STORM';

/**
 * Complete award definition
 */
export interface Award {
    readonly type: AwardType;
    readonly name: string;
    readonly description: string;
    readonly icon: string;
    readonly color: string;
    readonly value?: CompanyValue; // Which value this award represents
    readonly isSpecial: boolean;   // Special awards vs value awards
}

/**
 * An earned award instance
 */
export interface EarnedAward {
    readonly award: AwardType;
    readonly recognitionId: string; // Which recognition earned this
    readonly earnedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Milestone badge types - auto-awarded based on activity
 */
export type MilestoneBadge =
    // Giving Milestones
    | 'TOAST_DEBUT'        // First recognition given
    | 'GRATEFUL_DOZEN'     // 12 recognitions given
    | 'TOAST_TREE'         // 50 recognitions given
    | 'MOUNTAIN_TOP'       // 100 recognitions given
    // Receiving Milestones
    | 'FIRST_TOAST'        // First recognition received
    | 'RISING_STAR'        // 10 recognitions received
    | 'STAR_QUALITY'       // 25 recognitions received
    | 'CONSTELLATION'      // 50 recognitions received
    | 'GALAXY'             // 100 recognitions received
    // Anniversary Milestones
    | 'YEAR_ONE'           // 1 year
    | 'TRIPLE'             // 3 years
    | 'HALF_DECADE'        // 5 years
    | 'DIAMOND';           // 10 years

/**
 * Badge category for grouping
 */
export type BadgeCategory = 'giving' | 'receiving' | 'anniversary';

/**
 * Complete badge definition
 */
export interface Badge {
    readonly type: MilestoneBadge;
    readonly name: string;
    readonly description: string;
    readonly icon: string;
    readonly requirement: number;  // Number needed to earn
    readonly category: BadgeCategory;
}

/**
 * An earned badge instance
 */
export interface EarnedBadge {
    readonly badge: MilestoneBadge;
    readonly earnedAt: string;
}

/**
 * Mapping of all badges
 */
export type BadgeDefinitions = Readonly<Record<MilestoneBadge, Badge>>;

/**
 * Mapping of all awards
 */
export type AwardDefinitions = Readonly<Record<AwardType, Award>>;
