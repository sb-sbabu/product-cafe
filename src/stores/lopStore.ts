// ═══════════════════════════════════════════════════════════════════════════
// LOP Store
// State management for Love of Product sessions, paths, and user progress
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    LOPSession,
    LOPLearningPath,
    LOPTopicSuggestion,
    LOPUserProgress,
    LOPSortOption,
    LOPFilterTopic,
    LOPFilterSpeaker,
} from '../lib/lop/types';
import {
    LOP_SESSIONS,
    LOP_LEARNING_PATHS,
    LOP_TOPIC_SUGGESTIONS,
} from '../lib/lop/data';

interface LOPState {
    // Data
    sessions: LOPSession[];
    learningPaths: LOPLearningPath[];
    topicSuggestions: LOPTopicSuggestion[];

    // User progress
    progress: Record<string, LOPUserProgress>;

    // Filters
    filters: {
        topic: LOPFilterTopic;
        speaker: LOPFilterSpeaker;
        year: number | 'all';
        difficulty: LOPSession['difficulty'] | 'all';
        searchQuery: string;
    };
    sortBy: LOPSortOption;

    // Actions
    setFilter: (key: keyof LOPState['filters'], value: string | number | 'all') => void;
    setSortBy: (sort: LOPSortOption) => void;
    clearFilters: () => void;

    // Progress actions
    markSessionWatched: (sessionId: string, seconds: number) => void;
    markSessionCompleted: (sessionId: string) => void;
    toggleSessionLike: (sessionId: string) => void;

    // Topic actions
    submitTopic: (title: string, description?: string) => void;
    upvoteTopic: (topicId: string) => void;

    // Getters (computed from state)
    getNextSession: () => LOPSession | undefined;
    getRecentSessions: (count?: number) => LOPSession[];
    getFilteredSessions: () => LOPSession[];
    getSessionById: (id: string) => LOPSession | undefined;
    getSessionBySlug: (slug: string) => LOPSession | undefined;
    getPathBySlug: (slug: string) => LOPLearningPath | undefined;
    getPathProgress: (pathId: string) => { completed: number; total: number; percent: number };
    isSessionCompleted: (sessionId: string) => boolean;
    isSessionLiked: (sessionId: string) => boolean;
}

const DEFAULT_FILTERS = {
    topic: 'all' as const,
    speaker: 'all' as const,
    year: 'all' as const,
    difficulty: 'all' as const,
    searchQuery: '',
};

