/**
 * Café Finder: Entity Extractor
 * Named Entity Recognition for tools, people, topics, teams, etc.
 */

import type { Entity, EntityType } from './types';
import {
    TOOL_SYNONYMS,
    TOPIC_SYNONYMS,
    TEAM_SYNONYMS,
    TEAM_SYNONYMS,
    // getCanonical,
} from './synonyms';
import { normalizeToken } from './queryProcessor';

// ============================================
// ENTITY DICTIONARIES
// ============================================

/**
 * Known tool names and aliases
 */
const TOOL_ENTITIES: Record<string, string> = {};
Object.keys(TOOL_SYNONYMS).forEach(tool => {
    TOOL_ENTITIES[tool] = tool;
    TOOL_SYNONYMS[tool].forEach(alias => {
        TOOL_ENTITIES[alias.toLowerCase()] = tool;
    });
});

/**
 * Known topic names and aliases
 */
const TOPIC_ENTITIES: Record<string, string> = {};
Object.keys(TOPIC_SYNONYMS).forEach(topic => {
    TOPIC_ENTITIES[topic] = topic;
    TOPIC_SYNONYMS[topic].forEach(alias => {
        TOPIC_ENTITIES[alias.toLowerCase()] = topic;
    });
});

/**
 * Known team names and aliases
 */
const TEAM_ENTITIES: Record<string, string> = {};
Object.keys(TEAM_SYNONYMS).forEach(team => {
    TEAM_ENTITIES[team] = team;
    TEAM_SYNONYMS[team].forEach(alias => {
        TEAM_ENTITIES[alias.toLowerCase()] = team;
    });
});

/**
 * Resource type keywords
 */
const RESOURCE_TYPE_KEYWORDS: Record<string, string> = {
    template: 'template',
    templates: 'template',
    guide: 'guide',
    guides: 'guide',
    document: 'document',
    documents: 'document',
    doc: 'document',
    docs: 'document',
    faq: 'faq',
    faqs: 'faq',
    video: 'video',
    videos: 'video',
    presentation: 'presentation',
    presentations: 'presentation',
    slides: 'presentation',
    deck: 'presentation',
    checklist: 'checklist',
    checklists: 'checklist',
    playbook: 'playbook',
    playbooks: 'playbook',
    runbook: 'playbook',
};

/**
 * Action keywords
 */
const ACTION_KEYWORDS: Record<string, string> = {
    access: 'access',
    request: 'request',
    find: 'find',
    search: 'find',
    get: 'get',
    learn: 'learn',
    understand: 'learn',
    contact: 'contact',
    message: 'contact',
    email: 'contact',
    create: 'create',
    new: 'create',
    add: 'create',
    update: 'update',
    edit: 'update',
    modify: 'update',
    delete: 'delete',
    remove: 'delete',
    approve: 'approve',
    review: 'review',
};

/**
 * Pillar keywords
 */
const PILLAR_KEYWORDS: Record<string, string> = {
    'product craft': 'product-craft',
    'product-craft': 'product-craft',
    craft: 'product-craft',
    healthcare: 'healthcare-domain',
    'healthcare domain': 'healthcare-domain',
    'healthcare-domain': 'healthcare-domain',
    domain: 'healthcare-domain',
    playbook: 'internal-playbook',
    'internal playbook': 'internal-playbook',
    'internal-playbook': 'internal-playbook',
    internal: 'internal-playbook',
};

// ============================================
// ENTITY EXTRACTION
// ============================================

interface ExtractionResult {
    entity: Entity;
    matchedText: string;
}

/**
 * Try to extract a single entity from a token
 */
function extractFromToken(
    token: string,
    position: { start: number; end: number }
): ExtractionResult | null {
    const normalized = normalizeToken(token);
    if (!normalized) return null;

    // Check tools
    if (TOOL_ENTITIES[normalized]) {
        return {
            entity: {
                type: 'TOOL',
                value: token,
                normalizedValue: TOOL_ENTITIES[normalized],
                confidence: 0.95,
                position,
            },
            matchedText: token,
        };
    }

    // Check topics
    if (TOPIC_ENTITIES[normalized]) {
        return {
            entity: {
                type: 'TOPIC',
                value: token,
                normalizedValue: TOPIC_ENTITIES[normalized],
                confidence: 0.90,
                position,
            },
            matchedText: token,
        };
    }

    // Check teams
    if (TEAM_ENTITIES[normalized]) {
        return {
            entity: {
                type: 'TEAM',
                value: token,
                normalizedValue: TEAM_ENTITIES[normalized],
                confidence: 0.85,
                position,
            },
            matchedText: token,
        };
    }

    // Check resource types
    if (RESOURCE_TYPE_KEYWORDS[normalized]) {
        return {
            entity: {
                type: 'RESOURCE_TYPE',
                value: token,
                normalizedValue: RESOURCE_TYPE_KEYWORDS[normalized],
                confidence: 0.90,
                position,
            },
            matchedText: token,
        };
    }

    // Check actions
    if (ACTION_KEYWORDS[normalized]) {
        return {
            entity: {
                type: 'ACTION',
                value: token,
                normalizedValue: ACTION_KEYWORDS[normalized],
                confidence: 0.85,
                position,
            },
            matchedText: token,
        };
    }

    // Check pillars
    if (PILLAR_KEYWORDS[normalized]) {
        return {
            entity: {
                type: 'PILLAR',
                value: token,
                normalizedValue: PILLAR_KEYWORDS[normalized],
                confidence: 0.90,
                position,
            },
            matchedText: token,
        };
    }

    return null;
}

