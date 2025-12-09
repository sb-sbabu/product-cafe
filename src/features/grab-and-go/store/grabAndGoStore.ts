/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAB & GO — Zustand Store
 * State management for pinned favorites, recent history, and pending requests
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuickAction } from '../actions/quickActions';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RecentItem {
    actionId: string;
    accessedAt: number; // timestamp
}

export interface PendingRequest {
    id: string;
    title: string;
    type: 'access' | 'software' | 'other';
    status: 'pending' | 'approved' | 'denied';
    submittedAt: number;
    resolvedAt?: number;
}

export interface UpcomingDeadline {
    id: string;
    title: string;
    dueAt: number;
    type: 'release' | 'review' | 'meeting' | 'other';
}

interface GrabAndGoState {
    // User's pinned quick actions (max 8)
    pinnedActionIds: string[];

    // Recently accessed actions (max 10)
    recentItems: RecentItem[];

    // Pending requests (mock for demo)
    pendingRequests: PendingRequest[];

    // Upcoming deadlines (mock for demo)
    upcomingDeadlines: UpcomingDeadline[];

    // User preferences
    userRole: 'pm' | 'po' | 'leader' | 'new-hire' | 'all';
}

interface GrabAndGoActions {
    // Pinned actions
    pinAction: (actionId: string) => void;
    unpinAction: (actionId: string) => void;
    reorderPins: (actionIds: string[]) => void;
    isPinned: (actionId: string) => boolean;

    // Recent history
    recordAccess: (actionId: string) => void;
    clearHistory: () => void;

    // Pending requests
    addPendingRequest: (request: Omit<PendingRequest, 'id' | 'submittedAt'>) => void;
    updateRequestStatus: (id: string, status: PendingRequest['status']) => void;

    // User preferences
    setUserRole: (role: GrabAndGoState['userRole']) => void;

    // Getters
    getPinnedActions: () => string[];
    getRecentActionIds: () => string[];
}

type GrabAndGoStore = GrabAndGoState & GrabAndGoActions;

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA FOR DEMO
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PENDING_REQUESTS: PendingRequest[] = [
    {
        id: 'req-1',
        title: 'Jira Access',
        type: 'access',
        status: 'approved',
        submittedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        resolvedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    },
    {
        id: 'req-2',
        title: 'Smartsheet Editor License',
        type: 'software',
        status: 'pending',
        submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    },
];

const MOCK_DEADLINES: UpcomingDeadline[] = [
    {
        id: 'dl-1',
        title: 'Q4 Roadmap Review',
        dueAt: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
        type: 'review',
    },
    {
        id: 'dl-2',
        title: 'Feature Release: Patient Portal v2',
        dueAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        type: 'release',
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════

const initialState: GrabAndGoState = {
    pinnedActionIds: ['new-prd', 'open-jira', 'view-roadmap'], // Default pins
    recentItems: [],
    pendingRequests: MOCK_PENDING_REQUESTS,
    upcomingDeadlines: MOCK_DEADLINES,
    userRole: 'pm',
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useGrabAndGoStore = create<GrabAndGoStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────
            // Pinned Actions
            // ─────────────────────────────────────────────────────────────────

            pinAction: (actionId: string) => {
                set(state => {
                    if (state.pinnedActionIds.includes(actionId)) return state;
                    if (state.pinnedActionIds.length >= 8) {
                        // Replace the last item if at max
                        return {
                            pinnedActionIds: [...state.pinnedActionIds.slice(0, 7), actionId],
                        };
                    }
                    return {
                        pinnedActionIds: [...state.pinnedActionIds, actionId],
                    };
                });
            },

            unpinAction: (actionId: string) => {
                set(state => ({
                    pinnedActionIds: state.pinnedActionIds.filter(id => id !== actionId),
                }));
            },

            reorderPins: (actionIds: string[]) => {
                set({ pinnedActionIds: actionIds.slice(0, 8) });
            },

            isPinned: (actionId: string) => {
                return get().pinnedActionIds.includes(actionId);
            },

            // ─────────────────────────────────────────────────────────────────
            // Recent History
            // ─────────────────────────────────────────────────────────────────

            recordAccess: (actionId: string) => {
                set(state => {
                    // Remove if already in history
                    const filtered = state.recentItems.filter(r => r.actionId !== actionId);
                    // Add to front
                    const updated = [
                        { actionId, accessedAt: Date.now() },
                        ...filtered,
                    ].slice(0, 10); // Keep max 10
                    return { recentItems: updated };
                });
            },

            clearHistory: () => {
                set({ recentItems: [] });
            },

            // ─────────────────────────────────────────────────────────────────
            // Pending Requests
            // ─────────────────────────────────────────────────────────────────

            addPendingRequest: (request) => {
                set(state => ({
                    pendingRequests: [
                        ...state.pendingRequests,
                        {
                            ...request,
                            id: `req-${Date.now()}`,
                            submittedAt: Date.now(),
                        },
                    ],
                }));
            },

            updateRequestStatus: (id, status) => {
                set(state => ({
                    pendingRequests: state.pendingRequests.map(r =>
                        r.id === id
                            ? { ...r, status, resolvedAt: status !== 'pending' ? Date.now() : undefined }
                            : r
                    ),
                }));
            },

            // ─────────────────────────────────────────────────────────────────
            // User Preferences
            // ─────────────────────────────────────────────────────────────────

            setUserRole: (role) => {
                set({ userRole: role });
            },

            // ─────────────────────────────────────────────────────────────────
            // Getters
            // ─────────────────────────────────────────────────────────────────

            getPinnedActions: () => get().pinnedActionIds,

            getRecentActionIds: () => get().recentItems.map(r => r.actionId),
        }),
        {
            name: 'grab-and-go-store',
            partialize: (state) => ({
                pinnedActionIds: state.pinnedActionIds,
                recentItems: state.recentItems,
                userRole: state.userRole,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const usePinnedActions = () => useGrabAndGoStore(state => state.pinnedActionIds);
export const useRecentItems = () => useGrabAndGoStore(state => state.recentItems);
export const usePendingRequests = () => useGrabAndGoStore(state => state.pendingRequests);
export const useUpcomingDeadlines = () => useGrabAndGoStore(state => state.upcomingDeadlines);
