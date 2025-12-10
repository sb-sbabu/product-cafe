import React from 'react';
import { Flame, TrendingUp, Zap, Award } from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { getLevelInfo } from '../gamification';
import { cn } from '../../../lib/utils';

interface CreditsWidgetProps {
    variant?: 'full' | 'compact' | 'mini';
    className?: string;
}

export const CreditsWidget: React.FC<CreditsWidgetProps> = ({ variant = 'full', className }) => {
    const { userCredits } = useLibraryStore();
    const levelInfo = getLevelInfo(userCredits.totalCredits);

    if (variant === 'mini') {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {levelInfo.level}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Zap className="w-4 h-4 text-amber-500" />
                    {userCredits.totalCredits.toLocaleString()}
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={cn('bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl">
                            {levelInfo.icon}
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Level {levelInfo.level}</div>
                            <div className="font-bold text-gray-900">{levelInfo.title}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-amber-600">
                            <Zap className="w-5 h-5" />
                            {userCredits.totalCredits.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">credits</div>
                    </div>
                </div>

                {levelInfo.nextLevel && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{levelInfo.creditsToNext} to next level</span>
                            <span>{Math.round(levelInfo.progressToNext)}%</span>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                                style={{ width: `${levelInfo.progressToNext}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full variant
    return (
        <div className={cn('bg-white rounded-2xl border border-gray-100 overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                            {levelInfo.icon}
                        </div>
                        <div>
                            <div className="text-white/80 text-sm">Level {levelInfo.level}</div>
                            <div className="text-2xl font-bold">{levelInfo.title}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-3xl font-bold">
                            <Zap className="w-8 h-8" />
                            {userCredits.totalCredits.toLocaleString()}
                        </div>
                        <div className="text-white/80 text-sm">total credits</div>
                    </div>
                </div>

                {levelInfo.nextLevel && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-white/80 mb-2">
                            <span>Progress to {levelInfo.nextLevel.title}</span>
                            <span>{levelInfo.creditsToNext} credits to go</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${levelInfo.progressToNext}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                        <div className="text-xl font-bold text-gray-900">{userCredits.currentStreak}</div>
                        <div className="text-xs text-gray-500">Day Streak</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <Award className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                        <div className="text-xl font-bold text-gray-900">{userCredits.badges.length}</div>
                        <div className="text-xs text-gray-500">Badges</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
                        <div className="text-xl font-bold text-gray-900">{userCredits.longestStreak}</div>
                        <div className="text-xs text-gray-500">Best Streak</div>
                    </div>
                </div>

                {/* Recent Activity */}
                {userCredits.activities.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
                        <div className="space-y-2">
                            {userCredits.activities.slice(0, 5).map(activity => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                                >
                                    <span className="text-sm text-gray-600">{activity.description}</span>
                                    <span className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                                        +{activity.credits} <Zap className="w-3 h-3" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Badges Preview */}
                {userCredits.badges.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Badges</h4>
                        <div className="flex flex-wrap gap-2">
                            {userCredits.badges.slice(0, 6).map(badge => (
                                <div
                                    key={badge.id}
                                    className={cn(
                                        'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                                        badge.tier === 'bronze' && 'bg-amber-100',
                                        badge.tier === 'silver' && 'bg-gray-100',
                                        badge.tier === 'gold' && 'bg-yellow-100',
                                        badge.tier === 'platinum' && 'bg-purple-100'
                                    )}
                                    title={badge.name}
                                >
                                    {badge.icon}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
