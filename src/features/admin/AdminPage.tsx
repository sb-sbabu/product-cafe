/**
 * AdminPage - Admin panel for managing gamification
 * 
 * Features:
 * - Points management (award/remove)
 * - Badge management (manual awards)
 * - Quick stats overview
 */

import React from 'react';
import { Shield, Award, TrendingUp, Users, Gift } from 'lucide-react';
import { AdminPointsPanel, AdminBadgePanel } from '../../components/admin';
import { useBadgeStore } from '../../stores/badgeStore';
import { usePointsStore } from '../../stores/pointsStore';

export const AdminPage: React.FC = () => {
    const { totalPoints } = usePointsStore();
    const { earnedBadges } = useBadgeStore();

    const handleAwardPoints = (userId: string, points: number, reason: string) => {
        console.log(`Awarding ${points} points to ${userId}: ${reason}`);
        // In real app, would call API
        alert(`✅ Awarded ${points} Café Credits to user!\nReason: ${reason}`);
    };

    const handleRemovePoints = (userId: string, points: number, reason: string) => {
        console.log(`Removing ${points} points from ${userId}: ${reason}`);
        // In real app, would call API
        alert(`⚠️ Removed ${points} Café Credits from user!\nReason: ${reason}`);
    };

    const handleAwardBadge = (userId: string, badgeId: string) => {
        console.log(`Awarding badge ${badgeId} to ${userId}`);
        // In real app, would call API
        alert(`🏅 Awarded badge "${badgeId}" to user!`);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <section>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <p className="text-gray-600">
                    Manage Café Credits, badges, and user recognition.
                </p>
            </section>

            {/* Quick Stats */}
            <section>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Total Points</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Award className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{earnedBadges.length}</p>
                                <p className="text-sm text-gray-500">Badges Earned</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">24</p>
                                <p className="text-sm text-gray-500">Active Users</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Gift className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">156</p>
                                <p className="text-sm text-gray-500">Points Awarded Today</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Management Panels */}
            <section className="grid grid-cols-2 gap-6">
                <AdminPointsPanel
                    onAwardPoints={handleAwardPoints}
                    onRemovePoints={handleRemovePoints}
                />
                <AdminBadgePanel
                    onAwardBadge={handleAwardBadge}
                />
            </section>

            {/* Recent Activity */}
            <section>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Gift className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">
                                    Awarded <span className="font-medium">50 points</span> to Sarah Chen
                                </p>
                                <p className="text-xs text-gray-400">2 hours ago • Quality discussion contribution</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Award className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">
                                    Awarded <span className="font-medium">Mentor Badge</span> to Mike Rivera
                                </p>
                                <p className="text-xs text-gray-400">Yesterday • Exceptional onboarding help</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Gift className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">
                                    Awarded <span className="font-medium">100 points</span> to Alex Kumar
                                </p>
                                <p className="text-xs text-gray-400">2 days ago • Bug report contribution</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminPage;
