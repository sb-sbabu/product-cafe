/**
 * Toast X - Notification Types
 * All notification-related types
 */

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Types of notifications in Toast X
 */
export type ToastNotificationType =
    | 'RECOGNIZED'           // You were recognized
    | 'REACTION'             // Someone reacted to your recognition
    | 'COMMENT'              // Someone commented on your recognition
    | 'MENTION'              // You were @mentioned
    | 'BADGE_EARNED'         // You earned a badge
    | 'AWARD_EARNED'         // You earned an award
    | 'LEADERBOARD_RANK'     // You moved up in leaderboard
    | 'GRATITUDE_CHAIN';     // Prompt to pass it forward

/**
 * Priority levels for notifications (10X improvement)
 */
export type NotificationPriority = 'high' | 'medium' | 'low';

/**
 * A notification in Toast X
 */
export interface ToastNotification {
    readonly id: string;
    readonly type: ToastNotificationType;
    readonly userId: string; // Who this notification is for
    readonly recognitionId?: string;
    readonly message: string;
    readonly read: boolean;
    readonly createdAt: string;
    readonly priority: NotificationPriority; // 10X: Priority sorting
    readonly actionUrl?: string; // 10X: Deep link to relevant page
    readonly actionLabel?: string; // 10X: CTA text
}

/**
 * Notification preferences for a user (10X improvement)
 */
export interface NotificationPreferences {
    readonly emailEnabled: boolean;
    readonly pushEnabled: boolean;
    readonly quietHoursStart?: string; // HH:MM format
    readonly quietHoursEnd?: string;
    readonly enabledTypes: readonly ToastNotificationType[];
}
