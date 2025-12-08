/**
 * Café TOAST - Recognition & Achievements Platform
 * Core Types & Interfaces
 * 
 * "To Outstanding Achievements, Spirit & Teamwork"
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPANY VALUES (6 Core Values)
// ═══════════════════════════════════════════════════════════════════════════

export type CompanyValue =
    | 'DO_IT_DIFFERENTLY'
    | 'HEALTHCARE_IS_PERSONAL'
    | 'BE_ALL_IN'
    | 'OWN_THE_OUTCOME'
    | 'DO_THE_RIGHT_THING'
    | 'EXPLORE_FEARLESSLY';

export interface ValueDefinition {
    id: CompanyValue;
    name: string;
    shortName: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    awardName: string;
    awardIcon: string;
    behaviors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// AWARDS & BADGES
// ═══════════════════════════════════════════════════════════════════════════

export type AwardType =
    // Value Awards (1 per value)
    | 'MAVERICK'           // Do It Differently
    | 'HEARTBEAT'          // Healthcare Is Personal
    | 'BRIDGE_BUILDER'     // Be All In
    | 'OWNER'              // Own The Outcome
    | 'GUARDIAN'           // Do The Right Thing
    | 'EXPLORER'           // Explore Fearlessly
    // Special Awards
    | 'TOAST_OF_THE_MONTH'
    | 'VALUES_CHAMPION'
    | 'GRATITUDE_GURU'
    | 'QUARTERLY_GEM'
    | 'SUNSHINE_AWARD'
    | 'BULLSEYE'
    | 'PUZZLE_MASTER'
    | 'MENTOR_STAR'
    | 'FIRE_STARTER'
    | 'CALM_IN_THE_STORM';

export type MilestoneBadge =
    // Giving Milestones
    | 'TOAST_DEBUT'        // First recognition given
    | 'GRATEFUL_DOZEN'     // 12 recognitions given
    | 'TOAST_TREE'         // 50 recognitions given
    | 'MOUNTAIN_TOP'       // 100 recognitions given
    // Receiving Milestones
    | 'FIRST_TOAST'        // First recognition received
    | 'RISING_STAR'        // 10 recognitions received
    | 'STAR_QUALITY'       // 25 recognitions received
    | 'CONSTELLATION'      // 50 recognitions received
    | 'GALAXY'             // 100 recognitions received
    // Anniversary Milestones
    | 'YEAR_ONE'           // 1 year
    | 'TRIPLE'             // 3 years
    | 'HALF_DECADE'        // 5 years
    | 'DIAMOND';           // 10 years

export interface Award {
    type: AwardType;
    name: string;
    description: string;
    icon: string;
    color: string;
    value?: CompanyValue; // Which value this award represents (for value awards)
    isSpecial: boolean;   // Special awards vs value awards
}

export interface Badge {
    type: MilestoneBadge;
    name: string;
    description: string;
    icon: string;
    requirement: number;  // Number needed to earn
    category: 'giving' | 'receiving' | 'anniversary';
}

export interface EarnedBadge {
    badge: MilestoneBadge;
    earnedAt: string;
}

export interface EarnedAward {
    award: AwardType;
    recognitionId: string; // Which recognition earned this
    earnedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RECOGNITION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type RecognitionType =
    | 'QUICK_TOAST'        // Everyday thanks
    | 'STANDING_OVATION'   // Significant achievements
    | 'TEAM_TOAST'         // Whole team celebration
    | 'MILESTONE_MOMENT';  // Auto-generated milestones

export type ReactionType =
    | 'applause' | 'celebrate' | 'love' | 'fire'
    | 'star' | 'praise' | 'strong' | 'magic'
    | 'rocket' | 'brilliant' | 'shine' | 'gem';

export interface Reaction {
    type: ReactionType;
    userId: string;
    userName: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userTitle?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    reactions: Reaction[];
    parentId?: string;    // For threaded replies
    mentions: string[];   // User IDs mentioned
}

export interface Recognition {
    id: string;
    type: RecognitionType;

    // Who
    giverId: string;
    giverName: string;
    giverAvatar?: string;
    giverTitle?: string;

    recipientIds: string[];
    recipients: RecipientInfo[];

    // What
    value: CompanyValue;
    expertAreas: string[];  // Multi-select expert areas (boost scores)
    message: string;
    impact?: string;        // For Standing Ovation
    imageId: string;

    // Award
    award?: AwardType;

    // Metadata
    createdAt: string;
    updatedAt?: string;

    // Social
    reactions: Reaction[];
    comments: Comment[];
    reposts: number;
    bookmarks: number;

    // Options
    isPrivate: boolean;
    notifyManagers: boolean;
    nominatedForMonthly: boolean;

    // Gratitude Chain
    chainParentId?: string;  // If this was a "pass it forward" recognition
    chainDepth: number;
}

export interface RecipientInfo {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    team?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER & CREDITS
// ═══════════════════════════════════════════════════════════════════════════

export interface ExpertArea {
    id: string;
    name: string;
    score: number;     // Accumulated score from recognitions
    lastBoostedAt?: string;
}

export interface ToastUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    title: string;
    team: string;
    department: string;
    managerId?: string;

    // Stats
    credits: number;
    creditsThisMonth: number;
    recognitionsGiven: number;
    recognitionsReceived: number;

    // Expert Areas (multi-domain scoring)
    expertAreas: ExpertArea[];

    // Badges & Awards
    earnedBadges: EarnedBadge[];
    earnedAwards: EarnedAward[];

    // Values breakdown (count per value)
    valuesCounts: Record<CompanyValue, number>;

    // Anti-gaming tracking
    dailyQuickToasts: number;
    dailyStandingOvations: number;
    lastRecognitionReset: string; // Date string
    recentRecipients: RecentRecipient[]; // For cooldown tracking

    // Metadata
    joinedAt: string;
    lastActiveAt: string;
}

export interface RecentRecipient {
    userId: string;
    lastRecognizedAt: string;
    creditsFromThisMonth: number; // For cap tracking
}

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════════════

export type LeaderboardType =
    | 'MOST_RECOGNIZED'   // Most recognitions received
    | 'MOST_GENEROUS'     // Most recognitions given
    | 'RISING_STARS'      // Biggest increase this period
    | 'BY_VALUE';         // Top per value

export type LeaderboardTimeframe =
    | 'THIS_WEEK'
    | 'THIS_MONTH'
    | 'THIS_QUARTER'
    | 'ALL_TIME';

export interface LeaderboardEntry {
    rank: number;
    previousRank?: number; // For showing rank changes
    userId: string;
    userName: string;
    userAvatar?: string;
    userTitle?: string;
    userTeam?: string;
    score: number;
    change?: number;      // Delta from previous period
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export type ToastNotificationType =
    | 'RECOGNIZED'           // You were recognized
    | 'REACTION'             // Someone reacted
    | 'COMMENT'              // Someone commented
    | 'MENTION'              // You were @mentioned
    | 'BADGE_EARNED'         // You earned a badge
    | 'AWARD_EARNED'         // You earned an award
    | 'LEADERBOARD_RANK'     // You moved up in leaderboard
    | 'GRATITUDE_CHAIN';     // Prompt to pass it forward

export interface ToastNotification {
    id: string;
    type: ToastNotificationType;
    userId: string;
    recognitionId?: string;
    message: string;
    read: boolean;
    createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGES
// ═══════════════════════════════════════════════════════════════════════════

export type ImageCategory =
    | 'CELEBRATION'
    | 'TEAMWORK'
    | 'INNOVATION'
    | 'CARE'
    | 'INTEGRITY'
    | 'GRATITUDE';

export interface ToastImage {
    id: string;
    name: string;
    description: string;
    category: ImageCategory;
    recommendedValues: CompanyValue[];
    mood: string[];
    altText: string;
    thumbnailUrl: string;
    fullUrl: string;
    usageCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export interface ToastAnalytics {
    totalRecognitions: number;
    totalCreditsAwarded: number;
    activeUsers: number;

    // By time
    recognitionsByDay: { date: string; count: number }[];

    // By value
    recognitionsByValue: Record<CompanyValue, number>;

    // By type
    recognitionsByType: Record<RecognitionType, number>;

    // Top performers
    topReceivers: LeaderboardEntry[];
    topGivers: LeaderboardEntry[];

    // Expert area growth
    expertAreaGrowth: { area: string; growth: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT SYSTEM CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const CREDIT_VALUES = {
    // Quick Toast
    QUICK_TOAST_RECIPIENT: 5,
    QUICK_TOAST_GIVER: 2,

    // Standing Ovation
    STANDING_OVATION_RECIPIENT: 25,
    STANDING_OVATION_GIVER: 5,

    // Team Toast (per member)
    TEAM_TOAST_RECIPIENT: 15,
    TEAM_TOAST_GIVER: 3,

    // Expert Area Boost
    EXPERT_AREA_BOOST: 10,

    // Award Bonus
    AWARD_BONUS: 50,
} as const;

export const ANTI_GAMING_LIMITS = {
    DAILY_QUICK_TOASTS: 3,
    DAILY_STANDING_OVATIONS: 1,
    SAME_PERSON_COOLDOWN_HOURS: 24,
    MONTHLY_CAP_FROM_SINGLE_PERSON: 500,
    RECIPROCAL_REDUCTION_PERCENT: 50, // Reduce credits by 50% for mutual recognition
} as const;
