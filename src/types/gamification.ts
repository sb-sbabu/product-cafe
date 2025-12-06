/**
 * Gamification Types - Love Points System
 * 
 * Core type definitions for the Product Café gamification engine.
 */

// ============================================================================
// POINT SYSTEM TYPES
// ============================================================================

export type PointCategory = 'discussion' | 'content' | 'community' | 'lop';

export type PointAction =
    // Discussion Points (💬)
    | 'ask_question'
    | 'question_upvoted_5'
    | 'question_upvoted_10'
    | 'question_frequently_asked'
    | 'post_answer'
    | 'answer_upvoted'
    | 'answer_accepted'
    | 'answer_promoted_faq'
    | 'answer_best'
    | 'first_answer_bonus'
    | 'expertise_area_bonus'
    | 'answer_upvoted_10'
    // Voting & Reactions (🗳️)
    | 'give_upvote'
    | 'give_reaction'
    | 'receive_reaction'
    | 'vote_on_accepted'
    // Content Points (📚)
    | 'submit_resource'
    | 'resource_approved'
    | 'resource_views_50'
    | 'resource_views_100'
    | 'report_outdated'
    // LOP Points (🎙️)
    | 'submit_lop_topic'
    | 'topic_upvoted_10'
    | 'topic_scheduled'
    | 'speak_at_lop'
    | 'lop_views_50'
    | 'watch_lop'
    | 'complete_learning_path'
    // Community Points (🤝)
    | 'welcome_member'
    | 'mentor_tag'
    | 'invite_colleague'
    | 'profile_completed'
    | 'first_contribution';

export interface PointActionConfig {
    action: PointAction;
    points: number;
    category: PointCategory;
    dailyLimit?: number;
    description: string;
    recipient: 'actor' | 'target' | 'both';
}

export interface PointTransaction {
    id: string;
    recipientId: string;
    action: PointAction;
    points: number;
    timestamp: string;
    context?: {
        discussionId?: string;
        answerId?: string;
        resourceId?: string;
        lopSessionId?: string;
        triggeredByUserId?: string;
    };
}

export interface DailyActionCount {
    [action: string]: number;
}

export interface PointsState {
    totalPoints: number;
    pointsByCategory: Record<PointCategory, number>;
    history: PointTransaction[];
    dailyActionCounts: DailyActionCount;
    lastResetDate: string;
}

// ============================================================================
// LEVEL SYSTEM TYPES
// ============================================================================

export interface Level {
    id: number;
    name: string;
    icon: string;
    minPoints: number;
    maxPoints: number | null; // null for top level
    tagline: string;
    privileges: string[];
}

export const LEVELS: Level[] = [
    {
        id: 1,
        name: 'Café Newcomer',
        icon: '☕',
        minPoints: 0,
        maxPoints: 99,
        tagline: 'Just walked in. Getting the lay of the land.',
        privileges: [],
    },
    {
        id: 2,
        name: 'Café Regular',
        icon: '☕☕',
        minPoints: 100,
        maxPoints: 499,
        tagline: 'Knows where to find the good stuff.',
        privileges: ['Can vote on topic suggestions'],
    },
    {
        id: 3,
        name: 'Café Contributor',
        icon: '☕☕☕',
        minPoints: 500,
        maxPoints: 1499,
        tagline: 'A familiar face who always helps out.',
        privileges: ['Can suggest resources for curation'],
    },
    {
        id: 4,
        name: 'Café Expert',
        icon: '🌟',
        minPoints: 1500,
        maxPoints: 4999,
        tagline: 'The person you want to ask.',
        privileges: ['Highlighted in expert searches', 'Can mentor new members'],
    },
    {
        id: 5,
        name: 'Café Master',
        icon: '🌟🌟',
        minPoints: 5000,
        maxPoints: 14999,
        tagline: 'A pillar of the community.',
        privileges: ['Can nominate content for FAQ promotion'],
    },
    {
        id: 6,
        name: 'Café Champion',
        icon: '💎',
        minPoints: 15000,
        maxPoints: null,
        tagline: 'A legend of Product Café.',
        privileges: ['Featured on leaderboards', 'Advisory input'],
    },
];

