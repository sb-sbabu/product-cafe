import React, { useState, useCallback } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Users,
    BookOpen,
    HelpCircle,
    MessageSquare,
    Mic,
    Activity,
    Building2,
    Clock,
    Calendar,
    CalendarDays,
    Timer,
    Infinity,
    Code,
    Briefcase,
    HeartPulse,
    Settings,
    Target,
    Search,
    Book,
    FileText,
    MessageCircle,
    Compass,
    Layers,
    ChevronsUpDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * SmartFiltersPanel - 5 Categories × 5 Filter Pills = 25 Deterministic Filters
 * 
 * Categories:
 * 1. Content Type - People, Resources, FAQs, Discussions, LOP Sessions
 * 2. Domain/Pillar - Product Craft, Healthcare, Tech & Tools, Process, Strategy
 * 3. Time Range - Today, This Week, This Month, This Quarter, All Time
 * 4. Team - Platform, Eligibility, RCM, Payments, Product
 * 5. Intent - Find Expert, Learn Topic, Get Template, Ask Question, Explore
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FilterPill {
    id: string;
    label: string;
    icon: React.ReactNode;
    count?: number;
}

export interface FilterCategory {
    id: string;
    label: string;
    icon: React.ReactNode;
    pills: FilterPill[];
}

export interface ActiveFilters {
    contentType?: string;
    domain?: string;
    timeRange?: string;
    team?: string;
    intent?: string;
}

