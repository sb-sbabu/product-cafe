import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Book,
    Author,
    Collection,
    LearningPath,
    UserLibrary,
    ReadingListItem,
    BookProgress,
    Highlight,
    PathEnrollment,
    LibraryFilters
} from './types';
import type { UserCredits, CreditActivity } from './gamification';
import { initialUserCredits, CREDIT_VALUES, BADGE_DEFINITIONS, getLevelInfo } from './gamification';
import {
    BOOKS,
    getBookById,
    getBooksByCollection,
    searchBooks,
    AUTHORS,
    getAuthorById,
    COLLECTIONS,
    getCollectionById,
    getFeaturedCollections,
    LEARNING_PATHS,
    getPathById,
    getCareerPaths,
    getSkillPaths
} from './data';

interface LibraryState {
    // Static data accessors
    books: Book[];
    authors: Author[];
    collections: Collection[];
    paths: LearningPath[];

    // UI state
    filters: LibraryFilters;
    searchQuery: string;
    currentView: 'hub' | 'book' | 'path';
    selectedBookId: string | null;
    selectedPathId: string | null;

    // User data
    userLibrary: UserLibrary;
    userCredits: UserCredits;

    // Actions - Data accessors
    getBook: (id: string) => Book | undefined;
    getAuthor: (id: string) => Author | undefined;
    getCollection: (id: string) => Collection | undefined;
    getPath: (id: string) => LearningPath | undefined;
    getBooksForCollection: (collectionId: string) => Book[];
    getFilteredBooks: () => Book[];
    getFeaturedCollections: () => Collection[];
    getCareerPaths: () => LearningPath[];
    getSkillPaths: () => LearningPath[];

    // Actions - UI
    setFilters: (filters: Partial<LibraryFilters>) => void;
    clearFilters: () => void;
    setSelectedBook: (bookId: string | null) => void;
    setSelectedPath: (pathId: string | null) => void;
    setSearchQuery: (query: string) => void;

    // Actions - Reading List
    addToReadingList: (bookId: string, priority?: number) => void;
    removeFromReadingList: (bookId: string) => void;
    updateReadingListPriority: (bookId: string, priority: number) => void;
    isInReadingList: (bookId: string) => boolean;

    // Actions - Progress
    updateBookProgress: (bookId: string, progress: number, pagesRead?: number) => void;
    markBookComplete: (bookId: string) => void;
    getBookProgress: (bookId: string) => BookProgress | undefined;

    // Actions - Highlights
    addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
    removeHighlight: (highlightId: string) => void;
    getHighlightsForBook: (bookId: string) => Highlight[];

    // Actions - Paths
    enrollInPath: (pathId: string) => void;
    unenrollFromPath: (pathId: string) => void;
    completePathModule: (pathId: string, moduleId: string) => void;
    getPathEnrollment: (pathId: string) => PathEnrollment | undefined;
    isEnrolledInPath: (pathId: string) => boolean;
    getPathProgress: (pathId: string) => number;
    getModuleProgress: (pathId: string, moduleId: string) => number;
    completeModule: (pathId: string, moduleId: string) => void;

    // Actions - Goals
    setReadingGoal: (booksPerYear: number) => void;
    getReadingStats: () => {
        booksCompleted: number;
        booksInProgress: number;
        booksInList: number;
        goalProgress: number;
        highlightsCount: number;
    };

    // Actions - Credits
    earnCredits: (type: CreditActivity['type'], description: string, metadata?: Record<string, unknown>) => void;
    checkAndAwardBadges: () => void;

    // Actions - View
    navigateToBook: (bookId: string) => void;
    navigateToPath: (pathId: string) => void;
    navigateToHub: () => void;
}

// Demo data - 4 months of reading activity
const fourMonthsAgo = new Date();
fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const twoWeeksAgo = new Date();
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

