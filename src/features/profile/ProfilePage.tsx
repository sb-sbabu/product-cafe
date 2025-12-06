/**
 * ProfilePage - User profile with gamification stats
 */

import React from 'react';
import { Award, MessageSquare, CheckCircle, TrendingUp, Heart } from 'lucide-react';
import { usePointsStore } from '../../stores/pointsStore';
import { useLevelStore } from '../../stores/levelStore';
import { useBadgeStore } from '../../stores/badgeStore';
import { useDiscussionStore } from '../../stores/discussionStore';
import { LevelBadge, LevelProgress, PointsDisplay } from '../../components/gamification';
import { Card } from '../../components/ui/Card';
import { ALL_BADGES } from '../../types/gamification';

export const ProfilePage: React.FC = () => {
    const { totalPoints, getHistory } = usePointsStore();
    const { currentLevel, getLevelProgress } = useLevelStore();
    const { earnedBadges } = useBadgeStore();
    const { discussions, replies } = useDiscussionStore();

    // Mock user - in real app from auth context
    const user = {
        id: 'current-user',
        displayName: 'Product Pro',
        title: 'Senior Product Manager',
        team: 'Growth Team',
    };

    // Calculate stats
    const myDiscussions = discussions.filter(d => d.authorId === user.id).length;
    const myReplies = replies.filter(r => r.authorId === user.id).length;
    const acceptedAnswers = replies.filter(r => r.authorId === user.id && r.isAcceptedAnswer).length;

    // Get level progress
    const levelProgress = getLevelProgress();

    // Get recent transactions
    const recentTransactions = getHistory(5);

    // Map earned badge IDs to badge definitions
    const earnedBadgeDefinitions = earnedBadges.map(eb =>
        ALL_BADGES.find(b => b.id === eb.badgeId)
    ).filter(Boolean);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <section>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">👤</span>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                </div>
                <p className="text-gray-600">
                    Your gamification stats, badges, and contribution history.
                </p>
            </section>

            {/* Profile Card */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cafe-400 to-cafe-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user.displayName.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{user.displayName}</h2>
                            {currentLevel && <LevelBadge level={currentLevel} />}
                        </div>
                        <p className="text-gray-600">{user.title}</p>
                        <p className="text-sm text-gray-500">{user.team}</p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                        <PointsDisplay points={totalPoints} showLabel />
                        {currentLevel && (
                            <div className="mt-2">
                                <LevelProgress
                                    currentPoints={levelProgress.current}
                                    currentLevel={currentLevel}
                                    showLabels
                                    size="sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Café Credits</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{earnedBadges.length}</p>
                            <p className="text-sm text-gray-500">Badges Earned</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{myDiscussions + myReplies}</p>
                            <p className="text-sm text-gray-500">Contributions</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{acceptedAnswers}</p>
                            <p className="text-sm text-gray-500">Accepted Answers</p>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Badges Section */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Earned Badges
                </h3>
                {earnedBadgeDefinitions.length > 0 ? (
                    <div className="grid grid-cols-6 gap-4">
                        {earnedBadgeDefinitions.map((badge) => badge && (
                            <div
                                key={badge.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl mb-2">{badge.icon}</div>
                                <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                                <p className="text-xs text-gray-500">{badge.category}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="p-8 text-center">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No badges earned yet. Keep contributing!</p>
                    </Card>
                )}
            </section>

            {/* Recent Activity */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Recent Point Activity
                </h3>
                <Card className="divide-y divide-gray-100">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{tx.action}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(tx.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`font-bold ${tx.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {tx.points >= 0 ? '+' : ''}{tx.points}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No point activity yet. Start contributing!</p>
                        </div>
                    )}
                </Card>
            </section>
        </div>
    );
};

export default ProfilePage;
