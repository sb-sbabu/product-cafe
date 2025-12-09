/**
 * BaristaCards - Rich Response Card Components for Café BARISTA
 * 
 * Premium card components for various response types:
 * - DocumentCard: For playbooks, templates, resources
 * - PersonCard: For experts and team members
 * - DefinitionCard: For term explanations
 * - StatsCard: For love points and metrics
 * - VerticalListCard: For search results
 */

import React from 'react';
import {
    FileText, ExternalLink, Eye, Share2, Bookmark,
    Mail, MessageSquare, Calendar, User,
    BookOpen, Lightbulb, ArrowRight,
    TrendingUp, TrendingDown, Minus,
    Star, MapPin, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DocumentData {
    id: string;
    title: string;
    type: string;
    version?: string;
    updatedAt: string;
    author: string;
    authorTeam: string;
    path: string;
    description: string;
    views: number;
    rating: number;
    url?: string;
}

export interface PersonData {
    id: string;
    name: string;
    title: string;
    team: string;
    location: string;
    tenure: string;
    avatar?: string;
    expertise: string[];
    email?: string;
    teamsLink?: string;
}

export interface DefinitionData {
    term: string;
    definition: string;
    keyPoints: string[];
    context?: string;
    relatedTopics: string[];
}

export interface StatsData {
    balance: number;
    monthlyEarned: number;
    monthlySpent: number;
    recentActivity: Array<{
        id: string;
        description: string;
        amount: number;
        date: string;
    }>;
}

export interface ListItem {
    id: string;
    title: string;
    subtitle: string;
    date?: string;
    author?: string;
    icon?: React.ReactNode;
    url?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentCardProps {
    data: DocumentData;
    onOpen?: () => void;
    onPreview?: () => void;
    onShare?: () => void;
    onSave?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
    data,
    onOpen,
    onPreview,
    onShare,
    onSave
}) => {
    const getFileIcon = (type: string) => {
        const icons: Record<string, string> = {
            'pptx': '📘',
            'pdf': '📕',
            'doc': '📄',
            'xlsx': '📊',
            'default': '📁'
        };
        return icons[type.toLowerCase()] || icons.default;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{getFileIcon(data.type)}</div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{data.title}</h4>
                        <p className="text-xs text-gray-500">
                            Version {data.version || '1.0'} • Updated {data.updatedAt}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {data.description}
                </p>

                {/* Metadata */}
                <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span>{data.author} • {data.authorTeam}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">{data.path}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {data.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            {data.rating.toFixed(1)} rating
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={onOpen}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-emerald-500 text-white text-xs font-medium',
                        'hover:bg-emerald-600 transition-colors'
                    )}
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                </button>
                <button
                    onClick={onPreview}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-gray-100 text-gray-700 text-xs font-medium',
                        'hover:bg-gray-200 transition-colors'
                    )}
                >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                </button>
                <button
                    onClick={onShare}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onSave}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Bookmark className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSON CARD
// ═══════════════════════════════════════════════════════════════════════════

interface PersonCardProps {
    data: PersonData;
    onEmail?: () => void;
    onTeams?: () => void;
    onBookMeeting?: () => void;
    onViewProfile?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
    data,
    onEmail,
    onTeams,
    onBookMeeting,
    onViewProfile
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                        {data.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{data.name}</h4>
                        <p className="text-sm text-gray-600">{data.title} • {data.team}</p>
                    </div>
                </div>

                {/* Expertise */}
                <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Expertise:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {data.expertise.slice(0, 4).map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                        {data.expertise.length > 4 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">
                                +{data.expertise.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Location & Tenure */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {data.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {data.tenure}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={onEmail}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-gray-100 text-gray-700 text-xs font-medium',
                        'hover:bg-gray-200 transition-colors'
                    )}
                >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                </button>
                <button
                    onClick={onTeams}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-gray-100 text-gray-700 text-xs font-medium',
                        'hover:bg-gray-200 transition-colors'
                    )}
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Teams
                </button>
                <button
                    onClick={onBookMeeting}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-gray-100 text-gray-700 text-xs font-medium',
                        'hover:bg-gray-200 transition-colors'
                    )}
                >
                    <Calendar className="w-3.5 h-3.5" />
                    Book
                </button>
                <button
                    onClick={onViewProfile}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-emerald-500 text-white text-xs font-medium',
                        'hover:bg-emerald-600 transition-colors ml-auto'
                    )}
                >
                    <User className="w-3.5 h-3.5" />
                    Profile
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFINITION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface DefinitionCardProps {
    data: DefinitionData;
    onLearnMore?: () => void;
    onRelatedTopic?: (topic: string) => void;
}

