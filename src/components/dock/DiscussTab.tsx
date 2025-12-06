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
} from '../../data/discussions';
import { mockPeople } from '../../data/mockData';
import { formatDistanceToNow } from '../../lib/utils';
import { ThreadedReplies } from './ThreadedReplies';
import { NewDiscussionForm } from './NewDiscussionForm';

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
    const statusConfig = {
        open: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', pill: 'bg-amber-100' },
        resolved: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', pill: 'bg-green-100' },
        stale: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', pill: 'bg-gray-100' },
    };

    const style = statusConfig[discussion.status];
    const StatusIcon = discussion.status === 'resolved' ? CheckCircle : Clock;

    // Get mock participants for facepile (would come from API in real app)
    const participants = mockPeople.slice(0, Math.min(3, discussion.replyCount + 1));

    return (
        <div
            className={cn(
                'group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer m-2',
                'hover:border-amber-200/50 hover:-translate-y-0.5',
                style.border
            )}
            onClick={onClick}
        >
            {/* Card Header - Title + Metadata */}
            <div className="px-3 pt-3 pb-2 border-b border-gray-50">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {discussion.title}
                    </h4>
                    <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 font-medium',
                        style.pill, style.text
                    )}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {discussion.status}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="font-mono">#{discussion.id.slice(-4)}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(discussion.createdAt))}</span>
                </div>
            </div>

            {/* Card Body - Preview */}
            <div className="px-3 py-2">
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {discussion.body}
                </p>
            </div>

            {/* Card Footer - Stats + Facepile */}
            <div className="px-3 pb-2.5 flex items-center justify-between">
                {/* Stats */}
                <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5 hover:text-amber-600 transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        <span className="font-medium">{discussion.replyCount}</span>
                    </span>
                    <span className="flex items-center gap-0.5 hover:text-amber-600 transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="font-medium">{discussion.upvoteCount}</span>
                    </span>
                </div>

                {/* Participant Facepile */}
                <div className="flex items-center -space-x-1.5">
                    {participants.map((person, idx) => (
                        <div
                            key={person.id}
                            className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-white flex items-center justify-center text-[8px] font-semibold text-amber-700"
                            style={{ zIndex: participants.length - idx }}
                            title={person.displayName}
                        >
                            {person.displayName.charAt(0)}
                        </div>
                    ))}
                    {discussion.replyCount > 3 && (
                        <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-medium text-gray-500">
                            +{discussion.replyCount - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
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
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
                {/* Original post */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-semibold">
                            {discussion.authorName.charAt(0)}
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-gray-900">{discussion.authorName}</span>
                            <span className="text-xs text-gray-400 ml-2">
                                {formatDistanceToNow(new Date(discussion.createdAt))}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{discussion.body}</p>
                    <div className="mt-3 flex items-center gap-3">
                        <button className="text-xs text-gray-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-medium">{discussion.upvoteCount}</span>
                        </button>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs text-gray-400">
                            {discussion.replyCount} {discussion.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                    </div>
                </div>

                {/* Threaded Replies - Reddit Style */}
                <div className="mt-2">
                    <ThreadedReplies
                        replies={replies}
                        onReply={(parentId) => console.log('Reply to:', parentId)}
                        onUpvote={(replyId) => console.log('Upvote:', replyId)}
                        maxDepth={5}
                    />
                </div>

                {/* Resolved badge */}
                {discussion.status === 'resolved' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">This discussion was marked as resolved</span>
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

// ReplyItem removed - using ThreadedReplies component instead

export const DiscussTab: React.FC = () => {
    const { pageContext } = useDock();
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
    const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'mentions' | 'unread' | 'action'>('all');

    // Filter capsules configuration
    const filterCapsules = [
        { id: 'all' as const, label: 'All', count: null },
        { id: 'mentions' as const, label: 'Mentions', count: 2 },
        { id: 'unread' as const, label: 'Unread', count: 3 },
        { id: 'action' as const, label: 'Action', count: 1 },
    ];

    // Get discussions based on context
    const allDiscussions = pageContext.resourceId
        ? getDiscussionsByResource(pageContext.resourceId)
        : pageContext.type === 'home'
            ? getRecentDiscussions(5)
            : getGeneralDiscussions();

    // Apply filter (simplified - in real app would use backend filtering)
    const discussions = activeFilter === 'all'
        ? allDiscussions
        : activeFilter === 'action'
            ? allDiscussions.filter(d => d.status === 'open')
            : allDiscussions.slice(0, activeFilter === 'unread' ? 3 : 2);

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

            {/* Filter Bar - Capsule Filters */}
            <div className="px-3 py-2 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {filterCapsules.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                                activeFilter === filter.id
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            {filter.label}
                            {filter.count !== null && (
                                <span className={cn(
                                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                                    activeFilter === filter.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-amber-100 text-amber-700'
                                )}>
                                    {filter.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* New discussion button */}
            <div className="p-3 shrink-0">
                <button
                    onClick={() => setShowNewDiscussionForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow"
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    New Discussion
                </button>
            </div>

            {/* New Discussion Form Modal */}
            <NewDiscussionForm
                isOpen={showNewDiscussionForm}
                onClose={() => setShowNewDiscussionForm(false)}
            />

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
