import React from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import { AGENCY_BY_ID, daysUntil } from '../../lib/pulse/regulatoryData';
import { Clock, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// DEADLINE TRACKER — Compact countdown component for regulatory deadlines
// ═══════════════════════════════════════════════════════════════════════════

interface DeadlineTrackerProps {
    signals: PulseSignal[];
    maxItems?: number;
    onSelectSignal?: (id: string) => void;
}

interface Deadline {
    signalId: string;
    title: string;
    agency: string | null;
    agencyColor: string;
    type: 'effective' | 'comment';
    date: string;
    daysLeft: number;
}

export const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({
    signals,
    maxItems = 5,
    onSelectSignal,
}) => {
    // Extract all deadlines from regulatory signals
    const deadlines: Deadline[] = signals
        .filter(s => s.domain === 'REGULATORY' && s.regulatory)
        .flatMap(s => {
            const items: Deadline[] = [];
            const reg = s.regulatory!;
            const agency = reg.agency ? AGENCY_BY_ID.get(reg.agency) : null;

            if (reg.effectiveDate) {
                const days = daysUntil(reg.effectiveDate);
                if (days !== null && days >= 0) {
                    items.push({
                        signalId: s.id,
                        title: s.title,
                        agency: agency?.name || null,
                        agencyColor: agency?.color || '#6B7280',
                        type: 'effective',
                        date: reg.effectiveDate,
                        daysLeft: days,
                    });
                }
            }

            if (reg.commentDeadline) {
                const days = daysUntil(reg.commentDeadline);
                if (days !== null && days >= 0) {
                    items.push({
                        signalId: s.id,
                        title: s.title,
                        agency: agency?.name || null,
                        agencyColor: agency?.color || '#6B7280',
                        type: 'comment',
                        date: reg.commentDeadline,
                        daysLeft: days,
                    });
                }
            }

            return items;
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, maxItems);

    const getUrgencyStyle = (days: number): { bg: string; text: string; border: string } => {
        if (days <= 7) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        if (days <= 30) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
        if (days <= 90) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    };

    if (deadlines.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-amber-500" />
                    <h4 className="font-semibold text-gray-900 text-sm">Upcoming Deadlines</h4>
                </div>
                <div className="text-center py-4">
                    <Clock size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500">No upcoming regulatory deadlines</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-amber-500" />
                        <h4 className="font-semibold text-gray-900 text-sm">Upcoming Deadlines</h4>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {deadlines.length} active
                    </span>
                </div>
            </div>

            {/* Deadline List */}
            <div className="divide-y divide-gray-100">
                {deadlines.map((deadline, idx) => {
                    const urgency = getUrgencyStyle(deadline.daysLeft);

                    return (
                        <button
                            key={`${deadline.signalId}-${deadline.type}-${idx}`}
                            onClick={() => onSelectSignal?.(deadline.signalId)}
                            className={cn(
                                "w-full p-3 text-left transition-colors hover:bg-gray-50",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Days countdown */}
                                <div className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center",
                                    urgency.bg, urgency.border, "border"
                                )}>
                                    <span className={cn("text-lg font-bold leading-none", urgency.text)}>
                                        {deadline.daysLeft}
                                    </span>
                                    <span className={cn("text-[8px] uppercase", urgency.text)}>
                                        {deadline.daysLeft === 1 ? 'day' : 'days'}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        {deadline.agency && (
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                                                style={{ backgroundColor: deadline.agencyColor }}
                                            >
                                                {deadline.agency}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-gray-400 uppercase">
                                            {deadline.type === 'comment' ? 'Comment Period' : 'Effective Date'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 font-medium line-clamp-2">
                                        {deadline.title}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {new Date(deadline.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Urgency indicator */}
                                {deadline.daysLeft <= 7 && (
                                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
