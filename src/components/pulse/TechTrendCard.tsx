import React, { memo } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import {
    TRACK_BY_ID,
    TREND_DIRECTION_CONFIG,
    SIGNIFICANCE_CONFIG,
    type TrendMetadata,
} from '../../lib/pulse/technologyData';
import { ExternalLink, TrendingUp, Cpu, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TECH TREND CARD — Specialized card for technology signals
// ═══════════════════════════════════════════════════════════════════════════

interface TechTrendCardProps {
    signal: PulseSignal;
    trend?: TrendMetadata;
    onMarkRead?: (id: string) => void;
}

const TechTrendCardComponent: React.FC<TechTrendCardProps> = ({
    signal,
    trend,
    onMarkRead,
}) => {
    const track = trend?.track ? TRACK_BY_ID.get(trend.track) : null;
    const direction = trend?.direction ? TREND_DIRECTION_CONFIG[trend.direction] : null;
    const significance = trend?.significance ? SIGNIFICANCE_CONFIG[trend.significance] : null;

    const handleClick = () => {
        if (!signal.isRead && onMarkRead) {
            onMarkRead(signal.id);
        }
    };

    return (
        <article
            onClick={handleClick}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            className={cn(
                "group relative bg-white border rounded-xl transition-all duration-200",
                "hover:shadow-lg hover:border-cyan-200 hover:scale-[1.01] cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                "border-l-4",
                track?.id === 'AI_ML' && "border-l-purple-500",
                track?.id === 'INTEROPERABILITY' && "border-l-blue-500",
                track?.id === 'CLOUD' && "border-l-cyan-500",
                track?.id === 'SECURITY' && "border-l-red-500",
                track?.id === 'RPA' && "border-l-amber-500",
                track?.id === 'BLOCKCHAIN' && "border-l-green-500",
                !track && "border-l-gray-300",
                signal.isRead && "opacity-70 bg-gray-50/50"
            )}
            role="article"
            aria-label={`Technology signal: ${signal.title}`}
        >
            {/* Unread indicator */}
            {!signal.isRead && (
                <div className="absolute -left-1.5 top-4 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-sm" />
            )}

            <div className="p-4">
                {/* Header Row: Track + Trend + Significance */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Track Badge */}
                        {track && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                                style={{ backgroundColor: track.color }}
                            >
                                <span>{track.icon}</span>
                                {track.name.split(' ')[0]}
                            </span>
                        )}

                        {/* Trend Direction */}
                        {direction && (
                            <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100",
                                direction.color
                            )}>
                                <span>{direction.icon}</span>
                                {direction.label}
                            </span>
                        )}
                    </div>

                    {/* Significance Badge */}
                    {significance && (
                        <span className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                            significance.bgColor, significance.color
                        )}>
                            <TrendingUp size={10} />
                            {significance.label}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                    {signal.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {signal.summary}
                </p>

                {/* Vendor Mentions */}
                {trend?.vendorMentions && trend.vendorMentions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {trend.vendorMentions.slice(0, 3).map(vendor => (
                            <span
                                key={vendor}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
                            >
                                {vendor}
                            </span>
                        ))}
                        {trend.vendorMentions.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                                +{trend.vendorMentions.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <Cpu size={10} />
                        <span>{signal.source.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {signal.isRead && <Check size={12} className="text-green-500" />}
                        <a
                            href={signal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                            aria-label="View source"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
};

// Memoize for performance
export const TechTrendCard = memo(TechTrendCardComponent, (prev, next) => {
    return (
        prev.signal.id === next.signal.id &&
        prev.signal.isRead === next.signal.isRead
    );
});