/**
 * Try to extract multi-word entities (e.g., "product craft")
 */
function extractMultiWordEntities(
    query: string,
    _existingPositions: Set<number>
): ExtractionResult[] {
    const results: ExtractionResult[] = [];
    const normalized = query.toLowerCase();

    // Check multi-word tools
    for (const tool of Object.keys(TOOL_SYNONYMS)) {
        for (const alias of [tool, ...TOOL_SYNONYMS[tool]]) {
            const aliasLower = alias.toLowerCase();
            if (aliasLower.includes(' ')) {
                const index = normalized.indexOf(aliasLower);
                if (index !== -1) {
                    results.push({
                        entity: {
                            type: 'TOOL',
                            value: alias,
                            normalizedValue: tool,
                            confidence: 0.95,
                            position: { start: index, end: index + alias.length },
                        },
                        matchedText: alias,
                    });
                }
            }
        }
    }

    // Check multi-word topics
    for (const topic of Object.keys(TOPIC_SYNONYMS)) {
        for (const alias of [topic, ...TOPIC_SYNONYMS[topic]]) {
            const aliasLower = alias.toLowerCase();
            if (aliasLower.includes(' ')) {
                const index = normalized.indexOf(aliasLower);
                if (index !== -1) {
                    results.push({
                        entity: {
                            type: 'TOPIC',
                            value: alias,
                            normalizedValue: topic,
                            confidence: 0.90,
                            position: { start: index, end: index + alias.length },
                        },
                        matchedText: alias,
                    });
                }
            }
        }
    }

    // Check multi-word pillars
    for (const [phrase, pillar] of Object.entries(PILLAR_KEYWORDS)) {
        if (phrase.includes(' ')) {
            const index = normalized.indexOf(phrase);
            if (index !== -1) {
                results.push({
                    entity: {
                        type: 'PILLAR',
                        value: phrase,
                        normalizedValue: pillar,
                        confidence: 0.90,
                        position: { start: index, end: index + phrase.length },
                    },
                    matchedText: phrase,
                });
            }
        }
    }

    return results;
}

/**
 * Detect potential person names (capitalized 2-3 word sequences)
 */
function extractPersonNames(query: string): ExtractionResult[] {
    const results: ExtractionResult[] = [];

    // Match capitalized word sequences (2-3 words)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g;
    let match;

    while ((match = namePattern.exec(query)) !== null) {
        const name = match[1];
        // Filter out common false positives
        const falsePositives = ['How', 'What', 'When', 'Where', 'Why', 'Which', 'The', 'This', 'That'];
        if (!falsePositives.includes(name.split(' ')[0])) {
            results.push({
                entity: {
                    type: 'PERSON',
                    value: name,
                    normalizedValue: name.toLowerCase(),
                    confidence: 0.70, // Lower confidence since we're guessing
                    position: { start: match.index, end: match.index + name.length },
                },
                matchedText: name,
            });
        }
    }

    return results;
}

/**
 * Detect date/time expressions
 */
