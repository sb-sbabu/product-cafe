// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Search & Discovery Service
// Semantic search, advanced filtering, and related signals
// ═══════════════════════════════════════════════════════════════════════════

import type { PulseSignal, SignalDomain, SignalPriority, SignalEntities } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchQuery {
    text: string;
    filters: SearchFilters;
}

export interface SearchFilters {
    domains?: SignalDomain[];
    priorities?: SignalPriority[];
    sources?: string[];
    dateRange?: {
        start: Date | null;
        end: Date | null;
    };
    entities?: string[];
    isRead?: boolean | null;
    isBookmarked?: boolean | null;
}

export interface SavedSearch {
    id: string;
    name: string;
    query: SearchQuery;
    createdAt: Date;
    lastUsed: Date;
    resultCount?: number;
}

export interface SearchResult {
    signal: PulseSignal;
    score: number;
    highlights: SearchHighlight[];
}

export interface SearchHighlight {
    field: 'title' | 'summary' | 'entities';
    start: number;
    end: number;
    text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Flatten SignalEntities to string array
// ─────────────────────────────────────────────────────────────────────────────

function flattenEntities(entities: SignalEntities): string[] {
    const result: string[] = [];

    if (entities.companies) result.push(...entities.companies);
    if (entities.topics) result.push(...entities.topics);
    if (entities.products) result.push(...entities.products);
    if (entities.regulations) result.push(...entities.regulations);
    if (entities.people) {
        for (const person of entities.people) {
            result.push(person.name);
        }
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH SCORING WEIGHTS
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_WEIGHTS = {
    titleExact: 100,
    titlePartial: 50,
    summaryExact: 30,
    summaryPartial: 15,
    entityMatch: 40,
    recency: 10,
    priorityBoost: {
        critical: 25,
        high: 15,
        medium: 5,
        low: 0,
    } as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function searchSignals(
    signals: PulseSignal[],
    query: SearchQuery
): SearchResult[] {
    if (!query.text.trim() && !hasActiveFilters(query.filters)) {
        return signals.map(s => ({ signal: s, score: 0, highlights: [] }));
    }

    const searchTerms = tokenize(query.text);
    const results: SearchResult[] = [];

    for (const signal of signals) {
        if (!matchesFilters(signal, query.filters)) {
            continue;
        }

        const { score, highlights } = calculateScore(signal, searchTerms);

        if (score > 0 || !query.text.trim()) {
            results.push({ signal, score, highlights });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results;
}

function tokenize(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    return text
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length >= 2)
        .map(term => term.replace(/[^\w]/g, ''));
}

function hasActiveFilters(filters: SearchFilters): boolean {
    return Boolean(
        filters.domains?.length ||
        filters.priorities?.length ||
        filters.sources?.length ||
        filters.entities?.length ||
        filters.dateRange?.start ||
        filters.dateRange?.end ||
        filters.isRead !== null ||
        filters.isBookmarked !== null
    );
}

function matchesFilters(signal: PulseSignal, filters: SearchFilters): boolean {
    if (filters.domains?.length && !filters.domains.includes(signal.domain)) {
        return false;
    }

    if (filters.priorities?.length && !filters.priorities.includes(signal.priority)) {
        return false;
    }

    if (filters.sources?.length && !filters.sources.includes(signal.source.name)) {
        return false;
    }

    if (filters.entities?.length) {
        const signalEntities = flattenEntities(signal.entities).map(e => e.toLowerCase());
        const hasMatch = filters.entities.some(e =>
            signalEntities.includes(e.toLowerCase())
        );
        if (!hasMatch) return false;
    }

    if (filters.dateRange) {
        const signalDate = new Date(signal.publishedAt);
        if (filters.dateRange.start && signalDate < filters.dateRange.start) {
            return false;
        }
        if (filters.dateRange.end && signalDate > filters.dateRange.end) {
            return false;
        }
    }

    if (filters.isRead !== null && filters.isRead !== undefined) {
        if (signal.isRead !== filters.isRead) return false;
    }

    if (filters.isBookmarked !== null && filters.isBookmarked !== undefined) {
        if (signal.isBookmarked !== filters.isBookmarked) return false;
    }

    return true;
}

function calculateScore(
    signal: PulseSignal,
    searchTerms: string[]
): { score: number; highlights: SearchHighlight[] } {
    if (searchTerms.length === 0) {
        return { score: 0, highlights: [] };
    }

    let score = 0;
    const highlights: SearchHighlight[] = [];
    const title = signal.title.toLowerCase();
    const summary = signal.summary.toLowerCase();
    const entities = flattenEntities(signal.entities).map(e => e.toLowerCase());

    for (const term of searchTerms) {
        if (title.includes(term)) {
            const isExact = title.split(/\s+/).includes(term);
            score += isExact ? SCORE_WEIGHTS.titleExact : SCORE_WEIGHTS.titlePartial;

            const idx = title.indexOf(term);
            if (idx !== -1) {
                highlights.push({
                    field: 'title',
                    start: idx,
                    end: idx + term.length,
                    text: signal.title.substring(idx, idx + term.length),
                });
            }
        }

        if (summary.includes(term)) {
            const isExact = summary.split(/\s+/).includes(term);
            score += isExact ? SCORE_WEIGHTS.summaryExact : SCORE_WEIGHTS.summaryPartial;

            const idx = summary.indexOf(term);
            if (idx !== -1) {
                highlights.push({
                    field: 'summary',
                    start: idx,
                    end: idx + term.length,
                    text: signal.summary.substring(idx, idx + term.length),
                });
            }
        }

        for (const entity of entities) {
            if (entity.includes(term)) {
                score += SCORE_WEIGHTS.entityMatch;
                highlights.push({
                    field: 'entities',
                    start: 0,
                    end: entity.length,
                    text: entity,
                });
            }
        }
    }

    score += SCORE_WEIGHTS.priorityBoost[signal.priority] || 0;

    const daysSincePublished = Math.floor(
        (Date.now() - new Date(signal.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyBoost = Math.max(0, (30 - daysSincePublished)) * (SCORE_WEIGHTS.recency / 30);
    score += recencyBoost;

    return { score, highlights };
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATED SIGNALS
// ─────────────────────────────────────────────────────────────────────────────

export function findRelatedSignals(
    signal: PulseSignal,
    allSignals: PulseSignal[],
    maxResults: number = 5
): PulseSignal[] {
    const targetEntities = new Set(flattenEntities(signal.entities).map(e => e.toLowerCase()));

    const scored = allSignals
        .filter(s => s.id !== signal.id)
        .map(s => {
            let relatedness = 0;

            if (s.domain === signal.domain) {
                relatedness += 20;
            }

            const signalEntities = flattenEntities(s.entities).map(e => e.toLowerCase());
            const overlap = signalEntities.filter(e => targetEntities.has(e)).length;
            relatedness += overlap * 30;

            if (s.source.name === signal.source.name) {
                relatedness += 10;
            }

            const daysDiff = Math.abs(
                (new Date(s.publishedAt).getTime() - new Date(signal.publishedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysDiff <= 7) {
                relatedness += 15 - (daysDiff * 2);
            }

            return { signal: s, score: relatedness };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

    return scored.map(r => r.signal);
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVED SEARCHES
// ─────────────────────────────────────────────────────────────────────────────

const SAVED_SEARCHES_KEY = 'pulse_saved_searches';

export function getSavedSearches(): SavedSearch[] {
    try {
        const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
        if (!stored) return [];

        const searches = JSON.parse(stored) as SavedSearch[];
        return searches.map(s => ({
            ...s,
            createdAt: new Date(s.createdAt),
            lastUsed: new Date(s.lastUsed),
        }));
    } catch {
        return [];
    }
}

export function saveSearch(name: string, query: SearchQuery): SavedSearch {
    const searches = getSavedSearches();

    const newSearch: SavedSearch = {
        id: `search_${Date.now()}`,
        name,
        query,
        createdAt: new Date(),
        lastUsed: new Date(),
    };

    searches.unshift(newSearch);

    if (searches.length > 20) {
        searches.pop();
    }

    try {
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
    } catch {
        searches.pop();
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
    }

    return newSearch;
}

export function deleteSavedSearch(id: string): void {
    const searches = getSavedSearches().filter(s => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export function extractAllEntities(signals: PulseSignal[]): string[] {
    const entitySet = new Set<string>();

    for (const signal of signals) {
        const flat = flattenEntities(signal.entities);
        for (const entity of flat) {
            entitySet.add(entity);
        }
    }

    return Array.from(entitySet).sort();
}

export function extractAllSources(signals: PulseSignal[]): string[] {
    const sourceSet = new Set<string>();

    for (const signal of signals) {
        sourceSet.add(signal.source.name);
    }

    return Array.from(sourceSet).sort();
}
