import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import {
    getIntelligentSignals,
    getUnreadCount,
    markSignalAsRead,
    dismissSignal,
    markAllAsRead,
    provideFeedback,
    getBudgetStatus,
    type IntelligentSignal,
    type UrgencyLevel,
} from '../../../lib/pulse/notifications';
import {
    getActivePersona,
    isSnoozed,
    getSnoozeEndTime,
    snoozeNotifications,
    unsnooze,
    type NotificationPersona,
} from '../../../lib/pulse/notifications';
import { DOMAIN_CONFIG, type SignalDomain } from '../../../lib/pulse/types';
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    X,
    Clock,
    Settings,
    ChevronLeft,
    ChevronRight,
    ThumbsUp,
    ThumbsDown,
    Sparkles,
    Zap,
    Moon,
    ExternalLink,
    LayoutGrid,
    RefreshCw,
    Loader2,
    Search,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePulseStore } from '../../../lib/pulse/usePulseStore';
import { useDock } from '../../../contexts/DockContext';
import { smartSearchHealthcare, getGoogleSearchStats, canPerformGoogleSearch } from '../../../lib/pulse/googleSearchService';
import type { PulseSignal } from '../../../lib/pulse/types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION HUB — Fixed Sidebar Panel (189% HCI)
// Premium dock-style design matching CafeDock
//
// ⚠️ DEPRECATED: This component is being replaced by "The Daily Brew - ThePress"
// as part of the Unified Notification consolidation (Phase 4.5).
// See: daily_brew_prd_v2.md
// New component: src/components/daily-brew/ThePress.tsx
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use ThePress from daily-brew instead. This component will be removed.
 */
interface NotificationHubProps {
    className?: string;
    onOpenSettings?: () => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({
    className,
    onOpenSettings,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [signals, setSignals] = useState<IntelligentSignal[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activePersona, setActivePersona] = useState<NotificationPersona | null>(null);
    const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<SignalDomain | 'ALL'>('ALL');
    const [announcement, setAnnouncement] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PulseSignal[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Connect to pulse store for live news fetch
    const fetchSignals = usePulseStore(state => state.fetchSignals);

    // Connect to dock for synchronized transitions
    const { collapseDock, expandDock, isExpanded: isDockExpanded } = useDock();

    const panelRef = useRef<HTMLDivElement>(null);
    const bellButtonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Refresh data
    const refresh = useCallback(() => {
        const allSignals = getIntelligentSignals().filter(s => !s.dismissedAt);
        setSignals(allSignals);
        setUnreadCount(getUnreadCount());
        setActivePersona(getActivePersona());
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 15000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showSnoozeMenu) {
                    setShowSnoozeMenu(false);
                } else if (showSearchResults) {
                    clearSearch();
                } else if (isOpen && isExpanded) {
                    setIsExpanded(false);
                }
            }
            // Toggle with 'n' key
            if (e.key === 'n' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                setIsOpen(prev => !prev);
                if (!isOpen) setIsExpanded(true);
            }
            // Focus search with '/' key (9.80 Integration)
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    setIsExpanded(true);
                }
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isExpanded, showSnoozeMenu, showSearchResults]);

    // Handlers - synchronized with CafeDock for butter-smooth transitions
    const handleOpen = () => {
        setIsOpen(true);
        setIsExpanded(true);
        // Collapse dock when notifications open for clean transition
        collapseDock();
    };

    const handleClose = () => {
        setIsOpen(false);
        // Expand dock when notifications close
        expandDock();
    };

    const handleToggleCollapse = () => {
        setIsExpanded(prev => !prev);
    };

    const handleMarkAsRead = (id: string) => {
        markSignalAsRead(id);
        setAnnouncement('Signal marked as read');
        refresh();
    };

    const handleDismiss = (id: string) => {
        dismissSignal(id);
        setAnnouncement('Signal dismissed');
        refresh();
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
        setAnnouncement('All signals marked as read');
        refresh();
    };

    const handleSnooze = (minutes: number) => {
        snoozeNotifications(minutes);
        setShowSnoozeMenu(false);
        setAnnouncement(`Notifications snoozed for ${minutes} minutes`);
        refresh();
    };

    const handleUnsnooze = () => {
        unsnooze();
        setAnnouncement('Notifications resumed');
        refresh();
    };

