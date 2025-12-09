import React, { useState, useRef, useCallback } from 'react';
import {
    LayoutDashboard,
    Menu,
    X,
    MessageSquare,
    Coffee
} from 'lucide-react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ChatPanel } from '../chat/ChatPanel';
import { DailyBrewDock } from '../daily-brew/DailyBrewDock';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores';
import { useDock } from '../../contexts/DockContext';

interface LayoutProps {
    children: React.ReactNode;
    activePage: 'home' | 'library' | 'community' | 'grab-and-go' | 'my-cafe' | 'person' | 'faq' | 'resource' | 'search' | 'demo' | 'leaderboard' | 'profile' | 'admin' | 'pulse' | 'lop' | 'lop-session' | 'lop-archive' | 'lop-path' | 'lop-analytics' | 'credits' | 'toast' | 'toast_hidden';
    onNavigate?: (itemId: string) => void;
    onSearch?: (query: string) => void;
    isMobile?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    activePage = 'home',
    onNavigate,
    onSearch,
    isMobile,
}) => {
    const { isChatOpen, openChat, closeChat } = useUIStore();
    const { dockWidth } = useDock();

    // BUG 2b FIX: Draggable state for Café Assistant button
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleDragStart = useCallback((e: React.PointerEvent) => {
        isDragging.current = true;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handleDragMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        setDragPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    }, []);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
    }, []);

    return (
        <div className="min-h-screen bg-surface-muted">
            {/* Fixed Header */}
            <Header onSearch={onSearch} userName="Natasha" />

            {/* Tab Navigation - REMOVED: Sidebar now handles navigation */}

            {/* Main Content - CENTERED Layout: Use mx-auto for true center. Dock overlays when expanded. */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
                {children}
            </main>

            {/* Bottom Navigation (Mobile) */}
            <div className="md:hidden">
                <Navigation
                    variant="bottom"
                    activeItem={activePage}
                    onNavigate={onNavigate}
                    onChatOpen={openChat}
                />
            </div>

            {/* Floating Chat Button (Desktop) - Ask Barista */}
            <button
                onClick={openChat}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                title="Ask Barista"
                className={cn(
                    `hidden md:flex fixed z-40
           items-center gap-2 px-5 py-3 bg-emerald-600 text-white
           rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl
           transition-all duration-200 group cursor-grab active:cursor-grabbing`,
                    isChatOpen && 'hidden'
                )}
                style={
                    dragPosition
                        ? { left: dragPosition.x, top: dragPosition.y, right: 'auto', bottom: 'auto' }
                        : { right: `${dockWidth + 24}px`, bottom: '24px' }
                }
            >
                <span className="font-medium flex items-center gap-2">
                    <Coffee className="w-5 h-5" /> Ask Barista
                </span>
            </button>

            {/* Chat Panel - BUG 2/3 FIX: Pass position info for dock awareness */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={closeChat}
                dockWidth={dockWidth}
                assistantPosition={dragPosition}
            />

            {/* The Daily Brew - Unified Notifications Panel (same size as CafeDock, mutually exclusive) */}
            <DailyBrewDock />
        </div>
    );
};