// ============================================================================
// BADGE SYSTEM TYPES
// ============================================================================

export type BadgeCategory = 'milestone' | 'domain' | 'special';
export type BadgeTier = 1 | 2 | 3;

export interface BadgeDefinition {
    id: string;
    name: string;
    icon: string;
    category: BadgeCategory;
    tier?: BadgeTier;
    description: string;
    requirement: BadgeRequirement;
}

export type BadgeRequirement =
    | { type: 'count'; metric: string; threshold: number }
    | { type: 'domain'; domain: string; acceptedCount: number }
    | { type: 'special'; condition: string }
    | { type: 'one_time'; action: string };

export interface EarnedBadge {
    badgeId: string;
    earnedAt: string;
    context?: {
        discussionId?: string;
        lopSessionId?: string;
    };
}

export interface BadgeProgress {
    badgeId: string;
    currentValue: number;
    targetValue: number;
    percentComplete: number;
}

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export const MILESTONE_BADGES: BadgeDefinition[] = [
    // First Steps
    {
        id: 'first_question',
        name: 'First Question',
        icon: '🐣',
        category: 'milestone',
        description: 'Asked your first question',
        requirement: { type: 'one_time', action: 'ask_question' },
    },
    {
        id: 'first_answer',
        name: 'First Answer',
        icon: '💡',
        category: 'milestone',
        description: 'Posted your first answer',
        requirement: { type: 'one_time', action: 'post_answer' },
    },
    {
        id: 'first_accepted',
        name: 'First Accepted',
        icon: '✅',
        category: 'milestone',
        description: 'Had an answer accepted',
        requirement: { type: 'one_time', action: 'answer_accepted' },
    },
    {
        id: 'first_faq',
        name: 'First FAQ',
        icon: '📋',
        category: 'milestone',
        description: 'Answer promoted to FAQ',
        requirement: { type: 'one_time', action: 'answer_promoted_faq' },
    },
    {
        id: 'first_lop',
        name: 'First LOP',
        icon: '🎙️',
        category: 'milestone',
        description: 'Watched your first LOP session',
        requirement: { type: 'one_time', action: 'watch_lop' },
    },
    // Quantity Milestones - Questions
    {
        id: 'curious_1',
        name: 'Curious I',
        icon: '❓',
        category: 'milestone',
        tier: 1,
        description: 'Asked 10 questions',
        requirement: { type: 'count', metric: 'questions_asked', threshold: 10 },
    },
    {
        id: 'curious_2',
        name: 'Curious II',
        icon: '❓❓',
        category: 'milestone',
        tier: 2,
        description: 'Asked 50 questions',
        requirement: { type: 'count', metric: 'questions_asked', threshold: 50 },
    },
    {
        id: 'curious_3',
        name: 'Curious III',
        icon: '❓❓❓',
        category: 'milestone',
        tier: 3,
        description: 'Asked 100 questions',
        requirement: { type: 'count', metric: 'questions_asked', threshold: 100 },
    },
    // Quantity Milestones - Answers
    {
        id: 'helper_1',
        name: 'Helper I',
        icon: '💬',
        category: 'milestone',
        tier: 1,
        description: 'Posted 10 answers',
        requirement: { type: 'count', metric: 'answers_posted', threshold: 10 },
    },
    {
        id: 'helper_2',
        name: 'Helper II',
        icon: '💬💬',
        category: 'milestone',
        tier: 2,
        description: 'Posted 50 answers',
        requirement: { type: 'count', metric: 'answers_posted', threshold: 50 },
    },
    {
        id: 'helper_3',
        name: 'Helper III',
        icon: '💬💬💬',
        category: 'milestone',
        tier: 3,
        description: 'Posted 100 answers',
        requirement: { type: 'count', metric: 'answers_posted', threshold: 100 },
    },
    // Quantity Milestones - Accepted
    {
        id: 'solver_1',
        name: 'Solver I',
        icon: '✅',
        category: 'milestone',
        tier: 1,
        description: '5 accepted answers',
        requirement: { type: 'count', metric: 'accepted_answers', threshold: 5 },
    },
    {
        id: 'solver_2',
        name: 'Solver II',
        icon: '✅✅',
        category: 'milestone',
        tier: 2,
        description: '25 accepted answers',
        requirement: { type: 'count', metric: 'accepted_answers', threshold: 25 },
    },
    {
        id: 'solver_3',
        name: 'Solver III',
        icon: '✅✅✅',
        category: 'milestone',
        tier: 3,
        description: '50 accepted answers',
        requirement: { type: 'count', metric: 'accepted_answers', threshold: 50 },
    },
    // Quantity Milestones - FAQs
    {
        id: 'curator_1',
        name: 'Curator I',
        icon: '📋',
        category: 'milestone',
        tier: 1,
        description: '1 FAQ created',
        requirement: { type: 'count', metric: 'faqs_created', threshold: 1 },
    },
    {
        id: 'curator_2',
        name: 'Curator II',
        icon: '📋📋',
        category: 'milestone',
        tier: 2,
        description: '5 FAQs created',
        requirement: { type: 'count', metric: 'faqs_created', threshold: 5 },
    },
    {
        id: 'curator_3',
        name: 'Curator III',
        icon: '📋📋📋',
        category: 'milestone',
        tier: 3,
        description: '10 FAQs created',
        requirement: { type: 'count', metric: 'faqs_created', threshold: 10 },
    },
];

