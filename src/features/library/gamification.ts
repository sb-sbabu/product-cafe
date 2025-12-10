// Library Gamification & Credits System
// Rewards users for learning activities: reading, completing paths, quizzes, etc.

export interface CreditActivity {
    id: string;
    type: 'book_complete' | 'book_progress' | 'path_enroll' | 'path_complete' |
    'module_complete' | 'quiz_complete' | 'highlight_add' | 'streak_bonus' |
    'article_read' | 'resource_view';
    description: string;
    credits: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface UserCredits {
    totalCredits: number;
    currentStreak: number; // days of consecutive activity
    longestStreak: number;
    level: number;
    activities: CreditActivity[];
    badges: Badge[];
    lastActivityDate: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Credit values for different activities
export const CREDIT_VALUES: Record<string, number> = {
    // Books
    book_start: 5,          // Starting a book
    book_25_percent: 10,    // Reaching 25%
    book_50_percent: 15,    // Reaching 50%
    book_75_percent: 20,    // Reaching 75%
    book_complete: 50,      // Completing a book
    book_progress: 5,       // General progress update

    // Learning Paths
    path_enroll: 10,        // Enrolling in a path
    module_complete: 25,    // Completing a module
    path_complete: 100,     // Completing entire path

    // Engagement
    highlight_add: 2,       // Adding a highlight
    note_add: 3,            // Adding a note
    resource_view: 1,       // Viewing an internal resource
    article_read: 5,        // Reading an article
    streak_bonus: 10,       // Streak bonus

    // Quizzes
    quiz_attempt: 5,        // Attempting a quiz
    quiz_complete: 15,      // Completing a quiz
    quiz_pass: 15,          // Passing a quiz (≥70%)
    quiz_perfect: 30,       // Perfect score on quiz

    // Streaks
    streak_3_days: 15,      // 3-day streak bonus
    streak_7_days: 50,      // Weekly streak bonus
    streak_30_days: 200,    // Monthly streak bonus
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
    { level: 1, minCredits: 0, title: 'Curious Learner', icon: '🌱' },
    { level: 2, minCredits: 50, title: 'Page Turner', icon: '📖' },
    { level: 3, minCredits: 150, title: 'Knowledge Seeker', icon: '🔍' },
    { level: 4, minCredits: 300, title: 'Book Worm', icon: '🐛' },
    { level: 5, minCredits: 500, title: 'Scholar', icon: '📚' },
    { level: 6, minCredits: 750, title: 'Thought Leader', icon: '💭' },
    { level: 7, minCredits: 1000, title: 'PM Expert', icon: '⭐' },
    { level: 8, minCredits: 1500, title: 'Knowledge Master', icon: '🏆' },
    { level: 9, minCredits: 2500, title: 'Library Legend', icon: '👑' },
    { level: 10, minCredits: 5000, title: 'Product Sage', icon: '🧙' },
];

// Badge definitions
export const BADGE_DEFINITIONS = [
    // Reading badges
    { id: 'first_book', name: 'First Chapter', description: 'Complete your first book', tier: 'bronze' as const, icon: '📗' },
    { id: '5_books', name: 'Bookworm', description: 'Complete 5 books', tier: 'silver' as const, icon: '📚' },
    { id: '10_books', name: 'Voracious Reader', description: 'Complete 10 books', tier: 'gold' as const, icon: '📖' },
    { id: '25_books', name: 'Library Master', description: 'Complete 25 books', tier: 'platinum' as const, icon: '🏛️' },

    // Path badges
    { id: 'first_path', name: 'Pathfinder', description: 'Complete your first learning path', tier: 'bronze' as const, icon: '🗺️' },
    { id: 'skill_master', name: 'Skill Master', description: 'Complete 3 skill paths', tier: 'gold' as const, icon: '🎯' },
    { id: 'career_climber', name: 'Career Climber', description: 'Complete a career path', tier: 'silver' as const, icon: '🪜' },

    // Engagement badges
    { id: 'highlighter', name: 'Highlighter', description: 'Add 10 highlights', tier: 'bronze' as const, icon: '🖍️' },
    { id: 'note_taker', name: 'Note Taker', description: 'Add 25 notes', tier: 'silver' as const, icon: '📝' },

    // Streak badges
    { id: 'streak_week', name: 'Consistent Learner', description: '7-day learning streak', tier: 'bronze' as const, icon: '🔥' },
    { id: 'streak_month', name: 'Dedicated Scholar', description: '30-day learning streak', tier: 'gold' as const, icon: '🌟' },

    // Special badges
    { id: 'pm_foundations', name: 'PM Foundations', description: 'Read all PM Foundations books', tier: 'gold' as const, icon: '🎓' },
    { id: 'early_bird', name: 'Early Bird', description: 'Learn before 7am', tier: 'bronze' as const, icon: '🌅' },
    { id: 'night_owl', name: 'Night Owl', description: 'Learn after 10pm', tier: 'bronze' as const, icon: '🦉' },
];

// Helper functions
export function getLevelInfo(credits: number) {
    const level = LEVEL_THRESHOLDS.slice().reverse().find(l => credits >= l.minCredits) || LEVEL_THRESHOLDS[0];
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.minCredits > credits);
    const progressToNext = nextLevel
        ? ((credits - level.minCredits) / (nextLevel.minCredits - level.minCredits)) * 100
        : 100;

    return {
        ...level,
        nextLevel,
        progressToNext: Math.min(progressToNext, 100),
        creditsToNext: nextLevel ? nextLevel.minCredits - credits : 0
    };
}

export function getActivityDescription(type: CreditActivity['type']): string {
    const descriptions: Record<CreditActivity['type'], string> = {
        book_complete: 'Completed a book',
        book_progress: 'Made reading progress',
        path_enroll: 'Enrolled in a learning path',
        path_complete: 'Completed a learning path',
        module_complete: 'Completed a module',
        quiz_complete: 'Completed a quiz',
        highlight_add: 'Added a highlight',
        streak_bonus: 'Streak bonus',
        article_read: 'Read an article',
        resource_view: 'Viewed a resource'
    };
    return descriptions[type] || 'Learning activity';
}

// Initial user credits state
export const initialUserCredits: UserCredits = {
    totalCredits: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    activities: [],
    badges: [],
    lastActivityDate: ''
};
