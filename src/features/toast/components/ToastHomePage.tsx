/**
 * ToastHomePage - Main TOAST Recognition Hub
 * Hero, Quick Actions, Feed, Leaderboard, Stats
 */

import React, { useState, useMemo } from 'react';
import {
    Coffee, Award, Users, Sparkles,
    ChevronRight, Trophy, Medal, Gift, Heart, Zap, Target
} from 'lucide-react';
import { useToastStore } from '../toastStore';
import { ToastFeed } from './ToastFeed';
import { QuickToastModal } from './QuickToastModal';
import { StandingOvationWizard } from './StandingOvationWizard';
import { TeamToastModal } from './TeamToastModal';
import { COMPANY_VALUES, BADGES } from '../data';

export const ToastHomePage: React.FC = () => {
    const {
        getCurrentUser,
        getLeaderboard,
        getStats,
        checkDailyLimits
    } = useToastStore();

    const currentUser = getCurrentUser();
    const stats = getStats();
    const leaderboard = getLeaderboard('MOST_RECOGNIZED', 'THIS_MONTH', 5);
    const quickToastLimit = checkDailyLimits('QUICK_TOAST');
    const standingOvationLimit = checkDailyLimits('STANDING_OVATION');

    // Modal states
    const [showQuickToast, setShowQuickToast] = useState(false);
    const [showStandingOvation, setShowStandingOvation] = useState(false);
    const [showTeamToast, setShowTeamToast] = useState(false);

    // Top values this month
    const topValues = useMemo(() => {
        return Object.entries(stats.byValue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([value, count]) => ({
                value: value as keyof typeof COMPANY_VALUES,
                count,
                data: COMPANY_VALUES[value as keyof typeof COMPANY_VALUES],
            }));
    }, [stats.byValue]);

    return (
        <div className="max-w-7xl mx-auto py-8 lg:py-10 space-y-8 animate-fade-in">
            <div className="space-y-8">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 border border-amber-500/20 p-8">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl" />

                    <div className="relative flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Café <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">TOAST</span>
                                    </h1>
                                    <p className="text-gray-500 text-sm">To Outstanding Achievements, Spirit & Teamwork</p>
                                </div>
                            </div>

                            <p className="text-gray-600 max-w-md">
                                Celebrate the moments that matter. Recognize colleagues who embody our values and make Availity exceptional.
                            </p>

                            {/* Quick stats */}
                            <div className="flex items-center gap-6 pt-2">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">{stats.thisMonth}</div>
                                    <div className="text-xs text-gray-500">This Month</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-500">{currentUser?.recognitionsGiven || 0}</div>
                                    <div className="text-xs text-gray-500">You Gave</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-rose-500">{currentUser?.recognitionsReceived || 0}</div>
                                    <div className="text-xs text-gray-500">You Received</div>
                                </div>
                            </div>
                        </div>

                        {/* User badge area */}
                        {currentUser && (
                            <div className="hidden lg:block text-right space-y-2">
                                <div className="flex items-center justify-end gap-3">
                                    <div className="text-right">
                                        <p className="text-gray-900 font-semibold">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500">{currentUser.credits} credits</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center ring-4 ring-purple-100">
                                        <span className="text-2xl font-bold text-white">{currentUser.name.charAt(0)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    {currentUser.earnedBadges.slice(0, 5).map((badge) => (
                                        <div
                                            key={badge.badge}
                                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                                            title={BADGES[badge.badge].name}
                                        >
                                            <span className="text-sm">{BADGES[badge.badge].icon}</span>
                                        </div>
                                    ))}
                                    {currentUser.earnedBadges.length > 5 && (
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                            +{currentUser.earnedBadges.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Quick Toast */}
                    <button
                        onClick={() => setShowQuickToast(true)}
                        disabled={!quickToastLimit.allowed}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Coffee className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Toast</h3>
                                <p className="text-sm text-gray-500 mb-2">Fast thanks for everyday wins</p>
                                <div className="flex items-center gap-2 text-xs text-amber-600">
                                    <span>+5 credits</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500">{quickToastLimit.remaining} left today</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => setShowStandingOvation(true)}
                        disabled={!standingOvationLimit.allowed}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Standing Ovation</h3>
                                <p className="text-sm text-gray-500 mb-2">Celebrate big achievements</p>
                                <div className="flex items-center gap-2 text-xs text-purple-600">
                                    <span>+25 credits</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500">{standingOvationLimit.remaining} left today</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                    </button>

                    {/* Team Toast */}
                    <button
                        onClick={() => setShowTeamToast(true)}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Toast</h3>
                                <p className="text-sm text-gray-500 mb-2">Celebrate your whole team</p>
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                    <span>+15 each</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500">Up to 10 people</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Feed (2 columns) */}
                    <div className="lg:col-span-2">
                        <ToastFeed onCreateToast={() => setShowQuickToast(true)} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Leaderboard */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Top Recognized
                                </h3>
                                <span className="text-xs text-gray-400">This Month</span>
                            </div>

                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                                                index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{entry.userName}</p>
                                            <p className="text-xs text-gray-500">{entry.userTeam}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-amber-600">{entry.score}</p>
                                            <p className="text-xs text-gray-400">toasts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-2 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                View Full Leaderboard
                            </button>
                        </div>

                        {/* Top Values */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                Trending Values
                            </h3>

                            <div className="space-y-3">
                                {topValues.map(({ value, count, data }) => (
                                    <div
                                        key={value}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                                    >
                                        <span className="text-2xl">{data.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{data.shortName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold" style={{ color: data.color }}>{count}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Your Stats */}
                        {currentUser && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                    Your Stats
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-amber-50 text-center">
                                        <Gift className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.recognitionsGiven}</p>
                                        <p className="text-xs text-gray-500">Given</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-rose-50 text-center">
                                        <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.recognitionsReceived}</p>
                                        <p className="text-xs text-gray-500">Received</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-yellow-50 text-center">
                                        <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.credits}</p>
                                        <p className="text-xs text-gray-500">Credits</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-50 text-center">
                                        <Medal className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-gray-900">{currentUser.earnedBadges.length}</p>
                                        <p className="text-xs text-gray-500">Badges</p>
                                    </div>
                                </div>

                                {/* Expert areas preview */}
                                {currentUser.expertAreas.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">Top Expert Areas</p>
                                        <div className="flex flex-wrap gap-1">
                                            {currentUser.expertAreas.slice(0, 3).map(area => (
                                                <div
                                                    key={area.id}
                                                    className="px-2 py-1 rounded-full bg-emerald-100 border border-emerald-200"
                                                >
                                                    <span className="text-xs text-emerald-700">{area.name}</span>
                                                    <span className="text-xs text-emerald-600 ml-1">+{area.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <QuickToastModal
                isOpen={showQuickToast}
                onClose={() => setShowQuickToast(false)}
            />
            <StandingOvationWizard
                isOpen={showStandingOvation}
                onClose={() => setShowStandingOvation(false)}
            />
            <TeamToastModal
                isOpen={showTeamToast}
                onClose={() => setShowTeamToast(false)}
            />
        </div>
    );
};

export default ToastHomePage;
