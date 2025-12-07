import React from 'react';
import type { CompetitorProfile } from '../../lib/pulse/competitorData';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR RADAR — Visual bubble chart of competitor activity
// ═══════════════════════════════════════════════════════════════════════════

interface CompetitorRadarProps {
    competitors: CompetitorProfile[];
    selectedCompetitorId?: string | null;
    onSelectCompetitor?: (id: string) => void;
}

export const CompetitorRadar: React.FC<CompetitorRadarProps> = ({
    competitors,
    selectedCompetitorId,
    onSelectCompetitor,
}) => {
    // Filter to only show competitors with signals, sorted by signal count
    const activeCompetitors = competitors
        .filter(c => c.signalCount > 0)
        .sort((a, b) => b.signalCount - a.signalCount)
        .slice(0, 12); // Top 12 for visibility

    // Calculate bubble sizes and positions
    const maxCount = Math.max(...activeCompetitors.map(c => c.signalCount), 1);

    if (activeCompetitors.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="text-gray-400 mb-2">📡</div>
                <h4 className="font-medium text-gray-700 mb-1">No competitor signals yet</h4>
                <p className="text-xs text-gray-500">
                    Signals will appear here as competitors are mentioned in news
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    📡 Activity Radar
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                    Bubble size = signal frequency
                </p>
            </div>

            {/* Radar visualization */}
            <div className="p-4">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {activeCompetitors.map((competitor) => {
                        const sizePercent = Math.max(30, (competitor.signalCount / maxCount) * 100);
                        const isSelected = selectedCompetitorId === competitor.id;

                        return (
                            <button
                                key={competitor.id}
                                onClick={() => onSelectCompetitor?.(competitor.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
                                    "hover:scale-105 hover:shadow-md",
                                    isSelected && "ring-2 ring-cafe-500 bg-cafe-50"
                                )}
                                title={`${competitor.name}: ${competitor.signalCount} signals`}
                            >
                                {/* Bubble */}
                                <div
                                    className={cn(
                                        "rounded-full flex items-center justify-center text-white font-bold transition-all",
                                        "shadow-lg"
                                    )}
                                    style={{
                                        width: `${Math.max(32, sizePercent * 0.6)}px`,
                                        height: `${Math.max(32, sizePercent * 0.6)}px`,
                                        backgroundColor: competitor.color,
                                        fontSize: `${Math.max(10, sizePercent * 0.12)}px`,
                                        boxShadow: `0 4px 14px ${competitor.color}40`,
                                    }}
                                >
                                    {competitor.signalCount}
                                </div>

                                {/* Name */}
                                <span className="mt-1.5 text-[10px] text-gray-600 font-medium text-center truncate max-w-full">
                                    {competitor.name.split(' ')[0]}
                                </span>

                                {/* Tier indicator */}
                                <span className={cn(
                                    "text-[8px] font-bold uppercase",
                                    competitor.tier === 1 && "text-rose-500",
                                    competitor.tier === 2 && "text-amber-500",
                                    competitor.tier === 3 && "text-cyan-500",
                                )}>
                                    T{competitor.tier}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="px-4 pb-3 flex items-center justify-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Tier 1
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Tier 2
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Tier 3
                </span>
            </div>
        </div>
    );
};
