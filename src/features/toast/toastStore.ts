/**
 * Café TOAST - Zustand Store
 * Recognition & Achievements with Anti-Gaming Protection
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Recognition,
    RecognitionType,
    ToastUser,
    CompanyValue,
    ReactionType,
    Reaction,
    Comment,
    ToastNotification,
    LeaderboardEntry,
    LeaderboardType,
    LeaderboardTimeframe,
    EarnedBadge,
    MilestoneBadge,
} from './types';
import {
    CREDIT_VALUES,
    ANTI_GAMING_LIMITS,
} from './types';
import {
    DEMO_RECOGNITIONS,
    DEMO_USERS,
} from './data';

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

interface ToastState {
    // Data
    recognitions: Recognition[];
    users: Map<string, ToastUser>;
    notifications: ToastNotification[];

    // Current user
    currentUserId: string;

    // UI State
    isCreatingRecognition: boolean;
    selectedRecognitionId: string | null;
    feedFilter: 'all' | 'following' | 'my-team' | 'org-wide' | 'monthly-winners';

    // Actions - Recognition
    createRecognition: (recognition: Omit<Recognition, 'id' | 'createdAt' | 'reactions' | 'comments' | 'reposts' | 'bookmarks' | 'chainDepth'>) => { success: boolean; error?: string; recognitionId?: string };
    deleteRecognition: (recognitionId: string) => void;

    // Actions - Social
    addReaction: (recognitionId: string, reactionType: ReactionType) => void;
    removeReaction: (recognitionId: string, reactionType: ReactionType) => void;
    addComment: (recognitionId: string, content: string, parentId?: string, mentions?: string[]) => void;
    deleteComment: (recognitionId: string, commentId: string) => void;
    repostRecognition: (recognitionId: string, message?: string) => void;
    bookmarkRecognition: (recognitionId: string) => void;

    // Actions - Anti-Gaming Checks
    canRecognize: (recipientId: string, type: RecognitionType) => { allowed: boolean; reason?: string };
    checkDailyLimits: (type: RecognitionType) => { allowed: boolean; remaining: number };
    checkCooldown: (recipientId: string) => { allowed: boolean; hoursRemaining?: number };

    // Actions - Credits & Scores
    awardCredits: (recognition: Recognition) => void;
    updateExpertScores: (userId: string, areas: string[], boost: number) => void;

    // Actions - Badges
    checkAndAwardBadges: (userId: string) => MilestoneBadge[];

    // Actions - Leaderboard
    getLeaderboard: (type: LeaderboardType, timeframe: LeaderboardTimeframe, limit?: number) => LeaderboardEntry[];

    // Actions - Notifications
    markNotificationRead: (notificationId: string) => void;
    clearNotifications: () => void;

    // Actions - UI
    setFeedFilter: (filter: ToastState['feedFilter']) => void;
    setSelectedRecognition: (id: string | null) => void;

    // Actions - User
    getUser: (userId: string) => ToastUser | undefined;
    getCurrentUser: () => ToastUser | undefined;
    updateUserProfile: (updates: Partial<ToastUser>) => void;

    // Utilities
    resetDailyLimits: () => void;
    getRecognitionsByUser: (userId: string, type: 'given' | 'received') => Recognition[];
    getStats: () => { total: number; thisWeek: number; thisMonth: number; byValue: Record<CompanyValue, number> };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

const hoursSince = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
};

const getStartOfWeek = (): Date => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
};

const getStartOfMonth = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Initialize users map from demo data
const initializeUsers = (): Map<string, ToastUser> => {
    const map = new Map<string, ToastUser>();
    DEMO_USERS.forEach(user => map.set(user.id, user));
    return map;
};

// ═══════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useToastStore = create<ToastState>()(
    persist(
        (set, get) => ({
            // Initial State
            recognitions: DEMO_RECOGNITIONS,
            users: initializeUsers(),
            notifications: [],
            currentUserId: 'user-3', // Jennifer Martinez (for demo)
            isCreatingRecognition: false,
            selectedRecognitionId: null,
            feedFilter: 'all',

            // ─────────────────────────────────────────────────────────────────
            // CREATE RECOGNITION
            // ─────────────────────────────────────────────────────────────────
            createRecognition: (recognitionData) => {
                const state = get();
                const currentUser = state.users.get(state.currentUserId);

                if (!currentUser) {
                    return { success: false, error: 'User not found' };
                }

                // Check daily limits
                const limitCheck = state.checkDailyLimits(recognitionData.type);
                if (!limitCheck.allowed) {
                    return {
                        success: false,
                        error: `Daily limit reached for ${recognitionData.type}. Try again tomorrow!`
                    };
                }

                // Check cooldown for each recipient
                for (const recipientId of recognitionData.recipientIds) {
                    const cooldownCheck = state.checkCooldown(recipientId);
                    if (!cooldownCheck.allowed) {
                        const recipient = state.users.get(recipientId);
                        return {
                            success: false,
                            error: `Please wait ${cooldownCheck.hoursRemaining} more hours before recognizing ${recipient?.name || 'this person'} again.`
                        };
                    }
                }

                const recognitionId = generateId();
                const recognition: Recognition = {
                    ...recognitionData,
                    id: recognitionId,
                    createdAt: new Date().toISOString(),
                    reactions: [],
                    comments: [],
                    reposts: 0,
                    bookmarks: 0,
                    chainDepth: recognitionData.chainParentId ? 1 : 0,
                };

                set(state => {
                    const newRecognitions = [recognition, ...state.recognitions];

                    // Update giver's daily counts
                    const updatedUsers = new Map(state.users);
                    const giver = updatedUsers.get(state.currentUserId);
                    if (giver) {
                        const updatedGiver = { ...giver };
                        if (recognition.type === 'QUICK_TOAST') {
                            updatedGiver.dailyQuickToasts += 1;
                        } else if (recognition.type === 'STANDING_OVATION') {
                            updatedGiver.dailyStandingOvations += 1;
                        }
                        updatedGiver.recognitionsGiven += 1;

                        // Track recent recipients for cooldown
                        const now = new Date().toISOString();
                        recognition.recipientIds.forEach(recipientId => {
                            const existing = updatedGiver.recentRecipients.find(r => r.userId === recipientId);
                            if (existing) {
                                existing.lastRecognizedAt = now;
                            } else {
                                updatedGiver.recentRecipients.push({
                                    userId: recipientId,
                                    lastRecognizedAt: now,
                                    creditsFromThisMonth: 0,
                                });
                            }
                        });

                        updatedUsers.set(state.currentUserId, updatedGiver);
                    }

                    return {
                        recognitions: newRecognitions,
                        users: updatedUsers,
                    };
                });

                // Award credits (after state update)
                get().awardCredits(recognition);

                // Check for new badges
                get().checkAndAwardBadges(state.currentUserId);
                recognition.recipientIds.forEach(id => get().checkAndAwardBadges(id));

                return { success: true, recognitionId };
            },

            // ─────────────────────────────────────────────────────────────────
            // DELETE RECOGNITION
            // ─────────────────────────────────────────────────────────────────
            deleteRecognition: (recognitionId) => {
                set(state => ({
                    recognitions: state.recognitions.filter(r => r.id !== recognitionId),
                }));
            },

            // ─────────────────────────────────────────────────────────────────
            // SOCIAL INTERACTIONS
            // ─────────────────────────────────────────────────────────────────
            addReaction: (recognitionId, reactionType) => {
                const state = get();
                const currentUser = state.users.get(state.currentUserId);
                if (!currentUser) return;

                set(state => ({
                    recognitions: state.recognitions.map(rec => {
                        if (rec.id !== recognitionId) return rec;

                        // Check if already reacted with this type
                        const hasReacted = rec.reactions.some(
                            r => r.userId === state.currentUserId && r.type === reactionType
                        );
                        if (hasReacted) return rec;

                        const newReaction: Reaction = {
                            type: reactionType,
                            userId: state.currentUserId,
                            userName: currentUser.name,
                            createdAt: new Date().toISOString(),
                        };

                        return {
                            ...rec,
                            reactions: [...rec.reactions, newReaction],
                        };
                    }),
                }));
            },

            removeReaction: (recognitionId, reactionType) => {
                set(state => ({
                    recognitions: state.recognitions.map(rec => {
                        if (rec.id !== recognitionId) return rec;
                        return {
                            ...rec,
                            reactions: rec.reactions.filter(
                                r => !(r.userId === state.currentUserId && r.type === reactionType)
                            ),
                        };
                    }),
                }));
            },

            addComment: (recognitionId, content, parentId, mentions = []) => {
                const state = get();
                const currentUser = state.users.get(state.currentUserId);
                if (!currentUser) return;

                const comment: Comment = {
                    id: generateId(),
                    userId: state.currentUserId,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    userTitle: currentUser.title,
                    content,
                    createdAt: new Date().toISOString(),
                    reactions: [],
                    parentId,
                    mentions,
                };

                set(state => ({
                    recognitions: state.recognitions.map(rec => {
                        if (rec.id !== recognitionId) return rec;
                        return {
                            ...rec,
                            comments: [...rec.comments, comment],
                        };
                    }),
                }));
            },

            deleteComment: (recognitionId, commentId) => {
                set(state => ({
                    recognitions: state.recognitions.map(rec => {
                        if (rec.id !== recognitionId) return rec;
                        return {
                            ...rec,
                            comments: rec.comments.filter(c => c.id !== commentId),
                        };
                    }),
                }));
            },

            repostRecognition: (recognitionId) => {
                set(state => ({
                    recognitions: state.recognitions.map(rec => {
                        if (rec.id !== recognitionId) return rec;
                        return { ...rec, reposts: rec.reposts + 1 };
                    }),
                }));
            },

            bookmarkRecognition: (recognitionId) => {
                set(state => ({
                    recognitions: state.recognitions.map(rec => {
                        if (rec.id !== recognitionId) return rec;
                        return { ...rec, bookmarks: rec.bookmarks + 1 };
                    }),
                }));
            },

            // ─────────────────────────────────────────────────────────────────
            // ANTI-GAMING CHECKS
            // ─────────────────────────────────────────────────────────────────
            canRecognize: (recipientId, type) => {
                const limitCheck = get().checkDailyLimits(type);
                if (!limitCheck.allowed) {
                    return { allowed: false, reason: `Daily limit reached for ${type}` };
                }

                const cooldownCheck = get().checkCooldown(recipientId);
                if (!cooldownCheck.allowed) {
                    return {
                        allowed: false,
                        reason: `Wait ${cooldownCheck.hoursRemaining}h before recognizing this person again`
                    };
                }

                return { allowed: true };
            },

            checkDailyLimits: (type) => {
                const state = get();
                const currentUser = state.users.get(state.currentUserId);
                if (!currentUser) return { allowed: false, remaining: 0 };

                // Reset if new day
                if (!isToday(currentUser.lastRecognitionReset)) {
                    get().resetDailyLimits();
                    return {
                        allowed: true,
                        remaining: type === 'QUICK_TOAST'
                            ? ANTI_GAMING_LIMITS.DAILY_QUICK_TOASTS
                            : ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS
                    };
                }

                if (type === 'QUICK_TOAST') {
                    const remaining = ANTI_GAMING_LIMITS.DAILY_QUICK_TOASTS - currentUser.dailyQuickToasts;
                    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
                } else if (type === 'STANDING_OVATION') {
                    const remaining = ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS - currentUser.dailyStandingOvations;
                    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
                }

                return { allowed: true, remaining: 999 };
            },

            checkCooldown: (recipientId) => {
                const state = get();
                const currentUser = state.users.get(state.currentUserId);
                if (!currentUser) return { allowed: false, hoursRemaining: 24 };

                const recentRecipient = currentUser.recentRecipients.find(r => r.userId === recipientId);
                if (!recentRecipient) return { allowed: true };

                const hoursPassed = hoursSince(recentRecipient.lastRecognizedAt);
                if (hoursPassed >= ANTI_GAMING_LIMITS.SAME_PERSON_COOLDOWN_HOURS) {
                    return { allowed: true };
                }

                return {
                    allowed: false,
                    hoursRemaining: Math.ceil(ANTI_GAMING_LIMITS.SAME_PERSON_COOLDOWN_HOURS - hoursPassed)
                };
            },

            // ─────────────────────────────────────────────────────────────────
            // CREDITS & SCORES
            // ─────────────────────────────────────────────────────────────────
            awardCredits: (recognition) => {
                set(state => {
                    const updatedUsers = new Map(state.users);

                    // Determine credit values based on type
                    let recipientCredits = 0;
                    let giverCredits = 0;

                    switch (recognition.type) {
                        case 'QUICK_TOAST':
                            recipientCredits = CREDIT_VALUES.QUICK_TOAST_RECIPIENT;
                            giverCredits = CREDIT_VALUES.QUICK_TOAST_GIVER;
                            break;
                        case 'STANDING_OVATION':
                            recipientCredits = CREDIT_VALUES.STANDING_OVATION_RECIPIENT;
                            giverCredits = CREDIT_VALUES.STANDING_OVATION_GIVER;
                            break;
                        case 'TEAM_TOAST':
                            recipientCredits = CREDIT_VALUES.TEAM_TOAST_RECIPIENT;
                            giverCredits = CREDIT_VALUES.TEAM_TOAST_GIVER;
                            break;
                        default:
                            break;
                    }

                    // Award to recipients
                    recognition.recipientIds.forEach(recipientId => {
                        const recipient = updatedUsers.get(recipientId);
                        if (recipient) {
                            // Check for monthly cap from single person
                            const giverEntry = recipient.recentRecipients.find(r => r.userId === recognition.giverId);
                            let finalCredits = recipientCredits;

                            if (giverEntry && giverEntry.creditsFromThisMonth >= ANTI_GAMING_LIMITS.MONTHLY_CAP_FROM_SINGLE_PERSON) {
                                // Cap exceeded - no more credits from this person this month
                                finalCredits = 0;
                            } else if (giverEntry) {
                                // Update monthly tracking
                                giverEntry.creditsFromThisMonth += recipientCredits;
                            }

                            // Add award bonus if present
                            if (recognition.award) {
                                finalCredits += CREDIT_VALUES.AWARD_BONUS;
                            }

                            updatedUsers.set(recipientId, {
                                ...recipient,
                                credits: recipient.credits + finalCredits,
                                creditsThisMonth: recipient.creditsThisMonth + finalCredits,
                                recognitionsReceived: recipient.recognitionsReceived + 1,
                                valuesCounts: {
                                    ...recipient.valuesCounts,
                                    [recognition.value]: (recipient.valuesCounts[recognition.value] || 0) + 1,
                                },
                            });
                        }
                    });

                    // Award to giver
                    const giver = updatedUsers.get(recognition.giverId);
                    if (giver) {
                        updatedUsers.set(recognition.giverId, {
                            ...giver,
                            credits: giver.credits + giverCredits,
                            creditsThisMonth: giver.creditsThisMonth + giverCredits,
                        });
                    }

                    // Update expert scores for recipients
                    recognition.recipientIds.forEach(recipientId => {
                        const recipient = updatedUsers.get(recipientId);
                        if (recipient && recognition.expertAreas.length > 0) {
                            const updatedAreas = [...recipient.expertAreas];

                            recognition.expertAreas.forEach(areaId => {
                                const existingArea = updatedAreas.find(a => a.id === areaId);
                                if (existingArea) {
                                    existingArea.score += CREDIT_VALUES.EXPERT_AREA_BOOST;
                                    existingArea.lastBoostedAt = new Date().toISOString();
                                } else {
                                    // Add new expert area
                                    updatedAreas.push({
                                        id: areaId,
                                        name: areaId, // Will be resolved later
                                        score: CREDIT_VALUES.EXPERT_AREA_BOOST,
                                        lastBoostedAt: new Date().toISOString(),
                                    });
                                }
                            });

                            updatedUsers.set(recipientId, {
                                ...recipient,
                                expertAreas: updatedAreas,
                            });
                        }
                    });

                    return { users: updatedUsers };
                });
            },

            updateExpertScores: (userId, areas, boost) => {
                set(state => {
                    const updatedUsers = new Map(state.users);
                    const user = updatedUsers.get(userId);

                    if (user) {
                        const updatedAreas = [...user.expertAreas];

                        areas.forEach(areaId => {
                            const existingArea = updatedAreas.find(a => a.id === areaId);
                            if (existingArea) {
                                existingArea.score += boost;
                            } else {
                                updatedAreas.push({
                                    id: areaId,
                                    name: areaId,
                                    score: boost,
                                });
                            }
                        });

                        updatedUsers.set(userId, {
                            ...user,
                            expertAreas: updatedAreas,
                        });
                    }

                    return { users: updatedUsers };
                });
            },

            // ─────────────────────────────────────────────────────────────────
            // BADGES
            // ─────────────────────────────────────────────────────────────────
            checkAndAwardBadges: (userId) => {
                const state = get();
                const user = state.users.get(userId);
                if (!user) return [];

                const newBadges: MilestoneBadge[] = [];
                const earnedBadgeTypes = user.earnedBadges.map(b => b.badge);

                // Check giving badges
                const givingBadges: { badge: MilestoneBadge; requirement: number }[] = [
                    { badge: 'TOAST_DEBUT', requirement: 1 },
                    { badge: 'GRATEFUL_DOZEN', requirement: 12 },
                    { badge: 'TOAST_TREE', requirement: 50 },
                    { badge: 'MOUNTAIN_TOP', requirement: 100 },
                ];

                givingBadges.forEach(({ badge, requirement }) => {
                    if (!earnedBadgeTypes.includes(badge) && user.recognitionsGiven >= requirement) {
                        newBadges.push(badge);
                    }
                });

                // Check receiving badges
                const receivingBadges: { badge: MilestoneBadge; requirement: number }[] = [
                    { badge: 'FIRST_TOAST', requirement: 1 },
                    { badge: 'RISING_STAR', requirement: 10 },
                    { badge: 'STAR_QUALITY', requirement: 25 },
                    { badge: 'CONSTELLATION', requirement: 50 },
                    { badge: 'GALAXY', requirement: 100 },
                ];

                receivingBadges.forEach(({ badge, requirement }) => {
                    if (!earnedBadgeTypes.includes(badge) && user.recognitionsReceived >= requirement) {
                        newBadges.push(badge);
                    }
                });

                // Award new badges
                if (newBadges.length > 0) {
                    set(state => {
                        const updatedUsers = new Map(state.users);
                        const existingUser = updatedUsers.get(userId);

                        if (existingUser) {
                            const newEarnedBadges: EarnedBadge[] = newBadges.map(badge => ({
                                badge,
                                earnedAt: new Date().toISOString(),
                            }));

                            updatedUsers.set(userId, {
                                ...existingUser,
                                earnedBadges: [...existingUser.earnedBadges, ...newEarnedBadges],
                            });
                        }

                        return { users: updatedUsers };
                    });
                }

                return newBadges;
            },

            // ─────────────────────────────────────────────────────────────────
            // LEADERBOARD
            // ─────────────────────────────────────────────────────────────────
            getLeaderboard: (type, timeframe, limit = 10) => {
                const state = get();
                const users = Array.from(state.users.values());

                let startDate: Date;
                switch (timeframe) {
                    case 'THIS_WEEK':
                        startDate = getStartOfWeek();
                        break;
                    case 'THIS_MONTH':
                        startDate = getStartOfMonth();
                        break;
                    case 'THIS_QUARTER':
                        const now = new Date();
                        const quarter = Math.floor(now.getMonth() / 3);
                        startDate = new Date(now.getFullYear(), quarter * 3, 1);
                        break;
                    default:
                        startDate = new Date(0); // All time
                }

                // Filter recognitions by timeframe
                const relevantRecognitions = state.recognitions.filter(
                    r => new Date(r.createdAt) >= startDate
                );

                let entries: LeaderboardEntry[];

                switch (type) {
                    case 'MOST_RECOGNIZED':
                        entries = users.map(user => {
                            const received = relevantRecognitions.filter(
                                r => r.recipientIds.includes(user.id)
                            ).length;
                            return {
                                rank: 0,
                                userId: user.id,
                                userName: user.name,
                                userAvatar: user.avatar,
                                userTitle: user.title,
                                userTeam: user.team,
                                score: received,
                            };
                        });
                        break;

                    case 'MOST_GENEROUS':
                        entries = users.map(user => {
                            const given = relevantRecognitions.filter(
                                r => r.giverId === user.id
                            ).length;
                            return {
                                rank: 0,
                                userId: user.id,
                                userName: user.name,
                                userAvatar: user.avatar,
                                userTitle: user.title,
                                userTeam: user.team,
                                score: given,
                            };
                        });
                        break;

                    default:
                        entries = users.map(user => ({
                            rank: 0,
                            userId: user.id,
                            userName: user.name,
                            userAvatar: user.avatar,
                            userTitle: user.title,
                            userTeam: user.team,
                            score: user.credits,
                        }));
                }

                // Sort and rank
                entries.sort((a, b) => b.score - a.score);
                entries.forEach((entry, index) => {
                    entry.rank = index + 1;
                });

                return entries.slice(0, limit);
            },

            // ─────────────────────────────────────────────────────────────────
            // NOTIFICATIONS
            // ─────────────────────────────────────────────────────────────────
            markNotificationRead: (notificationId) => {
                set(state => ({
                    notifications: state.notifications.map(n =>
                        n.id === notificationId ? { ...n, read: true } : n
                    ),
                }));
            },

            clearNotifications: () => {
                set({ notifications: [] });
            },

            // ─────────────────────────────────────────────────────────────────
            // UI
            // ─────────────────────────────────────────────────────────────────
            setFeedFilter: (filter) => {
                set({ feedFilter: filter });
            },

            setSelectedRecognition: (id) => {
                set({ selectedRecognitionId: id });
            },

            // ─────────────────────────────────────────────────────────────────
            // USER
            // ─────────────────────────────────────────────────────────────────
            getUser: (userId) => {
                return get().users.get(userId);
            },

            getCurrentUser: () => {
                const state = get();
                return state.users.get(state.currentUserId);
            },

            updateUserProfile: (updates) => {
                set(state => {
                    const updatedUsers = new Map(state.users);
                    const currentUser = updatedUsers.get(state.currentUserId);

                    if (currentUser) {
                        updatedUsers.set(state.currentUserId, {
                            ...currentUser,
                            ...updates,
                        });
                    }

                    return { users: updatedUsers };
                });
            },

            // ─────────────────────────────────────────────────────────────────
            // UTILITIES
            // ─────────────────────────────────────────────────────────────────
            resetDailyLimits: () => {
                set(state => {
                    const updatedUsers = new Map(state.users);

                    updatedUsers.forEach((user, id) => {
                        updatedUsers.set(id, {
                            ...user,
                            dailyQuickToasts: 0,
                            dailyStandingOvations: 0,
                            lastRecognitionReset: new Date().toISOString().split('T')[0],
                        });
                    });

                    return { users: updatedUsers };
                });
            },

            getRecognitionsByUser: (userId, type) => {
                const state = get();
                if (type === 'given') {
                    return state.recognitions.filter(r => r.giverId === userId);
                } else {
                    return state.recognitions.filter(r => r.recipientIds.includes(userId));
                }
            },

            getStats: () => {
                const state = get();
                const startOfWeek = getStartOfWeek();
                const startOfMonth = getStartOfMonth();

                const thisWeek = state.recognitions.filter(
                    r => new Date(r.createdAt) >= startOfWeek
                ).length;

                const thisMonth = state.recognitions.filter(
                    r => new Date(r.createdAt) >= startOfMonth
                ).length;

                const byValue: Record<CompanyValue, number> = {
                    DO_IT_DIFFERENTLY: 0,
                    HEALTHCARE_IS_PERSONAL: 0,
                    BE_ALL_IN: 0,
                    OWN_THE_OUTCOME: 0,
                    DO_THE_RIGHT_THING: 0,
                    EXPLORE_FEARLESSLY: 0,
                };

                state.recognitions.forEach(r => {
                    byValue[r.value]++;
                });

                return {
                    total: state.recognitions.length,
                    thisWeek,
                    thisMonth,
                    byValue,
                };
            },
        }),
        {
            name: 'cafe-toast-storage',
            partialize: (state) => ({
                recognitions: state.recognitions,
                users: Array.from(state.users.entries()), // Serialize Map to array
                notifications: state.notifications,
                currentUserId: state.currentUserId,
            }),
            merge: (persistedState: unknown, currentState: ToastState): ToastState => {
                // Defensive merge to handle corrupted or missing persisted state
                try {
                    const persisted = persistedState as {
                        recognitions?: Recognition[];
                        users?: [string, ToastUser][];
                        notifications?: ToastNotification[];
                        currentUserId?: string;
                    } | null;

                    if (!persisted) {
                        return currentState;
                    }

                    // Reconstruct Map from array, with validation
                    let usersMap: Map<string, ToastUser> = currentState.users;
                    if (persisted.users && Array.isArray(persisted.users) && persisted.users.length > 0) {
                        try {
                            // Validate that it's an array of [string, ToastUser] tuples
                            const validEntries = persisted.users.filter(
                                (entry): entry is [string, ToastUser] =>
                                    Array.isArray(entry) &&
                                    entry.length === 2 &&
                                    typeof entry[0] === 'string' &&
                                    entry[1] &&
                                    typeof entry[1] === 'object'
                            );
                            if (validEntries.length > 0) {
                                usersMap = new Map(validEntries);
                            }
                        } catch {
                            console.warn('[ToastStore] Failed to reconstruct users Map, using defaults');
                            usersMap = currentState.users;
                        }
                    }

                    return {
                        ...currentState,
                        recognitions: Array.isArray(persisted.recognitions) && persisted.recognitions.length > 0
                            ? persisted.recognitions
                            : currentState.recognitions,
                        users: usersMap,
                        notifications: Array.isArray(persisted.notifications)
                            ? persisted.notifications
                            : currentState.notifications,
                        currentUserId: persisted.currentUserId || currentState.currentUserId,
                    };
                } catch (error) {
                    console.error('[ToastStore] Error merging persisted state:', error);
                    return currentState;
                }
            },
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS (for optimized re-renders)
// ═══════════════════════════════════════════════════════════════════════════

export const selectRecognitions = (state: ToastState) => state.recognitions;
export const selectCurrentUser = (state: ToastState) => state.users.get(state.currentUserId);
export const selectNotifications = (state: ToastState) => state.notifications;
export const selectUnreadNotificationCount = (state: ToastState) =>
    state.notifications.filter(n => !n.read).length;
