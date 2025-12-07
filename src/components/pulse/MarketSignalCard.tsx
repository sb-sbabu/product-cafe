import React, { memo } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import {
    SIGNAL_TYPE_BY_ID,
    SEGMENT_BY_ID,
    DEAL_SIZE_CONFIG,
    FUNDING_ROUND_CONFIG,
    formatValuation,
    type MarketMetadata,
} from '../../lib/pulse/marketData';
import { ExternalLink, DollarSign, TrendingUp, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// MARKET SIGNAL CARD — Specialized card for market/M&A signals
// ═══════════════════════════════════════════════════════════════════════════

interface MarketSignalCardProps {
    signal: PulseSignal;
    market?: MarketMetadata;
    onMarkRead?: (id: string) => void;
}

const MarketSignalCardComponent: React.FC<MarketSignalCardProps> = ({
    signal,
    market,
    onMarkRead,
}) => {
    const signalType = market?.signalType ? SIGNAL_TYPE_BY_ID.get(market.signalType) : null;
    const segment = market?.segment ? SEGMENT_BY_ID.get(market.segment) : null;
    const dealSize = market?.dealSize ? DEAL_SIZE_CONFIG[market.dealSize] : null;
    const fundingRound = market?.fundingRound ? FUNDING_ROUND_CONFIG[market.fundingRound] : null;

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
                "hover:shadow-lg hover:border-emerald-200 hover:scale-[1.01] cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                "border-l-4",
                signalType?.id === 'FUNDING' && "border-l-green-500",
                signalType?.id === 'MA' && "border-l-purple-500",
                signalType?.id === 'PARTNERSHIP' && "border-l-blue-500",
                signalType?.id === 'IPO' && "border-l-amber-500",
                signalType?.id === 'DIVESTITURE' && "border-l-red-500",
                signalType?.id === 'EXPANSION' && "border-l-cyan-500",
                !signalType && "border-l-gray-300",
                signal.isRead && "opacity-70 bg-gray-50/50"
            )}
            role="article"
            aria-label={`Market signal: ${signal.title}`}
        >
            {/* Unread indicator */}
            {!signal.isRead && (
                <div className="absolute -left-1.5 top-4 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            )}

            <div className="p-4">
                {/* Header Row: Signal Type + Segment + Deal Size */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Signal Type Badge */}
                        {signalType && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                                style={{ backgroundColor: signalType.color }}
                            >
                                <span>{signalType.icon}</span>
                                {signalType.name}
                            </span>
                        )}

                        {/* Segment Badge */}
                        {segment && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                <span>{segment.icon}</span>
                                {segment.name}
                            </span>
                        )}
                    </div>

                    {/* Deal Size / Valuation */}
                    {market?.valuationAmount && dealSize && (
                        <span className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50",
                            dealSize.color
                        )}>
                            <DollarSign size={10} />
                            {formatValuation(market.valuationAmount)}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {signal.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {signal.summary}
                </p>

                {/* Deal Details Row */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {/* Funding Round */}
                    {fundingRound && market?.fundingRound !== 'UNKNOWN' && (
                        <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            fundingRound.color
                        )}>
                            {fundingRound.label}
                        </span>
                    )}

                    {/* Acquirer → Target */}
                    {market?.acquirer && market?.target && (
                        <span className="text-[10px] text-gray-500">
                            {market.acquirer} → {market.target}
                        </span>
                    )}

                    {/* Investors */}
                    {market?.investors && market.investors.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <TrendingUp size={10} />
                            {market.investors.slice(0, 2).join(', ')}
                            {market.investors.length > 2 && ` +${market.investors.length - 2}`}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <DollarSign size={10} />
                        <span>{signal.source.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {signal.isRead && <Check size={12} className="text-green-500" />}
                        <a
                            href={signal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
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
export const MarketSignalCard = memo(MarketSignalCardComponent, (prev, next) => {
    return (
        prev.signal.id === next.signal.id &&
        prev.signal.isRead === next.signal.isRead
    );
});
