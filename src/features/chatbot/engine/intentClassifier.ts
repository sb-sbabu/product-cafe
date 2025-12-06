/**
 * DETERMINISTIC INTENT CLASSIFIER
 * Pattern-based intent matching with scoring
 */

import type { Intent, IntentMatch, ExtractedEntity } from '../../../types';
import { containsAny, phraseMatch } from './preprocessor';
import { hasEntity } from './entityExtractor';

// Intent definitions with patterns
export const intents: Intent[] = [
    // Navigation Intents
    {
        id: 'nav-home',
        name: 'NAV_HOME',
        displayName: 'Navigate Home',
        patterns: [
            { type: 'phrase', value: 'go home', weight: 1.0 },
            { type: 'phrase', value: 'take me home', weight: 1.0 },
            { type: 'phrase', value: 'start over', weight: 0.9 },
            { type: 'keyword', value: 'home', weight: 0.7 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'nav-home',
        isActive: true,
        priority: 50,
    },
    {
        id: 'nav-grab-go',
        name: 'NAV_GRAB_GO',
        displayName: 'Navigate to Grab & Go',
        patterns: [
            { type: 'phrase', value: 'grab and go', weight: 1.0 },
            { type: 'phrase', value: 'grab & go', weight: 1.0 },
            { type: 'phrase', value: 'quick links', weight: 0.9 },
            { type: 'phrase', value: 'show grab', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'nav-grab-go',
        isActive: true,
        priority: 50,
    },
    {
        id: 'nav-library',
        name: 'NAV_LIBRARY',
        displayName: 'Navigate to Library',
        patterns: [
            { type: 'phrase', value: 'show library', weight: 1.0 },
            { type: 'phrase', value: 'learning resources', weight: 0.9 },
            { type: 'keyword', value: 'library', weight: 0.7 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'nav-library',
        isActive: true,
        priority: 50,
    },

    // Tool Access Intents
    {
        id: 'tool-access-request',
        name: 'TOOL_ACCESS_REQUEST',
        displayName: 'Request Tool Access',
        patterns: [
            { type: 'phrase', value: 'how do i get', weight: 0.8 },
            { type: 'phrase', value: 'need access to', weight: 0.9 },
            { type: 'phrase', value: 'request access', weight: 1.0 },
            { type: 'phrase', value: 'get access', weight: 0.8 },
            { type: 'keyword', value: 'access', weight: 0.5 },
        ],
        requiredEntities: ['tool'],
        optionalEntities: [],
        responseTemplateId: 'tool-access',
        clarificationFlow: [
            {
                question: 'Which tool do you need access to?',
                entityToCapture: 'tool',
                quickReplies: [
                    { id: 'jira', label: '🔧 Jira', value: 'jira' },
                    { id: 'confluence', label: '📝 Confluence', value: 'confluence' },
                    { id: 'smartsheet', label: '📊 Smartsheet', value: 'smartsheet' },
                    { id: 'other', label: '❓ Other', value: 'other tool' },
                ],
            },
        ],
        isActive: true,
        priority: 90,
    },
    {
        id: 'tool-find',
        name: 'TOOL_FIND',
        displayName: 'Find Tool',
        patterns: [
            { type: 'phrase', value: 'where is', weight: 0.8 },
            { type: 'phrase', value: 'link to', weight: 0.8 },
            { type: 'phrase', value: 'open', weight: 0.5 },
        ],
        requiredEntities: ['tool'],
        optionalEntities: [],
        responseTemplateId: 'tool-find',
        isActive: true,
        priority: 80,
    },

    // FAQ / How-To Intents
    {
        id: 'faq-how-to',
        name: 'FAQ_HOW_TO',
        displayName: 'How To Question',
        patterns: [
            { type: 'phrase', value: 'how do i', weight: 1.0 },
            { type: 'phrase', value: 'how can i', weight: 1.0 },
            { type: 'phrase', value: 'how to', weight: 0.9 },
            { type: 'phrase', value: 'what is the process', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: ['topic', 'tool'],
        responseTemplateId: 'faq-how-to',
        isActive: true,
        priority: 70,
    },
    {
        id: 'faq-what-is',
        name: 'FAQ_WHAT_IS',
        displayName: 'What Is Question',
        patterns: [
            { type: 'phrase', value: 'what is', weight: 1.0 },
            { type: 'phrase', value: 'what are', weight: 1.0 },
            { type: 'phrase', value: 'explain', weight: 0.8 },
            { type: 'phrase', value: 'tell me about', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: ['topic'],
        responseTemplateId: 'faq-what-is',
        isActive: true,
        priority: 65,
    },
    {
        id: 'faq-where-is',
        name: 'FAQ_WHERE_IS',
        displayName: 'Where Is Question',
        patterns: [
            { type: 'phrase', value: 'where is', weight: 1.0 },
            { type: 'phrase', value: 'where can i find', weight: 1.0 },
            { type: 'phrase', value: 'find the', weight: 0.7 },
            { type: 'phrase', value: 'locate', weight: 0.7 },
        ],
        requiredEntities: [],
        optionalEntities: ['templateType', 'contentType'],
        responseTemplateId: 'faq-where-is',
        isActive: true,
        priority: 75,
    },

    // Learning Intents
    {
        id: 'learn-topic',
        name: 'LEARN_TOPIC',
        displayName: 'Learn About Topic',
        patterns: [
            { type: 'phrase', value: 'teach me', weight: 1.0 },
            { type: 'phrase', value: 'learn about', weight: 1.0 },
            { type: 'phrase', value: 'i want to learn', weight: 0.9 },
            { type: 'phrase', value: 'understand', weight: 0.6 },
        ],
        requiredEntities: [],
        optionalEntities: ['pillar', 'topic'],
        responseTemplateId: 'learn-topic',
        isActive: true,
        priority: 60,
    },
    {
        id: 'onboarding-help',
        name: 'ONBOARDING_HELP',
        displayName: 'Onboarding Help',
        patterns: [
            { type: 'phrase', value: 'i am new', weight: 1.0 },
            { type: 'phrase', value: 'im new', weight: 1.0 },
            { type: 'phrase', value: "i'm new", weight: 1.0 },
            { type: 'phrase', value: 'new here', weight: 0.9 },
            { type: 'phrase', value: 'just started', weight: 0.8 },
            { type: 'phrase', value: 'onboarding', weight: 0.9 },
            { type: 'phrase', value: 'getting started', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'onboarding',
        isActive: true,
        priority: 85,
    },

    // People Intents
    {
        id: 'find-expert',
        name: 'FIND_EXPERT',
        displayName: 'Find Expert',
        patterns: [
            { type: 'phrase', value: 'who knows about', weight: 1.0 },
            { type: 'phrase', value: 'find someone who', weight: 0.9 },
            { type: 'phrase', value: 'who can help with', weight: 0.9 },
            { type: 'phrase', value: 'find expert', weight: 1.0 },
            { type: 'phrase', value: 'talk to someone', weight: 0.7 },
        ],
        requiredEntities: [],
        optionalEntities: ['topic', 'tool'],
        responseTemplateId: 'find-expert',
        isActive: true,
        priority: 70,
    },

    // Meta Intents
    {
        id: 'help',
        name: 'HELP',
        displayName: 'Help',
        patterns: [
            { type: 'keyword', value: 'help', weight: 0.8 },
            { type: 'phrase', value: 'what can you do', weight: 1.0 },
            { type: 'phrase', value: 'how does this work', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'help',
        isActive: true,
        priority: 40,
    },

    // Greeting Intent
    {
        id: 'greeting',
        name: 'GREETING',
        displayName: 'Greeting',
        patterns: [
            { type: 'phrase', value: 'hello', weight: 1.0 },
            { type: 'phrase', value: 'hi', weight: 1.0 },
            { type: 'phrase', value: 'hey', weight: 0.9 },
            { type: 'phrase', value: 'good morning', weight: 1.0 },
            { type: 'phrase', value: 'good afternoon', weight: 1.0 },
            { type: 'phrase', value: 'howdy', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'greeting',
        isActive: true,
        priority: 30,
    },

    // Thanks Intent
    {
        id: 'thanks',
        name: 'THANKS',
        displayName: 'Thanks',
        patterns: [
            { type: 'phrase', value: 'thank you', weight: 1.0 },
            { type: 'phrase', value: 'thanks', weight: 1.0 },
            { type: 'phrase', value: 'appreciate it', weight: 0.9 },
            { type: 'phrase', value: 'that helps', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'thanks',
        isActive: true,
        priority: 25,
    },

    // My Café Intent
    {
        id: 'nav-my-cafe',
        name: 'NAV_MY_CAFE',
        displayName: 'Navigate to My Café',
        patterns: [
            { type: 'phrase', value: 'my cafe', weight: 1.0 },
            { type: 'phrase', value: 'my favorites', weight: 1.0 },
            { type: 'phrase', value: 'show favorites', weight: 0.9 },
            { type: 'phrase', value: 'saved items', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'nav-my-cafe',
        isActive: true,
        priority: 50,
    },

    // Search Intent
    {
        id: 'search-query',
        name: 'SEARCH_QUERY',
        displayName: 'Search',
        patterns: [
            { type: 'phrase', value: 'search for', weight: 1.0 },
            { type: 'phrase', value: 'look for', weight: 0.9 },
            { type: 'phrase', value: 'find', weight: 0.6 },
        ],
        requiredEntities: [],
        optionalEntities: ['topic', 'tool'],
        responseTemplateId: 'search',
        isActive: true,
        priority: 55,
    },

    // Community Intent
    {
        id: 'nav-community',
        name: 'NAV_COMMUNITY',
        displayName: 'Navigate to Community',
        patterns: [
            { type: 'phrase', value: 'show community', weight: 1.0 },
            { type: 'phrase', value: 'people directory', weight: 0.9 },
            { type: 'phrase', value: 'find people', weight: 0.8 },
            { type: 'keyword', value: 'community', weight: 0.7 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'nav-community',
        isActive: true,
        priority: 50,
    },

    // Feedback Intent
    {
        id: 'feedback',
        name: 'FEEDBACK',
        displayName: 'Give Feedback',
        patterns: [
            { type: 'phrase', value: 'give feedback', weight: 1.0 },
            { type: 'phrase', value: 'report issue', weight: 0.9 },
            { type: 'phrase', value: 'report a bug', weight: 0.9 },
            { type: 'phrase', value: 'suggest improvement', weight: 0.9 },
            { type: 'phrase', value: 'feature request', weight: 0.8 },
            { type: 'keyword', value: 'feedback', weight: 0.7 },
            { type: 'keyword', value: 'broken', weight: 0.6 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'feedback',
        isActive: true,
        priority: 60,
    },

    // Settings Intent
    {
        id: 'settings',
        name: 'SETTINGS',
        displayName: 'Open Settings',
        patterns: [
            { type: 'phrase', value: 'open settings', weight: 1.0 },
            { type: 'phrase', value: 'my preferences', weight: 0.9 },
            { type: 'phrase', value: 'change settings', weight: 0.9 },
            { type: 'phrase', value: 'notifications', weight: 0.7 },
            { type: 'keyword', value: 'settings', weight: 0.7 },
            { type: 'keyword', value: 'preferences', weight: 0.6 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'settings',
        isActive: true,
        priority: 55,
    },

    // Tips Intent
    {
        id: 'tips',
        name: 'TIPS',
        displayName: 'Get Tips',
        patterns: [
            { type: 'phrase', value: 'give me a tip', weight: 1.0 },
            { type: 'phrase', value: 'pro tip', weight: 0.9 },
            { type: 'phrase', value: 'any tips', weight: 0.9 },
            { type: 'phrase', value: 'productivity tip', weight: 0.8 },
            { type: 'phrase', value: 'best practice', weight: 0.7 },
            { type: 'keyword', value: 'tips', weight: 0.6 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'tips',
        isActive: true,
        priority: 45,
    },

    // What's New Intent
    {
        id: 'whats-new',
        name: 'WHATS_NEW',
        displayName: "What's New",
        patterns: [
            { type: 'phrase', value: "what's new", weight: 1.0 },
            { type: 'phrase', value: 'whats new', weight: 1.0 },
            { type: 'phrase', value: 'new updates', weight: 0.9 },
            { type: 'phrase', value: 'recent changes', weight: 0.8 },
            { type: 'phrase', value: 'latest updates', weight: 0.8 },
            { type: 'keyword', value: 'updates', weight: 0.5 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'whats-new',
        isActive: true,
        priority: 55,
    },

    // Recent Activity Intent
    {
        id: 'recent-activity',
        name: 'RECENT_ACTIVITY',
        displayName: 'Recent Activity',
        patterns: [
            { type: 'phrase', value: 'my history', weight: 1.0 },
            { type: 'phrase', value: 'recent activity', weight: 1.0 },
            { type: 'phrase', value: 'what did i view', weight: 0.9 },
            { type: 'phrase', value: 'recently viewed', weight: 0.9 },
            { type: 'phrase', value: 'my recent', weight: 0.8 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'recent-activity',
        isActive: true,
        priority: 50,
    },

    // Keyboard Shortcuts Intent
    {
        id: 'shortcuts',
        name: 'SHORTCUTS',
        displayName: 'Keyboard Shortcuts',
        patterns: [
            { type: 'phrase', value: 'keyboard shortcuts', weight: 1.0 },
            { type: 'phrase', value: 'shortcut keys', weight: 0.9 },
            { type: 'phrase', value: 'hotkeys', weight: 0.9 },
            { type: 'phrase', value: 'key bindings', weight: 0.8 },
            { type: 'keyword', value: 'shortcuts', weight: 0.7 },
        ],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'shortcuts',
        isActive: true,
        priority: 45,
    },

    // Fallback
    {
        id: 'fallback',
        name: 'FALLBACK',
        displayName: 'Fallback',
        patterns: [],
        requiredEntities: [],
        optionalEntities: [],
        responseTemplateId: 'fallback',
        isActive: true,
        priority: 0,
    },
];

const INTENT_THRESHOLD = 0.5;

/**
 * Classify intent from preprocessed input
 */
export function classifyIntent(
    _tokens: string[],
    expandedTokens: string[],
    originalInput: string,
    entities: ExtractedEntity[]
): IntentMatch[] {
    const matches: IntentMatch[] = [];
    const lowerInput = originalInput.toLowerCase();

    for (const intent of intents.filter(i => i.isActive)) {
        let score = 0;
        const matchedPatterns: string[] = [];

        // Score patterns
        for (const pattern of intent.patterns) {
            let patternMatched = false;

            if (pattern.type === 'phrase') {
                if (phraseMatch(lowerInput, pattern.value)) {
                    patternMatched = true;
                }
            } else if (pattern.type === 'keyword') {
                if (containsAny(expandedTokens, [pattern.value])) {
                    patternMatched = true;
                }
            } else if (pattern.type === 'regex') {
                const regex = new RegExp(pattern.value, 'i');
                if (regex.test(originalInput)) {
                    patternMatched = true;
                }
            }

            if (patternMatched) {
                score += pattern.weight;
                matchedPatterns.push(pattern.value);
            }
        }

        // Boost score for entity matches
        for (const requiredEntity of intent.requiredEntities) {
            if (hasEntity(entities, requiredEntity)) {
                score += 0.3;
            }
        }

        // Normalize score (cap at 1.0)
        const normalizedScore = Math.min(score, 1.0);

        if (normalizedScore > 0 || intent.name === 'FALLBACK') {
            matches.push({
                intent,
                score: normalizedScore,
                matchedPatterns,
            });
        }
    }

    // Sort by score descending, then by priority
    matches.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.intent.priority - a.intent.priority;
    });

    return matches;
}

/**
 * Get best intent match
 */
export function getBestIntent(matches: IntentMatch[]): IntentMatch | null {
    if (matches.length === 0) return null;

    const best = matches[0];

    // Return fallback if best match is below threshold
    if (best.score < INTENT_THRESHOLD) {
        const fallback = matches.find(m => m.intent.name === 'FALLBACK');
        return fallback || null;
    }

    return best;
}

/**
 * Check if intent needs clarification
 */
export function needsClarification(intent: Intent, entities: ExtractedEntity[]): boolean {
    for (const required of intent.requiredEntities) {
        if (!hasEntity(entities, required)) {
            return true;
        }
    }
    return false;
}
