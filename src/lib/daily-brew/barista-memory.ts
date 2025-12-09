import type { BrewSource } from './types';

/**
 * ALGO 5: Barista's Memory — User Preference Learning
 * 
 * Tracks user interactions to personalize notification scoring.
 * "If you always ignore Market Updates, we switch you to decaf."
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScheduleWindow {
    name: 'morning' | 'afternoon' | 'evening';
    startHour: number; // 0-23
    enabled: boolean;
}

export interface UserTaste {
    /** Preference scores by source (-100 to +100) */
    bySource: Record<BrewSource, number>;

    /** Preference scores by domain/topic */
    byDomain: Record<string, number>;

    /** Preference scores by specific actors (email or ID) */
    byActor: Record<string, number>;

    /** Quiet hours (notifications muted except critical) */
    quietHours: { start: string; end: string } | null;

    /** Preferred digest delivery time */
    digestTime: string | null;

    /** Scheduling Configuration (Phase 4) */
    scheduleWindows: ScheduleWindow[];
    batchMode: 'realtime' | 'scheduled';

    /** Last updated timestamp */
    updatedAt: number;
}

export interface InteractionSignal {
    itemId: string;
    source: BrewSource;
    domain?: string;
    actorId?: string;
    action: 'expand' | 'read' | 'ignore' | 'dismiss' | 'save' | 'click_through';
    timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING WEIGHTS
// ═══════════════════════════════════════════════════════════════════════════

const ACTION_WEIGHTS: Record<InteractionSignal['action'], number> = {
    expand: 1,           // Mild interest
    read: 0.5,           // Read within 5 min
    ignore: -1,          // Ignored for 24h+
    dismiss: -2,         // Explicitly dismissed
    save: 3,             // Bookmarked
    click_through: 5,    // High engagement — clicked to source
};

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'daily-brew:user-taste';

export const getDefaultTaste = (): UserTaste => ({
    bySource: {
        toast: 0,
        lop: 0,
        pulse: 0,
        chat: 0,
        system: 0,
    },
    byDomain: {},
    byActor: {},
    quietHours: null,
    quietHours: null,
    digestTime: '09:00',
    scheduleWindows: [
        { name: 'morning', startHour: 8, enabled: true },
        { name: 'afternoon', startHour: 13, enabled: true },
        { name: 'evening', startHour: 18, enabled: true },
    ],
    batchMode: 'realtime',
    updatedAt: Date.now(),
});

export const loadUserTaste = (): UserTaste => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...getDefaultTaste(), ...JSON.parse(stored) };
        }
    } catch (e) {
        console.warn('[BaristaMemory] Failed to load user taste:', e);
    }
    return getDefaultTaste();
};

export const saveUserTaste = (taste: UserTaste): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...taste,
            updatedAt: Date.now(),
        }));
    } catch (e) {
        console.warn('[BaristaMemory] Failed to save user taste:', e);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a user interaction and update preferences
 */
export const recordInteraction = (signal: InteractionSignal): UserTaste => {
    const taste = loadUserTaste();
    const weight = ACTION_WEIGHTS[signal.action];

    // Update source preference
    if (signal.source) {
        const current = taste.bySource[signal.source] || 0;
        taste.bySource[signal.source] = clamp(current + weight, -100, 100);
    }

    // Update domain preference
    if (signal.domain) {
        const current = taste.byDomain[signal.domain] || 0;
        taste.byDomain[signal.domain] = clamp(current + weight, -100, 100);
    }

    // Update actor preference (boost/demote specific senders)
    if (signal.actorId) {
        const current = taste.byActor[signal.actorId] || 0;
        taste.byActor[signal.actorId] = clamp(current + weight, -100, 100);
    }

    saveUserTaste(taste);
    return taste;
};

/**
 * Calculate preference modifier for a notification
 * Returns a multiplier (0.5 = half priority, 1.5 = 50% boost)
 */
export const getPreferenceModifier = (
    source: BrewSource,
    domain?: string,
    actorId?: string
): number => {
    const taste = loadUserTaste();

    // Start with neutral
    let score = 0;

    // Source preference (weighted heavily)
    const sourceScore = taste.bySource[source] || 0;
    score += sourceScore * 0.5;

    // Domain preference
    if (domain && taste.byDomain[domain]) {
        score += taste.byDomain[domain] * 0.3;
    }

    // Actor preference (specific person boost/demote)
    if (actorId && taste.byActor[actorId]) {
        score += taste.byActor[actorId] * 0.2;
    }

    // Convert to multiplier: -100 → 0.5, 0 → 1.0, +100 → 1.5
    return 1 + (score / 200);
};

/**
 * Apply Barista's Memory to adjust a caffeine score
 */
export const applyBaristaMemory = (
    baseScore: number,
    source: BrewSource,
    domain?: string,
    actorId?: string
): number => {
    const modifier = getPreferenceModifier(source, domain, actorId);
    return Math.round(clamp(baseScore * modifier, 0, 100));
};

// ═══════════════════════════════════════════════════════════════════════════
// QUIET HOURS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if current time is within user's quiet hours
 */
export const isQuietHours = (): boolean => {
    const taste = loadUserTaste();
    if (!taste.quietHours) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = taste.quietHours.start.split(':').map(Number);
    const [endH, endM] = taste.quietHours.end.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Set quiet hours preference
 */
export const setQuietHours = (start: string, end: string): void => {
    const taste = loadUserTaste();
    taste.quietHours = { start, end };
    saveUserTaste(taste);
};

/**
 * Clear quiet hours
 */
export const clearQuietHours = (): void => {
    const taste = loadUserTaste();
    taste.quietHours = null;
    saveUserTaste(taste);
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);
