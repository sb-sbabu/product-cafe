import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Sparkles, CheckCheck, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    getIntelligentSignals,
    getUnreadCount,
    markSignalAsRead,
    markAllAsRead,
    type IntelligentSignal,
} from '../../lib/pulse/notifications';
import { DOMAIN_CONFIG } from '../../lib/pulse/types';
import {
    mockUserEngagement,
} from '../../data/notifications';
import { formatDistanceToNow } from '../../lib/utils';

/**
 * ActivityTab - Unified Activity feed within Café Dock
 * 
 * NOW INTEGRATED WITH:
 * - Intelligent Notification Engine (SIS scoring)
 * - PulseSignals with domain classification
 * - Real-time signal processing
 */

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL ITEM (Intelligent Signal display)
// ─────────────────────────────────────────────────────────────────────────────

interface SignalItemProps {
    signal: IntelligentSignal;
    onClick?: () => void;
}

const SignalItem: React.FC<SignalItemProps> = ({ signal, onClick }) => {
    const isRead = !!signal.readAt;
    const domain = DOMAIN_CONFIG[signal.domain];

    // SIS badge color
    const sisColor = signal.sis >= 80 ? 'text-red-600 bg-red-50' :
        signal.sis >= 60 ? 'text-amber-600 bg-amber-50' :
            signal.sis >= 40 ? 'text-blue-600 bg-blue-50' :
                'text-gray-600 bg-gray-50';

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors',
                !isRead && 'bg-cafe-50/30'
            )}
        >
            <div className="flex gap-3">
                {/* Unread indicator */}
                <div className="pt-1 w-2 shrink-0">
                    {!isRead && (
                        <div className="w-2 h-2 bg-cafe-500 rounded-full animate-pulse" />
                    )}
                </div>

                {/* Domain Icon */}
                <div
                    className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base'
                    )}
                    style={{
                        backgroundColor: `${domain.color} 15`,
                        color: domain.color,
                    }}
                >
                    {domain.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                            'text-sm line-clamp-1',
                            isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                        )}>
                            {signal.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-bold',
                                sisColor
                            )}>
                                {signal.sis}
                            </span>
                            <span className="text-xs text-gray-400">
                                {formatDistanceToNow(signal.createdAt)}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {signal.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white"
                            style={{ backgroundColor: domain.color }}
                        >
                            {domain.label}
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize">
                            {signal.urgency}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTRIBUTION STATS
// ─────────────────────────────────────────────────────────────────────────────

const ContributionStats: React.FC = () => {
    const stats = mockUserEngagement;

    const levelColors = {
        newcomer: 'bg-gray-100 text-gray-700',
        contributor: 'bg-blue-100 text-blue-700',
        expert: 'bg-purple-100 text-purple-700',
        champion: 'bg-amber-100 text-amber-700',
    };

    const levelIcons = {
        newcomer: '🌱',
        contributor: '⭐',
        expert: '🏅',
        champion: '🏆',
    };

    return (
        <div className="p-4 bg-gradient-to-br from-cafe-50 to-amber-50 border-t border-cafe-100">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Your Contributions</span>
                <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                    levelColors[stats.level]
                )}>
                    <span>{levelIcons[stats.level]}</span>
                    {stats.level.charAt(0).toUpperCase() + stats.level.slice(1)}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.repliesGiven}</div>
                    <div className="text-[10px] text-gray-500">Answers</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.answersAccepted}</div>
                    <div className="text-[10px] text-gray-500">Accepted</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.upvotesReceived}</div>
                    <div className="text-[10px] text-gray-500">Upvotes</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-cafe-600">{stats.contributionPoints}</div>
                    <div className="text-[10px] text-gray-500">Points</div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY TAB (Main Component)
// ─────────────────────────────────────────────────────────────────────────────

export const ActivityTab: React.FC = () => {
    const [signals, setSignals] = useState<IntelligentSignal[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load and refresh signals
    const refresh = useCallback(() => {
        const allSignals = getIntelligentSignals().filter(s => !s.dismissedAt);
        setSignals(allSignals);
        setUnreadCount(getUnreadCount());
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 15000);
        return () => clearInterval(interval);
    }, [refresh]);

    const handleSignalClick = (signal: IntelligentSignal) => {
        markSignalAsRead(signal.id);
        refresh();
        if (signal.sourceUrl) {
            window.open(signal.sourceUrl, '_blank');
        }
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
        refresh();
    };

    // Group signals by urgency
    const immediateSignals = signals.filter(s => s.urgency === 'immediate');
    const timelySignals = signals.filter(s => s.urgency === 'timely');
    const otherSignals = signals.filter(s => s.urgency === 'batched' || s.urgency === 'digest');

    return (
        <div className="flex flex-col h-full">
            {/* Notifications section */}
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cafe-500" />
                        <span className="text-sm font-medium text-gray-900">
                            Intelligence Feed
                            {unreadCount > 0 && (
                                <span className="ml-1.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-cafe-600 hover:text-cafe-700 flex items-center gap-1"
                        >
                            <CheckCheck className="w-3 h-3" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Empty state */}
                {signals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <div className="w-12 h-12 rounded-xl bg-cafe-100 flex items-center justify-center mb-3">
                            <Sparkles className="w-6 h-6 text-cafe-500" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">All caught up!</h4>
                        <p className="text-xs text-gray-500">No new intelligence signals</p>
                    </div>
                ) : (
                    <>
                        {/* Immediate signals */}
                        {immediateSignals.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-red-50/50">
                                    <span className="text-xs text-red-600 uppercase tracking-wide flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Immediate ({immediateSignals.length})
                                    </span>
                                </div>
                                {immediateSignals.slice(0, 5).map((signal) => (
                                    <SignalItem
                                        key={signal.id}
                                        signal={signal}
                                        onClick={() => handleSignalClick(signal)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Timely signals */}
                        {timelySignals.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-amber-50/50">
                                    <span className="text-xs text-amber-600 uppercase tracking-wide flex items-center gap-1">
                                        <Bell className="w-3 h-3" />
                                        Timely ({timelySignals.length})
                                    </span>
                                </div>
                                {timelySignals.slice(0, 5).map((signal) => (
                                    <SignalItem
                                        key={signal.id}
                                        signal={signal}
                                        onClick={() => handleSignalClick(signal)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Earlier signals */}
                        {otherSignals.length > 0 && (
                            <div>
                                <div className="px-4 py-2">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        Earlier ({otherSignals.length})
                                    </span>
                                </div>
                                {otherSignals.slice(0, 10).map((signal) => (
                                    <SignalItem
                                        key={signal.id}
                                        signal={signal}
                                        onClick={() => handleSignalClick(signal)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Contribution stats */}
            <ContributionStats />
        </div>
    );
};
