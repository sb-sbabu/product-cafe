/**
 * RecognitionCard - Individual recognition display
 * Shows image, message, reactions, comments, and actions
 */

import React, { useState, useMemo } from 'react';
import {
    MessageCircle, Share2, Bookmark, MoreHorizontal,
    Award, Sparkles, Send
} from 'lucide-react';
import type { Recognition, ReactionType } from '../types';
import { useToastStore } from '../toastStore';
import { COMPANY_VALUES, AWARDS, REACTIONS, EXPERT_AREAS } from '../data';

interface RecognitionCardProps {
    recognition: Recognition;
    compact?: boolean;
}

export const RecognitionCard: React.FC<RecognitionCardProps> = ({
    recognition,
    compact = false,
}) => {
    const { addReaction, removeReaction, addComment, currentUserId } = useToastStore();
    const [showFullMessage, setShowFullMessage] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showExpertAreas, setShowExpertAreas] = useState(false);

    const valueData = COMPANY_VALUES[recognition.value];
    const awardData = recognition.award ? AWARDS[recognition.award] : null;

    // Group reactions by type
    const reactionCounts = useMemo(() => {
        const counts: Record<string, { count: number; users: string[] }> = {};
        recognition.reactions.forEach(r => {
            if (!counts[r.type]) {
                counts[r.type] = { count: 0, users: [] };
            }
            counts[r.type].count++;
            counts[r.type].users.push(r.userName);
        });
        return counts;
    }, [recognition.reactions]);

    // Check if current user reacted
    const userReactions = useMemo(() => {
        return recognition.reactions
            .filter(r => r.userId === currentUserId)
            .map(r => r.type);
    }, [recognition.reactions, currentUserId]);

    // Top 3 reactions
    const topReactions = useMemo(() => {
        return Object.entries(reactionCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3);
    }, [reactionCounts]);

    // Handle reaction toggle
    const handleReaction = (type: ReactionType) => {
        if (userReactions.includes(type)) {
            removeReaction(recognition.id, type);
        } else {
            addReaction(recognition.id, type);
        }
        setShowReactionPicker(false);
    };

    // Handle comment submit
    const handleCommentSubmit = () => {
        if (!newComment.trim()) return;
        addComment(recognition.id, newComment.trim());
        setNewComment('');
    };

    // Format time ago
    const timeAgo = useMemo(() => {
        const date = new Date(recognition.createdAt);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }, [recognition.createdAt]);

    // Get type label and color
    const typeConfig = {
        QUICK_TOAST: { label: 'Quick Toast', icon: '☕', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
        STANDING_OVATION: { label: 'Standing Ovation', icon: '👏', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
        TEAM_TOAST: { label: 'Team Toast', icon: '👥', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
        MILESTONE_MOMENT: { label: 'Milestone', icon: '🏆', gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
    };
    const typeInfo = typeConfig[recognition.type];

    // Expert areas with names
    const expertAreaNames = recognition.expertAreas
        .map(id => EXPERT_AREAS.find(a => a.id === id)?.name || id)
        .slice(0, 5);

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all ${compact ? 'p-4' : ''}`}>
            {/* Image Header */}
            {!compact && (
                <div className={`relative h-32 bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center overflow-hidden`}>
                    <span className="text-5xl opacity-80">{typeInfo.icon}</span>

                    {/* Type badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1.5">
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                    </div>

                    {/* Time */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs text-white/70">
                        {timeAgo}
                    </div>

                    {/* Award badge */}
                    {awardData && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1.5 shadow-lg">
                            <span>{awardData.icon}</span>
                            <span>{awardData.name}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className={compact ? '' : 'p-5'}>
                {/* Header: Giver → Recipients */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Giver avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0 ring-2 ring-purple-100">
                        <span className="text-white font-semibold">{recognition.giverName.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{recognition.giverName}</span>
                            <span className="text-gray-400">→</span>
                            {recognition.recipients.slice(0, 3).map((r, i) => (
                                <span key={r.id} className="font-semibold text-gray-900">
                                    {r.name}{i < Math.min(recognition.recipients.length - 1, 2) ? ', ' : ''}
                                </span>
                            ))}
                            {recognition.recipients.length > 3 && (
                                <span className="text-gray-500">+{recognition.recipients.length - 3} more</span>
                            )}
                        </div>
                        {recognition.giverTitle && (
                            <p className="text-xs text-gray-500">{recognition.giverTitle}</p>
                        )}
                    </div>

                    {/* More menu */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Value badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{valueData.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: valueData.color }}>{valueData.shortName}</span>

                    {/* Expert areas toggle */}
                    {expertAreaNames.length > 0 && (
                        <button
                            onClick={() => setShowExpertAreas(!showExpertAreas)}
                            className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>+{recognition.expertAreas.length * 10} expert pts</span>
                        </button>
                    )}
                </div>

                {/* Expert areas (expandable) */}
                {showExpertAreas && expertAreaNames.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                        {expertAreaNames.map(name => (
                            <span key={name} className="px-2 py-0.5 rounded-full bg-purple-100 text-xs text-purple-700">
                                {name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Message */}
                <p className={`text-gray-700 text-sm leading-relaxed ${!showFullMessage && recognition.message.length > 200 ? 'line-clamp-3' : ''}`}>
                    {recognition.message}
                </p>
                {recognition.message.length > 200 && (
                    <button
                        onClick={() => setShowFullMessage(!showFullMessage)}
                        className="text-xs text-purple-600 hover:text-purple-700 mt-1"
                    >
                        {showFullMessage ? 'Show less' : 'Read more'}
                    </button>
                )}

                {/* Impact */}
                {recognition.impact && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Impact</p>
                        <p className="text-sm text-gray-700">{recognition.impact}</p>
                    </div>
                )}

                {/* Compact award badge */}
                {compact && awardData && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">{awardData.name}</span>
                    </div>
                )}

                {/* Reactions summary */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {/* Reactions */}
                    <div className="flex items-center gap-1">
                        {topReactions.map(([type, data]) => {
                            const reactionInfo = REACTIONS.find(r => r.type === type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleReaction(type as ReactionType)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${userReactions.includes(type as ReactionType)
                                        ? 'bg-purple-100 border border-purple-200'
                                        : 'hover:bg-gray-100 border border-transparent'
                                        }`}
                                    title={data.users.join(', ')}
                                >
                                    <span className="text-sm">{reactionInfo?.emoji}</span>
                                    <span className="text-xs text-gray-600">{data.count}</span>
                                </button>
                            );
                        })}

                        {/* Add reaction button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowReactionPicker(!showReactionPicker)}
                                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-sm">➕</span>
                            </button>

                            {/* Reaction picker */}
                            {showReactionPicker && (
                                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-wrap gap-1 w-48 z-10">
                                    {REACTIONS.map(r => (
                                        <button
                                            key={r.type}
                                            onClick={() => handleReaction(r.type)}
                                            className={`p-1.5 rounded-lg transition-colors hover:bg-gray-100 ${userReactions.includes(r.type) ? 'bg-purple-100' : ''
                                                }`}
                                            title={r.label}
                                        >
                                            <span className="text-lg">{r.emoji}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{recognition.comments.length}</span>
                    </button>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <Share2 className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{recognition.reposts}</span>
                    </button>

                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <Bookmark className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Comments section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {/* Existing comments */}
                        {recognition.comments.slice(0, 3).map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-medium">{comment.userName.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5">{comment.content}</p>
                                </div>
                            </div>
                        ))}

                        {recognition.comments.length > 3 && (
                            <button className="text-xs text-purple-600 hover:text-purple-700">
                                View all {recognition.comments.length} comments
                            </button>
                        )}

                        {/* New comment input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <button
                                onClick={handleCommentSubmit}
                                disabled={!newComment.trim()}
                                className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4 text-purple-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecognitionCard;
