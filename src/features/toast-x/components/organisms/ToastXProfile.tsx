/**
 * Toast X - User Profile Modal
 * Comprehensive profile view with stats, badges, expert areas, and history
 * 10x improvements: Animated stats, radar visualization, badge progress, shareable cards
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    X, Trophy, Heart, Medal, Award, Star, Sparkles,
    TrendingUp, Gift, ChevronRight, Share2, Download
} from 'lucide-react';
import { useToastXStore } from '../../store';
import { COMPANY_VALUES, BADGES, AWARDS } from '../../constants';
import type { CompanyValue, BadgeType, ToastUser } from '../../types';

interface ToastXProfileProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
}

type ProfileTab = 'overview' | 'badges' | 'history';

export const ToastXProfile: React.FC<ToastXProfileProps> = memo(({
    isOpen,
    onClose,
    userId,
}) => {
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);
    const recognitions = useToastXStore(state => state.recognitions);

    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

    // Get user data
    const user = useMemo((): ToastUser | undefined => {
        if (userId) return users.get(userId);
        return users.get(currentUserId);
    }, [userId, currentUserId, users]);

    // Get user's recognitions received
    const receivedRecognitions = useMemo(() => {
        if (!user) return [];
        return Array.from(recognitions.values())
            .filter(r => r.recipientIds.includes(user.id))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
    }, [user, recognitions]);

    // Get user's recognitions given
    const givenRecognitions = useMemo(() => {
        if (!user) return [];
        return Array.from(recognitions.values())
            .filter(r => r.giverId === user.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
    }, [user, recognitions]);

    // Top values for this user
    const topValues = useMemo(() => {
        if (!user?.valuesCounts) return [];
        return Object.entries(user.valuesCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([value, count]) => ({
                value: value as CompanyValue,
                count,
                data: COMPANY_VALUES[value as CompanyValue]
            }));
    }, [user]);

    // Badge progress calculation
    const badgeProgress = useMemo(() => {
        if (!user) return [];
        const earnedBadgeTypes = new Set(user.earnedBadges?.map(b => b.badge) || []);

        return Object.entries(BADGES)
            .filter(([key]) => !earnedBadgeTypes.has(key as BadgeType))
            .slice(0, 3)
            .map(([key, badge]) => {
                // Calculate progress based on badge criteria
                let progress = 0;
                let requirement = badge.criteria?.count || 10;

                if (key.includes('TOAST') || key.includes('GRATEFUL')) {
                    progress = user.recognitionsGiven || 0;
                } else if (key.includes('STAR') || key.includes('RECOGNIZED')) {
                    progress = user.recognitionsReceived || 0;
                }

                return {
                    key: key as BadgeType,
                    badge,
                    progress: Math.min(progress, requirement),
                    requirement,
                    percentage: Math.min(100, Math.round((progress / requirement) * 100))
                };
            });
    }, [user]);

    // Format relative time
    const formatTimeAgo = useCallback((dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    }, []);

    if (!isOpen || !user) return null;

    const badgeCount = user.earnedBadges?.length || 0;
    const awardCount = user.earnedAwards?.length || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header with animated gradient */}
                <div className="relative h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm group"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Share button */}
                    <button
                        className="absolute top-4 right-14 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                        title="Share profile"
                    >
                        <Share2 className="w-5 h-5 text-white" />
                    </button>

                    {/* Avatar */}
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center ring-4 ring-white shadow-xl">
                            <span className="text-4xl font-bold text-white">{user.name?.charAt(0) || '?'}</span>
                        </div>
                        {/* Level indicator */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-white shadow-lg">
                            <span className="text-xs font-bold text-white">{Math.floor((user.credits || 0) / 100)}</span>
                        </div>
                    </div>

                    {/* Credits badge */}
                    <div className="absolute bottom-4 right-6 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span className="text-white font-bold">{(user.credits || 0).toLocaleString()}</span>
                            <span className="text-white/60 text-sm">credits</span>
                        </div>
                    </div>
                </div>

                {/* User info */}
                <div className="pt-14 px-6 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500">{user.title} • {user.team}</p>
                </div>

                {/* Animated Stats Grid */}
                <div className="grid grid-cols-4 gap-3 px-6 pb-6">
                    <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100 group hover:scale-105 transition-transform">
                        <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2 group-hover:animate-bounce" />
                        <p className="text-2xl font-bold text-amber-900">{user.recognitionsReceived || 0}</p>
                        <p className="text-xs text-amber-700">Received</p>
                    </div>
                    <div className="text-center p-4 bg-rose-50 rounded-xl border border-rose-100 group hover:scale-105 transition-transform">
                        <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2 group-hover:animate-pulse" />
                        <p className="text-2xl font-bold text-rose-900">{user.recognitionsGiven || 0}</p>
                        <p className="text-xs text-rose-700">Given</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100 group hover:scale-105 transition-transform">
                        <Medal className="w-6 h-6 text-purple-500 mx-auto mb-2 group-hover:rotate-12 transition-transform" />
                        <p className="text-2xl font-bold text-purple-900">{badgeCount}</p>
                        <p className="text-xs text-purple-700">Badges</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 group hover:scale-105 transition-transform">
                        <Award className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:rotate-12 transition-transform" />
                        <p className="text-2xl font-bold text-blue-900">{awardCount}</p>
                        <p className="text-xs text-blue-700">Awards</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pb-4 border-b border-gray-100">
                    {(['overview', 'badges', 'history'] as ProfileTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="p-6 min-h-[300px]">
                    {/* Overview tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Top values */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Top Values Recognized For
                                </h3>
                                {topValues.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {topValues.map(({ value, count, data }) => (
                                            <div
                                                key={value}
                                                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-3xl">{data.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{data.shortName}</p>
                                                    <p className="text-xs text-gray-500">{count} times</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-6">No recognitions yet</p>
                                )}
                            </div>

                            {/* Expert areas with animated bars */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    Expert Areas
                                </h3>
                                {user.expertAreas && user.expertAreas.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.expertAreas.slice(0, 5).map((area, idx) => (
                                            <div key={area.id} className="group">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm text-gray-700">{area.name}</span>
                                                    <span className="text-xs font-medium text-purple-600">{area.score} pts</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${Math.min(100, (area.score / 200) * 100)}%`,
                                                            animationDelay: `${idx * 100}ms`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-6">No expert areas yet</p>
                                )}
                            </div>

                            {/* Badge progress preview */}
                            {badgeProgress.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <Medal className="w-4 h-4 text-amber-500" />
                                            Upcoming Badges
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab('badges')}
                                            className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            View all <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {badgeProgress.map(({ key, badge, percentage }) => (
                                            <div
                                                key={key}
                                                className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors relative overflow-hidden"
                                            >
                                                {/* Progress overlay */}
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500/10 to-transparent transition-all"
                                                    style={{ height: `${percentage}%` }}
                                                />
                                                <span className="text-2xl block mb-1 relative">{badge.icon}</span>
                                                <p className="text-xs font-medium text-gray-700 truncate relative">{badge.name}</p>
                                                <p className="text-xs text-emerald-600 relative">{percentage}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Badges tab */}
                    {activeTab === 'badges' && (
                        <div className="space-y-6">
                            {/* Earned badges */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    Earned Badges ({badgeCount})
                                </h3>
                                {user.earnedBadges && user.earnedBadges.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {user.earnedBadges.map(earned => {
                                            const badge = BADGES[earned.badge];
                                            if (!badge) return null;
                                            return (
                                                <div
                                                    key={earned.badge}
                                                    className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:scale-105 transition-transform group"
                                                >
                                                    <span className="text-3xl block mb-2 group-hover:animate-bounce">{badge.icon}</span>
                                                    <p className="text-sm font-semibold text-gray-900">{badge.name}</p>
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        {new Date(earned.earnedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">No badges earned yet. Keep toasting! 🍞</p>
                                )}
                            </div>

                            {/* Earned awards */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-purple-500" />
                                    Earned Awards ({awardCount})
                                </h3>
                                {user.earnedAwards && user.earnedAwards.length > 0 ? (
                                    <div className="space-y-2">
                                        {user.earnedAwards.map(earned => {
                                            const award = AWARDS[earned.award];
                                            if (!award) return null;
                                            return (
                                                <div
                                                    key={`${earned.award}-${earned.recognitionId}`}
                                                    className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors"
                                                >
                                                    <span className="text-3xl">{award.icon}</span>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{award.name}</p>
                                                        <p className="text-xs text-gray-600">{award.description}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(earned.earnedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">No awards yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* History tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            {/* Received */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Recently Received
                                </h3>
                                {receivedRecognitions.length > 0 ? (
                                    <div className="space-y-2">
                                        {receivedRecognitions.slice(0, 5).map(rec => (
                                            <div
                                                key={rec.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-xl">{COMPANY_VALUES[rec.value]?.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">
                                                        From <span className="font-semibold">{rec.giverName}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{rec.message?.slice(0, 50)}...</p>
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {formatTimeAgo(rec.createdAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No recognitions received yet</p>
                                )}
                            </div>

                            {/* Given */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-rose-500" />
                                    Recently Given
                                </h3>
                                {givenRecognitions.length > 0 ? (
                                    <div className="space-y-2">
                                        {givenRecognitions.slice(0, 5).map(rec => (
                                            <div
                                                key={rec.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-xl">{COMPANY_VALUES[rec.value]?.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">
                                                        To <span className="font-semibold">{rec.recipients?.[0]?.name}</span>
                                                        {(rec.recipients?.length || 0) > 1 && ` +${(rec.recipients?.length || 1) - 1}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{rec.message?.slice(0, 50)}...</p>
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {formatTimeAgo(rec.createdAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No recognitions given yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

ToastXProfile.displayName = 'ToastXProfile';

export default ToastXProfile;
