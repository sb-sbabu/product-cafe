import React, { useState } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import {
    TECHNOLOGY_TRACKS,
    MATURITY_CONFIG,
    type TechnologyTrack,
} from '../../lib/pulse/technologyData';
import { Search, Cpu, Filter, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TECHNOLOGY PANEL — Sidebar for technology intelligence filtering
// ═══════════════════════════════════════════════════════════════════════════

interface TechnologyPanelProps {
    signals: PulseSignal[];
    activeTrack: TechnologyTrack | 'ALL';
    onTrackChange: (track: TechnologyTrack | 'ALL') => void;
    onSelectSignal?: (id: string) => void;
}

export const TechnologyPanel: React.FC<TechnologyPanelProps> = ({
    signals,
    activeTrack,
    onTrackChange,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Get technology signals only
    const techSignals = signals.filter(s => s.domain === 'TECHNOLOGY');

    // Count signals by track (simplified - would need trend metadata in real app)
    const trackCounts = new Map<TechnologyTrack | 'ALL', number>();
    trackCounts.set('ALL', techSignals.length);

    // For demo, distribute signals across tracks based on content
    TECHNOLOGY_TRACKS.forEach(track => {
        const count = techSignals.filter(s =>
            track.keywords.some(kw =>
                s.title.toLowerCase().includes(kw) ||
                s.summary.toLowerCase().includes(kw)
            )
        ).length;
        trackCounts.set(track.id, count);
    });

    // Filter tracks by search
    const filteredTracks = TECHNOLOGY_TRACKS.filter(t =>
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keywords.some(kw => kw.includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-cyan-50/30 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-cyan-100">
                <div className="flex items-center gap-2 mb-3">
                    <Cpu size={20} className="text-cyan-600" />
                    <h3 className="font-bold text-gray-900">Tech Intelligence</h3>
                    <span className="ml-auto text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                        {techSignals.length} signals
                    </span>
                </div>

                {/* All/Track Toggle */}
                <div className="flex gap-1">
                    <button
                        onClick={() => onTrackChange('ALL')}
                        className={cn(
                            "flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                            activeTrack === 'ALL'
                                ? "bg-cyan-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        All Tracks
                    </button>
                    <button
                        onClick={() => onTrackChange('AI_ML')}
                        className={cn(
                            "flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                            activeTrack === 'AI_ML'
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        🤖 AI/ML
                    </button>
                </div>
            </div>

            {/* Emerging Tech Spotlight */}
            <div className="p-3 border-b border-cyan-100 bg-gradient-to-r from-purple-50 to-cyan-50">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-purple-500" />
                    <span className="text-xs font-semibold text-gray-700">Emerging Tech</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {TECHNOLOGY_TRACKS.filter(t => t.maturity === 'emerging' || t.maturity === 'growing').map(track => (
                        <button
                            key={track.id}
                            onClick={() => onTrackChange(track.id)}
                            className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-medium transition-all",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                                activeTrack === track.id
                                    ? "text-white"
                                    : "bg-white/80 text-gray-600 hover:bg-white"
                            )}
                            style={{
                                backgroundColor: activeTrack === track.id ? track.color : undefined,
                            }}
                        >
                            {track.icon} {track.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Track Filter */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">Filter by Track</span>
                    {activeTrack !== 'ALL' && (
                        <button
                            onClick={() => onTrackChange('ALL')}
                            className="ml-auto flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700"
                        >
                            <X size={12} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Search Tracks */}
                <div className="relative mb-3">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tracks..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>

                {/* Track List */}
                <div className="space-y-1">
                    {filteredTracks.map(track => {
                        const count = trackCounts.get(track.id) || 0;
                        const isSelected = activeTrack === track.id;
                        const maturity = MATURITY_CONFIG[track.maturity];

                        return (
                            <button
                                key={track.id}
                                onClick={() => onTrackChange(isSelected ? 'ALL' : track.id)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                                    isSelected
                                        ? "bg-cyan-100 border border-cyan-200"
                                        : "hover:bg-gray-50 border border-transparent"
                                )}
                            >
                                <span
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                    style={{ backgroundColor: `${track.color}20` }}
                                >
                                    {track.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-800 truncate">
                                            {track.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[9px]", maturity.color)}>
                                            {maturity.label}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {count} signal{count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-cyan-100 bg-cyan-50/50">
                <p className="text-[10px] text-gray-500 text-center">
                    Tracking 6 technology tracks • {techSignals.length} signals
                </p>
            </div>
        </div>
    );
};
