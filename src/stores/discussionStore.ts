import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockDiscussions, mockReplies, type Discussion, type Reply } from '../data/discussions';
import type { ReactionType } from '../types/gamification';
import { useBadgeStore, type UserStats } from './badgeStore';

/**
 * Discussion Store - Zustand store for managing discussions and replies
 * 
 * Features:
 * - Load discussions from mock data
 * - Add new discussions
 * - Add replies (nested or top-level)
 * - Toggle upvotes (prevent duplicates)
 * - Add/remove reactions
 * - Accept/unaccept answers
 * - Resolve discussions
 */

interface DiscussionState {
    discussions: Discussion[];
    replies: Reply[];

    // Actions
    loadDiscussions: () => void;
    addDiscussion: (discussion: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'upvotedBy' | 'reactions'>) => Discussion;
    addReply: (reply: Omit<Reply, 'id' | 'createdAt' | 'updatedAt' | 'upvotedBy' | 'reactions'>) => Reply;

    // Voting
    toggleUpvoteDiscussion: (id: string, userId: string) => boolean;
    toggleUpvoteReply: (id: string, userId: string) => boolean;
    hasUserUpvotedDiscussion: (id: string, userId: string) => boolean;
    hasUserUpvotedReply: (id: string, userId: string) => boolean;

    // Reactions
    addReactionToDiscussion: (discussionId: string, userId: string, type: ReactionType) => void;
    removeReactionFromDiscussion: (discussionId: string, userId: string, type: ReactionType) => void;
    addReactionToReply: (replyId: string, userId: string, type: ReactionType) => void;
    removeReactionFromReply: (replyId: string, userId: string, type: ReactionType) => void;

    // Answers
    acceptAnswer: (discussionId: string, replyId: string) => void;
    unacceptAnswer: (discussionId: string) => void;

    // Status
    resolveDiscussion: (id: string) => void;
    unresolveDiscussion: (id: string) => void;

    // Management
    deleteDiscussion: (id: string) => void;
    editDiscussion: (id: string, updates: Partial<Pick<Discussion, 'title' | 'body'>>) => void;
    promoteToFAQ: (id: string) => void;

    // Getters
    getDiscussionById: (id: string) => Discussion | undefined;
    getRepliesForDiscussion: (discussionId: string) => Reply[];
    getDiscussionsByResource: (resourceId: string) => Discussion[];
    getRecentDiscussions: (limit?: number) => Discussion[];
    getOpenDiscussionsCount: () => number;

    // Tag Filtering
    activeTagFilter: string | null;
    setTagFilter: (tag: string | null) => void;
}

// Helper to add defaults to mock data
const withDefaults = <T extends Discussion | Reply>(item: T): T => ({
    ...item,
    upvotedBy: (item as Discussion).upvotedBy || [],
    reactions: (item as Discussion).reactions || [],
} as T);

const checkBadges = (userId: string, discussions: Discussion[], replies: Reply[]) => {
    const stats: UserStats = {
        questionsAsked: discussions.filter(d => d.authorId === userId).length,
        answersPosted: replies.filter(r => r.authorId === userId).length,
        acceptedAnswers: replies.filter(r => r.authorId === userId && r.isAcceptedAnswer).length,
        faqsCreated: 0, // Not implemented yet
        lopSessionsWatched: 0,
        lopSessionsSpoken: 0,
        welcomes: 0,
        mentoredUsers: 0,
        domainContributions: {},
    };
    useBadgeStore.getState().checkAndAwardBadges(stats);
};

