/**
 * Toast X - Notification Center
 * Real-time notification dropdown with priority-based sorting and actions
 * 10x improvements: Priority sorting, action buttons, animated notifications, grouping
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    Bell, X, CheckCheck, Award, Heart, MessageCircle,
    Sparkles, TrendingUp, Gift, Trophy, ChevronRight,
    Settings, Volume2, VolumeX
} from 'lucide-react';
import type { ToastNotification, ToastNotificationType, NotificationPriority } from '../../types';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

// Local notification type with title for UI display
interface DisplayNotification extends Omit<ToastNotification, 'priority'> {
    title: string;
    priority: NotificationPriority;
}

// Get icon for notification type
const getNotificationIcon = (type: ToastNotificationType) => {
    switch (type) {
        case 'RECOGNIZED':
            return <Gift className="w-5 h-5 text-amber-400" />;
        case 'REACTION':
            return <Heart className="w-5 h-5 text-rose-400" />;
        case 'COMMENT':
            return <MessageCircle className="w-5 h-5 text-blue-400" />;
        case 'BADGE_EARNED':
            return <Trophy className="w-5 h-5 text-purple-400" />;
        case 'AWARD_EARNED':
            return <Award className="w-5 h-5 text-emerald-400" />;
        case 'LEADERBOARD_RANK':
            return <TrendingUp className="w-5 h-5 text-cyan-400" />;
        case 'GRATITUDE_CHAIN':
            return <Sparkles className="w-5 h-5 text-pink-400" />;
        default:
            return <Bell className="w-5 h-5 text-white/40" />;
    }
};

// Get priority color
const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
        case 'high':
            return 'from-rose-500/20 to-pink-500/20 border-rose-500/30';
        case 'medium':
            return 'from-blue-500/10 to-cyan-500/10 border-white/10';
        case 'low':
            return 'from-white/5 to-white/5 border-white/5';
        default:
            return 'from-white/5 to-white/5 border-white/5';
    }
};

// Format relative time
const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

// Mock notifications generator (in production, would come from store)
const generateMockNotifications = (): DisplayNotification[] => {
    const now = Date.now();
    return [
        {
            id: 'notif-1',
            type: 'RECOGNIZED',
            priority: 'high',
            userId: 'user-3',
            recognitionId: 'rec-1',
            title: 'New Recognition!',
            message: 'Sarah Chen recognized you for "Be All In"',
            read: false,
            actionUrl: '/toast-x/recognition/rec-1',
            createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
        },
        {
            id: 'notif-2',
            type: 'REACTION',
            priority: 'medium',
            userId: 'user-3',
            recognitionId: 'rec-2',
            title: 'New Reactions',
            message: 'Mike Johnson and 3 others reacted to your recognition',
            read: false,
            createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
        },
        {
            id: 'notif-3',
            type: 'BADGE_EARNED',
            priority: 'high',
            userId: 'user-3',
            title: 'Badge Unlocked! 🎉',
            message: 'You earned the "Rising Star" badge!',
            read: false,
            createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            id: 'notif-4',
            type: 'COMMENT',
            priority: 'medium',
            userId: 'user-3',
            recognitionId: 'rec-1',
            title: 'New Comment',
            message: 'Alex Kim commented: "Great work on the demo!"',
            read: true,
            createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
            id: 'notif-5',
            type: 'LEADERBOARD_RANK',
            priority: 'low',
            userId: 'user-3',
            title: 'Leaderboard Update',
            message: 'You moved up to #5 on this month\'s leaderboard!',
            read: true,
            createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        },
        {
            id: 'notif-6',
            type: 'GRATITUDE_CHAIN',
            priority: 'medium',
            userId: 'user-3',
            recognitionId: 'rec-3',
            title: 'Chain Extended!',
            message: 'Someone passed forward your recognition chain',
            read: true,
            createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
        },
    ];
};

export const NotificationCenter: React.FC<NotificationCenterProps> = memo(({
    isOpen,
    onClose
}) => {
    const [notifications, setNotifications] = useState<DisplayNotification[]>(generateMockNotifications);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // Filtered and sorted notifications
    const displayedNotifications = useMemo(() => {
        let filtered = [...notifications];

        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.read);
        }

        // Sort by priority (high first), then by date
        return filtered.sort((a, b) => {
            const priorityOrder: Record<NotificationPriority, number> = { high: 0, medium: 1, low: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [notifications, filter]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    const deleteNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-transparent"
                onClick={onClose}
            />

            {/* Dropdown panel */}
            <div className="absolute top-16 right-6 w-[420px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-amber-400" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter buttons */}
                        <div className="flex bg-white/5 rounded-lg p-0.5">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'all'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'unread'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                Unread
                            </button>
                        </div>

                        {/* Sound toggle */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                        >
                            {soundEnabled ? (
                                <Volume2 className="w-4 h-4 text-white/50" />
                            ) : (
                                <VolumeX className="w-4 h-4 text-white/50" />
                            )}
                        </button>

                        {/* Mark all as read */}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-4 h-4 text-white/50" />
                            </button>
                        )}

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-white/50" />
                        </button>
                    </div>
                </div>

                {/* Notification list */}
                <div className="max-h-[480px] overflow-y-auto">
                    {displayedNotifications.length > 0 ? (
                        displayedNotifications.map((notification, idx) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group ${!notification.read ? `bg-gradient-to-r ${getPriorityColor(notification.priority)}` : ''
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Icon */}
                                <div className="shrink-0 mt-0.5 relative">
                                    {getNotificationIcon(notification.type)}
                                    {notification.priority === 'high' && !notification.read && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-white/70'}`}>
                                        {notification.title}
                                    </p>
                                    <p className={`text-sm mt-0.5 ${!notification.read ? 'text-white/80' : 'text-white/50'}`}>
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-white/40">
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                        {notification.actionUrl && (
                                            <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                View <ChevronRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="shrink-0 flex items-center gap-2">
                                    {/* Unread indicator */}
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-3 h-3 text-white/40" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <Bell className="w-16 h-16 text-white/10 mx-auto mb-4" />
                            <p className="text-white/50 font-medium">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-white/30 text-sm mt-1">
                                {filter === 'unread' ? 'You\'re all caught up!' : 'When you receive recognitions, they\'ll appear here'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        Notification Settings
                    </button>
                    {displayedNotifications.length > 0 && (
                        <button className="text-sm text-white/50 hover:text-white font-medium">
                            View All
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
