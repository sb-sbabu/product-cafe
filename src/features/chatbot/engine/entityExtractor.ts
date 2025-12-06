/**
 * DETERMINISTIC ENTITY EXTRACTOR
 * Extracts structured entities from user input
 */

import type { ExtractedEntity } from '../../../types';
import { containsAny, phraseMatch } from './preprocessor';

// Entity dictionaries
export const entityDictionaries: Record<string, { values: string[]; synonyms: Record<string, string[]> }> = {
    tool: {
        values: ['jira', 'confluence', 'smartsheet', 'servicenow', 'sharepoint', 'teams', 'slack', 'figma', 'miro'],
        synonyms: {
            jira: ['atlassian', 'issue tracker', 'ticket system'],
            confluence: ['wiki', 'knowledge base'],
            smartsheet: ['sheets', 'project sheets'],
            servicenow: ['snow', 'service now', 'it portal'],
            sharepoint: ['sp', 'share point'],
            teams: ['ms teams', 'microsoft teams'],
        },
    },
    pillar: {
        values: ['product-craft', 'healthcare', 'internal-playbook', 'tools-access'],
        synonyms: {
            'product-craft': ['product craft', 'pm skills', 'product management'],
            healthcare: ['healthcare', 'industry', 'rcm', 'medical', 'clinical'],
            'internal-playbook': ['internal', 'playbook', 'how we work', 'processes'],
            'tools-access': ['tools', 'access', 'software'],
        },
    },
    contentType: {
        values: ['template', 'guide', 'video', 'doc', 'learning-path'],
        synonyms: {
            template: ['form', 'format'],
            guide: ['tutorial', 'how-to', 'instructions'],
            'learning-path': ['course', 'learning', 'training'],
        },
    },
    templateType: {
        values: ['prd', 'one-pager', 'okr', 'roadmap', 'user-story', 'business-case', 'postmortem'],
        synonyms: {
            prd: ['product requirements', 'requirements doc', 'spec', 'specification'],
            'one-pager': ['one pager', '1-pager', 'brief', 'summary'],
            'user-story': ['user story', 'story', 'stories'],
            okr: ['okrs', 'objectives', 'key results'],
        },
    },
    topic: {
        values: ['release', 'onboarding', 'cob', 'claims', 'access', 'roadmap'],
        synonyms: {
            release: ['deploy', 'deployment', 'go live', 'launch'],
            onboarding: ['new hire', 'getting started', 'new here', 'starting'],
            cob: ['coordination of benefits', 'multiple coverage', 'primary secondary'],
            claims: ['claim', 'adjudication', 'billing'],
            access: ['permission', 'login', 'permissions'],
        },
    },
};

/**
 * Extract entities from tokens
 */
export function extractEntities(
    _tokens: string[],
    expandedTokens: string[],
    originalInput: string
): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lowerInput = originalInput.toLowerCase();

    for (const [entityType, dictionary] of Object.entries(entityDictionaries)) {
        // Check direct value matches
        for (const value of dictionary.values) {
            if (containsAny(expandedTokens, [value]) || phraseMatch(lowerInput, value)) {
                entities.push({
                    name: entityType,
                    value,
                    confidence: 1.0,
                });
                break; // One match per entity type
            }

            // Check synonym matches
            const synonyms = dictionary.synonyms[value];
            if (synonyms) {
                for (const synonym of synonyms) {
                    if (phraseMatch(lowerInput, synonym) || containsAny(expandedTokens, [synonym])) {
                        entities.push({
                            name: entityType,
                            value, // Normalize to canonical value
                            confidence: 0.9,
                        });
                        break;
                    }
                }
            }
        }
    }

    return entities;
}

/**
 * Get entity value by name
 */
export function getEntityValue(entities: ExtractedEntity[], name: string): string | undefined {
    const entity = entities.find(e => e.name === name);
    return entity?.value;
}

/**
 * Check if entity is present
 */
export function hasEntity(entities: ExtractedEntity[], name: string): boolean {
    return entities.some(e => e.name === name);
}
