import React, { useState, useEffect, useCallback } from 'react';
import {
    getUnreadCount,
    getUnreadSignals,
    getActivePersona,
    isSnoozed,
    type IntelligentSignal,
    type NotificationPersona,
} from '../../../lib/pulse/notifications';
import { DOMAIN_CONFIG } from '../../../lib/pulse/types';
import { Bell, BellOff, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION BADGE — Intelligent visual indicator
// Features: Priority heatmap, pulse animation, mini preview, focus indicator
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationBadgeProps {
    className?: string;
    onClick?: () => void;
    showMiniPreview?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    className,
    onClick,
    showMiniPreview = true,
}) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [topSignal, setTopSignal] = useState<IntelligentSignal | null>(null);
    const [persona, setPersona] = useState<NotificationPersona | null>(null);
    const [snoozed, setSnoozed] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const refresh = useCallback(() => {
        const count = getUnreadCount();
        setUnreadCount(count);

        const unread = getUnreadSignals();
        setTopSignal(unread.length > 0 ? unread[0] : null);

        setPersona(getActivePersona());
        setSnoozed(isSnoozed());
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Determine badge color based on urgency
    const getBadgeColor = () => {
        if (!topSignal) return 'from-cafe-500 to-cafe-600';

        const sis = topSignal.sis;
        if (sis >= 80) return 'from-red-500 to-rose-600'; // Critical
        if (sis >= 60) return 'from-amber-500 to-orange-500'; // High
        if (sis >= 40) return 'from-blue-500 to-cyan-500'; // Medium
        return 'from-gray-400 to-gray-500'; // Low
    };

    const getBadgeShadow = () => {
        if (!topSignal) return 'shadow-cafe-500/30';
        if (topSignal.sis >= 80) return 'shadow-red-500/40';
        if (topSignal.sis >= 60) return 'shadow-amber-500/30';
        return 'shadow-cafe-500/25';
    };

    return (
        <div
            className={cn("relative", className)}
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
        >
            <button
                onClick={onClick}
                className={cn(
                    "relative p-2.5 rounded-xl transition-all duration-300",
                    "hover:bg-cafe-50 hover:shadow-lg",
                    snoozed && "opacity-60"
                )}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
                {snoozed ? (
                    <BellOff size={22} className="text-gray-400" />
                ) : (
                    <Bell
                        size={22}
                        className={cn(
                            "transition-colors",
                            unreadCount > 0 ? "text-cafe-600" : "text-gray-600"
                        )}
                    />
                )}

                {/* Badge with Priority Heatmap */}
                {unreadCount > 0 && !snoozed && (
                    <span className={cn(
                        "absolute -top-1 -right-1 min-w-[22px] h-[22px]",
                        "flex items-center justify-center px-1.5",
                        "text-[11px] font-bold text-white rounded-full",
                        `bg-gradient-to-r ${getBadgeColor()}`,
                        `shadow-lg ${getBadgeShadow()}`
                    )}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Urgency Pulse Animation */}
                {topSignal && topSignal.sis >= 80 && !snoozed && (
                    <span className="absolute -top-1 -right-1 w-[22px] h-[22px] rounded-full bg-red-400/50 animate-ping" />
                )}

                {/* Persona Indicator */}
                {persona && (
                    <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">
                        {persona.icon}
                    </span>
                )}
            </button>

            {/* Mini Preview Tooltip */}
            {showMiniPreview && showPreview && topSignal && !snoozed && (
                <div
                    className={cn(
                        "absolute right-0 top-full mt-2 w-72",
                        "bg-white/95 backdrop-blur-xl rounded-xl",
                        "shadow-xl shadow-black/10 border border-gray-200/50",
                        "p-3 z-50",
                        "animate-fade-in"
                    )}
                >
                    <div className="flex items-start gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${DOMAIN_CONFIG[topSignal.domain].color}20` }}
                        >
                            {DOMAIN_CONFIG[topSignal.domain].icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-cafe-600">
                                    Latest Signal
                                </span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-bold",
                                    topSignal.sis >= 80 ? "text-red-600 bg-red-50" :
                                        topSignal.sis >= 60 ? "text-amber-600 bg-amber-50" :
                                            "text-gray-600 bg-gray-50"
                                )}>
                                    SIS {topSignal.sis}
                                </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {topSignal.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {unreadCount > 1
                                    ? `+${unreadCount - 1} more signal${unreadCount > 2 ? 's' : ''}`
                                    : formatTimeAgo(topSignal.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Quick Persona Status */}
                    {persona && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                            <Sparkles size={12} className="text-cafe-500" />
                            <span className="text-xs text-gray-500">
                                {persona.icon} {persona.name} Mode
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Snoozed Tooltip */}
            {showPreview && snoozed && (
                <div
                    className={cn(
                        "absolute right-0 top-full mt-2 w-48",
                        "bg-amber-50 border border-amber-200 rounded-xl",
                        "p-3 z-50",
                        "animate-fade-in"
                    )}
                >
                    <div className="flex items-center gap-2 text-amber-700">
                        <BellOff size={14} />
                        <span className="text-sm font-medium">Notifications Snoozed</span>
                    </div>
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

export default NotificationBadge;
