/**
 * Toast X - Leaderboard Types
 * Rankings and competitive elements
 */

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type of leaderboard ranking
 */
export type LeaderboardType =
    | 'MOST_RECOGNIZED'   // Most recognitions received
    | 'MOST_GENEROUS'     // Most recognitions given
    | 'RISING_STARS'      // Biggest increase this period
    | 'BY_VALUE';         // Top per value

/**
 * Time period for leaderboard calculation
 */
export type LeaderboardTimeframe =
    | 'THIS_WEEK'
    | 'THIS_MONTH'
    | 'THIS_QUARTER'
    | 'ALL_TIME';

/**
 * A single entry in the leaderboard
 */
export interface LeaderboardEntry {
    readonly rank: number;
    readonly previousRank?: number; // For showing rank changes
    readonly userId: string;
    readonly userName: string;
    readonly userAvatar?: string;
    readonly userTitle?: string;
    readonly userTeam?: string;
    readonly score: number;
    readonly change?: number;      // Delta from previous period
    readonly trend?: 'up' | 'down' | 'stable'; // 10X: Visual indicator
}

/**
 * Complete leaderboard with metadata
 */
export interface Leaderboard {
    readonly type: LeaderboardType;
    readonly timeframe: LeaderboardTimeframe;
    readonly entries: readonly LeaderboardEntry[];
    readonly generatedAt: string;
    readonly myRank?: number; // Current user's rank in this leaderboard
}
