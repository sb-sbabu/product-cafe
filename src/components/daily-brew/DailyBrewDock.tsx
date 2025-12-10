import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
    Coffee, X, Zap, BookOpen, MessageCircle, Sparkles,
    Bell, Archive, Bookmark, Clock, Settings, ChevronDown, ChevronUp,
    Volume2, VolumeX, Flame, ExternalLink, Focus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock } from '../../contexts/DockContext';
import { useBrewStore } from '../../stores/brewStore';
import { recordInteraction } from '../../lib/daily-brew/barista-memory';
import { blendItems, type BlendedBrewItem } from '../../lib/daily-brew/barista-engine';
import { initActivityTracking, refreshTimingContext, isFocusModeActive } from '../../lib/daily-brew/timing-engine';
import { BrewSettings } from './BrewSettings';
import { MorningPour } from './MorningPour';
import type { RoastProfile, BrewItem, BrewSource } from '../../lib/daily-brew/types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE DAILY BREW — Premium Unified Notification Experience
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Phase 1.10: Light theme matching app aesthetic
 * Phase 1.25: Enhanced card interactions
 * Phase 1.50: Improved clustering visualization
 * Phase 1.75: Micro-animations polish
 * Phase 1.99: Final HCI refinements
 */

// ═══════════════════════════════════════════════════════════════════════════
// STEAM ANIMATION (Subtle for light theme)
// ═══════════════════════════════════════════════════════════════════════════

const SteamParticle: React.FC<{ delay: number; intensity: number }> = ({ delay, intensity }) => (
    <div
        className={cn(
            'absolute w-0.5 h-0.5 rounded-full opacity-0',
            intensity > 5 ? 'bg-amber-400' : 'bg-gray-300'
        )}
        style={{
            left: `${Math.random() * 16 + 42}%`,
            animation: `steam-rise ${2.5 + Math.random()}s ease-out infinite`,
            animationDelay: `${delay}s`,
        }}
    />
);

