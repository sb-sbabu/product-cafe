/**
 * Toast X - Constants Index
 * Re-exports all constants for clean imports
 */

// Company Values
export { COMPANY_VALUES, COMPANY_VALUE_LIST, getValueDefinition } from './values';

// Awards
export {
    AWARDS,
    AWARD_TYPE_LIST,
    VALUE_AWARDS,
    SPECIAL_AWARDS,
    getAwardDefinition,
    getAwardForValue,
} from './awards';

// Badges
export {
    BADGES,
    BADGE_TYPE_LIST,
    GIVING_BADGES,
    RECEIVING_BADGES,
    ANNIVERSARY_BADGES,
    getBadgeDefinition,
    getNextBadge,
    getBadgeProgress,
} from './badges';

// Anti-Gaming & Credits
export {
    ADMIN_MODE,
    CREDIT_VALUES,
    ANTI_GAMING_LIMITS,
    ANTI_GAMING_MESSAGES,
    type CreditValueKey,
    type AntiGamingLimitKey,
    type AntiGamingCheckResult,
} from './anti-gaming';
