import React, { useState } from 'react';
import {
    MessageSquare,
    Send,
    Heart,
    Reply,
    Pin,
    Crown,
    ChevronDown,
    ChevronUp,
    Smile,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

// ═══════════════════════════════════════════════════════════════════════════
// DISCUSSION SECTION — Threaded comments with reactions
// Premium community engagement features
// ═══════════════════════════════════════════════════════════════════════════

interface Comment {
    id: string;
    author: {
        name: string;
        avatar?: string;
        isSpeaker?: boolean;
    };
    content: string;
    createdAt: string;
    likes: number;
    isLiked?: boolean;
    isPinned?: boolean;
    replies?: Comment[];
}

interface DiscussionSectionProps {
    sessionId: string;
    comments?: Comment[];
    onAddComment?: (content: string, replyTo?: string) => void;
    onLikeComment?: (commentId: string) => void;
    className?: string;
}

// Mock data for demonstration
const MOCK_COMMENTS: Comment[] = [
    {
        id: '1',
        author: { name: 'Sarah Chen', isSpeaker: true },
        content: 'Great question about prioritization! The key is to always tie decisions back to your North Star metric. Happy to discuss more in the next session!',
        createdAt: '2024-03-15T10:30:00Z',
        likes: 24,
        isPinned: true,
        replies: [],
    },
    {
        id: '2',
        author: { name: 'Alex Rivera' },
        content: 'This session really changed how I think about customer discovery. The "5 whys" technique is something I\'m going to start using immediately.',
        createdAt: '2024-03-14T15:45:00Z',
        likes: 12,
        replies: [
            {
                id: '2a',
                author: { name: 'Jordan Kim' },
                content: 'Agreed! I tried it in my 1:1s this week and it really helped uncover the root issues.',
                createdAt: '2024-03-14T16:20:00Z',
                likes: 5,
            }
        ],
    },
    {
        id: '3',
        author: { name: 'Maria Santos' },
        content: 'Would love to see a follow-up session on how to apply these techniques in a B2B context. The examples were mostly B2C.',
        createdAt: '2024-03-13T09:15:00Z',
        likes: 8,
        replies: [],
    },
];

const EMOJI_REACTIONS = ['👍', '💡', '🔥', '💯', '🎯', '❤️'];

type SortOption = 'newest' | 'top' | 'speaker';

export const DiscussionSection: React.FC<DiscussionSectionProps> = ({
    comments: propComments,
    onAddComment,
    onLikeComment,
    className,
}) => {
    const [comments, setComments] = useState<Comment[]>(propComments || MOCK_COMMENTS);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: `new-${Date.now()}`,
            author: { name: 'You' },
            content: newComment.trim(),
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: [],
        };

        setComments(prev => [comment, ...prev]);
        setNewComment('');
        onAddComment?.(newComment.trim());
    };

    const handleSubmitReply = (parentId: string) => {
        if (!replyContent.trim()) return;

        const reply: Comment = {
            id: `reply-${Date.now()}`,
            author: { name: 'You' },
            content: replyContent.trim(),
            createdAt: new Date().toISOString(),
            likes: 0,
        };

        setComments(prev => prev.map(c => {
            if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), reply] };
            }
            return c;
        }));

        setReplyContent('');
        setReplyingTo(null);
        setExpandedReplies(prev => new Set([...prev, parentId]));
        onAddComment?.(replyContent.trim(), parentId);
    };

    const handleLike = (commentId: string) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    isLiked: !c.isLiked,
                    likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                };
            }
            if (c.replies) {
                return {
                    ...c,
                    replies: c.replies.map(r => {
                        if (r.id === commentId) {
                            return {
                                ...r,
                                isLiked: !r.isLiked,
                                likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                            };
                        }
                        return r;
                    }),
                };
            }
            return c;
        }));
        onLikeComment?.(commentId);
    };

    const toggleReplies = (commentId: string) => {
        setExpandedReplies(prev => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    // Sort comments
    const sortedComments = [...comments].sort((a, b) => {
        // Pinned always first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        switch (sortBy) {
            case 'top':
                return b.likes - a.likes;
            case 'speaker':
                if (a.author.isSpeaker && !b.author.isSpeaker) return -1;
                if (!a.author.isSpeaker && b.author.isSpeaker) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default: // newest
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const renderComment = (comment: Comment, isReply = false) => (
        <div
            key={comment.id}
            className={cn(
                "group",
                isReply ? "ml-10 pl-4 border-l-2 border-gray-100" : "",
                comment.isPinned && !isReply && "bg-gradient-to-r from-amber-50/50 to-transparent -mx-5 px-5 py-3 rounded-xl"
            )}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    comment.author.isSpeaker
                        ? "bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-500/20"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                )}>
                    <span className={cn(
                        "text-sm font-semibold",
                        comment.author.isSpeaker ? "text-white" : "text-gray-600"
                    )}>
                        {comment.author.name.charAt(0)}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        {comment.author.isSpeaker && (
                            <Badge variant="warning" size="sm">
                                <Crown className="w-3 h-3 mr-1" />
                                Speaker
                            </Badge>
                        )}
                        {comment.isPinned && (
                            <Badge variant="info" size="sm">
                                <Pin className="w-3 h-3 mr-1" />
                                Pinned
                            </Badge>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>

                    <p className="text-gray-700 mt-1 leading-relaxed">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={() => handleLike(comment.id)}
                            className={cn(
                                "flex items-center gap-1 text-sm transition-colors",
                                comment.isLiked ? "text-rose-500" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Heart className="w-4 h-4" fill={comment.isLiked ? "currentColor" : "none"} />
                            {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>

                        {!isReply && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Reply className="w-4 h-4" />
                                Reply
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                                className="p-1 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Smile className="w-4 h-4" />
                            </button>
                            {showEmojiPicker === comment.id && (
                                <div className="absolute left-0 bottom-full mb-1 flex gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                    {EMOJI_REACTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setShowEmojiPicker(null)}
                                            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-lg"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                        <div className="mt-3 flex gap-2 animate-slide-up">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
                                autoFocus
                            />
                            <Button
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3">
                            <button
                                onClick={() => toggleReplies(comment.id)}
                                className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 transition-colors"
                            >
                                {expandedReplies.has(comment.id) ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Hide replies
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                    </>
                                )}
                            </button>
                            {expandedReplies.has(comment.id) && (
                                <div className="mt-3 space-y-3 animate-slide-up">
                                    {comment.replies.map(reply => renderComment(reply, true))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Card className={cn("p-5", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-rose-500" />
                    Discussion
                    <span className="text-sm font-normal text-gray-400">({comments.length})</span>
                </h3>

                {/* Sort Options */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {(['newest', 'top', 'speaker'] as const).map(option => (
                        <button
                            key={option}
                            onClick={() => setSortBy(option)}
                            className={cn(
                                "px-2 py-1 text-xs font-medium rounded transition-colors capitalize",
                                sortBy === option
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* New Comment Input */}
            <div className="flex gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-white">Y</span>
                </div>
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the discussion..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
                    <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        leftIcon={<Send className="w-4 h-4" />}
                    >
                        Post
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-5">
                {sortedComments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400">Be the first to start the discussion!</p>
                    </div>
                ) : (
                    sortedComments.map(comment => renderComment(comment))
                )}
            </div>
        </Card>
    );
};

export default DiscussionSection;
