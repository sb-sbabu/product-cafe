import type { Resource, FAQ, Person } from '../types';
import { mockResources, mockFAQs, mockPeople, searchResources, searchFAQs, searchPeople } from '../data/mockData';

/**
 * API Service Layer
 * 
 * This module provides a unified interface for data fetching.
 * Currently uses mock data but designed for easy swap to:
 * - SharePoint Lists via Microsoft Graph API
 * - tRPC API
 * - REST API
 * 
 * All methods return Promises to simulate async behavior.
 */

// Simulated network delay
const MOCK_DELAY = 100;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ========================================
// RESOURCES API
// ========================================

export const resourcesApi = {
    getAll: async (): Promise<Resource[]> => {
        await delay(MOCK_DELAY);
        return mockResources.filter(r => !r.isArchived);
    },

    getById: async (id: string): Promise<Resource | null> => {
        await delay(MOCK_DELAY);
        return mockResources.find(r => r.id === id) ?? null;
    },

    getByCategory: async (category: string): Promise<Resource[]> => {
        await delay(MOCK_DELAY);
        return mockResources.filter(r => r.category === category && !r.isArchived);
    },

    getByPillar: async (pillar: string): Promise<Resource[]> => {
        await delay(MOCK_DELAY);
        return mockResources.filter(r => r.pillar === pillar && !r.isArchived);
    },

    getFeatured: async (): Promise<Resource[]> => {
        await delay(MOCK_DELAY);
        return mockResources.filter(r => r.isFeatured && !r.isArchived);
    },

    getRecent: async (limit: number = 10): Promise<Resource[]> => {
        await delay(MOCK_DELAY);
        return mockResources
            .filter(r => !r.isArchived)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, limit);
    },

    search: async (query: string): Promise<Resource[]> => {
        await delay(MOCK_DELAY);
        return searchResources(query);
    },

    trackView: async (id: string): Promise<void> => {
        await delay(MOCK_DELAY / 2);
        // In production: POST to analytics endpoint
        console.log(`[Analytics] Resource viewed: ${id}`);
    },

    markHelpful: async (id: string, helpful: boolean): Promise<void> => {
        await delay(MOCK_DELAY / 2);
        console.log(`[Analytics] Resource ${id} marked ${helpful ? 'helpful' : 'not helpful'}`);
    },
};

// ========================================
// FAQ API
// ========================================

export const faqsApi = {
    getAll: async (): Promise<FAQ[]> => {
        await delay(MOCK_DELAY);
        return mockFAQs;
    },

    getById: async (id: string): Promise<FAQ | null> => {
        await delay(MOCK_DELAY);
        return mockFAQs.find(f => f.id === id) ?? null;
    },

    getByCategory: async (category: string): Promise<FAQ[]> => {
        await delay(MOCK_DELAY);
        return mockFAQs.filter(f => f.category === category);
    },

    search: async (query: string): Promise<FAQ[]> => {
        await delay(MOCK_DELAY);
        return searchFAQs(query);
    },

    markHelpful: async (id: string, helpful: boolean): Promise<void> => {
        await delay(MOCK_DELAY / 2);
        console.log(`[Analytics] FAQ ${id} marked ${helpful ? 'helpful' : 'not helpful'}`);
    },
};

// ========================================
// PEOPLE API
// ========================================

export const peopleApi = {
    getAll: async (): Promise<Person[]> => {
        await delay(MOCK_DELAY);
        return mockPeople.filter(p => p.isActive);
    },

    getById: async (id: string): Promise<Person | null> => {
        await delay(MOCK_DELAY);
        return mockPeople.find(p => p.id === id) ?? null;
    },

    getByExpertise: async (expertise: string): Promise<Person[]> => {
        await delay(MOCK_DELAY);
        const term = expertise.toLowerCase();
        return mockPeople.filter(p =>
            p.isActive && p.expertiseAreas.some(area => area.toLowerCase().includes(term))
        );
    },

    search: async (query: string): Promise<Person[]> => {
        await delay(MOCK_DELAY);
        return searchPeople(query);
    },
};

// ========================================
// UNIVERSAL SEARCH API
// ========================================

export interface UniversalSearchResult {
    resources: Resource[];
    faqs: FAQ[];
    people: Person[];
    totalCount: number;
    query: string;
    timestamp: string;
}

export const searchApi = {
    universalSearch: async (query: string): Promise<UniversalSearchResult> => {
        await delay(MOCK_DELAY);

        const resources = searchResources(query);
        const faqs = searchFAQs(query);
        const people = searchPeople(query);

        return {
            resources,
            faqs,
            people,
            totalCount: resources.length + faqs.length + people.length,
            query,
            timestamp: new Date().toISOString(),
        };
    },

    quickSearch: async (query: string, limit: number = 5): Promise<{
        resources: Resource[];
        faqs: FAQ[];
        people: Person[];
    }> => {
        await delay(MOCK_DELAY / 2);

        return {
            resources: searchResources(query).slice(0, limit),
            faqs: searchFAQs(query).slice(0, limit),
            people: searchPeople(query).slice(0, limit),
        };
    },
};

