import React from 'react';
import type { PulseSignal, SignalDomain } from '../../lib/pulse/types';
import { SignalCard } from './SignalCard';
import { Activity, Inbox, CheckCircle, Scale, Cpu, DollarSign, Newspaper, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL FEED — Grid display of signals with domain-specific states
// ═══════════════════════════════════════════════════════════════════════════

// Domain-specific empty state configurations
const EMPTY_STATE_CONFIG: Record<SignalDomain | 'ALL', {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}> = {
    ALL: {
        icon: <Inbox size={36} />,
        title: 'No signals detected',
        description: 'The market pulse is quiet. Check back later or try refreshing.',
        gradient: 'from-cafe-50 to-purple-50',
    },
    COMPETITIVE: {
        icon: <Users size={36} />,
        title: 'No competitor activity',
        description: "Your competitors are laying low. We'll alert you when they make moves.",
        gradient: 'from-rose-50 to-pink-50',
    },
    REGULATORY: {
        icon: <Scale size={36} />,
        title: 'No regulatory updates',
        description: 'No new rules or guidance from CMS, ONC, or HHS. Compliance is current.',
        gradient: 'from-amber-50 to-orange-50',
    },
    TECHNOLOGY: {
        icon: <Cpu size={36} />,
        title: 'No tech signals',
        description: 'The health IT landscape is stable. Monitoring FHIR, AI, and interoperability.',
        gradient: 'from-cyan-50 to-blue-50',
    },
    MARKET: {
        icon: <DollarSign size={36} />,
        title: 'No market activity',
        description: "Quiet on the M&A and funding front. We're watching for deals.",
        gradient: 'from-emerald-50 to-green-50',
    },
    NEWS: {
        icon: <Newspaper size={36} />,
        title: 'No breaking news',
        description: 'No major healthcare headlines right now. Check back soon.',
        gradient: 'from-slate-50 to-gray-100',
    },
};

interface SignalFeedProps {
    signals: PulseSignal[];
    isLoading: boolean;
    activeDomain?: SignalDomain | 'ALL';
    onMarkRead?: (id: string) => void;
    onToggleBookmark?: (id: string) => void;
    onMarkAllRead?: () => void;
}

export const SignalFeed: React.FC<SignalFeedProps> = ({
    signals,
    isLoading,
    activeDomain = 'ALL',
    onMarkRead,
    onToggleBookmark,
    onMarkAllRead,
}) => {
    const unreadCount = signals.filter(s => !s.isRead).length;
    const emptyConfig = EMPTY_STATE_CONFIG[activeDomain];

    // Loading skeleton with stagger animation
    if (isLoading && signals.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="flex gap-2 mb-3">
                            <div className="w-20 h-5 bg-gray-200 rounded-full" />
                            <div className="w-12 h-5 bg-gray-200 rounded-full" />
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="h-5 bg-gray-200 rounded w-full" />
                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-full" />
                            <div className="h-4 bg-gray-100 rounded w-5/6" />
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                            <div className="w-24 h-4 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Domain-specific empty state
    if (signals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className={cn(
                    "w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform hover:scale-105",
                    emptyConfig.gradient
                )}>
                    <span className="text-cafe-400">
                        {emptyConfig.icon}
                    </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {emptyConfig.title}
                </h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    {emptyConfig.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity size={14} className="animate-pulse" />
                    <span>Monitoring {activeDomain === 'ALL' ? 'all domains' : activeDomain.toLowerCase()}...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4" role="feed" aria-live="polite" aria-label="Market intelligence signals">
            {/* Feed header */}
            {unreadCount > 0 && (
                <div className="flex items-center justify-between px-1">
                    <span className="text-sm text-gray-500">
                        <strong className="text-gray-900">{unreadCount}</strong> unread signal{unreadCount !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={onMarkAllRead}
                        className={cn(
                            "flex items-center gap-1.5 text-xs font-medium transition-all",
                            "text-cafe-600 hover:text-cafe-700 hover:scale-105",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cafe-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
                        )}
                    >
                        <CheckCircle size={14} />
                        Mark all as read
                    </button>
                </div>
            )}

            {/* Signal grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                {signals.map((signal) => (
                    <SignalCard
                        key={signal.id}
                        signal={signal}
                        onMarkRead={onMarkRead}
                        onToggleBookmark={onToggleBookmark}
                    />
                ))}
            </div>
        </div>
    );
};
