/**
 * ToastNotifications - Real-time notification dropdown
 * Shows recognition events, reactions, comments, and badge earnings
 */

import React, { useState, useMemo } from 'react';
import {
    Bell, X, CheckCheck, Award, Heart, MessageCircle,
    Sparkles, TrendingUp, Gift, Trophy
} from 'lucide-react';
import type { ToastNotification, ToastNotificationType } from '../types';

interface ToastNotificationsProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock notifications (would come from store in production)
const MOCK_NOTIFICATIONS: ToastNotification[] = [
    {
        id: 'notif-1',
        type: 'RECOGNIZED',
        userId: 'user-3',
        recognitionId: 'rec-1',
        message: 'Sarah Chen recognized you for "Do It Differently"',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
        id: 'notif-2',
        type: 'REACTION',
        userId: 'user-3',
        recognitionId: 'rec-2',
        message: 'Mike Johnson and 3 others reacted to your recognition',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: 'notif-3',
        type: 'BADGE_EARNED',
        userId: 'user-3',
        message: 'You earned the "Toast Debut" badge!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: 'notif-4',
        type: 'COMMENT',
        userId: 'user-3',
        recognitionId: 'rec-1',
        message: 'Alex Kim commented on your recognition',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
        id: 'notif-5',
        type: 'LEADERBOARD_RANK',
        userId: 'user-3',
        message: 'You moved up to #5 on this month\'s leaderboard!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    },
];

// Get icon for notification type
const getNotificationIcon = (type: ToastNotificationType) => {
    switch (type) {
        case 'RECOGNIZED':
            return <Gift className="w-5 h-5 text-amber-500" />;
        case 'REACTION':
            return <Heart className="w-5 h-5 text-rose-500" />;
        case 'COMMENT':
            return <MessageCircle className="w-5 h-5 text-blue-500" />;
        case 'BADGE_EARNED':
            return <Trophy className="w-5 h-5 text-purple-500" />;
        case 'AWARD_EARNED':
            return <Award className="w-5 h-5 text-emerald-500" />;
        case 'LEADERBOARD_RANK':
            return <TrendingUp className="w-5 h-5 text-cyan-500" />;
        case 'GRATITUDE_CHAIN':
            return <Sparkles className="w-5 h-5 text-pink-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-400" />;
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

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<ToastNotification[]>(MOCK_NOTIFICATIONS);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-transparent"
                onClick={onClose}
            />

            {/* Dropdown panel - positioned at top right */}
            <div className="absolute top-16 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Notification list */}
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-amber-50/50' : ''
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                {/* Icon */}
                                <div className="shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notification.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatTimeAgo(notification.createdAt)}
                                    </p>
                                </div>

                                {/* Unread indicator */}
                                {!notification.read && (
                                    <div className="shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <button className="w-full py-2 text-sm text-center text-purple-600 hover:text-purple-700 font-medium">
                            View all notifications
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToastNotifications;
