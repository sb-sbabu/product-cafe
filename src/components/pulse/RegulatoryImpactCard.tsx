import React, { memo } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import {
    AGENCY_BY_ID,
    TOPIC_BY_ID,
    IMPACT_CONFIG,
    ENTITY_CONFIG,
    daysUntil,
    type AffectedEntity
} from '../../lib/pulse/regulatoryData';
import { ExternalLink, Clock, Calendar, AlertTriangle, Users, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// REGULATORY IMPACT CARD — Specialized card for regulatory signals
// ═══════════════════════════════════════════════════════════════════════════

interface RegulatoryImpactCardProps {
    signal: PulseSignal;
    onMarkRead?: (id: string) => void;
    onToggleBookmark?: (id: string) => void;
}

const RegulatoryImpactCardComponent: React.FC<RegulatoryImpactCardProps> = ({
    signal,
    onMarkRead,
}) => {
    const regulatory = signal.regulatory;
    const agency = regulatory?.agency ? AGENCY_BY_ID.get(regulatory.agency) : null;
    const topic = regulatory?.topic ? TOPIC_BY_ID.get(regulatory.topic) : null;
    const impact = regulatory?.impactLevel ? IMPACT_CONFIG[regulatory.impactLevel] : null;

    const effectiveDays = daysUntil(regulatory?.effectiveDate);
    const commentDays = daysUntil(regulatory?.commentDeadline);

    const handleClick = () => {
        if (!signal.isRead && onMarkRead) {
            onMarkRead(signal.id);
        }
    };

    const getDeadlineUrgency = (days: number | null): string => {
        if (days === null) return 'text-gray-400';
        if (days < 0) return 'text-gray-400';
        if (days <= 30) return 'text-red-600';
        if (days <= 90) return 'text-amber-600';
        return 'text-blue-600';
    };

    return (
        <article
            onClick={handleClick}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            className={cn(
                "group relative bg-white border rounded-xl transition-all duration-200",
                "hover:shadow-lg hover:border-amber-200 hover:scale-[1.01] cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                "border-l-4",
                regulatory?.impactLevel === 'critical' && "border-l-red-500",
                regulatory?.impactLevel === 'high' && "border-l-amber-500",
                regulatory?.impactLevel === 'moderate' && "border-l-blue-500",
                (!regulatory?.impactLevel || regulatory.impactLevel === 'low') && "border-l-gray-300",
                signal.isRead && "opacity-70 bg-gray-50/50"
            )}
            role="article"
            aria-label={`${regulatory?.impactLevel || ''} impact regulatory signal: ${signal.title}`}
        >
            {/* Unread indicator */}
            {!signal.isRead && (
                <div className="absolute -left-1.5 top-4 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm" />
            )}

            <div className="p-4">
                {/* Header Row: Agency + Topic + Impact */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Agency Badge */}
                        {agency && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                                style={{ backgroundColor: agency.color }}
                            >
                                <span>{agency.icon}</span>
                                {agency.name}
                            </span>
                        )}

                        {/* Topic Badge */}
                        {topic && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                            >
                                <span>{topic.icon}</span>
                                {topic.name}
                            </span>
                        )}

                        {/* Signal Type */}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium uppercase">
                            {signal.signalType.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Impact Badge */}
                    {impact && (
                        <span className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                            impact.bgColor, impact.color
                        )}>
                            <AlertTriangle size={10} />
                            {impact.label}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                    {signal.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {signal.summary}
                </p>

                {/* Timeline Row */}
                {(regulatory?.effectiveDate || regulatory?.commentDeadline) && (
                    <div className="flex items-center gap-4 mb-3 text-xs">
                        {regulatory.effectiveDate && (
                            <div className={cn("flex items-center gap-1", getDeadlineUrgency(effectiveDays))}>
                                <Calendar size={12} />
                                <span className="font-medium">
                                    Effective: {effectiveDays !== null && effectiveDays >= 0
                                        ? `${effectiveDays} days`
                                        : new Date(regulatory.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }
                                </span>
                            </div>
                        )}
                        {regulatory.commentDeadline && commentDays !== null && commentDays >= 0 && (
                            <div className={cn("flex items-center gap-1", getDeadlineUrgency(commentDays))}>
                                <Clock size={12} />
                                <span className="font-medium">
                                    Comments: {commentDays} days left
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Affected Entities */}
                {regulatory?.affectedEntities && regulatory.affectedEntities.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        <Users size={12} className="text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                            {regulatory.affectedEntities.map((entity: AffectedEntity) => {
                                const entityConfig = ENTITY_CONFIG[entity];
                                return (
                                    <span
                                        key={entity}
                                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]"
                                    >
                                        {entityConfig.icon} {entityConfig.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{signal.source.name}</span>
                        {regulatory?.docketNumber && (
                            <>
                                <span>•</span>
                                <span className="font-mono">{regulatory.docketNumber}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {signal.isRead && <Check size={12} className="text-green-500" />}
                        <a
                            href={regulatory?.federalRegisterUrl || signal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
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
export const RegulatoryImpactCard = memo(RegulatoryImpactCardComponent, (prev, next) => {
    return (
        prev.signal.id === next.signal.id &&
        prev.signal.isRead === next.signal.isRead &&
        prev.signal.isBookmarked === next.signal.isBookmarked
    );
});