export const useDiscussionStore = create<DiscussionState>()(
    persist(
        (set, get) => ({
            discussions: [],
            replies: [],

            loadDiscussions: () => {
                const state = get();
                if (state.discussions.length === 0) {
                    set({
                        discussions: mockDiscussions.map(withDefaults),
                        replies: mockReplies.map(withDefaults),
                    });
                }
            },

            addDiscussion: (discussion) => {
                const now = new Date().toISOString();
                const newDiscussion: Discussion = {
                    ...discussion,
                    id: `d${Date.now()}`,
                    upvotedBy: [],
                    reactions: [],
                    createdAt: now,
                    updatedAt: now,
                    lastActivityAt: now,
                };
                set(state => {
                    const nextDiscussions = [newDiscussion, ...state.discussions];
                    // Check badges for author
                    checkBadges(discussion.authorId, nextDiscussions, state.replies);
                    return { discussions: nextDiscussions };
                });
                return newDiscussion;
            },

            addReply: (reply) => {
                // ... implementation ... (will replace full block to insert badge check)
                const now = new Date().toISOString();
                const newReply: Reply = {
                    ...reply,
                    id: `r${Date.now()}`,
                    upvotedBy: [],
                    reactions: [],
                    createdAt: now,
                    updatedAt: now,
                };

                set(state => {
                    const updatedDiscussions = state.discussions.map(d =>
                        d.id === reply.discussionId
                            ? { ...d, replyCount: d.replyCount + 1, lastActivityAt: now }
                            : d
                    );
                    const nextReplies = [newReply, ...state.replies];

                    // Check badges for replier
                    checkBadges(reply.authorId, updatedDiscussions, nextReplies);

                    return {
                        discussions: updatedDiscussions,
                        replies: nextReplies,
                    };
                });
                return newReply;
            },


            // Toggle upvote - returns true if added, false if removed
            toggleUpvoteDiscussion: (id, userId) => {
                let added = false;
                set(state => ({
                    discussions: state.discussions.map(d => {
                        if (d.id !== id) return d;
                        const upvotedBy = d.upvotedBy || [];
                        const hasVoted = upvotedBy.includes(userId);
                        added = !hasVoted;
                        return {
                            ...d,
                            upvotedBy: hasVoted
                                ? upvotedBy.filter(u => u !== userId)
                                : [...upvotedBy, userId],
                            upvoteCount: hasVoted
                                ? d.upvoteCount - 1
                                : d.upvoteCount + 1,
                        };
                    }),
                }));
                return added;
            },

            toggleUpvoteReply: (id, userId) => {
                let added = false;
                set(state => ({
                    replies: state.replies.map(r => {
                        if (r.id !== id) return r;
                        const upvotedBy = r.upvotedBy || [];
                        const hasVoted = upvotedBy.includes(userId);
                        added = !hasVoted;
                        return {
                            ...r,
                            upvotedBy: hasVoted
                                ? upvotedBy.filter(u => u !== userId)
                                : [...upvotedBy, userId],
                            upvoteCount: hasVoted
                                ? r.upvoteCount - 1
                                : r.upvoteCount + 1,
                        };
                    }),
                }));
                return added;
            },

            hasUserUpvotedDiscussion: (id, userId) => {
                const d = get().discussions.find(d => d.id === id);
                return (d?.upvotedBy || []).includes(userId);
            },

            hasUserUpvotedReply: (id, userId) => {
                const r = get().replies.find(r => r.id === id);
                return (r?.upvotedBy || []).includes(userId);
            },

            // Reactions
            addReactionToDiscussion: (discussionId, userId, type) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d => {
                        if (d.id !== discussionId) return d;
                        const reactions = d.reactions || [];
                        // Check if user already reacted with this type
                        if (reactions.some(r => r.userId === userId && r.type === type)) {
                            return d; // Already reacted
                        }
                        return {
                            ...d,
                            reactions: [...reactions, { type, userId, timestamp: now }],
                        };
                    }),
                }));
            },

            removeReactionFromDiscussion: (discussionId, userId, type) => {
                set(state => ({
                    discussions: state.discussions.map(d => {
                        if (d.id !== discussionId) return d;
                        return {
                            ...d,
                            reactions: (d.reactions || []).filter(
                                r => !(r.userId === userId && r.type === type)
                            ),
                        };
                    }),
                }));
            },

            addReactionToReply: (replyId, userId, type) => {
                const now = new Date().toISOString();
                set(state => ({
                    replies: state.replies.map(r => {
                        if (r.id !== replyId) return r;
                        const reactions = r.reactions || [];
                        if (reactions.some(rx => rx.userId === userId && rx.type === type)) {
                            return r;
                        }
                        return {
                            ...r,
                            reactions: [...reactions, { type, userId, timestamp: now }],
                        };
                    }),
                }));
            },

            removeReactionFromReply: (replyId, userId, type) => {
                set(state => ({
                    replies: state.replies.map(r => {
                        if (r.id !== replyId) return r;
                        return {
                            ...r,
                            reactions: (r.reactions || []).filter(
                                rx => !(rx.userId === userId && rx.type === type)
                            ),
                        };
                    }),
                }));
            },

            // Accept answer
            acceptAnswer: (discussionId, replyId) => {
                set(state => {
                    const now = new Date().toISOString();
                    const updatedDiscussions = state.discussions.map(d =>
                        d.id === discussionId
                            ? { ...d, acceptedReplyId: replyId, status: 'resolved' as const, resolvedAt: now, updatedAt: now }
                            : d
                    );
                    const updatedReplies = state.replies.map(r => ({
                        ...r,
                        isAcceptedAnswer: r.discussionId === discussionId && r.id === replyId,
                    }));

                    const acceptedReply = updatedReplies.find(r => r.id === replyId);
                    if (acceptedReply) {
                        checkBadges(acceptedReply.authorId, updatedDiscussions, updatedReplies);
                    }

                    return {
                        discussions: updatedDiscussions,
                        replies: updatedReplies,
                    };
                });
            },

            unacceptAnswer: (discussionId) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === discussionId
                            ? { ...d, acceptedReplyId: undefined, status: 'open' as const, resolvedAt: undefined, updatedAt: now }
                            : d
                    ),
                    replies: state.replies.map(r =>
                        r.discussionId === discussionId
                            ? { ...r, isAcceptedAnswer: false }
                            : r
                    ),
                }));
            },

            resolveDiscussion: (id) => {
                set(state => {
                    const now = new Date().toISOString();
                    const updatedDiscussions = state.discussions.map(d =>
                        d.id === id ? { ...d, status: 'resolved' as const, resolvedAt: now, updatedAt: now } : d
                    );

                    const discussion = updatedDiscussions.find(d => d.id === id);
                    if (discussion) {
                        // Check badges for author of the resolved discussion
                        checkBadges(discussion.authorId, updatedDiscussions, state.replies);
                    }

                    return { discussions: updatedDiscussions };
                });
            },

            unresolveDiscussion: (id) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === id ? { ...d, status: 'open' as const, resolvedAt: undefined, updatedAt: now } : d
                    ),
                }));
            },

            promoteToFAQ: (id) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === id ? { ...d, promotedToFAQId: `faq_${Date.now()}`, updatedAt: now } : d
                    ),
                }));
            },

            editDiscussion: (id, updates) => {
                const now = new Date().toISOString();
                set(state => ({
                    discussions: state.discussions.map(d =>
                        d.id === id ? { ...d, ...updates, updatedAt: now } : d
                    ),
                }));
            },

            deleteDiscussion: (id) => {
                set(state => ({
                    discussions: state.discussions.filter(d => d.id !== id),
                    replies: state.replies.filter(r => r.discussionId !== id),
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

            // Tag Filtering
            activeTagFilter: null,
            setTagFilter: (tag) => set({ activeTagFilter: tag }),
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
