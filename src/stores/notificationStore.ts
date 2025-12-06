import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockNotifications, type Notification, type NotificationType } from '../data/notifications';

/**
 * Notification Store - Zustand store for managing notifications
 * 
 * Features:
 * - Load notifications from mock data
 * - Mark individual notifications as read
 * - Mark all notifications as read
 * - Add new notifications
 * - Filter by type
 * - Track unread count
 */

interface NotificationState {
    notifications: Notification[];

    // Actions
    loadNotifications: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Notification;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;

    // Getters
    getUnreadCount: () => number;
    getUnreadNotifications: () => Notification[];
    getNotificationsByType: (type: NotificationType) => Notification[];
    getRecentNotifications: (limit?: number) => Notification[];
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],

            loadNotifications: () => {
                const state = get();
                if (state.notifications.length === 0) {
                    set({ notifications: [...mockNotifications] });
                }
            },

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: `n${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                set(state => ({
                    notifications: [newNotification, ...state.notifications],
                }));
                return newNotification;
            },

            markAsRead: (id) => {
                set(state => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, isRead: true } : n
                    ),
                }));
            },

            markAllAsRead: () => {
                set(state => ({
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                }));
            },

            deleteNotification: (id) => {
                set(state => ({
                    notifications: state.notifications.filter(n => n.id !== id),
                }));
            },

            // Getters
            getUnreadCount: () => get().notifications.filter(n => !n.isRead).length,

            getUnreadNotifications: () => get().notifications.filter(n => !n.isRead),

            getNotificationsByType: (type) => get().notifications.filter(n => n.type === type),

            getRecentNotifications: (limit = 10) =>
                [...get().notifications]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, limit),
        }),
        {
            name: 'cafe-notifications',
            partialize: (state) => ({
                notifications: state.notifications,
            }),
        }
    )
);
