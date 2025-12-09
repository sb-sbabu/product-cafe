import { loadUserTaste, type ScheduleWindow } from './barista-memory';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULE ENGINE (Phase 4 - Smart Scheduling)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Manages notification delivery windows:
 * - Calculates effective delivery times based on user preferences
 * - Determines if items should be batched or delivered immediately
 */

export interface WindowStatus {
    currentWindow: ScheduleWindow | null;
    nextWindow: ScheduleWindow | null;
    msToNextWindow: number;
    isInWindow: boolean;
}

/**
 * Get the current scheduling status
 */
export const getWindowStatus = (): WindowStatus => {
    const taste = loadUserTaste();
    const now = new Date();
    const currentHour = now.getHours();

    // Sort windows by start time
    const windows = [...(taste.scheduleWindows || [])]
        .filter(w => w.enabled)
        .sort((a, b) => a.startHour - b.startHour);

    if (windows.length === 0) {
        return {
            currentWindow: null,
            nextWindow: null,
            msToNextWindow: 0,
            isInWindow: false
        };
    }

    // Find current active window (if any)
    // A window is "active" if it's the most recent one passed, and we're within e.g., 1 hour of it?
    // Actually, typically "Scheduled" means "Deliver AT this time".
    // So "isInWindow" might mean "Is it currently digest time?". 
    // Let's define: specific trigger logic is handled by caller (BrewStore loop).
    // Here we just identify the target windows.

    // Next window logic
    let nextWindow = windows.find(w => w.startHour > currentHour);

    // If no window later today, wrap to first window tomorrow
    if (!nextWindow) {
        nextWindow = windows[0];
    }

    // Calculate time diff
    const nextTime = new Date(now);
    if (nextWindow.startHour <= currentHour) {
        // Must be tomorrow
        nextTime.setDate(nextTime.getDate() + 1);
    }
    nextTime.setHours(nextWindow.startHour, 0, 0, 0);

    const msToNextWindow = nextTime.getTime() - now.getTime();

    // Determine if we are "in" a window (e.g., passed the start hour recently)
    // This is useful for "Catch Up" logic or "Just Delivered" logic.
    const lastWindow = [...windows].reverse().find(w => w.startHour <= currentHour);

    return {
        currentWindow: lastWindow || windows[windows.length - 1], // Returns previous day's last window if early morning
        nextWindow,
        msToNextWindow,
        isInWindow: false // Logic for "active duration" can be added if needed
    };
};

/**
 * Check if the engine should batch items right now
 * Returns TRUE if we are NOT in realtime mode and outside specific override conditions
 */
export const shouldBatchNow = (criticality: 'dark' | 'medium' | 'light'): boolean => {
    const taste = loadUserTaste();

    // Always deliver critical items instantly
    if (criticality === 'dark') return false;

    // If batch mode is active, queue everything else
    if (taste.batchMode === 'scheduled') {
        return true;
    }

    // Realtime mode - deliver immediately
    return false;
};

/**
 * Get formatted label for next delivery
 */
export const getNextDeliveryLabel = (): string => {
    const status = getWindowStatus();
    if (!status.nextWindow) return '';

    const ms = status.msToNextWindow;
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);

    if (hours > 0) return `Next delivery in ${hours}h ${mins}m`;
    return `Next delivery in ${mins}m`;
};
