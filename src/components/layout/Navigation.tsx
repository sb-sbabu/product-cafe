import React from 'react';
import {
    Home,
    Zap,
    BookOpen,
    Users,
    MessageCircle,
    Star,
    Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type NavItem = {
    id: string;
    label: string;
    icon: React.ElementType;
    href?: string;
    color?: string;
    badge?: string;
};

const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    {
        id: 'grab-and-go',
        label: 'Grab & Go',
        icon: Zap,
        href: '/grab-and-go',
        color: 'text-amber-600',
    },
    {
        id: 'library',
        label: 'Library',
        icon: BookOpen,
        href: '/library',
        color: 'text-purple-600',
    },
    {
        id: 'community',
        label: 'Community',
        icon: Users,
        href: '/community',
        color: 'text-cyan-600',
    },
];

const secondaryNavItems: NavItem[] = [
    { id: 'favorites', label: 'My Favorites', icon: Star, href: '/favorites' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

interface NavigationProps {
    activeItem?: string;
    onNavigate?: (itemId: string) => void;
    onChatOpen?: () => void;
    variant?: 'sidebar' | 'tabs' | 'bottom';
    className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
    activeItem = 'home',
    onNavigate,
    onChatOpen,
    variant = 'tabs',
    className,
}) => {
    if (variant === 'bottom') {
        return (
            <nav
                className={cn(
                    `fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200
           safe-area-inset-bottom`,
                    className
                )}
            >
                <div className="flex items-center justify-around h-16 px-2">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate?.(item.id)}
                                className={cn(
                                    `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                   transition-all duration-200`,
                                    isActive
                                        ? 'text-cafe-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                )}
                            >
                                <Icon className={cn('w-5 h-5', isActive && item.color)} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                    {/* Chat Button */}
                    <button
                        onClick={onChatOpen}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-emerald-600"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-medium">Ask</span>
                    </button>
                </div>
            </nav>
        );
    }

    if (variant === 'tabs') {
        return (
            <nav
                className={cn(
                    'bg-white border-b border-gray-100',
                    className
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin py-2">
                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate?.(item.id)}
                                    className={cn(
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     whitespace-nowrap transition-all duration-200`,
                                        isActive
                                            ? 'bg-cafe-50 text-cafe-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    <Icon className={cn('w-4 h-4', isActive && item.color)} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        );
    }

    // Sidebar variant
    return (
        <aside
            className={cn(
                'w-64 bg-white border-r border-gray-100 h-screen sticky top-16 overflow-y-auto',
                className
            )}
        >
            <div className="p-4 space-y-6">
                {/* Main Nav */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                        Navigate
                    </h3>
                    <nav className="space-y-1">
                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate?.(item.id)}
                                    className={cn(
                                        `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     transition-all duration-200`,
                                        isActive
                                            ? 'bg-cafe-50 text-cafe-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    <Icon className={cn('w-5 h-5', item.color)} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Secondary Nav */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                        Personal
                    </h3>
                    <nav className="space-y-1">
                        {secondaryNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate?.(item.id)}
                                    className={cn(
                                        `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     transition-all duration-200`,
                                        isActive
                                            ? 'bg-cafe-50 text-cafe-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Chat CTA */}
                <div className="p-4 bg-gradient-to-br from-cafe-50 to-amber-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Need help?</h4>
                            <p className="text-xs text-gray-500">Ask the Café Assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={onChatOpen}
                        className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg text-sm font-medium
                       hover:bg-emerald-600 transition-colors"
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        </aside>
    );
};
