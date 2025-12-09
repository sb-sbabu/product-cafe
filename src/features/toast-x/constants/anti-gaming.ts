/**
 * Toast X - Anti-Gaming & Credit System Constants
 * Rules and limits to prevent gaming the recognition system
 */

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT VALUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Credit values for different recognition types
 * These define how many credits are awarded to recipients and givers
 */
export const CREDIT_VALUES = Object.freeze({
    // Quick Toast
    QUICK_TOAST_RECIPIENT: 5,
    QUICK_TOAST_GIVER: 2,

    // Standing Ovation
    STANDING_OVATION_RECIPIENT: 25,
    STANDING_OVATION_GIVER: 5,

    // Team Toast (per member)
    TEAM_TOAST_RECIPIENT: 15,
    TEAM_TOAST_GIVER: 3,

    // Expert Area Boost (each selected area adds this)
    EXPERT_AREA_BOOST: 10,

    // Award Bonus (when an award is attached)
    AWARD_BONUS: 50,
} as const);

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN MODE (For Testing)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enable admin mode for unlimited toasts during testing
 * Set to true to bypass all anti-gaming limits
 */
export const ADMIN_MODE = true; // Set to false for production

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-GAMING LIMITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Limits to prevent gaming the recognition system
 * These ensure recognition remains meaningful and not exploitative
 * NOTE: When ADMIN_MODE is true, these limits are bypassed
 */
export const ANTI_GAMING_LIMITS = Object.freeze({
    /** Maximum Quick Toasts per day (unlimited in admin mode) */
    DAILY_QUICK_TOASTS: ADMIN_MODE ? 999 : 3,

    /** Maximum Standing Ovations per day (unlimited in admin mode) */
    DAILY_STANDING_OVATIONS: ADMIN_MODE ? 999 : 1,

    /** Hours to wait before recognizing the same person again */
    SAME_PERSON_COOLDOWN_HOURS: ADMIN_MODE ? 0 : 24,

    /** Maximum credits a recipient can receive from a single person per month */
    MONTHLY_CAP_FROM_SINGLE_PERSON: ADMIN_MODE ? 99999 : 500,

    /** Percentage reduction for mutual recognition within 48 hours */
    RECIPROCAL_REDUCTION_PERCENT: ADMIN_MODE ? 0 : 50,

    /** Hours window for detecting reciprocal recognition */
    RECIPROCAL_DETECTION_HOURS: ADMIN_MODE ? 0 : 48,
} as const);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CreditValueKey = keyof typeof CREDIT_VALUES;
export type AntiGamingLimitKey = keyof typeof ANTI_GAMING_LIMITS;

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-GAMING RESULT TYPES (10X Improvement: Clear user feedback)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Result type for anti-gaming checks
 * Provides clear feedback to users about why they can't perform an action
 */
export interface AntiGamingCheckResult {
    /** Whether the action is allowed */
    readonly allowed: boolean;

    /** Human-readable reason if not allowed */
    readonly reason?: string;

    /** Suggested action for the user (10X improvement) */
    readonly suggestedAction?: string;

    /** When the cooldown ends (10X improvement) */
    readonly cooldownEndsAt?: Date;

    /** How many of this action remain today */
    readonly remaining?: number;
}

/**
 * User-friendly error messages for anti-gaming rejections
 */
export const ANTI_GAMING_MESSAGES = Object.freeze({
    DAILY_LIMIT_QUICK_TOAST: {
        reason: "You've used all your Quick Toasts for today!",
        suggestedAction: "Come back tomorrow to spread more appreciation, or try a Standing Ovation for something truly exceptional.",
    },
    DAILY_LIMIT_STANDING_OVATION: {
        reason: "You've already given a Standing Ovation today.",
        suggestedAction: "Standing Ovations are reserved for truly exceptional moments. Try again tomorrow!",
    },
    COOLDOWN_ACTIVE: {
        reason: "You've recently recognized this person.",
        suggestedAction: "Wait a bit before recognizing them again, or thank someone else who deserves it!",
    },
    MONTHLY_CAP_REACHED: {
        reason: "You've reached the monthly recognition limit for this person.",
        suggestedAction: "Spread the love! There are other colleagues who might appreciate your recognition.",
    },
    RECIPROCAL_DETECTED: {
        reason: "This looks like a mutual recognition exchange.",
        suggestedAction: "Recognition is most meaningful when unexpected. Consider recognizing someone else!",
    },
} as const);
