import type { BrewSource } from './types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANALYTICS ENGINE (Phase 6 - Your Week in Brew)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Computes engagement metrics and weekly summaries.
 */

export interface WeeklyStats {
    totalReceived: number;
    totalSipped: number;
    avgResponseTime: number; // ms to read
    topSources: { source: BrewSource; count: number }[];
    topCategories: { category: string; count: number }[];
    engagementByDay: { day: string; count: number }[];
    peakHour: number; // Most active hour (0-23)
}

/**
 * Generate weekly stats from interaction history
 * Note: In a real app this would query a backend. Here we mock it based on limited local history
 * or generate realistic looking mock data for the demo.
 */
export const generateWeeklyStats = (): WeeklyStats => {
    // Mock data for demonstration purposes since we don't have a persistent history database
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return {
        totalReceived: 42,
        totalSipped: 38,
        avgResponseTime: 45 * 60 * 1000, // 45 mins
        topSources: [
            { source: 'pulse', count: 18 },
            { source: 'toast', count: 12 },
            { source: 'chat', count: 8 },
            { source: 'lop', count: 4 }
        ],
        topCategories: [
            { category: 'Market', count: 15 },
            { category: 'Recognition', count: 10 },
            { category: 'Critical', count: 8 }
        ],
        engagementByDay: days.map(day => ({
            day,
            count: Math.floor(Math.random() * 15) + 5
        })),
        peakHour: 9 // 9 AM
    };
};
