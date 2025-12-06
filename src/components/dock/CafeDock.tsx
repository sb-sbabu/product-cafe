import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Bell, X, Minus, Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock, type DockTab } from '../../contexts/DockContext';
import { AskTab } from './AskTab';
import { DiscussTab } from './DiscussTab';
import { ActivityTab } from './ActivityTab';

interface CafeDockProps {
    className?: string;
}

export const CafeDock: React.FC<CafeDockProps> = ({ className }) => {
    const {
        isOpen,
        activeTab,
        unreadCount,
        closeDock,
        setActiveTab,
        collapseDock,
    } = useDock();

    const [isMobile, setIsMobile] = useState(false);

    // Responsive detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeDock();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeDock]);

    const tabs: { id: DockTab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: 'ask', label: 'Ask', icon: <Coffee className="w-4 h-4" /> },
        { id: 'discuss', label: 'Discuss', icon: <MessageCircle className="w-4 h-4" /> },
        { id: 'activity', label: 'Activity', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
    ];

    const handleTabClick = useCallback((tab: DockTab) => {
        setActiveTab(tab);
    }, [setActiveTab]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - mobile only */}
            {isMobile && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
                    onClick={closeDock}
                />
            )}

            {/* Dock Panel */}
            <div
                className={cn(
                    'fixed z-50 bg-white flex flex-col',
                    // Mobile: bottom sheet
                    isMobile && [
                        'inset-x-0 bottom-0 top-auto',
                        'h-[70vh] rounded-t-2xl',
                        'animate-slide-up shadow-2xl',
                    ],
                    // Desktop: side panel
                    !isMobile && [
                        'right-0 top-0 bottom-0',
                        'w-[360px] border-l border-gray-200',
                        'animate-slide-in-right shadow-xl',
                    ],
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                            <Coffee className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">Café Dock</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {!isMobile && (
                            <button
                                onClick={collapseDock}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Minimize"
                            >
                                <Minus className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                        <button
                            onClick={closeDock}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex border-b border-gray-100 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
                                activeTab === tab.id
                                    ? 'text-cafe-600'
                                    : 'text-gray-500 hover:text-gray-900'
                            )}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.badge && tab.badge > 0 && (
                                <span className="absolute top-2 right-[calc(50%-20px)] min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                    {tab.badge}
                                </span>
                            )}
                            {/* Active indicator */}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-cafe-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden min-h-0">
                    {activeTab === 'ask' && <AskTab />}
                    {activeTab === 'discuss' && <DiscussTab />}
                    {activeTab === 'activity' && <ActivityTab />}
                </div>
            </div>
        </>
    );
};
