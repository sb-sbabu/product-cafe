import React, { memo } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import { DOMAIN_CONFIG, PRIORITY_CONFIG } from '../../lib/pulse/types';
import { ExternalLink, Clock, Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL CARD — Individual news signal display
// ═══════════════════════════════════════════════════════════════════════════

interface SignalCardProps {
    signal: PulseSignal;
    onMarkRead?: (id: string) => void;
    onToggleBookmark?: (id: string) => void;
    compact?: boolean;
}

const SignalCardComponent: React.FC<SignalCardProps> = ({
    signal,
    onMarkRead,
    onToggleBookmark,
    compact
}) => {
    const domainConfig = DOMAIN_CONFIG[signal.domain];
    const priorityConfig = PRIORITY_CONFIG[signal.priority];
    const isHighPriority = signal.priority === 'critical' || signal.priority === 'high';

    const handleClick = () => {
        if (!signal.isRead && onMarkRead) {
            onMarkRead(signal.id);
        }
    };

    const timeAgo = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Unknown';
            const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
            if (hours < 1) return 'Just now';
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        } catch {
            return 'Unknown';
        }
    };

    return (
        <article
            onClick={handleClick}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            className={cn(
                "group relative bg-white border rounded-xl transition-all duration-200",
                "hover:shadow-lg hover:border-cafe-200 hover:scale-[1.01] cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cafe-500 focus-visible:ring-offset-2",
                isHighPriority && "border-l-4",
                signal.priority === 'critical' && "border-l-red-500",
                signal.priority === 'high' && "border-l-amber-500",
                !isHighPriority && "border-gray-100",
                signal.isRead && "opacity-70 bg-gray-50/50"
            )}
            role="article"
            aria-label={`${signal.priority} priority ${signal.domain.toLowerCase()} signal: ${signal.title}`}
        >
            {/* Unread indicator */}
            {!signal.isRead && (
                <div className="absolute -left-1.5 top-4 w-3 h-3 bg-cafe-500 rounded-full border-2 border-white shadow-sm" />
            )}

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Domain badge */}
                        <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            signal.domain === 'COMPETITIVE' && "bg-rose-50 text-rose-700",
                            signal.domain === 'REGULATORY' && "bg-amber-50 text-amber-700",
                            signal.domain === 'TECHNOLOGY' && "bg-cyan-50 text-cyan-700",
                            signal.domain === 'MARKET' && "bg-emerald-50 text-emerald-700",
                            signal.domain === 'NEWS' && "bg-slate-50 text-slate-700",
                        )}>
                            <span>{domainConfig.icon}</span>
                            {domainConfig.label}
                        </span>

                        {/* Priority badge */}
                        {isHighPriority && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                priorityConfig.bgColor,
                                priorityConfig.color
                            )}>
                                {priorityConfig.label}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {signal.isRead ? (
                            <Check size={14} className="text-green-500" />
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkRead?.(signal.id); }}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                aria-label="Mark as read"
                            >
                                <Check size={14} />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(signal.id); }}
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label={signal.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        >
                            {signal.isBookmarked ? (
                                <BookmarkCheck size={14} className="text-cafe-500" />
                            ) : (
                                <Bookmark size={14} className="text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className={cn(
                    "font-semibold text-gray-900 leading-snug mb-2 line-clamp-2",
                    compact ? "text-sm" : "text-base"
                )}>
                    {signal.title}
                </h3>

                {/* Summary */}
                {!compact && signal.summary && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {signal.summary}
                    </p>
                )}

                {/* Entities */}
                {(signal.entities.companies.length > 0 || signal.entities.topics.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {signal.entities.companies.slice(0, 2).map(company => (
                            <span
                                key={company}
                                className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium"
                            >
                                {company}
                            </span>
                        ))}
                        {signal.entities.topics.slice(0, 2).map(topic => (
                            <span
                                key={topic}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-full font-medium"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {signal.source.favicon && (
                            <img
                                src={signal.source.favicon}
                                alt=""
                                className="w-4 h-4 rounded-sm"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                        <span className="font-medium">{signal.source.name}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {timeAgo(signal.publishedAt)}
                        </span>
                    </div>

                    <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-cafe-50 text-cafe-600 rounded-lg transition-all"
                        title="Open article"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Relevance bar (subtle) */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-xl overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cafe-400 to-cafe-600 transition-all"
                    style={{ width: `${signal.relevanceScore * 100}%` }}
                />
            </div>
        </article>
    );
};

// Memoize to prevent re-renders when signals list updates
export const SignalCard = memo(SignalCardComponent, (prev, next) => {
    return (
        prev.signal.id === next.signal.id &&
        prev.signal.isRead === next.signal.isRead &&
        prev.signal.isBookmarked === next.signal.isBookmarked
    );
});
