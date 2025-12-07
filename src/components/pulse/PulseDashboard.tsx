import React, { useEffect, useState } from 'react';
import { usePulseStore } from '../../lib/pulse/usePulseStore';
import { DOMAIN_CONFIG, type SignalDomain } from '../../lib/pulse/types';
import { SignalFeed } from './SignalFeed';
import { CompetitorPanel } from './CompetitorPanel';
import { CompetitorRadar } from './CompetitorRadar';
import { RegulatoryPanel } from './RegulatoryPanel';
import { TechnologyPanel } from './TechnologyPanel';
import { MarketPanel } from './MarketPanel';
import { PulseErrorBoundary } from './PulseErrorBoundary';
import {
    Activity,
    RefreshCw,
    Search,
    AlertTriangle,
    Clock,
    Zap,
    Eye,
    EyeOff,
    Target,
    Scale,
    Cpu,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// PULSE DASHBOARD — Main intelligence dashboard
// ═══════════════════════════════════════════════════════════════════════════

const DOMAINS: Array<SignalDomain | 'ALL'> = ['ALL', 'COMPETITIVE', 'REGULATORY', 'TECHNOLOGY', 'MARKET', 'NEWS'];

export const PulseDashboard: React.FC = () => {
    const {
        isLoading,
        error,
        stats,
        activeDomain,
        filter,
        selectedCompetitorId,
        fetchSignals,
        setActiveDomain,
        setFilter,
        setSelectedCompetitor,
        getFilteredSignals,
        getRateLimitInfo,
        markAsRead,
        markAllAsRead,
        toggleBookmark,
        getCompetitorsWithSignals,
        toggleCompetitorWatchlist,
    } = usePulseStore();

    const [rateLimitInfo, setRateLimitInfo] = useState(getRateLimitInfo());

    // Fetch signals on mount only
    useEffect(() => {
        fetchSignals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update rate limit info periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setRateLimitInfo(getRateLimitInfo());
        }, 60000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefresh = () => {
        if (rateLimitInfo.canRefresh) {
            fetchSignals(true);
            setRateLimitInfo(getRateLimitInfo());
        }
    };

    const filteredSignals = getFilteredSignals();
    const competitorsWithSignals = getCompetitorsWithSignals();
    const [showCompetitorPanel, setShowCompetitorPanel] = useState(true);

    const formatTimeAgo = (isoString: string | null) => {
        if (!isoString) return 'Never';
        const hrs = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
        if (hrs < 1) return 'Just now';
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const formatNextRefresh = (ms: number) => {
        if (ms <= 0) return 'Now';
        const hrs = Math.floor(ms / (1000 * 60 * 60));
        const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cafe-50/30">
            {/* Skip navigation link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cafe-600 focus:text-white focus:rounded-lg focus:outline-none"
            >
                Skip to main content
            </a>

            <div id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-cafe-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cafe-500/25">
                                    <Activity size={24} />
                                </div>
                                Café PULSE
                                <span className="px-2 py-1 bg-gradient-to-r from-cafe-100 to-purple-100 text-cafe-700 text-xs font-bold rounded-lg">
                                    BETA
                                </span>
                            </h1>
                            <p className="text-gray-500 mt-2 ml-[60px]">
                                Feel the pulse of US Healthcare — Before Anyone Else
                            </p>
                        </div>

                        {/* Rate limit & refresh */}
                        <div className="flex items-center gap-4">
                            <div className="text-right text-xs text-gray-500 hidden md:block">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    Last updated: {formatTimeAgo(rateLimitInfo.lastFetch)}
                                </div>
                                <div className="mt-0.5">
                                    Next refresh: {formatNextRefresh(rateLimitInfo.nextRefreshIn)}
                                </div>
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={!rateLimitInfo.canRefresh || isLoading}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
                                    rateLimitInfo.canRefresh && !isLoading
                                        ? "bg-cafe-600 text-white hover:bg-cafe-700 shadow-md shadow-cafe-500/20"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    {/* API usage warning */}
                    {rateLimitInfo.remaining < 20 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-amber-600" />
                            <span className="text-sm text-amber-800">
                                <strong>{rateLimitInfo.remaining}</strong> API calls remaining today.
                                Using cached data to preserve budget.
                            </span>
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-red-600" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Activity size={20} className="text-cafe-500" />
                            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Total Signals</div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Eye size={20} className="text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900">{stats.unread}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Unread</div>
                    </div>

                    <div className={cn(
                        "rounded-xl border p-4 shadow-sm",
                        stats.byPriority.critical > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <Zap size={20} className={stats.byPriority.critical > 0 ? "text-red-500" : "text-gray-400"} />
                            <span className={cn(
                                "text-2xl font-bold",
                                stats.byPriority.critical > 0 ? "text-red-700" : "text-gray-900"
                            )}>
                                {stats.byPriority.critical}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Critical</div>
                    </div>

                    <div className={cn(
                        "rounded-xl border p-4 shadow-sm",
                        stats.byPriority.high > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <AlertTriangle size={20} className={stats.byPriority.high > 0 ? "text-amber-500" : "text-gray-400"} />
                            <span className="text-2xl font-bold text-gray-900">{stats.byPriority.high}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">High Priority</div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">💓</span>
                            <span className="text-2xl font-bold text-gray-900">{stats.byDomain.COMPETITIVE}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Competitive</div>
                    </div>
                </div>

                {/* Filters & Domain Tabs */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                        {DOMAINS.map(domain => {
                            const config = domain === 'ALL' ? null : DOMAIN_CONFIG[domain];
                            const count = domain === 'ALL' ? stats.total : stats.byDomain[domain];

                            return (
                                <button
                                    key={domain}
                                    onClick={() => setActiveDomain(domain)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                                        activeDomain === domain
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    {config && <span>{config.icon}</span>}
                                    {domain === 'ALL' ? 'All' : config?.label}
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        activeDomain === domain ? "bg-cafe-100 text-cafe-700" : "bg-gray-200 text-gray-600"
                                    )}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search signals..."
                                value={filter.search || ''}
                                onChange={(e) => setFilter({ search: e.target.value || undefined })}
                                className="pl-9 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-500 text-sm transition-all"
                            />
                        </div>

                        <button
                            onClick={() => setFilter({ onlyUnread: !filter.onlyUnread })}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                                filter.onlyUnread
                                    ? "bg-cafe-50 border-cafe-200 text-cafe-700"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            )}
                        >
                            {filter.onlyUnread ? <EyeOff size={16} /> : <Eye size={16} />}
                            {filter.onlyUnread ? 'Unread only' : 'All'}
                        </button>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Signal Feed */}
                    <div className="flex-1 min-w-0">
                        <SignalFeed
                            signals={filteredSignals}
                            isLoading={isLoading}
                            activeDomain={activeDomain}
                            onMarkRead={markAsRead}
                            onToggleBookmark={toggleBookmark}
                            onMarkAllRead={markAllAsRead}
                        />
                    </div>

                    {/* Right: Domain-Specific Intelligence Panel */}
                    <div className="w-full lg:w-80 space-y-4">
                        {/* Toggle button for mobile */}
                        <button
                            onClick={() => setShowCompetitorPanel(!showCompetitorPanel)}
                            className="lg:hidden w-full flex items-center justify-center gap-2 p-3 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
                        >
                            {activeDomain === 'REGULATORY' && <Scale size={16} />}
                            {activeDomain === 'TECHNOLOGY' && <Cpu size={16} />}
                            {(activeDomain === 'ALL' || activeDomain === 'COMPETITIVE') && <Target size={16} />}
                            {showCompetitorPanel ? 'Hide' : 'Show'} Intel Panel
                        </button>

                        {showCompetitorPanel && (
                            <PulseErrorBoundary>
                                {/* REGULATORY Domain → Regulatory Panel */}
                                {activeDomain === 'REGULATORY' && (
                                    <RegulatoryPanel
                                        signals={filteredSignals}
                                        activeAgency="ALL"
                                        activeTopic={null}
                                        onAgencyChange={() => { }}
                                        onTopicChange={() => { }}
                                    />
                                )}

                                {/* TECHNOLOGY Domain → Technology Panel */}
                                {activeDomain === 'TECHNOLOGY' && (
                                    <TechnologyPanel
                                        signals={filteredSignals}
                                        activeTrack="ALL"
                                        onTrackChange={() => { }}
                                    />
                                )}

                                {/* MARKET Domain → Market Panel */}
                                {activeDomain === 'MARKET' && (
                                    <MarketPanel
                                        signals={filteredSignals}
                                        activeSignalType="ALL"
                                        activeSegment="ALL"
                                        onSignalTypeChange={() => { }}
                                        onSegmentChange={() => { }}
                                    />
                                )}

                                {/* COMPETITIVE or ALL or NEWS Domain → Competitor Panel */}
                                {(activeDomain === 'ALL' || activeDomain === 'COMPETITIVE' || activeDomain === 'NEWS') && (
                                    <>
                                        <CompetitorRadar
                                            competitors={competitorsWithSignals}
                                            selectedCompetitorId={selectedCompetitorId}
                                            onSelectCompetitor={setSelectedCompetitor}
                                        />
                                        <CompetitorPanel
                                            competitors={competitorsWithSignals}
                                            selectedCompetitorId={selectedCompetitorId}
                                            onSelectCompetitor={setSelectedCompetitor}
                                            onToggleWatchlist={toggleCompetitorWatchlist}
                                        />
                                    </>
                                )}
                            </PulseErrorBoundary>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
