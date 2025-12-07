import React, { useState } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import {
    MARKET_SIGNAL_TYPES,
    MARKET_SEGMENTS,
    type MarketSignalType,
    type MarketSegment,
} from '../../lib/pulse/marketData';
import { Search, DollarSign, Filter, X, TrendingUp, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// MARKET PANEL — Sidebar for market intelligence filtering
// ═══════════════════════════════════════════════════════════════════════════

interface MarketPanelProps {
    signals: PulseSignal[];
    activeSignalType: MarketSignalType | 'ALL';
    activeSegment: MarketSegment | 'ALL';
    onSignalTypeChange: (type: MarketSignalType | 'ALL') => void;
    onSegmentChange: (segment: MarketSegment | 'ALL') => void;
    onSelectSignal?: (id: string) => void;
}

export const MarketPanel: React.FC<MarketPanelProps> = ({
    signals,
    activeSignalType,
    activeSegment,
    onSignalTypeChange,
    onSegmentChange,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const marketSignals = signals.filter(s => s.domain === 'MARKET');

    // Count by signal type
    const typeCounts = new Map<MarketSignalType | 'ALL', number>();
    typeCounts.set('ALL', marketSignals.length);
    MARKET_SIGNAL_TYPES.forEach(type => {
        const count = marketSignals.filter(s =>
            s.title.toLowerCase().includes(type.name.toLowerCase()) ||
            s.summary.toLowerCase().includes(type.name.toLowerCase())
        ).length;
        typeCounts.set(type.id, count);
    });

    // Count by segment  
    const segmentCounts = new Map<MarketSegment | 'ALL', number>();
    segmentCounts.set('ALL', marketSignals.length);
    MARKET_SEGMENTS.forEach(seg => {
        const count = marketSignals.filter(s =>
            s.title.toLowerCase().includes(seg.name.toLowerCase()) ||
            s.summary.toLowerCase().includes(seg.name.toLowerCase())
        ).length;
        segmentCounts.set(seg.id, count);
    });

    const filteredTypes = MARKET_SIGNAL_TYPES.filter(t =>
        searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={20} className="text-emerald-600" />
                    <h3 className="font-bold text-gray-900">Market Intel</h3>
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        {marketSignals.length} signals
                    </span>
                </div>

                {/* Signal Type Quick Filters */}
                <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => onSignalTypeChange('ALL')}
                        className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-semibold transition-all",
                            activeSignalType === 'ALL'
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        All ({typeCounts.get('ALL') || 0})
                    </button>
                    {MARKET_SIGNAL_TYPES.slice(0, 3).map(type => (
                        <button
                            key={type.id}
                            onClick={() => onSignalTypeChange(type.id)}
                            className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-semibold transition-all",
                                activeSignalType === type.id
                                    ? "text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                            style={{
                                backgroundColor: activeSignalType === type.id ? type.color : undefined,
                            }}
                        >
                            {type.icon} {type.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Deal Stats */}
            <div className="p-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-gray-700">Deal Activity</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/80 rounded-lg p-2">
                        <div className="text-lg font-bold text-emerald-600">{typeCounts.get('FUNDING') || 0}</div>
                        <div className="text-[9px] text-gray-500">Funding</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2">
                        <div className="text-lg font-bold text-purple-600">{typeCounts.get('MA') || 0}</div>
                        <div className="text-[9px] text-gray-500">M&A</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2">
                        <div className="text-lg font-bold text-blue-600">{typeCounts.get('PARTNERSHIP') || 0}</div>
                        <div className="text-[9px] text-gray-500">Partnerships</div>
                    </div>
                </div>
            </div>

            {/* Segment Filter */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center gap-2 mb-3">
                    <Building2 size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">Filter by Segment</span>
                    {activeSegment !== 'ALL' && (
                        <button
                            onClick={() => onSegmentChange('ALL')}
                            className="ml-auto flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                        >
                            <X size={12} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search signals..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Segment List */}
                <div className="space-y-1">
                    {MARKET_SEGMENTS.map(seg => {
                        const count = segmentCounts.get(seg.id) || 0;
                        const isSelected = activeSegment === seg.id;
                        return (
                            <button
                                key={seg.id}
                                onClick={() => onSegmentChange(isSelected ? 'ALL' : seg.id)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                                    isSelected
                                        ? "bg-emerald-100 border border-emerald-200"
                                        : "hover:bg-gray-50 border border-transparent"
                                )}
                            >
                                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: seg.color + '20' }}>
                                    {seg.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium text-gray-800 truncate block">{seg.name}</span>
                                    <span className="text-[10px] text-gray-400">{count} signals</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Signal Type Full List */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700">By Event Type</span>
                    </div>
                    <div className="space-y-1">
                        {filteredTypes.map(type => {
                            const count = typeCounts.get(type.id) || 0;
                            const isSelected = activeSignalType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => onSignalTypeChange(isSelected ? 'ALL' : type.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                                        isSelected
                                            ? "bg-emerald-100 border border-emerald-200"
                                            : "hover:bg-gray-50 border border-transparent"
                                    )}
                                >
                                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: type.color + '20' }}>
                                        {type.icon}
                                    </span>
                                    <span className="text-xs font-medium text-gray-800 flex-1">{type.name}</span>
                                    <span className="text-[10px] text-gray-400">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-emerald-100 bg-emerald-50/50">
                <p className="text-[10px] text-gray-500 text-center">
                    Tracking 6 event types • 6 segments
                </p>
            </div>
        </div>
    );
};
