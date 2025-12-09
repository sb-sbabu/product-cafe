/**
 * Toast X - User Slice
 * Handles user profiles, credits, and anti-gaming tracking
 */

import type { StateCreator } from 'zustand';
import type { ToastUser, ExpertArea, EarnedBadge, EarnedAward, CompanyValue } from '../../types';
import { getUsersMap } from '../demoData';
import { getTodayString, isToday } from '../../utils';

// ═══════════════════════════════════════════════════════════════════════════
// SLICE STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface UserSlice {
    /** All users indexed by ID */
    users: Map<string, ToastUser>;

    /** Current logged-in user ID */
    currentUserId: string;

    /** Actions */
    getUser: (userId: string) => ToastUser | undefined;
    getCurrentUser: () => ToastUser | undefined;
    updateUser: (userId: string, updates: Partial<ToastUser>) => void;

    // Credit management
    addCredits: (userId: string, amount: number, source: string) => void;

    // Expert areas
    boostExpertArea: (userId: string, areaId: string, areaName: string, boost: number) => void;

    // Badges & Awards
    awardBadge: (userId: string, badge: EarnedBadge) => void;
    awardAward: (userId: string, award: EarnedAward) => void;

    // Value counts
    incrementValueCount: (userId: string, value: CompanyValue) => void;

    // Anti-gaming tracking
    incrementDailyQuickToasts: () => void;
    incrementDailyStandingOvations: () => void;
    addRecentRecipient: (recipientId: string) => void;
    resetDailyLimits: () => void;

    // Stats increment
    incrementRecognitionsGiven: () => void;
    incrementRecognitionsReceived: (userId: string) => void;

    // Selectors
    getAllUsers: () => ToastUser[];
    getUsersByTeam: (team: string) => ToastUser[];
    getTopUsersByCredits: (limit: number) => ToastUser[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SLICE CREATOR
// ═══════════════════════════════════════════════════════════════════════════

export const createUserSlice: StateCreator<
    UserSlice,
    [],
    [],
    UserSlice
> = (set, get) => ({
    // Initial state
    users: getUsersMap(),
    currentUserId: 'user-3', // Jennifer Martinez for demo

    // ─────────────────────────────────────────────────────────────────────────
    // USER GETTERS
    // ─────────────────────────────────────────────────────────────────────────

    getUser: (userId) => {
        return get().users.get(userId);
    },

    getCurrentUser: () => {
        return get().users.get(get().currentUserId);
    },

    updateUser: (userId, updates) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (user) {
                users.set(userId, { ...user, ...updates, lastActiveAt: new Date().toISOString() });
            }
            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CREDITS
    // ─────────────────────────────────────────────────────────────────────────

    addCredits: (userId, amount, _source) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (user) {
                users.set(userId, {
                    ...user,
                    credits: user.credits + amount,
                    creditsThisMonth: user.creditsThisMonth + amount,
                });
            }
            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EXPERT AREAS
    // ─────────────────────────────────────────────────────────────────────────

    boostExpertArea: (userId, areaId, areaName, boost) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (!user) return { users };

            const existingArea = user.expertAreas.find((a) => a.id === areaId);
            let expertAreas: ExpertArea[];

            if (existingArea) {
                expertAreas = user.expertAreas.map((a) =>
                    a.id === areaId
                        ? { ...a, score: a.score + boost, lastBoostedAt: new Date().toISOString() }
                        : a
                );
            } else {
                expertAreas = [
                    ...user.expertAreas,
                    { id: areaId, name: areaName, score: boost, lastBoostedAt: new Date().toISOString() },
                ];
            }

            users.set(userId, { ...user, expertAreas });
            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BADGES & AWARDS
    // ─────────────────────────────────────────────────────────────────────────

    awardBadge: (userId, badge) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (!user) return { users };

            // Check if already earned
            if (user.earnedBadges.some((b) => b.badge === badge.badge)) {
                return { users };
            }

            users.set(userId, {
                ...user,
                earnedBadges: [...user.earnedBadges, badge],
            });
            return { users };
        });
    },

    awardAward: (userId, award) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (!user) return { users };

            users.set(userId, {
                ...user,
                earnedAwards: [...user.earnedAwards, award],
            });
            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // VALUE COUNTS
    // ─────────────────────────────────────────────────────────────────────────

    incrementValueCount: (userId, value) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (!user) return { users };

            users.set(userId, {
                ...user,
                valuesCounts: {
                    ...user.valuesCounts,
                    [value]: (user.valuesCounts[value] || 0) + 1,
                },
            });
            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ANTI-GAMING TRACKING
    // ─────────────────────────────────────────────────────────────────────────

    incrementDailyQuickToasts: () => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(state.currentUserId);
            if (!user) return { users };

            // Reset if new day
            const today = getTodayString();
            let dailyQuickToasts = user.dailyQuickToasts;
            let lastRecognitionReset = user.lastRecognitionReset;

            if (!isToday(user.lastRecognitionReset)) {
                dailyQuickToasts = 0;
                lastRecognitionReset = today;
            }

            users.set(state.currentUserId, {
                ...user,
                dailyQuickToasts: dailyQuickToasts + 1,
                lastRecognitionReset,
            });
            return { users };
        });
    },

    incrementDailyStandingOvations: () => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(state.currentUserId);
            if (!user) return { users };

            // Reset if new day
            const today = getTodayString();
            let dailyStandingOvations = user.dailyStandingOvations;
            let lastRecognitionReset = user.lastRecognitionReset;

            if (!isToday(user.lastRecognitionReset)) {
                dailyStandingOvations = 0;
                lastRecognitionReset = today;
            }

            users.set(state.currentUserId, {
                ...user,
                dailyStandingOvations: dailyStandingOvations + 1,
                lastRecognitionReset,
            });
            return { users };
        });
    },

    addRecentRecipient: (recipientId) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(state.currentUserId);
            if (!user) return { users };

            const now = new Date().toISOString();
            const existingIndex = user.recentRecipients.findIndex((r) => r.userId === recipientId);

            let recentRecipients = [...user.recentRecipients];

            if (existingIndex >= 0) {
                recentRecipients[existingIndex] = {
                    ...recentRecipients[existingIndex],
                    lastRecognizedAt: now,
                };
            } else {
                recentRecipients.push({
                    userId: recipientId,
                    lastRecognizedAt: now,
                    creditsFromThisMonth: 0,
                });
            }

            users.set(state.currentUserId, { ...user, recentRecipients });
            return { users };
        });
    },

    resetDailyLimits: () => {
        set((state) => {
            const users = new Map(state.users);
            const today = getTodayString();

            users.forEach((user, id) => {
                users.set(id, {
                    ...user,
                    dailyQuickToasts: 0,
                    dailyStandingOvations: 0,
                    lastRecognitionReset: today,
                });
            });

            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // STATS
    // ─────────────────────────────────────────────────────────────────────────

    incrementRecognitionsGiven: () => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(state.currentUserId);
            if (!user) return { users };

            users.set(state.currentUserId, {
                ...user,
                recognitionsGiven: user.recognitionsGiven + 1,
            });
            return { users };
        });
    },

    incrementRecognitionsReceived: (userId) => {
        set((state) => {
            const users = new Map(state.users);
            const user = users.get(userId);
            if (!user) return { users };

            users.set(userId, {
                ...user,
                recognitionsReceived: user.recognitionsReceived + 1,
            });
            return { users };
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SELECTORS
    // ─────────────────────────────────────────────────────────────────────────

    getAllUsers: () => {
        return Array.from(get().users.values());
    },

    getUsersByTeam: (team) => {
        return Array.from(get().users.values()).filter((u) => u.team === team);
    },

    getTopUsersByCredits: (limit) => {
        return Array.from(get().users.values())
            .sort((a, b) => b.credits - a.credits)
            .slice(0, limit);
    },
});
