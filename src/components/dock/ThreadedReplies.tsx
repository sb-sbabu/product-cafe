import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Reply as ReplyIcon, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from '../../lib/utils';
import type { Reply } from '../../data/discussions';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { VoteButton, ReactionPicker, ReactionBar } from '../discussions';
import { useDiscussionStore } from '../../stores/discussionStore';
import { usePointsStore } from '../../stores/pointsStore';
import type { ReactionType } from '../../types/gamification';

/**
 * ThreadedReplies - Reddit-style nested comment threading
 * 
 * Features:
 * - Infinite nesting with visual thread lines
 * - Collapse/expand individual threads
 * - Depth-based indentation (max visual depth of 5)
 * - Reply action at any level
 * - Accept answer functionality
 */

interface ThreadedRepliesProps {
    replies: Reply[];
    discussionId: string;
    discussionAuthorId?: string;
    onAcceptAnswer?: (replyId: string) => void;
    maxDepth?: number;
}

interface ReplyNodeProps {
    reply: Reply;
    allReplies: Reply[];
    discussionId: string;
    discussionAuthorId?: string;
    depth: number;
    maxDepth: number;
    onAcceptAnswer?: (replyId: string) => void;
}

// Thread line colors for visual hierarchy
const threadColors = [
    'border-blue-400',
    'border-purple-400',
    'border-green-400',
    'border-amber-400',
    'border-pink-400',
];

const currentUserId = 'current-user'; // Mock - in real app from auth context

