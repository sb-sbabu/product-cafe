/**
 * LeaderboardWidget - Compact leaderboard display
 * 
 * Shows top contributors in a compact format.
 */

import React from 'react';
import { Trophy, Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LeaderboardEntry } from '../../types/gamification';
import { LevelIcon } from './LevelBadge';
import { PointsDisplay } from './PointsDisplay';

interface LeaderboardWidgetProps {
    entries: LeaderboardEntry[];
    title?: string;
    type?: 'all_time' | 'monthly' | 'domain';
    currentUserId?: string;
    userRank?: number;
    onViewFull?: () => void;
    className?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
    entries,
    title = 'Top Contributors',
    type = 'all_time',
    currentUserId,
    userRank,
    onViewFull,
    className,
}) => {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-4 h-4 text-amber-500" />;
            case 2: return <Medal className="w-4 h-4 text-gray-400" />;
            case 3: return <Award className="w-4 h-4 text-amber-700" />;
            default: return <span className="text-xs text-gray-500 w-4 text-center">{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
            case 2: return 'bg-gray-50 border-gray-200';
            case 3: return 'bg-orange-50 border-orange-200';
            default: return 'bg-white border-gray-100';
        }
    };

    return (
        <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-gray-900 text-sm">{title}</span>
                </div>
                {type !== 'all_time' && (
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded-full">
                        {type === 'monthly' ? 'This Month' : 'Domain'}
                    </span>
                )}
            </div>

            {/* Entries */}
            <div className="divide-y divide-gray-50">
                {entries.slice(0, 5).map((entry) => (
                    <div
                        key={entry.userId}
                        className={cn(
                            'flex items-center gap-3 px-4 py-2.5 border-l-2 transition-colors',
                            currentUserId === entry.userId && 'bg-amber-50',
                            getRankBg(entry.rank)
                        )}
                    >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-6 flex justify-center">
                            {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar placeholder + Name */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                    {entry.displayName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-sm text-gray-900 truncate">
                                            {entry.displayName}
                                        </span>
                                        <LevelIcon level={entry.level} />
                                    </div>
                                    {entry.topActivity && (
                                        <span className="text-xs text-gray-500 truncate block">
                                            {entry.topActivity}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Points */}
                        <PointsDisplay points={entry.points} variant="inline" />
                    </div>
                ))}
            </div>

            {/* User's rank if not in top 5 */}
            {userRank && userRank > 5 && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Your rank:</span>
                        <span className="font-bold text-amber-600">#{userRank}</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
            )}

            {/* View full leaderboard */}
            {onViewFull && (
                <button
                    onClick={onViewFull}
                    className="w-full py-2.5 text-sm text-amber-600 font-medium hover:bg-amber-50 transition-colors border-t border-gray-100"
                >
                    View Full Leaderboard →
                </button>
            )}
        </div>
    );
};

// Compact inline leaderboard row (for sidebar)
export const LeaderboardRow: React.FC<{
    entry: LeaderboardEntry;
    isCurrentUser?: boolean;
}> = ({ entry, isCurrentUser }) => (
    <div
        className={cn(
            'flex items-center gap-2 py-1.5',
            isCurrentUser && 'font-medium'
        )}
    >
        <span className="w-5 text-xs text-gray-500">#{entry.rank}</span>
        <LevelIcon level={entry.level} className="text-sm" />
        <span className="flex-1 text-sm truncate">{entry.displayName}</span>
        <PointsDisplay points={entry.points} variant="inline" className="text-xs" />
    </div>
);