export const DefinitionCard: React.FC<DefinitionCardProps> = ({
    data,
    onLearnMore: _onLearnMore,
    onRelatedTopic
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                        {data.term}
                    </h4>
                </div>

                {/* Definition */}
                <p className="text-sm text-gray-700 leading-relaxed">
                    {data.definition}
                </p>

                {/* Key Points */}
                {data.keyPoints.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">KEY POINTS</p>
                        <ul className="space-y-1.5">
                            {data.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Context */}
                {data.context && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">CONTEXT</span>
                        </div>
                        <p className="text-sm text-amber-800">{data.context}</p>
                    </div>
                )}
            </div>

            {/* Related Topics */}
            {data.relatedTopics.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">RELATED TOPICS</p>
                    <div className="flex flex-wrap gap-2">
                        {data.relatedTopics.map((topic, idx) => (
                            <button
                                key={idx}
                                onClick={() => onRelatedTopic?.(topic)}
                                className={cn(
                                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
                                    'bg-white border border-gray-200 text-xs text-gray-600',
                                    'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700',
                                    'transition-colors'
                                )}
                            >
                                <BookOpen className="w-3 h-3" />
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// STATS CARD (Love Points)
// ═══════════════════════════════════════════════════════════════════════════

interface StatsCardProps {
    data: StatsData;
    userName?: string;
    onRedeem?: () => void;
    onViewHistory?: () => void;
    onLeaderboard?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    data,
    userName = 'You',
    onRedeem,
    onViewHistory,
    onLeaderboard
}) => {
    const netChange = data.monthlyEarned - data.monthlySpent;
    const TrendIcon = netChange > 0 ? TrendingUp : netChange < 0 ? TrendingDown : Minus;
    const trendColor = netChange > 0 ? 'text-emerald-500' : netChange < 0 ? 'text-red-500' : 'text-gray-400';

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💜</span>
                    <h4 className="font-semibold text-gray-900">{userName}'s Love Points</h4>
                </div>

                {/* Balance */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-center mb-4">
                    <p className="text-purple-100 text-sm mb-1">Current Balance</p>
                    <p className="text-4xl font-bold text-white">
                        💜 {data.balance.toLocaleString()}
                    </p>
                </div>

                {/* Monthly Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-semibold text-emerald-600">+{data.monthlyEarned}</p>
                        <p className="text-xs text-emerald-600">Earned</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-semibold text-red-500">-{data.monthlySpent}</p>
                        <p className="text-xs text-red-500">Spent</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <TrendIcon className={cn('w-4 h-4', trendColor)} />
                            <p className={cn('text-lg font-semibold', trendColor)}>
                                {netChange >= 0 ? '+' : ''}{netChange}
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">Net</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">RECENT ACTIVITY</p>
                    <div className="space-y-2">
                        {data.recentActivity.slice(0, 4).map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 truncate flex-1">{activity.description}</span>
                                <span className={cn(
                                    'font-medium ml-2',
                                    activity.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                                )}>
                                    {activity.amount >= 0 ? '+' : ''}{activity.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={onRedeem}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-purple-500 text-white text-xs font-medium',
                        'hover:bg-purple-600 transition-colors'
                    )}
                >
                    🎁 Redeem Points
                </button>
                <button
                    onClick={onViewHistory}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-gray-100 text-gray-700 text-xs font-medium',
                        'hover:bg-gray-200 transition-colors'
                    )}
                >
                    📊 Full History
                </button>
                <button
                    onClick={onLeaderboard}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'bg-gray-100 text-gray-700 text-xs font-medium',
                        'hover:bg-gray-200 transition-colors'
                    )}
                >
                    🏆 Leaderboard
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// VERTICAL LIST CARD
// ═══════════════════════════════════════════════════════════════════════════

interface VerticalListCardProps {
    title: string;
    items: ListItem[];
    totalCount?: number;
    onItemClick?: (item: ListItem) => void;
    onShowAll?: () => void;
    onRefineSearch?: () => void;
}

export const VerticalListCard: React.FC<VerticalListCardProps> = ({
    title,
    items,
    totalCount,
    onItemClick,
    onShowAll,
    onRefineSearch
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-medium text-gray-900">{title}</h4>
                {totalCount && totalCount > items.length && (
                    <p className="text-xs text-gray-500">Showing {items.length} of {totalCount}</p>
                )}
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md text-xs font-medium text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                            {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700">
                                {item.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {item.author && <span>{item.author} • </span>}
                                {item.subtitle}
                            </p>
                        </div>
                        {item.date && (
                            <span className="text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                    </button>
                ))}
            </div>

            {/* Actions */}
            {(onShowAll || onRefineSearch) && (
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                    {onShowAll && (
                        <button
                            onClick={onShowAll}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                                'bg-gray-100 text-gray-700 text-xs font-medium',
                                'hover:bg-gray-200 transition-colors'
                            )}
                        >
                            📊 Show All {totalCount || items.length} Results
                        </button>
                    )}
                    {onRefineSearch && (
                        <button
                            onClick={onRefineSearch}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                                'bg-gray-100 text-gray-700 text-xs font-medium',
                                'hover:bg-gray-200 transition-colors'
                            )}
                        >
                            🔍 Refine Search
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD CARD
// ═══════════════════════════════════════════════════════════════════════════

interface LeaderboardEntry {
    rank: number;
    name: string;
    team: string;
    points: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

interface LeaderboardCardProps {
    entries: LeaderboardEntry[];
    onViewFull?: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
    entries,
    onViewFull
}) => {
    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h4 className="font-semibold text-gray-900">Leaderboard</h4>
            </div>

            <div className="divide-y divide-gray-50">
                {entries.map((entry) => (
                    <div
                        key={entry.rank}
                        className={cn(
                            'flex items-center gap-3 p-3',
                            entry.isCurrentUser && 'bg-emerald-50'
                        )}
                    >
                        <span className="w-8 text-center text-lg">
                            {getMedalEmoji(entry.rank)}
                        </span>
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-medium">
                            {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {entry.name}
                                {entry.isCurrentUser && <span className="text-emerald-600 ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-gray-500">{entry.team}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-purple-600">💜 {entry.points.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {onViewFull && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onViewFull}
                        className={cn(
                            'w-full flex items-center justify-center gap-2 py-2 rounded-lg',
                            'bg-gray-100 text-gray-700 text-sm font-medium',
                            'hover:bg-gray-200 transition-colors'
                        )}
                    >
                        View Full Leaderboard
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};
