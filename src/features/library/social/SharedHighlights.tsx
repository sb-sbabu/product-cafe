/**
 * SharedHighlights - Community highlight feed
 * 
 * Features:
 * - Feed of highlights from colleagues
 * - Reactions and "Book Talk" discussions
 * - Filter by team, book, or colleague
 * - Trending highlights
 */

import React, { useState, useMemo } from 'react';
import {
    Highlighter, MessageCircle, Sparkles, Users,
    BookOpen, Filter, TrendingUp, ThumbsUp, MessageSquare
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Highlight {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userTeam: string;
    bookId: string;
    bookTitle: string;
    text: string;
    pageNumber?: number;
    reaction?: { type: 'insightful' | 'helpful' | 'inspiring'; count: number }[];
    comments: number;
    createdAt: Date;
}

interface SharedHighlightsProps {
    className?: string;
}

// Mock data - would come from API
const MOCK_HIGHLIGHTS: Highlight[] = [
    {
        id: 'sh-1',
        userId: 'user-1',
        userName: 'Sarah Chen',
        userTeam: 'Platform',
        bookId: 'inspired',
        bookTitle: 'Inspired',
        text: 'Empowered product teams vs feature teams is the key distinction. The difference is that empowered teams are given problems to solve, rather than features to build.',
        pageNumber: 45,
        reaction: [
            { type: 'insightful', count: 12 },
            { type: 'helpful', count: 8 },
        ],
        comments: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: 'sh-2',
        userId: 'user-2',
        userName: 'Marcus Johnson',
        userTeam: 'Growth',
        bookId: 'continuous-discovery',
        bookTitle: 'Continuous Discovery Habits',
        text: 'The Opportunity Solution Tree helps connect discovery to delivery. It forces us to be explicit about our assumptions and the evidence behind them.',
        pageNumber: 87,
        reaction: [
            { type: 'helpful', count: 15 },
            { type: 'inspiring', count: 6 },
        ],
        comments: 7,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
        id: 'sh-3',
        userId: 'user-3',
        userName: 'Emily Rodriguez',
        userTeam: 'Mobile',
        bookId: 'deep-work',
        bookTitle: 'Deep Work',
        text: 'Deep work is the superpower of the 21st century. The ability to concentrate without distraction on cognitively demanding tasks is becoming increasingly rare and increasingly valuable.',
        pageNumber: 12,
        reaction: [
            { type: 'inspiring', count: 23 },
            { type: 'insightful', count: 18 },
        ],
        comments: 11,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: 'sh-4',
        userId: 'user-4',
        userName: 'David Kim',
        userTeam: 'Enterprise',
        bookId: 'good-strategy-bad-strategy',
        bookTitle: 'Good Strategy Bad Strategy',
        text: 'Good strategy works by focusing energy and resources on one, or a very few, pivotal objectives whose accomplishment will lead to a cascade of favorable outcomes.',
        pageNumber: 78,
        reaction: [
            { type: 'insightful', count: 19 },
        ],
        comments: 5,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
];

const REACTION_ICONS = {
    insightful: { icon: '📍', label: 'Insightful' },
    helpful: { icon: '💡', label: 'Helpful' },
    inspiring: { icon: '🔥', label: 'Inspiring' },
};

export const SharedHighlights: React.FC<SharedHighlightsProps> = ({
    className
}) => {
    const [filter, setFilter] = useState<'all' | 'trending' | 'team'>('all');
    const [activeReaction, setActiveReaction] = useState<Record<string, string>>({});

    const filteredHighlights = useMemo(() => {
        let highlights = [...MOCK_HIGHLIGHTS];

        if (filter === 'trending') {
            highlights = highlights.sort((a, b) => {
                const aScore = (a.reaction?.reduce((sum, r) => sum + r.count, 0) || 0) + a.comments * 2;
                const bScore = (b.reaction?.reduce((sum, r) => sum + r.count, 0) || 0) + b.comments * 2;
                return bScore - aScore;
            });
        }

        return highlights;
    }, [filter]);

    const handleReaction = (highlightId: string, reactionType: string) => {
        setActiveReaction(prev => ({
            ...prev,
            [highlightId]: prev[highlightId] === reactionType ? '' : reactionType
        }));
    };

    const formatTimeAgo = (date: Date) => {
        const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Highlighter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Shared Highlights</h3>
                            <p className="text-xs text-gray-500">See what your colleagues are reading</p>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                filter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('trending')}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                                filter === 'trending' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <TrendingUp className="w-3 h-3" />
                            Trending
                        </button>
                        <button
                            onClick={() => setFilter('team')}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                                filter === 'team' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Users className="w-3 h-3" />
                            Team
                        </button>
                    </div>
                </div>
            </div>

            {/* Highlights Feed */}
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {filteredHighlights.map(highlight => (
                    <div key={highlight.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                {highlight.userName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{highlight.userName}</p>
                                <p className="text-xs text-gray-400">{highlight.userTeam} • {formatTimeAgo(highlight.createdAt)}</p>
                            </div>
                        </div>

                        {/* Highlight Content */}
                        <div className="pl-12">
                            <div className="p-4 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 rounded-xl border-l-4 border-amber-400 mb-3">
                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                    "{highlight.text}"
                                </p>
                            </div>

                            {/* Book Reference */}
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                    {highlight.bookTitle}
                                    {highlight.pageNumber && ` • p.${highlight.pageNumber}`}
                                </span>
                            </div>

                            {/* Reactions and Comments */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {Object.entries(REACTION_ICONS).map(([type, { icon, label }]) => {
                                        const reaction = highlight.reaction?.find(r => r.type === type);
                                        const isActive = activeReaction[highlight.id] === type;

                                        return (
                                            <button
                                                key={type}
                                                onClick={() => handleReaction(highlight.id, type)}
                                                className={cn(
                                                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
                                                    isActive
                                                        ? "bg-rose-100 text-rose-700"
                                                        : reaction
                                                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                                )}
                                                title={label}
                                            >
                                                <span>{icon}</span>
                                                <span>{(reaction?.count || 0) + (isActive ? 1 : 0)}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-gray-500 hover:bg-gray-100 transition-colors">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{highlight.comments} comments</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SharedHighlights;
