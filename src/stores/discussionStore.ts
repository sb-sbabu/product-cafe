import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockDiscussions, mockReplies, type Discussion, type Reply } from '../data/discussions';

/**
 * Discussion Store - Zustand store for managing discussions and replies
 * 
 * Features:
 * - Load discussions from mock data
 * - Add new discussions
 * - Add replies (nested or top-level)
 * - Upvote discussions and replies
 * - Resolve discussions
 * - Toggle reply collapse state
 */

interface DiscussionState {
    discussions: Discussion[];
    replies: Reply[];

    // Actions
    loadDiscussions: () => void;
    addDiscussion: (discussion: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>) => Discussion;
    addReply: (reply: Omit<Reply, 'id' | 'createdAt' | 'updatedAt'>) => Reply;
    upvoteDiscussion: (id: string) => void;
    upvoteReply: (id: string) => void;
    resolveDiscussion: (id: string) => void;
    unresolveDiscussion: (id: string) => void;

    // Getters
    getDiscussionById: (id: string) => Discussion | undefined;
    getRepliesForDiscussion: (discussionId: string) => Reply[];
    getDiscussionsByResource: (resourceId: string) => Discussion[];
    getRecentDiscussions: (limit?: number) => Discussion[];
    getOpenDiscussionsCount: () => number;
}

export const useDiscussionStore = create<DiscussionState>()(
    persist(
        (set, get) => ({
            discussions: [],
            replies: [],

            loadDiscussions: () => {
                // Load from mock data if empty
                const state = get();
                if (state.discussions.length === 0) {
                    set({
                        discussions: [...mockDiscussions],
                        replies: [...mockReplies],
                    });
                }
            },

            addDiscussion: (discussion) => {
                const now = new Date().toISOString();
                const newDiscussion: Discussion = {
                    ...discussion,
                    id: `d${Date.now()}`,
                    createdAt: now,
                    updatedAt: now,
                    lastActivityAt: now,
                };
                set(state => ({
                    discussions: [newDiscussion, ...state.discussions],
                }));
                return newDiscussion;
            },

            addReply: (reply) => {
                const now = new Date().toISOString();
                const newReply: Reply = {
                    ...reply,
                    id: `r${Date.now()}`,
                    createdAt: now,
                    updatedAt: now,
                };

                set(state => {
                    // Update discussion's reply count and last activity
                    const updatedDiscussions = state.discussions.map(d =>
                        d.id === reply.discussionId
                            ? { ...d, replyCount: d.replyCount + 1, lastActivityAt: now }
                            : d
                    );

                    return {
                        discussions: updatedDiscussions,
                        replies: [...state.replies, newReply],
                    };
                });

                return newReply;
            },

            upvoteDiscussion: (id) => {
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === id ? { ...d, upvoteCount: d.upvoteCount + 1 } : d
                    ),
                }));
            },

            upvoteReply: (id) => {
                set(state => ({
                    replies: state.replies.map(r =>
                        r.id === id ? { ...r, upvoteCount: r.upvoteCount + 1 } : r
                    ),
                }));
            },

            resolveDiscussion: (id) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === id ? { ...d, status: 'resolved', resolvedAt: now, updatedAt: now } : d
                    ),
                }));
            },

            unresolveDiscussion: (id) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === id ? { ...d, status: 'open', resolvedAt: undefined, updatedAt: now } : d
                    ),
                }));
            },

            // Getters
            getDiscussionById: (id) => get().discussions.find(d => d.id === id),

            getRepliesForDiscussion: (discussionId) =>
                get().replies.filter(r => r.discussionId === discussionId),

            getDiscussionsByResource: (resourceId) =>
                get().discussions.filter(d =>
                    d.attachedToType === 'resource' && d.attachedToId === resourceId
                ),

            getRecentDiscussions: (limit = 5) =>
                [...get().discussions]
                    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
                    .slice(0, limit),

            getOpenDiscussionsCount: () =>
                get().discussions.filter(d => d.status === 'open').length,
        }),
        {
            name: 'cafe-discussions',
            partialize: (state) => ({
                discussions: state.discussions,
                replies: state.replies,
            }),
        }
    )
);
