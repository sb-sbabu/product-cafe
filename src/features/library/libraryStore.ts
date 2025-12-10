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
    selectedBookId: string | null;
    selectedPathId: string | null;
    searchQuery: string;

    // User data
    userLibrary: UserLibrary;

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
}

const initialUserLibrary: UserLibrary = {
    userId: 'demo-user',
    readingList: [],
    bookProgress: [],
    completedBookIds: [],
    highlights: [],
    activePaths: [],
    readingGoal: {
        booksPerYear: 12,
        booksCompleted: 0,
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

            // User data
            userLibrary: initialUserLibrary,

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
            }
        }),
        {
            name: 'cafe-library-store',
            partialize: (state) => ({
                userLibrary: state.userLibrary,
                filters: state.filters
            })
        }
    )
);
