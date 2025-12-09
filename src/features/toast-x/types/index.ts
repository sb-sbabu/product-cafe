/**
 * Toast X - Types Index
 * Re-exports all types for clean imports
 */

// Values
export type { CompanyValue, ValueDefinition, ValueDefinitions } from './values';

// Awards & Badges
export type {
    AwardType,
    Award,
    EarnedAward,
    MilestoneBadge,
    BadgeCategory,
    Badge,
    EarnedBadge,
    BadgeDefinitions,
    AwardDefinitions,
} from './awards';

// Recognition
export type {
    RecognitionType,
    ReactionType,
    Reaction,
    Comment,
    RecipientInfo,
    ImageCategory,
    Recognition,
    CreateRecognitionInput,
} from './recognition';

// User
export type {
    ExpertArea,
    RecentRecipient,
    CreditTransaction,
    ToastUser,
    UserSummary,
} from './user';

// Leaderboard
export type {
    LeaderboardType,
    LeaderboardTimeframe,
    LeaderboardEntry,
    Leaderboard,
} from './leaderboard';

// Notifications
export type {
    ToastNotificationType,
    NotificationPriority,
    ToastNotification,
    NotificationPreferences,
} from './notifications';

// Schemas (for validation)
export {
    // Enum schemas
    CompanyValueSchema,
    RecognitionTypeSchema,
    ReactionTypeSchema,
    AwardTypeSchema,
    MilestoneBadgeSchema,
    // Input schemas
    CreateQuickToastSchema,
    CreateStandingOvationSchema,
    CreateTeamToastSchema,
    AddCommentSchema,
    AddReactionSchema,
} from './schemas';

// Schema-inferred types
export type {
    CreateQuickToastInput,
    CreateStandingOvationInput,
    CreateTeamToastInput,
    AddCommentInput,
    AddReactionInput,
} from './schemas';
