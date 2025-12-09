/**
 * Toast X - Notification Slice
 * Handles all notification-related state
 */

import type { StateCreator } from 'zustand';
import type { ToastNotification, ToastNotificationType, NotificationPriority } from '../../types';
import { generateId } from '../../utils';

// ═══════════════════════════════════════════════════════════════════════════
// SLICE STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface NotificationSlice {
    /** All notifications for current user */
    notifications: readonly ToastNotification[];

    /** Actions */
    addNotification: (
        type: ToastNotificationType,
        message: string,
        options?: {
            recognitionId?: string;
            priority?: NotificationPriority;
            actionUrl?: string;
            actionLabel?: string;
        }
    ) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => void;
    clearAll: () => void;

    /** Selectors */
    getUnreadCount: () => number;
    getRecentNotifications: (limit: number) => readonly ToastNotification[];
    getNotificationsByType: (type: ToastNotificationType) => readonly ToastNotification[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SLICE CREATOR
// ═══════════════════════════════════════════════════════════════════════════

export const createNotificationSlice: StateCreator<
    NotificationSlice,
    [],
    [],
    NotificationSlice
> = (set, get) => ({
    // Initial state
    notifications: [],

    // ─────────────────────────────────────────────────────────────────────────
    // NOTIFICATION ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    addNotification: (type, message, options = {}) => {
        const notification: ToastNotification = {
            id: generateId('notif'),
            type,
            userId: '', // Will be filled by store
            message,
            read: false,
            createdAt: new Date().toISOString(),
            priority: options.priority || 'medium',
            recognitionId: options.recognitionId,
            actionUrl: options.actionUrl,
            actionLabel: options.actionLabel,
        };

        set((state) => ({
            notifications: [notification, ...state.notifications],
        }));
    },

    markAsRead: (notificationId) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            ),
        }));
    },

    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
    },

    deleteNotification: (notificationId) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== notificationId),
        }));
    },

    clearAll: () => {
        set({ notifications: [] });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SELECTORS
    // ─────────────────────────────────────────────────────────────────────────

    getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
    },

    getRecentNotifications: (limit) => {
        return get().notifications.slice(0, limit);
    },

    getNotificationsByType: (type) => {
        return get().notifications.filter((n) => n.type === type);
    },
});