const ReplyNode: React.FC<ReplyNodeProps> = ({
    reply,
    allReplies,
    discussionId,
    discussionAuthorId,
    depth,
    maxDepth,
    onAcceptAnswer,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');

    // Store actions
    const {
        addReply,
        toggleUpvoteReply,
        hasUserUpvotedReply,
        addReactionToReply,
        removeReactionFromReply,
    } = useDiscussionStore();
    const { awardPoints } = usePointsStore();

    // Check if current user has upvoted
    const hasVoted = hasUserUpvotedReply(reply.id, currentUserId);

    // Get child replies
    const childReplies = allReplies.filter(r => r.parentReplyId === reply.id);
    const hasChildren = childReplies.length > 0;

    // Calculate visual depth (cap at maxDepth for UI)
    const visualDepth = Math.min(depth, maxDepth);
    const threadColor = threadColors[visualDepth % threadColors.length];

    // Check if current user is discussion author (can accept answers)
    const canAcceptAnswer = discussionAuthorId === currentUserId && !reply.isAcceptedAnswer;

    const handleSubmitReply = useCallback(() => {
        if (!replyText.trim()) return;

        // CRITICAL: Actually save the nested reply to store
        addReply({
            discussionId,
            parentReplyId: reply.id, // This makes it nested
            body: replyText,
            authorId: currentUserId,
            authorName: 'You',
            authorEmail: 'user@company.com',
            upvoteCount: 0,
            isExpert: false,
            isAcceptedAnswer: false,
            depth: depth + 1,
        });

        // Award points for posting answer
        awardPoints('post_answer', { discussionId, answerId: reply.id });

        setReplyText('');
        setShowReplyInput(false);
    }, [replyText, reply.id, discussionId, depth, addReply, awardPoints]);

    const handleUpvote = useCallback(() => {
        const added = toggleUpvoteReply(reply.id, currentUserId);
        if (added) {
            // Award points for giving upvote
            awardPoints('give_upvote', { answerId: reply.id });
        }
    }, [reply.id, toggleUpvoteReply, awardPoints]);

    const handleReaction = useCallback((type: ReactionType) => {
        const hasReacted = reply.reactions?.some(
            r => r.userId === currentUserId && r.type === type
        );
        if (hasReacted) {
            removeReactionFromReply(reply.id, currentUserId, type);
        } else {
            addReactionToReply(reply.id, currentUserId, type);
            awardPoints('give_reaction', { answerId: reply.id });
        }
    }, [reply.id, reply.reactions, addReactionToReply, removeReactionFromReply, awardPoints]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className={cn(
            'relative',
            depth > 0 && 'ml-4 pl-3'
        )}>
            {/* Thread line */}
            {depth > 0 && (
                <div
                    className={cn(
                        'absolute left-0 top-0 bottom-0 w-0.5 border-l-2',
                        threadColor,
                        'hover:border-opacity-100 border-opacity-50 transition-opacity cursor-pointer'
                    )}
                    onClick={toggleCollapse}
                    title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
                />
            )}

            {/* Reply content */}
            <div className={cn(
                'py-2',
                isCollapsed && 'opacity-60'
            )}>
                {/* Header */}
                <div className="flex items-center gap-2 text-xs">
                    {/* Avatar */}
                    <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                        reply.isExpert
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                    )}>
                        {reply.authorName.charAt(0)}
                    </div>

                    {/* Author */}
                    <span className={cn(
                        'font-medium',
                        reply.isExpert ? 'text-amber-700' : 'text-gray-700'
                    )}>
                        {reply.authorName}
                    </span>

                    {/* Expert badge */}
                    {reply.isExpert && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">
                            EXPERT
                        </span>
                    )}

                    {/* Accepted answer badge */}
                    {reply.isAcceptedAnswer && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            ACCEPTED
                        </span>
                    )}

                    {/* Timestamp */}
                    <span className="text-gray-400">
                        {formatDistanceToNow(new Date(reply.createdAt))}
                    </span>

                    {/* Collapse indicator */}
                    {hasChildren && (
                        <button
                            onClick={toggleCollapse}
                            className="ml-auto p-0.5 hover:bg-gray-100 rounded transition-colors"
                        >
                            {isCollapsed ? (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            )}
                        </button>
                    )}
                </div>

                {/* Body */}
                {!isCollapsed && (
                    <>
                        <div className="mt-1 text-sm text-gray-700">
                            <MarkdownRenderer content={reply.body} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-2">
                            <VoteButton
                                count={reply.upvoteCount}
                                hasVoted={hasVoted}
                                onVote={handleUpvote}
                                size="sm"
                            />

                            <ReactionPicker onSelect={handleReaction} />

                            <button
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <ReplyIcon className="w-3.5 h-3.5" />
                                <span>Reply</span>
                            </button>

                            {/* Accept Answer button */}
                            {canAcceptAnswer && (
                                <button
                                    onClick={() => onAcceptAnswer?.(reply.id)}
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept</span>
                                </button>
                            )}

                            {hasChildren && isCollapsed && (
                                <span className="text-xs text-gray-400">
                                    {childReplies.length} {childReplies.length === 1 ? 'reply' : 'replies'} hidden
                                </span>
                            )}
                        </div>

                        {/* Reaction Bar */}
                        {reply.reactions && reply.reactions.length > 0 && (
                            <div className="mt-2">
                                <ReactionBar
                                    reactions={reply.reactions}
                                    currentUserId={currentUserId}
                                    onToggle={handleReaction}
                                />
                            </div>
                        )}

                        {/* Inline reply input */}
                        {showReplyInput && (
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Reply to ${reply.authorName}...`}
                                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSubmitReply();
                                        if (e.key === 'Escape') setShowReplyInput(false);
                                    }}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim()}
                                    className="px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Post
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Collapsed summary */}
                {isCollapsed && (
                    <button
                        onClick={toggleCollapse}
                        className="mt-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        Show {childReplies.length + 1} {childReplies.length === 0 ? 'comment' : 'comments'}
                    </button>
                )}
            </div>

            {/* Child replies */}
            {!isCollapsed && hasChildren && (
                <div className="mt-1">
                    {depth >= maxDepth ? (
                        // Max depth reached - show "continue thread" link
                        <button className="ml-4 pl-3 py-2 text-xs text-blue-500 hover:text-blue-600 transition-colors">
                            Continue this thread ({childReplies.length} more) →
                        </button>
                    ) : (
                        // Render child replies recursively
                        childReplies.map(childReply => (
                            <ReplyNode
                                key={childReply.id}
                                reply={childReply}
                                allReplies={allReplies}
                                discussionId={discussionId}
                                discussionAuthorId={discussionAuthorId}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                                onAcceptAnswer={onAcceptAnswer}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const ThreadedReplies: React.FC<ThreadedRepliesProps> = ({
    replies,
    discussionId,
    discussionAuthorId,
    onAcceptAnswer,
    maxDepth = 5,
}) => {
    // Get top-level replies (no parent)
    const topLevelReplies = replies.filter(r => !r.parentReplyId);

    if (replies.length === 0) {
        return (
            <div className="py-6 text-center">
                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No replies yet. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {topLevelReplies.map(reply => (
                <ReplyNode
                    key={reply.id}
                    reply={reply}
                    allReplies={replies}
                    discussionId={discussionId}
                    discussionAuthorId={discussionAuthorId}
                    depth={0}
                    maxDepth={maxDepth}
                    onAcceptAnswer={onAcceptAnswer}
                />
            ))}
        </div>
    );
};
