/**
 * Toast X - Utility Functions
 * Date helpers and common utilities
 */

// ═══════════════════════════════════════════════════════════════════════════
// ID GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a unique ID with a prefix
 * Uses timestamp + random string for uniqueness
 */
export const generateId = (prefix: string = 'toast-x'): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);
    return `${prefix}-${timestamp}-${random}`;
};

// ═══════════════════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a date string is from today
 */
export const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

/**
 * Get hours since a date
 */
export const hoursSince = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
};

/**
 * Get the start of the current week (Monday)
 */
export const getStartOfWeek = (): Date => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
};

/**
 * Get the start of the current month
 */
export const getStartOfMonth = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Get the start of the current quarter
 */
export const getStartOfQuarter = (): Date => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
};

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Format a date string for display
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// STRING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Truncate a string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const titleCase = (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

// ═══════════════════════════════════════════════════════════════════════════
// ARRAY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Group array items by a key
 */
export const groupBy = <T, K extends string | number>(
    items: readonly T[],
    getKey: (item: T) => K
): Record<K, T[]> => {
    return items.reduce((acc, item) => {
        const key = getKey(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<K, T[]>);
};

/**
 * Remove duplicates by a key
 */
export const uniqueBy = <T>(
    items: readonly T[],
    getKey: (item: T) => string | number
): T[] => {
    const seen = new Set<string | number>();
    return items.filter(item => {
        const key = getKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};
