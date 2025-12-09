/**
 * Toast X - Recognition Slice
 * Handles all recognition-related state
 */

import type { StateCreator } from 'zustand';
import type { Recognition, Reaction, Comment, ReactionType, CompanyValue } from '../../types';
import { sanitizeMessage } from '../../utils';
import { DEMO_RECOGNITIONS } from '../demoData';

// ═══════════════════════════════════════════════════════════════════════════
// SLICE STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface RecognitionSlice {
    /** All recognitions */
    recognitions: readonly Recognition[];

    /** Currently selected recognition for detail view */
    selectedRecognitionId: string | null;

    /** Feed filter */
    feedFilter: 'all' | 'following' | 'my-team' | 'org-wide' | 'monthly-winners';

    /** Actions */
    addRecognition: (recognition: Recognition) => void;
    updateRecognition: (id: string, updates: Partial<Recognition>) => void;
    deleteRecognition: (id: string) => void;

    addReaction: (recognitionId: string, reaction: Reaction) => void;
    removeReaction: (recognitionId: string, userId: string, type: ReactionType) => void;

    addComment: (recognitionId: string, comment: Comment) => void;
    updateComment: (recognitionId: string, commentId: string, content: string) => void;
    deleteComment: (recognitionId: string, commentId: string) => void;

    incrementReposts: (recognitionId: string) => void;
    incrementBookmarks: (recognitionId: string) => void;

    setSelectedRecognition: (id: string | null) => void;
    setFeedFilter: (filter: RecognitionSlice['feedFilter']) => void;

    /** Selectors (computed) */
    getRecognitionById: (id: string) => Recognition | undefined;
    getRecognitionsByGiver: (userId: string) => readonly Recognition[];
    getRecognitionsByRecipient: (userId: string) => readonly Recognition[];
    getRecognitionsByValue: (value: CompanyValue) => readonly Recognition[];
    getRecentRecognitions: (limit: number) => readonly Recognition[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SLICE CREATOR
// ═══════════════════════════════════════════════════════════════════════════

export const createRecognitionSlice: StateCreator<
    RecognitionSlice,
    [],
    [],
    RecognitionSlice
> = (set, get) => ({
    // Initial state
    recognitions: DEMO_RECOGNITIONS,
    selectedRecognitionId: null,
    feedFilter: 'all',

    // ─────────────────────────────────────────────────────────────────────────
    // RECOGNITION CRUD
    // ─────────────────────────────────────────────────────────────────────────

    addRecognition: (recognition) => {
        set((state) => ({
            recognitions: [recognition, ...state.recognitions],
        }));
    },

    updateRecognition: (id, updates) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) =>
                rec.id === id
                    ? { ...rec, ...updates, updatedAt: new Date().toISOString() }
                    : rec
            ),
        }));
    },

    deleteRecognition: (id) => {
        set((state) => ({
            recognitions: state.recognitions.filter((rec) => rec.id !== id),
        }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // REACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    addReaction: (recognitionId, reaction) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) => {
                if (rec.id !== recognitionId) return rec;

                // Check if already reacted with this type
                const hasReacted = rec.reactions.some(
                    (r) => r.userId === reaction.userId && r.type === reaction.type
                );
                if (hasReacted) return rec;

                return {
                    ...rec,
                    reactions: [...rec.reactions, reaction],
                };
            }),
        }));
    },

    removeReaction: (recognitionId, userId, type) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) => {
                if (rec.id !== recognitionId) return rec;
                return {
                    ...rec,
                    reactions: rec.reactions.filter(
                        (r) => !(r.userId === userId && r.type === type)
                    ),
                };
            }),
        }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COMMENTS
    // ─────────────────────────────────────────────────────────────────────────

    addComment: (recognitionId, comment) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) => {
                if (rec.id !== recognitionId) return rec;
                return {
                    ...rec,
                    comments: [...rec.comments, comment],
                };
            }),
        }));
    },

    updateComment: (recognitionId, commentId, content) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) => {
                if (rec.id !== recognitionId) return rec;
                return {
                    ...rec,
                    comments: rec.comments.map((c) =>
                        c.id === commentId
                            ? { ...c, content: sanitizeMessage(content), updatedAt: new Date().toISOString() }
                            : c
                    ),
                };
            }),
        }));
    },

    deleteComment: (recognitionId, commentId) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) => {
                if (rec.id !== recognitionId) return rec;
                return {
                    ...rec,
                    comments: rec.comments.filter((c) => c.id !== commentId),
                };
            }),
        }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SOCIAL COUNTERS
    // ─────────────────────────────────────────────────────────────────────────

    incrementReposts: (recognitionId) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) =>
                rec.id === recognitionId
                    ? { ...rec, reposts: rec.reposts + 1 }
                    : rec
            ),
        }));
    },

    incrementBookmarks: (recognitionId) => {
        set((state) => ({
            recognitions: state.recognitions.map((rec) =>
                rec.id === recognitionId
                    ? { ...rec, bookmarks: rec.bookmarks + 1 }
                    : rec
            ),
        }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // UI STATE
    // ─────────────────────────────────────────────────────────────────────────

    setSelectedRecognition: (id) => {
        set({ selectedRecognitionId: id });
    },

    setFeedFilter: (filter) => {
        set({ feedFilter: filter });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SELECTORS (computed state)
    // ─────────────────────────────────────────────────────────────────────────

    getRecognitionById: (id) => {
        return get().recognitions.find((rec) => rec.id === id);
    },

    getRecognitionsByGiver: (userId) => {
        return get().recognitions.filter((rec) => rec.giverId === userId);
    },

    getRecognitionsByRecipient: (userId) => {
        return get().recognitions.filter((rec) => rec.recipientIds.includes(userId));
    },

    getRecognitionsByValue: (value) => {
        return get().recognitions.filter((rec) => rec.value === value);
    },

    getRecentRecognitions: (limit) => {
        return get().recognitions.slice(0, limit);
    },
});
