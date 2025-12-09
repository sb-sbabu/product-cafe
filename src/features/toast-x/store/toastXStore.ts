/**
 * Toast X - Main Store
 * Combines all slices into a single store with persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { createRecognitionSlice, type RecognitionSlice } from './slices/recognitionSlice';
import { createUserSlice, type UserSlice } from './slices/userSlice';
import { createNotificationSlice, type NotificationSlice } from './slices/notificationSlice';
import type {
    Recognition,
    RecognitionType,
    CompanyValue,
    AwardType,
    MilestoneBadge,
} from '../types';
import type { AntiGamingCheckResult } from '../constants';
import {
    CREDIT_VALUES,
    BADGES,
    GIVING_BADGES,
    RECEIVING_BADGES,
} from '../constants';
import {
    generateId,
    sanitizeMessage,
    canRecognize,
    canRecognizeMultiple,
    calculateCredits,
    getStartOfWeek,
    getStartOfMonth,
    getStartOfQuarter,
} from '../utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED STORE TYPE
// ═══════════════════════════════════════════════════════════════════════════

export interface ToastXStore extends RecognitionSlice, UserSlice, NotificationSlice {
    // High-level actions that orchestrate multiple slices
    createRecognition: (input: {
        type: RecognitionType;
        recipientIds: readonly string[];
        value: CompanyValue;
        expertAreas: readonly string[];
        message: string;
        impact?: string;
        imageId: string;
        award?: AwardType;
        isPrivate?: boolean;
        notifyManagers?: boolean;
        nominatedForMonthly?: boolean;
        chainParentId?: string;
    }) => { success: boolean; error?: string; recognitionId?: string };

    // Anti-gaming checks
    canRecognize: (recipientId: string, type: RecognitionType) => AntiGamingCheckResult;
    canRecognizeMultiple: (recipientIds: readonly string[], type: RecognitionType) => AntiGamingCheckResult;

    // Badge checking
    checkAndAwardBadges: (userId: string) => MilestoneBadge[];

    // Leaderboard
    getLeaderboard: (
        type: 'MOST_RECOGNIZED' | 'MOST_GENEROUS',
        timeframe: 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'ALL_TIME',
        limit?: number
    ) => Array<{
        rank: number;
        userId: string;
        userName: string;
        userAvatar?: string;
        score: number;
    }>;

    // Stats
    getStats: () => {
        totalRecognitions: number;
        thisWeek: number;
        thisMonth: number;
        byValue: Record<CompanyValue, number>;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useToastXStore = create<ToastXStore>()(
    devtools(
        persist(
            (set, get, api) => ({
                // Spread all slices
                ...createRecognitionSlice(set, get, api),
                ...createUserSlice(set, get, api),
                ...createNotificationSlice(set, get, api),

                // ───────────────────────────────────────────────────────────────
                // HIGH-LEVEL ORCHESTRATION
                // ───────────────────────────────────────────────────────────────

                createRecognition: (input) => {
                    const state = get();
                    const currentUser = state.getCurrentUser();

                    if (!currentUser) {
                        return { success: false, error: 'User not found' };
                    }

                    // Anti-gaming checks
                    const check = state.canRecognizeMultiple(input.recipientIds, input.type);
                    if (!check.allowed) {
                        return {
                            success: false,
                            error: check.reason || 'Recognition not allowed',
                        };
                    }

                    // Build recipient info
                    const recipients = input.recipientIds.map((id) => {
                        const user = state.getUser(id);
                        return {
                            id,
                            name: user?.name || 'Unknown',
                            avatar: user?.avatar,
                            title: user?.title,
                            team: user?.team,
                        };
                    });

                    // Create recognition
                    const recognitionId = generateId('rec');
                    const recognition: Recognition = {
                        id: recognitionId,
                        type: input.type,
                        giverId: currentUser.id,
                        giverName: currentUser.name,
                        giverAvatar: currentUser.avatar,
                        giverTitle: currentUser.title,
                        recipientIds: [...input.recipientIds],
                        recipients,
                        value: input.value,
                        expertAreas: [...input.expertAreas],
                        message: sanitizeMessage(input.message),
                        impact: input.impact ? sanitizeMessage(input.impact) : undefined,
                        imageId: input.imageId,
                        award: input.award,
                        createdAt: new Date().toISOString(),
                        reactions: [],
                        comments: [],
                        reposts: 0,
                        bookmarks: 0,
                        isPrivate: input.isPrivate || false,
                        notifyManagers: input.notifyManagers || false,
                        nominatedForMonthly: input.nominatedForMonthly || false,
                        chainParentId: input.chainParentId,
                        chainDepth: input.chainParentId ? 1 : 0,
                    };

                    // Add to store
                    state.addRecognition(recognition);

                    // Update giver stats
                    state.incrementRecognitionsGiven();
                    if (input.type === 'QUICK_TOAST') {
                        state.incrementDailyQuickToasts();
                    } else if (input.type === 'STANDING_OVATION') {
                        state.incrementDailyStandingOvations();
                    }

                    // Track recent recipients
                    input.recipientIds.forEach((id) => {
                        state.addRecentRecipient(id);
                        state.incrementRecognitionsReceived(id);
                        state.incrementValueCount(id, input.value);
                    });

                    // Calculate and award credits
                    const creditCalc = calculateCredits(
                        input.type,
                        input.expertAreas.length,
                        !!input.award
                    );

                    // Award giver credits
                    state.addCredits(currentUser.id, creditCalc.giverCredits, 'recognition_given');

                    // Award recipient credits and expert boosts
                    input.recipientIds.forEach((id) => {
                        state.addCredits(id, creditCalc.recipientTotal, 'recognition_received');

                        // Boost expert areas
                        input.expertAreas.forEach((area) => {
                            state.boostExpertArea(id, area.toLowerCase().replace(/\s+/g, '-'), area, CREDIT_VALUES.EXPERT_AREA_BOOST);
                        });
                    });

                    // Check for new badges
                    state.checkAndAwardBadges(currentUser.id);
                    input.recipientIds.forEach((id) => state.checkAndAwardBadges(id));

                    // Send notifications to each recipient
                    input.recipientIds.forEach((_recipientId) => {
                        state.addNotification('RECOGNIZED',
                            `${currentUser.name} recognized you for ${input.value.replace(/_/g, ' ').toLowerCase()}!`,
                            { recognitionId, priority: 'high' }
                        );
                    });

                    return { success: true, recognitionId };
                },

                // ───────────────────────────────────────────────────────────────
                // ANTI-GAMING
                // ───────────────────────────────────────────────────────────────

                canRecognize: (recipientId, type) => {
                    const currentUser = get().getCurrentUser();
                    if (!currentUser) {
                        return { allowed: false, reason: 'User not found' };
                    }
                    return canRecognize(currentUser, recipientId, type);
                },

                canRecognizeMultiple: (recipientIds, type) => {
                    const currentUser = get().getCurrentUser();
                    if (!currentUser) {
                        return { allowed: false, reason: 'User not found' };
                    }
                    return canRecognizeMultiple(currentUser, recipientIds, type);
                },

                // ───────────────────────────────────────────────────────────────
                // BADGES
                // ───────────────────────────────────────────────────────────────

                checkAndAwardBadges: (userId) => {
                    const state = get();
                    const user = state.getUser(userId);
                    if (!user) return [];

                    const newBadges: MilestoneBadge[] = [];
                    const earnedBadgeTypes = user.earnedBadges.map((b) => b.badge);

                    // Check giving badges
                    GIVING_BADGES.forEach((badgeType) => {
                        if (earnedBadgeTypes.includes(badgeType)) return;
                        const badge = BADGES[badgeType];
                        if (user.recognitionsGiven >= badge.requirement) {
                            state.awardBadge(userId, {
                                badge: badgeType,
                                earnedAt: new Date().toISOString(),
                            });
                            newBadges.push(badgeType);
                            state.addNotification('BADGE_EARNED',
                                `You earned the "${badge.name}" badge! ${badge.icon}`,
                                { priority: 'high' }
                            );
                        }
                    });

                    // Check receiving badges
                    RECEIVING_BADGES.forEach((badgeType) => {
                        if (earnedBadgeTypes.includes(badgeType)) return;
                        const badge = BADGES[badgeType];
                        if (user.recognitionsReceived >= badge.requirement) {
                            state.awardBadge(userId, {
                                badge: badgeType,
                                earnedAt: new Date().toISOString(),
                            });
                            newBadges.push(badgeType);
                            state.addNotification('BADGE_EARNED',
                                `You earned the "${badge.name}" badge! ${badge.icon}`,
                                { priority: 'high' }
                            );
                        }
                    });

                    return newBadges;
                },

                // ───────────────────────────────────────────────────────────────
                // LEADERBOARD
                // ───────────────────────────────────────────────────────────────

                getLeaderboard: (type, timeframe, limit = 10) => {
                    const state = get();
                    const recognitions = state.recognitions;

                    // Get timeframe start
                    let startDate: Date;
                    switch (timeframe) {
                        case 'THIS_WEEK':
                            startDate = getStartOfWeek();
                            break;
                        case 'THIS_MONTH':
                            startDate = getStartOfMonth();
                            break;
                        case 'THIS_QUARTER':
                            startDate = getStartOfQuarter();
                            break;
                        default:
                            startDate = new Date(0); // All time
                    }

                    // Filter recognitions by timeframe
                    const filteredRecs = recognitions.filter(
                        (r) => new Date(r.createdAt) >= startDate
                    );

                    // Calculate scores
                    const scores = new Map<string, number>();

                    if (type === 'MOST_RECOGNIZED') {
                        filteredRecs.forEach((rec) => {
                            rec.recipientIds.forEach((id) => {
                                scores.set(id, (scores.get(id) || 0) + 1);
                            });
                        });
                    } else {
                        filteredRecs.forEach((rec) => {
                            scores.set(rec.giverId, (scores.get(rec.giverId) || 0) + 1);
                        });
                    }

                    // Sort and build leaderboard
                    return Array.from(scores.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, limit)
                        .map(([userId, score], index) => {
                            const user = state.getUser(userId);
                            return {
                                rank: index + 1,
                                userId,
                                userName: user?.name || 'Unknown',
                                userAvatar: user?.avatar,
                                score,
                            };
                        });
                },

                // ───────────────────────────────────────────────────────────────
                // STATS
                // ───────────────────────────────────────────────────────────────

                getStats: () => {
                    const recognitions = get().recognitions;
                    const weekStart = getStartOfWeek();
                    const monthStart = getStartOfMonth();

                    const byValue: Record<CompanyValue, number> = {
                        DO_IT_DIFFERENTLY: 0,
                        HEALTHCARE_IS_PERSONAL: 0,
                        BE_ALL_IN: 0,
                        OWN_THE_OUTCOME: 0,
                        DO_THE_RIGHT_THING: 0,
                        EXPLORE_FEARLESSLY: 0,
                    };

                    let thisWeek = 0;
                    let thisMonth = 0;

                    recognitions.forEach((rec) => {
                        byValue[rec.value]++;
                        const date = new Date(rec.createdAt);
                        if (date >= weekStart) thisWeek++;
                        if (date >= monthStart) thisMonth++;
                    });

                    return {
                        totalRecognitions: recognitions.length,
                        thisWeek,
                        thisMonth,
                        byValue,
                    };
                },
            }),
            {
                name: 'toast-x-storage',
                partialize: (state) => ({
                    recognitions: state.recognitions,
                    users: Array.from(state.users.entries()),
                    notifications: state.notifications,
                }),
                merge: (persisted: any, current) => ({
                    ...current,
                    recognitions: persisted?.recognitions || current.recognitions,
                    users: persisted?.users
                        ? new Map(persisted.users)
                        : current.users,
                    notifications: persisted?.notifications || current.notifications,
                }),
            }
        ),
        { name: 'ToastXStore' }
    )
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPED SELECTORS (for use with shallow comparison)
// ═══════════════════════════════════════════════════════════════════════════

export const selectRecognitions = (state: ToastXStore) => state.recognitions;
export const selectCurrentUser = (state: ToastXStore) => state.getCurrentUser();
export const selectNotifications = (state: ToastXStore) => state.notifications;
export const selectFeedFilter = (state: ToastXStore) => state.feedFilter;
