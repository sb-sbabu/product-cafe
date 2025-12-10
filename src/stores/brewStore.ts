import { create } from 'zustand';
import type { BrewItem, RoastProfile, BrewStats } from '../lib/daily-brew/types';
import { calculateCaffeineScore, determineRoastProfile, getFreshnessDecay } from '../lib/daily-brew/barista-engine';
import type { PulseSignal, SignalPriority } from '../lib/pulse/types';
import type { Recognition } from '../features/toast-x/types/recognition';
import type { LOPSession } from '../lib/lop/types';

interface BrewStoreState {
    menu: BrewItem[];
    isPressOpen: boolean;
    activeFilter: 'all' | RoastProfile;
    stats: BrewStats;
    _hasInitialized: boolean;

    // Actions
    addBrew: (item: Omit<BrewItem, 'id' | 'roast' | 'caffeineScore' | 'servedAt' | 'isRead'> & { id?: string; scoreOverride?: number }) => void;
    sip: (id: string) => void; // Mark as read/peek
    press: () => void; // Toggle UI
    setFilter: (filter: 'all' | RoastProfile) => void;
    refreshMenu: () => void; // Re-calculate freshness/decay
    initializeSourcing: () => void;

    // Debug
    generateMockBrew: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL DEMO BREW ITEMS — Pre-populated for demo purposes
// 2-5 items per category for rich demo experience
// ═══════════════════════════════════════════════════════════════════════════
const INITIAL_BREW_ITEMS: BrewItem[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // RECOGNITION (Toast) — 4 items
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'demo-toast-1',
        title: 'Sarah Chen recognized you',
        message: 'Amazing work on the Q4 dashboard launch! Your attention to detail saved us countless hours.',
        source: 'toast',
        roast: 'dark',
        caffeineScore: 90,
        flavorNotes: ['recognition', 'DO_IT_DIFFERENTLY', 'dashboard'],
        timestamp: Date.now() - 1000 * 60 * 15, // 15 min ago
        servedAt: Date.now() - 1000 * 60 * 15,
        isRead: false,
        link: '/toast',
        actors: [{ name: 'Sarah Chen' }],
    },
    {
        id: 'demo-toast-2',
        title: 'Alex Rivera gave you kudos',
        message: 'Your presentation to the leadership team was outstanding. You made complex data simple!',
        source: 'toast',
        roast: 'dark',
        caffeineScore: 85,
        flavorNotes: ['recognition', 'OWN_THE_OUTCOME', 'presentation'],
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 2,
        isRead: false,
        link: '/toast',
        actors: [{ name: 'Alex Rivera' }],
    },
    {
        id: 'demo-toast-3',
        title: 'Team Toast from Product Analytics',
        message: 'Shoutout to everyone who contributed to the eligibility improvements. 15% accuracy increase!',
        source: 'toast',
        roast: 'medium',
        caffeineScore: 75,
        flavorNotes: ['recognition', 'BE_ALL_IN', 'team'],
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 5,
        isRead: false,
        link: '/toast',
        actors: [{ name: 'Product Analytics Team' }],
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // MARKET/PULSE — 5 items (Competitive Intelligence)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'demo-pulse-1',
        title: 'Waystar announces AI prior auth platform',
        message: 'Critical: New ML-based system promises 40% faster authorization decisions. Direct competitor threat.',
        source: 'pulse',
        roast: 'dark',
        caffeineScore: 95,
        flavorNotes: ['market', 'competitive', 'ai', 'critical'],
        timestamp: Date.now() - 1000 * 60 * 45, // 45 min ago
        servedAt: Date.now() - 1000 * 60 * 45,
        isRead: false,
        link: '/pulse',
    },
    {
        id: 'demo-pulse-2',
        title: 'Change Healthcare completes Optum integration',
        message: 'Combined entity now serves 5,000+ hospitals. Major market consolidation complete.',
        source: 'pulse',
        roast: 'dark',
        caffeineScore: 88,
        flavorNotes: ['market', 'competitive', 'merger'],
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 3,
        isRead: false,
        link: '/pulse',
    },
    {
        id: 'demo-pulse-3',
        title: 'CMS 2025 interoperability rules finalized',
        message: 'FHIR R4 mandates for all payers by Jan 2025. Prior auth data sharing requirements confirmed.',
        source: 'pulse',
        roast: 'medium',
        caffeineScore: 70,
        flavorNotes: ['market', 'regulatory', 'cms'],
        timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 6,
        isRead: false,
        link: '/pulse',
    },
    {
        id: 'demo-pulse-4',
        title: 'Akasa raises $60M for AI RCM',
        message: 'Series C funding to accelerate generative AI for denials management. Growing competitor.',
        source: 'pulse',
        roast: 'medium',
        caffeineScore: 65,
        flavorNotes: ['market', 'competitive', 'funding'],
        timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 8,
        isRead: true,
        link: '/pulse',
    },
    {
        id: 'demo-pulse-5',
        title: 'Epic launches payer platform module',
        message: 'Direct payer connectivity in EHR. Could reduce clearinghouse dependency.',
        source: 'pulse',
        roast: 'medium',
        caffeineScore: 60,
        flavorNotes: ['market', 'technology', 'ehr'],
        timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 12,
        isRead: true,
        link: '/pulse',
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // LEARNING (LOP) — 3 items
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'demo-lop-1',
        title: 'New LOP: Product Strategy 101',
        message: 'Alex Rivera presents fundamentals of product-led growth. Live tomorrow at 2pm ET.',
        source: 'lop',
        roast: 'medium',
        caffeineScore: 65,
        flavorNotes: ['learning', 'session', 'product-strategy'],
        timestamp: Date.now() - 1000 * 60 * 60 * 1, // 1 hour ago
        servedAt: Date.now() - 1000 * 60 * 60 * 1,
        isRead: false,
        link: '/lop',
        actors: [{ name: 'Alex Rivera' }],
    },
    {
        id: 'demo-lop-2',
        title: 'Recording available: AI in Healthcare RCM',
        message: 'Missed the live session? Watch Dr. Patel discuss AI applications in revenue cycle.',
        source: 'lop',
        roast: 'light',
        caffeineScore: 50,
        flavorNotes: ['learning', 'recording', 'ai'],
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        servedAt: Date.now() - 1000 * 60 * 60 * 24,
        isRead: false,
        link: '/lop',
        actors: [{ name: 'Dr. Sanjay Patel' }],
    },
    {
        id: 'demo-lop-3',
        title: 'Complete your LOP feedback',
        message: 'Share your thoughts on "Building for Scale" session. Takes 2 minutes!',
        source: 'lop',
        roast: 'light',
        caffeineScore: 35,
        flavorNotes: ['learning', 'feedback'],
        timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
        servedAt: Date.now() - 1000 * 60 * 60 * 48,
        isRead: true,
        link: '/lop',
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEM REMINDERS — 2 items
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'demo-system-1',
        title: 'Sprint planning in 30 minutes',
        message: 'Join the Product team for Q1 sprint planning. Zoom link in calendar.',
        source: 'system',
        roast: 'medium',
        caffeineScore: 55,
        flavorNotes: ['meeting', 'reminder', 'sprint'],
        timestamp: Date.now() - 1000 * 60 * 20, // 20 min ago
        servedAt: Date.now() - 1000 * 60 * 20,
        isRead: false,
    },
    {
        id: 'demo-system-2',
        title: 'Weekly metrics report ready',
        message: 'Your dashboard performance summary is available. View key trends.',
        source: 'system',
        roast: 'light',
        caffeineScore: 40,
        flavorNotes: ['report', 'metrics'],
        timestamp: Date.now() - 1000 * 60 * 60 * 10, // 10 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 10,
        isRead: true,
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // COMMUNITY/CHAT — 3 items
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'demo-chat-1',
        title: 'Mike Johnson replied to your post',
        message: 'Great point about API versioning! Have you considered GraphQL federation?',
        source: 'chat',
        roast: 'medium',
        caffeineScore: 55,
        flavorNotes: ['discussion', 'reply', 'api'],
        timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 4,
        isRead: false,
        link: '/community',
        actors: [{ name: 'Mike Johnson' }],
    },
    {
        id: 'demo-chat-2',
        title: 'New discussion: Prior Auth Best Practices',
        message: 'Emily started a discussion on reducing prior auth turnaround times.',
        source: 'chat',
        roast: 'light',
        caffeineScore: 45,
        flavorNotes: ['discussion', 'prior-auth'],
        timestamp: Date.now() - 1000 * 60 * 60 * 7, // 7 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 7,
        isRead: false,
        link: '/community',
        actors: [{ name: 'Emily Watson' }],
    },
    {
        id: 'demo-chat-3',
        title: 'Your answer was marked as helpful',
        message: '3 people found your response about claim denials helpful!',
        source: 'chat',
        roast: 'light',
        caffeineScore: 40,
        flavorNotes: ['recognition', 'community'],
        timestamp: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
        servedAt: Date.now() - 1000 * 60 * 60 * 18,
        isRead: true,
        link: '/community',
    },
];

