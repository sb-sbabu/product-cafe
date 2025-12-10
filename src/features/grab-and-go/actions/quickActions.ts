/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAB & GO — Quick Actions Registry
 * One-click actions for the Intelligent Quick-Action Hub
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    FileText,
    Bug,
    Calendar,
    Users,
    Map,
    Key,
    BookOpen,
    MessageSquare,
    BarChart3,
    Zap,
    Layers,
    Bell,
    HelpCircle,
    Heart,
    Award,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QuickActionCategory = 'cafe' | 'create' | 'tools' | 'meetings' | 'help' | 'planning' | 'it' | 'learn';

export interface QuickAction {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    category: QuickActionCategory;
    url?: string;
    internalRoute?: string;
    gradient: string;
    isDefault?: boolean;
    keywords: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY GRADIENTS — Soft Pastel Colors (Colorful but Calm)
// Muted, professional tones inspired by Toast X but toned down for comfort
// ═══════════════════════════════════════════════════════════════════════════

export const CATEGORY_GRADIENTS: Record<QuickActionCategory, string> = {
    cafe: 'from-purple-400/80 to-pink-400/80',      // Soft purple-pink
    create: 'from-violet-400/80 to-purple-400/80',  // Soft violet-purple
    tools: 'from-sky-400/80 to-blue-400/80',        // Soft sky-blue
    meetings: 'from-amber-300/80 to-orange-300/80', // Soft amber-orange
    help: 'from-emerald-300/80 to-teal-400/80',     // Soft emerald-teal
    planning: 'from-indigo-400/80 to-violet-400/80',// Soft indigo-violet
    it: 'from-cyan-400/80 to-blue-400/80',          // Soft cyan-blue
    learn: 'from-rose-300/80 to-pink-400/80',       // Soft rose-pink
};

export const CATEGORY_LABELS: Record<QuickActionCategory, string> = {
    cafe: 'Product Café',
    create: 'Create',
    tools: 'Tools',
    meetings: 'Meetings',
    help: 'Get Help',
    planning: 'Planning',
    it: 'IT & Access',
    learn: 'Learn',
};

// ═══════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const QUICK_ACTIONS: QuickAction[] = [
    // ─────────────────────────────────────────────────────────────────────────
    // ☕ PRODUCT CAFÉ — In-App Features
    // ─────────────────────────────────────────────────────────────────────────

    // PULSE — Competitive Intelligence
    {
        id: 'pulse-signals',
        label: 'Pulse Signals',
        description: 'Check latest competitive intelligence',
        icon: Zap,
        category: 'cafe',
        internalRoute: 'pulse',
        gradient: CATEGORY_GRADIENTS.cafe,
        isDefault: true,
        keywords: ['pulse', 'signals', 'competitive', 'intel', 'news'],
    },
    {
        id: 'pulse-competitors',
        label: 'Competitors',
        description: 'View competitor watchlist and activity',
        icon: TrendingUp,
        category: 'cafe',
        internalRoute: 'pulse',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['competitor', 'watchlist', 'market', 'intel'],
    },

    // TOAST — Recognition
    {
        id: 'send-toast',
        label: 'Send Toast 🥂',
        description: 'Recognize a colleague for great work',
        icon: Heart,
        category: 'cafe',
        internalRoute: 'toast',
        gradient: CATEGORY_GRADIENTS.cafe,
        isDefault: true,
        keywords: ['toast', 'recognition', 'kudos', 'thanks', 'appreciate'],
    },
    {
        id: 'toast-credits',
        label: 'My Credits',
        description: 'Check your recognition credits balance',
        icon: Award,
        category: 'cafe',
        internalRoute: 'credits',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['credits', 'balance', 'points', 'recognition'],
    },
    {
        id: 'toast-leaderboard',
        label: 'Leaderboard',
        description: 'See top recognizers and receivers',
        icon: BarChart3,
        category: 'cafe',
        internalRoute: 'leaderboard',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['leaderboard', 'top', 'ranking', 'recognition'],
    },

    // LOP — Love of Product Sessions
    {
        id: 'lop-next',
        label: 'Next LOP',
        description: 'View upcoming Love of Product session',
        icon: Calendar,
        category: 'cafe',
        internalRoute: 'lop',
        gradient: CATEGORY_GRADIENTS.cafe,
        isDefault: true,
        keywords: ['lop', 'session', 'love of product', 'talk', 'upcoming'],
    },
    {
        id: 'lop-archive',
        label: 'LOP Archive',
        description: 'Browse past LOP session recordings',
        icon: BookOpen,
        category: 'cafe',
        internalRoute: 'lop-archive',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['lop', 'archive', 'recording', 'past', 'sessions'],
    },

    // DAILY BREW — Notifications
    {
        id: 'daily-brew',
        label: 'Daily Brew',
        description: 'Check your notification stream',
        icon: Bell,
        category: 'cafe',
        internalRoute: 'home',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['brew', 'notifications', 'alerts', 'updates'],
    },

