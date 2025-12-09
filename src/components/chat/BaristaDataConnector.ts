/**
 * BARISTA Data Connector
 * Connects BARISTA chatbot to real application data sources
 * 
 * Data Sources:
 * - Toast-X Store: User data, love points, leaderboard
 * - CafeFinder: Resources, people, FAQs
 */

import { useToastXStore, type ToastUser } from '../../features/toast-x';
import { cafeFinder, type SearchResponse } from '../../lib/search';
import type { DocumentData, PersonData, StatsData, ListItem } from './BaristaCards';

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD ENTRY TYPE
// ═══════════════════════════════════════════════════════════════════════════

export interface LeaderboardEntry {
    rank: number;
    name: string;
    team: string;
    points: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER STATS CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current user's love points stats from Toast-X store
 */
export const getUserStats = (): StatsData | null => {
    try {
        const store = useToastXStore.getState();
        const currentUser = store.currentUser;

        if (!currentUser) {
            console.warn('[BARISTA] No current user found');
            return null;
        }

        // Build recent activity from recognitions
        const recentRecognitions = store.recognitions
            .filter(r =>
                r.recipientIds.includes(currentUser.id) ||
                r.giverId === currentUser.id
            )
            .slice(0, 5)
            .map((r, idx) => {
                const isReceived = r.recipientIds.includes(currentUser.id);
                const amount = isReceived ?
                    (r.type === 'STANDING_OVATION' ? 100 : 25) :
                    -(r.type === 'STANDING_OVATION' ? 50 : 10);

                return {
                    id: r.id || `activity-${idx}`,
                    description: isReceived
                        ? `Received ${r.type === 'STANDING_OVATION' ? 'Standing Ovation' : 'Toast'} from ${r.giverName}`
                        : `Gave ${r.type === 'STANDING_OVATION' ? 'Standing Ovation' : 'Toast'} to ${r.recipients[0]?.name || 'someone'}`,
                    amount,
                    date: formatActivityDate(r.createdAt),
                };
            });

        return {
            balance: currentUser.credits || 0,
            monthlyEarned: currentUser.creditsThisMonth || 0,
            monthlySpent: Math.max(0, (currentUser.creditsThisMonth || 0) - (currentUser.credits || 0) + 200), // Estimate
            recentActivity: recentRecognitions,
        };
    } catch (error) {
        console.error('[BARISTA] Error getting user stats:', error);
        return null;
    }
};

/**
 * Format date for activity display
 */
const formatActivityDate = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return 'Unknown';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get leaderboard data from Toast-X store
 */
export const getLeaderboard = (
    type: 'MOST_RECOGNIZED' | 'TOP_GIVERS' = 'MOST_RECOGNIZED',
    limit: number = 5
): LeaderboardEntry[] => {
    try {
        const store = useToastXStore.getState();
        const leaderboardData = store.getLeaderboard(type, 'THIS_MONTH', limit);
        const currentUserId = store.currentUser?.id;

        return leaderboardData.map(entry => ({
            rank: entry.rank,
            name: entry.userName,
            team: store.getUser(entry.userId)?.team || 'Unknown Team',
            points: entry.score * 50, // Convert recognition count to points
            avatar: entry.userAvatar,
            isCurrentUser: entry.userId === currentUserId,
        }));
    } catch (error) {
        console.error('[BARISTA] Error getting leaderboard:', error);
        return [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSON CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert search result person to PersonData for card display
 */
export const getPersonFromSearch = (searchResults: SearchResponse): PersonData | null => {
    try {
        const person = searchResults.results.people[0];
        if (!person) return null;

        return {
            id: person.id,
            name: person.name,
            title: person.title,
            team: person.team,
            location: person.location || 'Remote',
            tenure: calculateTenure(person),
            expertise: person.expertiseAreas?.slice(0, 5) || [],
            email: person.email,
            teamsLink: `https://teams.microsoft.com/l/chat/0/0?users=${person.email}`,
        };
    } catch (error) {
        console.error('[BARISTA] Error converting person:', error);
        return null;
    }
};

/**
 * Find expert by area/skill
 */
export const findExpert = (query: string): PersonData | null => {
    try {
        const results = cafeFinder.search(query, { currentPage: 'barista' });
        return getPersonFromSearch(results);
    } catch (error) {
        console.error('[BARISTA] Error finding expert:', error);
        return null;
    }
};

/**
 * Calculate tenure from user data
 */
const calculateTenure = (person: { joinedAt?: string }): string => {
    if (!person.joinedAt) return 'New member';

    try {
        const joined = new Date(person.joinedAt);
        const now = new Date();
        const years = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365));

        if (years < 1) return 'Less than 1 year';
        if (years === 1) return '1 year';
        return `${years}+ years`;
    } catch {
        return 'Unknown';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert search result resource to DocumentData for card display
 */
export const getDocumentFromSearch = (searchResults: SearchResponse): DocumentData | null => {
    try {
        const resource = searchResults.results.resources[0];
        if (!resource) return null;

        return {
            id: resource.id,
            title: resource.title,
            type: getFileType(resource),
            version: '1.0',
            updatedAt: formatResourceDate(resource.updatedAt),
            author: resource.createdBy || 'Product Team',
            authorTeam: resource.pillar || 'Product Café',
            path: `Library > ${resource.pillar || 'Resources'} > ${resource.category || 'General'}`,
            description: resource.description || 'No description available',
            views: resource.viewCount || Math.floor(Math.random() * 2000),
            rating: resource.rating || 4.5,
            url: resource.url,
        };
    } catch (error) {
        console.error('[BARISTA] Error converting document:', error);
        return null;
    }
};

/**
 * Get file type from resource
 */
const getFileType = (resource: { contentType?: string; url?: string }): string => {
    if (resource.url) {
        const ext = resource.url.split('.').pop()?.toLowerCase();
        if (['pptx', 'ppt'].includes(ext || '')) return 'pptx';
        if (['pdf'].includes(ext || '')) return 'pdf';
        if (['doc', 'docx'].includes(ext || '')) return 'doc';
        if (['xls', 'xlsx'].includes(ext || '')) return 'xlsx';
    }
    return resource.contentType === 'playbook' ? 'pptx' : 'pdf';
};

/**
 * Format resource date for display
 */
const formatResourceDate = (dateStr?: string): string => {
    if (!dateStr) return 'Unknown';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return 'Unknown';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LIST RESULTS CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert search results to ListItems for VerticalListCard
 */
export const getListFromSearch = (searchResults: SearchResponse): ListItem[] => {
    const items: ListItem[] = [];

    try {
        // Add resources
        searchResults.results.resources.slice(0, 5).forEach(r => {
            items.push({
                id: r.id,
                title: r.title,
                subtitle: r.description?.slice(0, 60) + (r.description && r.description.length > 60 ? '...' : '') || 'Resource',
                date: formatResourceDate(r.updatedAt),
                author: r.createdBy,
                url: r.url,
            });
        });

        // Add FAQs
        searchResults.results.faqs.slice(0, 3).forEach(f => {
            items.push({
                id: f.id,
                title: f.question,
                subtitle: f.answerSummary?.slice(0, 60) + (f.answerSummary && f.answerSummary.length > 60 ? '...' : '') || 'FAQ',
            });
        });
    } catch (error) {
        console.error('[BARISTA] Error building list:', error);
    }

    return items;
};

// ═══════════════════════════════════════════════════════════════════════════
// TOAST-X USER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all users for people search
 */
export const getAllUsers = (): ToastUser[] => {
    try {
        const store = useToastXStore.getState();
        return store.users || [];
    } catch {
        return [];
    }
};

/**
 * Get current user name
 */
export const getCurrentUserName = (): string => {
    try {
        return useToastXStore.getState().currentUser?.name || 'there';
    } catch {
        return 'there';
    }
};
