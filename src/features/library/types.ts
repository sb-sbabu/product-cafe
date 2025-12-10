// Library 10x - Core Type Definitions

export type BookDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type PathType = 'career' | 'skill';
export type PersonaType = 'ic-pm' | 'senior-pm' | 'product-lead' | 'director' | 'technical-pm';

export interface Author {
    id: string;
    name: string;
    bio: string;
    photoUrl?: string;
    expertise: string[];
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
}

export interface Book {
    id: string;
    title: string;
    subtitle?: string;
    authorIds: string[];
    coverUrl: string;
    isbn?: string;
    pageCount: number;
    publishedYear: number;
    collections: string[];
    tags: string[];
    aiSummary?: string;
    keyTakeaways: string[];
    readingTimeHours: number;
    difficulty: BookDifficulty;
    rating: number;
    reviewCount: number;
    amazonUrl?: string;
    description: string;
    whyShouldRead: string[];
}

export interface Collection {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    bookIds: string[];
    featured?: boolean;
}

export interface PathModule {
    id: string;
    title: string;
    description: string;
    bookIds: string[];
    videoIds?: string[];
    resourceIds?: string[];
    durationWeeks: number;
    order: number;
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    type: PathType;
    icon: string;
    color: string;
    targetPersonas: PersonaType[];
    modules: PathModule[];
    durationWeeks: number;
    prerequisites: string[];
    featured?: boolean;
}

// User-specific types
export interface ReadingListItem {
    bookId: string;
    addedAt: string;
    priority: number;
    notes?: string;
}

export interface BookProgress {
    bookId: string;
    progress: number; // 0-100
    startedAt: string;
    lastReadAt: string;
    completedAt?: string;
    pagesRead: number;
}

export interface Highlight {
    id: string;
    bookId: string;
    text: string;
    pageNumber?: number;
    chapter?: string;
    notes?: string;
    tags: string[];
    createdAt: string;
}

export interface PathEnrollment {
    pathId: string;
    enrolledAt: string;
    currentModuleIndex: number;
    completedModuleIds: string[];
    completedBookIds: string[];
}

export interface ReadingGoal {
    booksPerYear: number;
    booksCompleted: number;
    yearStarted: number;
}

export interface UserLibrary {
    userId: string;
    readingList: ReadingListItem[];
    bookProgress: BookProgress[];
    completedBookIds: string[];
    highlights: Highlight[];
    activePaths: PathEnrollment[];
    readingGoal: ReadingGoal;
}

// UI State types
export interface LibraryFilters {
    collection?: string;
    difficulty?: BookDifficulty;
    search?: string;
    tags?: string[];
}
