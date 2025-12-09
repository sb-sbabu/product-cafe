/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAB & GO — Smart Suggestion Engine
 * AI-powered personalized suggestions based on context
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { QUICK_ACTIONS, type QuickAction } from '../actions/quickActions';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SmartSuggestion {
    action: QuickAction;
    reason: string;
    priority: number; // 1-10, higher = more relevant
    contextType: 'time' | 'role' | 'recent' | 'seasonal' | 'trending';
}

export type UserRole = 'pm' | 'po' | 'leader' | 'new-hire' | 'all';

export interface SuggestionContext {
    currentHour: number;
    dayOfWeek: number; // 0 = Sunday
    userRole?: UserRole;
    recentActionIds?: string[];
    currentMonth?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME-BASED SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════

const getTimePeriod = (hour: number): 'morning' | 'midday' | 'afternoon' | 'evening' => {
    if (hour >= 6 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 18) return 'afternoon';
    return 'evening';
};

const TIME_SUGGESTIONS: Record<string, { actionIds: string[]; reason: string }> = {
    'morning': {
        actionIds: ['open-jira', 'view-roadmap', 'schedule-meeting'],
        reason: 'Good morning! Start your day with these',
    },
    'midday': {
        actionIds: ['new-prd', 'open-confluence', 'find-expert'],
        reason: 'Peak productivity time — dive into deep work',
    },
    'afternoon': {
        actionIds: ['open-analytics', 'search-faqs', 'book-room'],
        reason: 'Afternoon focus — review and plan',
    },
    'evening': {
        actionIds: ['view-roadmap', 'new-one-pager', 'healthcare-101'],
        reason: 'Wrapping up? Review or learn something new',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// DAY-OF-WEEK SUGGESTIONS
// ═══════════════════════════════════════════════════════────────────────────

const DAY_SUGGESTIONS: Record<number, { actionIds: string[]; reason: string }> = {
    1: { // Monday
        actionIds: ['view-roadmap', 'open-jira', 'schedule-meeting'],
        reason: "It's Monday — plan your week",
    },
    2: { // Tuesday
        actionIds: ['new-prd', 'find-expert', 'open-confluence'],
        reason: 'Tuesday focus time',
    },
    3: { // Wednesday
        actionIds: ['open-analytics', 'new-user-story', 'book-room'],
        reason: 'Midweek momentum',
    },
    4: { // Thursday
        actionIds: ['release-tracker', 'view-roadmap', 'open-smartsheet'],
        reason: 'Thursday — prep for releases',
    },
    5: { // Friday
        actionIds: ['open-jira', 'new-one-pager', 'healthcare-101'],
        reason: "Friday wrap-up — close loops or learn",
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-BASED SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_SUGGESTIONS: Record<UserRole, { actionIds: string[]; reason: string }> = {
    'pm': {
        actionIds: ['new-prd', 'open-jira', 'view-roadmap', 'find-expert'],
        reason: 'Essential PM tools',
    },
    'po': {
        actionIds: ['new-user-story', 'open-jira', 'open-analytics', 'schedule-meeting'],
        reason: 'Product Owner essentials',
    },
    'leader': {
        actionIds: ['view-roadmap', 'open-smartsheet', 'new-one-pager', 'release-tracker'],
        reason: 'Leadership toolkit',
    },
    'new-hire': {
        actionIds: ['healthcare-101', 'new-pm-guide', 'rcm-fundamentals', 'find-expert'],
        reason: 'Welcome! Start here to get up to speed',
    },
    'all': {
        actionIds: ['open-jira', 'open-confluence', 'search-faqs', 'ask-barista'],
        reason: 'Popular across teams',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// SEASONAL / EVENT SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════

const getSeasonalSuggestions = (month: number): { actionIds: string[]; reason: string } | null => {
    // Q4 Planning (October-December)
    if (month >= 9 && month <= 11) {
        return {
            actionIds: ['view-roadmap', 'new-one-pager', 'open-smartsheet'],
            reason: 'Q4 Planning season — strategic resources',
        };
    }
    // Year Start (January)
    if (month === 0) {
        return {
            actionIds: ['view-roadmap', 'new-pm-guide', 'release-tracker'],
            reason: 'New Year — fresh starts and planning',
        };
    }
    return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SUGGESTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export const generateSmartSuggestions = (context: SuggestionContext): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    const seenActionIds = new Set<string>();

    const addSuggestion = (
        actionId: string,
        reason: string,
        priority: number,
        contextType: SmartSuggestion['contextType']
    ) => {
        if (seenActionIds.has(actionId)) return;
        const action = QUICK_ACTIONS.find(a => a.id === actionId);
        if (action) {
            seenActionIds.add(actionId);
            suggestions.push({ action, reason, priority, contextType });
        }
    };

    // 1. Time-based suggestions (Priority: 8)
    const timePeriod = getTimePeriod(context.currentHour);
    const timeSuggestion = TIME_SUGGESTIONS[timePeriod];
    if (timeSuggestion) {
        timeSuggestion.actionIds.forEach(id => {
            addSuggestion(id, timeSuggestion.reason, 8, 'time');
        });
    }

    // 2. Day-of-week suggestions (Priority: 7)
    const daySuggestion = DAY_SUGGESTIONS[context.dayOfWeek];
    if (daySuggestion) {
        daySuggestion.actionIds.forEach(id => {
            addSuggestion(id, daySuggestion.reason, 7, 'time');
        });
    }

    // 3. Role-based suggestions (Priority: 9)
    if (context.userRole) {
        const roleSuggestion = ROLE_SUGGESTIONS[context.userRole];
        roleSuggestion.actionIds.forEach(id => {
            addSuggestion(id, roleSuggestion.reason, 9, 'role');
        });
    }

    // 4. Seasonal suggestions (Priority: 6)
    if (context.currentMonth !== undefined) {
        const seasonal = getSeasonalSuggestions(context.currentMonth);
        if (seasonal) {
            seasonal.actionIds.forEach(id => {
                addSuggestion(id, seasonal.reason, 6, 'seasonal');
            });
        }
    }

    // 5. Recent activity suggestions (Priority: 10 - highest)
    if (context.recentActionIds && context.recentActionIds.length > 0) {
        // Suggest the most recent action for quick re-access
        const mostRecent = context.recentActionIds[0];
        addSuggestion(mostRecent, 'Continue where you left off', 10, 'recent');
    }

    // Sort by priority (descending) and return top 8
    return suggestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getCurrentContext = (): SuggestionContext => {
    const now = new Date();
    return {
        currentHour: now.getHours(),
        dayOfWeek: now.getDay(),
        currentMonth: now.getMonth(),
    };
};

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

export const getContextualMessage = (): string => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    if (day === 1 && hour < 12) return "Let's crush this week!";
    if (day === 5 && hour >= 15) return 'Almost weekend — finish strong!';
    if (hour < 10) return 'Fresh start — what do you need?';
    if (hour >= 22) return 'Working late? Grab something quick.';
    return 'What do you need today?';
};
