/**
 * Toast X - Utils Index
 * Re-exports all utility functions
 */

// Date and general utilities
export {
    generateId,
    isToday,
    hoursSince,
    getStartOfWeek,
    getStartOfMonth,
    getStartOfQuarter,
    getTodayString,
    formatRelativeTime,
    truncate,
    titleCase,
    groupBy,
    uniqueBy,
} from './dateUtils';

// Credit calculations
export {
    getBaseCredits,
    calculateCredits,
    checkMonthlyCap as checkMonthlyCreditCap,
    formatCredits,
    getCreditColor,
    type CreditCalculation,
} from './creditCalculator';

// Validators
export {
    checkDailyLimit,
    checkRecipientCooldown,
    checkMonthlyCap as checkMonthlyCapForRecipient,
    canRecognize,
    canRecognizeMultiple,
    sanitizeMessage,
    validateRecipientIds,
} from './validators';