const initialUserLibrary: UserLibrary = {
    userId: 'demo-user',
    readingList: [
        { bookId: 'playing-to-win', addedAt: oneMonthAgo.toISOString(), priority: 1 },
        { bookId: 'designing-ml-systems', addedAt: twoWeeksAgo.toISOString(), priority: 2 },
        { bookId: 'radical-candor', addedAt: new Date().toISOString(), priority: 3 },
    ],
    bookProgress: [
        // Completed books
        { bookId: 'inspired', progress: 100, startedAt: fourMonthsAgo.toISOString(), lastReadAt: threeMonthsAgo.toISOString(), completedAt: threeMonthsAgo.toISOString(), pagesRead: 368 },
        { bookId: 'mom-test', progress: 100, startedAt: fourMonthsAgo.toISOString(), lastReadAt: fourMonthsAgo.toISOString(), completedAt: fourMonthsAgo.toISOString(), pagesRead: 130 },
        { bookId: 'continuous-discovery', progress: 100, startedAt: threeMonthsAgo.toISOString(), lastReadAt: twoMonthsAgo.toISOString(), completedAt: twoMonthsAgo.toISOString(), pagesRead: 240 },
        { bookId: 'sprint', progress: 100, startedAt: twoMonthsAgo.toISOString(), lastReadAt: oneMonthAgo.toISOString(), completedAt: oneMonthAgo.toISOString(), pagesRead: 274 },
        { bookId: 'deep-work', progress: 100, startedAt: twoMonthsAgo.toISOString(), lastReadAt: oneMonthAgo.toISOString(), completedAt: oneMonthAgo.toISOString(), pagesRead: 296 },
        { bookId: 'essentialism', progress: 100, startedAt: oneMonthAgo.toISOString(), lastReadAt: twoWeeksAgo.toISOString(), completedAt: twoWeeksAgo.toISOString(), pagesRead: 272 },
        { bookId: 'good-strategy-bad-strategy', progress: 100, startedAt: oneMonthAgo.toISOString(), lastReadAt: twoWeeksAgo.toISOString(), completedAt: twoWeeksAgo.toISOString(), pagesRead: 336 },
        // In progress
        { bookId: 'empowered', progress: 65, startedAt: twoWeeksAgo.toISOString(), lastReadAt: new Date().toISOString(), pagesRead: 280 },
        { bookId: 'playing-to-win', progress: 30, startedAt: oneMonthAgo.toISOString(), lastReadAt: new Date().toISOString(), pagesRead: 82 },
    ],
    completedBookIds: ['inspired', 'mom-test', 'continuous-discovery', 'sprint', 'deep-work', 'essentialism', 'good-strategy-bad-strategy'],
    highlights: [
        { id: 'h1', bookId: 'inspired', text: 'Empowered product teams vs feature teams is the key distinction.', pageNumber: 45, tags: ['teams', 'empowerment'], createdAt: threeMonthsAgo.toISOString() },
        { id: 'h2', bookId: 'continuous-discovery', text: 'The Opportunity Solution Tree helps connect discovery to delivery.', pageNumber: 87, tags: ['discovery', 'framework'], createdAt: twoMonthsAgo.toISOString() },
        { id: 'h3', bookId: 'deep-work', text: 'Deep work is the superpower of the 21st century.', pageNumber: 12, tags: ['focus', 'productivity'], createdAt: oneMonthAgo.toISOString() },
    ],
    activePaths: [
        { pathId: 'ic-to-senior', enrolledAt: threeMonthsAgo.toISOString(), currentModuleIndex: 2, completedModuleIds: ['m1', 'm2'], completedBookIds: ['inspired', 'continuous-discovery'] },
        { pathId: 'product-strategy', enrolledAt: oneMonthAgo.toISOString(), currentModuleIndex: 0, completedModuleIds: [], completedBookIds: [] },
    ],
    readingGoal: {
        booksPerYear: 12,
        booksCompleted: 7,
        yearStarted: new Date().getFullYear()
    }
};

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set, get) => ({
            // Static data
            books: BOOKS,
            authors: AUTHORS,
            collections: COLLECTIONS,
            paths: LEARNING_PATHS,

            // UI state
            filters: {},
            selectedBookId: null,
            selectedPathId: null,
            searchQuery: '',
            currentView: 'hub' as const,

            // User data
            userLibrary: initialUserLibrary,
            userCredits: initialUserCredits,

            // Data accessors
            getBook: (id) => getBookById(id),
            getAuthor: (id) => getAuthorById(id),
            getCollection: (id) => getCollectionById(id),
            getPath: (id) => getPathById(id),
            getBooksForCollection: (collectionId) => getBooksByCollection(collectionId),

            getFeaturedCollections: () => getFeaturedCollections(),
            getCareerPaths: () => getCareerPaths(),
            getSkillPaths: () => getSkillPaths(),

            getFilteredBooks: () => {
                const { filters, searchQuery } = get();
                let result = BOOKS;

                if (searchQuery) {
                    result = searchBooks(searchQuery);
                }

                if (filters.collection) {
                    result = result.filter(b => b.collections.includes(filters.collection!));
                }

                if (filters.difficulty) {
                    result = result.filter(b => b.difficulty === filters.difficulty);
                }

                if (filters.tags && filters.tags.length > 0) {
                    result = result.filter(b =>
                        filters.tags!.some(tag => b.tags.includes(tag))
                    );
                }

                return result;
            },

            // UI actions
            setFilters: (newFilters) => set(state => ({
                filters: { ...state.filters, ...newFilters }
            })),

            clearFilters: () => set({ filters: {}, searchQuery: '' }),

            setSelectedBook: (bookId) => set({ selectedBookId: bookId }),
            setSelectedPath: (pathId) => set({ selectedPathId: pathId }),
            setSearchQuery: (query) => set({ searchQuery: query }),

            // Reading List actions
            addToReadingList: (bookId, priority = 0) => set(state => {
                if (state.userLibrary.readingList.some(item => item.bookId === bookId)) {
                    return state;
                }
                const newItem: ReadingListItem = {
                    bookId,
                    addedAt: new Date().toISOString(),
                    priority
                };
                return {
                    userLibrary: {
                        ...state.userLibrary,
                        readingList: [...state.userLibrary.readingList, newItem]
                    }
                };
            }),

            removeFromReadingList: (bookId) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    readingList: state.userLibrary.readingList.filter(item => item.bookId !== bookId)
                }
            })),

            updateReadingListPriority: (bookId, priority) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    readingList: state.userLibrary.readingList.map(item =>
                        item.bookId === bookId ? { ...item, priority } : item
                    )
                }
            })),

            isInReadingList: (bookId) => {
                return get().userLibrary.readingList.some(item => item.bookId === bookId);
            },

            // Progress actions
            updateBookProgress: (bookId, progress, pagesRead) => set(state => {
                const existingProgress = state.userLibrary.bookProgress.find(p => p.bookId === bookId);
                const now = new Date().toISOString();

                if (existingProgress) {
                    return {
                        userLibrary: {
                            ...state.userLibrary,
                            bookProgress: state.userLibrary.bookProgress.map(p =>
                                p.bookId === bookId
                                    ? { ...p, progress, pagesRead: pagesRead ?? p.pagesRead, lastReadAt: now }
                                    : p
                            )
                        }
                    };
                }

                const newProgress: BookProgress = {
                    bookId,
                    progress,
                    startedAt: now,
                    lastReadAt: now,
                    pagesRead: pagesRead ?? 0
                };

                return {
                    userLibrary: {
                        ...state.userLibrary,
                        bookProgress: [...state.userLibrary.bookProgress, newProgress]
                    }
                };
            }),

            markBookComplete: (bookId) => set(state => {
                const now = new Date().toISOString();
                return {
                    userLibrary: {
                        ...state.userLibrary,
                        bookProgress: state.userLibrary.bookProgress.map(p =>
                            p.bookId === bookId
                                ? { ...p, progress: 100, completedAt: now, lastReadAt: now }
                                : p
                        ),
                        completedBookIds: state.userLibrary.completedBookIds.includes(bookId)
                            ? state.userLibrary.completedBookIds
                            : [...state.userLibrary.completedBookIds, bookId],
                        readingGoal: {
                            ...state.userLibrary.readingGoal,
                            booksCompleted: state.userLibrary.completedBookIds.includes(bookId)
                                ? state.userLibrary.readingGoal.booksCompleted
                                : state.userLibrary.readingGoal.booksCompleted + 1
                        }
                    }
                };
            }),

            getBookProgress: (bookId) => {
                return get().userLibrary.bookProgress.find(p => p.bookId === bookId);
            },

            // Highlights actions
            addHighlight: (highlight) => set(state => {
                const newHighlight: Highlight = {
                    ...highlight,
                    id: `hl-${Date.now()}`,
                    createdAt: new Date().toISOString()
                };
                return {
                    userLibrary: {
                        ...state.userLibrary,
                        highlights: [...state.userLibrary.highlights, newHighlight]
                    }
                };
            }),

            removeHighlight: (highlightId) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    highlights: state.userLibrary.highlights.filter(h => h.id !== highlightId)
                }
            })),

            getHighlightsForBook: (bookId) => {
                return get().userLibrary.highlights.filter(h => h.bookId === bookId);
            },

            // Path actions
            enrollInPath: (pathId) => set(state => {
                if (state.userLibrary.activePaths.some(p => p.pathId === pathId)) {
                    return state;
                }
                const newEnrollment: PathEnrollment = {
                    pathId,
                    enrolledAt: new Date().toISOString(),
                    currentModuleIndex: 0,
                    completedModuleIds: [],
                    completedBookIds: []
                };
                return {
                    userLibrary: {
                        ...state.userLibrary,
                        activePaths: [...state.userLibrary.activePaths, newEnrollment]
                    }
                };
            }),

            unenrollFromPath: (pathId) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    activePaths: state.userLibrary.activePaths.filter(p => p.pathId !== pathId)
                }
            })),

            completePathModule: (pathId, moduleId) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    activePaths: state.userLibrary.activePaths.map(enrollment =>
                        enrollment.pathId === pathId
                            ? {
                                ...enrollment,
                                completedModuleIds: enrollment.completedModuleIds.includes(moduleId)
                                    ? enrollment.completedModuleIds
                                    : [...enrollment.completedModuleIds, moduleId],
                                currentModuleIndex: enrollment.currentModuleIndex + 1
                            }
                            : enrollment
                    )
                }
            })),

            getPathEnrollment: (pathId) => {
                return get().userLibrary.activePaths.find(p => p.pathId === pathId);
            },

            isEnrolledInPath: (pathId) => {
                return get().userLibrary.activePaths.some(p => p.pathId === pathId);
            },

            getPathProgress: (pathId) => {
                const enrollment = get().userLibrary.activePaths.find(p => p.pathId === pathId);
                const path = getPathById(pathId);
                if (!enrollment || !path) return 0;
                return (enrollment.completedModuleIds.length / path.modules.length) * 100;
            },

            getModuleProgress: (pathId, moduleId) => {
                const enrollment = get().userLibrary.activePaths.find(p => p.pathId === pathId);
                if (!enrollment) return 0;
                return enrollment.completedModuleIds.includes(moduleId) ? 100 : 0;
            },

            completeModule: (pathId, moduleId) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    activePaths: state.userLibrary.activePaths.map(enrollment =>
                        enrollment.pathId === pathId
                            ? {
                                ...enrollment,
                                completedModuleIds: enrollment.completedModuleIds.includes(moduleId)
                                    ? enrollment.completedModuleIds
                                    : [...enrollment.completedModuleIds, moduleId]
                            }
                            : enrollment
                    )
                }
            })),

            // Goals actions
            setReadingGoal: (booksPerYear) => set(state => ({
                userLibrary: {
                    ...state.userLibrary,
                    readingGoal: {
                        ...state.userLibrary.readingGoal,
                        booksPerYear
                    }
                }
            })),

            getReadingStats: () => {
                const { userLibrary } = get();
                return {
                    booksCompleted: userLibrary.completedBookIds.length,
                    booksInProgress: userLibrary.bookProgress.filter(p => p.progress > 0 && p.progress < 100).length,
                    booksInList: userLibrary.readingList.length,
                    goalProgress: userLibrary.readingGoal.booksPerYear > 0
                        ? (userLibrary.readingGoal.booksCompleted / userLibrary.readingGoal.booksPerYear) * 100
                        : 0,
                    highlightsCount: userLibrary.highlights.length
                };
            },

            // Credits actions
            earnCredits: (type, description, metadata) => set(state => {
                const credits = CREDIT_VALUES[type] || 5;
                const now = new Date().toISOString();
                const today = now.split('T')[0];
                const lastActivity = state.userCredits.lastActivityDate.split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                let newStreak = state.userCredits.currentStreak;
                if (lastActivity === yesterday) {
                    newStreak = state.userCredits.currentStreak + 1;
                } else if (lastActivity !== today) {
                    newStreak = 1;
                }

                const newActivity: CreditActivity = {
                    id: `act-${Date.now()}`,
                    type,
                    description,
                    credits,
                    timestamp: now,
                    metadata
                };

                return {
                    userCredits: {
                        ...state.userCredits,
                        totalCredits: state.userCredits.totalCredits + credits,
                        currentStreak: newStreak,
                        longestStreak: Math.max(state.userCredits.longestStreak, newStreak),
                        level: getLevelInfo(state.userCredits.totalCredits + credits).level,
                        activities: [newActivity, ...state.userCredits.activities].slice(0, 50),
                        lastActivityDate: now
                    }
                };
            }),

            checkAndAwardBadges: () => {
                // Badge checking logic - can be expanded
                const state = get();
                const completedBooks = state.userLibrary.completedBookIds.length;
                const newBadges = [...state.userCredits.badges];

                // Check first book badge
                if (completedBooks >= 1 && !newBadges.find(b => b.id === 'first_book')) {
                    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === 'first_book');
                    if (badgeDef) {
                        newBadges.push({
                            id: badgeDef.id,
                            name: badgeDef.name,
                            description: badgeDef.description,
                            icon: badgeDef.icon,
                            tier: badgeDef.tier,
                            earnedAt: new Date().toISOString()
                        });
                    }
                }

                set({ userCredits: { ...state.userCredits, badges: newBadges } });
            },

            // Navigation actions
            navigateToBook: (bookId) => set({ currentView: 'book', selectedBookId: bookId }),
            navigateToPath: (pathId) => set({ currentView: 'path', selectedPathId: pathId }),
            navigateToHub: () => set({ currentView: 'hub', selectedBookId: null, selectedPathId: null })
        }),
        {
            name: 'cafe-library-store',
            partialize: (state) => ({
                userLibrary: state.userLibrary,
                userCredits: state.userCredits,
                filters: state.filters
            })
        }
    )
);
