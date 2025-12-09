/**
 * Toast X - Main Feature Index
 * Public API for the Toast X recognition system
 * 
 * "To Outstanding Achievements, Spirit & Teamwork"
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Export all types
export type {
    // Values
    CompanyValue,
    ValueDefinition,
    ValueDefinitions,
    // Awards & Badges
    AwardType,
    Award,
    EarnedAward,
    MilestoneBadge,
    BadgeCategory,
    Badge,
    EarnedBadge,
    BadgeDefinitions,
    AwardDefinitions,
    // Recognition
    RecognitionType,
    ReactionType,
    Reaction,
    Comment,
    RecipientInfo,
    ImageCategory,
    Recognition,
    CreateRecognitionInput,
    // User
    ExpertArea,
    RecentRecipient,
    CreditTransaction,
    ToastUser,
    UserSummary,
    // Leaderboard
    LeaderboardType,
    LeaderboardTimeframe,
    LeaderboardEntry,
    Leaderboard,
    // Notifications
    ToastNotificationType,
    NotificationPriority,
    ToastNotification,
    NotificationPreferences,
} from './types';

// Export schemas
export {
    CompanyValueSchema,
    RecognitionTypeSchema,
    ReactionTypeSchema,
    AwardTypeSchema,
    MilestoneBadgeSchema,
    CreateQuickToastSchema,
    CreateStandingOvationSchema,
    CreateTeamToastSchema,
    AddCommentSchema,
    AddReactionSchema,
} from './types';

// Export schema-inferred types
export type {
    CreateQuickToastInput,
    CreateStandingOvationInput,
    CreateTeamToastInput,
    AddCommentInput,
    AddReactionInput,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export {
    // Values
    COMPANY_VALUES,
    COMPANY_VALUE_LIST,
    getValueDefinition,
    // Awards
    AWARDS,
    AWARD_TYPE_LIST,
    VALUE_AWARDS,
    SPECIAL_AWARDS,
    getAwardDefinition,
    getAwardForValue,
    // Badges
    BADGES,
    BADGE_TYPE_LIST,
    GIVING_BADGES,
    RECEIVING_BADGES,
    ANNIVERSARY_BADGES,
    getBadgeDefinition,
    getNextBadge,
    getBadgeProgress,
    // Anti-Gaming
    CREDIT_VALUES,
    ANTI_GAMING_LIMITS,
    ANTI_GAMING_MESSAGES,
} from './constants';

export type { AntiGamingCheckResult } from './constants';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export {
    // Date utilities
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
    // Credit calculations
    getBaseCredits,
    calculateCredits,
    checkMonthlyCreditCap,
    formatCredits,
    getCreditColor,
    // Validators
    checkDailyLimit,
    checkRecipientCooldown,
    checkMonthlyCapForRecipient,
    canRecognize,
    canRecognizeMultiple,
    sanitizeMessage,
    validateRecipientIds,
} from './utils';

export type { CreditCalculation } from './utils';

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export {
    useToastXStore,
    selectRecognitions,
    selectCurrentUser,
    selectNotifications,
    selectFeedFilter,
} from './store';

export type { ToastXStore } from './store';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export {
    // User hooks
    useCurrentUser,
    useCurrentUserStats,
    useUser,
    useAllUsers,
    // Recognition hooks
    useRecognition,
    useRecentRecognitions,
    useFeedRecognitions,
    useRecognitionActions,
    useCreateRecognition,
    // Anti-gaming hooks
    useCanRecognize,
    useDailyLimits,
    // Leaderboard hooks
    useLeaderboard,
    // Notification hooks
    useUnreadNotificationCount,
    useNotifications,
    useNotificationActions,
    // Stats hooks
    useToastStats,
    // UI hooks
    useFeedFilter,
} from './hooks';
