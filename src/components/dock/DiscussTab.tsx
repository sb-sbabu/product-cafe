import React, { useState } from 'react';
import { MessageSquarePlus, ChevronLeft, CheckCircle, Clock, ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock } from '../../contexts/DockContext';
import {
    getDiscussionsByResource,
    getGeneralDiscussions,
    getRecentDiscussions,
    getRepliesForDiscussion,
    type Discussion,
    type Reply
} from '../../data/discussions';
import { mockPeople } from '../../data/mockData';
import { formatDistanceToNow } from '../../lib/utils';

/**
 * DiscussTab - Threaded discussions tab within Café Dock
 * 
 * Shows discussions relevant to the current context (resource, page, etc.)
 * Allows users to view threads, add replies, and start new discussions.
 */

interface DiscussionCardProps {
    discussion: Discussion;
    onClick: () => void;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({ discussion, onClick }) => {
    const statusColors = {
        open: 'bg-amber-100 text-amber-700',
        resolved: 'bg-green-100 text-green-700',
        stale: 'bg-gray-100 text-gray-500',
    };

    const StatusIcon = discussion.status === 'resolved' ? CheckCircle : Clock;

    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors"
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {discussion.authorName}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(discussion.createdAt))}
                </span>
            </div>

            <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                {discussion.title}
            </h4>

            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {discussion.body}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replyCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {discussion.upvoteCount}
                    </span>
                </div>
                <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full flex items-center gap-1',
                    statusColors[discussion.status]
                )}>
                    <StatusIcon className="w-3 h-3" />
                    {discussion.status.charAt(0).toUpperCase() + discussion.status.slice(1)}
                </span>
            </div>
        </button>
    );
};

interface ThreadViewProps {
    discussion: Discussion;
    onBack: () => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({ discussion, onBack }) => {
    const [replyText, setReplyText] = useState('');
    const replies = getRepliesForDiscussion(discussion.id);

    const handleSubmitReply = () => {
        if (!replyText.trim()) return;
        // In real app, would call API to create reply
        console.log('Submitting reply:', replyText);
        setReplyText('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to discussions
                </button>
                <h3 className="font-semibold text-gray-900 text-sm">{discussion.title}</h3>
            </div>

            {/* Thread content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Original post */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-cafe-200 rounded-full flex items-center justify-center text-cafe-700 text-sm font-medium">
                            {discussion.authorName.charAt(0)}
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-900">{discussion.authorName}</span>
                            <span className="text-xs text-gray-400 ml-2">
                                {formatDistanceToNow(new Date(discussion.createdAt))}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700">{discussion.body}</p>
                    <div className="mt-2 flex items-center gap-2">
                        <button className="text-xs text-gray-400 hover:text-cafe-600 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {discussion.upvoteCount}
                        </button>
                    </div>
                </div>

                {/* Replies */}
                {replies.map((reply) => (
                    <ReplyItem key={reply.id} reply={reply} />
                ))}

                {/* Resolved badge */}
                {discussion.status === 'resolved' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">This discussion was marked as resolved</span>
                    </div>
                )}
            </div>

            {/* Reply input */}
            <div className="p-3 border-t border-gray-100 shrink-0 bg-gray-50/50">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a reply..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-400"
                    rows={2}
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSubmitReply}
                        disabled={!replyText.trim()}
                        className="px-3 py-1.5 text-sm font-medium bg-cafe-500 text-white rounded-lg hover:bg-cafe-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Post Reply
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReplyItem: React.FC<{ reply: Reply }> = ({ reply }) => {
    const indentClass = reply.depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-3' : '';

    return (
        <div className={cn('', indentClass)}>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                    {reply.authorName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{reply.authorName}</span>
                {reply.isExpert && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Expert</span>
                )}
                <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(reply.createdAt))}
                </span>
            </div>
            <p className="text-sm text-gray-700 mb-1">{reply.body}</p>
            <div className="flex items-center gap-3">
                <button className="text-xs text-gray-400 hover:text-cafe-600 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {reply.upvoteCount}
                </button>
                {reply.isAcceptedAnswer && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Accepted
                    </span>
                )}
            </div>
        </div>
    );
};

export const DiscussTab: React.FC = () => {
    const { pageContext } = useDock();
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

    // Get discussions based on context
    const discussions = pageContext.resourceId
        ? getDiscussionsByResource(pageContext.resourceId)
        : pageContext.type === 'home'
            ? getRecentDiscussions(5)
            : getGeneralDiscussions();

    // Get potential experts for this context
    const experts = pageContext.resourceId
        ? mockPeople.slice(0, 2) // Simplified - in real app would use getExpertsForResource
        : [];

    if (selectedDiscussion) {
        return (
            <ThreadView
                discussion={selectedDiscussion}
                onBack={() => setSelectedDiscussion(null)}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Context header */}
            {pageContext.title && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
                    <span className="text-xs text-gray-500">Discussions on:</span>
                    <h4 className="text-sm font-medium text-gray-900 truncate">{pageContext.title}</h4>
                </div>
            )}

            {/* New discussion button */}
            <div className="p-3 shrink-0">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cafe-500 text-white text-sm font-medium rounded-lg hover:bg-cafe-600 transition-colors">
                    <MessageSquarePlus className="w-4 h-4" />
                    New Discussion
                </button>
            </div>

            {/* Discussion list */}
            <div className="flex-1 overflow-y-auto">
                {discussions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <h4 className="text-sm font-medium text-gray-700 mb-1">No discussions yet</h4>
                        <p className="text-xs text-gray-500">Be the first to start a discussion!</p>
                    </div>
                ) : (
                    <>
                        <div className="px-4 py-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {discussions.length} Discussion{discussions.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {discussions.map((discussion) => (
                            <DiscussionCard
                                key={discussion.id}
                                discussion={discussion}
                                onClick={() => setSelectedDiscussion(discussion)}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Experts footer */}
            {experts.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                        Experts on this topic
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {experts.map((expert) => (
                            <button
                                key={expert.id}
                                className="flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:bg-gray-50"
                            >
                                <div className="w-5 h-5 bg-cafe-200 rounded-full flex items-center justify-center text-cafe-700 text-xs">
                                    {expert.displayName.charAt(0)}
                                </div>
                                <span className="text-gray-700">{expert.displayName.split(' ')[0]}</span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
