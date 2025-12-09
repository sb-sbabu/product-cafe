/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SMART SUGGESTION RAIL — AI-Powered Recommendations
 * Horizontal scrollable rail of contextual suggestions
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { QuickActionCard } from './QuickActionCard';
import {
    generateSmartSuggestions,
    getCurrentContext,
    type SmartSuggestion,
} from '../engine/smartSuggestionEngine';
import { useGrabAndGoStore } from '../store/grabAndGoStore';

interface SmartSuggestionRailProps {
    className?: string;
    maxItems?: number;
    onNavigate?: (route: string) => void;
}

export const SmartSuggestionRail: React.FC<SmartSuggestionRailProps> = ({
    className,
    maxItems = 6,
    onNavigate,
}) => {
    const { userRole, getRecentActionIds } = useGrabAndGoStore();
    const railRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);

    // Generate suggestions based on current context
    const suggestions = useMemo(() => {
        const context = {
            ...getCurrentContext(),
            userRole,
            recentActionIds: getRecentActionIds(),
        };
        return generateSmartSuggestions(context).slice(0, maxItems);
    }, [userRole, getRecentActionIds, maxItems]);

    // Check scroll state
    const updateScrollState = () => {
        if (!railRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    React.useEffect(() => {
        updateScrollState();
        const rail = railRef.current;
        if (rail) {
            rail.addEventListener('scroll', updateScrollState);
            return () => rail.removeEventListener('scroll', updateScrollState);
        }
    }, [suggestions]);

    const scroll = (direction: 'left' | 'right') => {
        if (!railRef.current) return;
        const scrollAmount = 200;
        railRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (suggestions.length === 0) return null;

    // Group by reason for nice display
    const primaryReason = suggestions[0]?.reason || 'Suggested for you';

    return (
        <div className={cn('relative', className)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700">Smart Suggestions</h3>
                <span className="text-xs text-gray-400 italic ml-2">
                    {primaryReason}
                </span>
            </div>

            {/* Rail Container */}
            <div className="relative group">
                {/* Left scroll button */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className={cn(
                            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                            'w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200',
                            'flex items-center justify-center',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            'hover:bg-gray-50'
                        )}
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                )}

                {/* Right scroll button */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className={cn(
                            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                            'w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200',
                            'flex items-center justify-center',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            'hover:bg-gray-50'
                        )}
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                )}

                {/* Scrollable Rail */}
                <div
                    ref={railRef}
                    className={cn(
                        'flex gap-3 overflow-x-auto pb-2 -mx-1 px-1',
                        'scrollbar-hide scroll-smooth'
                    )}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {suggestions.map((suggestion, idx) => (
                        <SuggestionCard
                            key={`${suggestion.action.id}-${idx}`}
                            suggestion={suggestion}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>

                {/* Gradient fades */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                )}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUGGESTION CARD — Individual suggestion with context badge
// ═══════════════════════════════════════════════════════════════════════════

interface SuggestionCardProps {
    suggestion: SmartSuggestion;
    onNavigate?: (route: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onNavigate }) => {
    const { action, contextType } = suggestion;

    const contextBadges: Record<SmartSuggestion['contextType'], { label: string; color: string }> = {
        time: { label: '⏰ Time-based', color: 'bg-blue-100 text-blue-700' },
        role: { label: '👤 For your role', color: 'bg-purple-100 text-purple-700' },
        recent: { label: '🔄 Recently used', color: 'bg-green-100 text-green-700' },
        seasonal: { label: '📅 Seasonal', color: 'bg-orange-100 text-orange-700' },
        trending: { label: '🔥 Trending', color: 'bg-red-100 text-red-700' },
    };

    const badge = contextBadges[contextType];

    return (
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <QuickActionCard action={action} size="md" showPin onNavigate={onNavigate} />
            <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                badge.color
            )}>
                {badge.label}
            </span>
        </div>
    );
};

export default SmartSuggestionRail;
