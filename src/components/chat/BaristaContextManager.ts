/**
 * BARISTA Context Manager
 * Handles multi-turn conversation context for natural follow-ups
 * 
 * Features:
 * - Tracks last intent and entities across turns
 * - Handles follow-up commands ("more", "another", "show me those")
 * - Resolves pronouns ("them", "it", "that")
 * - Auto-clears stale context after inactivity
 */

import type { Intent, IntentCategory } from './BaristaIntentEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ConversationContext {
    sessionId: string;
    lastIntent: Intent | null;
    lastEntities: Record<string, string>;
    recentTopics: string[];
    recentPeople: string[];
    turnCount: number;
    lastQueryTime: number;
    lastResultCount: number;
    offset: number;  // For pagination ("show more")
}

export interface FollowUpResult {
    isFollowUp: boolean;
    type: 'more' | 'another' | 'that' | 'them' | 'back' | 'none';
    modifiedIntent?: Intent;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONTEXT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RECENT_TOPICS = 5;
const MAX_RECENT_PEOPLE = 5;

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT STATE
// ═══════════════════════════════════════════════════════════════════════════

let context: ConversationContext = createFreshContext();

function createFreshContext(): ConversationContext {
    return {
        sessionId: `session-${Date.now()}`,
        lastIntent: null,
        lastEntities: {},
        recentTopics: [],
        recentPeople: [],
        turnCount: 0,
        lastQueryTime: 0,
        lastResultCount: 0,
        offset: 0,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// FOLLOW-UP PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

const FOLLOW_UP_PATTERNS = {
    more: [
        'more', 'show more', 'more please', 'next', 'keep going', 'continue',
        'what else', 'show me more', 'any more', 'more of those', 'more results'
    ],
    another: [
        'another', 'another one', 'one more', 'show another', 'different one',
        'something else', 'alternatives'
    ],
    that: [
        'tell me more about that', 'more about that', 'what about that',
        'explain that', 'details on that', 'info on that'
    ],
    them: [
        'tell me about them', 'more about them', 'who are they',
        'their profile', 'contact them', 'message them'
    ],
    back: [
        'go back', 'previous', 'back', 'undo', 'cancel', 'never mind', 'nevermind'
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if the context has expired and needs reset
 */
export const isContextStale = (): boolean => {
    return Date.now() - context.lastQueryTime > CONTEXT_TIMEOUT_MS;
};

/**
 * Get the current conversation context
 */
export const getContext = (): ConversationContext => {
    if (isContextStale()) {
        context = createFreshContext();
    }
    return { ...context };
};

/**
 * Update context after an intent is processed
 */
export const updateContext = (intent: Intent, resultCount: number = 0): void => {
    context.lastIntent = intent;
    context.lastEntities = { ...intent.entities };
    context.lastQueryTime = Date.now();
    context.turnCount++;
    context.lastResultCount = resultCount;
    context.offset = 0; // Reset pagination on new query

    // Track recent topics
    if (intent.entities.skill) {
        addToRecentList(context.recentTopics, intent.entities.skill, MAX_RECENT_TOPICS);
    }
    if (intent.entities.company) {
        addToRecentList(context.recentTopics, intent.entities.company, MAX_RECENT_TOPICS);
    }

    // Track recent people mentions
    if (intent.entities.person) {
        addToRecentList(context.recentPeople, intent.entities.person, MAX_RECENT_PEOPLE);
    }
};

/**
 * Check if a query is a follow-up and resolve it
 */
export const resolveFollowUp = (query: string, newIntent: Intent): FollowUpResult => {
    const lowerQuery = query.toLowerCase().trim();

    // Check if context is stale
    if (isContextStale() || !context.lastIntent) {
        return { isFollowUp: false, type: 'none' };
    }

    // Check for "more" follow-up (pagination)
    if (FOLLOW_UP_PATTERNS.more.some(p => lowerQuery === p || lowerQuery.startsWith(p))) {
        return handleMoreFollowUp();
    }

    // Check for "another" follow-up (alternative)
    if (FOLLOW_UP_PATTERNS.another.some(p => lowerQuery.includes(p))) {
        return handleAnotherFollowUp();
    }

    // Check for "that/them" pronoun resolution
    if (FOLLOW_UP_PATTERNS.that.some(p => lowerQuery.includes(p))) {
        return handleThatFollowUp(newIntent);
    }

    if (FOLLOW_UP_PATTERNS.them.some(p => lowerQuery.includes(p))) {
        return handleThemFollowUp(newIntent);
    }

    // Check for "back" command
    if (FOLLOW_UP_PATTERNS.back.some(p => lowerQuery === p)) {
        return { isFollowUp: true, type: 'back' };
    }

    // Not a follow-up
    return { isFollowUp: false, type: 'none' };
};

/**
 * Increment pagination offset for "show more"
 */
export const incrementOffset = (pageSize: number = 5): void => {
    context.offset += pageSize;
};

/**
 * Get current pagination offset
 */
export const getOffset = (): number => {
    return context.offset;
};

/**
 * Clear conversation context
 */
export const clearContext = (): void => {
    context = createFreshContext();
};

// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function addToRecentList(list: string[], item: string, maxSize: number): void {
    // Remove if already exists
    const index = list.indexOf(item);
    if (index > -1) {
        list.splice(index, 1);
    }
    // Add to front
    list.unshift(item);
    // Trim to max size
    if (list.length > maxSize) {
        list.pop();
    }
}

function handleMoreFollowUp(): FollowUpResult {
    if (!context.lastIntent) {
        return { isFollowUp: false, type: 'none' };
    }

    // Increment offset and reuse last intent
    incrementOffset(5);

    const modifiedIntent: Intent = {
        ...context.lastIntent,
        entities: {
            ...context.lastIntent.entities,
            offset: String(context.offset),
            isFollowUp: 'true',
        },
    };

    return {
        isFollowUp: true,
        type: 'more',
        modifiedIntent,
    };
}

function handleAnotherFollowUp(): FollowUpResult {
    if (!context.lastIntent) {
        return { isFollowUp: false, type: 'none' };
    }

    // Skip current result
    incrementOffset(1);

    const modifiedIntent: Intent = {
        ...context.lastIntent,
        entities: {
            ...context.lastIntent.entities,
            offset: String(context.offset),
            isFollowUp: 'true',
            requestType: 'another',
        },
    };

    return {
        isFollowUp: true,
        type: 'another',
        modifiedIntent,
    };
}

function handleThatFollowUp(newIntent: Intent): FollowUpResult {
    // "that" refers to the last topic/result
    const lastTopic = context.recentTopics[0];

    if (lastTopic) {
        const modifiedIntent: Intent = {
            ...newIntent,
            entities: {
                ...newIntent.entities,
                topic: lastTopic,
                resolvedFrom: 'that',
            },
        };
        return { isFollowUp: true, type: 'that', modifiedIntent };
    }

    return { isFollowUp: false, type: 'none' };
}

function handleThemFollowUp(newIntent: Intent): FollowUpResult {
    // "them" refers to a person from context
    const lastPerson = context.recentPeople[0];

    if (lastPerson) {
        const modifiedIntent: Intent = {
            ...newIntent,
            category: 'expert' as IntentCategory,
            action: 'profile',
            entities: {
                ...newIntent.entities,
                person: lastPerson,
                resolvedFrom: 'them',
            },
        };
        return { isFollowUp: true, type: 'them', modifiedIntent };
    }

    // Fall back to last expert search
    if (context.lastIntent?.category === 'expert') {
        return {
            isFollowUp: true,
            type: 'them',
            modifiedIntent: context.lastIntent,
        };
    }

    return { isFollowUp: false, type: 'none' };
}
