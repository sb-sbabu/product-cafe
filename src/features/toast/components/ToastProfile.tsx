/**
 * ToastProfile - User profile with recognition stats, badges, and expert scores
 * Modal that displays when clicking a user's name in a recognition card
 */

import React, { useState, useMemo } from 'react';
import {
    X, Award, Trophy, Heart, Star, TrendingUp,
    Gift, Sparkles, Medal
} from 'lucide-react';
import type { CompanyValue } from '../types';
import { useToastStore } from '../toastStore';
import { COMPANY_VALUES, BADGES, AWARDS } from '../data';

interface ToastProfileProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
}

export const ToastProfile: React.FC<ToastProfileProps> = ({ isOpen, onClose, userId }) => {
    const { users, recognitions, getCurrentUser } = useToastStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

    // Get user data
    const user = useMemo(() => {
        if (!userId) return getCurrentUser();
        return users.get(userId) || getCurrentUser();
    }, [userId, users, getCurrentUser]);

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
        if (!user) return [];
        return Object.entries(user.valuesCounts || {})
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([value, count]) => ({
                value: value as CompanyValue,
                count,
                data: COMPANY_VALUES[value as CompanyValue]
            }));
    }, [user]);

    if (!isOpen || !user) return null;

    const badgeCount = user.earnedBadges?.length || 0;
    const awardCount = user.earnedAwards?.length || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Header with gradient */}
                <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-500">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Avatar */}
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center ring-4 ring-white shadow-lg">
                            <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
                        </div>
                    </div>

                    {/* Credits badge */}
                    <div className="absolute bottom-4 right-6 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-white font-semibold">{user.credits.toLocaleString()} credits</span>
                    </div>
                </div>

                {/* User info */}
                <div className="pt-14 px-6 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500">{user.title} • {user.team}</p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-3 px-6 pb-6">
                    <div className="text-center p-3 bg-amber-50 rounded-xl">
                        <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{user.recognitionsReceived}</p>
                        <p className="text-xs text-gray-500">Received</p>
                    </div>
                    <div className="text-center p-3 bg-rose-50 rounded-xl">
                        <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{user.recognitionsGiven}</p>
                        <p className="text-xs text-gray-500">Given</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <Medal className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{badgeCount}</p>
                        <p className="text-xs text-gray-500">Badges</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{awardCount}</p>
                        <p className="text-xs text-gray-500">Awards</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pb-4 border-b border-gray-100">
                    {(['overview', 'badges', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="p-6">
                    {/* Overview tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Top values */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Top Values
                                </h3>
                                {topValues.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {topValues.map(({ value, count, data }) => (
                                            <div
                                                key={value}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                                            >
                                                <span className="text-2xl">{data.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{data.shortName}</p>
                                                    <p className="text-xs text-gray-500">{count} times</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No recognitions yet</p>
                                )}
                            </div>

                            {/* Expert areas */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    Expert Areas
                                </h3>
                                {user.expertAreas && user.expertAreas.length > 0 ? (
                                    <div className="space-y-2">
                                        {user.expertAreas.slice(0, 5).map(area => (
                                            <div key={area.id} className="flex items-center gap-3">
                                                <span className="text-sm text-gray-700 w-32 truncate">{area.name}</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (area.score / 100) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-12 text-right">{area.score} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No expert areas yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Badges tab */}
                    {activeTab === 'badges' && (
                        <div className="space-y-6">
                            {/* Earned badges */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Earned Badges</h3>
                                {user.earnedBadges && user.earnedBadges.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {user.earnedBadges.map(earned => {
                                            const badge = BADGES[earned.badge];
                                            if (!badge) return null;
                                            return (
                                                <div
                                                    key={earned.badge}
                                                    className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100"
                                                >
                                                    <span className="text-3xl block mb-2">{badge.icon}</span>
                                                    <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(earned.earnedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">No badges earned yet. Keep toasting!</p>
                                )}
                            </div>

                            {/* Earned awards */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Earned Awards</h3>
                                {user.earnedAwards && user.earnedAwards.length > 0 ? (
                                    <div className="space-y-2">
                                        {user.earnedAwards.map(earned => {
                                            const award = AWARDS[earned.award];
                                            if (!award) return null;
                                            return (
                                                <div
                                                    key={`${earned.award}-${earned.recognitionId}`}
                                                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl"
                                                >
                                                    <span className="text-2xl">{award.icon}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{award.name}</p>
                                                        <p className="text-xs text-gray-500">{award.description}</p>
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
                                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    Recently Received
                                </h3>
                                {receivedRecognitions.length > 0 ? (
                                    <div className="space-y-2">
                                        {receivedRecognitions.slice(0, 5).map(rec => (
                                            <div
                                                key={rec.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <span className="text-xl">{COMPANY_VALUES[rec.value].icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-700 truncate">
                                                        From <span className="font-medium">{rec.giverName}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{rec.message.slice(0, 50)}...</p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(rec.createdAt).toLocaleDateString()}
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
                                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-rose-500" />
                                    Recently Given
                                </h3>
                                {givenRecognitions.length > 0 ? (
                                    <div className="space-y-2">
                                        {givenRecognitions.slice(0, 5).map(rec => (
                                            <div
                                                key={rec.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <span className="text-xl">{COMPANY_VALUES[rec.value].icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-700 truncate">
                                                        To <span className="font-medium">{rec.recipients[0]?.name}</span>
                                                        {rec.recipients.length > 1 && ` +${rec.recipients.length - 1}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{rec.message.slice(0, 50)}...</p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(rec.createdAt).toLocaleDateString()}
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
};

export default ToastProfile;
