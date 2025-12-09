/**
 * Toast X - Credit Calculator
 * Calculates credits for recognitions with anti-gaming protection
 */

import type { RecognitionType, Recognition } from '../types';
import { CREDIT_VALUES, ANTI_GAMING_LIMITS } from '../constants';

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

export interface CreditCalculation {
    /** Credits for the recipient(s) */
    readonly recipientCredits: number;
    /** Credits for the giver */
    readonly giverCredits: number;
    /** Expert area boost per selected area */
    readonly expertBoost: number;
    /** Award bonus if applicable */
    readonly awardBonus: number;
    /** Total credits for recipient (sum of all) */
    readonly recipientTotal: number;
    /** Breakdown explanation */
    readonly breakdown: readonly string[];
}

/**
 * Get base credits for a recognition type
 */
export const getBaseCredits = (type: RecognitionType): { recipient: number; giver: number } => {
    switch (type) {
        case 'QUICK_TOAST':
            return {
                recipient: CREDIT_VALUES.QUICK_TOAST_RECIPIENT,
                giver: CREDIT_VALUES.QUICK_TOAST_GIVER,
            };
        case 'STANDING_OVATION':
            return {
                recipient: CREDIT_VALUES.STANDING_OVATION_RECIPIENT,
                giver: CREDIT_VALUES.STANDING_OVATION_GIVER,
            };
        case 'TEAM_TOAST':
            return {
                recipient: CREDIT_VALUES.TEAM_TOAST_RECIPIENT,
                giver: CREDIT_VALUES.TEAM_TOAST_GIVER,
            };
        case 'MILESTONE_MOMENT':
            return { recipient: 0, giver: 0 }; // System-generated
        default:
            return { recipient: 0, giver: 0 };
    }
};

/**
 * Calculate credits for a recognition
 * Provides full breakdown for transparency
 */
export const calculateCredits = (
    type: RecognitionType,
    expertAreasCount: number,
    hasAward: boolean,
    isReciprocal: boolean = false
): CreditCalculation => {
    const base = getBaseCredits(type);
    const breakdown: string[] = [];

    let recipientCredits = base.recipient;
    breakdown.push(`Base credits: ${base.recipient}`);

    // Expert area boost
    const expertBoost = expertAreasCount * CREDIT_VALUES.EXPERT_AREA_BOOST;
    if (expertBoost > 0) {
        recipientCredits += expertBoost;
        breakdown.push(`Expert areas (${expertAreasCount}): +${expertBoost}`);
    }

    // Award bonus
    const awardBonus = hasAward ? CREDIT_VALUES.AWARD_BONUS : 0;
    if (awardBonus > 0) {
        recipientCredits += awardBonus;
        breakdown.push(`Award bonus: +${awardBonus}`);
    }

    // Reciprocal reduction
    if (isReciprocal) {
        const reduction = Math.floor(recipientCredits * (ANTI_GAMING_LIMITS.RECIPROCAL_REDUCTION_PERCENT / 100));
        recipientCredits -= reduction;
        breakdown.push(`Reciprocal reduction: -${reduction}`);
    }

    return Object.freeze({
        recipientCredits: base.recipient,
        giverCredits: base.giver,
        expertBoost,
        awardBonus,
        recipientTotal: recipientCredits,
        breakdown: Object.freeze(breakdown),
    });
};

/**
 * Check if credits should be capped from a single giver
 */
export const checkMonthlyCap = (
    creditsReceivedFromGiver: number,
    newCredits: number
): { creditsThatApply: number; capped: boolean; message?: string } => {
    const cap = ANTI_GAMING_LIMITS.MONTHLY_CAP_FROM_SINGLE_PERSON;
    const remaining = cap - creditsReceivedFromGiver;

    if (remaining <= 0) {
        return {
            creditsThatApply: 0,
            capped: true,
            message: `Monthly cap of ${cap} credits reached from this person`,
        };
    }

    if (newCredits > remaining) {
        return {
            creditsThatApply: remaining,
            capped: true,
            message: `Credits capped at ${remaining} (monthly limit)`,
        };
    }

    return {
        creditsThatApply: newCredits,
        capped: false,
    };
};

/**
 * Format credits for display
 */
export const formatCredits = (credits: number): string => {
    if (credits >= 1000) {
        return `${(credits / 1000).toFixed(1)}k`;
    }
    return credits.toString();
};

/**
 * Get credit badge color based on amount
 */
export const getCreditColor = (credits: number): string => {
    if (credits >= 1000) return '#FFD700'; // Gold
    if (credits >= 500) return '#C0C0C0';  // Silver
    if (credits >= 100) return '#CD7F32';  // Bronze
    return '#6BCB77'; // Green
};
