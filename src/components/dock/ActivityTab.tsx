import React from 'react';
import { Bell, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    getRecentNotifications,
    getQuestionsForExpertise,
    getUnreadCount,
    getNotificationIcon,
    mockUserEngagement,
    type Notification,
    type NotificationType
} from '../../data/notifications';
import { formatDistanceToNow } from '../../lib/utils';

/**
 * ActivityTab - Notifications and engagement tab within Café Dock
 * 
 * Shows:
 * - Notifications (replies, mentions, updates)
 * - Questions for your expertise
 * - Contribution stats
 */

const notificationTypeColors: Record<NotificationType, string> = {
    'discussion_reply': 'bg-blue-100 text-blue-600',
    'discussion_mention': 'bg-purple-100 text-purple-600',
    'content_updated': 'bg-green-100 text-green-600',
    'question_for_expertise': 'bg-amber-100 text-amber-600',
    'answer_accepted': 'bg-yellow-100 text-yellow-600',
    'faq_created': 'bg-indigo-100 text-indigo-600',
    'weekly_digest': 'bg-gray-100 text-gray-600',
};

interface NotificationItemProps {
    notification: Notification;
    onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors',
                !notification.isRead && 'bg-blue-50/30'
            )}
        >
            <div className="flex gap-3">
                {/* Unread indicator */}
                <div className="pt-1 w-2 shrink-0">
                    {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                </div>

                {/* Icon */}
                <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-lg',
                    notificationTypeColors[notification.type]
                )}>
                    {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                            'text-sm line-clamp-1',
                            notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                        )}>
                            {notification.title}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                            {formatDistanceToNow(new Date(notification.createdAt))}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {notification.body}
                    </p>
                </div>


            </div>
        </button>
    );
};

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

export const ActivityTab: React.FC = () => {
    const notifications = getRecentNotifications(10);
    const questionsForExpertise = getQuestionsForExpertise();
    const unreadCount = getUnreadCount();

    const handleNotificationClick = (notification: Notification) => {
        // In real app, would navigate to the action URL
        console.log('Notification clicked:', notification.actionUrl);
    };

    const handleMarkAllRead = () => {
        // In real app, would mark all as read
        console.log('Mark all as read');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Notifications section */}
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                            Notifications
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
                            className="text-xs text-cafe-600 hover:text-cafe-700"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Questions for expertise */}
                {questionsForExpertise.length > 0 && (
                    <div className="bg-amber-50/50 border-b border-amber-100">
                        <div className="px-4 py-2">
                            <span className="text-xs text-amber-700 uppercase tracking-wide flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                Questions for your expertise
                            </span>
                        </div>
                        {questionsForExpertise.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={() => handleNotificationClick(notification)}
                            />
                        ))}
                    </div>
                )}

                {/* All notifications */}
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <Bell className="w-12 h-12 text-gray-300 mb-3" />
                        <h4 className="text-sm font-medium text-gray-700 mb-1">All caught up!</h4>
                        <p className="text-xs text-gray-500">No new notifications</p>
                    </div>
                ) : (
                    <>
                        <div className="px-4 py-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Recent
                            </span>
                        </div>
                        {notifications.filter(n => n.type !== 'question_for_expertise').map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={() => handleNotificationClick(notification)}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Contribution stats */}
            <ContributionStats />
        </div>
    );
};
