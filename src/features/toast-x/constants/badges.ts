/**
 * Toast X - Badges Constants
 * All badge definitions frozen for immutability
 */

import type { Badge, MilestoneBadge, BadgeDefinitions, BadgeCategory } from '../types';

/**
 * Complete definitions of all milestone badges
 */
export const BADGES: BadgeDefinitions = Object.freeze({
    // ═══════════════════════════════════════════════════════════════════════
    // GIVING MILESTONES
    // ═══════════════════════════════════════════════════════════════════════
    TOAST_DEBUT: Object.freeze({
        type: 'TOAST_DEBUT' as MilestoneBadge,
        name: 'Toast Debut',
        description: 'First recognition given',
        icon: '🌱',
        requirement: 1,
        category: 'giving' as BadgeCategory,
    }),

    GRATEFUL_DOZEN: Object.freeze({
        type: 'GRATEFUL_DOZEN' as MilestoneBadge,
        name: 'Grateful Dozen',
        description: '12 recognitions given',
        icon: '🌿',
        requirement: 12,
        category: 'giving' as BadgeCategory,
    }),

    TOAST_TREE: Object.freeze({
        type: 'TOAST_TREE' as MilestoneBadge,
        name: 'Toast Tree',
        description: '50 recognitions given',
        icon: '🌳',
        requirement: 50,
        category: 'giving' as BadgeCategory,
    }),

    MOUNTAIN_TOP: Object.freeze({
        type: 'MOUNTAIN_TOP' as MilestoneBadge,
        name: 'Mountain Top',
        description: '100 recognitions given',
        icon: '🏔️',
        requirement: 100,
        category: 'giving' as BadgeCategory,
    }),

    // ═══════════════════════════════════════════════════════════════════════
    // RECEIVING MILESTONES
    // ═══════════════════════════════════════════════════════════════════════
    FIRST_TOAST: Object.freeze({
        type: 'FIRST_TOAST' as MilestoneBadge,
        name: 'First Toast',
        description: 'First recognition received',
        icon: '✨',
        requirement: 1,
        category: 'receiving' as BadgeCategory,
    }),

    RISING_STAR: Object.freeze({
        type: 'RISING_STAR' as MilestoneBadge,
        name: 'Rising Star',
        description: '10 recognitions received',
        icon: '💫',
        requirement: 10,
        category: 'receiving' as BadgeCategory,
    }),

    STAR_QUALITY: Object.freeze({
        type: 'STAR_QUALITY' as MilestoneBadge,
        name: 'Star Quality',
        description: '25 recognitions received',
        icon: '🌟',
        requirement: 25,
        category: 'receiving' as BadgeCategory,
    }),

    CONSTELLATION: Object.freeze({
        type: 'CONSTELLATION' as MilestoneBadge,
        name: 'Constellation',
        description: '50 recognitions received',
        icon: '⭐',
        requirement: 50,
        category: 'receiving' as BadgeCategory,
    }),

    GALAXY: Object.freeze({
        type: 'GALAXY' as MilestoneBadge,
        name: 'Galaxy',
        description: '100 recognitions received',
        icon: '🌌',
        requirement: 100,
        category: 'receiving' as BadgeCategory,
    }),

    // ═══════════════════════════════════════════════════════════════════════
    // ANNIVERSARY MILESTONES
    // ═══════════════════════════════════════════════════════════════════════
    YEAR_ONE: Object.freeze({
        type: 'YEAR_ONE' as MilestoneBadge,
        name: 'Year One',
        description: '1 year work anniversary',
        icon: '🎂',
        requirement: 1,
        category: 'anniversary' as BadgeCategory,
    }),

    TRIPLE: Object.freeze({
        type: 'TRIPLE' as MilestoneBadge,
        name: 'Triple',
        description: '3 year work anniversary',
        icon: '🎊',
        requirement: 3,
        category: 'anniversary' as BadgeCategory,
    }),

    HALF_DECADE: Object.freeze({
        type: 'HALF_DECADE' as MilestoneBadge,
        name: 'Half Decade',
        description: '5 year work anniversary',
        icon: '🏆',
        requirement: 5,
        category: 'anniversary' as BadgeCategory,
    }),

    DIAMOND: Object.freeze({
        type: 'DIAMOND' as MilestoneBadge,
        name: 'Diamond',
        description: '10 year work anniversary',
        icon: '💎',
        requirement: 10,
        category: 'anniversary' as BadgeCategory,
    }),
});

/**
 * Array of all badge types for iteration
 */
export const BADGE_TYPE_LIST: readonly MilestoneBadge[] = Object.freeze([
    'TOAST_DEBUT', 'GRATEFUL_DOZEN', 'TOAST_TREE', 'MOUNTAIN_TOP',
    'FIRST_TOAST', 'RISING_STAR', 'STAR_QUALITY', 'CONSTELLATION', 'GALAXY',
    'YEAR_ONE', 'TRIPLE', 'HALF_DECADE', 'DIAMOND',
] as const);

/**
 * Get badges by category
 */
export const GIVING_BADGES: readonly MilestoneBadge[] = Object.freeze([
    'TOAST_DEBUT', 'GRATEFUL_DOZEN', 'TOAST_TREE', 'MOUNTAIN_TOP',
] as const);

export const RECEIVING_BADGES: readonly MilestoneBadge[] = Object.freeze([
    'FIRST_TOAST', 'RISING_STAR', 'STAR_QUALITY', 'CONSTELLATION', 'GALAXY',
] as const);

export const ANNIVERSARY_BADGES: readonly MilestoneBadge[] = Object.freeze([
    'YEAR_ONE', 'TRIPLE', 'HALF_DECADE', 'DIAMOND',
] as const);

/**
 * Get badge definition by type
 */
export const getBadgeDefinition = (type: MilestoneBadge): Badge => {
    return BADGES[type];
};

/**
 * Get the next badge in a category based on current count
 */
export const getNextBadge = (
    category: BadgeCategory,
    currentCount: number
): MilestoneBadge | null => {
    const categoryBadges = Object.values(BADGES)
        .filter(badge => badge.category === category)
        .sort((a, b) => a.requirement - b.requirement);

    for (const badge of categoryBadges) {
        if (badge.requirement > currentCount) {
            return badge.type;
        }
    }
    return null; // All badges earned
};

/**
 * Calculate progress to next badge
 */
export const getBadgeProgress = (
    category: BadgeCategory,
    currentCount: number
): { nextBadge: MilestoneBadge | null; progress: number; remaining: number } => {
    const nextBadge = getNextBadge(category, currentCount);

    if (!nextBadge) {
        return { nextBadge: null, progress: 100, remaining: 0 };
    }

    const badge = BADGES[nextBadge];
    const previousBadges = Object.values(BADGES)
        .filter(b => b.category === category && b.requirement < badge.requirement)
        .sort((a, b) => b.requirement - a.requirement);

    const previousRequirement = previousBadges[0]?.requirement || 0;
    const range = badge.requirement - previousRequirement;
    const progress = Math.min(100, ((currentCount - previousRequirement) / range) * 100);
    const remaining = badge.requirement - currentCount;

    return { nextBadge, progress, remaining };
};
