/**
 * ToastAnalytics - Analytics Dashboard for TOAST Recognition
 * Shows trends, value distribution, and recognition metrics
 */

import React, { useMemo } from 'react';
import {
    TrendingUp, PieChart, Users, Award, Calendar,
    ArrowUpRight, Minus
} from 'lucide-react';
import { useToastStore } from '../toastStore';
import { COMPANY_VALUES } from '../data';
import type { CompanyValue } from '../types';

export const ToastAnalytics: React.FC = () => {
    const { recognitions, users, getStats, getLeaderboard } = useToastStore();
    const stats = getStats();
    const topReceivers = getLeaderboard('MOST_RECOGNIZED', 'THIS_MONTH', 5);
    const topGivers = getLeaderboard('MOST_GENEROUS', 'THIS_MONTH', 5);

    // Calculate recognition trends (last 7 days)
    const dailyTrends = useMemo(() => {
        const now = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = Array.from(recognitions.values()).filter(r =>
                r.createdAt.startsWith(dateStr)
            ).length;
            days.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count
            });
        }
        return days;
    }, [recognitions]);

    const maxDailyCount = Math.max(...dailyTrends.map(d => d.count), 1);

    // Value distribution
    const valueDistribution = useMemo(() => {
        const total = Object.values(stats.byValue).reduce((a, b) => a + b, 0) || 1;
        return Object.entries(stats.byValue)
            .map(([value, count]) => ({
                value: value as CompanyValue,
                count,
                percentage: Math.round((count / total) * 100),
                data: COMPANY_VALUES[value as CompanyValue]
            }))
            .sort((a, b) => b.count - a.count);
    }, [stats.byValue]);

    // Overall metrics
    const totalRecognitions = Array.from(recognitions.values()).length;
    const activeUsers = users.size;
    const avgRecognitionsPerUser = activeUsers > 0 ? Math.round(totalRecognitions / activeUsers * 10) / 10 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recognition Analytics</h2>
                    <p className="text-gray-500">Insights into your team's recognition culture</p>
                </div>
                <select className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>All time</option>
                </select>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-amber-100">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="flex items-center gap-1 text-sm text-green-600">
                            <ArrowUpRight className="w-4 h-4" />
                            12%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{totalRecognitions}</p>
                    <p className="text-sm text-gray-500">Total Recognitions</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-blue-100">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="flex items-center gap-1 text-sm text-green-600">
                            <ArrowUpRight className="w-4 h-4" />
                            8%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{activeUsers}</p>
                    <p className="text-sm text-gray-500">Active Users</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-purple-100">
                            <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Minus className="w-4 h-4" />
                            0%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{avgRecognitionsPerUser}</p>
                    <p className="text-sm text-gray-500">Avg per User</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-emerald-100">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="flex items-center gap-1 text-sm text-green-600">
                            <ArrowUpRight className="w-4 h-4" />
                            5%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{stats.thisMonth}</p>
                    <p className="text-sm text-gray-500">This Month</p>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily trends chart */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Daily Recognition Trend
                    </h3>
                    <div className="flex items-end justify-between gap-4 h-40">
                        {dailyTrends.map(day => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-400 to-cyan-400 rounded-t-lg transition-all"
                                    style={{
                                        height: `${(day.count / maxDailyCount) * 100}%`,
                                        minHeight: day.count > 0 ? '8px' : '2px'
                                    }}
                                />
                                <span className="text-xs text-gray-500">{day.day}</span>
                                <span className="text-xs font-medium text-gray-900">{day.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Value distribution */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        Value Distribution
                    </h3>
                    <div className="space-y-3">
                        {valueDistribution.slice(0, 6).map(({ value, count, percentage, data }) => (
                            <div key={value} className="flex items-center gap-3">
                                <span className="text-xl w-8">{data.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{data.shortName}</span>
                                        <span className="text-xs text-gray-500">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${percentage}%`,
                                                background: `linear-gradient(to right, ${data.color}, ${data.color}aa)`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top receivers */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Most Recognized
                    </h3>
                    <div className="space-y-3">
                        {topReceivers.length > 0 ? topReceivers.map((entry, i) => (
                            <div key={entry.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-400 text-white' :
                                    i === 1 ? 'bg-gray-300 text-gray-700' :
                                        i === 2 ? 'bg-amber-600 text-white' :
                                            'bg-gray-200 text-gray-600'
                                    }`}>
                                    {entry.rank}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{entry.userName.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{entry.userName}</p>
                                    <p className="text-xs text-gray-500">{entry.userTeam}</p>
                                </div>
                                <span className="text-sm font-bold text-amber-600">{entry.score}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Top givers */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-rose-500" />
                        Most Generous
                    </h3>
                    <div className="space-y-3">
                        {topGivers.length > 0 ? topGivers.map((entry, i) => (
                            <div key={entry.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-rose-400 text-white' :
                                    i === 1 ? 'bg-gray-300 text-gray-700' :
                                        i === 2 ? 'bg-rose-600 text-white' :
                                            'bg-gray-200 text-gray-600'
                                    }`}>
                                    {entry.rank}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{entry.userName.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{entry.userName}</p>
                                    <p className="text-xs text-gray-500">{entry.userTeam}</p>
                                </div>
                                <span className="text-sm font-bold text-rose-600">{entry.score}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToastAnalytics;
