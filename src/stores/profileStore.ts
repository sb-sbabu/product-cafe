import { create } from 'zustand';
import { useLevelStore } from './levelStore';
import { useBadgeStore } from './badgeStore';
import { usePointsStore } from './pointsStore';
import { useDiscussionStore } from './discussionStore';
import type { Level, EarnedBadge, PointTransaction } from '../types/gamification';

/**
 * Profile Store - Aggregated user profile and contribution stats
 * 
 * Features:
 * - Aggregated gamification stats (points, level, badges)
 * - Contribution history (discussions, replies, reactions)
 * - Profile data for profile page and hover cards
 */

interface UserProfile {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
    title: string;
    team: string;
    joinedAt: string;
}

interface ContributionStats {
    discussionsStarted: number;
    repliesGiven: number;
    acceptedAnswers: number;
    upvotesReceived: number;
    reactionsReceived: number;
    faqsPromoted: number;
}

interface GamificationStats {
    totalPoints: number;
    currentLevel: Level | null;
    earnedBadges: EarnedBadge[];
    allTimeRank: number;
    monthlyRank: number;
}

interface ProfileState {
    // Profile data
    currentUserProfile: UserProfile | null;

    // Stats
    contributionStats: ContributionStats;
    gamificationStats: GamificationStats;

    // Recent activity
    recentTransactions: PointTransaction[];

    // Actions
    loadProfile: (userId: string) => void;
    calculateStats: (userId: string) => ContributionStats;
    getProfileSummary: (userId: string) => {
        profile: UserProfile | null;
        contribution: ContributionStats;
        gamification: GamificationStats;
    };
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
    currentUserProfile: null,
    contributionStats: {
        discussionsStarted: 0,
        repliesGiven: 0,
        acceptedAnswers: 0,
        upvotesReceived: 0,
        reactionsReceived: 0,
        faqsPromoted: 0,
    },
    gamificationStats: {
        totalPoints: 0,
        currentLevel: null,
        earnedBadges: [],
        allTimeRank: 0,
        monthlyRank: 0,
    },
    recentTransactions: [],

    loadProfile: (userId: string) => {
        // Load from stores
        const levelStore = useLevelStore.getState();
        const badgeStore = useBadgeStore.getState();
        const pointsStore = usePointsStore.getState();

        const contributionStats = get().calculateStats(userId);

        set({
            currentUserProfile: {
                userId,
                displayName: 'Current User',
                email: 'user@company.com',
                title: 'Product Manager',
                team: 'Product',
                joinedAt: '2024-01-01T00:00:00Z',
            },
            contributionStats,
            gamificationStats: {
                totalPoints: pointsStore.totalPoints,
                currentLevel: levelStore.currentLevel,
                earnedBadges: badgeStore.earnedBadges,
                allTimeRank: 15, // Mock rank
                monthlyRank: 8,
            },
            recentTransactions: [], // Will be populated when points store has transactions
        });
    },

    calculateStats: (userId: string) => {
        const discussionStore = useDiscussionStore.getState();

        const userDiscussions = discussionStore.discussions.filter(
            d => d.authorId === userId
        );
        const userReplies = discussionStore.replies.filter(
            r => r.authorId === userId
        );

        const acceptedAnswers = userReplies.filter(r => r.isAcceptedAnswer).length;

        const upvotesReceived =
            userDiscussions.reduce((sum, d) => sum + d.upvoteCount, 0) +
            userReplies.reduce((sum, r) => sum + r.upvoteCount, 0);

        const reactionsReceived =
            userDiscussions.reduce((sum, d) => sum + (d.reactions?.length || 0), 0) +
            userReplies.reduce((sum, r) => sum + (r.reactions?.length || 0), 0);

        const faqsPromoted = userDiscussions.filter(d => d.promotedToFAQId).length;

        return {
            discussionsStarted: userDiscussions.length,
            repliesGiven: userReplies.length,
            acceptedAnswers,
            upvotesReceived,
            reactionsReceived,
            faqsPromoted,
        };
    },

    getProfileSummary: (userId: string) => {
        const state = get();
        return {
            profile: state.currentUserProfile?.userId === userId
                ? state.currentUserProfile
                : null,
            contribution: state.calculateStats(userId),
            gamification: state.gamificationStats,
        };
    },
}));
