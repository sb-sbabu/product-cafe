/**
 * Leaderboard Store - Rankings & Scores
 * 
 * Manages leaderboard data, rankings, and sorting.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    LeaderboardType,
    LeaderboardEntry,
    Leaderboard,
} from '../types/gamification';
import { LEVELS } from '../types/gamification';

// ============================================================================
// MOCK DATA (Will be replaced with API calls)
// ============================================================================

const MOCK_LEADERBOARD_DATA: LeaderboardEntry[] = [
    {
        userId: 'u1',
        displayName: 'Eddie Smith',
        level: LEVELS[5], // Champion
        points: 18450,
        rank: 1,
        badges: ['cob_expert', 'rcm_expert', 'lop_speaker'],
        topActivity: '2 FAQs created',
    },
    {
        userId: 'u2',
        displayName: 'Sarah Chen',
        level: LEVELS[4], // Master
        points: 12230,
        rank: 2,
        badges: ['discovery_expert', 'curator_2', 'lop_speaker'],
        topActivity: 'LOP speaker',
    },
    {
        userId: 'u3',
        displayName: 'Mike Torres',
        level: LEVELS[4], // Master
        points: 9875,
        rank: 3,
        badges: ['metrics_expert', 'helper_3'],
        topActivity: '5 accepted answers',
    },
    {
        userId: 'u4',
        displayName: 'Lisa Park',
        level: LEVELS[3], // Expert
        points: 4560,
        rank: 4,
        badges: ['healthcare_expert', 'compliance_expert'],
        topActivity: '8 accepted answers',
    },
    {
        userId: 'u5',
        displayName: 'David Kim',
        level: LEVELS[3], // Expert
        points: 3890,
        rank: 5,
        badges: ['jira_expert', 'confluence_expert'],
        topActivity: '12 answers posted',
    },
];

// ============================================================================
// STORE STATE
// ============================================================================

interface LeaderboardStoreState {
    // State
    allTimeBoard: Leaderboard | null;
    monthlyBoard: Leaderboard | null;
    domainBoards: Record<string, Leaderboard>;
    userRank: {
        allTime: number;
        monthly: number;
        domain: Record<string, number>;
    };
    isLoading: boolean;

    // Actions
    fetchAllTimeBoard: () => Promise<void>;
    fetchMonthlyBoard: () => Promise<void>;
    fetchDomainBoard: (domain: string) => Promise<void>;
    getUserRank: (type: LeaderboardType, domain?: string) => number;
    getTopContributors: (limit: number) => LeaderboardEntry[];
    refreshBoards: () => Promise<void>;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useLeaderboardStore = create<LeaderboardStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            allTimeBoard: null,
            monthlyBoard: null,
            domainBoards: {},
            userRank: {
                allTime: 0,
                monthly: 0,
                domain: {},
            },
            isLoading: false,

            // Fetch all-time leaderboard
            fetchAllTimeBoard: async () => {
                set({ isLoading: true });

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 300));

                const board: Leaderboard = {
                    type: 'all_time',
                    entries: MOCK_LEADERBOARD_DATA,
                    lastUpdated: new Date().toISOString(),
                };

                set({
                    allTimeBoard: board,
                    isLoading: false,
                    userRank: {
                        ...get().userRank,
                        allTime: 15, // Mock user rank
                    },
                });
            },

            // Fetch monthly leaderboard
            fetchMonthlyBoard: async () => {
                set({ isLoading: true });

                await new Promise(resolve => setTimeout(resolve, 300));

                // Shuffle and adjust points for monthly
                const monthlyEntries = MOCK_LEADERBOARD_DATA
                    .map((e, i) => ({
                        ...e,
                        points: Math.round(e.points * 0.03 + Math.random() * 200),
                        rank: i + 1,
                        topActivity: i === 0 ? '8 accepted answers' : e.topActivity,
                    }))
                    .sort((a, b) => b.points - a.points)
                    .map((e, i) => ({ ...e, rank: i + 1 }));

                const board: Leaderboard = {
                    type: 'monthly',
                    period: new Date().toISOString().slice(0, 7),
                    entries: monthlyEntries,
                    lastUpdated: new Date().toISOString(),
                };

                set({
                    monthlyBoard: board,
                    isLoading: false,
                    userRank: {
                        ...get().userRank,
                        monthly: 8, // Mock user rank
                    },
                });
            },

            // Fetch domain-specific leaderboard
            fetchDomainBoard: async (domain) => {
                set({ isLoading: true });

                await new Promise(resolve => setTimeout(resolve, 300));

                // Filter entries for domain expertise
                const domainEntries = MOCK_LEADERBOARD_DATA
                    .slice(0, 3)
                    .map((e, i) => ({ ...e, rank: i + 1 }));

                const board: Leaderboard = {
                    type: 'domain',
                    domain,
                    entries: domainEntries,
                    lastUpdated: new Date().toISOString(),
                };

                set({
                    domainBoards: {
                        ...get().domainBoards,
                        [domain]: board,
                    },
                    isLoading: false,
                    userRank: {
                        ...get().userRank,
                        domain: {
                            ...get().userRank.domain,
                            [domain]: 4, // Mock user rank
                        },
                    },
                });
            },

            // Get user's rank for a given board type
            getUserRank: (type, domain) => {
                const { userRank } = get();
                if (type === 'domain' && domain) {
                    return userRank.domain[domain] || 0;
                }
                return type === 'all_time' ? userRank.allTime : userRank.monthly;
            },

            // Get top N contributors (for widgets)
            getTopContributors: (limit) => {
                const board = get().allTimeBoard;
                if (!board) return [];
                return board.entries.slice(0, limit);
            },

            // Refresh all boards
            refreshBoards: async () => {
                await Promise.all([
                    get().fetchAllTimeBoard(),
                    get().fetchMonthlyBoard(),
                ]);
            },
        }),
        {
            name: 'cafe-leaderboard',
        }
    )
);
