/**
 * Badge Store - Achievement System
 * 
 * Manages badge awards, progress tracking, and eligibility checking.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    BadgeDefinition,
    EarnedBadge,
    BadgeProgress,
} from '../types/gamification';
import {
    ALL_BADGES,
    MILESTONE_BADGES,
    DOMAIN_BADGES,
} from '../types/gamification';

// ============================================================================
// USER STATS INTERFACE (for badge checking)
// ============================================================================

export interface UserStats {
    questionsAsked: number;
    answersPosted: number;
    acceptedAnswers: number;
    faqsCreated: number;
    lopSessionsWatched: number;
    lopSessionsSpoken: number;
    welcomes: number;
    mentoredUsers: number;
    domainContributions: Record<string, number>;
}

// ============================================================================
// STORE STATE
// ============================================================================

interface BadgeStoreState {
    // State
    earnedBadges: EarnedBadge[];
    badgeProgress: Record<string, BadgeProgress>;
    recentlyEarnedBadge: BadgeDefinition | null;

    // Actions
    checkAndAwardBadges: (stats: UserStats) => BadgeDefinition[];
    awardBadge: (badgeId: string, context?: EarnedBadge['context']) => boolean;
    hasBadge: (badgeId: string) => boolean;
    getBadgeProgress: (badgeId: string, stats: UserStats) => BadgeProgress | null;
    getAllProgress: (stats: UserStats) => BadgeProgress[];
    getEarnedBadges: () => EarnedBadge[];
    getBadgeById: (badgeId: string) => BadgeDefinition | null;
    getEarnedBadgeDefinitions: () => BadgeDefinition[];
    clearRecentBadge: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatValue(stats: UserStats, metric: string): number {
    switch (metric) {
        case 'questions_asked': return stats.questionsAsked;
        case 'answers_posted': return stats.answersPosted;
        case 'accepted_answers': return stats.acceptedAnswers;
        case 'faqs_created': return stats.faqsCreated;
        case 'lop_sessions_watched': return stats.lopSessionsWatched;
        case 'lop_sessions_spoken': return stats.lopSessionsSpoken;
        case 'welcomes': return stats.welcomes;
        case 'mentored_users': return stats.mentoredUsers;
        default: return 0;
    }
}

function checkBadgeEligibility(badge: BadgeDefinition, stats: UserStats): boolean {
    const req = badge.requirement;

    switch (req.type) {
        case 'count':
            return getStatValue(stats, req.metric) >= req.threshold;

        case 'domain':
            return (stats.domainContributions[req.domain] || 0) >= req.acceptedCount;

        case 'one_time':
            // One-time badges are awarded directly, not checked
            return false;

        case 'special':
            // Special badges require manual checking
            return false;

        default:
            return false;
    }
}

function calculateBadgeProgress(badge: BadgeDefinition, stats: UserStats): BadgeProgress | null {
    const req = badge.requirement;

    if (req.type === 'count') {
        const current = getStatValue(stats, req.metric);
        const target = req.threshold;
        return {
            badgeId: badge.id,
            currentValue: current,
            targetValue: target,
            percentComplete: Math.min(100, Math.round((current / target) * 100)),
        };
    }

    if (req.type === 'domain') {
        const current = stats.domainContributions[req.domain] || 0;
        const target = req.acceptedCount;
        return {
            badgeId: badge.id,
            currentValue: current,
            targetValue: target,
            percentComplete: Math.min(100, Math.round((current / target) * 100)),
        };
    }

    return null;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useBadgeStore = create<BadgeStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            earnedBadges: [],
            badgeProgress: {},
            recentlyEarnedBadge: null,

            // Check all badges and award any newly eligible ones
            checkAndAwardBadges: (stats) => {
                const newlyEarned: BadgeDefinition[] = [];

                // Check milestone badges
                for (const badge of MILESTONE_BADGES) {
                    if (!get().hasBadge(badge.id) && checkBadgeEligibility(badge, stats)) {
                        if (get().awardBadge(badge.id)) {
                            newlyEarned.push(badge);
                        }
                    }
                }

                // Check domain badges
                for (const badge of DOMAIN_BADGES) {
                    if (!get().hasBadge(badge.id) && checkBadgeEligibility(badge, stats)) {
                        if (get().awardBadge(badge.id)) {
                            newlyEarned.push(badge);
                        }
                    }
                }

                // Set the most recent badge for celebration
                if (newlyEarned.length > 0) {
                    set({ recentlyEarnedBadge: newlyEarned[newlyEarned.length - 1] });
                }

                return newlyEarned;
            },

            // Award a specific badge
            awardBadge: (badgeId, context) => {
                if (get().hasBadge(badgeId)) {
                    return false; // Already has badge
                }

                const badge = ALL_BADGES.find(b => b.id === badgeId);
                if (!badge) {
                    return false; // Badge doesn't exist
                }

                const earnedBadge: EarnedBadge = {
                    badgeId,
                    earnedAt: new Date().toISOString(),
                    context,
                };

                set((state) => ({
                    earnedBadges: [...state.earnedBadges, earnedBadge],
                    recentlyEarnedBadge: badge,
                }));

                return true;
            },

            // Check if user has a badge
            hasBadge: (badgeId) => {
                return get().earnedBadges.some(b => b.badgeId === badgeId);
            },

            // Get progress for a specific badge
            getBadgeProgress: (badgeId, stats) => {
                const badge = ALL_BADGES.find(b => b.id === badgeId);
                if (!badge) return null;

                if (get().hasBadge(badgeId)) {
                    // Already earned - 100%
                    const req = badge.requirement;
                    const target = req.type === 'count' ? req.threshold :
                        req.type === 'domain' ? req.acceptedCount : 1;
                    return {
                        badgeId,
                        currentValue: target,
                        targetValue: target,
                        percentComplete: 100,
                    };
                }

                return calculateBadgeProgress(badge, stats);
            },

            // Get progress for all trackable badges
            getAllProgress: (stats) => {
                const progress: BadgeProgress[] = [];

                for (const badge of ALL_BADGES) {
                    const p = get().getBadgeProgress(badge.id, stats);
                    if (p) {
                        progress.push(p);
                    }
                }

                return progress;
            },

            // Get all earned badges
            getEarnedBadges: () => get().earnedBadges,

            // Get badge definition by ID
            getBadgeById: (badgeId) => ALL_BADGES.find(b => b.id === badgeId) || null,

            // Get earned badge definitions (with full details)
            getEarnedBadgeDefinitions: () => {
                return get().earnedBadges
                    .map(eb => ALL_BADGES.find(b => b.id === eb.badgeId))
                    .filter((b): b is BadgeDefinition => b !== undefined);
            },

            // Clear recent badge after celebration
            clearRecentBadge: () => {
                set({ recentlyEarnedBadge: null });
            },
        }),
        {
            name: 'cafe-badges',
        }
    )
);
