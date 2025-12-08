import React from 'react';
import {
    TrendingUp,
    Clock,
    Flame,
    Eye,
    Users,
    Calendar,
    Play,
    Target,
    Zap,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';

// ═══════════════════════════════════════════════════════════════════════════
// ENGAGEMENT DASHBOARD — Personal & community stats
// Premium visualization with animated stats
// ═══════════════════════════════════════════════════════════════════════════

interface EngagementDashboardProps {
    stats: {
        sessionsWatched: number;
        totalWatchTime: number; // hours
        currentStreak: number; // days
        completionRate: number; // percentage
    };
    communityStats?: {
        totalViews: number;
        activeMembers: number;
        thisWeekSessions: number;
    };
    weeklyActivity?: number[]; // 7 days of activity (0-10 scale)
    className?: string;
}

export const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
    stats,
    communityStats,
    weeklyActivity = [3, 5, 2, 8, 4, 6, 9],
    className,
}) => {
    const maxActivity = Math.max(...weeklyActivity, 1);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Personal Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sessions Watched */}
                <Card className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Sessions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sessionsWatched}</p>
                            <p className="text-sm text-gray-500 mt-0.5">watched</p>
                        </div>
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <Play className="w-5 h-5 text-rose-600" />
                        </div>
                    </div>
                </Card>

                {/* Watch Time */}
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Watch Time</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalWatchTime.toFixed(1)}</p>
                            <p className="text-sm text-gray-500 mt-0.5">hours</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </Card>

                {/* Current Streak */}
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Streak</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <p className="text-3xl font-bold text-gray-900">{stats.currentStreak}</p>
                                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">days</p>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                </Card>

                {/* Completion Rate */}
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completion</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completionRate}%</p>
                            <p className="text-sm text-gray-500 mt-0.5">of started</p>
                        </div>
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Target className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Weekly Activity Chart */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                        Weekly Activity
                    </h3>
                    <span className="text-sm text-gray-400">Last 7 days</span>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-32">
                    {weeklyActivity.map((value, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-full max-w-[40px] rounded-t-lg transition-all duration-500",
                                        idx === 6
                                            ? "bg-gradient-to-t from-rose-500 to-pink-400 shadow-lg shadow-rose-500/30"
                                            : "bg-gradient-to-t from-gray-200 to-gray-100"
                                    )}
                                    style={{
                                        height: `${(value / maxActivity) * 100}%`,
                                        minHeight: value > 0 ? '8px' : '0',
                                        animationDelay: `${idx * 50}ms`,
                                    }}
                                />
                            </div>
                            <span className={cn(
                                "text-xs",
                                idx === 6 ? "text-rose-600 font-medium" : "text-gray-400"
                            )}>
                                {dayLabels[idx]}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Community Stats */}
            {communityStats && (
                <Card className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-purple-500" />
                        Community Pulse
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Eye className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {(communityStats.totalViews / 1000).toFixed(1)}k
                            </p>
                            <p className="text-xs text-gray-500">Total Views</p>
                        </div>
                        <div className="text-center border-x border-purple-100">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {communityStats.activeMembers}
                            </p>
                            <p className="text-xs text-gray-500">Active Members</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {communityStats.thisWeekSessions}
                            </p>
                            <p className="text-xs text-gray-500">This Week</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default EngagementDashboard;