function extractTemporalEntities(query: string): ExtractionResult[] {
    const results: ExtractionResult[] = [];
    const normalized = query.toLowerCase();

    // Helper to add days to today
    const addDays = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString();
    };

    // Helper to get matching range
    const getRange = (start: Date, end: Date) => {
        return `${start.toISOString()}/${end.toISOString()}`;
    };

    // 1. Relative days
    const relativePatterns = [
        { pattern: /\btoday\b/g, value: addDays(0), type: 'DATE' },
        { pattern: /\btomorrow\b/g, value: addDays(1), type: 'DATE' },
        { pattern: /\bz\b/g, value: addDays(-1), type: 'DATE' } // 'yesterday' matches 'yesterday'
    ];

    // Explicit fix for "yesterday" manually since 'z' was placeholder
    if (normalized.includes('yesterday')) {
        const index = normalized.indexOf('yesterday');
        results.push({
            entity: {
                type: 'DATE',
                value: 'yesterday',
                normalizedValue: addDays(-1),
                confidence: 0.95,
                position: { start: index, end: index + 9 }
            },
            matchedText: 'yesterday'
        });
    }

    relativePatterns.forEach(({ pattern, value, type }) => {
        let match;
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        while ((match = pattern.exec(normalized)) !== null) {
            // Skip placeholders
            if (pattern.source === '\\bz\\b') continue;

            results.push({
                entity: {
                    type: type as any,
                    value: match[0],
                    normalizedValue: value,
                    confidence: 0.95,
                    position: { start: match.index, end: match.index + match[0].length }
                },
                matchedText: match[0]
            });
        }
    });

    // 2. "Next" expressions
    const nextPattern = /\b(next|upcoming|future)\s+(\w+)\b/g;
    let nextMatch;
    while ((nextMatch = nextPattern.exec(normalized)) !== null) {
        const fullPhrase = nextMatch[0];
        const target = nextMatch[2]?.toLowerCase();

        let rangeValue = 'future'; // Default

        if (target === 'week') {
            const d = new Date();
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 7; // Next Monday
            const nextMon = new Date(d.setDate(diff));
            const nextSun = new Date(d.setDate(nextMon.getDate() + 6));
            rangeValue = getRange(nextMon, nextSun);
        } else if (target === 'month') {
            const d = new Date();
            const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const endNextMonth = new Date(d.getFullYear(), d.getMonth() + 2, 0);
            rangeValue = getRange(nextMonth, endNextMonth);
        } else if (['lop', 'session', 'meeting'].includes(target)) {
            rangeValue = 'next_occurrence';
        }

        results.push({
            entity: {
                type: 'TIME_RANGE',
                value: fullPhrase,
                normalizedValue: rangeValue,
                confidence: 0.90,
                position: { start: nextMatch.index, end: nextMatch.index + fullPhrase.length }
            },
            matchedText: fullPhrase
        });
    }

    // 3. Quarters (Q1, Q2, Q3, Q4)
    const quarterPattern = /\b(q[1-4])\b/g;
    let qMatch;
    while ((qMatch = quarterPattern.exec(normalized)) !== null) {
        const quarter = qMatch[1];
        const year = new Date().getFullYear();
        let startMonth = 0;

        if (quarter === 'q2') startMonth = 3;
        if (quarter === 'q3') startMonth = 6;
        if (quarter === 'q4') startMonth = 9;

        const start = new Date(year, startMonth, 1);
        const end = new Date(year, startMonth + 3, 0);

        results.push({
            entity: {
                type: 'TIME_RANGE',
                value: quarter.toUpperCase(),
                normalizedValue: getRange(start, end),
                confidence: 0.95,
                position: { start: qMatch.index, end: qMatch.index + qMatch[0].length }
            },
            matchedText: qMatch[0]
        });
    }

    return results;
}

/**
 * Main entity extraction function
 */
export function extractEntities(query: string, tokens: string[]): Entity[] {
    const entities: Entity[] = [];
    const usedPositions = new Set<number>();

    // 1. Extract multi-word entities first (higher priority)
    const multiWordResults = extractMultiWordEntities(query, usedPositions);
    for (const result of multiWordResults) {
        entities.push(result.entity);
        for (let i = result.entity.position.start; i < result.entity.position.end; i++) {
            usedPositions.add(i);
        }
    }

    // 2. Extract single-token entities
    let currentPos = 0;
    for (const token of tokens) {
        const tokenStart = query.toLowerCase().indexOf(token.toLowerCase(), currentPos);
        if (tokenStart !== -1) {
            // Skip if position already used by multi-word entity
            if (!usedPositions.has(tokenStart)) {
                const result = extractFromToken(token, {
                    start: tokenStart,
                    end: tokenStart + token.length,
                });
                if (result) {
                    entities.push(result.entity);
                }
            }
            currentPos = tokenStart + token.length;
        }
    }

    // 3. Extract temporal entities
    const temporalResults = extractTemporalEntities(query);
    for (const result of temporalResults) {
        // Only add if no overlap
        const hasOverlap = entities.some(e =>
            (result.entity.position.start >= e.position.start && result.entity.position.start < e.position.end) ||
            (result.entity.position.end > e.position.start && result.entity.position.end <= e.position.end)
        );
        if (!hasOverlap) {
            entities.push(result.entity);
            // Mark positions as used
            for (let i = result.entity.position.start; i < result.entity.position.end; i++) {
                usedPositions.add(i);
            }
        }
    }

    // 4. Extract potential person names
    const nameResults = extractPersonNames(query);
    for (const result of nameResults) {
        // Only add if no overlap with existing entities
        const hasOverlap = entities.some(e =>
            (result.entity.position.start >= e.position.start && result.entity.position.start < e.position.end) ||
            (result.entity.position.end > e.position.start && result.entity.position.end <= e.position.end)
        );
        if (!hasOverlap) {
            entities.push(result.entity);
        }
    }

    // const existingPositions = entities.map(e => ({ start: e.position.start, end: e.position.end }));

    // Sort by position
    entities.sort((a, b) => a.position.start - b.position.start);

    return entities;
}

/**
 * Get entities of a specific type
 */
export function getEntitiesByType(entities: Entity[], type: EntityType): Entity[] {
    return entities.filter(e => e.type === type);
}

/**
 * Check if query contains entity of type
 */
export function hasEntityType(entities: Entity[], type: EntityType): boolean {
    return entities.some(e => e.type === type);
}

/**
 * Get the highest confidence entity of a type
 */
export function getBestEntity(entities: Entity[], type: EntityType): Entity | null {
    const matching = getEntitiesByType(entities, type);
    if (matching.length === 0) return null;
    return matching.reduce((best, e) => e.confidence > best.confidence ? e : best);
}
