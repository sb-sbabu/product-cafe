/**
 * Toast X - Custom Hooks
 * React hooks for accessing store state with proper memoization
 * 
 * IMPORTANT: These hooks use selectors to prevent unnecessary re-renders.
 * This is a key 10X improvement over the original TOAST implementation.
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useToastXStore } from '../store';
import type {
    Recognition,
    RecognitionType,
    CompanyValue,
    ReactionType,
    ToastUser,
} from '../types';
import type { AntiGamingCheckResult } from '../constants';

// ═══════════════════════════════════════════════════════════════════════════
// CURRENT USER HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the current user without causing unnecessary re-renders
 */
export const useCurrentUser = () => {
    return useToastXStore(
        useShallow((state) => {
            const user = state.users.get(state.currentUserId);
            return user || null;
        })
    );
};

/**
 * Get current user stats only
 */
export const useCurrentUserStats = () => {
    return useToastXStore(
        useShallow((state) => {
            const user = state.users.get(state.currentUserId);
            if (!user) return null;
            return {
                credits: user.credits,
                creditsThisMonth: user.creditsThisMonth,
                recognitionsGiven: user.recognitionsGiven,
                recognitionsReceived: user.recognitionsReceived,
                dailyQuickToasts: user.dailyQuickToasts,
                dailyStandingOvations: user.dailyStandingOvations,
            };
        })
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// RECOGNITION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get a single recognition by ID
 */
export const useRecognition = (id: string): Recognition | undefined => {
    return useToastXStore(
        useShallow((state) => state.recognitions.find((r) => r.id === id))
    );
};

/**
 * Get recent recognitions with limit
 */
export const useRecentRecognitions = (limit: number = 10) => {
    return useToastXStore(
        useShallow((state) => state.recognitions.slice(0, limit))
    );
};

/**
 * Get recognitions for the feed with current filter
 */
export const useFeedRecognitions = () => {
    const feedFilter = useToastXStore((state) => state.feedFilter);
    const currentUser = useToastXStore((state) => state.users.get(state.currentUserId));

    return useToastXStore(
        useShallow((state) => {
            switch (feedFilter) {
                case 'my-team':
                    if (!currentUser?.team) return state.recognitions;
                    return state.recognitions.filter((r) =>
                        r.recipients.some((rec) => rec.team === currentUser.team) ||
                        state.users.get(r.giverId)?.team === currentUser.team
                    );
                case 'following':
                    // Placeholder - would need following list
                    return state.recognitions;
                case 'monthly-winners':
                    return state.recognitions.filter((r) => r.nominatedForMonthly);
                default:
                    return state.recognitions.filter((r) => !r.isPrivate);
            }
        })
    );
};

/**
 * Get recognition actions (for event handlers)
 */
export const useRecognitionActions = () => {
    const store = useToastXStore();

    return useMemo(() => ({
        addReaction: (recognitionId: string, type: ReactionType) => {
            const user = store.getCurrentUser();
            if (!user) return;
            store.addReaction(recognitionId, {
                type,
                userId: user.id,
                userName: user.name,
                createdAt: new Date().toISOString(),
            });
        },
        removeReaction: (recognitionId: string, type: ReactionType) => {
            const user = store.getCurrentUser();
            if (!user) return;
            store.removeReaction(recognitionId, user.id, type);
        },
        addComment: (recognitionId: string, content: string, parentId?: string) => {
            const user = store.getCurrentUser();
            if (!user) return;
            store.addComment(recognitionId, {
                id: `comment-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                userTitle: user.title,
                content,
                createdAt: new Date().toISOString(),
                reactions: [],
                parentId,
                mentions: [],
            });
        },
        deleteComment: store.deleteComment,
        incrementReposts: store.incrementReposts,
        incrementBookmarks: store.incrementBookmarks,
    }), [store]);
};

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-GAMING HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user can create a recognition
 */
export const useCanRecognize = () => {
    const store = useToastXStore();

    return useCallback(
        (recipientId: string, type: RecognitionType): AntiGamingCheckResult => {
            return store.canRecognize(recipientId, type);
        },
        [store]
    );
};

/**
 * Get remaining daily recognitions
 */
export const useDailyLimits = () => {
    return useToastXStore(
        useShallow((state) => {
            const user = state.users.get(state.currentUserId);
            if (!user) return { quickToastsRemaining: 0, standingOvationsRemaining: 0 };
            return {
                quickToastsRemaining: 3 - user.dailyQuickToasts,
                standingOvationsRemaining: 1 - user.dailyStandingOvations,
            };
        })
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE RECOGNITION HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook for creating recognitions
 * Returns the create function and loading state
 */
export const useCreateRecognition = () => {
    const createRecognition = useToastXStore((state) => state.createRecognition);

    return useCallback(
        (input: {
            type: RecognitionType;
            recipientIds: readonly string[];
            value: CompanyValue;
            expertAreas: readonly string[];
            message: string;
            impact?: string;
            imageId: string;
            award?: Parameters<typeof createRecognition>[0]['award'];
            isPrivate?: boolean;
            notifyManagers?: boolean;
            nominatedForMonthly?: boolean;
            chainParentId?: string;
        }) => {
            return createRecognition(input);
        },
        [createRecognition]
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get leaderboard data
 */
export const useLeaderboard = (
    type: 'MOST_RECOGNIZED' | 'MOST_GENEROUS' = 'MOST_RECOGNIZED',
    timeframe: 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'ALL_TIME' = 'THIS_MONTH',
    limit: number = 10
) => {
    const getLeaderboard = useToastXStore((state) => state.getLeaderboard);
    return useMemo(
        () => getLeaderboard(type, timeframe, limit),
        [getLeaderboard, type, timeframe, limit]
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get unread notification count
 */
export const useUnreadNotificationCount = () => {
    return useToastXStore((state) => state.getUnreadCount());
};

/**
 * Get recent notifications
 */
export const useNotifications = (limit: number = 20) => {
    return useToastXStore(
        useShallow((state) => state.notifications.slice(0, limit))
    );
};

/**
 * Get notification actions
 */
export const useNotificationActions = () => {
    const store = useToastXStore();

    return useMemo(() => ({
        markAsRead: store.markAsRead,
        markAllAsRead: store.markAllAsRead,
        deleteNotification: store.deleteNotification,
        clearAll: store.clearAll,
    }), [store]);
};

// ═══════════════════════════════════════════════════════════════════════════
// STATS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get overall stats
 */
export const useToastStats = () => {
    const getStats = useToastXStore((state) => state.getStats);
    return useMemo(() => getStats(), [getStats]);
};

// ═══════════════════════════════════════════════════════════════════════════
// UI STATE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get and set feed filter
 */
export const useFeedFilter = () => {
    const feedFilter = useToastXStore((state) => state.feedFilter);
    const setFeedFilter = useToastXStore((state) => state.setFeedFilter);

    return [feedFilter, setFeedFilter] as const;
};

/**
 * Get user by ID
 */
export const useUser = (userId: string): ToastUser | undefined => {
    return useToastXStore((state) => state.users.get(userId));
};

/**
 * Get all users for search/selection
 */
export const useAllUsers = () => {
    return useToastXStore(
        useShallow((state) => Array.from(state.users.values()))
    );
};