export const useBrewStore = create<BrewStoreState>((set, get) => ({
    menu: INITIAL_BREW_ITEMS,
    isPressOpen: false,
    activeFilter: 'all',
    stats: {
        steamPressure: INITIAL_BREW_ITEMS.filter(i => !i.isRead).length,
        dailyIntake: 0,
        favoriteRoast: 'medium',
    },
    _hasInitialized: false,

    initializeSourcing: () => {
        // Prevent double initialization
        if (get()._hasInitialized) return;
        set({ _hasInitialized: true });

        // 1. TOAST-X SOURCE
        // We'll poll or subscribe. For simplicity in this architecture, we'll poll on mount 
        // and then rely on store subscriptions if available, or just simple state selection.
        // Ideally, we subscribe to state changes.

        // Import stores dynamically to avoid circular deps if necessary, 
        // but here we can rely on the module system.
        import('../features/toast-x').then(({ useToastXStore }) => {
            useToastXStore.subscribe((state) => {
                state.recognitions.forEach((r: Recognition) => {
                    const id = `toast:${r.id}`;
                    const { menu } = get();
                    if (menu.some(i => i.id === id)) return; // Dedup

                    // It's a new toast!
                    get().addBrew({
                        id, // Deterministic ID
                        title: `Toast from ${r.giverName}`,
                        message: r.message,
                        source: 'toast',
                        flavorNotes: ['recognition', r.value, ...(r.expertAreas || [])],
                        timestamp: new Date(r.createdAt).getTime(),
                    });
                });
            });
        });

        // 2. PULSE SOURCE
        import('../lib/pulse/usePulseStore').then(({ usePulseStore }) => {
            usePulseStore.subscribe((state) => {
                state.signals.forEach((s: PulseSignal) => {
                    const id = `pulse:${s.id}`;
                    if (get().menu.some(i => i.id === id)) return;

                    const priority = s.priority as SignalPriority;
                    get().addBrew({
                        id,
                        title: s.title,
                        message: s.summary,
                        source: 'pulse',
                        flavorNotes: ['market', s.domain.toLowerCase()],
                        timestamp: new Date(s.publishedAt).getTime(),
                        scoreOverride: priority === 'high' || priority === 'critical' ? 80 : 40
                    });
                });
            });
        });

        // 3. LOP SOURCE (New Sessions)
        import('../stores/lopStore').then(({ useLOPStore }) => {
            useLOPStore.subscribe((state) => {
                state.sessions.forEach((s: LOPSession) => {
                    const id = `lop:${s.id}`;
                    if (get().menu.some(i => i.id === id)) return;

                    // Only show sessions from the last 7 days as "Fresh" brew
                    const sessionTime = new Date(s.sessionDate || Date.now()).getTime();
                    const isRecent = (Date.now() - sessionTime) < (7 * 24 * 60 * 60 * 1000);

                    if (isRecent) {
                        get().addBrew({
                            id,
                            title: `New LOP Session: ${s.title}`,
                            message: s.subtitle || `With ${s.speaker.name}`,
                            source: 'lop',
                            flavorNotes: ['learning', 'session', ...s.topics],
                            timestamp: sessionTime,
                            scoreOverride: 60
                        });
                    }
                });
            });
        });

        // 4. DISCUSSION/CHAT SOURCE (Phase 2.50)
        import('../stores/discussionStore').then(({ useDiscussionStore }) => {
            useDiscussionStore.subscribe((state) => {
                // Surface recent discussions
                state.discussions.slice(0, 10).forEach((d) => {
                    const id = `chat:disc:${d.id}`;
                    if (get().menu.some(i => i.id === id)) return;

                    const discussionTime = new Date(d.createdAt).getTime();
                    const isRecent = (Date.now() - discussionTime) < (3 * 24 * 60 * 60 * 1000); // 3 days

                    if (isRecent && d.status === 'open') {
                        get().addBrew({
                            id,
                            title: d.title,
                            message: `${d.authorName} started a discussion`,
                            source: 'chat',
                            flavorNotes: ['discussion', 'community', d.attachedToType],
                            timestamp: discussionTime,
                            link: `/community/discussions/${d.id}`,
                            scoreOverride: d.upvoteCount > 5 ? 55 : 35,
                            actors: [{ name: d.authorName }]
                        });
                    }
                });

                // Surface recent replies on user's discussions (would need user context)
                state.replies.slice(0, 5).forEach((r) => {
                    const id = `chat:reply:${r.id}`;
                    if (get().menu.some(i => i.id === id)) return;

                    const replyTime = new Date(r.createdAt).getTime();
                    const isRecent = (Date.now() - replyTime) < (24 * 60 * 60 * 1000); // 1 day

                    if (isRecent) {
                        get().addBrew({
                            id,
                            title: `New reply from ${r.authorName}`,
                            message: r.body.substring(0, 100) + (r.body.length > 100 ? '...' : ''),
                            source: 'chat',
                            flavorNotes: ['reply', 'discussion'],
                            timestamp: replyTime,
                            link: `/community/discussions/${r.discussionId}`,
                            scoreOverride: r.isAcceptedAnswer ? 70 : 30,
                            actors: [{ name: r.authorName }]
                        });
                    }
                });
            });
        });
    },

    addBrew: (input) => {
        const { menu } = get();
        // 1. Calculate Score (The Roast)
        // For now, we simulate inputs slightly. In Phase 4.2 we connect real data.
        const rawScore = input.scoreOverride ?? calculateCaffeineScore(
            input.source === 'toast' ? 'toast_received' : 'system_update',
            'peer'
        );

        const roast = determineRoastProfile(rawScore);

        // Allow ID to be passed in, or generate one
        const id = (input as any).id || crypto.randomUUID();

        // Dedup check again just in case
        if (menu.some(i => i.id === id)) return;

        const newItem: BrewItem = {
            ...input,
            id,
            caffeineScore: rawScore,
            roast,
            servedAt: Date.now(),
            isRead: false,
        };

        const newMenu = [newItem, ...menu].sort((a, b) => b.caffeineScore - a.caffeineScore);

        set({
            menu: newMenu,
            stats: {
                ...get().stats,
                steamPressure: newMenu.filter(i => !i.isRead).length
            }
        });
    },

    sip: (id) => {
        const { menu, stats } = get();
        const newMenu = menu.map(item =>
            item.id === id ? { ...item, isRead: true } : item
        );

        set({
            menu: newMenu,
            stats: {
                ...stats,
                steamPressure: newMenu.filter(i => !i.isRead).length,
                dailyIntake: stats.dailyIntake + 1
            }
        });
    },

    press: () => set(state => ({ isPressOpen: !state.isPressOpen })),

    setFilter: (filter) => set({ activeFilter: filter }),

    refreshMenu: () => {
        const { menu } = get();
        const now = Date.now();

        // Apply Freshness Curve (Decay)
        const refreshedMenu = menu.map(item => {
            const decayedScore = getFreshnessDecay(item, now);
            return {
                ...item,
                caffeineScore: decayedScore,
                // Re-evaluate roast profile based on decayed score? 
                // Strategy: Maybe items drop from Shot to Blend as they cool down.
                roast: determineRoastProfile(decayedScore)
            };
        }).sort((a, b) => b.caffeineScore - a.caffeineScore); // Keep sorted by heat

        set({ menu: refreshedMenu });
    },

    generateMockBrew: () => {
        const mocks = [
            { title: "Alice sent you a Toast", message: "Great job on the deployment!", source: 'toast' as const, override: 85 },
            { title: "JIRA Ticket Updated", message: "PROD-123 is now Ready for QA", source: 'system' as const, override: 60 },
            { title: "New Market Pulse", message: "Competitor X launched a feature", source: 'pulse' as const, override: 45 },
            { title: "Team Lunch", message: "Don't forget voting closes soon", source: 'chat' as const, override: 20 },
        ];

        const random = mocks[Math.floor(Math.random() * mocks.length)];
        get().addBrew({
            title: random.title,
            message: random.message,
            source: random.source,
            timestamp: Date.now(),
            flavorNotes: ['demo', 'mock'],
            scoreOverride: random.override
        });
    }
}));
