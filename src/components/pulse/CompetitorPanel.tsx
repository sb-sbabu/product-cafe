import React, { useState } from 'react';
import type { CompetitorProfile } from '../../lib/pulse/competitorData';
import { CompetitorCard } from './CompetitorCard';
import { Users, Target, Zap, Sparkles, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR PANEL — Sidebar panel for competitor intelligence
// ═══════════════════════════════════════════════════════════════════════════

interface CompetitorPanelProps {
    competitors: CompetitorProfile[];
    selectedCompetitorId?: string | null;
    onSelectCompetitor?: (id: string | null) => void;
    onToggleWatchlist?: (id: string) => void;
}

type FilterTab = 'all' | 'watchlist' | 1 | 2 | 3;

export const CompetitorPanel: React.FC<CompetitorPanelProps> = ({
    competitors,
    selectedCompetitorId,
    onSelectCompetitor,
    onToggleWatchlist,
}) => {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter competitors
    const filteredCompetitors = competitors.filter(c => {
        // Tab filter
        if (activeTab === 'watchlist' && !c.watchlisted) return false;
        if (typeof activeTab === 'number' && c.tier !== activeTab) return false;

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
        }

        return true;
    });

    const tabs: Array<{ id: FilterTab; label: string; icon: React.ReactNode; count: number }> = [
        { id: 'all', label: 'All', icon: <Users size={14} />, count: competitors.length },
        { id: 'watchlist', label: 'Watching', icon: <Target size={14} />, count: competitors.filter(c => c.watchlisted).length },
        { id: 1, label: 'Tier 1', icon: <Zap size={14} />, count: competitors.filter(c => c.tier === 1).length },
        { id: 2, label: 'Tier 2', icon: <Zap size={14} />, count: competitors.filter(c => c.tier === 2).length },
        { id: 3, label: 'Tier 3', icon: <Sparkles size={14} />, count: competitors.filter(c => c.tier === 3).length },
    ];

    const totalSignals = competitors.reduce((sum, c) => sum + c.signalCount, 0);

    const handleSelect = (id: string) => {
        // Toggle selection
        if (selectedCompetitorId === id) {
            onSelectCompetitor?.(null);
        } else {
            onSelectCompetitor?.(id);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Target size={18} className="text-cafe-500" />
                        Competitor Radar
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {totalSignals} signals
                    </span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search competitors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cafe-500 focus:border-cafe-500"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                            activeTab === tab.id
                                ? "bg-cafe-100 text-cafe-700"
                                : "text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className={cn(
                            "ml-1 px-1.5 py-0.5 rounded text-[10px]",
                            activeTab === tab.id ? "bg-cafe-200" : "bg-gray-200"
                        )}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Competitor grid */}
            <div className="p-3 max-h-[400px] overflow-y-auto">
                {filteredCompetitors.length === 0 ? (
                    <div className="text-center py-8">
                        <Users size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No competitors match your filter</p>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {filteredCompetitors.map(competitor => (
                            <CompetitorCard
                                key={competitor.id}
                                competitor={competitor}
                                isSelected={selectedCompetitorId === competitor.id}
                                onSelect={handleSelect}
                                onToggleWatchlist={onToggleWatchlist}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Selected competitor info */}
            {selectedCompetitorId && (
                <div className="p-3 border-t border-gray-100 bg-cafe-50/50">
                    <div className="text-xs text-cafe-600 flex items-center gap-1">
                        <Target size={12} />
                        Filtering signals for {competitors.find(c => c.id === selectedCompetitorId)?.name}
                    </div>
                    <button
                        onClick={() => onSelectCompetitor?.(null)}
                        className="mt-1 text-xs text-cafe-700 underline hover:no-underline"
                    >
                        Clear filter
                    </button>
                </div>
            )}
        </div>
    );
};
