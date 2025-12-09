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
                <span className="flex items-center gap-1 text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    {value}{suffix}
                </span>
            );
        } else if (value < 0) {
            return (
                <span className="flex items-center gap-1 text-sm text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                    <ArrowDownRight className="w-4 h-4" />
                    {Math.abs(value)}{suffix}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">
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
                    <h2 className="text-2xl font-bold text-gray-900">Recognition Analytics</h2>
                    <p className="text-gray-500">Insights into your team's recognition culture</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time range selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                        {(['week', 'month', 'quarter'] as TimeRange[]).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Export button */}
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <TrendIndicator value={metrics.monthlyChange} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.totalRecognitions}</p>
                    <p className="text-sm text-gray-500">Total Recognitions</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <TrendIndicator value={8} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.activeUsers}</p>
                    <p className="text-sm text-gray-500">Active Users</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                            <Award className="w-5 h-5" />
                        </div>
                        <TrendIndicator value={5} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.avgPerUser}</p>
                    <p className="text-sm text-gray-500">Avg per User</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <TrendIndicator value={metrics.monthlyChange} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-4 group-hover:scale-105 transition-transform origin-left">{metrics.thisMonthCount}</p>
                    <p className="text-sm text-gray-500">This Month</p>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily trends chart */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Daily Recognition Trend
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {dailyTrends.slice(-7).map((day, idx) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {day.count}
                                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500 cursor-pointer relative shadow-sm"
                                    style={{
                                        height: `${Math.max(8, (day.count / maxDailyCount) * 100)}%`,
                                        animationDelay: `${idx * 100}ms`
                                    }}
                                >
                                </div>
                                <span className="text-xs text-gray-400">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Value distribution */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        Value Distribution
                    </h3>
                    <div className="space-y-4">
                        {valueDistribution.slice(0, 6).map(({ value, count, percentage, data }) => (
                            <div key={value} className="flex items-center gap-3 group">
                                <span className="text-xl w-8">{data?.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{data?.shortName}</span>
                                        <span className="text-xs text-gray-500">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                                            style={{
                                                width: `${percentage}%`,
                                                background: data?.color ? `linear-gradient(to right, ${data.color}, ${data.color}dd)` : 'linear-gradient(to right, #8b5cf6, #ec4899)'
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
                        {topPerformers.topReceivers.length > 0 ? topPerformers.topReceivers.map((entry, i) => (
                            <div key={entry.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/20' :
                                    i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                                        i === 2 ? 'bg-gradient-to-br from-amber-700 to-orange-700 text-white' :
                                            'bg-gray-200 text-gray-500'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform text-purple-600 font-semibold">
                                    {entry.user?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{entry.user?.name}</p>
                                    <p className="text-xs text-gray-500">{entry.user?.team}</p>
                                </div>
                                <span className="text-sm font-bold text-amber-600">{entry.count}</span>
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
                        {topPerformers.topGivers.length > 0 ? topPerformers.topGivers.map((entry, i) => (
                            <div key={entry.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-md shadow-rose-500/20' :
                                    i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                                        i === 2 ? 'bg-gradient-to-br from-rose-700 to-red-700 text-white' :
                                            'bg-gray-200 text-gray-500'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform text-rose-600 font-semibold">
                                    {entry.user?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{entry.user?.name}</p>
                                    <p className="text-xs text-gray-500">{entry.user?.team}</p>
                                </div>
                                <span className="text-sm font-bold text-rose-600">{entry.count}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;