// ========================================
// USER PREFERENCES API (Mock)
// ========================================

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'home' | 'grab-and-go' | 'library';
    notifications: {
        newResources: boolean;
        weeklyDigest: boolean;
        chatMessages: boolean;
    };
    favoriteResourceIds: string[];
    favoriteFAQIds: string[];
    favoritePersonIds: string[];
    recentSearches: string[];
    lastVisited: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'light',
    defaultView: 'home',
    notifications: {
        newResources: true,
        weeklyDigest: true,
        chatMessages: true,
    },
    favoriteResourceIds: [],
    favoriteFAQIds: [],
    favoritePersonIds: [],
    recentSearches: [],
    lastVisited: new Date().toISOString(),
};

export const preferencesApi = {
    get: async (): Promise<UserPreferences> => {
        await delay(MOCK_DELAY);
        try {
            const stored = localStorage.getItem('user-preferences');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validate parsed data is an object
                if (typeof parsed === 'object' && parsed !== null) {
                    return { ...DEFAULT_PREFERENCES, ...parsed };
                }
            }
        } catch (error) {
            // localStorage unavailable or JSON parse error - return defaults
            console.warn('[Preferences] Failed to load preferences:', error);
        }
        return DEFAULT_PREFERENCES;
    },

    update: async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
        await delay(MOCK_DELAY);
        const current = await preferencesApi.get();
        const updated = { ...current, ...updates };
        try {
            localStorage.setItem('user-preferences', JSON.stringify(updated));
        } catch (error) {
            // Quota exceeded or localStorage unavailable
            console.warn('[Preferences] Failed to save preferences:', error);
        }
        return updated;
    },

    addRecentSearch: async (query: string): Promise<void> => {
        await delay(MOCK_DELAY / 2);
        // Sanitize and limit query length
        const sanitizedQuery = (query || '').slice(0, 200).trim();
        if (!sanitizedQuery) return;

        const prefs = await preferencesApi.get();
        const searches = [sanitizedQuery, ...prefs.recentSearches.filter(s => s !== sanitizedQuery)].slice(0, 10);
        await preferencesApi.update({ recentSearches: searches });
    },

    clearRecentSearches: async (): Promise<void> => {
        await delay(MOCK_DELAY / 2);
        await preferencesApi.update({ recentSearches: [] });
    },
};

// ========================================
// ANALYTICS API (Mock Telemetry)
// ========================================

export type AnalyticsEvent =
    | { type: 'page_view'; page: string; }
    | { type: 'search'; query: string; resultCount: number; }
    | { type: 'resource_view'; resourceId: string; }
    | { type: 'resource_click'; resourceId: string; }
    | { type: 'faq_view'; faqId: string; }
    | { type: 'faq_helpful'; faqId: string; helpful: boolean; }
    | { type: 'chat_message'; intent: string; }
    | { type: 'quick_reply_click'; replyId: string; }
    | { type: 'error'; message: string; stack?: string; };

export const analyticsApi = {
    track: async (event: AnalyticsEvent): Promise<void> => {
        // In production: POST to telemetry endpoint (Azure App Insights, etc.)
        const payload = {
            ...event,
            timestamp: new Date().toISOString(),
            sessionId: getSessionId(),
            userAgent: navigator.userAgent,
        };

        // Log for development
        if (import.meta.env.DEV) {
            console.log('[Analytics]', payload);
        }

        // Store locally for demo purposes
        const events = JSON.parse(localStorage.getItem('analytics-events') || '[]');
        events.push(payload);
        localStorage.setItem('analytics-events', JSON.stringify(events.slice(-100)));
    },

    getRecentEvents: (): AnalyticsEvent[] => {
        return JSON.parse(localStorage.getItem('analytics-events') || '[]');
    },
};

// Session ID helper
function getSessionId(): string {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
}

// ========================================
// SHAREPOINT INTEGRATION (Stub)
// ========================================

/**
 * SharePoint Lists Integration
 * 
 * To connect to SharePoint:
 * 1. Register app in Azure AD
 * 2. Configure Microsoft Graph permissions
 * 3. Replace mock calls with Graph API calls
 * 
 * Example:
 * ```typescript
 * import { Client } from '@microsoft/microsoft-graph-client';
 * 
 * const graphClient = Client.init({
 *   authProvider: (done) => {
 *     done(null, accessToken);
 *   }
 * });
 * 
 * // Get list items
 * const response = await graphClient
 *   .api(`/sites/${siteId}/lists/${listId}/items`)
 *   .expand('fields')
 *   .get();
 * ```
 */

export const sharepointApi = {
    // Placeholder for SharePoint integration
    isConfigured: false,
    siteUrl: '',

    configure: (siteUrl: string) => {
        sharepointApi.siteUrl = siteUrl;
        sharepointApi.isConfigured = true;
    },

    getListItems: async (_listName: string): Promise<unknown[]> => {
        void _listName; // Placeholder for future SharePoint integration
        console.warn('[SharePoint] Not configured. Using mock data.');
        return [];
    },
};
