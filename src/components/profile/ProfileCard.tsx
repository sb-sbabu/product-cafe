/**
 * ProfileCard - Summary card showing user profile with gamification stats
 * 
 * Features:
 * - Avatar, name, role
 * - Level and points display
 * - Quick stats (discussions, badges)
 * - Recent badges preview
 */

import React from 'react';
import { MessageSquare, Award, Star, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LevelBadge, PointsDisplay, BadgeIcon } from '../gamification';
import type { Level, BadgeDefinition } from '../../types/gamification';

interface ProfileCardProps {
    displayName: string;
    title: string;
    team?: string;
    avatarUrl?: string;
    level: Level;
    totalPoints: number;
    weeklyPoints: number;
    discussionCount: number;
    replyCount: number;
    acceptedAnswers: number;
    recentBadges: BadgeDefinition[];
    className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    displayName,
    title,
    team,
    avatarUrl,
    level,
    totalPoints,
    weeklyPoints,
    discussionCount,
    replyCount,
    acceptedAnswers,
    recentBadges,
    className,
}) => {
    return (
        <div className={cn(
            'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden',
            className
        )}>
            {/* Header with gradient background */}
            <div className="h-20 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

            {/* Avatar and basic info */}
            <div className="px-5 pb-5 -mt-10">
                <div className="flex items-end gap-4 mb-4">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-2xl">
                            {displayName.charAt(0)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0 mb-1">
                        <h2 className="text-xl font-bold text-gray-900 truncate">{displayName}</h2>
                        <p className="text-sm text-gray-500 truncate">{title}{team && ` · ${team}`}</p>
                    </div>
                </div>

                {/* Level and Points */}
                <div className="flex items-center justify-between mb-5 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <LevelBadge level={level} variant="card" />
                    <div className="text-right">
                        <PointsDisplay points={totalPoints} variant="large" showLabel />
                        <p className="text-xs text-gray-400 mt-0.5">+{weeklyPoints} this week</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <span className="block text-lg font-bold text-gray-900">{discussionCount}</span>
                        <span className="text-xs text-gray-400">Discussions</span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <span className="block text-lg font-bold text-gray-900">{replyCount}</span>
                        <span className="text-xs text-gray-400">Replies</span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <Target className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <span className="block text-lg font-bold text-gray-900">{acceptedAnswers}</span>
                        <span className="text-xs text-gray-400">Accepted</span>
                    </div>
                </div>

                {/* Recent Badges */}
                {recentBadges.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Recent Badges</span>
                        </div>
                        <div className="flex gap-2">
                            {recentBadges.slice(0, 4).map(badge => (
                                <BadgeIcon
                                    key={badge.id}
                                    badge={badge}
                                    size="sm"
                                />
                            ))}
                            {recentBadges.length > 4 && (
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">+{recentBadges.length - 4}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCard;
