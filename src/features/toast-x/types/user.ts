/**
 * Toast X - User & Credits Types
 * User profiles, credits, and expert areas
 */

import type { CompanyValue } from './values';
import type { EarnedAward, EarnedBadge } from './awards';

// ═══════════════════════════════════════════════════════════════════════════
// EXPERT AREAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Expert area with score tracking
 * Each selected area in recognition adds +10 points
 */
export interface ExpertArea {
    readonly id: string;
    readonly name: string;
    readonly score: number;       // Accumulated score from recognitions
    readonly lastBoostedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tracks recent recipients for anti-gaming cooldown
 */
export interface RecentRecipient {
    readonly userId: string;
    readonly lastRecognizedAt: string;
    readonly creditsFromThisMonth: number; // For cap tracking
}

/**
 * Credit transaction for history tracking (10X improvement)
 */
export interface CreditTransaction {
    readonly id: string;
    readonly amount: number;
    readonly source: 'RECOGNITION_RECEIVED' | 'RECOGNITION_GIVEN' | 'AWARD_BONUS';
    readonly recognitionId?: string;
    readonly timestamp: string;
    readonly details: string; // Human-readable explanation
}

// ═══════════════════════════════════════════════════════════════════════════
// USER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toast user profile with all recognition-related data
 */
export interface ToastUser {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string;
    readonly title: string;
    readonly team: string;
    readonly department: string;
    readonly managerId?: string;

    // Stats
    readonly credits: number;
    readonly creditsThisMonth: number;
    readonly recognitionsGiven: number;
    readonly recognitionsReceived: number;

    // Expert Areas (multi-domain scoring)
    readonly expertAreas: readonly ExpertArea[];

    // Badges & Awards
    readonly earnedBadges: readonly EarnedBadge[];
    readonly earnedAwards: readonly EarnedAward[];

    // Values breakdown (count per value)
    readonly valuesCounts: Readonly<Record<CompanyValue, number>>;

    // Anti-gaming tracking
    readonly dailyQuickToasts: number;
    readonly dailyStandingOvations: number;
    readonly lastRecognitionReset: string; // Date string (YYYY-MM-DD)
    readonly recentRecipients: readonly RecentRecipient[];

    // Credit history (10X improvement - transparency)
    readonly creditHistory?: readonly CreditTransaction[];

    // Metadata
    readonly joinedAt: string;
    readonly lastActiveAt: string;
}

/**
 * Partial user info for display purposes
 */
export interface UserSummary {
    readonly id: string;
    readonly name: string;
    readonly avatar?: string;
    readonly title: string;
    readonly team: string;
}
