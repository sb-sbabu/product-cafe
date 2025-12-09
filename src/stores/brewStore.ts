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

export const useBrewStore = create<BrewStoreState>((set, get) => ({
    menu: [],
    isPressOpen: false,
    activeFilter: 'all',
    stats: {
        steamPressure: 0,
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
