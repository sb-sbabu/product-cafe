import React, { useState, useRef, useCallback } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ChatPanel } from '../chat/ChatPanel';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores';
import { useDock } from '../../contexts/DockContext';

interface LayoutProps {
    children: React.ReactNode;
    activeNav?: string;
    onNavigate?: (itemId: string) => void;
    onSearch?: (query: string) => void;
    isMobile?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    activeNav = 'home',
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

            {/* Tab Navigation */}
            <Navigation
                variant="tabs"
                activeItem={activeNav}
                onNavigate={onNavigate}
                onChatOpen={openChat}
            />

            {/* Main Content - Squeeze Layout: shrinks when dock expands */}
            <main
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 transition-all duration-300 ease-out"
                style={{
                    marginRight: !isMobile ? `${dockWidth}px` : undefined,
                }}
            >
                {children}
            </main>

            {/* Bottom Navigation (Mobile) */}
            <div className="md:hidden">
                <Navigation
                    variant="bottom"
                    activeItem={activeNav}
                    onNavigate={onNavigate}
                    onChatOpen={openChat}
                />
            </div>

            {/* Floating Chat Button (Desktop) - BUG 2 FIX: Position relative to dock */}
            <button
                onClick={openChat}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                title="Ask Café Assistant"
                className={cn(
                    `hidden md:flex fixed z-40
           items-center gap-3 px-5 py-3 bg-emerald-500 text-white
           rounded-full shadow-lg hover:bg-emerald-600 hover:shadow-xl
           transition-all duration-200 group cursor-grab active:cursor-grabbing`,
                    isChatOpen && 'hidden'
                )}
                style={
                    dragPosition
                        ? { left: dragPosition.x, top: dragPosition.y, right: 'auto', bottom: 'auto' }
                        : { right: `${dockWidth + 24}px`, bottom: '24px' }  /* BUG 2 FIX: dockWidth + 24 */
                }
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                <span className="font-medium">Ask Café Assistant</span>
            </button>

            {/* Chat Panel */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={closeChat}
            />
        </div>
    );
};
