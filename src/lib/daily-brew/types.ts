export type RoastProfile = 'dark' | 'medium' | 'light';
export type BrewSource = 'toast' | 'lop' | 'pulse' | 'chat' | 'system';

export interface BrewItem {
    id: string;
    title: string;
    message: string;
    source: BrewSource;

    // The Intelligence
    roast: RoastProfile; // Calculated priority bucket
    caffeineScore: number; // 0-100 Raw importance score
    flavorNotes: string[]; // Context tags like ['recognition', 'urgent', 'market']

    // Temporal
    timestamp: number; // When it happened
    servedAt: number; // When it was shown to user
    isRead: boolean;

    // Metadata for linking
    link?: string;
    metadata?: Record<string, any>; // Flexible payload for source-specific data

    // UI helpers
    actors?: {
        name: string;
        avatar?: string;
    }[];
}

export interface BrewStats {
    steamPressure: number; // Total unread urgency
    dailyIntake: number; // Items processed today
    favoriteRoast: RoastProfile; // Most common type
}