export const useLOPStore = create<LOPState>()(
    persist(
        (set, get) => ({
            // Initial data
            sessions: LOP_SESSIONS,
            learningPaths: LOP_LEARNING_PATHS,
            topicSuggestions: LOP_TOPIC_SUGGESTIONS,
            progress: {},
            filters: DEFAULT_FILTERS,
            sortBy: 'newest',

            // Filter actions
            setFilter: (key, value) =>
                set(state => ({
                    filters: { ...state.filters, [key]: value }
                })),

            setSortBy: (sort) => set({ sortBy: sort }),

            clearFilters: () => set({ filters: DEFAULT_FILTERS }),

            // Progress actions
            markSessionWatched: (sessionId, seconds) =>
                set(state => ({
                    progress: {
                        ...state.progress,
                        [sessionId]: {
                            ...state.progress[sessionId],
                            sessionId,
                            watchedSeconds: seconds,
                            completed: state.progress[sessionId]?.completed || false,
                        }
                    }
                })),

            markSessionCompleted: (sessionId) =>
                set(state => ({
                    progress: {
                        ...state.progress,
                        [sessionId]: {
                            ...state.progress[sessionId],
                            sessionId,
                            watchedSeconds: state.progress[sessionId]?.watchedSeconds || 0,
                            completed: true,
                            completedAt: new Date().toISOString(),
                        }
                    }
                })),

            toggleSessionLike: (sessionId) =>
                set(state => {
                    const current = state.progress[sessionId];
                    const isLiked = !!current?.likedAt;
                    return {
                        progress: {
                            ...state.progress,
                            [sessionId]: {
                                ...current,
                                sessionId,
                                watchedSeconds: current?.watchedSeconds || 0,
                                completed: current?.completed || false,
                                likedAt: isLiked ? undefined : new Date().toISOString(),
                            }
                        },
                        sessions: state.sessions.map(s =>
                            s.id === sessionId
                                ? { ...s, likeCount: s.likeCount + (isLiked ? -1 : 1) }
                                : s
                        )
                    };
                }),

            // Topic actions
            submitTopic: (title, description) =>
                set(state => ({
                    topicSuggestions: [
                        {
                            id: `topic-${Date.now()}`,
                            title,
                            description,
                            submittedBy: { name: 'You', email: 'you@example.com' },
                            submittedAt: new Date().toISOString(),
                            status: 'submitted',
                            upvotes: 1,
                            upvotedBy: ['you@example.com'],
                        },
                        ...state.topicSuggestions,
                    ]
                })),

            upvoteTopic: (topicId) =>
                set(state => ({
                    topicSuggestions: state.topicSuggestions.map(t =>
                        t.id === topicId
                            ? { ...t, upvotes: t.upvotes + 1, upvotedBy: [...t.upvotedBy, 'you@example.com'] }
                            : t
                    )
                })),

            // Getters
            getNextSession: () =>
                get().sessions.find(s => s.status === 'upcoming'),

            getRecentSessions: (count = 3) =>
                get().sessions
                    .filter(s => s.status === 'completed')
                    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                    .slice(0, count),

            getFilteredSessions: () => {
                const { sessions, filters, sortBy } = get();
                let filtered = sessions.filter(s => s.status === 'completed');

                // Apply filters
                if (filters.topic !== 'all') {
                    filtered = filtered.filter(s => s.topics.includes(filters.topic as string));
                }
                if (filters.speaker !== 'all') {
                    filtered = filtered.filter(s => s.speaker.name === filters.speaker);
                }
                if (filters.year !== 'all') {
                    filtered = filtered.filter(s => new Date(s.sessionDate).getFullYear() === filters.year);
                }
                if (filters.difficulty !== 'all') {
                    filtered = filtered.filter(s => s.difficulty === filters.difficulty);
                }
                if (filters.searchQuery) {
                    const query = filters.searchQuery.toLowerCase();
                    filtered = filtered.filter(s =>
                        s.title.toLowerCase().includes(query) ||
                        s.description.toLowerCase().includes(query) ||
                        s.topics.some(t => t.toLowerCase().includes(query)) ||
                        s.speaker.name.toLowerCase().includes(query)
                    );
                }

                // Apply sorting
                switch (sortBy) {
                    case 'oldest':
                        filtered.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
                        break;
                    case 'most-viewed':
                        filtered.sort((a, b) => b.viewCount - a.viewCount);
                        break;
                    case 'most-liked':
                        filtered.sort((a, b) => b.likeCount - a.likeCount);
                        break;
                    case 'newest':
                    default:
                        filtered.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
                }

                return filtered;
            },

            getSessionById: (id) => get().sessions.find(s => s.id === id),
            getSessionBySlug: (slug) => get().sessions.find(s => s.slug === slug),
            getPathBySlug: (slug) => get().learningPaths.find(p => p.slug === slug),

            getPathProgress: (pathId) => {
                const path = get().learningPaths.find(p => p.id === pathId);
                if (!path) return { completed: 0, total: 0, percent: 0 };
                const { progress } = get();
                const completed = path.sessionIds.filter(id => progress[id]?.completed).length;
                return {
                    completed,
                    total: path.sessionIds.length,
                    percent: Math.round((completed / path.sessionIds.length) * 100),
                };
            },

            isSessionCompleted: (sessionId) => !!get().progress[sessionId]?.completed,
            isSessionLiked: (sessionId) => !!get().progress[sessionId]?.likedAt,
        }),
        {
            name: 'lop-storage',
            partialize: (state) => ({ progress: state.progress }),
        }
    )
);
