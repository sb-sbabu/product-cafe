import type { BrewItem, BrewSource } from './types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALGORITHM 3: THE TIMING — Contextual Delivery Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * "Serve intelligence only when the user is ready to receive it.
 *  Don't spill coffee on someone who's typing."
 * 
 * This engine determines the OPTIMAL moment to surface notifications based on:
 * 1. User activity state (typing, idle, scrolling, meeting)
 * 2. Page context matching (boost relevant signals)
 * 3. Quiet hours enforcement
 * 4. Focus mode detection
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserActivityState =
    | 'active'      // Normal browsing
    | 'typing'      // Deep focus - typing
    | 'idle'        // No activity 5+ min
    | 'scrolling'   // Reading content
    | 'meeting';    // In video call (detected via tab title)

export interface TimingContext {
    activityState: UserActivityState;
    currentPage: string;
    currentTopics: string[];
    lastActivityAt: number;
    isQuietHours: boolean;
    focusModeUntil: number | null;
}

export interface DeliveryDecision {
    shouldDeliver: boolean;
    reason: string;
    boostScore: number;  // Modifier to add to caffeine score
    queueUntil?: number; // If not now, when to try again
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE TRACKING
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'daily-brew:timing-context';

let _context: TimingContext = {
    activityState: 'active',
    currentPage: '/',
    currentTopics: [],
    lastActivityAt: Date.now(),
    isQuietHours: false,
    focusModeUntil: null,
};

// Activity detection state
let _keystrokes: number[] = [];
let _lastScrollAt = 0;
let _activityListenersAttached = false;

/**
 * Get current timing context
 */
export const getTimingContext = (): TimingContext => ({ ..._context });

/**
 * Update timing context
 */
export const updateTimingContext = (updates: Partial<TimingContext>): void => {
    _context = { ..._context, ...updates, lastActivityAt: Date.now() };
};

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect if user is in deep typing focus
 * Criteria: >40 WPM for 30+ seconds
 */
const detectTypingFocus = (): boolean => {
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;

    // Filter keystrokes in last 30 seconds
    const recentKeystrokes = _keystrokes.filter(t => t > thirtySecondsAgo);
    _keystrokes = recentKeystrokes; // Cleanup old ones

    // 40 WPM = ~200 chars/min = ~100 keystrokes in 30s
    return recentKeystrokes.length > 100;
};

/**
 * Detect if user is idle (no activity for 5 minutes)
 */
const detectIdle = (): boolean => {
    return (Date.now() - _context.lastActivityAt) > 5 * 60 * 1000;
};

/**
 * Detect if user is in a meeting (video call tab)
 */
const detectMeeting = (): boolean => {
    const title = document.title.toLowerCase();
    const meetingKeywords = ['meet', 'zoom', 'teams', 'webex', 'call', 'huddle'];
    return meetingKeywords.some(kw => title.includes(kw));
};

/**
 * Detect scrolling activity
 */
const detectScrolling = (): boolean => {
    return (Date.now() - _lastScrollAt) < 2000;
};

/**
 * Calculate current activity state
 */
export const calculateActivityState = (): UserActivityState => {
    if (detectMeeting()) return 'meeting';
    if (detectTypingFocus()) return 'typing';
    if (detectIdle()) return 'idle';
    if (detectScrolling()) return 'scrolling';
    return 'active';
};

/**
 * Setup activity tracking listeners
 */
export const initActivityTracking = (): (() => void) => {
    if (_activityListenersAttached) return () => { };

    const handleKeydown = () => {
        _keystrokes.push(Date.now());
        _context.lastActivityAt = Date.now();
    };

    const handleScroll = () => {
        _lastScrollAt = Date.now();
        _context.lastActivityAt = Date.now();
    };

    const handleMouseMove = () => {
        _context.lastActivityAt = Date.now();
    };

    const handleClick = () => {
        _context.lastActivityAt = Date.now();
    };

    window.addEventListener('keydown', handleKeydown, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    _activityListenersAttached = true;

    // Return cleanup function
    return () => {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
        _activityListenersAttached = false;
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE CONTEXT MATCHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract topics from current page
 */
export const extractPageTopics = (): string[] => {
    const path = window.location.pathname.toLowerCase();
    const topics: string[] = [];

    // Extract from path
    if (path.includes('pulse')) topics.push('market', 'competitive', 'regulatory');
    if (path.includes('toast')) topics.push('recognition', 'culture', 'team');
    if (path.includes('lop')) topics.push('learning', 'session', 'education');
    if (path.includes('community') || path.includes('discuss')) topics.push('discussion', 'community');
    if (path.includes('library')) topics.push('resources', 'documentation');

    // Extract from page content (simplified)
    const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
    if (h1.includes('regulatory')) topics.push('regulatory');
    if (h1.includes('competitor')) topics.push('competitive');
    if (h1.includes('market')) topics.push('market');

    return [...new Set(topics)];
};

/**
 * Check if notification matches current page context
 */
export const matchesPageContext = (item: BrewItem): boolean => {
    const pageTopics = _context.currentTopics;
    if (pageTopics.length === 0) return false;

    const itemTopics = item.flavorNotes || [];
    return itemTopics.some(t => pageTopics.includes(t.toLowerCase()));
};

// ═══════════════════════════════════════════════════════════════════════════
// QUIET HOURS & FOCUS MODE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if current time is in quiet hours
 */
export const isInQuietHours = (): boolean => {
    try {
        const stored = localStorage.getItem('daily-brew:user-taste');
        if (!stored) return false;

        const taste = JSON.parse(stored);
        if (!taste.quietHours) return false;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = taste.quietHours.start.split(':').map(Number);
        const [endH, endM] = taste.quietHours.end.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Handle overnight (e.g., 22:00 - 08:00)
        if (startMinutes > endMinutes) {
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }

        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } catch {
        return false;
    }
};

/**
 * Enable focus mode for X minutes
 */
export const enableFocusMode = (minutes: number): void => {
    _context.focusModeUntil = Date.now() + (minutes * 60 * 1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_context));
};

/**
 * Disable focus mode
 */
export const disableFocusMode = (): void => {
    _context.focusModeUntil = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_context));
};

/**
 * Check if focus mode is active
 */
export const isFocusModeActive = (): boolean => {
    if (!_context.focusModeUntil) return false;
    if (Date.now() > _context.focusModeUntil) {
        _context.focusModeUntil = null;
        return false;
    }
    return true;
};

// ═══════════════════════════════════════════════════════════════════════════
// DELIVERY DECISION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Decide whether to deliver a notification NOW
 */
export const shouldDeliverNow = (item: BrewItem): DeliveryDecision => {
    const state = calculateActivityState();
    const isQuiet = isInQuietHours();
    const isFocused = isFocusModeActive();
    const contextMatch = matchesPageContext(item);

    // Critical items (dark roast) always deliver
    if (item.roast === 'dark') {
        return {
            shouldDeliver: true,
            reason: 'Critical notification - always deliver',
            boostScore: contextMatch ? 10 : 0,
        };
    }

    // Focus mode: only critical
    if (isFocused) {
        return {
            shouldDeliver: false,
            reason: 'Focus mode active',
            boostScore: 0,
            queueUntil: _context.focusModeUntil || undefined,
        };
    }

    // Quiet hours: only critical
    if (isQuiet) {
        return {
            shouldDeliver: false,
            reason: 'Quiet hours active',
            boostScore: 0,
            queueUntil: undefined, // Batched to morning digest
        };
    }

    // In meeting: only critical
    if (state === 'meeting') {
        return {
            shouldDeliver: false,
            reason: 'User in meeting',
            boostScore: 0,
            queueUntil: Date.now() + 30 * 60 * 1000, // Try again in 30 min
        };
    }

    // Typing (deep focus): queue non-critical
    if (state === 'typing' && item.roast === 'light') {
        return {
            shouldDeliver: false,
            reason: 'User in deep typing focus',
            boostScore: 0,
            queueUntil: Date.now() + 5 * 60 * 1000, // Try again in 5 min
        };
    }

    // Idle: batch mode - deliver but reduce urgency
    if (state === 'idle') {
        return {
            shouldDeliver: true,
            reason: 'User idle - batch delivery',
            boostScore: -10, // Slightly reduce since user may be away
        };
    }

    // Context match: boost relevance
    if (contextMatch) {
        return {
            shouldDeliver: true,
            reason: 'Content matches current page context',
            boostScore: 15, // Relevance boost!
        };
    }

    // Default: deliver normally
    return {
        shouldDeliver: true,
        reason: 'Normal delivery',
        boostScore: 0,
    };
};

/**
 * Apply timing context to a caffeine score
 */
export const applyTimingContext = (baseScore: number, item: BrewItem): number => {
    const decision = shouldDeliverNow(item);
    const adjustedScore = Math.max(0, Math.min(100, baseScore + decision.boostScore));
    return adjustedScore;
};

// ═══════════════════════════════════════════════════════════════════════════
// REFRESH CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Refresh the entire timing context
 */
export const refreshTimingContext = (): TimingContext => {
    _context = {
        ..._context,
        activityState: calculateActivityState(),
        currentPage: window.location.pathname,
        currentTopics: extractPageTopics(),
        isQuietHours: isInQuietHours(),
    };
    return _context;
};