const SteamAnimation: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    const particleCount = Math.min(count, 5);

    return (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-4 overflow-hidden pointer-events-none">
            {Array.from({ length: particleCount }).map((_, i) => (
                <SteamParticle key={i} delay={i * 0.4} intensity={count} />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// BREW CARD (Phase 2.75 - Swipe Gestures + Enhanced Interactions)
// ═══════════════════════════════════════════════════════════════════════════

interface BrewCardProps {
    item: BrewItem | BlendedBrewItem;
    onSip: (id: string) => void;
    onDismiss: (id: string) => void;
    onSave: (id: string) => void;
}

const BrewCard: React.FC<BrewCardProps> = ({ item, onSip, onDismiss, onSave }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [swipeX, setSwipeX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [swipeAction, setSwipeAction] = useState<'save' | 'dismiss' | null>(null);
    const isBlended = 'isBlended' in item && item.isBlended;

    const sourceConfig: Record<BrewSource, { icon: typeof Coffee; color: string; bg: string }> = {
        toast: { icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
        pulse: { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
        lop: { icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
        chat: { icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        system: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' },
    };

    const roastStyles: Record<RoastProfile, { border: string; bg: string; badge: string }> = {
        dark: {
            border: 'border-l-4 border-l-rose-500',
            bg: 'bg-gradient-to-r from-rose-50 to-white hover:from-rose-100/80',
            badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
        },
        medium: {
            border: 'border-l-3 border-l-amber-400',
            bg: 'bg-gradient-to-r from-amber-50/80 to-white hover:from-amber-100/60',
            badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
        },
        light: {
            border: 'border-l-2 border-l-gray-200',
            bg: 'bg-white hover:bg-gray-50/80',
            badge: 'bg-gray-100 text-gray-600',
        },
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    const config = sourceConfig[item.source] || sourceConfig.system;
    const style = roastStyles[item.roast];
    const SourceIcon = config.icon;

    // Swipe gesture handlers (Phase 2.75)
    const handleDragStart = (clientX: number) => {
        setIsDragging(true);
        setStartX(clientX);
    };

    const handleDragMove = (clientX: number) => {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        const clampedX = Math.max(-100, Math.min(100, deltaX));
        setSwipeX(clampedX);

        // Determine action based on swipe direction
        if (clampedX > 50) setSwipeAction('save');
        else if (clampedX < -50) setSwipeAction('dismiss');
        else setSwipeAction(null);
    };

    const handleDragEnd = () => {
        if (swipeAction === 'save') {
            onSave(item.id);
        } else if (swipeAction === 'dismiss') {
            onDismiss(item.id);
        }
        setIsDragging(false);
        setSwipeX(0);
        setSwipeAction(null);
    };

    const handleClick = () => {
        if (Math.abs(swipeX) > 10) return; // Ignore if swiping
        onSip(item.id);
        recordInteraction({
            itemId: item.id,
            source: item.source,
            domain: item.flavorNotes?.[1],
            action: 'click_through',
            timestamp: Date.now()
        });
    };

    return (
        <div className="relative overflow-hidden">
            {/* Swipe Action Indicators (Phase 2.75) */}
            <div className={cn(
                'absolute inset-y-0 left-0 w-20 flex items-center justify-center transition-opacity',
                'bg-gradient-to-r from-amber-400 to-amber-300',
                swipeX > 30 ? 'opacity-100' : 'opacity-0'
            )}>
                <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div className={cn(
                'absolute inset-y-0 right-0 w-20 flex items-center justify-center transition-opacity',
                'bg-gradient-to-l from-gray-400 to-gray-300',
                swipeX < -30 ? 'opacity-100' : 'opacity-0'
            )}>
                <Archive className="w-6 h-6 text-white" />
            </div>

            {/* Card Content */}
            <div
                className={cn(
                    'group relative cursor-pointer',
                    style.border, style.bg,
                    !item.isRead ? '' : 'opacity-50',
                    isDragging ? '' : 'transition-transform duration-200'
                )}
                style={{ transform: `translateX(${swipeX}px)` }}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={() => { setIsHovered(false); if (isDragging) handleDragEnd(); }}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
            >
                <div className="flex gap-3 px-4 py-3">
                    {/* Source Icon */}
                    <div className={cn(
                        'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
                        config.bg,
                        'ring-1 ring-black/5',
                        'transition-transform duration-200',
                        isHovered && 'scale-110'
                    )}>
                        <SourceIcon className={cn('w-4 h-4', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                                'text-sm leading-snug',
                                !item.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'
                            )}>
                                {item.title}
                                {isBlended && (
                                    <span className="ml-1 text-xs font-normal text-gray-500">
                                        (+{(item as BlendedBrewItem).blendedCount - 1})
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-gray-400">
                                    {formatTime(item.timestamp)}
                                </span>
                                {!item.isRead && (
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className={cn(
                                'inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md',
                                style.badge
                            )}>
                                <Flame className="w-2.5 h-2.5" />
                                {item.caffeineScore}
                            </span>
                            {item.flavorNotes?.slice(0, 2).map(note => (
                                <span key={note} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-md">
                                    {note}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hover Actions */}
                <div className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5',
                    'bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100',
                    'px-1 py-1 transition-all duration-200',
                    isHovered && !isDragging ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
                )}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onSave(item.id); }}
                        className="p-1.5 hover:bg-amber-50 rounded-md transition-colors"
                        title="Save (swipe right)"
                    >
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDismiss(item.id); }}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Dismiss (swipe left)"
                    >
                        <Archive className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleClick(); }}
                        className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                        title="Open"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER (Phase 1.50 - Cleaner hierarchy)
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
    title: string;
    icon: string;
    count: number;
    variant: 'shot' | 'blend' | 'froth';
    collapsed?: boolean;
    onToggle?: () => void;
}

const SectionHeader: React.FC<SectionProps> = ({ title, icon, count, variant, collapsed, onToggle }) => {
    const styles = {
        shot: 'bg-rose-50/80 text-rose-700 border-b border-rose-100',
        blend: 'bg-amber-50/80 text-amber-700 border-b border-amber-100',
        froth: 'bg-gray-50/80 text-gray-600 border-b border-gray-100',
    };

    return (
        <button
            onClick={onToggle}
            disabled={!onToggle}
            className={cn(
                'w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider',
                styles[variant],
                onToggle && 'cursor-pointer hover:brightness-95 transition-all'
            )}
        >
            <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span>{title}</span>
                <span className="px-1.5 py-0.5 bg-black/5 rounded-full text-[10px] font-bold">
                    {count}
                </span>
            </div>
            {onToggle && (
                collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />
            )}
        </button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN: THE DAILY BREW DOCK (Phase 1.10 - Light Theme)
// ═══════════════════════════════════════════════════════════════════════════

export const DailyBrewDock: React.FC = () => {
    const { brewPanelOpen, closeBrewPanel, expandDock } = useDock();
    const { menu, sip, stats, refreshMenu, initializeSourcing } = useBrewStore();

    const [frothCollapsed, setFrothCollapsed] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [focusActive, setFocusActive] = useState(isFocusModeActive());

    useEffect(() => {
        initializeSourcing();
        refreshMenu();
        refreshTimingContext();
        const cleanup = initActivityTracking();
        const interval = setInterval(() => {
            refreshMenu();
            refreshTimingContext();
            setFocusActive(isFocusModeActive());
        }, 30000);
        return () => {
            clearInterval(interval);
            cleanup();
        };
    }, [initializeSourcing, refreshMenu]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && brewPanelOpen) closeBrewPanel();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [brewPanelOpen, closeBrewPanel]);

    // Phase 1.50: Apply clustering
    const clusteredMenu = useMemo(() => blendItems(menu), [menu]);

    // The Pour hierarchy
    const { shots, blends, froths } = useMemo(() => {
        const shots: (BrewItem | BlendedBrewItem)[] = [];
        const blends: (BrewItem | BlendedBrewItem)[] = [];
        const froths: (BrewItem | BlendedBrewItem)[] = [];
        clusteredMenu.forEach(item => {
            if (item.roast === 'dark') shots.push(item);
            else if (item.roast === 'medium') blends.push(item);
            else froths.push(item);
        });
        return { shots, blends, froths };
    }, [clusteredMenu]);

    const unreadCount = menu.filter(item => !item.isRead).length;

    const handleClose = useCallback(() => {
        closeBrewPanel();
        expandDock();
    }, [closeBrewPanel, expandDock]);

    const handleDismiss = useCallback((id: string) => {
        recordInteraction({
            itemId: id,
            source: menu.find(i => i.id === id)?.source || 'system',
            action: 'dismiss',
            timestamp: Date.now()
        });
    }, [menu]);

    const handleSave = useCallback((id: string) => {
        recordInteraction({
            itemId: id,
            source: menu.find(i => i.id === id)?.source || 'system',
            action: 'save',
            timestamp: Date.now()
        });
    }, [menu]);

    const handleMarkAllRead = useCallback(() => {
        menu.forEach(item => { if (!item.isRead) sip(item.id); });
    }, [menu, sip]);

    if (!brewPanelOpen) return null;

    return (
        <div
            className={cn(
                'fixed top-0 h-screen flex flex-col z-50',
                // Phase 1.10: Light theme matching app
                'bg-white/98 backdrop-blur-xl',
                'border-l border-gray-200/80',
                'shadow-2xl shadow-gray-300/30',
                'w-[400px]'
            )}
            style={{
                // Phase 1.10: Move left to not overlap, sits next to CafeDock
                right: '70px',
                animation: 'slide-in-right 0.25s ease-out'
            }}
        >
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HEADER (Phase 1.75 - Refined) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="shrink-0 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 via-white to-rose-50/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md shadow-amber-200/50">
                                <Coffee className="w-5 h-5 text-white" />
                            </div>
                            <SteamAnimation count={unreadCount} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h2 className="font-bold text-gray-900">The Daily Brew</h2>
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <p className="text-xs text-gray-500">
                                {focusActive ? (
                                    <span className="flex items-center gap-1 text-violet-600">
                                        <Focus className="w-3 h-3" /> Focus mode active
                                    </span>
                                ) : unreadCount > 0
                                    ? `${unreadCount} fresh · ${Math.round(stats.steamPressure)} pressure`
                                    : 'All caught up ✨'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                isMuted ? 'bg-rose-100 text-rose-600' : 'hover:bg-gray-100 text-gray-400'
                            )}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                settingsOpen ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100 text-gray-400'
                            )}
                            title="Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Close (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* QUICK STATS (Phase 1.99 - Final polish) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-rose-500 rounded-full" />
                        <span className="text-gray-500">Shots</span>
                        <span className="font-bold text-gray-700">{shots.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <span className="text-gray-500">Blends</span>
                        <span className="font-bold text-gray-700">{blends.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="text-gray-500">Froth</span>
                        <span className="font-bold text-gray-700">{froths.length}</span>
                    </div>
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                    Mark all read
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* THE POUR - Notification Stream */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto bg-white" id="brew-stream">
                {clusteredMenu.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-amber-100">
                            <Coffee className="w-8 h-8 text-amber-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-1">The pot is empty</h3>
                        <p className="text-sm text-gray-500 mb-5">Nothing brewing. Time to explore?</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-sm rounded-lg shadow-md shadow-amber-200/50 transition-all">
                                Explore Pulse
                            </button>
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors">
                                Check Toast
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* MORNING POUR - Daily Digest Summary (Phase 3) */}
                        <MorningPour
                            items={menu}
                            onSipAll={handleMarkAllRead}
                            onDiveIn={() => {
                                // Expand the froth section to show all items
                                setFrothCollapsed(false);
                            }}
                        />
                        {/* THE SHOT */}
                        {shots.length > 0 && (
                            <div>
                                <SectionHeader title="The Shot" icon="☕" count={shots.length} variant="shot" />
                                <div className="divide-y divide-gray-50">
                                    {shots.map(item => (
                                        <BrewCard key={item.id} item={item} onSip={sip} onDismiss={handleDismiss} onSave={handleSave} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* THE BLEND */}
                        {blends.length > 0 && (
                            <div>
                                <SectionHeader title="The Blend" icon="🍵" count={blends.length} variant="blend" />
                                <div className="divide-y divide-gray-50">
                                    {blends.map(item => (
                                        <BrewCard key={item.id} item={item} onSip={sip} onDismiss={handleDismiss} onSave={handleSave} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* THE FROTH (Collapsed by default) */}
                        {froths.length > 0 && (
                            <div>
                                <SectionHeader
                                    title="The Froth"
                                    icon="🥛"
                                    count={froths.length}
                                    variant="froth"
                                    collapsed={frothCollapsed}
                                    onToggle={() => setFrothCollapsed(!frothCollapsed)}
                                />
                                {!frothCollapsed && (
                                    <div className="divide-y divide-gray-50">
                                        {froths.map(item => (
                                            <BrewCard key={item.id} item={item} onSip={sip} onDismiss={handleDismiss} onSave={handleSave} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FOOTER */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="shrink-0 px-4 py-2.5 bg-gray-50/80 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Updated now</span>
                    </div>
                    <span>{stats.dailyIntake} sipped today</span>
                </div>
            </div>

            <style>{`
                @keyframes steam-rise {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    15% { opacity: 0.4; }
                    100% { transform: translateY(-16px) scale(0.3); opacity: 0; }
                }
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0.5; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            {/* Settings Modal */}
            <BrewSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
};

export default DailyBrewDock;
