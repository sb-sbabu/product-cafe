/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

/**
 * Dock Context - Enhanced with 3-state dock management
 * 
 * States:
 * - closed: Dock fully hidden, FAB visible
 * - collapsed: Narrow 56px strip with tab icons (desktop only)
 * - expanded: Full 360px panel
 */

export type DockTab = 'ask' | 'discuss' | 'activity';
export type DockState = 'closed' | 'collapsed' | 'expanded';

export interface PageContext {
    type: 'home' | 'resource' | 'faq' | 'person' | 'search' | 'library' | 'community' | 'grab-and-go' | 'my-cafe';
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
        unreadCount: 3,
    });

    // Persist state changes
    useEffect(() => {
        persistState({ dockState: state.dockState, activeTab: state.activeTab });
    }, [state.dockState, state.activeTab]);

    // Open dock (to expanded state)
    const openDock = useCallback(() => {
        setState(prev => ({ ...prev, dockState: 'expanded' }));
    }, []);

    // Close dock completely
    const closeDock = useCallback(() => {
        setState(prev => ({ ...prev, dockState: 'closed' }));
    }, []);

    // Toggle between closed and expanded
    const toggleDock = useCallback(() => {
        setState(prev => ({
            ...prev,
            dockState: prev.dockState === 'closed' ? 'expanded' : 'closed',
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

    // Computed states
    const isOpen = state.dockState !== 'closed';
    const isExpanded = state.dockState === 'expanded';
    const isCollapsed = state.dockState === 'collapsed';

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
