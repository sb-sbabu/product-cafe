/**
 * Points Store - Love Points Engine
 * 
 * Manages point transactions, daily limits, and point history.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    PointAction,
    PointCategory,
    PointTransaction,
    PointActionConfig,
    DailyActionCount,
} from '../types/gamification';

// ============================================================================
// POINT ACTION CONFIGURATION
// ============================================================================

export const POINT_ACTIONS: Record<PointAction, PointActionConfig> = {
    // Discussion Points (💬) - Asking
    ask_question: { action: 'ask_question', points: 5, category: 'discussion', dailyLimit: 10, description: 'Ask a question', recipient: 'actor' },
    question_upvoted_5: { action: 'question_upvoted_5', points: 10, category: 'discussion', description: 'Question receives 5+ upvotes', recipient: 'target' },
    question_upvoted_10: { action: 'question_upvoted_10', points: 25, category: 'discussion', description: 'Question receives 10+ upvotes', recipient: 'target' },
    question_frequently_asked: { action: 'question_frequently_asked', points: 50, category: 'discussion', description: 'Question marked as Frequently Asked', recipient: 'target' },

    // Discussion Points (💬) - Answering
    post_answer: { action: 'post_answer', points: 5, category: 'discussion', dailyLimit: 20, description: 'Post an answer', recipient: 'actor' },
    answer_upvoted: { action: 'answer_upvoted', points: 2, category: 'discussion', description: 'Answer receives upvote', recipient: 'target' },
    answer_accepted: { action: 'answer_accepted', points: 50, category: 'discussion', description: 'Answer marked as Accepted', recipient: 'target' },
    answer_promoted_faq: { action: 'answer_promoted_faq', points: 200, category: 'discussion', description: 'Answer promoted to FAQ', recipient: 'target' },
    answer_best: { action: 'answer_best', points: 100, category: 'discussion', description: 'Chosen as Best Answer', recipient: 'target' },
    first_answer_bonus: { action: 'first_answer_bonus', points: 10, category: 'discussion', dailyLimit: 5, description: 'First answer within 1 hour', recipient: 'actor' },
    expertise_area_bonus: { action: 'expertise_area_bonus', points: 5, category: 'discussion', description: 'Answer in your expertise area', recipient: 'actor' },
    answer_upvoted_10: { action: 'answer_upvoted_10', points: 50, category: 'discussion', description: 'Answer with 10+ upvotes', recipient: 'target' },

    // Voting & Reactions (🗳️)
    give_upvote: { action: 'give_upvote', points: 1, category: 'community', dailyLimit: 30, description: 'Upvote an answer', recipient: 'actor' },
    give_reaction: { action: 'give_reaction', points: 1, category: 'community', dailyLimit: 50, description: 'Give a reaction', recipient: 'actor' },
    receive_reaction: { action: 'receive_reaction', points: 1, category: 'community', description: 'Receive a reaction', recipient: 'target' },
    vote_on_accepted: { action: 'vote_on_accepted', points: 2, category: 'community', description: 'Your vote is on accepted answer', recipient: 'actor' },

    // Content Points (📚)
    submit_resource: { action: 'submit_resource', points: 10, category: 'content', dailyLimit: 5, description: 'Submit resource suggestion', recipient: 'actor' },
    resource_approved: { action: 'resource_approved', points: 50, category: 'content', description: 'Resource approved and published', recipient: 'target' },
    resource_views_50: { action: 'resource_views_50', points: 25, category: 'content', description: 'Resource gets 50+ views', recipient: 'target' },
    resource_views_100: { action: 'resource_views_100', points: 50, category: 'content', description: 'Resource gets 100+ views', recipient: 'target' },
    report_outdated: { action: 'report_outdated', points: 20, category: 'content', dailyLimit: 10, description: 'Report outdated content (confirmed)', recipient: 'actor' },

    // LOP Points (🎙️)
    submit_lop_topic: { action: 'submit_lop_topic', points: 10, category: 'lop', dailyLimit: 3, description: 'Submit LOP topic suggestion', recipient: 'actor' },
    topic_upvoted_10: { action: 'topic_upvoted_10', points: 25, category: 'lop', description: 'Topic suggestion gets 10+ votes', recipient: 'target' },
    topic_scheduled: { action: 'topic_scheduled', points: 100, category: 'lop', description: 'Topic gets scheduled', recipient: 'target' },
    speak_at_lop: { action: 'speak_at_lop', points: 500, category: 'lop', description: 'Speak at LOP session', recipient: 'actor' },
    lop_views_50: { action: 'lop_views_50', points: 100, category: 'lop', description: 'LOP session gets 50+ views', recipient: 'target' },
    watch_lop: { action: 'watch_lop', points: 5, category: 'lop', dailyLimit: 3, description: 'Watch complete LOP session', recipient: 'actor' },
    complete_learning_path: { action: 'complete_learning_path', points: 50, category: 'lop', description: 'Complete LOP learning path', recipient: 'actor' },

    // Community Points (🤝)
    welcome_member: { action: 'welcome_member', points: 5, category: 'community', dailyLimit: 5, description: 'Welcome a new member', recipient: 'actor' },
    mentor_tag: { action: 'mentor_tag', points: 20, category: 'community', dailyLimit: 10, description: 'Mentor tag (helping new hires)', recipient: 'actor' },
    invite_colleague: { action: 'invite_colleague', points: 2, category: 'community', dailyLimit: 10, description: 'Invite colleague to discussion', recipient: 'actor' },
    profile_completed: { action: 'profile_completed', points: 25, category: 'community', description: 'Profile completed', recipient: 'actor' },
    first_contribution: { action: 'first_contribution', points: 10, category: 'community', description: 'First contribution', recipient: 'actor' },
};

// ============================================================================
// STORE STATE
// ============================================================================

interface PointsStoreState {
    // State
    totalPoints: number;
    pointsByCategory: Record<PointCategory, number>;
    history: PointTransaction[];
    dailyActionCounts: DailyActionCount;
    lastResetDate: string;

    // Actions
    awardPoints: (action: PointAction, context?: PointTransaction['context']) => {
        success: boolean;
        points: number;
        reason?: string;
        newTotal: number;
    };
    getPointsForAction: (action: PointAction) => number;
    checkDailyLimit: (action: PointAction) => boolean;
    resetDailyLimits: () => void;
    getHistory: (limit?: number) => PointTransaction[];
    getTotalPoints: () => number;
    getPointsByCategory: () => Record<PointCategory, number>;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const usePointsStore = create<PointsStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            totalPoints: 0,
            pointsByCategory: {
                discussion: 0,
                content: 0,
                community: 0,
                lop: 0,
            },
            history: [],
            dailyActionCounts: {},
            lastResetDate: new Date().toISOString().split('T')[0],

            // Award points for an action
            awardPoints: (action, context) => {
                const config = POINT_ACTIONS[action];
                if (!config) {
                    return { success: false, points: 0, reason: 'Unknown action', newTotal: get().totalPoints };
                }

                // Check daily limit
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                // Reset daily counts if new day
                if (state.lastResetDate !== today) {
                    set({ dailyActionCounts: {}, lastResetDate: today });
                }

                if (config.dailyLimit) {
                    const currentCount = get().dailyActionCounts[action] || 0;
                    if (currentCount >= config.dailyLimit) {
                        return {
                            success: false,
                            points: 0,
                            reason: `Daily limit reached (${config.dailyLimit})`,
                            newTotal: get().totalPoints
                        };
                    }
                }

                // Create transaction
                const transaction: PointTransaction = {
                    id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    recipientId: 'current_user', // Will be replaced with actual user ID
                    action,
                    points: config.points,
                    timestamp: new Date().toISOString(),
                    context,
                };

                // Update state
                set((state) => ({
                    totalPoints: state.totalPoints + config.points,
                    pointsByCategory: {
                        ...state.pointsByCategory,
                        [config.category]: state.pointsByCategory[config.category] + config.points,
                    },
                    history: [transaction, ...state.history].slice(0, 1000), // Keep last 1000 transactions
                    dailyActionCounts: {
                        ...state.dailyActionCounts,
                        [action]: (state.dailyActionCounts[action] || 0) + 1,
                    },
                }));

                return {
                    success: true,
                    points: config.points,
                    newTotal: get().totalPoints
                };
            },

            // Get points for an action
            getPointsForAction: (action) => {
                return POINT_ACTIONS[action]?.points || 0;
            },

            // Check if daily limit is reached
            checkDailyLimit: (action) => {
                const config = POINT_ACTIONS[action];
                if (!config?.dailyLimit) return true; // No limit

                const currentCount = get().dailyActionCounts[action] || 0;
                return currentCount < config.dailyLimit;
            },

            // Reset daily limits
            resetDailyLimits: () => {
                set({
                    dailyActionCounts: {},
                    lastResetDate: new Date().toISOString().split('T')[0]
                });
            },

            // Get history
            getHistory: (limit = 50) => {
                return get().history.slice(0, limit);
            },

            // Get total points
            getTotalPoints: () => get().totalPoints,

            // Get points by category
            getPointsByCategory: () => get().pointsByCategory,
        }),
        {
            name: 'cafe-points',
        }
    )
);
