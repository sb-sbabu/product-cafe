/**
 * Café Finder: Multi-Index Search Engine
 * Fuse.js-based fuzzy search with specialized indexes
 */

import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type {
    PersonResult,
    ToolResult,
    FAQResult,
    ResourceResult,
    DiscussionResult,
    LOPSessionResult,
    PulseSignalResult,
    CompetitorResult,
    Entity,
} from './types';

// Import mock data
import { mockPeople, mockResources, mockFAQs, mockLopSessions } from '../../data/mockData';
import { mockDiscussions } from '../../data/discussions';
import { LOP_SESSIONS } from '../lop/data';
import type { Person, Resource, FAQ, LopSession } from '../../types';
import type { Discussion } from '../../data/discussions';
import { ALL_COMPETITORS, type CompetitorProfile } from '../pulse/competitorData';
import type { PulseSignal } from '../pulse/types';

// ============================================
// INDEX CONFIGURATION
// ============================================

const PEOPLE_FUSE_OPTIONS: IFuseOptions<Person> = {
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

const RESOURCES_FUSE_OPTIONS: IFuseOptions<Resource> = {
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

const FAQS_FUSE_OPTIONS: IFuseOptions<FAQ> = {
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

const DISCUSSIONS_FUSE_OPTIONS: IFuseOptions<Discussion> = {
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

const LOP_FUSE_OPTIONS: IFuseOptions<LopSession> = {
    keys: [
        { name: 'title', weight: 4 },
        { name: 'description', weight: 2 },
        { name: 'tags', weight: 3 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

const PULSE_FUSE_OPTIONS: IFuseOptions<PulseSignal> = {
    keys: [
        { name: 'title', weight: 4 },
        { name: 'summary', weight: 3 },
        { name: 'entities.companies', weight: 2.5 },
        { name: 'entities.topics', weight: 2 },
        { name: 'domain', weight: 1 },
    ],
    threshold: 0.35,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

const COMPETITOR_FUSE_OPTIONS: IFuseOptions<CompetitorProfile> = {
    keys: [
        { name: 'name', weight: 4 },
        { name: 'category', weight: 2 },
        { name: 'description', weight: 2 },
        { name: 'markets', weight: 1.5 },
    ],
    threshold: 0.3,
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
    private lopIndex: Fuse<LopSession> | null = null;

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

        // LOP index - combine mockLopSessions with LOP_SESSIONS from lib/lop/data.ts
        // Convert LOP_SESSIONS to LopSession format for unified search
        const lopSessionsConverted: LopSession[] = LOP_SESSIONS.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            date: s.sessionDate,
            speakerIds: [s.speaker.id],
            recordingUrl: s.videoUrl || '',
            slidesUrl: s.slidesUrl || '',
            tags: s.topics,
            attendeeCount: s.viewCount,
            rating: 0,
        }));
        // Combine and dedupe by id
        const combinedLop = [
            ...mockLopSessions,
            ...lopSessionsConverted.filter(s => !mockLopSessions.some(m => m.id === s.id)),
        ];
        this.lopIndex = new Fuse(combinedLop, LOP_FUSE_OPTIONS);

        this.initialized = true;

        const elapsed = performance.now() - start;
        console.log(`[SearchIndex] Indexes initialized in ${elapsed.toFixed(2)}ms`);
    }

    /**
     * Search people
     */
    searchPeople(query: string, entities: Entity[] = [], limit = 10): PersonResult[] {
        if (!this.peopleIndex) this.initialize();

        let sourceData = mockPeople;
        const teamEntity = entities.find(e => e.type === 'TEAM');

        // Filter by team if present
        if (teamEntity) {
            sourceData = sourceData.filter(p =>
                p.team.toLowerCase().includes(teamEntity.normalizedValue.toLowerCase())
            );
        }

        // If filtering reduced data significantly, re-index or just search filtered
        let results: FuseResult<Person>[];
        if (sourceData.length < mockPeople.length) {
            const filteredIndex = new Fuse(sourceData, PEOPLE_FUSE_OPTIONS);
            results = filteredIndex.search(query || teamEntity?.value || 'person', { limit });
        } else {
            results = this.peopleIndex!.search(query, { limit });
        }

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
    searchResources(query: string, entities: Entity[] = [], limit = 10): ResourceResult[] {
        if (!this.resourcesIndex) this.initialize();

        let sourceData = mockResources.filter(r => !r.isArchived);

        // Filter by Pillar
        const pillarEntity = entities.find(e => e.type === 'PILLAR');
        if (pillarEntity) {
            sourceData = sourceData.filter(r =>
                r.pillar.toLowerCase() === pillarEntity.normalizedValue.toLowerCase()
            );
        }

        // Filter by Resource Type
        const typeEntity = entities.find(e => e.type === 'RESOURCE_TYPE');
        if (typeEntity) {
            sourceData = sourceData.filter(r =>
                r.contentType.toLowerCase() === typeEntity.normalizedValue.toLowerCase() ||
                r.category.toLowerCase().includes(typeEntity.normalizedValue.toLowerCase())
            );
        }

        let results: FuseResult<Resource>[];
        if (sourceData.length < mockResources.length) { // Approximation
            const filteredIndex = new Fuse(sourceData, RESOURCES_FUSE_OPTIONS);
            results = filteredIndex.search(query || 'resource', { limit });
        } else {
            results = this.resourcesIndex!.search(query, { limit });
        }

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
     * Search LOP sessions
     */
    /**
     * Search LOP sessions with entity filtering
     */
    searchLopSessions(query: string, entities: Entity[] = [], limit = 5): LOPSessionResult[] {
        if (!this.lopIndex) this.initialize();

        let sourceData = mockLopSessions;
        const now = new Date();

        // 1. Filter by temporal entities
        const temporalEntity = entities.find(e => e.type === 'TIME_RANGE' || e.type === 'DATE');
        let isTemporalSearch = false;

        if (temporalEntity) {
            isTemporalSearch = true;
            const value = temporalEntity.normalizedValue;

            if (value === 'future') {
                sourceData = sourceData.filter(s => new Date(s.date) >= now);
            } else if (value === 'next_occurrence') {
                // Return only future sessions
                sourceData = sourceData.filter(s => new Date(s.date) >= now);
            } else if (value.includes('/')) {
                // Date range
                const [startStr, endStr] = value.split('/');
                // const [startStr, endStr] = value.split('/');
                const start = new Date(startStr);
                const end = new Date(endStr);
                sourceData = sourceData.filter(s => {
                    const d = new Date(s.date);
                    return d >= start && d <= end;
                });
            } else if (!isNaN(Date.parse(value))) {
                // Specific date
                const target = new Date(value);
                sourceData = sourceData.filter(s => {
                    const d = new Date(s.date);
                    return d.toDateString() === target.toDateString();
                });
            }
        }

        let results: FuseResult<LopSession>[];

        // If temporal search dominated (e.g. "next lop"), we rely more on the filter
        // If we have a query string besides the temporal keywords, run Fuse
        // Heuristic: remove temporal words from query to see if anything remains
        const cleanQuery = query.replace(/\b(next|upcoming|future|session|lop|meeting|q[1-4]|tomorrow|today)\b/gi, '').trim();

        if (isTemporalSearch && cleanQuery.length < 2 && temporalEntity?.normalizedValue === 'next_occurrence') {
            // "next lop" -> Just sort by date and take top
            sourceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            // Mock fuse result structure for compatibility
            results = sourceData.slice(0, limit).map(item => ({
                item,
                score: 0.01,
                matches: [],
                refIndex: 0
            }));
        } else if (sourceData.length < mockLopSessions.length) {
            // Re-index filtered data (expensive but accurate) or just search if small
            const filteredIndex = new Fuse(sourceData, LOP_FUSE_OPTIONS);
            results = filteredIndex.search(query || 'session', { limit });
        } else {
            // No filter applied or query dominant
            results = this.lopIndex!.search(query, { limit });
        }

        return results.map(result => {
            const session = result.item;
            const matchedTerms = result.matches?.map(m => m.value || '').filter(Boolean) || [];

            // Find speaker name if possible (naive lookup for now)
            const speaker = mockPeople.find(p => session.speakerIds.includes(p.id));

            return {
                id: session.id,
                type: 'lop_session' as const,
                score: 1 - (result.score || 0),
                matchedTerms,
                sessionNumber: 0, // Not in mock data yet
                title: session.title,
                description: session.description,
                speakerName: speaker?.displayName || 'Unknown Speaker',
                speakerId: session.speakerIds[0] || '',
                sessionDate: session.date,
                duration: '60 min',
                topics: session.tags,
                videoUrl: session.recordingUrl,
                slidesUrl: session.slidesUrl,
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
     * Search Pulse signals (market intelligence)
     */
    searchPulseSignals(query: string, signals: PulseSignal[], limit = 5): PulseSignalResult[] {
        if (signals.length === 0) return [];

        const pulseIndex = new Fuse(signals, PULSE_FUSE_OPTIONS);
        const results = pulseIndex.search(query, { limit });

        return results.map(result => {
            const signal = result.item;
            return {
                id: signal.id,
                type: 'pulse_signal' as const,
                score: 1 - (result.score || 0),
                matchedTerms: result.matches?.map(m => m.value || '').filter(Boolean) || [],
                title: signal.title,
                summary: signal.summary,
                domain: signal.domain,
                priority: signal.priority,
                source: signal.source.name,
                publishedAt: signal.publishedAt,
                companies: signal.entities.companies,
                isRead: signal.isRead,
            };
        });
    }

    /**
     * Search competitors
     */
    searchCompetitors(query: string, limit = 5): CompetitorResult[] {
        const competitorIndex = new Fuse(ALL_COMPETITORS, COMPETITOR_FUSE_OPTIONS);
        const results = competitorIndex.search(query, { limit });

        return results.map(result => {
            const competitor = result.item;
            return {
                id: competitor.id,
                type: 'competitor' as const,
                score: 1 - (result.score || 0),
                matchedTerms: result.matches?.map(m => m.value || '').filter(Boolean) || [],
                name: competitor.name,
                category: competitor.category,
                tier: competitor.tier,
                description: competitor.description || `${competitor.category} competitor`,
                signalCount: competitor.signalCount || 0,
                watchlisted: competitor.watchlisted,
                markets: [],
            };
        });
    }

    /**
     * Search all indexes (full-app search)
     */
    searchAll(query: string, entities: Entity[] = [], limitPerType = 5, pulseSignals: PulseSignal[] = []): {
        people: PersonResult[];
        tools: ToolResult[];
        faqs: FAQResult[];
        resources: ResourceResult[];
        discussions: DiscussionResult[];
        lopSessions: LOPSessionResult[];
        pulseSignals: PulseSignalResult[];
        competitors: CompetitorResult[];
    } {
        return {
            people: this.searchPeople(query, entities, limitPerType),
            tools: this.searchTools(query, limitPerType),
            faqs: this.searchFAQs(query, limitPerType),
            resources: this.searchResources(query, entities, limitPerType),
            discussions: this.searchDiscussions(query, limitPerType),
            lopSessions: this.searchLopSessions(query, entities, limitPerType),
            pulseSignals: this.searchPulseSignals(query, pulseSignals, limitPerType),
            competitors: this.searchCompetitors(query, limitPerType),
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

export type AnySearchResult = PersonResult | ToolResult | FAQResult | ResourceResult | DiscussionResult | LOPSessionResult | PulseSignalResult | CompetitorResult;

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
        results.discussions.length +
        results.lopSessions.length +
        results.pulseSignals.length +
        results.competitors.length
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
        ...results.lopSessions,
        ...results.pulseSignals,
        ...results.competitors,
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
