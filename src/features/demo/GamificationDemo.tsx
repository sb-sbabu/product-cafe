/**
 * GamificationDemo - Showcase page for all gamification components
 * 
 * Temporary demo page, will be removed after review.
 */

import React, { useState } from 'react';
import {
    LevelBadge,
    LevelProgress,
    PointsDisplay,
    BadgeIcon,
    BadgeCard,
    BadgeStrip,
    PointToast,
    LevelUpCelebration,
    BadgeUnlockModal,
    LeaderboardWidget,
} from '../../components/gamification';
import { LEVELS, MILESTONE_BADGES, DOMAIN_BADGES, type BadgeDefinition } from '../../types/gamification';
import { useLeaderboardStore } from '../../stores/leaderboardStore';
import { usePointsStore } from '../../stores/pointsStore';

export const GamificationDemo: React.FC = () => {
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
    const [showPointToast, setShowPointToast] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition>(MILESTONE_BADGES[0]);

    const leaderboardStore = useLeaderboardStore();
    const entries = leaderboardStore.allTimeBoard?.entries || [];

    // Mock data
    const currentLevel = LEVELS[3]; // Expert
    const currentPoints = 2450;
    const earnedBadges = MILESTONE_BADGES.slice(0, 4);

    // Fetch leaderboard on mount
    React.useEffect(() => {
        leaderboardStore.fetchAllTimeBoard();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        ☕ Café Credits — Gamification Demo
                    </h1>
                    <p className="text-gray-600">
                        Showcase of all gamification UI components
                    </p>
                </div>

                {/* Level Components */}
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Level System</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Level Badges - All Variants */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Level Badges (all variants)</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 w-16">Inline:</span>
                                    <div className="flex gap-2">
                                        {LEVELS.map(level => (
                                            <LevelBadge key={level.id} level={level} variant="inline" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 w-16">Profile:</span>
                                    <LevelBadge level={currentLevel} variant="profile" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 w-16">Card:</span>
                                    <LevelBadge level={currentLevel} variant="card" className="max-w-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Level Progress */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Level Progress</h3>
                            <div className="space-y-4">
                                <LevelProgress currentPoints={currentPoints} currentLevel={currentLevel} />
                                <LevelProgress currentPoints={120} currentLevel={LEVELS[1]} size="sm" />
                                <LevelProgress currentPoints={16000} currentLevel={LEVELS[5]} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Points Display */}
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Points Display</h2>

                    <div className="flex flex-wrap items-center gap-8">
                        <div className="space-y-2">
                            <span className="text-xs text-gray-400 block">Inline:</span>
                            <PointsDisplay points={2450} variant="inline" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs text-gray-400 block">Badge:</span>
                            <PointsDisplay points={12500} variant="badge" showLabel />
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs text-gray-400 block">Large:</span>
                            <PointsDisplay points={18450} variant="large" showLabel />
                        </div>
                    </div>
                </section>

                {/* Badge Components */}
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badge System</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Badge Icons */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Badge Icons (sizes & tiers)</h3>
                            <div className="flex flex-wrap gap-4">
                                {MILESTONE_BADGES.slice(0, 3).map((badge, i) => (
                                    <BadgeIcon key={badge.id} badge={badge} size={(['sm', 'md', 'lg'] as const)[i]} />
                                ))}
                                <BadgeIcon badge={MILESTONE_BADGES[0]} earned={false} />
                            </div>
                        </div>

                        {/* Badge Strip */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Badge Strip (compact display)</h3>
                            <BadgeStrip badges={earnedBadges} maxVisible={3} />
                        </div>
                    </div>

                    {/* Badge Cards */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Badge Cards</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {MILESTONE_BADGES.slice(0, 4).map((badge, i) => (
                                <BadgeCard
                                    key={badge.id}
                                    badge={badge}
                                    earned={i < 2}
                                    progress={i >= 2 ? { badgeId: badge.id, currentValue: 3, targetValue: 10, percentComplete: 30 } : undefined}
                                    onClick={() => {
                                        setSelectedBadge(badge);
                                        setShowBadgeUnlock(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Leaderboard */}
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Leaderboard</h2>

                    <div className="max-w-md">
                        <LeaderboardWidget
                            entries={entries}
                            title="Top Contributors"
                            userRank={15}
                            onViewFull={() => alert('View full leaderboard')}
                        />
                    </div>
                </section>

                {/* Celebrations & Toasts */}
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Celebrations & Feedback</h2>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowPointToast(true)}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            🎉 Show Point Toast
                        </button>

                        <button
                            onClick={() => setShowBadgeUnlock(true)}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            🏆 Show Badge Unlock
                        </button>

                        <button
                            onClick={() => setShowLevelUp(true)}
                            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            ⬆️ Show Level Up (UI)
                        </button>

                        <button
                            onClick={() => usePointsStore.getState().awardPoints('speak_at_lop')}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            💰 Gain 500 Points (Real)
                        </button>
                    </div>
                </section>

                {/* Domain Badges Showcase */}
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Domain Expertise Badges</h2>

                    <div className="flex flex-wrap gap-3">
                        {DOMAIN_BADGES.map(badge => (
                            <div
                                key={badge.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <span className="text-xl">{badge.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Modals */}
            {showPointToast && (
                <PointToast
                    action="answer_accepted"
                    points={50}
                    onClose={() => setShowPointToast(false)}
                />
            )}

            {showBadgeUnlock && (
                <BadgeUnlockModal
                    badge={selectedBadge}
                    onClose={() => setShowBadgeUnlock(false)}
                />
            )}

            {showLevelUp && (
                <LevelUpCelebration
                    oldLevel={LEVELS[2]}
                    newLevel={LEVELS[3]}
                    onClose={() => setShowLevelUp(false)}
                />
            )}
        </div>
    );
};
