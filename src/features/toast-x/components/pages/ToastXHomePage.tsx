/**
 * Toast X - Home Page Component
 * Complete recreation matching original TOAST with proper layout, hero, modals, and sidebar
 * Following 10X improvement principles
 */

import React, { memo, useState, useMemo, useCallback } from 'react';
import {
    Coffee, Award, Users, Sparkles,
    ChevronRight, Trophy, Medal, Gift, Heart, Zap, Target,
    TrendingUp, Building2, Star, Plus, Search, X, Check, Send,
    MessageCircle, Share2, Bookmark, MoreHorizontal, Bell, BarChart3, User, Link2,
} from 'lucide-react';
import { useToastXStore } from '../../store';
import { COMPANY_VALUES, AWARDS, BADGES, ANTI_GAMING_LIMITS, ADMIN_MODE } from '../../constants';
import type { Recognition, CompanyValue, ReactionType } from '../../types';
import { StandingOvationWizard } from '../organisms/StandingOvationWizard';
import { TeamToastModal } from '../organisms/TeamToastModal';
import { ToastXProfile } from '../organisms/ToastXProfile';
import { AnalyticsDashboard } from '../organisms/AnalyticsDashboard';
import { NotificationCenter } from '../organisms/NotificationCenter';
import { GratitudeChainModal } from '../organisms/GratitudeChainModal';

