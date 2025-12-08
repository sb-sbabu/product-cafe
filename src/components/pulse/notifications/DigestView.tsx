import React, { useState, useEffect, useCallback } from 'react';
import {
    getIntelligentSignals,
    type IntelligentSignal,
} from '../../../lib/pulse/notifications';
import { DOMAIN_CONFIG, type SignalDomain } from '../../../lib/pulse/types';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronRight,
    Clock,
    Zap,
    BarChart3,
    ExternalLink,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// DIGEST VIEW — Beautiful signal summary
// Features: Executive summary, domain cards, trend indicators, quick actions
// ═══════════════════════════════════════════════════════════════════════════

interface DigestViewProps {
    className?: string;
    period?: 'today' | 'week' | 'month';
    onSignalClick?: (signal: IntelligentSignal) => void;
    onDomainClick?: (domain: SignalDomain) => void;
}

interface DomainStats {
    domain: SignalDomain;
    count: number;
    avgSIS: number;
    topSignal: IntelligentSignal | null;
    trend: 'up' | 'down' | 'stable';
    previousCount: number;
}

export const DigestView: React.FC<DigestViewProps> = ({
    className,
    period = 'today',
    onSignalClick,
    onDomainClick,
}) => {
    const [stats, setStats] = useState<DomainStats[]>([]);
    const [topSignals, setTopSignals] = useState<IntelligentSignal[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [criticalCount, setCriticalCount] = useState(0);

    const calculateStats = useCallback(() => {
        const signals = getIntelligentSignals();
        const now = Date.now();

        // Define period cutoffs
        const periodCutoff = {
            today: now - 24 * 60 * 60 * 1000,
            week: now - 7 * 24 * 60 * 60 * 1000,
            month: now - 30 * 24 * 60 * 60 * 1000,
        }[period];

        const previousPeriodStart = {
            today: periodCutoff - 24 * 60 * 60 * 1000,
            week: periodCutoff - 7 * 24 * 60 * 60 * 1000,
            month: periodCutoff - 30 * 24 * 60 * 60 * 1000,
        }[period];

        const periodSignals = signals.filter(s => s.createdAt.getTime() >= periodCutoff);
        const previousPeriodSignals = signals.filter(
            s => s.createdAt.getTime() >= previousPeriodStart && s.createdAt.getTime() < periodCutoff
        );

        setTotalCount(periodSignals.length);
        setCriticalCount(periodSignals.filter(s => s.sis >= 80).length);

        // Top signals by SIS
        setTopSignals(
            [...periodSignals]
                .sort((a, b) => b.sis - a.sis)
                .slice(0, 5)
        );

        // Calculate per-domain stats
        const domainStats: DomainStats[] = (Object.keys(DOMAIN_CONFIG) as SignalDomain[]).map(domain => {
            const domainSignals = periodSignals.filter(s => s.domain === domain);
            const previousDomainSignals = previousPeriodSignals.filter(s => s.domain === domain);

            const count = domainSignals.length;
            const previousCount = previousDomainSignals.length;
            const avgSIS = count > 0
                ? Math.round(domainSignals.reduce((sum, s) => sum + s.sis, 0) / count)
                : 0;
            const topSignal = domainSignals.sort((a, b) => b.sis - a.sis)[0] || null;

            let trend: 'up' | 'down' | 'stable' = 'stable';
            if (count > previousCount * 1.2) trend = 'up';
            else if (count < previousCount * 0.8) trend = 'down';

            return {
                domain,
                count,
                avgSIS,
                topSignal,
                trend,
                previousCount,
            };
        });

        // Sort by count descending
        setStats(domainStats.sort((a, b) => b.count - a.count));
    }, [period]);

    useEffect(() => {
        calculateStats();
        const interval = setInterval(calculateStats, 60000);
        return () => clearInterval(interval);
    }, [calculateStats]);

    const periodLabel = {
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
    }[period];

    const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
        if (trend === 'up') return <TrendingUp size={14} className="text-green-500" />;
        if (trend === 'down') return <TrendingDown size={14} className="text-red-500" />;
        return <Minus size={14} className="text-gray-400" />;
    };

    return (
        <div className={cn("", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cafe-500 to-cafe-600 rounded-xl shadow-lg shadow-cafe-500/25">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Intelligence Digest</h2>
                        <p className="text-sm text-gray-500">{periodLabel}'s signal summary</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    Updated just now
                </div>
            </div>

            {/* Executive Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-cafe-50 to-white border border-cafe-200 rounded-xl">
                    <div className="text-3xl font-bold text-cafe-700">{totalCount}</div>
                    <div className="text-sm text-cafe-600">Total Signals</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-red-600">{criticalCount}</span>
                        <Zap size={18} className="text-red-500" />
                    </div>
                    <div className="text-sm text-red-600">Critical (SIS 80+)</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600">
                        {stats.filter(s => s.count > 0).length}
                    </div>
                    <div className="text-sm text-blue-600">Active Domains</div>
                </div>
            </div>

            {/* Top Signals */}
            {topSignals.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-cafe-500" />
                        Top Signals
                    </h3>
                    <div className="space-y-2">
                        {topSignals.map((signal, index) => (
                            <button
                                key={signal.id}
                                onClick={() => onSignalClick?.(signal)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl hover:border-cafe-300 hover:shadow-md transition-all text-left flex items-center gap-3"
                            >
                                <span className="text-lg font-bold text-gray-300 w-6">
                                    {index + 1}
                                </span>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${DOMAIN_CONFIG[signal.domain].color}20` }}
                                >
                                    {DOMAIN_CONFIG[signal.domain].icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {signal.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white"
                                            style={{ backgroundColor: DOMAIN_CONFIG[signal.domain].color }}
                                        >
                                            {DOMAIN_CONFIG[signal.domain].label}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {formatTimeAgo(signal.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded-lg text-xs font-bold",
                                    signal.sis >= 80 ? "text-red-600 bg-red-50" :
                                        signal.sis >= 60 ? "text-amber-600 bg-amber-50" :
                                            "text-gray-600 bg-gray-50"
                                )}>
                                    {signal.sis}
                                </div>
                                {signal.sourceUrl && (
                                    <a
                                        href={signal.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 text-gray-400 hover:text-cafe-600 rounded-lg hover:bg-cafe-50"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Domain Breakdown */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <BarChart3 size={14} className="text-cafe-500" />
                    By Domain
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.map(stat => (
                        <button
                            key={stat.domain}
                            onClick={() => onDomainClick?.(stat.domain)}
                            className={cn(
                                "p-4 rounded-xl border-2 text-left transition-all",
                                stat.count > 0
                                    ? "bg-white border-gray-200 hover:border-cafe-300 hover:shadow-lg"
                                    : "bg-gray-50 border-gray-100 opacity-60"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                                        style={{ backgroundColor: `${DOMAIN_CONFIG[stat.domain].color}20` }}
                                    >
                                        {DOMAIN_CONFIG[stat.domain].icon}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {DOMAIN_CONFIG[stat.domain].label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendIcon trend={stat.trend} />
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <div>
                                    <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                                    <span className="text-xs text-gray-500 ml-1">signals</span>
                                </div>
                                {stat.avgSIS > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{stat.avgSIS}</span>
                                        <span className="text-xs text-gray-400 ml-0.5">avg SIS</span>
                                    </div>
                                )}
                            </div>

                            {stat.topSignal && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                        📌 {stat.topSignal.title}
                                    </p>
                                </div>
                            )}

                            {/* Progress Bar */}
                            {totalCount > 0 && (
                                <div className="mt-2">
                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(stat.count / totalCount) * 100}%`,
                                                backgroundColor: DOMAIN_CONFIG[stat.domain].color,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {totalCount === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cafe-100 to-cafe-200 flex items-center justify-center">
                        <Sparkles size={28} className="text-cafe-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">No signals {periodLabel.toLowerCase()}</h4>
                    <p className="text-sm text-gray-500">
                        Check back later for new market intelligence
                    </p>
                </div>
            )}
        </div>
    );
};

// Utility
function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default DigestView;
