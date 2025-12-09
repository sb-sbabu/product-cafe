/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getUnreadCount as getIntelligentUnreadCount } from '../lib/pulse/notifications';

/**
 * Dock Context - Side pane with 2-state management
 * 
 * States:
 * - collapsed: Narrow 48px strip with tab icons (always visible)
 * - expanded: Full 360px panel
 * 
 * The dock is ALWAYS visible - it never fully hides.
 * NOW INTEGRATED with intelligent notification engine for real unread counts.
 */

// Basic types
export type DockTab = 'ask' | 'discuss' | 'activity' | 'directory';
export type DockState = 'closed' | 'collapsed' | 'expanded';

export interface PageContext {
    type: 'home' | 'resource' | 'faq' | 'person' | 'search' | 'library' | 'community' | 'grab-and-go' | 'my-cafe' | 'demo' | 'admin' | 'profile' | 'leaderboard' | 'pulse' | 'toast' | 'toast-x' | 'lop' | 'lop-session' | 'lop-archive' | 'lop-path' | 'lop-analytics' | 'credits';
    resourceId?: string;
    faqId?: string;
    personId?: string;
    searchQuery?: string;
    title?: string;
}

interface DockContextState {
    dockState: DockState;
    activeTab: DockTab;
    pageContext: PageContext;
    unreadCount: number;
}

interface DockContextType extends DockContextState {
    // State transitions
    openDock: () => void;
    closeDock: () => void;
    toggleDock: () => void;
    expandDock: () => void;
    collapseDock: () => void;
    toggleCollapse: () => void;

    // Tab management
    setActiveTab: (tab: DockTab) => void;
    setPageContext: (context: PageContext) => void;
    setUnreadCount: (count: number) => void;

    // Computed states
    isOpen: boolean;
    isExpanded: boolean;
    isCollapsed: boolean;
    dockWidth: number; // For squeeze layout
}

const DockContext = createContext<DockContextType | undefined>(undefined);

// LocalStorage key for persistence
const DOCK_STATE_KEY = 'cafe-dock-state';

function loadPersistedState(): Partial<DockContextState> {
    try {
        const stored = localStorage.getItem(DOCK_STATE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                dockState: parsed.dockState || 'collapsed',
                activeTab: parsed.activeTab || 'ask',
            };
        }
    } catch {
        // Ignore parse errors
    }
    return { dockState: 'collapsed', activeTab: 'ask' };
}

function persistState(state: Partial<DockContextState>) {
    try {
        localStorage.setItem(DOCK_STATE_KEY, JSON.stringify({
            dockState: state.dockState,
            activeTab: state.activeTab,
        }));
    } catch {
        // Ignore quota errors
    }
}

export function DockProvider({ children }: { children: ReactNode }) {
    const persisted = loadPersistedState();

    const [state, setState] = useState<DockContextState>({
        dockState: persisted.dockState || 'collapsed',
        activeTab: persisted.activeTab || 'ask',
        pageContext: { type: 'home' },
        unreadCount: 0, // Will be synced from intelligent engine
    });

    // Sync unread count with intelligent notification engine
    useEffect(() => {
        const syncUnreadCount = () => {
            const count = getIntelligentUnreadCount();
            setState(prev => ({ ...prev, unreadCount: count }));
        };

        syncUnreadCount();
        const interval = setInterval(syncUnreadCount, 10000); // Sync every 10s
        return () => clearInterval(interval);
    }, []);

    // Persist state changes
    useEffect(() => {
        persistState({ dockState: state.dockState, activeTab: state.activeTab });
    }, [state.dockState, state.activeTab]);

    // Open dock (to expanded state)
    const openDock = useCallback(() => {
        setState(prev => ({ ...prev, dockState: 'expanded' }));
    }, []);

    // Close dock = collapse to strip (dock is always visible)
    const closeDock = useCallback(() => {
        setState(prev => ({ ...prev, dockState: 'collapsed' }));
    }, []);

    // Toggle between collapsed and expanded
    const toggleDock = useCallback(() => {
        setState(prev => ({
            ...prev,
            dockState: prev.dockState === 'collapsed' ? 'expanded' : 'collapsed',
        }));
    }, []);

    // Expand from collapsed
    const expandDock = useCallback(() => {
        setState(prev => ({ ...prev, dockState: 'expanded' }));
    }, []);

    // Collapse to strip
    const collapseDock = useCallback(() => {
        setState(prev => ({ ...prev, dockState: 'collapsed' }));
    }, []);

    // Toggle between collapsed and expanded
    const toggleCollapse = useCallback(() => {
        setState(prev => ({
            ...prev,
            dockState: prev.dockState === 'collapsed' ? 'expanded' : 'collapsed',
        }));
    }, []);

    const setActiveTab = useCallback((tab: DockTab) => {
        setState(prev => ({ ...prev, activeTab: tab, dockState: 'expanded' }));
    }, []);

    const setPageContext = useCallback((context: PageContext) => {
        setState(prev => ({ ...prev, pageContext: context }));
    }, []);

    const setUnreadCount = useCallback((count: number) => {
        setState(prev => ({ ...prev, unreadCount: count }));
    }, []);

    // Computed states - dock is always open (visible)
    const isOpen = true; // Dock never fully hides
    const isExpanded = state.dockState === 'expanded';
    const isCollapsed = state.dockState === 'collapsed';
    const dockWidth = isExpanded ? 380 : 70; // For squeeze layout

    return (
        <DockContext.Provider value={{
            ...state,
            openDock,
            closeDock,
            toggleDock,
            expandDock,
            collapseDock,
            toggleCollapse,
            setActiveTab,
            setPageContext,
            setUnreadCount,
            isOpen,
            isExpanded,
            isCollapsed,
            dockWidth,
        }}>
            {children}
        </DockContext.Provider>
    );
}

export function useDock() {
    const context = useContext(DockContext);
    if (!context) {
        throw new Error('useDock must be used within a DockProvider');
    }
    return context;
}