// ═══════════════════════════════════════════════════════════════════════════
// REACTION DATA
// ═══════════════════════════════════════════════════════════════════════════

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
    { type: 'applause', emoji: '👏', label: 'Applause' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'star', emoji: '⭐', label: 'Star' },
    { type: 'praise', emoji: '🙌', label: 'Praise' },
    { type: 'strong', emoji: '💪', label: 'Strong' },
    { type: 'magic', emoji: '✨', label: 'Magic' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TYPE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const TYPE_CONFIG = {
    QUICK_TOAST: { label: 'Quick Toast', icon: '☕', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
    STANDING_OVATION: { label: 'Standing Ovation', icon: '👏', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
    TEAM_TOAST: { label: 'Team Toast', icon: '👥', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
    MILESTONE_MOMENT: { label: 'Milestone', icon: '🏆', gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
};

type FeedFilter = 'all' | 'following' | 'my-team' | 'org-wide' | 'monthly-winners';

// ═══════════════════════════════════════════════════════════════════════════
// RECOGNITION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RecognitionCardProps {
    recognition: Recognition;
    compact?: boolean;
}

const RecognitionCard: React.FC<RecognitionCardProps> = memo(({ recognition, compact = false }) => {
    const addReaction = useToastXStore(state => state.addReaction);
    const removeReaction = useToastXStore(state => state.removeReaction);
    const addComment = useToastXStore(state => state.addComment);
    const currentUserId = useToastXStore(state => state.currentUserId);

    const [showFullMessage, setShowFullMessage] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [newComment, setNewComment] = useState('');

    const valueData = COMPANY_VALUES[recognition.value];
    const awardData = recognition.award ? AWARDS[recognition.award] : null;
    const typeInfo = TYPE_CONFIG[recognition.type];

    // Group reactions by type
    const reactionCounts = useMemo(() => {
        const counts: Record<string, { count: number; users: string[] }> = {};
        recognition.reactions.forEach(r => {
            if (!counts[r.type]) counts[r.type] = { count: 0, users: [] };
            counts[r.type].count++;
            counts[r.type].users.push(r.userName);
        });
        return counts;
    }, [recognition.reactions]);

    // Check if current user reacted
    const userReactions = useMemo(() =>
        recognition.reactions.filter(r => r.userId === currentUserId).map(r => r.type),
        [recognition.reactions, currentUserId]
    );

    // Top 3 reactions
    const topReactions = useMemo(() =>
        Object.entries(reactionCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 3),
        [reactionCounts]
    );

    // Handle reaction toggle
    const handleReaction = useCallback((type: ReactionType) => {
        if (userReactions.includes(type)) {
            removeReaction(recognition.id, type);
        } else {
            addReaction(recognition.id, type);
        }
        setShowReactionPicker(false);
    }, [userReactions, recognition.id, addReaction, removeReaction]);

    // Handle comment submit
    const handleCommentSubmit = useCallback(() => {
        if (!newComment.trim()) return;
        addComment(recognition.id, newComment.trim());
        setNewComment('');
    }, [newComment, recognition.id, addComment]);

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

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all ${compact ? 'p-4' : ''}`}>
            {/* Image Header */}
            {!compact && (
                <div className={`relative h-32 bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center overflow-hidden`}>
                    <span className="text-5xl opacity-80">{typeInfo.icon}</span>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1.5">
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs text-white/70">
                        {timeAgo}
                    </div>
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0 ring-2 ring-purple-100">
                        <span className="text-white font-semibold">{recognition.giverName?.charAt(0) || '?'}</span>
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
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Value badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{valueData.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: valueData.color }}>{valueData.shortName}</span>
                    {recognition.expertAreas.length > 0 && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                            <Sparkles className="w-3 h-3" />
                            +{recognition.expertAreas.length * 10} expert pts
                        </span>
                    )}
                </div>

                {/* Message */}
                <p className={`text-gray-700 text-sm leading-relaxed ${!showFullMessage && recognition.message.length > 200 ? 'line-clamp-3' : ''}`}>
                    {recognition.message}
                </p>
                {recognition.message.length > 200 && (
                    <button onClick={() => setShowFullMessage(!showFullMessage)} className="text-xs text-purple-600 hover:text-purple-700 mt-1">
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

                {/* Reactions summary */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
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
                        <div className="relative">
                            <button onClick={() => setShowReactionPicker(!showReactionPicker)} className="p-1.5 rounded-full hover:bg-gray-100">
                                <span className="text-sm">➕</span>
                            </button>
                            {showReactionPicker && (
                                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-wrap gap-1 w-48 z-10">
                                    {REACTIONS.map(r => (
                                        <button
                                            key={r.type}
                                            onClick={() => handleReaction(r.type)}
                                            className={`p-1.5 rounded-lg transition-colors hover:bg-gray-100 ${userReactions.includes(r.type) ? 'bg-purple-100' : ''}`}
                                            title={r.label}
                                        >
                                            <span className="text-lg">{r.emoji}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{recognition.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        <Share2 className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{recognition.reposts}</span>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Bookmark className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Comments section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {recognition.comments.slice(0, 3).map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-medium">{comment.userName?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                        {recognition.comments.length > 3 && (
                            <button className="text-xs text-purple-600 hover:text-purple-700">View all {recognition.comments.length} comments</button>
                        )}
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
                                className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4 text-purple-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

RecognitionCard.displayName = 'RecognitionCard';

// ═══════════════════════════════════════════════════════════════════════════
// QUICK TOAST MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface QuickToastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuickToastModal: React.FC<QuickToastModalProps> = ({ isOpen, onClose }) => {
    const createRecognition = useToastXStore(state => state.createRecognition);
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);
    const currentUser = useMemo(() => users.get(currentUserId), [users, currentUserId]);
    const dailyQuickToasts = currentUser?.dailyQuickToasts || 0;
    const remaining = ANTI_GAMING_LIMITS.DAILY_QUICK_TOASTS - dailyQuickToasts;

    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
    const [selectedValue, setSelectedValue] = useState<CompanyValue | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allUsers = useMemo(() => Array.from(users.values()), [users]);
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return allUsers.filter(u => u.id !== currentUserId);
        const query = searchQuery.toLowerCase();
        return allUsers.filter(u =>
            u.id !== currentUserId &&
            (u.name.toLowerCase().includes(query) || u.team.toLowerCase().includes(query))
        );
    }, [searchQuery, allUsers, currentUserId]);

    const selectedRecipient = useMemo(() =>
        selectedRecipientId ? users.get(selectedRecipientId) : null,
        [selectedRecipientId, users]
    );

    const handleSubmit = useCallback(async () => {
        if (!selectedRecipientId || !selectedValue || !message.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const result = createRecognition({
            type: 'QUICK_TOAST',
            recipientIds: [selectedRecipientId],
            value: selectedValue,
            expertAreas: [],
            message: message.trim(),
            imageId: 'img-coffee-cheers',
        });

        setIsSubmitting(false);
        if (result.success) {
            setSelectedRecipientId(null);
            setSelectedValue(null);
            setMessage('');
            onClose();
        } else {
            setError(result.error || 'Failed to create recognition');
        }
    }, [selectedRecipientId, selectedValue, message, createRecognition, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Quick Toast</h2>
                            <p className="text-sm text-white/60">Fast thanks for everyday wins</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                    <div className="absolute right-4 bottom-4 text-xs text-white/40">{remaining} left today</div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {error && <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>}

                    {/* Recipient Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Who are you thanking? *</label>
                        {selectedRecipient ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                    <span className="text-white font-semibold">{selectedRecipient?.name?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">{selectedRecipient.name}</p>
                                    <p className="text-xs text-white/50">{selectedRecipient.title} • {selectedRecipient.team}</p>
                                </div>
                                <button onClick={() => setSelectedRecipientId(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                                    <X className="w-4 h-4 text-white/60" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search by name or team..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                                {searchQuery && filteredUsers.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                                        {filteredUsers.slice(0, 5).map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => { setSelectedRecipientId(user.id); setSearchQuery(''); }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                                    <span className="text-white text-sm font-medium">{user.name?.charAt(0) || '?'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-white/50">{user.team}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Value Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Which value did they embody? *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(COMPANY_VALUES).map(value => (
                                <button
                                    key={value.id}
                                    onClick={() => setSelectedValue(value.id)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${selectedValue === value.id
                                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 ring-2 ring-amber-500/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-xl">{value.icon}</span>
                                    <span className="text-sm text-white/80 font-medium truncate">{value.shortName}</span>
                                    {selectedValue === value.id && <Check className="w-4 h-4 text-amber-400 ml-auto shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Your message *</label>
                        <textarea
                            placeholder="Thanks for the quick code review! Your feedback really helped..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 140))}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                        />
                        <div className="text-right text-xs text-white/40">{message.length}/140</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedRecipientId || !selectedValue || !message.trim() || isSubmitting || remaining <= 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${!selectedRecipientId || !selectedValue || !message.trim() || isSubmitting || remaining <= 0
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                            }`}
                    >
                        <Coffee className="w-4 h-4" />
                        <span>{isSubmitting ? 'Sending...' : 'Send Toast'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// TOAST FEED COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ToastFeedProps {
    onCreateToast?: () => void;
}

const ToastFeed: React.FC<ToastFeedProps> = memo(({ onCreateToast }) => {
    const recognitions = useToastXStore(state => state.recognitions);
    const feedFilter = useToastXStore(state => state.feedFilter);
    const setFeedFilter = useToastXStore(state => state.setFeedFilter);
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);

    const currentUser = useMemo(() => users.get(currentUserId), [users, currentUserId]);

    const filteredRecognitions = useMemo(() => {
        let filtered = [...recognitions];
        switch (feedFilter) {
            case 'my-team':
                filtered = filtered.filter(r =>
                    r.recipients.some(rec => rec.team === currentUser?.team) || r.giverId === currentUser?.id
                );
                break;
            case 'monthly-winners':
                filtered = filtered.filter(r => r.nominatedForMonthly);
                break;
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return filtered;
    }, [recognitions, feedFilter, currentUser]);

    const filterOptions: { id: FeedFilter; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'following', label: 'Following', icon: <Users className="w-4 h-4" /> },
        { id: 'my-team', label: 'My Team', icon: <Users className="w-4 h-4" /> },
        { id: 'org-wide', label: 'Org-Wide', icon: <Building2 className="w-4 h-4" /> },
        { id: 'monthly-winners', label: '⭐ Monthly', icon: <Star className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Trending Toasts
                </h2>
                {onCreateToast && (
                    <button
                        onClick={onCreateToast}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Raise Toast</span>
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filterOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => setFeedFilter(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${feedFilter === option.id
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                            }`}
                    >
                        {option.icon}
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>

            {/* Recognition cards */}
            <div className="space-y-4">
                {filteredRecognitions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-4xl mb-3">🥂</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No toasts yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Be the first to raise a toast!</p>
                        {onCreateToast && (
                            <button onClick={onCreateToast} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                                Raise a Toast
                            </button>
                        )}
                    </div>
                ) : (
                    filteredRecognitions.map(recognition => (
                        <RecognitionCard key={recognition.id} recognition={recognition} />
                    ))
                )}
            </div>
        </div>
    );
});

ToastFeed.displayName = 'ToastFeed';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════

export const ToastXHomePage: React.FC = memo(() => {
    const recognitions = useToastXStore(state => state.recognitions);
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);

    const currentUser = useMemo(() => users.get(currentUserId), [users, currentUserId]);

    const stats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));

        const thisMonth = recognitions.filter(r => new Date(r.createdAt) >= startOfMonth).length;
        const thisWeek = recognitions.filter(r => new Date(r.createdAt) >= startOfWeek).length;

        const byValue: Record<string, number> = {};
        recognitions.forEach(r => { byValue[r.value] = (byValue[r.value] || 0) + 1; });

        return { total: recognitions.length, thisWeek, thisMonth, byValue };
    }, [recognitions]);

    const leaderboard = useMemo(() => {
        const userArray = Array.from(users.values());
        return userArray
            .map(user => ({
                rank: 0,
                userId: user.id,
                userName: user.name,
                userTeam: user.team,
                score: user.recognitionsReceived,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));
    }, [users]);

    const quickToastLimit = useMemo(() => {
        if (!currentUser) return { allowed: false, remaining: 0 };
        const remaining = ANTI_GAMING_LIMITS.DAILY_QUICK_TOASTS - (currentUser.dailyQuickToasts || 0);
        return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
    }, [currentUser]);

    const standingOvationLimit = useMemo(() => {
        if (!currentUser) return { allowed: false, remaining: 0 };
        const remaining = ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS - (currentUser.dailyStandingOvations || 0);
        return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
    }, [currentUser]);

    const topValues = useMemo(() =>
        Object.entries(stats.byValue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([value, count]) => ({
                value: value as CompanyValue,
                count,
                data: COMPANY_VALUES[value as CompanyValue],
            })),
        [stats.byValue]
    );

    const [showQuickToast, setShowQuickToast] = useState(false);
    const [showStandingOvation, setShowStandingOvation] = useState(false);
    const [showTeamToast, setShowTeamToast] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showGratitudeChain, setShowGratitudeChain] = useState(false);

    return (
        <div className="max-w-7xl mx-auto py-8 lg:py-10 space-y-8 animate-fade-in">
            {/* Admin Mode Banner */}
            {ADMIN_MODE && (
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-400">🔓 Admin Mode: Unlimited toasts enabled for testing</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowProfile(true)} className="px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1">
                            <User className="w-3 h-3" /> Profile
                        </button>
                        <button onClick={() => setShowAnalytics(true)} className="px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> Analytics
                        </button>
                        <button onClick={() => setShowNotifications(true)} className="relative px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1">
                            <Bell className="w-3 h-3" /> Notifications
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center">3</span>
                        </button>
                        <button onClick={() => setShowGratitudeChain(true)} className="px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Gratitude Chain
                        </button>
                    </div>
                </div>
            )}
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 border border-amber-500/20 p-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl" />

                    <div className="relative flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Toast <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">X</span>
                                    </h1>
                                    <p className="text-gray-500 text-sm">To Outstanding Achievements, Spirit & Teamwork</p>
                                </div>
                            </div>

                            <p className="text-gray-600 max-w-md">
                                Celebrate the moments that matter. Recognize colleagues who embody our values and make Availity exceptional.
                            </p>

                            <div className="flex items-center gap-6 pt-2">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">{stats.thisMonth}</div>
                                    <div className="text-xs text-gray-500">This Month</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-500">{currentUser?.recognitionsGiven || 0}</div>
                                    <div className="text-xs text-gray-500">You Gave</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-rose-500">{currentUser?.recognitionsReceived || 0}</div>
                                    <div className="text-xs text-gray-500">You Received</div>
                                </div>
                            </div>
                        </div>

                        {currentUser && (
                            <div className="hidden lg:block text-right space-y-2">
                                <div className="flex items-center justify-end gap-3">
                                    <div className="text-right">
                                        <p className="text-gray-900 font-semibold">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500">{currentUser.credits} credits</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center ring-4 ring-purple-100">
                                        <span className="text-2xl font-bold text-white">{currentUser?.name?.charAt(0) || '?'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    {currentUser.earnedBadges.slice(0, 5).map((badge) => (
                                        <div key={badge.badge} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center" title={BADGES[badge.badge].name}>
                                            <span className="text-sm">{BADGES[badge.badge].icon}</span>
                                        </div>
                                    ))}
                                    {currentUser.earnedBadges.length > 5 && (
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                            +{currentUser.earnedBadges.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setShowQuickToast(true)}
                        disabled={!quickToastLimit.allowed}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all text-left disabled:opacity-50"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Coffee className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Toast</h3>
                                <p className="text-sm text-gray-500 mb-2">Fast thanks for everyday wins</p>
                                <div className="flex items-center gap-2 text-xs text-amber-600">
                                    <span>+5 credits</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500">{quickToastLimit.remaining} left today</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                        </div>
                    </button>

                    <button
                        onClick={() => setShowStandingOvation(true)}
                        disabled={!standingOvationLimit.allowed}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all text-left disabled:opacity-50"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Standing Ovation</h3>
                                <p className="text-sm text-gray-500 mb-2">Celebrate big achievements</p>
                                <div className="flex items-center gap-2 text-xs text-purple-600">
                                    <span>+25 credits</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500">{standingOvationLimit.remaining} left today</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                        </div>
                    </button>

                    <button
                        onClick={() => setShowTeamToast(true)}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Toast</h3>
                                <p className="text-sm text-gray-500 mb-2">Celebrate your whole team</p>
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                    <span>+15 each</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500">Up to 10 people</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                        </div>
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feed (2 columns) */}
                    <div className="lg:col-span-2">
                        <ToastFeed onCreateToast={() => setShowQuickToast(true)} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Leaderboard */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Top Recognized
                                </h3>
                                <span className="text-xs text-gray-400">This Month</span>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.userId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                                                index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{entry.userName}</p>
                                            <p className="text-xs text-gray-500">{entry.userTeam}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-amber-600">{entry.score}</p>
                                            <p className="text-xs text-gray-400">toasts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                View Full Leaderboard
                            </button>
                        </div>

                        {/* Top Values */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                Trending Values
                            </h3>
                            <div className="space-y-3">
                                {topValues.map(({ value, count, data }) => (
                                    <div key={value} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                        <span className="text-2xl">{data.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{data.shortName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold" style={{ color: data.color }}>{count}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Your Stats */}
                        {currentUser && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                    Your Stats
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-amber-50 text-center">
                                        <Gift className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.recognitionsGiven}</p>
                                        <p className="text-xs text-gray-500">Given</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-rose-50 text-center">
                                        <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.recognitionsReceived}</p>
                                        <p className="text-xs text-gray-500">Received</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-yellow-50 text-center">
                                        <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.credits}</p>
                                        <p className="text-xs text-gray-500">Credits</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-50 text-center">
                                        <Medal className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.earnedBadges.length}</p>
                                        <p className="text-xs text-gray-500">Badges</p>
                                    </div>
                                </div>

                                {currentUser.expertAreas.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">Top Expert Areas</p>
                                        <div className="flex flex-wrap gap-1">
                                            {currentUser.expertAreas.slice(0, 3).map(area => (
                                                <div key={area.id} className="px-2 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                                                    <span className="text-xs text-emerald-700">{area.name}</span>
                                                    <span className="text-xs text-emerald-600 ml-1">+{area.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <QuickToastModal isOpen={showQuickToast} onClose={() => setShowQuickToast(false)} />
            <StandingOvationWizard isOpen={showStandingOvation} onClose={() => setShowStandingOvation(false)} />
            <TeamToastModal isOpen={showTeamToast} onClose={() => setShowTeamToast(false)} />
            <ToastXProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
            {showAnalytics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAnalytics(false)} />
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 p-6">
                        <button onClick={() => setShowAnalytics(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <AnalyticsDashboard />
                    </div>
                </div>
            )}
            <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            <GratitudeChainModal isOpen={showGratitudeChain} onClose={() => setShowGratitudeChain(false)} />
        </div>
    );
});

ToastXHomePage.displayName = 'ToastXHomePage';

export default ToastXHomePage;
