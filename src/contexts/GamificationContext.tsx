/**
 * Gamification Context - Unified Access
 * 
 * Provides a React context for accessing all gamification stores and utilities.
 */

import React, { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { usePointsStore, POINT_ACTIONS } from '../stores/pointsStore';
import { useLevelStore } from '../stores/levelStore';
import { useBadgeStore, type UserStats } from '../stores/badgeStore';
import { useLeaderboardStore } from '../stores/leaderboardStore';
import type {
    PointAction,
    Level,
    BadgeDefinition,
    PointTransaction,
} from '../types/gamification';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface GamificationContextValue {
    // Points
    totalPoints: number;
    awardPoints: (action: PointAction, context?: PointTransaction['context']) => {
        success: boolean;
        points: number;
        reason?: string;
        leveledUp?: boolean;
        newBadges?: BadgeDefinition[];
    };
    getPointHistory: (limit?: number) => PointTransaction[];

    // Level
    currentLevel: Level;
    levelProgress: { current: number; next: number; percent: number };
    justLeveledUp: boolean;
    clearLevelUp: () => void;

    // Badges
    earnedBadges: BadgeDefinition[];
    recentBadge: BadgeDefinition | null;
    clearRecentBadge: () => void;
    hasBadge: (badgeId: string) => boolean;

    // Leaderboard
    userRank: { allTime: number; monthly: number };
    topContributors: ReturnType<typeof useLeaderboardStore.getState>['allTimeBoard'];

    // Utility
    getActionPoints: (action: PointAction) => number;
    canPerformAction: (action: PointAction) => boolean;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface GamificationProviderProps {
    children: ReactNode;
    userId?: string;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children, userId: _userId }) => {
    // Store hooks
    const pointsStore = usePointsStore();
    const levelStore = useLevelStore();
    const badgeStore = useBadgeStore();
    const leaderboardStore = useLeaderboardStore();

    // Initialize leaderboards on mount
    useEffect(() => {
        leaderboardStore.refreshBoards();
    }, []);

    // Build user stats for badge checking
    const getUserStats = useCallback((): UserStats => {
        // In a real app, this would come from user profile/API
        // For now, we'll derive from point history
        const history = pointsStore.history;

        return {
            questionsAsked: history.filter(t => t.action === 'ask_question').length,
            answersPosted: history.filter(t => t.action === 'post_answer').length,
            acceptedAnswers: history.filter(t => t.action === 'answer_accepted').length,
            faqsCreated: history.filter(t => t.action === 'answer_promoted_faq').length,
            lopSessionsWatched: history.filter(t => t.action === 'watch_lop').length,
            lopSessionsSpoken: history.filter(t => t.action === 'speak_at_lop').length,
            welcomes: history.filter(t => t.action === 'welcome_member').length,
            mentoredUsers: history.filter(t => t.action === 'mentor_tag').length,
            domainContributions: {}, // Would come from tagged answers
        };
    }, [pointsStore.history]);

    // Enhanced award points function
    const awardPoints = useCallback((action: PointAction, context?: PointTransaction['context']) => {
        // Award points
        const result = pointsStore.awardPoints(action, context);

        if (!result.success) {
            return {
                success: false,
                points: 0,
                reason: result.reason,
            };
        }

        // Check for level up
        const levelResult = levelStore.checkLevelUp();

        // Check for new badges
        const stats = getUserStats();
        const newBadges = badgeStore.checkAndAwardBadges(stats);

        // Award one-time badges based on action
        if (action === 'ask_question' && !badgeStore.hasBadge('first_question')) {
            badgeStore.awardBadge('first_question');
            newBadges.push(badgeStore.getBadgeById('first_question')!);
        }
        if (action === 'post_answer' && !badgeStore.hasBadge('first_answer')) {
            badgeStore.awardBadge('first_answer');
            newBadges.push(badgeStore.getBadgeById('first_answer')!);
        }
        if (action === 'answer_accepted' && !badgeStore.hasBadge('first_accepted')) {
            badgeStore.awardBadge('first_accepted');
            newBadges.push(badgeStore.getBadgeById('first_accepted')!);
        }
        if (action === 'answer_promoted_faq' && !badgeStore.hasBadge('first_faq')) {
            badgeStore.awardBadge('first_faq');
            newBadges.push(badgeStore.getBadgeById('first_faq')!);
        }
        if (action === 'watch_lop' && !badgeStore.hasBadge('first_lop')) {
            badgeStore.awardBadge('first_lop');
            newBadges.push(badgeStore.getBadgeById('first_lop')!);
        }

        return {
            success: true,
            points: result.points,
            leveledUp: levelResult.leveledUp,
            newBadges: newBadges.length > 0 ? newBadges : undefined,
        };
    }, [pointsStore, levelStore, badgeStore, getUserStats]);

    // Context value
    const value: GamificationContextValue = {
        // Points
        totalPoints: pointsStore.totalPoints,
        awardPoints,
        getPointHistory: pointsStore.getHistory,

        // Level
        currentLevel: levelStore.currentLevel,
        levelProgress: levelStore.getLevelProgress(),
        justLeveledUp: levelStore.justLeveledUp,
        clearLevelUp: levelStore.clearLevelUpFlag,

        // Badges
        earnedBadges: badgeStore.getEarnedBadgeDefinitions(),
        recentBadge: badgeStore.recentlyEarnedBadge,
        clearRecentBadge: badgeStore.clearRecentBadge,
        hasBadge: badgeStore.hasBadge,

        // Leaderboard
        userRank: {
            allTime: leaderboardStore.userRank.allTime,
            monthly: leaderboardStore.userRank.monthly,
        },
        topContributors: leaderboardStore.allTimeBoard,

        // Utility
        getActionPoints: (action) => POINT_ACTIONS[action]?.points || 0,
        canPerformAction: pointsStore.checkDailyLimit,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

// ============================================================================
// HOOK
// ============================================================================

export const useGamification = (): GamificationContextValue => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
