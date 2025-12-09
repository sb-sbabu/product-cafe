import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, ArrowUpRight, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateWeeklyStats } from '../../lib/daily-brew/analytics-engine';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WEEK IN BREW — Analytics Summary Card
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Visualizes user engagement for the past week.
 */

export const WeekInBrew: React.FC = () => {
    const stats = useMemo(() => generateWeeklyStats(), []);

    // Find max value for chart scaling
    const maxDay = Math.max(...stats.engagementByDay.map(d => d.count));

    return (
        <div className="mx-3 mt-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Your Week in Brew</h3>
                        <p className="text-xs text-gray-500">Last 7 days activity</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +12%
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-semibold tracking-wider">Sipped</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">{stats.totalSipped}</span>
                        <span className="text-xs text-gray-500">/ {stats.totalReceived}</span>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-semibold tracking-wider">Avg Response</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                        {Math.round(stats.avgResponseTime / (60 * 1000))}m
                    </div>
                </div>
            </div>

            {/* Engagement Chart */}
            <div className="mb-5">
                <div className="flex items-end justify-between h-24 gap-2 px-1">
                    {stats.engagementByDay.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <div
                                className="w-full bg-violet-100 rounded-t-sm transition-all duration-300 group-hover:bg-violet-300 relative"
                                style={{ height: `${(d.count / maxDay) * 100}%` }}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {d.count} items
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                        {/* Fake avatars for top collaborators */}
                        <div className="w-5 h-5 rounded-full bg-rose-100 border border-white" />
                        <div className="w-5 h-5 rounded-full bg-amber-100 border border-white" />
                        <div className="w-5 h-5 rounded-full bg-blue-100 border border-white" />
                    </div>
                    <span className="text-xs text-gray-500">Top sources: Pulse, Toast</span>
                </div>
                <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-0.5">
                    Full Report <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
