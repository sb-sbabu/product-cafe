// ═══════════════════════════════════════════════════════════════════════════
// LOP (Love of Product) Types
// Data models for sessions, learning paths, and topic suggestions
// ═══════════════════════════════════════════════════════════════════════════

export interface LOPSpeaker {
    id: string;
    name: string;
    title: string;
    team?: string;
    avatarUrl?: string;
    email?: string;
}

export interface LOPChapter {
    timestamp: string;      // "05:23"
    seconds: number;        // 323
    title: string;
}

export interface LOPResourceLink {
    title: string;
    url: string;
    type: 'article' | 'tool' | 'book' | 'internal' | 'template';
}

export interface LOPSession {
    id: string;
    sessionNumber: number;              // LOP #12
    slug: string;                       // URL-friendly: "customer-discovery-at-scale"

    // Core Content
    title: string;
    subtitle?: string;
    description: string;

    // Scheduling
    sessionDate: string;                // ISO date
    status: 'upcoming' | 'live' | 'completed';
    duration?: number;                  // Minutes (for completed sessions)

    // Speaker
    speaker: LOPSpeaker;

    // Media
    videoUrl?: string;
    thumbnailUrl?: string;

    // Materials
    slidesUrl?: string;
    notesUrl?: string;
    resourceLinks?: LOPResourceLink[];

    // Structure
    chapters?: LOPChapter[];
    keyTakeaways?: string[];

    // Classification
    topics: string[];
    pillar: 'product-craft' | 'healthcare' | 'internal-playbook';
    difficulty: 'beginner' | 'intermediate' | 'advanced';

    // Curation
    isFeatured: boolean;
    isEssential: boolean;               // Part of "LOP Essentials" path
    learningPaths?: string[];

    // Engagement
    viewCount: number;
    likeCount: number;
    discussionCount: number;

    // Related
    relatedSessionIds?: string[];
}

export interface LOPLearningPath {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;                       // Emoji
    sessionIds: string[];               // Ordered
    totalDuration: number;              // Minutes (calculated)
    targetAudience: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isActive: boolean;
    displayOrder: number;
}

export interface LOPTopicSuggestion {
    id: string;
    title: string;
    description?: string;
    submittedBy: {
        name: string;
        email: string;
    };
    submittedAt: string;                // ISO date
    status: 'submitted' | 'under-review' | 'scheduled' | 'declined';
    upvotes: number;
    upvotedBy: string[];                // User emails
    scheduledSessionId?: string;        // If it became a session
}

export interface LOPUserProgress {
    sessionId: string;
    watchedSeconds: number;
    completed: boolean;
    completedAt?: string;
    likedAt?: string;
}

// View types for UI
export type LOPViewMode = 'grid' | 'list';
export type LOPSortOption = 'newest' | 'oldest' | 'most-viewed' | 'most-liked';
export type LOPFilterTopic = string | 'all';
export type LOPFilterSpeaker = string | 'all';
export type LOPFilterYear = number | 'all';
export type LOPFilterDifficulty = LOPSession['difficulty'] | 'all';
