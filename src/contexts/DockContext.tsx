/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Dock Context
 * 
 * Manages the state of Café Dock across the application:
 * - Whether dock is open/collapsed
 * - Which tab is active
 * - Current page context (what resource/page user is viewing)
 */

export type DockTab = 'ask' | 'discuss' | 'activity';

export interface PageContext {
    type: 'home' | 'resource' | 'faq' | 'person' | 'search' | 'library' | 'community' | 'grab-and-go' | 'my-cafe';
    resourceId?: string;
    faqId?: string;
    personId?: string;
    searchQuery?: string;
    title?: string;
}

interface DockState {
    isOpen: boolean;
    isExpanded: boolean;
    activeTab: DockTab;
    pageContext: PageContext;
    unreadCount: number;
}

interface DockContextType extends DockState {
    openDock: () => void;
    closeDock: () => void;
    toggleDock: () => void;
    setActiveTab: (tab: DockTab) => void;
    setPageContext: (context: PageContext) => void;
    expandDock: () => void;
    collapseDock: () => void;
    setUnreadCount: (count: number) => void;
}

const DockContext = createContext<DockContextType | undefined>(undefined);

export function DockProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<DockState>({
        isOpen: false,
        isExpanded: false,
        activeTab: 'ask',
        pageContext: { type: 'home' },
        unreadCount: 3, // Default from mock data
    });

    const openDock = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: true }));
    }, []);

    const closeDock = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false, isExpanded: false }));
    }, []);

    const toggleDock = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    }, []);

    const setActiveTab = useCallback((tab: DockTab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    }, []);

    const setPageContext = useCallback((context: PageContext) => {
        setState(prev => ({ ...prev, pageContext: context }));
    }, []);

    const expandDock = useCallback(() => {
        setState(prev => ({ ...prev, isExpanded: true }));
    }, []);

    const collapseDock = useCallback(() => {
        setState(prev => ({ ...prev, isExpanded: false }));
    }, []);

    const setUnreadCount = useCallback((count: number) => {
        setState(prev => ({ ...prev, unreadCount: count }));
    }, []);

    return (
        <DockContext.Provider value={{
            ...state,
            openDock,
            closeDock,
            toggleDock,
            setActiveTab,
            setPageContext,
            expandDock,
            collapseDock,
            setUnreadCount,
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