export const DOMAIN_BADGES: BadgeDefinition[] = [
    // Product Craft
    { id: 'prd_expert', name: 'PRD Expert', icon: '📋', category: 'domain', description: 'PRD, documentation', requirement: { type: 'domain', domain: 'prd', acceptedCount: 5 } },
    { id: 'roadmap_expert', name: 'Roadmap Expert', icon: '🗺️', category: 'domain', description: 'Roadmapping, prioritization', requirement: { type: 'domain', domain: 'roadmap', acceptedCount: 5 } },
    { id: 'metrics_expert', name: 'Metrics Expert', icon: '📊', category: 'domain', description: 'Analytics, measurement', requirement: { type: 'domain', domain: 'metrics', acceptedCount: 5 } },
    { id: 'discovery_expert', name: 'Discovery Expert', icon: '🔬', category: 'domain', description: 'User research, discovery', requirement: { type: 'domain', domain: 'discovery', acceptedCount: 5 } },
    { id: 'strategy_expert', name: 'Strategy Expert', icon: '🎯', category: 'domain', description: 'Strategy, OKRs', requirement: { type: 'domain', domain: 'strategy', acceptedCount: 5 } },
    // Healthcare
    { id: 'healthcare_expert', name: 'Healthcare Expert', icon: '🏥', category: 'domain', description: 'General healthcare', requirement: { type: 'domain', domain: 'healthcare', acceptedCount: 5 } },
    { id: 'rcm_expert', name: 'RCM Expert', icon: '💰', category: 'domain', description: 'Revenue cycle management', requirement: { type: 'domain', domain: 'rcm', acceptedCount: 5 } },
    { id: 'cob_expert', name: 'COB Expert', icon: '🔄', category: 'domain', description: 'Coordination of benefits', requirement: { type: 'domain', domain: 'cob', acceptedCount: 5 } },
    { id: 'compliance_expert', name: 'Compliance Expert', icon: '📜', category: 'domain', description: 'HIPAA, regulations', requirement: { type: 'domain', domain: 'compliance', acceptedCount: 5 } },
    { id: 'claims_expert', name: 'Claims Expert', icon: '💳', category: 'domain', description: 'Claims, adjudication', requirement: { type: 'domain', domain: 'claims', acceptedCount: 5 } },
    // Tools
    { id: 'jira_expert', name: 'Jira Expert', icon: '⚙️', category: 'domain', description: 'Jira, issue tracking', requirement: { type: 'domain', domain: 'jira', acceptedCount: 5 } },
    { id: 'confluence_expert', name: 'Confluence Expert', icon: '📝', category: 'domain', description: 'Confluence, documentation', requirement: { type: 'domain', domain: 'confluence', acceptedCount: 5 } },
];

