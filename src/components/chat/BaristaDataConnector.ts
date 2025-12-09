/**
 * BARISTA Data Connector
 * Connects BARISTA chatbot to ALL application data sources
 * 
 * Data Sources:
 * - Toast-X Store: User data, love points, leaderboard, recognitions, badges
 * - LOP Store: Sessions, learning paths, progress
 * - Pulse Store: Signals, competitors, market intel
 * - Discussion Store: Community discussions, questions
 * - CafeFinder: Resources, people, FAQs
 */

import { useToastXStore, type ToastUser, type Recognition } from '../../features/toast-x';
import { useLOPStore } from '../../stores/lopStore';
import { usePulseStore } from '../../lib/pulse/usePulseStore';
import { useDiscussionStore } from '../../stores/discussionStore';
import { cafeFinder, type SearchResponse } from '../../lib/search';
import type { DocumentData, PersonData, StatsData, ListItem } from './BaristaCards';
import type { Intent } from './BaristaIntentEngine';
import type { LOPSession } from '../../lib/lop/types';

// ═══════════════════════════════════════════════════════════════════════════
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LeaderboardEntry {
    rank: number;
    name: string;
    team: string;
    points: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

export interface SessionItem {
    id: string;
    title: string;
    subtitle?: string;
    speaker: string;
    date?: string;
    duration?: string;
    isUpcoming?: boolean;
    isEssential?: boolean;
    viewCount?: number;
}

export interface SignalItem {
    id: string;
    title: string;
    summary: string;
    domain: string;
    priority: string;
    source?: string;
    date: string;
    isRead?: boolean;
}

export interface DiscussionItem {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    replies: number;
    upvotes: number;
    date: string;
    isResolved?: boolean;
}

export interface RecognitionItem {
    id: string;
    type: string;
    giver: string;
    recipients: string[];
    value: string;
    message: string;
    date: string;
    reactions: number;
    comments: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE DATA TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type ResponseType =
    | 'stats'
    | 'leaderboard'
    | 'session'
    | 'session_list'
    | 'signal_list'
    | 'discussion_list'
    | 'recognition_list'
    | 'badge_grid'
    | 'competitor_list'
    | 'person'
    | 'document'
    | 'document_list'
    | 'action'
    | 'navigation'
    | 'help'
    | 'text';

export interface ResponseData {
    type: ResponseType;
    data: unknown;
    message: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MASTER RESPONSE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate response based on classified intent
 */
export const generateResponse = (intent: Intent): ResponseData => {
    try {
        switch (intent.category) {
            case 'toast':
                return handleToastIntent(intent);
            case 'lop':
                return handleLOPIntent(intent);
            case 'pulse':
                return handlePulseIntent(intent);
            case 'expert':
                return handleExpertIntent(intent);
            case 'community':
                return handleCommunityIntent(intent);
            case 'library':
                return handleLibraryIntent(intent);
            case 'stats':
                return handleStatsIntent();
            case 'navigation':
                return handleNavigationIntent(intent);
            case 'help':
                return handleHelpIntent(intent);
            default:
                return handleSearchFallback(intent);
        }
    } catch (error) {
        console.error('[BARISTA] Error generating response:', error);
        return {
            type: 'text',
            data: null,
            message: "I'm having trouble finding that information right now. Try a different query?",
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// TOAST-X HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleToastIntent = (intent: Intent): ResponseData => {
    const store = useToastXStore.getState();
    const currentUser = store.getCurrentUser();

    switch (intent.action) {
        case 'my_recognitions': {
            const received = store.recognitions
                .filter(r => r.recipientIds.includes(currentUser?.id || ''))
                .slice(0, 5);
            if (received.length === 0) {
                return {
                    type: 'text',
                    data: null,
                    message: "You haven't received any toasts yet. Keep up the great work - recognition is coming! 🌟",
                };
            }
            return {
                type: 'recognition_list',
                data: received.map(formatRecognition),
                message: `🎉 Here are your recent recognitions (${received.length} shown):`,
            };
        }
        case 'recent': {
            const recent = store.recognitions.slice(0, 5);
            if (recent.length === 0) {
                return {
                    type: 'text',
                    data: null,
                    message: "No toasts yet! Be the first to recognize a colleague's great work. 🌟",
                };
            }
            return {
                type: 'recognition_list',
                data: recent.map(formatRecognition),
                message: '🎉 Here are the latest toasts in your organization:',
            };
        }
        case 'leaderboard': {
            const leaderboard = getLeaderboard('MOST_RECOGNIZED', 5);
            if (leaderboard.length === 0) {
                return {
                    type: 'text',
                    data: null,
                    message: "No leaderboard data yet. Start recognizing your colleagues to build it up! 🏆",
                };
            }
            return {
                type: 'leaderboard',
                data: leaderboard,
                message: '🏆 Here are the top performers this month:',
            };
        }
        case 'badges': {
            const badges = currentUser?.earnedBadges?.map(b => ({
                id: b.badge,
                name: b.badge.replace(/_/g, ' ').toLowerCase(),
                description: `Earned on ${formatDate(b.earnedAt)}`,
                icon: getBadgeEmoji(b.badge),
                earnedAt: b.earnedAt,
            })) || [];
            if (badges.length === 0) {
                return {
                    type: 'text',
                    data: null,
                    message: "You haven't earned any badges yet. Keep giving and receiving toasts to unlock them! 🏅",
                };
            }
            return {
                type: 'badge_grid',
                data: badges,
                message: `🏅 You've earned ${badges.length} badge${badges.length > 1 ? 's' : ''}:`,
            };
        }
        case 'give':
        case 'standing_ovation': {
            return {
                type: 'action',
                data: { action: 'open_toast_composer', type: intent.action === 'standing_ovation' ? 'standing_ovation' : 'quick' },
                message: intent.action === 'standing_ovation'
                    ? "I can help you give a Standing Ovation! This opens the composer for detailed recognition."
                    : "Great! I can help you recognize someone. Click below to open the toast composer.",
            };
        }
        case 'given': {
            const given = store.recognitions
                .filter(r => r.giverId === currentUser?.id)
                .slice(0, 5);
            if (given.length === 0) {
                return {
                    type: 'text',
                    data: null,
                    message: "You haven't given any toasts yet. Why not recognize a colleague's great work? 🙌",
                };
            }
            return {
                type: 'recognition_list',
                data: given.map(formatRecognition),
                message: `🎉 Here are toasts you've given recently (${given.length} shown):`,
            };
        }
        default:
            return handleSearchFallback(intent);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOP HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleLOPIntent = (intent: Intent): ResponseData => {
    const store = useLOPStore.getState();

    switch (intent.action) {
        case 'upcoming': {
            const next = store.getNextSession();
            if (!next) {
                return { type: 'text', data: null, message: 'No upcoming LOP sessions scheduled yet. Check back soon!' };
            }
            return {
                type: 'session',
                data: formatSession(next),
                message: '📅 Here\'s the upcoming LOP session:',
            };
        }
        case 'recent':
        case 'last_two': {
            const count = intent.action === 'last_two' ? 2 : 1;
            const recent = store.getRecentSessions(count);
            return {
                type: 'session_list',
                data: recent.map(formatSession),
                message: count === 1 ? 'Here\'s the last LOP session:' : 'Here are the last 2 LOP sessions:',
            };
        }
        case 'essential': {
            const essential = store.sessions.filter(s => s.isEssential).slice(0, 5);
            return {
                type: 'session_list',
                data: essential.map(formatSession),
                message: '⭐ These are the essential sessions every PM should watch:',
            };
        }
        case 'popular': {
            const popular = [...store.sessions]
                .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                .slice(0, 5);
            return {
                type: 'session_list',
                data: popular.map(formatSession),
                message: '🔥 Most popular LOP sessions:',
            };
        }
        case 'learning_paths': {
            const paths = store.learningPaths;
            return {
                type: 'session_list',
                data: paths.map(p => ({
                    id: p.id,
                    title: p.title,
                    subtitle: p.description,
                    speaker: `${p.sessionIds.length} sessions`,
                    duration: `~${p.sessionIds.length * 45} min`,
                })),
                message: '🎯 Available learning paths:',
            };
        }
        case 'by_topic': {
            const topic = intent.entities.topic || '';
            const filtered = store.sessions.filter(s =>
                s.topics?.some(t => t.toLowerCase().includes(topic.toLowerCase())) ||
                s.title.toLowerCase().includes(topic.toLowerCase())
            ).slice(0, 5);
            return {
                type: 'session_list',
                data: filtered.map(formatSession),
                message: filtered.length > 0
                    ? `Sessions related to "${topic}":`
                    : `No sessions found matching "${topic}". Try a different topic?`,
            };
        }
        case 'my_progress': {
            const progress = Object.keys(store.progress).length;
            const total = store.sessions.length;
            const percent = total > 0 ? Math.round((progress / total) * 100) : 0;
            return {
                type: 'stats',
                data: {
                    balance: progress,
                    monthlyEarned: total,
                    monthlySpent: 0,
                    recentActivity: [
                        { id: '1', description: `${progress} sessions completed`, amount: progress, date: 'Total' },
                        { id: '2', description: `${total - progress} remaining`, amount: total - progress, date: '' },
                    ],
                },
                message: `📊 Your LOP progress: ${progress}/${total} sessions (${percent}%)`,
            };
        }
        default: {
            // For LOP queries, show recent sessions as a helpful default
            const recent = store.getRecentSessions(3);
            if (recent.length > 0) {
                return {
                    type: 'session_list',
                    data: recent.map(formatSession),
                    message: '📺 Here are the recent LOP sessions:',
                };
            }
            return handleSearchFallback(intent);
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PULSE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handlePulseIntent = (intent: Intent): ResponseData => {
    const store = usePulseStore.getState();

    switch (intent.action) {
        case 'latest': {
            const signals = store.signals.slice(0, 5);
            return {
                type: 'signal_list',
                data: signals.map(formatSignal),
                message: '📡 Latest signals from Pulse:',
            };
        }
        case 'competitive': {
            const competitive = store.signals
                .filter(s => s.domain === 'COMPETITIVE')
                .slice(0, 5);
            return {
                type: 'signal_list',
                data: competitive.map(formatSignal),
                message: '🎯 Latest competitive intelligence:',
            };
        }
        case 'regulatory': {
            const regulatory = store.signals
                .filter(s => s.domain === 'REGULATORY')
                .slice(0, 5);
            return {
                type: 'signal_list',
                data: regulatory.map(formatSignal),
                message: '📋 Regulatory updates:',
            };
        }
        case 'market': {
            const market = store.signals
                .filter(s => s.domain === 'MARKET')
                .slice(0, 5);
            return {
                type: 'signal_list',
                data: market.map(formatSignal),
                message: '📈 Market trends:',
            };
        }
        case 'technology': {
            const tech = store.signals
                .filter(s => s.domain === 'TECHNOLOGY')
                .slice(0, 5);
            return {
                type: 'signal_list',
                data: tech.map(formatSignal),
                message: '💡 Technology signals:',
            };
        }
        case 'by_company':
        case 'waystar':
        case 'trizetto':
        case 'inovalon': {
            const company = intent.entities.company || intent.action;
            const signals = store.signals
                .filter(s =>
                    s.title.toLowerCase().includes(company.toLowerCase()) ||
                    (s.summary && s.summary.toLowerCase().includes(company.toLowerCase()))
                )
                .slice(0, 5);
            return {
                type: 'signal_list',
                data: signals.map(formatSignal),
                message: signals.length > 0
                    ? `Latest on ${company}:`
                    : `No recent signals about ${company}. I'll keep watching!`,
            };
        }
        case 'unread': {
            const unread = store.signals.filter(s => !s.isRead).slice(0, 5);
            return {
                type: 'signal_list',
                data: unread.map(formatSignal),
                message: `📬 You have ${unread.length} unread signals:`,
            };
        }
        case 'competitors': {
            const competitors = store.competitors?.slice(0, 5) || [];
            return {
                type: 'competitor_list',
                data: competitors.map(c => ({
                    id: c.id,
                    name: c.name,
                    tier: c.tier,
                    category: c.category,
                    description: c.description,
                    signalCount: c.signalCount,
                    isWatchlisted: c.watchlisted,
                })),
                message: '🎯 Tracked competitors:',
            };
        }
        default:
            return handleSearchFallback(intent);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPERT/PEOPLE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleExpertIntent = (intent: Intent): ResponseData => {
    // Handle multi-skill queries with AND/OR logic
    if (intent.entities.skills) {
        const skills = intent.entities.skills.split(',');
        const operator = intent.entities.operator as 'AND' | 'OR' || 'OR';
        return findExpertsByMultipleSkills(skills, operator);
    }

    // Single skill query
    const skill = intent.entities.skill || intent.action;
    return findExpertsBySingleSkill(skill);
};

/**
 * Find experts with multiple skills using AND/OR logic
 */
const findExpertsByMultipleSkills = (skills: string[], operator: 'AND' | 'OR'): ResponseData => {
    const store = useToastXStore.getState();
    const allUsers = Array.from(store.users.values());

    const matchingExperts = allUsers.filter((u: ToastUser) => {
        if (!u.expertAreas || u.expertAreas.length === 0) return false;

        const userSkills = u.expertAreas.map(e => e.name.toLowerCase());

        if (operator === 'AND') {
            // User must have ALL requested skills
            return skills.every(skill =>
                userSkills.some(us => us.includes(skill.toLowerCase()))
            );
        } else {
            // User must have ANY of the requested skills
            return skills.some(skill =>
                userSkills.some(us => us.includes(skill.toLowerCase()))
            );
        }
    });

    const skillsDisplay = skills.join(operator === 'AND' ? ' AND ' : ' OR ');

    if (matchingExperts.length > 0) {
        // Return list if multiple, single person if one
        if (matchingExperts.length === 1) {
            const expert = matchingExperts[0];
            return {
                type: 'person',
                data: {
                    id: expert.id,
                    name: expert.name,
                    title: expert.title,
                    team: expert.team,
                    location: 'Remote',
                    tenure: '3+ years',
                    expertise: expert.expertAreas?.map(e => e.name) || skills,
                    email: expert.email,
                },
                message: `👤 Found an expert in ${skillsDisplay}:`,
            };
        }

        // Multiple experts - return a list
        const expertList = matchingExperts.slice(0, 5).map(expert => ({
            id: expert.id,
            title: expert.name,
            subtitle: expert.title,
            description: expert.expertAreas?.map(e => e.name).slice(0, 3).join(', ') || '',
            team: expert.team,
        }));

        return {
            type: 'document_list',
            data: expertList,
            message: `👥 Found ${matchingExperts.length} expert${matchingExperts.length > 1 ? 's' : ''} in ${skillsDisplay}:`,
        };
    }

    // Try cafeFinder as fallback
    const searchQuery = skills.join(' ');
    const results = cafeFinder.search(`expert ${searchQuery}`, { currentPage: 'barista' });

    if (results.results.people.length > 0) {
        const experts = results.results.people.slice(0, 5);
        if (experts.length === 1) {
            const person = experts[0];
            return {
                type: 'person',
                data: {
                    id: person.id,
                    name: person.name,
                    title: person.title,
                    team: person.team,
                    location: person.location || 'Remote',
                    tenure: '3+ years',
                    expertise: person.expertiseAreas?.slice(0, 5) || skills,
                    email: person.email,
                },
                message: `👤 Found an expert in ${skillsDisplay}:`,
            };
        }

        const expertList = experts.map(p => ({
            id: p.id,
            title: p.name,
            subtitle: p.title,
            description: p.expertiseAreas?.slice(0, 3).join(', ') || '',
            team: p.team,
        }));

        return {
            type: 'document_list',
            data: expertList,
            message: `👥 Found ${experts.length} expert${experts.length > 1 ? 's' : ''} in ${skillsDisplay}:`,
        };
    }

    return {
        type: 'text',
        data: null,
        message: `I couldn't find experts matching "${skillsDisplay}". Try different skill combinations or check the People Directory.`,
    };
};

/**
 * Find experts with a single skill
 */
const findExpertsBySingleSkill = (skill: string): ResponseData => {
    const searchQuery = `expert ${skill}`;
    const results = cafeFinder.search(searchQuery, { currentPage: 'barista' });

    if (results.results.people.length > 0) {
        const experts = results.results.people.slice(0, 5);

        if (experts.length === 1) {
            const person = experts[0];
            return {
                type: 'person',
                data: {
                    id: person.id,
                    name: person.name,
                    title: person.title,
                    team: person.team,
                    location: person.location || 'Remote',
                    tenure: '3+ years',
                    expertise: person.expertiseAreas?.slice(0, 5) || [skill],
                    email: person.email,
                },
                message: `👤 Found an expert in ${skill}:`,
            };
        }

        // Multiple results - show list
        const expertList = experts.map(p => ({
            id: p.id,
            title: p.name,
            subtitle: p.title,
            description: p.expertiseAreas?.slice(0, 3).join(', ') || skill,
            team: p.team,
        }));

        return {
            type: 'document_list',
            data: expertList,
            message: `👥 Found ${experts.length} experts in ${skill}:`,
        };
    }

    // Fallback to Toast-X users with matching expertise
    const store = useToastXStore.getState();
    const allUsers = Array.from(store.users.values());
    const expertUsers = allUsers.filter((u: ToastUser) =>
        u.expertAreas?.some(e => e.name.toLowerCase().includes(skill.toLowerCase()))
    );

    if (expertUsers.length > 0) {
        if (expertUsers.length === 1) {
            const expert = expertUsers[0];
            return {
                type: 'person',
                data: {
                    id: expert.id,
                    name: expert.name,
                    title: expert.title,
                    team: expert.team,
                    location: 'Remote',
                    tenure: '3+ years',
                    expertise: expert.expertAreas?.map(e => e.name) || [],
                    email: expert.email,
                },
                message: `👤 Found an expert in ${skill}:`,
            };
        }

        const expertList = expertUsers.slice(0, 5).map(expert => ({
            id: expert.id,
            title: expert.name,
            subtitle: expert.title,
            description: expert.expertAreas?.map(e => e.name).slice(0, 3).join(', ') || '',
            team: expert.team,
        }));

        return {
            type: 'document_list',
            data: expertList,
            message: `👥 Found ${expertUsers.length} experts in ${skill}:`,
        };
    }

    return {
        type: 'text',
        data: null,
        message: `I couldn't find a specific expert in "${skill}". Try searching for a different skill or check the People Directory.`,
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY/DISCUSSION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleCommunityIntent = (intent: Intent): ResponseData => {
    const store = useDiscussionStore.getState();

    // Ensure discussions are loaded
    if (store.discussions.length === 0) {
        store.loadDiscussions();
    }

    switch (intent.action) {
        case 'recent': {
            const recent = store.getRecentDiscussions(5);
            return {
                type: 'discussion_list',
                data: recent.map(formatDiscussion),
                message: '💬 Recent community discussions:',
            };
        }
        case 'new': {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const newToday = store.discussions
                .filter(d => new Date(d.createdAt) >= today)
                .slice(0, 5);
            return {
                type: 'discussion_list',
                data: newToday.map(formatDiscussion),
                message: newToday.length > 0
                    ? '🆕 Discussions started today:'
                    : 'No new discussions today. Be the first to start one!',
            };
        }
        case 'open': {
            const open = store.discussions
                .filter(d => d.status === 'open')
                .slice(0, 5);
            return {
                type: 'discussion_list',
                data: open.map(formatDiscussion),
                message: '❓ Open questions that need answers:',
            };
        }
        case 'trending': {
            const trending = [...store.discussions]
                .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
                .slice(0, 5);
            return {
                type: 'discussion_list',
                data: trending.map(formatDiscussion),
                message: '🔥 Trending discussions:',
            };
        }
        default:
            return handleSearchFallback(intent);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleLibraryIntent = (intent: Intent): ResponseData => {
    let searchQuery = '';

    switch (intent.action) {
        case 'playbooks':
            searchQuery = 'playbook';
            break;
        case 'grab_go':
            searchQuery = 'grab and go quick';
            break;
        case 'templates':
            searchQuery = 'template';
            break;
        case 'popular':
            searchQuery = 'popular resource';
            break;
        case 'new':
            searchQuery = 'resource';
            break;
        case 'by_pillar':
            searchQuery = intent.entities.topic || 'resource';
            break;
        default:
            searchQuery = intent.originalQuery;
    }

    const results = cafeFinder.search(searchQuery, { currentPage: 'library' });

    if (results.results.resources.length > 0) {
        const resources = results.results.resources.slice(0, 5);
        return {
            type: 'document_list',
            data: resources.map(r => ({
                id: r.id,
                title: r.title,
                subtitle: r.description?.slice(0, 60) + '...',
                type: 'document',
                pillar: r.pillar,
                date: formatDate(r.updatedAt),
                url: r.url,
            })),
            message: getLibraryMessage(intent.action, resources.length),
        };
    }

    return {
        type: 'text',
        data: null,
        message: `No ${intent.action.replace('_', ' ')} found. Try a different search term?`,
    };
};

const getLibraryMessage = (action: string, count: number): string => {
    switch (action) {
        case 'playbooks': return `📚 Found ${count} playbooks:`;
        case 'grab_go': return `⚡ Grab & Go resources (${count}):`;
        case 'templates': return `📄 Available templates (${count}):`;
        case 'popular': return `🔥 Popular resources (${count}):`;
        case 'new': return `🆕 Latest resources (${count}):`;
        default: return `📁 Found ${count} resources:`;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// STATS HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleStatsIntent = (): ResponseData => {
    const stats = getUserStats();

    if (!stats) {
        return {
            type: 'text',
            data: null,
            message: 'Unable to load your stats right now. Please try again.',
        };
    }

    return {
        type: 'stats',
        data: stats,
        message: '❤️ Here\'s your Love Points summary:',
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleNavigationIntent = (intent: Intent): ResponseData => {
    const routes: Record<string, string> = {
        home: '/',
        toast: '/toast',
        lop: '/lop',
        pulse: '/pulse',
        library: '/library',
        community: '/community',
        profile: '/profile',
        settings: '/settings',
    };

    const route = routes[intent.action] || '/';

    return {
        type: 'navigation',
        data: { route, label: intent.action },
        message: `Taking you to ${intent.action}... 🚀`,
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// HELP HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const handleHelpIntent = (intent: Intent): ResponseData => {
    // Handle greetings with a friendly welcome
    if (intent.action === 'greeting') {
        return {
            type: 'text',
            data: null,
            message: "☕ Hey there! I'm Barista, your Product Café assistant. Try asking about recognitions, LOP sessions, experts, or explore the categories below!",
        };
    }

    // Capabilities/help request
    return {
        type: 'help',
        data: {
            categories: [
                { emoji: '🎉', name: 'Toast', examples: ['my recognitions', 'give toast', 'leaderboard'] },
                { emoji: '📺', name: 'LOP', examples: ['upcoming LOP', 'essential sessions', 'learning paths'] },
                { emoji: '📡', name: 'Pulse', examples: ['latest on Waystar', 'competitive intel', 'regulatory updates'] },
                { emoji: '👤', name: 'Experts', examples: ['expert in claims', 'expert in EHR', 'experts in fhir and edi'] },
                { emoji: '💬', name: 'Community', examples: ['trending discussions', 'open questions'] },
                { emoji: '📚', name: 'Library', examples: ['latest playbooks', 'templates', 'Grab & Go'] },
            ],
        },
        message: "☕ I'm Barista - your Product Café assistant! Here's what I can help with:",
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH FALLBACK
// ═══════════════════════════════════════════════════════════════════════════

const handleSearchFallback = (intent: Intent): ResponseData => {
    const results = cafeFinder.search(intent.originalQuery, { currentPage: 'barista' });

    if (results.totalCount > 0) {
        const items = getListFromSearch(results);
        return {
            type: 'document_list',
            data: items,
            message: `Found ${results.totalCount} results for "${intent.originalQuery}":`,
        };
    }

    return {
        type: 'text',
        data: null,
        message: `I couldn't find anything matching "${intent.originalQuery}". Try asking in a different way or explore the categories below.`,
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════

const formatRecognition = (r: Recognition): RecognitionItem => ({
    id: r.id,
    type: r.type,
    giver: r.giverName,
    recipients: r.recipients.map(rec => rec.name),
    value: r.value.replace(/_/g, ' '),
    message: r.message.slice(0, 100) + (r.message.length > 100 ? '...' : ''),
    date: formatDate(r.createdAt),
    reactions: r.reactions?.length || 0,
    comments: r.comments?.length || 0,
});

const formatSession = (s: LOPSession): SessionItem => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    speaker: s.speaker?.name || 'Product Team',
    date: s.sessionDate ? formatDate(s.sessionDate) : undefined,
    duration: s.duration ? `${s.duration} min` : undefined,
    isUpcoming: s.status === 'upcoming',
    isEssential: s.isEssential,
    viewCount: s.viewCount,
});

interface PulseSignalLike {
    id: string;
    title: string;
    summary?: string;
    domain: string;
    priority: string;
    source?: { name: string };
    publishedAt: string;
    isRead?: boolean;
}

const formatSignal = (s: PulseSignalLike): SignalItem => ({
    id: s.id,
    title: s.title,
    summary: s.summary || '',
    domain: s.domain,
    priority: s.priority,
    source: s.source?.name,
    date: formatDate(s.publishedAt),
    isRead: s.isRead,
});

interface DiscussionLike {
    id: string;
    title: string;
    body?: string;
    authorName?: string;
    replyCount?: number;
    upvoteCount?: number;
    createdAt: string;
    status?: string;
}

const formatDiscussion = (d: DiscussionLike): DiscussionItem => ({
    id: d.id,
    title: d.title,
    excerpt: (d.body?.slice(0, 100) || '') + '...',
    author: d.authorName || 'Community Member',
    replies: d.replyCount || 0,
    upvotes: d.upvoteCount || 0,
    date: formatDate(d.createdAt),
    isResolved: d.status === 'resolved',
});

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
};

const getBadgeEmoji = (badge: string): string => {
    const emojis: Record<string, string> = {
        TOAST_DEBUT: '🎉',
        FIRST_TOAST: '🥂',
        RISING_STAR: '⭐',
        STAR_QUALITY: '🌟',
        CONSTELLATION: '✨',
        GRATEFUL_DOZEN: '🙏',
        TOAST_TREE: '🌳',
    };
    return emojis[badge] || '🏅';
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY EXPORTS (for backwards compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const getUserStats = (): StatsData | null => {
    try {
        const store = useToastXStore.getState();
        const currentUser = store.getCurrentUser();

        if (!currentUser) return null;

        const recentRecognitions = store.recognitions
            .filter(r => r.recipientIds.includes(currentUser.id) || r.giverId === currentUser.id)
            .slice(0, 5)
            .map((r, idx) => ({
                id: r.id || `activity-${idx}`,
                description: r.recipientIds.includes(currentUser.id)
                    ? `Received Toast from ${r.giverName}`
                    : `Gave Toast to ${r.recipients[0]?.name || 'someone'}`,
                amount: r.recipientIds.includes(currentUser.id) ? 25 : -10,
                date: formatDate(r.createdAt),
            }));

        return {
            balance: currentUser.credits || 0,
            monthlyEarned: currentUser.creditsThisMonth || 0,
            monthlySpent: 0,
            recentActivity: recentRecognitions,
        };
    } catch {
        return null;
    }
};

export const getLeaderboard = (
    type: 'MOST_RECOGNIZED' | 'MOST_GENEROUS' = 'MOST_RECOGNIZED',
    limit: number = 5
): LeaderboardEntry[] => {
    try {
        const store = useToastXStore.getState();
        const leaderboardData = store.getLeaderboard(type, 'THIS_MONTH', limit);
        const currentUserId = store.getCurrentUser()?.id;

        return leaderboardData.map(entry => ({
            rank: entry.rank,
            name: entry.userName,
            team: store.getUser(entry.userId)?.team || 'Unknown Team',
            points: entry.score * 50,
            avatar: entry.userAvatar,
            isCurrentUser: entry.userId === currentUserId,
        }));
    } catch {
        return [];
    }
};

export const getPersonFromSearch = (searchResults: SearchResponse): PersonData | null => {
    try {
        const person = searchResults.results.people[0];
        if (!person) return null;

        return {
            id: person.id,
            name: person.name,
            title: person.title,
            team: person.team,
            location: person.location || 'Remote',
            tenure: '3+ years',
            expertise: person.expertiseAreas?.slice(0, 5) || [],
            email: person.email,
        };
    } catch {
        return null;
    }
};

export const getDocumentFromSearch = (searchResults: SearchResponse): DocumentData | null => {
    try {
        const resource = searchResults.results.resources[0];
        if (!resource) return null;

        return {
            id: resource.id,
            title: resource.title,
            type: 'pdf',
            version: '1.0',
            updatedAt: formatDate(resource.updatedAt),
            author: 'Product Team',
            authorTeam: resource.pillar || 'Product Café',
            path: `Library > ${resource.pillar || 'Resources'}`,
            description: resource.description || 'No description available',
            views: 0,
            rating: 4.5,
            url: resource.url,
        };
    } catch {
        return null;
    }
};

export const getListFromSearch = (searchResults: SearchResponse): ListItem[] => {
    const items: ListItem[] = [];

    try {
        searchResults.results.resources.slice(0, 5).forEach(r => {
            items.push({
                id: r.id,
                title: r.title,
                subtitle: (r.description?.slice(0, 60) || '') + '...',
                date: formatDate(r.updatedAt),
                url: r.url,
            });
        });

        searchResults.results.faqs.slice(0, 3).forEach(f => {
            items.push({
                id: f.id,
                title: f.question,
                subtitle: (f.answerSummary?.slice(0, 60) || '') + '...',
            });
        });
    } catch { /* ignore */ }

    return items;
};

export const getAllUsers = (): ToastUser[] => {
    try {
        const store = useToastXStore.getState();
        return Array.from(store.users.values());
    } catch {
        return [];
    }
};

export const getCurrentUserName = (): string => {
    try {
        return useToastXStore.getState().getCurrentUser()?.name || 'there';
    } catch {
        return 'there';
    }
};