    const handleRefreshNews = async () => {
        setIsRefreshing(true);
        setAnnouncement('Fetching live healthcare news...');
        try {
            await fetchSignals(true); // Force refresh from news APIs
            refresh(); // Update local state from intelligent engine
            setAnnouncement('News refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh news:', error);
            setAnnouncement('Failed to refresh news');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();

        // 9.50 Edge case: Validate query length (3-100 chars)
        if (!query) return;
        if (query.length < 3) {
            setSearchError('Search query must be at least 3 characters');
            return;
        }
        if (query.length > 100) {
            setSearchError('Search query too long (max 100 characters)');
            return;
        }

        // Check if search is allowed
        const check = canPerformGoogleSearch();
        if (!check.allowed) {
            setSearchError(check.reason || 'Search limit reached');
            setAnnouncement(check.reason || 'Search limit reached');
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setAnnouncement(`Searching for "${searchQuery}"...`);

        try {
            const result = await smartSearchHealthcare(searchQuery);

            if (result.error) {
                setSearchError(result.error);
                setSearchResults([]);
            } else {
                setSearchResults(result.signals);
                setShowSearchResults(true);
                setAnnouncement(`Found ${result.signals.length} results`);
            }
        } catch (error) {
            console.error('Search failed:', error);
            setSearchError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        setSearchError(null);
    };

    // Get search stats
    const searchStats = getGoogleSearchStats();

    const handleFeedback = (id: string, score: -1 | 1) => {
        provideFeedback(id, score);
        refresh();
    };

    // Filter signals by domain (memoized)
    const filteredSignals = useMemo(() =>
        selectedDomain === 'ALL'
            ? signals
            : signals.filter(s => s.domain === selectedDomain),
        [signals, selectedDomain]
    );

    // Group by urgency (memoized)
    const urgencyGroups = useMemo(() => groupByUrgency(filteredSignals), [filteredSignals]);

    const snoozed = isSnoozed();
    const snoozeEnd = getSnoozeEndTime();
    const budget = getBudgetStatus();

    const SNOOZE_OPTIONS = [
        { label: '30 min', value: 30, icon: '☕' },
        { label: '1 hour', value: 60, icon: '🍽️' },
        { label: '2 hours', value: 120, icon: '💼' },
        { label: '4 hours', value: 240, icon: '🎯' },
        { label: 'Until tomorrow', value: 60 * 24, icon: '🌙' },
    ];

    const DOMAIN_FILTERS: Array<SignalDomain | 'ALL'> = ['ALL', 'COMPETITIVE', 'REGULATORY', 'TECHNOLOGY', 'MARKET', 'NEWS'];

    // ─────────────────────────────────────────────────────────────────────────
    // BELL BUTTON (Header trigger)
    // ─────────────────────────────────────────────────────────────────────────
    if (!isOpen) {
        return (
            <div className={cn("relative", className)}>
                {/* Screen Reader Announcements */}
                <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                    {announcement}
                </div>

                <button
                    ref={bellButtonRef}
                    onClick={handleOpen}
                    className={cn(
                        "relative p-2.5 rounded-xl transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-cafe-500 focus:ring-offset-2",
                        "hover:bg-cafe-50 hover:shadow-md",
                        snoozed && "opacity-60"
                    )}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                    title="Open Notifications (n)"
                >
                    {snoozed ? (
                        <BellOff size={20} className="text-gray-400" />
                    ) : (
                        <Bell
                            size={20}
                            className={cn(
                                "transition-colors",
                                unreadCount > 0 ? "text-cafe-600" : "text-gray-600"
                            )}
                        />
                    )}

                    {/* Badge */}
                    {unreadCount > 0 && !snoozed && (
                        <span className={cn(
                            "absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center",
                            "px-1.5 text-[10px] font-bold text-white rounded-full",
                            "bg-gradient-to-r from-red-500 to-rose-500",
                            "shadow-lg shadow-red-500/25 animate-pulse"
                        )}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FIXED SIDEBAR PANEL (Dock-style)
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Screen Reader Announcements */}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {announcement}
            </div>

            {/* Bell button shows current state */}
            <button
                ref={bellButtonRef}
                onClick={handleClose}
                className={cn(
                    "relative p-2.5 rounded-xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-cafe-500 focus:ring-offset-2",
                    "bg-gradient-to-br from-cafe-100 to-cafe-200 shadow-inner"
                )}
                aria-label="Close Notifications"
                title="Close Notifications (n)"
            >
                <Bell size={20} className="text-cafe-600" />
            </button>

            {/* Fixed Sidebar Panel */}
            <div
                ref={panelRef}
                className={cn(
                    "fixed right-0 top-0 h-screen flex flex-col z-40",
                    "bg-white/95 backdrop-blur-xl",
                    "border-l border-gray-200/80",
                    "shadow-2xl notification-panel-transition",
                    isExpanded ? "w-[380px]" : "w-[70px]",
                    "animate-slide-in-panel"
                )}
            >
                {/* Header - Matches main header h-16 */}
                <div className={cn(
                    "flex items-center justify-between px-4 border-b border-gray-100/80 shrink-0 h-16",
                    "bg-gradient-to-r from-cafe-50/50 to-orange-50/50"
                )}>
                    {isExpanded ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-br from-cafe-500 to-cafe-600 rounded-lg shadow-sm">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-900">Intelligence Hub</span>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold text-cafe-700 bg-cafe-100 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    {/* LIVE Indicator */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[10px] text-green-600 font-medium">LIVE</span>
                                        <span className="text-[10px] text-gray-400">• US Healthcare</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Snooze Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                                        className={cn(
                                            "p-2 rounded-xl transition-all duration-200",
                                            "focus:outline-none focus:ring-2 focus:ring-cafe-500",
                                            snoozed
                                                ? "bg-amber-100 text-amber-600"
                                                : "hover:bg-gray-100 text-gray-500"
                                        )}
                                        title={snoozed ? "Notifications snoozed" : "Snooze notifications"}
                                    >
                                        {snoozed ? <Moon size={16} /> : <Clock size={16} />}
                                    </button>

                                    {/* Snooze Menu */}
                                    {showSnoozeMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-snooze-menu">
                                            {snoozed ? (
                                                <button
                                                    onClick={handleUnsnooze}
                                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-600"
                                                >
                                                    <Bell size={16} />
                                                    Resume Notifications
                                                </button>
                                            ) : (
                                                <>
                                                    <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
                                                        Snooze for
                                                    </div>
                                                    {SNOOZE_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleSnooze(opt.value)}
                                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                                        >
                                                            <span>{opt.icon}</span>
                                                            <span>{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Mark All Read */}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cafe-500"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={16} />
                                    </button>
                                )}

                                {/* Refresh News */}
                                <button
                                    onClick={handleRefreshNews}
                                    disabled={isRefreshing}
                                    className={cn(
                                        "p-2 rounded-xl transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-cafe-500",
                                        isRefreshing
                                            ? "bg-cafe-100 text-cafe-500"
                                            : "hover:bg-cafe-100 text-gray-500 hover:text-cafe-600"
                                    )}
                                    title="Refresh live news"
                                >
                                    {isRefreshing ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <RefreshCw size={16} />
                                    )}
                                </button>

                                {/* Settings */}
                                {onOpenSettings && (
                                    <button
                                        onClick={onOpenSettings}
                                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cafe-500"
                                        title="Notification settings"
                                    >
                                        <Settings size={16} />
                                    </button>
                                )}

                                {/* Collapse */}
                                <button
                                    onClick={handleToggleCollapse}
                                    className="p-2 rounded-lg hover:bg-amber-100/50 transition-all duration-200 group"
                                    aria-label="Collapse panel"
                                    title="Collapse (Esc)"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                                </button>

                                {/* Close */}
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-xl hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                                    title="Close panel (n)"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-cafe-500 to-cafe-600 rounded-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <button
                                onClick={handleToggleCollapse}
                                className="p-1.5 rounded-lg hover:bg-amber-100/50 transition-all duration-200 group"
                                aria-label="Expand panel"
                                title="Expand"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                            </button>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Snoozed Banner */}
                {isExpanded && snoozed && snoozeEnd && (
                    <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                            <Moon size={16} />
                            <span>
                                Snoozed until {snoozeEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <button
                            onClick={handleUnsnooze}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                            Resume <Zap size={12} />
                        </button>
                    </div>
                )}

                {/* Healthcare Search Bar */}
                {isExpanded && (
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search FDA, companies, topics... (press /)"
                                    disabled={searchStats.limitReached || isSearching}
                                    maxLength={100}
                                    className={cn(
                                        "w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-all duration-200",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                        "placeholder:text-gray-400",
                                        searchStats.limitReached
                                            ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                                            : "bg-white border-gray-200 hover:border-gray-300"
                                    )}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searchStats.limitReached || isSearching || !searchQuery.trim()}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    searchStats.limitReached
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                                )}
                            >
                                {isSearching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </form>

                        {/* Usage stats */}
                        <div className="flex items-center justify-between mt-2 text-[10px]">
                            <span className={cn(
                                "font-medium",
                                searchStats.conserveMode ? "text-amber-600" : "text-gray-500"
                            )}>
                                {searchStats.remaining}/{40} searches today
                            </span>
                            {showSearchResults && searchResults.length > 0 && (
                                <button
                                    onClick={clearSearch}
                                    className="text-blue-500 hover:text-blue-600 underline transition-opacity duration-200 hover:opacity-80"
                                >
                                    Clear results ({searchResults.length})
                                </button>
                            )}
                            {showSearchResults && searchResults.length === 0 && !isSearching && !searchError && (
                                <span className="text-gray-400">No results found</span>
                            )}
                        </div>

                        {/* Error display */}
                        {searchError && (
                            <p className="mt-2 text-xs text-red-500">{searchError}</p>
                        )}
                    </div>
                )}

                {/* Domain Filter Pills - Smart Grid Layout (No Horizontal Scroll) */}
                {isExpanded && (
                    <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-gray-100">
                        {DOMAIN_FILTERS.map(domain => (
                            <button
                                key={domain}
                                onClick={() => setSelectedDomain(domain)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-cafe-500",
                                    selectedDomain === domain
                                        ? "bg-cafe-500 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {domain === 'ALL' ? (
                                    <span className="flex items-center gap-1">
                                        <LayoutGrid size={12} />
                                        All
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        {DOMAIN_CONFIG[domain].icon}
                                        {DOMAIN_CONFIG[domain].label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Notification List - Hidden overflow prevents horizontal scroll */}
                <div className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin transition-opacity duration-200",
                    isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    {filteredSignals.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {urgencyGroups.immediate.length > 0 && (
                                <UrgencySection
                                    title="Immediate"
                                    signals={urgencyGroups.immediate}
                                    urgencyColor="red"
                                    onMarkRead={handleMarkAsRead}
                                    onDismiss={handleDismiss}
                                    onFeedback={handleFeedback}
                                />
                            )}
                            {urgencyGroups.timely.length > 0 && (
                                <UrgencySection
                                    title="Timely"
                                    signals={urgencyGroups.timely}
                                    urgencyColor="amber"
                                    onMarkRead={handleMarkAsRead}
                                    onDismiss={handleDismiss}
                                    onFeedback={handleFeedback}
                                />
                            )}
                            {(urgencyGroups.batched.length > 0 || urgencyGroups.digest.length > 0) && (
                                <UrgencySection
                                    title="Earlier"
                                    signals={[...urgencyGroups.batched, ...urgencyGroups.digest]}
                                    urgencyColor="gray"
                                    onMarkRead={handleMarkAsRead}
                                    onDismiss={handleDismiss}
                                    onFeedback={handleFeedback}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isExpanded && filteredSignals.length > 0 && (
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''}
                            </span>
                            {activePersona && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <span>{activePersona.icon}</span>
                                    <span>{activePersona.name} Mode</span>
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Collapsed hint */}
                {!isExpanded && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-gray-300 -rotate-90 whitespace-nowrap text-xs font-medium tracking-wider">
                            INTELLIGENCE HUB
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// URGENCY SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface UrgencySectionProps {
    title: string;
    signals: IntelligentSignal[];
    urgencyColor: 'red' | 'amber' | 'gray';
    onMarkRead: (id: string) => void;
    onDismiss: (id: string) => void;
    onFeedback: (id: string, score: -1 | 1) => void;
}

const UrgencySection: React.FC<UrgencySectionProps> = ({
    title,
    signals,
    urgencyColor,
    onMarkRead,
    onDismiss,
    onFeedback,
}) => {
    const colorClasses = {
        red: 'bg-red-500',
        amber: 'bg-amber-500',
        gray: 'bg-gray-400',
    };

    return (
        <div>
            <div className="px-4 py-2 bg-gray-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", colorClasses[urgencyColor])} />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {title}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({signals.length})
                    </span>
                </div>
            </div>
            {signals.slice(0, 15).map((signal, index) => (
                <SignalItem
                    key={signal.id}
                    signal={signal}
                    onMarkRead={onMarkRead}
                    onDismiss={onDismiss}
                    onFeedback={onFeedback}
                    animationDelay={index * 50}
                />
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL ITEM (memoized for performance)
// ─────────────────────────────────────────────────────────────────────────────

interface SignalItemProps {
    signal: IntelligentSignal;
    onMarkRead: (id: string) => void;
    onDismiss: (id: string) => void;
    onFeedback: (id: string, score: -1 | 1) => void;
    animationDelay: number;
}

const SignalItem = memo<SignalItemProps>(({
    signal,
    onMarkRead,
    onDismiss,
    onFeedback,
    animationDelay,
}) => {
    const [showActions, setShowActions] = useState(false);
    const isRead = !!signal.readAt;
    const domain = DOMAIN_CONFIG[signal.domain];

    const timeAgo = formatTimeAgo(signal.createdAt);

    const sisColor = signal.sis >= 80 ? 'text-red-600 bg-red-50' :
        signal.sis >= 60 ? 'text-amber-600 bg-amber-50' :
            signal.sis >= 40 ? 'text-blue-600 bg-blue-50' :
                'text-gray-600 bg-gray-50';

    return (
        <div
            className={cn(
                "group relative px-4 py-3 transition-all duration-200 animate-signal-enter",
                !isRead && "bg-gradient-to-r from-cafe-50/50 to-transparent",
                "hover:bg-gray-50"
            )}
            style={{ animationDelay: `${animationDelay}ms` }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0",
                        "shadow-sm transition-transform group-hover:scale-105"
                    )}
                    style={{
                        backgroundColor: `${domain.color}15`,
                        color: domain.color,
                    }}
                >
                    {domain.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                            "text-sm line-clamp-2 leading-tight",
                            isRead ? "text-gray-600" : "text-gray-900 font-medium"
                        )}>
                            {signal.title}
                        </h4>

                        <span className={cn(
                            "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold",
                            sisColor
                        )}>
                            {signal.sis}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {signal.summary}
                    </p>

                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
                        <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white shrink-0"
                            style={{ backgroundColor: domain.color }}
                        >
                            {domain.label}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">{timeAgo}</span>

                        {signal.sourceUrl && (
                            <a
                                href={signal.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-cafe-500 hover:text-cafe-600 flex items-center gap-0.5 shrink-0 truncate max-w-[80px]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Source <ExternalLink size={8} />
                            </a>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "flex items-center gap-0.5 shrink-0 transition-opacity duration-200",
                    showActions ? "opacity-100" : "opacity-0"
                )}>
                    {!isRead && (
                        <button
                            onClick={() => onMarkRead(signal.id)}
                            className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                        >
                            <Check size={14} />
                        </button>
                    )}

                    {signal.feedbackScore === undefined && (
                        <>
                            <button
                                onClick={() => onFeedback(signal.id, 1)}
                                className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                                title="Helpful"
                            >
                                <ThumbsUp size={12} />
                            </button>
                            <button
                                onClick={() => onFeedback(signal.id, -1)}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                title="Not helpful"
                            >
                                <ThumbsDown size={12} />
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onDismiss(signal.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        title="Dismiss"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {!isRead && (
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cafe-500" />
            )}
        </div>
    );
});

SignalItem.displayName = 'SignalItem';

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
    <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cafe-100 to-cafe-200 flex items-center justify-center">
            <Sparkles size={28} className="text-cafe-600" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">All caught up!</h4>
        <p className="text-sm text-gray-500">
            No new intelligence signals right now.
        </p>
        <p className="text-xs text-gray-400 mt-3">
            We'll notify you when important signals arrive.
        </p>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function groupByUrgency(signals: IntelligentSignal[]): Record<UrgencyLevel, IntelligentSignal[]> {
    const groups: Record<UrgencyLevel, IntelligentSignal[]> = {
        immediate: [],
        timely: [],
        batched: [],
        digest: [],
    };

    for (const signal of signals) {
        groups[signal.urgency].push(signal);
    }

    for (const key of Object.keys(groups) as UrgencyLevel[]) {
        groups[key].sort((a, b) => b.sis - a.sis);
    }

    return groups;
}

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
}

export default NotificationHub;
