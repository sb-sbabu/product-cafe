/**
 * Café Finder: The Answer Engine
 * Core type definitions for the search system
 */

// ============================================
// QUERY TYPES
// ============================================

/**
 * Represents a user's search query after processing
 */
export interface SearchQuery {
    /** Original raw query string */
    raw: string;
    /** Normalized query (lowercased, trimmed) */
    normalized: string;
    /** Individual tokens from the query */
    tokens: string[];
    /** Expanded tokens with synonyms */
    expandedTokens: string[];
    /** Detected entities in the query */
    entities: Entity[];
    /** Classified intent */
    intent: IntentResult;
    /** Current page context for boosting */
    context?: SearchContext;
}

/**
 * Context from the current page (for context-aware boosting)
 */
export interface SearchContext {
    currentPage: 'home' | 'library' | 'community' | 'grab-and-go' | 'my-cafe' | string;
    currentResourceId?: string;
    currentTopics?: string[];
}

// ============================================
// INTENT TYPES
// ============================================

/**
 * All possible search intents
 */
export type IntentType =
    // Find intents (seeking information)
    | 'FIND_PERSON'
    | 'FIND_TOOL'
    | 'FIND_RESOURCE'
    | 'FIND_FAQ'
    | 'FIND_TEAM'
    // Action intents (wanting to do something)
    | 'TOOL_ACCESS'
    | 'START_DISCUSSION'
    | 'CONTACT_EXPERT'
    | 'NAVIGATE'
    // Learn intents (wanting to understand)
    | 'EXPLAIN_CONCEPT'
    | 'LEARN_PROCESS'
    | 'COMPARE'
    // LOP intents
    | 'LOP_NEXT'
    | 'LOP_FIND'
    | 'LOP_SPEAKER'
    // Meta intents
    | 'BROWSE'
    | 'RECENT'
    | 'POPULAR'
    // Fallback
    | 'GENERAL_SEARCH';

/**
 * Query type classification
 */
export type QueryType =
    | 'QUESTION'      // "how do I", "what is"
    | 'COMMAND'       // "show me", "open"
    | 'KEYWORD'       // Just keywords
    | 'NAME'          // Appears to be a name
    | 'PHRASE';       // Natural language phrase

/**
 * Expected result type based on intent
 */
export type ExpectedResultType =
    | 'DIRECT_ANSWER'      // FAQ-style answer
    | 'ACTIONABLE_ANSWER'  // Steps + CTA
    | 'ENTITY_CARD'        // Person/Tool card
    | 'RESOURCE_LIST'      // List of resources
    | 'NAVIGATION'         // Page navigation
    | 'MIXED';             // Various types

/**
 * Result of intent classification
 */
export interface IntentResult {
    /** Primary detected intent */
    primary: IntentType;
    /** Confidence score (0-1) */
    confidence: number;
    /** Secondary possible intents */
    secondary: Array<{ intent: IntentType; confidence: number }>;
    /** Type of query */
    queryType: QueryType;
    /** Expected result type */
    expectedResult: ExpectedResultType;
}

// ============================================
// ENTITY TYPES
// ============================================

/**
 * Types of entities we can extract
 */
export type EntityType =
    | 'TOOL'
    | 'PERSON'
    | 'TOPIC'
    | 'TEAM'
    | 'RESOURCE_TYPE'
    | 'ACTION'
    | 'PILLAR'
    | 'TAG'
    | 'DATE'
    | 'TIME_RANGE';

/**
 * An extracted entity from the query
 */
export interface Entity {
    /** Type of entity */
    type: EntityType;
    /** Extracted value */
    value: string;
    /** Normalized/canonical value */
    normalizedValue: string;
    /** Confidence score (0-1) */
    confidence: number;
    /** Position in original query */
    position: { start: number; end: number };
}

// ============================================
// SEARCH RESULT TYPES
// ============================================

/**
 * Base interface for all search results
 */
export interface BaseSearchResult {
    /** Unique identifier */
    id: string;
    /** Type of result */
    type: SearchResultType;
    /** Relevance score (0-1) */
    score: number;
    /** Individual score components for debugging */
    scoreBreakdown?: ScoreBreakdown;
    /** Matched terms for highlighting */
    matchedTerms: string[];
}

export type SearchResultType =
    | 'person'
    | 'tool'
    | 'faq'
    | 'resource'
    | 'discussion'
    | 'lop_session'
    | 'pulse_signal'
    | 'competitor';

/**
 * Score breakdown for transparency
 */
export interface ScoreBreakdown {
    intentMatch: number;
    semanticScore: number;
    keywordScore: number;
    freshness: number;
    popularity: number;
    contextBoost: number;
}

/**
 * Person search result
 */
export interface PersonResult extends BaseSearchResult {
    type: 'person';
    name: string;
    email: string;
    title: string;
    team: string;
    location: string;
    avatarUrl: string;
    expertiseAreas: string[];
    points: number;
    badgeCount: number;
    teamsDeepLink?: string;
    slackHandle?: string;
}

/**
 * Tool search result
 */
export interface ToolResult extends BaseSearchResult {
    type: 'tool';
    name: string;
    description: string;
    category: string;
    accessUrl: string;
    requestUrl?: string;
    guideUrl?: string;
    status: 'available' | 'limited' | 'unavailable' | 'coming_soon';
    turnaround?: string;
}

/**
 * FAQ search result
 */
export interface FAQResult extends BaseSearchResult {
    type: 'faq';
    question: string;
    answer: string;
    answerSummary: string;
    category: string;
    tags: string[];
    viewCount: number;
    helpfulCount: number;
    expertId?: string;
    relatedResourceIds?: string[];
}

