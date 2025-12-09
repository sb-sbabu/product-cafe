import React, { useState } from 'react';
import {
    Coffee,
    Zap,
    BookOpen,
    Users,
    Trophy,
    Sparkles,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
    Mic,
    Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM SIDEBAR — 99.01 HCI Navigation Panel
// Glassmorphic design with butter-smooth animations
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Home', icon: Coffee, color: 'text-cafe-600', gradient: 'from-cafe-500 to-cafe-600' },
    { id: 'grab-and-go', label: 'Grab & Go', icon: Zap, color: 'text-amber-500', gradient: 'from-amber-400 to-orange-500' },
    { id: 'library', label: 'Library', icon: BookOpen, color: 'text-purple-500', gradient: 'from-purple-500 to-violet-600' },
    { id: 'community', label: 'Community', icon: Users, color: 'text-cyan-500', gradient: 'from-cyan-400 to-blue-500' },
    { id: 'lop', label: 'LOP', icon: Mic, color: 'text-rose-500', gradient: 'from-rose-400 to-pink-500' },
    { id: 'toast', label: 'TOAST', icon: Award, color: 'text-amber-500', gradient: 'from-amber-400 to-orange-500' },
    { id: 'toast-x', label: 'Toast X', icon: Award, color: 'text-rose-500', gradient: 'from-rose-400 to-pink-500' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-amber-500', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'credits', label: 'Credits', icon: Sparkles, color: 'text-pink-500', gradient: 'from-pink-400 to-rose-500' },
    { id: 'pulse', label: 'PULSE', icon: Activity, color: 'text-emerald-500', gradient: 'from-emerald-400 to-teal-500' },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'text-gray-500', gradient: 'from-gray-400 to-gray-600' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <aside
            className={cn(
                // Base layout
                "hidden lg:flex flex-col h-screen sticky top-0 z-40",
                // Glassmorphic design
                "bg-white/80 backdrop-blur-xl border-r border-white/50",
                // Shadow and glow
                "shadow-[4px_0_24px_-8px_rgba(0,0,0,0.1)]",
                // Smooth transitions
                "transition-all duration-300 ease-out",
                // Width based on state
                isExpanded ? "w-60" : "w-[72px]"
            )}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-gray-100/50">
                <div className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    !isExpanded && "justify-center"
                )}>
                    {/* Animated Coffee Icon */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cafe-400 to-cafe-600 flex items-center justify-center shadow-lg shadow-cafe-500/30 group-hover:shadow-cafe-500/50 transition-shadow">
                            <span className="text-white text-lg">☕</span>
                        </div>
                        {/* Pulse indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                    </div>

                    {isExpanded && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-gray-900 text-lg tracking-tight">
                                Product Café
                            </h1>
                            <p className="text-[10px] text-gray-400 -mt-0.5">
                                Intelligence Hub
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                                "transition-all duration-200 ease-out",
                                // Focus states
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cafe-500/50",
                                // Active state
                                isActive ? [
                                    "bg-gradient-to-r",
                                    item.gradient,
                                    "text-white shadow-lg",
                                    `shadow-${item.color.split('-')[1]}-500/30`,
                                ] : [
                                    "text-gray-600 hover:bg-gray-100/80",
                                    "hover:text-gray-900",
                                ],
                                // Center when collapsed
                                !isExpanded && "justify-center px-2"
                            )}
                        >
                            {/* Icon with animation */}
                            <div className={cn(
                                "relative flex-shrink-0 transition-transform duration-200",
                                "group-hover:scale-110",
                                isActive && "animate-pulse-subtle"
                            )}>
                                <Icon size={20} className={isActive ? "text-white" : item.color} />
                            </div>

                            {/* Label with slide animation */}
                            {isExpanded && (
                                <span className={cn(
                                    "font-medium text-sm whitespace-nowrap",
                                    "transition-all duration-200",
                                    isActive ? "text-white" : "group-hover:translate-x-0.5"
                                )}>
                                    {item.label}
                                </span>
                            )}

                            {/* Active indicator bar */}
                            {isActive && (
                                <div className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                                    "bg-white/50 shadow-glow",
                                    isExpanded ? "-ml-3" : "-ml-2"
                                )} />
                            )}

                            {/* Tooltip when collapsed */}
                            {!isExpanded && (
                                <div className={cn(
                                    "absolute left-full ml-3 px-3 py-1.5 rounded-lg",
                                    "bg-gray-900 text-white text-sm font-medium",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                    "transition-all duration-200 pointer-events-none",
                                    "shadow-xl z-50 whitespace-nowrap"
                                )}>
                                    {item.label}
                                    {/* Arrow */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-gray-100/50">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl",
                        "bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700",
                        "transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cafe-500/50"
                    )}
                >
                    {isExpanded ? (
                        <>
                            <ChevronLeft size={18} />
                            <span className="text-xs font-medium">Collapse</span>
                        </>
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
            </div>

            {/* User Profile Footer */}
            {isExpanded && (
                <div className="p-3 border-t border-gray-100/50">
                    <button
                        onClick={() => onNavigate('profile')}
                        className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-xl",
                            "hover:bg-gray-100/80 transition-colors",
                            activePage === 'profile' && "bg-gray-100"
                        )}
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cafe-400 to-cafe-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            U
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">User</p>
                            <p className="text-xs text-gray-400 truncate">View Profile</p>
                        </div>
                    </button>
                </div>
            )}
        </aside>
    );
};
