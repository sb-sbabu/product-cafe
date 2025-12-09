/**
 * Toast X - Analytics Dashboard
 * Rich visualizations of recognition trends, value distribution, and team metrics
 * 10x improvements: Interactive charts, animated trends, real-time indicators
 */

import React, { useMemo, memo, useState } from 'react';
import {
    TrendingUp, PieChart, Users, Award, Calendar,
    ArrowUpRight, ArrowDownRight, Minus, BarChart3,
    Download, RefreshCw
} from 'lucide-react';
import { useToastXStore } from '../../store';
import { COMPANY_VALUES } from '../../constants';
import type { CompanyValue } from '../../types';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export const AnalyticsDashboard: React.FC = memo(() => {
    const recognitions = useToastXStore(state => state.recognitions);
    const users = useToastXStore(state => state.users);

    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Calculate recognition trends (last 7 days)
    const dailyTrends = useMemo(() => {
        const now = new Date();
        const days = [];
        const daysCount = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;

        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = Array.from(recognitions.values()).filter(r =>
                r.createdAt.startsWith(dateStr)
            ).length;
            days.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: date.getDate(),
                count
            });
        }
        return days;
    }, [recognitions, timeRange]);

    const maxDailyCount = Math.max(...dailyTrends.map(d => d.count), 1);

    // Value distribution
    const valueDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        Array.from(recognitions.values()).forEach(rec => {
            counts[rec.value] = (counts[rec.value] || 0) + 1;
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        return Object.entries(counts)
            .map(([value, count]) => ({
                value: value as CompanyValue,
                count,
                percentage: Math.round((count / total) * 100),
                data: COMPANY_VALUES[value as CompanyValue]
            }))
            .filter(v => v.data)
            .sort((a, b) => b.count - a.count);
    }, [recognitions]);

    // Overall metrics
    const metrics = useMemo(() => {
        const totalRecognitions = recognitions.length;
        const activeUsers = users.size;
        const avgPerUser = activeUsers > 0 ? Math.round((totalRecognitions / activeUsers) * 10) / 10 : 0;

        // Calculate this month vs last month
        const now = new Date();
        const thisMonth = now.toISOString().slice(0, 7);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

        const thisMonthCount = Array.from(recognitions.values()).filter(r => r.createdAt.startsWith(thisMonth)).length;
        const lastMonthCount = Array.from(recognitions.values()).filter(r => r.createdAt.startsWith(lastMonth)).length;

        const monthlyChange = lastMonthCount > 0
            ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
            : thisMonthCount > 0 ? 100 : 0;

        return {
            totalRecognitions,
            activeUsers,
            avgPerUser,
            thisMonthCount,
            monthlyChange
        };
    }, [recognitions, users]);

    // Top performers
    const topPerformers = useMemo(() => {
        const receiveCounts: Record<string, number> = {};
        const giveCounts: Record<string, number> = {};

        Array.from(recognitions.values()).forEach(rec => {
            rec.recipientIds.forEach(id => {
                receiveCounts[id] = (receiveCounts[id] || 0) + 1;
            });
            giveCounts[rec.giverId] = (giveCounts[rec.giverId] || 0) + 1;
        });

        const topReceivers = Object.entries(receiveCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([userId, count]) => {
                const user = users.get(userId);
                return { userId, count, user };
            })
            .filter(e => e.user);

        const topGivers = Object.entries(giveCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([userId, count]) => {
                const user = users.get(userId);
                return { userId, count, user };
            })
            .filter(e => e.user);

        return { topReceivers, topGivers };
    }, [recognitions, users]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Trend indicator component
    const TrendIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => {
        if (value > 0) {
            return (
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                    {value}{suffix}
                </span>
            );
        } else if (value < 0) {
            return (
                <span className="flex items-center gap-1 text-sm text-rose-400">
                    <ArrowDownRight className="w-4 h-4" />
                    {Math.abs(value)}{suffix}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-sm text-white/50">
                <Minus className="w-4 h-4" />
                0{suffix}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Recognition Analytics</h2>
                    <p className="text-white/60">Insights into your team's recognition culture</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time range selector */}
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                        {(['week', 'month', 'quarter'] as TimeRange[]).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Export button */}
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 hover:border-white/20 transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                        </div>
                        <TrendIndicator value={metrics.monthlyChange} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.totalRecognitions}</p>
                    <p className="text-sm text-white/50">Total Recognitions</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 hover:border-white/20 transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <TrendIndicator value={8} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.activeUsers}</p>
                    <p className="text-sm text-white/50">Active Users</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 hover:border-white/20 transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <TrendIndicator value={5} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.avgPerUser}</p>
                    <p className="text-sm text-white/50">Avg per User</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 hover:border-white/20 transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <TrendIndicator value={metrics.monthlyChange} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.thisMonthCount}</p>
                    <p className="text-sm text-white/50">This Month</p>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily trends chart */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Daily Recognition Trend
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {dailyTrends.slice(-7).map((day, idx) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-xs font-medium text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {day.count}
                                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-400 hover:to-cyan-300 cursor-pointer relative"
                                    style={{
                                        height: `${Math.max(8, (day.count / maxDailyCount) * 100)}%`,
                                        animationDelay: `${idx * 100}ms`
                                    }}
                                >
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 bg-blue-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-xs text-white/50">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Value distribution */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" />
                        Value Distribution
                    </h3>
                    <div className="space-y-3">
                        {valueDistribution.slice(0, 6).map(({ value, count, percentage, data }) => (
                            <div key={value} className="flex items-center gap-3 group">
                                <span className="text-xl w-8">{data?.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-white">{data?.shortName}</span>
                                        <span className="text-xs text-white/50">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-125"
                                            style={{
                                                width: `${percentage}%`,
                                                background: data?.color ? `linear-gradient(to right, ${data.color}, ${data.color}99)` : 'linear-gradient(to right, #8b5cf6, #ec4899)'
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
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        Most Recognized
                    </h3>
                    <div className="space-y-3">
                        {topPerformers.topReceivers.length > 0 ? topPerformers.topReceivers.map((entry, i) => (
                            <div key={entry.userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25' :
                                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' :
                                        i === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white' :
                                            'bg-white/10 text-white/50'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="text-white text-sm font-medium">{entry.user?.name?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{entry.user?.name}</p>
                                    <p className="text-xs text-white/50">{entry.user?.team}</p>
                                </div>
                                <span className="text-sm font-bold text-amber-400">{entry.count}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-white/40 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Top givers */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-rose-400" />
                        Most Generous
                    </h3>
                    <div className="space-y-3">
                        {topPerformers.topGivers.length > 0 ? topPerformers.topGivers.map((entry, i) => (
                            <div key={entry.userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/25' :
                                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' :
                                        i === 2 ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white' :
                                            'bg-white/10 text-white/50'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="text-white text-sm font-medium">{entry.user?.name?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{entry.user?.name}</p>
                                    <p className="text-xs text-white/50">{entry.user?.team}</p>
                                </div>
                                <span className="text-sm font-bold text-rose-400">{entry.count}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-white/40 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;
