import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ChatPanel } from '../chat/ChatPanel';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores';

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
}) => {
    const { isChatOpen, openChat, closeChat } = useUIStore();

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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
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

            {/* Floating Chat Button (Desktop) */}
            <button
                onClick={openChat}
                className={cn(
                    `hidden md:flex fixed bottom-6 right-6 z-40
           items-center gap-3 px-5 py-3 bg-emerald-500 text-white
           rounded-full shadow-lg hover:bg-emerald-600 hover:shadow-xl
           transition-all duration-200 group`,
                    isChatOpen && 'hidden'
                )}
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
