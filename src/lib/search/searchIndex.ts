/**
 * Café Finder: Multi-Index Search Engine
 * Fuse.js-based fuzzy search with specialized indexes
 */

import Fuse from 'fuse.js';
import type {
    PersonResult,
    ToolResult,
    FAQResult,
    ResourceResult,
    DiscussionResult,
} from './types';

// Import mock data
import { mockPeople, mockResources, mockFAQs } from '../../data/mockData';
import { mockDiscussions } from '../../data/discussions';
import type { Person, Resource, FAQ } from '../../types';
import type { Discussion } from '../../data/discussions';

// ============================================
// INDEX CONFIGURATION
// ============================================

const PEOPLE_FUSE_OPTIONS: Fuse.IFuseOptions<Person> = {
    keys: [
        { name: 'displayName', weight: 3 },
        { name: 'email', weight: 1 },
        { name: 'title', weight: 2 },
        { name: 'team', weight: 1.5 },
        { name: 'expertiseAreas', weight: 2.5 },
        { name: 'location', weight: 0.5 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

const RESOURCES_FUSE_OPTIONS: Fuse.IFuseOptions<Resource> = {
    keys: [
        { name: 'title', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'pillar', weight: 1 },
        { name: 'category', weight: 1.5 },
        { name: 'tags', weight: 2 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

const FAQS_FUSE_OPTIONS: Fuse.IFuseOptions<FAQ> = {
    keys: [
        { name: 'question', weight: 4 },
        { name: 'alternateQuestions', weight: 3 },
        { name: 'answerSummary', weight: 2 },
        { name: 'category', weight: 1 },
        { name: 'tags', weight: 2 },
    ],
    threshold: 0.3, // Stricter for FAQs
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

const DISCUSSIONS_FUSE_OPTIONS: Fuse.IFuseOptions<Discussion> = {
    keys: [
        { name: 'title', weight: 3 },
        { name: 'body', weight: 2 },
        { name: 'authorName', weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

// ============================================
// SEARCH INDEX CLASS
// ============================================

class SearchIndex {
    private peopleIndex: Fuse<Person> | null = null;
    private resourcesIndex: Fuse<Resource> | null = null;
    private faqsIndex: Fuse<FAQ> | null = null;
    private discussionsIndex: Fuse<Discussion> | null = null;

    private initialized = false;

    /**
     * Initialize all search indexes
     */
    initialize(): void {
        if (this.initialized) return;

        console.log('[SearchIndex] Initializing search indexes...');
        const start = performance.now();

        // People index
        this.peopleIndex = new Fuse(mockPeople, PEOPLE_FUSE_OPTIONS);

        // Resources index (filter out archived)
        const activeResources = mockResources.filter(r => !r.isArchived);
        this.resourcesIndex = new Fuse(activeResources, RESOURCES_FUSE_OPTIONS);

        // FAQs index
        this.faqsIndex = new Fuse(mockFAQs, FAQS_FUSE_OPTIONS);

        // Discussions index
        this.discussionsIndex = new Fuse(mockDiscussions, DISCUSSIONS_FUSE_OPTIONS);

        this.initialized = true;

        const elapsed = performance.now() - start;
        console.log(`[SearchIndex] Indexes initialized in ${elapsed.toFixed(2)}ms`);
    }

    /**
     * Search people
     */
    searchPeople(query: string, limit = 10): PersonResult[] {
        if (!this.peopleIndex) this.initialize();

        const results = this.peopleIndex!.search(query, { limit });

        return results.map(result => {
            const person = result.item;
            const matchedTerms = result.matches?.map(m => m.value || '').filter(Boolean) || [];

            return {
                id: person.id,
                type: 'person' as const,
                score: 1 - (result.score || 0), // Fuse score is 0=perfect, we want 1=perfect
                matchedTerms,
                name: person.displayName,
                email: person.email,
                title: person.title,
                team: person.team,
                location: person.location || '',
                avatarUrl: person.avatarUrl || '',
                expertiseAreas: person.expertiseAreas,
                points: 0, // Will be populated from points store
                badgeCount: 0, // Will be populated from badge store
                teamsDeepLink: person.teamsDeepLink,
                slackHandle: person.slackHandle,
            };
        });
    }

    /**
     * Search resources
     */
    searchResources(query: string, limit = 10): ResourceResult[] {
        if (!this.resourcesIndex) this.initialize();

        const results = this.resourcesIndex!.search(query, { limit });

        return results.map(result => {
            const resource = result.item;
            const matchedTerms = result.matches?.map(m => m.value || '').filter(Boolean) || [];

            return {
                id: resource.id,
                type: 'resource' as const,
                score: 1 - (result.score || 0),
                matchedTerms,
                title: resource.title,
                description: resource.description,
                url: resource.url,
                pillar: resource.pillar,
                category: resource.category,
                resourceType: resource.contentType, // Use contentType from Resource
                tags: resource.tags || [],
                authorId: resource.owner, // Use owner field
                viewCount: resource.viewCount || 0,
                createdAt: resource.createdAt,
                updatedAt: resource.updatedAt,
            };
        });
    }

    /**
     * Search FAQs
     */
    searchFAQs(query: string, limit = 10): FAQResult[] {
        if (!this.faqsIndex) this.initialize();

        const results = this.faqsIndex!.search(query, { limit });

        return results.map(result => {
            const faq = result.item;
            const matchedTerms = result.matches?.map(m => m.value || '').filter(Boolean) || [];

            // Construct answer from steps if available
            const answerText = faq.answerSteps
                ? faq.answerSteps.map(s => s.instruction).join(' ')
                : faq.answerSummary;

            return {
                id: faq.id,
                type: 'faq' as const,
                score: 1 - (result.score || 0),
                matchedTerms,
                question: faq.question,
                answer: answerText,
                answerSummary: faq.answerSummary,
                category: faq.category,
                tags: faq.tags || [],
                viewCount: faq.viewCount || 0,
                helpfulCount: faq.helpfulCount || 0,
                relatedResourceIds: faq.relatedResourceIds,
            };
        });
    }

    /**
     * Search discussions
     */
    searchDiscussions(query: string, limit = 10): DiscussionResult[] {
        if (!this.discussionsIndex) this.initialize();

        const results = this.discussionsIndex!.search(query, { limit });

        return results.map(result => {
            const discussion = result.item;
            const matchedTerms = result.matches?.map(m => m.value || '').filter(Boolean) || [];

            return {
                id: discussion.id,
                type: 'discussion' as const,
                score: 1 - (result.score || 0),
                matchedTerms,
                title: discussion.title,
                bodyPreview: discussion.body.slice(0, 150) + (discussion.body.length > 150 ? '...' : ''),
                authorName: discussion.authorName,
                authorId: discussion.authorId,
                status: discussion.status,
                replyCount: discussion.replyCount,
                upvoteCount: discussion.upvoteCount,
                hasAcceptedAnswer: !!discussion.acceptedReplyId,
                createdAt: discussion.createdAt,
                tags: [], // Can extract from title if needed
            };
        });
    }

    /**
     * Search tools (from resources with tool contentType)
     */
    searchTools(query: string, limit = 10): ToolResult[] {
        if (!this.resourcesIndex) this.initialize();

        // Filter tools from resources - use contentType and pillar
        const toolResources = mockResources.filter(r =>
            r.contentType === 'tool' ||
            r.pillar === 'tools-access'
        );

        const toolsIndex = new Fuse(toolResources, {
            keys: [
                { name: 'title', weight: 3 },
                { name: 'description', weight: 2 },
                { name: 'tags', weight: 2 },
            ],
            threshold: 0.3,
            includeScore: true,
        });

        const results = toolsIndex.search(query, { limit });

        return results.map(result => {
            const resource = result.item;

            return {
                id: resource.id,
                type: 'tool' as const,
                score: 1 - (result.score || 0),
                matchedTerms: [],
                name: resource.title,
                description: resource.description,
                category: resource.category,
                accessUrl: resource.url,
                requestUrl: undefined, // Would come from tool-specific data
                guideUrl: undefined,
                status: 'available' as const,
            };
        });
    }

    /**
     * Search all indexes
     */
    searchAll(query: string, limitPerType = 5): {
        people: PersonResult[];
        tools: ToolResult[];
        faqs: FAQResult[];
        resources: ResourceResult[];
        discussions: DiscussionResult[];
        lopSessions: [];  // Placeholder - LOP sessions not yet implemented
    } {
        return {
            people: this.searchPeople(query, limitPerType),
            tools: this.searchTools(query, limitPerType),
            faqs: this.searchFAQs(query, limitPerType),
            resources: this.searchResources(query, limitPerType),
            discussions: this.searchDiscussions(query, limitPerType),
            lopSessions: [],  // TODO: Implement LOP sessions search in Phase 2
        };
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const searchIndex = new SearchIndex();

// ============================================
// RESULT TYPE
// ============================================

export type AnySearchResult = PersonResult | ToolResult | FAQResult | ResourceResult | DiscussionResult;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Count total results
 */
export function countResults(results: ReturnType<typeof searchIndex.searchAll>): number {
    return (
        results.people.length +
        results.tools.length +
        results.faqs.length +
        results.resources.length +
        results.discussions.length
    );
}

/**
 * Get all results as a flat array, sorted by score
 */
export function flattenResults(results: ReturnType<typeof searchIndex.searchAll>): AnySearchResult[] {
    const all: AnySearchResult[] = [
        ...results.people,
        ...results.tools,
        ...results.faqs,
        ...results.resources,
        ...results.discussions,
    ];

    return all.sort((a, b) => b.score - a.score);
}

/**
 * Get top result of any type
 */
export function getTopResult(results: ReturnType<typeof searchIndex.searchAll>): AnySearchResult | null {
    const flat = flattenResults(results);
    return flat.length > 0 ? flat[0] : null;
}
