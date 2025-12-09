import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Coffee, Zap, BookOpen, MessageCircle } from 'lucide-react';
import { useBrewStore } from '../../stores/brewStore';
import { cn } from '../../lib/utils';
import type { RoastProfile } from '../../lib/daily-brew/types';

/**
 * NotificationBell - Clean, professional notification center
 * A simple bell icon with badge count, opens dropdown with all app notifications
 */
export const NotificationBell: React.FC = () => {
    const { menu, sip, refreshMenu, initializeSourcing } = useBrewStore();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | RoastProfile>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Initialize data sourcing on mount
    useEffect(() => {
        initializeSourcing();
        refreshMenu();
        const interval = setInterval(refreshMenu, 30000);
        return () => clearInterval(interval);
    }, [initializeSourcing, refreshMenu]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    // Filter notifications
    const filteredItems = filter === 'all'
        ? menu
        : menu.filter(item => item.roast === filter);

    const unreadCount = menu.filter(item => !item.isRead).length;

    // Mark item as read (sip)
    const handleItemClick = useCallback((id: string) => {
        sip(id);
    }, [sip]);

    // Get icon for source
    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'toast': return <Coffee className="w-4 h-4 text-amber-500" />;
            case 'pulse': return <Zap className="w-4 h-4 text-blue-500" />;
            case 'lop': return <BookOpen className="w-4 h-4 text-purple-500" />;
            case 'chat': return <MessageCircle className="w-4 h-4 text-green-500" />;
            default: return <Bell className="w-4 h-4 text-gray-400" />;
        }
    };

    // Get roast color
    const getRoastColor = (roast: RoastProfile) => {
        switch (roast) {
            case 'dark': return 'border-l-red-500 bg-red-50';
            case 'medium': return 'border-l-amber-500 bg-amber-50';
            case 'light': return 'border-l-gray-300 bg-white';
        }
    };

    // Format relative time
    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-200",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cafe-500 focus:ring-offset-2",
                    isOpen && "bg-gray-100"
                )}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
            >
                <Bell className={cn(
                    "w-5 h-5 transition-colors",
                    unreadCount > 0 ? "text-cafe-600" : "text-gray-500"
                )} />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium text-cafe-700 bg-cafe-100 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                        {(['all', 'dark', 'medium', 'light'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                                    filter === tab
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                )}
                            >
                                {tab === 'all' ? 'All' : tab === 'dark' ? '🔴 Urgent' : tab === 'medium' ? '🟡 Important' : '⚪ Info'}
                            </button>
                        ))}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {filteredItems.slice(0, 20).map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item.id)}
                                        className={cn(
                                            "flex gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4",
                                            getRoastColor(item.roast),
                                            !item.isRead ? "font-medium" : "opacity-70",
                                            "hover:bg-gray-50"
                                        )}
                                    >
                                        {/* Source Icon */}
                                        <div className="shrink-0 mt-0.5">
                                            {getSourceIcon(item.source)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm truncate",
                                                !item.isRead ? "text-gray-900" : "text-gray-600"
                                            )}>
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {item.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400">
                                                    {formatTime(item.timestamp)}
                                                </span>
                                                {item.flavorNotes?.slice(0, 2).map(note => (
                                                    <span
                                                        key={note}
                                                        className="px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-500 rounded"
                                                    >
                                                        {note}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Read indicator */}
                                        {!item.isRead && (
                                            <div className="shrink-0 mt-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {filteredItems.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {filteredItems.length} notification{filteredItems.length !== 1 ? 's' : ''}
                            </span>
                            <button className="text-xs text-cafe-600 hover:text-cafe-700 font-medium">
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
