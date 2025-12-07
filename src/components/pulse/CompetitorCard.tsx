import React, { memo } from 'react';
import type { CompetitorProfile } from '../../lib/pulse/competitorData';
import { Eye, EyeOff, Activity, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR CARD — Individual competitor display (memoized)
// ═══════════════════════════════════════════════════════════════════════════

interface CompetitorCardProps {
    competitor: CompetitorProfile;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onToggleWatchlist?: (id: string) => void;
}

const tierColors: Record<1 | 2 | 3, string> = {
    1: 'bg-rose-100 text-rose-700 border-rose-200',
    2: 'bg-amber-100 text-amber-700 border-amber-200',
    3: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

const tierLabels: Record<1 | 2 | 3, string> = {
    1: 'Tier 1',
    2: 'Tier 2',
    3: 'Tier 3',
};

const timeAgo = (dateStr: string | null): string => {
    if (!dateStr) return 'No signals';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Unknown';
        const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    } catch {
        return 'Unknown';
    }
};

const CompetitorCardComponent: React.FC<CompetitorCardProps> = ({
    competitor,
    isSelected,
    onSelect,
    onToggleWatchlist,
}) => {
    return (
        <div
            onClick={() => onSelect?.(competitor.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(competitor.id); } }}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
            aria-label={`${competitor.name}, ${tierLabels[competitor.tier]}, ${competitor.signalCount} signals`}
            className={cn(
                "group relative bg-white border rounded-xl p-3 transition-all cursor-pointer",
                "hover:shadow-md hover:border-cafe-200 hover:scale-[1.02]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cafe-500 focus-visible:ring-offset-2",
                isSelected && "ring-2 ring-cafe-500 border-cafe-300 bg-cafe-50/50"
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    {/* Avatar with color */}
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: competitor.color }}
                    >
                        {competitor.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{competitor.name}</h4>
                        <span className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                            tierColors[competitor.tier]
                        )}>
                            {tierLabels[competitor.tier]}
                        </span>
                    </div>
                </div>

                {/* Watchlist toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleWatchlist?.(competitor.id); }}
                    className={cn(
                        "p-1 rounded transition-all duration-200",
                        competitor.watchlisted
                            ? "text-cafe-500 hover:bg-cafe-50 hover:scale-110"
                            : "text-gray-300 hover:text-gray-500 hover:bg-gray-50"
                    )}
                    aria-label={competitor.watchlisted ? "Remove from watchlist" : "Add to watchlist"}
                >
                    {competitor.watchlisted ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
            </div>

            {/* Category */}
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                {competitor.category}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                    <Activity size={12} />
                    <span className="font-medium">{competitor.signalCount}</span>
                    <span className="text-gray-400">signals</span>
                </div>
                <span className="text-gray-400">{timeAgo(competitor.lastSignalAt)}</span>
            </div>

            {/* External link (on hover) */}
            {competitor.website && (
                <a
                    href={`https://${competitor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                    aria-label="Visit website"
                >
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
    );
};

// Memoize to prevent re-renders when parent updates
export const CompetitorCard = memo(CompetitorCardComponent, (prev, next) => {
    return (
        prev.competitor.id === next.competitor.id &&
        prev.competitor.signalCount === next.competitor.signalCount &&
        prev.competitor.watchlisted === next.competitor.watchlisted &&
        prev.isSelected === next.isSelected
    );
});