    // LIBRARY & COMMUNITY
    {
        id: 'browse-library',
        label: 'Library',
        description: 'Browse templates, guides, and playbooks',
        icon: BookOpen,
        category: 'cafe',
        internalRoute: 'library',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['library', 'templates', 'guides', 'playbooks', 'resources'],
    },
    {
        id: 'find-people',
        label: 'Find People',
        description: 'Search the product community directory',
        icon: Users,
        category: 'cafe',
        internalRoute: 'community',
        gradient: CATEGORY_GRADIENTS.cafe,
        keywords: ['people', 'directory', 'community', 'team', 'find'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'new-prd',
        label: 'New PRD',
        description: 'Start a new Product Requirements Document',
        icon: FileText,
        category: 'create',
        url: 'https://confluence.company.com/display/PRODUCT/PRD+Template+v3',
        gradient: CATEGORY_GRADIENTS.create,
        isDefault: true,
        keywords: ['prd', 'requirements', 'document', 'spec', 'new'],
    },
    {
        id: 'new-one-pager',
        label: 'One-Pager',
        description: 'Quick proposal or executive summary',
        icon: Layers,
        category: 'create',
        url: 'https://confluence.company.com/display/PRODUCT/One-Pager+Template',
        gradient: CATEGORY_GRADIENTS.create,
        keywords: ['one-pager', 'brief', 'proposal', 'summary'],
    },
    {
        id: 'new-user-story',
        label: 'User Story',
        description: 'Write a new user story in Jira',
        icon: MessageSquare,
        category: 'create',
        url: 'https://jira.company.com/secure/CreateIssue.jspa?issuetype=Story',
        gradient: CATEGORY_GRADIENTS.create,
        keywords: ['story', 'jira', 'agile', 'user story'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TOOLS
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'open-jira',
        label: 'Open Jira',
        description: 'Jump to your Jira board',
        icon: Bug,
        category: 'tools',
        url: 'https://jira.company.com',
        gradient: CATEGORY_GRADIENTS.tools,
        keywords: ['jira', 'board', 'tickets', 'issues', 'bugs'],
    },
    {
        id: 'open-confluence',
        label: 'Confluence',
        description: 'Open documentation wiki',
        icon: BookOpen,
        category: 'tools',
        url: 'https://confluence.company.com',
        gradient: CATEGORY_GRADIENTS.tools,
        keywords: ['confluence', 'wiki', 'docs', 'documentation'],
    },
    {
        id: 'open-smartsheet',
        label: 'Smartsheet',
        description: 'Project tracking and roadmaps',
        icon: BarChart3,
        category: 'tools',
        url: 'https://app.smartsheet.com',
        gradient: CATEGORY_GRADIENTS.tools,
        keywords: ['smartsheet', 'roadmap', 'tracking', 'project'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MEETINGS
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'book-room',
        label: 'Book Room',
        description: 'Reserve a meeting room',
        icon: Calendar,
        category: 'meetings',
        url: 'https://outlook.office.com/calendar',
        gradient: CATEGORY_GRADIENTS.meetings,
        keywords: ['room', 'meeting', 'book', 'calendar', 'reserve'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // HELP
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'find-expert',
        label: 'Find Expert',
        description: 'Find a subject matter expert',
        icon: Users,
        category: 'help',
        gradient: CATEGORY_GRADIENTS.help,
        isDefault: true,
        keywords: ['expert', 'help', 'ask', 'find', 'person'],
    },
    {
        id: 'ask-barista',
        label: 'Ask Barista',
        description: 'Get AI-powered help from Café Barista',
        icon: Zap,
        category: 'help',
        gradient: CATEGORY_GRADIENTS.help,
        keywords: ['barista', 'ai', 'chat', 'ask'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PLANNING
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'view-roadmap',
        label: 'View Roadmap',
        description: 'Open the master product roadmap',
        icon: Map,
        category: 'planning',
        url: 'https://app.smartsheet.com/sheets/roadmap-2024',
        gradient: CATEGORY_GRADIENTS.planning,
        isDefault: true,
        keywords: ['roadmap', 'plan', 'timeline', 'initiatives'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // IT & ACCESS
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'request-access',
        label: 'Request Access',
        description: 'Submit an IT access request',
        icon: Key,
        category: 'it',
        url: 'https://servicenow.company.com',
        gradient: CATEGORY_GRADIENTS.it,
        keywords: ['access', 'request', 'permission', 'it', 'software'],
    },
    {
        id: 'it-help',
        label: 'IT Help',
        description: 'Submit an IT support ticket',
        icon: HelpCircle,
        category: 'it',
        url: 'https://servicenow.company.com/incident',
        gradient: CATEGORY_GRADIENTS.it,
        keywords: ['it', 'help', 'support', 'ticket', 'issue'],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LEARN
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'healthcare-101',
        label: 'Healthcare 101',
        description: 'Learn US healthcare fundamentals',
        icon: BookOpen,
        category: 'learn',
        url: 'https://confluence.company.com/display/LEARN/Healthcare+101',
        gradient: CATEGORY_GRADIENTS.learn,
        keywords: ['healthcare', 'learn', 'onboarding', '101'],
    },
    {
        id: 'new-pm-guide',
        label: '30-60-90 Plan',
        description: 'New PM onboarding guide',
        icon: BookOpen,
        category: 'learn',
        url: 'https://confluence.company.com/display/PRODUCT/New+PM+Guide',
        gradient: CATEGORY_GRADIENTS.learn,
        keywords: ['new', 'pm', 'onboarding', '30-60-90'],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getDefaultActions = (): QuickAction[] => {
    return QUICK_ACTIONS.filter(a => a.isDefault);
};

export const getActionsByCategory = (category: QuickActionCategory): QuickAction[] => {
    return QUICK_ACTIONS.filter(a => a.category === category);
};

export const searchActions = (query: string): QuickAction[] => {
    const q = query.toLowerCase();
    return QUICK_ACTIONS.filter(a =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.keywords.some(k => k.includes(q))
    );
};

export const getActionById = (id: string): QuickAction | undefined => {
    return QUICK_ACTIONS.find(a => a.id === id);
};