interface SmartFiltersPanelProps {
    activeFilters: ActiveFilters;
    onFilterChange: (filters: ActiveFilters) => void;
    className?: string;
    resultCounts?: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const FILTER_CATEGORIES: FilterCategory[] = [
    {
        id: 'contentType',
        label: 'Content Type',
        icon: <Layers className="w-4 h-4" />,
        pills: [
            { id: 'people', label: 'People', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'resources', label: 'Resources', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: 'discussions', label: 'Discussions', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'lop_sessions', label: 'LOP Sessions', icon: <Mic className="w-3.5 h-3.5" /> },
        ],
    },
    {
        id: 'domain',
        label: 'Domain',
        icon: <Briefcase className="w-4 h-4" />,
        pills: [
            { id: 'product-craft', label: 'Product Craft', icon: <Target className="w-3.5 h-3.5" /> },
            { id: 'healthcare', label: 'Healthcare', icon: <HeartPulse className="w-3.5 h-3.5" /> },
            { id: 'tech-tools', label: 'Tech & Tools', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'process', label: 'Process', icon: <Settings className="w-3.5 h-3.5" /> },
            { id: 'strategy', label: 'Strategy', icon: <Activity className="w-3.5 h-3.5" /> },
        ],
    },
    {
        id: 'timeRange',
        label: 'Time Range',
        icon: <Clock className="w-4 h-4" />,
        pills: [
            { id: 'today', label: 'Today', icon: <Timer className="w-3.5 h-3.5" /> },
            { id: 'this_week', label: 'This Week', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'this_month', label: 'This Month', icon: <CalendarDays className="w-3.5 h-3.5" /> },
            { id: 'this_quarter', label: 'This Quarter', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'all_time', label: 'All Time', icon: <Infinity className="w-3.5 h-3.5" /> },
        ],
    },
    {
        id: 'team',
        label: 'Team',
        icon: <Building2 className="w-4 h-4" />,
        pills: [
            { id: 'platform', label: 'Platform', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'eligibility', label: 'Eligibility', icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: 'rcm', label: 'RCM', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'payments', label: 'Payments', icon: <Briefcase className="w-3.5 h-3.5" /> },
            { id: 'product', label: 'Product', icon: <Target className="w-3.5 h-3.5" /> },
        ],
    },
    {
        id: 'intent',
        label: 'Intent',
        icon: <Search className="w-4 h-4" />,
        pills: [
            { id: 'find_expert', label: 'Find Expert', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'learn_topic', label: 'Learn Topic', icon: <Book className="w-3.5 h-3.5" /> },
            { id: 'get_template', label: 'Get Template', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'ask_question', label: 'Ask Question', icon: <MessageCircle className="w-3.5 h-3.5" /> },
            { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SmartFiltersPanel: React.FC<SmartFiltersPanelProps> = ({
    activeFilters,
    onFilterChange,
    className,
    resultCounts = {},
}) => {
    // Track which categories are expanded
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(FILTER_CATEGORIES.map(c => c.id))
    );
    const [allExpanded, setAllExpanded] = useState(true);

    // Toggle single category
    const toggleCategory = useCallback((categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    }, []);

    // Master expand/collapse all
    const toggleAll = useCallback(() => {
        if (allExpanded) {
            setExpandedCategories(new Set());
            setAllExpanded(false);
        } else {
            setExpandedCategories(new Set(FILTER_CATEGORIES.map(c => c.id)));
            setAllExpanded(true);
        }
    }, [allExpanded]);

    // Handle pill click
    const handlePillClick = useCallback((categoryId: string, pillId: string) => {
        const currentValue = activeFilters[categoryId as keyof ActiveFilters];
        const newValue = currentValue === pillId ? undefined : pillId;
        onFilterChange({
            ...activeFilters,
            [categoryId]: newValue,
        });
    }, [activeFilters, onFilterChange]);

    // Count active filters
    const activeCount = Object.values(activeFilters).filter(Boolean).length;

    // Clear all filters
    const clearFilters = useCallback(() => {
        onFilterChange({});
    }, [onFilterChange]);

    return (
        <div className={cn(
            'bg-white/80 backdrop-blur-lg rounded-xl border border-gray-100 overflow-hidden',
            'shadow-sm',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">Smart Filters</span>
                    {activeCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
                            {activeCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-gray-500 hover:text-amber-600 transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={toggleAll}
                        className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                        title={allExpanded ? 'Collapse all' : 'Expand all'}
                    >
                        <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="divide-y divide-gray-50">
                {FILTER_CATEGORIES.map(category => {
                    const isExpanded = expandedCategories.has(category.id);
                    const activeValue = activeFilters[category.id as keyof ActiveFilters];
                    const hasActive = !!activeValue;

                    return (
                        <div key={category.id} className="group">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={cn(
                                    'w-full flex items-center justify-between px-4 py-2.5 transition-colors',
                                    'hover:bg-gray-50/80',
                                    hasActive && 'bg-amber-50/50'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        'transition-colors',
                                        hasActive ? 'text-amber-600' : 'text-gray-400'
                                    )}>
                                        {category.icon}
                                    </span>
                                    <span className={cn(
                                        'text-sm font-medium transition-colors',
                                        hasActive ? 'text-amber-700' : 'text-gray-700'
                                    )}>
                                        {category.label}
                                    </span>
                                    {hasActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    )}
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Pills */}
                            {isExpanded && (
                                <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 animate-fade-in">
                                    {category.pills.map(pill => {
                                        const isActive = activeValue === pill.id;
                                        const count = resultCounts[`${category.id}.${pill.id}`];

                                        return (
                                            <button
                                                key={pill.id}
                                                onClick={() => handlePillClick(category.id, pill.id)}
                                                className={cn(
                                                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
                                                    'transition-all duration-200 ease-out',
                                                    'border',
                                                    isActive
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-sm'
                                                        : 'bg-white/60 text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50'
                                                )}
                                            >
                                                <span className={cn(
                                                    isActive ? 'text-white/90' : 'text-gray-400'
                                                )}>
                                                    {pill.icon}
                                                </span>
                                                <span>{pill.label}</span>
                                                {count !== undefined && (
                                                    <span className={cn(
                                                        'ml-1 px-1 py-0.5 rounded text-[10px]',
                                                        isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-gray-100 text-gray-500'
                                                    )}>
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { FILTER_CATEGORIES };
export default SmartFiltersPanel;