/**
 * Resource search result
 */
export interface ResourceResult extends BaseSearchResult {
    type: 'resource';
    title: string;
    description: string;
    url: string;
    pillar: string;
    category: string;
    resourceType: string;
    tags: string[];
    authorId?: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Discussion search result
 */
export interface DiscussionResult extends BaseSearchResult {
    type: 'discussion';
    title: string;
    bodyPreview: string;
    authorName: string;
    authorId: string;
    status: 'open' | 'resolved' | 'stale';
    replyCount: number;
    upvoteCount: number;
    hasAcceptedAnswer: boolean;
    createdAt: string;
    tags: string[];
}

/**
 * LOP Session search result
 */
export interface LOPSessionResult extends BaseSearchResult {
    type: 'lop_session';
    sessionNumber: number;
    title: string;
    description: string;
    speakerName: string;
    speakerId: string;
    sessionDate: string;
    duration: string;
    topics: string[];
    videoUrl?: string;
    slidesUrl?: string;
    notesUrl?: string;
    thumbnailUrl?: string;
}

/**
 * Pulse Signal search result
 */
export interface PulseSignalResult extends BaseSearchResult {
    type: 'pulse_signal';
    title: string;
    summary: string;
    domain: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    source: string;
    publishedAt: string;
    companies: string[];
    isRead: boolean;
}

/**
 * Competitor search result
 */
export interface CompetitorResult extends BaseSearchResult {
    type: 'competitor';
    name: string;
    category: string;
    tier: 1 | 2 | 3;
    description: string;
    signalCount: number;
    watchlisted: boolean;
    markets: string[];
}

/**
 * Union type of all possible search results
 */
export type SearchResult =
    | PersonResult
    | ToolResult
    | FAQResult
    | ResourceResult
    | DiscussionResult
    | LOPSessionResult
    | PulseSignalResult
    | CompetitorResult;

// ============================================
// ANSWER TYPES
// ============================================

/**
 * Types of answers we can generate
 */
export type AnswerType =
    | 'INSTANT_ANSWER'
    | 'PERSON_CARD'
    | 'TOOL_CARD'
    | 'CONCEPT_EXPLANATION'
    | 'RESOURCE_LIST'
    | 'LOP_SESSION'
    | 'NO_DIRECT_ANSWER'
    | 'ZERO_RESULTS';

/**
 * An action button in an answer
 */
export interface AnswerAction {
    label: string;
    url: string;
    icon?: string;
    primary: boolean;
}

/**
 * A source citation
 */
export interface AnswerSource {
    title: string;
    url: string;
    type: SearchResultType;
}

/**
 * The synthesized answer to display
 */
export interface SynthesizedAnswer {
    /** Type of answer template used */
    type: AnswerType;
    /** Confidence in this answer (0-1) */
    confidence: number;
    /** Main answer text (for INSTANT_ANSWER) */
    text?: string;
    /** Highlighted terms in text */
    highlightTerms?: string[];
    /** Steps if applicable */
    steps?: string[];
    /** Key points if applicable */
    keyPoints?: string[];
    /** Action buttons */
    actions: AnswerAction[];
    /** Source citations */
    sources: AnswerSource[];
    /** Featured result (person/tool card) */
    featuredResult?: SearchResult;
}

// ============================================
// SEARCH RESPONSE
// ============================================

/**
 * Complete search response
 */
export interface SearchResponse {
    /** Original query */
    query: SearchQuery;
    /** Synthesized answer (if applicable) */
    answer?: SynthesizedAnswer;
    /** All search results, grouped by type */
    results: {
        people: PersonResult[];
        tools: ToolResult[];
        faqs: FAQResult[];
        resources: ResourceResult[];
        discussions: DiscussionResult[];
        lopSessions: LOPSessionResult[];
    };
    /** Total result count */
    totalCount: number;
    /** Search performance metrics */
    metrics: SearchMetrics;
    /** Suggestions for query refinement */
    suggestions?: string[];
    /** Related queries */
    relatedQueries?: string[];
}

/**
 * Search performance metrics
 */
export interface SearchMetrics {
    /** Total time in milliseconds */
    totalTimeMs: number;
    /** Query processing time */
    queryProcessingMs: number;
    /** Search execution time */
    searchExecutionMs: number;
    /** Answer synthesis time */
    answerSynthesisMs: number;
    /** Timestamp */
    timestamp: string;
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Search configuration
 */
export interface SearchConfig {
    /** Maximum results per type */
    maxResultsPerType: number;
    /** Minimum score threshold */
    minScoreThreshold: number;
    /** Enable fuzzy matching */
    fuzzyMatching: boolean;
    /** Fuzzy threshold (0-1, lower = more fuzzy) */
    fuzzyThreshold: number;
    /** Enable synonym expansion */
    synonymExpansion: boolean;
    /** Enable answer synthesis */
    answerSynthesis: boolean;
    /** Score weights */
    weights: {
        intentMatch: number;
        semanticScore: number;
        keywordScore: number;
        freshness: number;
        popularity: number;
        contextBoost: number;
    };
}

/**
 * Default search configuration
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
    maxResultsPerType: 10,
    minScoreThreshold: 0.1,
    fuzzyMatching: true,
    fuzzyThreshold: 0.4,
    synonymExpansion: true,
    answerSynthesis: true,
    weights: {
        intentMatch: 0.35,
        semanticScore: 0.25,
        keywordScore: 0.15,
        freshness: 0.10,
        popularity: 0.10,
        contextBoost: 0.05,
    },
};
