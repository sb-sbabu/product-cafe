import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Bell, ChevronLeft, ChevronRight, Coffee, Sparkles, X, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock, type DockTab } from '../../contexts/DockContext';
import { AskTab } from './AskTab';
import { DiscussTab } from './DiscussTab';
import { ActivityTab } from './ActivityTab';
import { TagDirectory } from './TagDirectory';

/**
 * CafeDock - Premium collapsible side panel
 * 
 * States:
 * - closed: Not visible (FAB shows)
 * - collapsed: 48px strip with icons only
 * - expanded: 360px full panel
 * 
 * Features:
 * - Smooth width transitions
 * - Hover preview when collapsed
 * - Tab icons always visible
 * - Notification badge on Activity
 */

interface CafeDockProps {
    className?: string;
}

export const CafeDock: React.FC<CafeDockProps> = ({ className }) => {
    const {
        activeTab,
        unreadCount,
        closeDock,
        setActiveTab,
        toggleCollapse,
        isExpanded,
    } = useDock();

    const [isMobile, setIsMobile] = useState(false);

    // Responsive detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle escape key - collapse instead of close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExpanded) {
                toggleCollapse();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isExpanded, toggleCollapse]);

    const tabs: { id: DockTab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: 'ask', label: 'Ask', icon: <Coffee className="w-5 h-5" /> },
        { id: 'discuss', label: 'Discuss', icon: <MessageCircle className="w-5 h-5" /> },
        { id: 'directory', label: 'Directory', icon: <Hash className="w-5 h-5" /> },
        { id: 'activity', label: 'Activity', icon: <Bell className="w-5 h-5" />, badge: unreadCount },
    ];

    const handleTabClick = useCallback((tab: DockTab) => {
        setActiveTab(tab);
    }, [setActiveTab]);

    // Desktop dock is always visible (no closed state)
    // Mobile uses bottom sheet overlay

    // Mobile: always show as bottom sheet, full expanded
    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/30 z-40 animate-fade-in backdrop-blur-sm"
                    onClick={closeDock}
                />

                {/* Bottom Sheet */}
                <div
                    className={cn(
                        'fixed z-50 bg-white flex flex-col',
                        'inset-x-0 bottom-0 top-auto',
                        'h-[75vh] rounded-t-3xl',
                        'shadow-2xl animate-slide-up',
                        className
                    )}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                                <Coffee className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">Café Dock</span>
                        </div>
                        <button
                            onClick={closeDock}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Tab Bar */}
                    <div className="flex border-b border-gray-100 shrink-0 px-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative',
                                    activeTab === tab.id
                                        ? 'text-amber-600'
                                        : 'text-gray-500 hover:text-gray-900'
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.badge && tab.badge > 0 && (
                                    <span className="absolute top-1.5 right-[calc(50%-24px)] min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                        {tab.badge}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden min-h-0">
                        {activeTab === 'ask' && <AskTab />}
                        {activeTab === 'discuss' && <DiscussTab />}
                        {activeTab === 'directory' && <TagDirectory onSelectTag={() => setActiveTab('discuss')} />}
                        {activeTab === 'activity' && <ActivityTab />}
                    </div>
                </div>
            </>
        );
    }

    // Desktop: Collapsible side panel - NO hover logic, click-only
    const showExpanded = isExpanded;

    return (
        <div
            className={cn(
                'h-screen flex flex-col shrink-0',
                'bg-white/95 backdrop-blur-xl',
                'border-l border-gray-200/80',
                'shadow-2xl dock-panel-transition',
                showExpanded ? 'w-[380px]' : 'w-[70px]',
                className
            )}
        >
            {/* Header with Toggle - Matches main Header h-16 (64px) */}
            <div className={cn(
                'flex items-center justify-between px-4 border-b border-gray-100/80 shrink-0 h-16',
                'bg-gradient-to-r from-amber-50/50 to-orange-50/50'
            )}>
                {showExpanded ? (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-sm">
                                <Coffee className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-gray-900">Café Dock</span>
                                <Sparkles className="w-3 h-3 text-amber-400" />
                            </div>
                        </div>
                        {/* Collapse Toggle Button */}
                        <button
                            onClick={toggleCollapse}
                            className={cn(
                                'p-2 rounded-lg transition-all duration-200',
                                'hover:bg-amber-100/50 group'
                            )}
                            aria-label="Collapse dock"
                            title="Collapse dock (d)"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                        </button>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                            <Coffee className="w-4 h-4 text-white" />
                        </div>
                        {/* Expand Toggle Button */}
                        <button
                            onClick={toggleCollapse}
                            className={cn(
                                'p-1.5 rounded-lg transition-all duration-200',
                                'hover:bg-amber-100/50 group'
                            )}
                            aria-label="Expand dock"
                            title="Expand dock (d)"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Bar */}
            <div className={cn(
                'border-b border-gray-100 shrink-0',
                showExpanded ? 'flex' : 'flex flex-col'
            )}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={cn(
                            'relative transition-all',
                            showExpanded
                                ? 'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium'
                                : 'flex items-center justify-center py-4',
                            activeTab === tab.id
                                ? 'text-amber-600 bg-amber-50/50'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50/50'
                        )}
                        title={!showExpanded ? tab.label : undefined}
                    >
                        <div className="relative">
                            {tab.icon}
                            {tab.badge && tab.badge > 0 && (
                                <span className={cn(
                                    'absolute -top-1 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1',
                                    !showExpanded && 'scale-75'
                                )}>
                                    {tab.badge}
                                </span>
                            )}
                        </div>
                        {showExpanded && <span>{tab.label}</span>}
                        {activeTab === tab.id && showExpanded && (
                            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500 rounded-full" />
                        )}
                        {activeTab === tab.id && !showExpanded && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={cn(
                'flex-1 overflow-hidden min-h-0 transition-opacity duration-200',
                showExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}>
                {activeTab === 'ask' && <AskTab />}
                {activeTab === 'discuss' && <DiscussTab />}
                {activeTab === 'directory' && <TagDirectory onSelectTag={() => setActiveTab('discuss')} />}
                {activeTab === 'activity' && <ActivityTab />}
            </div>

            {/* Collapsed hint */}
            {!showExpanded && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-300 -rotate-90 whitespace-nowrap text-xs font-medium tracking-wider">
                        CAFÉ DOCK
                    </div>
                </div>
            )}
        </div>
    );
};