export const SPECIAL_BADGES: BadgeDefinition[] = [
    { id: 'lop_speaker', name: 'LOP Speaker', icon: '🎙️', category: 'special', description: 'Delivered a LOP session', requirement: { type: 'special', condition: 'lop_sessions >= 1' } },
    { id: 'lop_veteran', name: 'LOP Veteran', icon: '🎙️🎙️', category: 'special', description: 'Delivered 3+ LOP sessions', requirement: { type: 'special', condition: 'lop_sessions >= 3' } },
    { id: 'rising_star', name: 'Rising Star', icon: '🌟', category: 'special', description: 'Fastest to 500 points (monthly)', requirement: { type: 'special', condition: 'monthly_fastest_500' } },
    { id: 'hot_streak', name: 'Hot Streak', icon: '🔥', category: 'special', description: '10+ accepted answers in a month', requirement: { type: 'special', condition: 'monthly_accepted >= 10' } },
    { id: 'welcomer', name: 'Welcomer', icon: '🤝', category: 'special', description: 'Helped 10+ new members', requirement: { type: 'special', condition: 'welcomes >= 10' } },
    { id: 'mentor', name: 'Mentor', icon: '🎓', category: 'special', description: 'Mentored a new hire through onboarding', requirement: { type: 'special', condition: 'mentored_users >= 1' } },
    { id: 'path_completer', name: 'Path Completer', icon: '📚', category: 'special', description: 'Completed all LOP learning paths', requirement: { type: 'special', condition: 'all_paths_completed' } },
    { id: 'quarterly_champion', name: 'Quarterly Champion', icon: '🏆', category: 'special', description: 'Most points in a quarter', requirement: { type: 'special', condition: 'quarterly_top' } },
    { id: 'founding_member', name: 'Founding Member', icon: '💎', category: 'special', description: 'Active in first month of Product Café', requirement: { type: 'special', condition: 'founding_member' } },
];

export const ALL_BADGES: BadgeDefinition[] = [
    ...MILESTONE_BADGES,
    ...DOMAIN_BADGES,
    ...SPECIAL_BADGES,
];

// ============================================================================
// REACTION SYSTEM TYPES
// ============================================================================

export type ReactionType =
    | 'helpful'      // 👍
    | 'love'         // ❤️
    | 'awesome'      // 🎉
    | 'thinking'     // 🤔
    | 'insightful'   // 💡
    | 'thanks'       // 🙏
    | 'this'         // ✅
    | 'learned'      // 📚
    | 'fire'         // 🔥
    | 'perfect';     // 💯

export interface Reaction {
    type: ReactionType;
    userId: string;
    timestamp: string;
}

export const REACTION_CONFIG: Record<ReactionType, { icon: string; label: string }> = {
    helpful: { icon: '👍', label: 'Helpful' },
    love: { icon: '❤️', label: 'Love It' },
    awesome: { icon: '🎉', label: 'Awesome' },
    thinking: { icon: '🤔', label: 'Thinking' },
    insightful: { icon: '💡', label: 'Insightful' },
    thanks: { icon: '🙏', label: 'Thanks' },
    this: { icon: '✅', label: 'This!' },
    learned: { icon: '📚', label: 'Learned' },
    fire: { icon: '🔥', label: 'Fire' },
    perfect: { icon: '💯', label: 'Perfect' },
};

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export type LeaderboardType = 'all_time' | 'monthly' | 'domain';

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    level: Level;
    points: number;
    rank: number;
    badges: string[]; // top 3 badge IDs
    topActivity?: string;
}

export interface Leaderboard {
    type: LeaderboardType;
    domain?: string;
    period?: string; // e.g., "2025-01" for monthly
    entries: LeaderboardEntry[];
    lastUpdated: string;
}

// ============================================================================
// USER GAMIFICATION PROFILE
// ============================================================================

export interface UserGamificationProfile {
    userId: string;
    points: PointsState;
    level: Level;
    earnedBadges: EarnedBadge[];
    stats: {
        questionsAsked: number;
        answersPosted: number;
        acceptedAnswers: number;
        faqsCreated: number;
        upvotesGiven: number;
        upvotesReceived: number;
        reactionsGiven: number;
        reactionsReceived: number;
        lopSessionsWatched: number;
        lopSessionsSpoken: number;
    };
    domainContributions: Record<string, number>; // domain -> accepted answer count
    rankings: {
        allTime: number;
        monthly: number;
        domain?: Record<string, number>;
    };
}
