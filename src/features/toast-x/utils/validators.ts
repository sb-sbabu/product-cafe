/**
 * Toast X - Validators
 * Anti-gaming validation and input sanitization
 */

import type { ToastUser, RecognitionType } from '../types';
import { ANTI_GAMING_LIMITS, ANTI_GAMING_MESSAGES, type AntiGamingCheckResult } from '../constants';
import { isToday, hoursSince } from './dateUtils';

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-GAMING VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user can give more recognitions of this type today
 */
export const checkDailyLimit = (
    user: ToastUser,
    type: RecognitionType
): AntiGamingCheckResult => {
    // Reset check - if not today, limits are reset
    if (!isToday(user.lastRecognitionReset)) {
        const limit = type === 'QUICK_TOAST'
            ? ANTI_GAMING_LIMITS.DAILY_QUICK_TOASTS
            : ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS;
        return {
            allowed: true,
            remaining: limit,
        };
    }

    if (type === 'QUICK_TOAST') {
        const remaining = ANTI_GAMING_LIMITS.DAILY_QUICK_TOASTS - user.dailyQuickToasts;
        if (remaining <= 0) {
            return {
                allowed: false,
                remaining: 0,
                ...ANTI_GAMING_MESSAGES.DAILY_LIMIT_QUICK_TOAST,
            };
        }
        return { allowed: true, remaining };
    }

    if (type === 'STANDING_OVATION') {
        const remaining = ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS - user.dailyStandingOvations;
        if (remaining <= 0) {
            return {
                allowed: false,
                remaining: 0,
                ...ANTI_GAMING_MESSAGES.DAILY_LIMIT_STANDING_OVATION,
            };
        }
        return { allowed: true, remaining };
    }

    // Team Toast and Milestone don't have daily limits
    return { allowed: true };
};

/**
 * Check cooldown for recognizing the same person
 */
export const checkRecipientCooldown = (
    user: ToastUser,
    recipientId: string
): AntiGamingCheckResult => {
    const recentRecipient = user.recentRecipients.find(r => r.userId === recipientId);

    if (!recentRecipient) {
        return { allowed: true };
    }

    const hoursPassed = hoursSince(recentRecipient.lastRecognizedAt);
    const cooldownHours = ANTI_GAMING_LIMITS.SAME_PERSON_COOLDOWN_HOURS;

    if (hoursPassed >= cooldownHours) {
        return { allowed: true };
    }

    const hoursRemaining = Math.ceil(cooldownHours - hoursPassed);
    const cooldownEndsAt = new Date(
        new Date(recentRecipient.lastRecognizedAt).getTime() + cooldownHours * 60 * 60 * 1000
    );

    return {
        allowed: false,
        reason: `${ANTI_GAMING_MESSAGES.COOLDOWN_ACTIVE.reason} You can recognize them again in ${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'}.`,
        suggestedAction: ANTI_GAMING_MESSAGES.COOLDOWN_ACTIVE.suggestedAction,
        cooldownEndsAt,
    };
};

/**
 * Check if monthly cap from single person is reached
 */
export const checkMonthlyCap = (
    recipient: ToastUser,
    giverId: string
): AntiGamingCheckResult => {
    const giverEntry = recipient.recentRecipients.find(r => r.userId === giverId);

    if (!giverEntry) {
        return { allowed: true };
    }

    if (giverEntry.creditsFromThisMonth >= ANTI_GAMING_LIMITS.MONTHLY_CAP_FROM_SINGLE_PERSON) {
        return {
            allowed: false,
            ...ANTI_GAMING_MESSAGES.MONTHLY_CAP_REACHED,
        };
    }

    return { allowed: true };
};

/**
 * Comprehensive check for all anti-gaming rules
 */
export const canRecognize = (
    giver: ToastUser,
    recipientId: string,
    type: RecognitionType
): AntiGamingCheckResult => {
    // Check daily limit first
    const dailyCheck = checkDailyLimit(giver, type);
    if (!dailyCheck.allowed) {
        return dailyCheck;
    }

    // Check cooldown
    const cooldownCheck = checkRecipientCooldown(giver, recipientId);
    if (!cooldownCheck.allowed) {
        return cooldownCheck;
    }

    // All checks passed
    return {
        allowed: true,
        remaining: dailyCheck.remaining,
    };
};

/**
 * Check multiple recipients at once
 * Returns first failure or success with aggregate remaining count
 */
export const canRecognizeMultiple = (
    giver: ToastUser,
    recipientIds: readonly string[],
    type: RecognitionType
): AntiGamingCheckResult => {
    // Check daily limit first (applies to all)
    const dailyCheck = checkDailyLimit(giver, type);
    if (!dailyCheck.allowed) {
        return dailyCheck;
    }

    // Check cooldown for each recipient
    for (const recipientId of recipientIds) {
        const cooldownCheck = checkRecipientCooldown(giver, recipientId);
        if (!cooldownCheck.allowed) {
            return cooldownCheck;
        }
    }

    return {
        allowed: true,
        remaining: dailyCheck.remaining,
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sanitize message content
 * Removes excessive whitespace and trims
 */
export const sanitizeMessage = (message: string): string => {
    return message
        .trim()
        .replace(/\s+/g, ' ')        // Collapse multiple spaces
        .replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
};

/**
 * Validate recipient IDs
 */
export const validateRecipientIds = (
    ids: readonly string[],
    currentUserId: string
): { valid: boolean; error?: string } => {
    if (ids.length === 0) {
        return { valid: false, error: 'At least one recipient is required' };
    }

    if (ids.includes(currentUserId)) {
        return { valid: false, error: "You can't recognize yourself (nice try though!)" };
    }

    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
        return { valid: false, error: 'Duplicate recipients detected' };
    }

    return { valid: true };
};
