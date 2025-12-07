import React, { useState } from 'react';
import type { PulseSignal } from '../../lib/pulse/types';
import {
    REGULATORY_AGENCIES,
    REGULATORY_TOPICS,
    type RegulatoryAgency,
    type RegulatoryTopic,
} from '../../lib/pulse/regulatoryData';
import { DeadlineTracker } from './DeadlineTracker';
import { Search, Scale, Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// REGULATORY PANEL — Sidebar for regulatory intelligence filtering
// ═══════════════════════════════════════════════════════════════════════════

interface RegulatoryPanelProps {
    signals: PulseSignal[];
    activeAgency: RegulatoryAgency | 'ALL';
    activeTopic: RegulatoryTopic | null;
    onAgencyChange: (agency: RegulatoryAgency | 'ALL') => void;
    onTopicChange: (topic: RegulatoryTopic | null) => void;
    onSelectSignal?: (id: string) => void;
}

export const RegulatoryPanel: React.FC<RegulatoryPanelProps> = ({
    signals,
    activeAgency,
    activeTopic,
    onAgencyChange,
    onTopicChange,
    onSelectSignal,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Get regulatory signals only
    const regulatorySignals = signals.filter(s => s.domain === 'REGULATORY');

    // Count signals by agency
    const agencyCounts = new Map<RegulatoryAgency | 'ALL', number>();
    agencyCounts.set('ALL', regulatorySignals.length);
    regulatorySignals.forEach(s => {
        const agency = s.regulatory?.agency;
        if (agency) {
            agencyCounts.set(agency, (agencyCounts.get(agency) || 0) + 1);
        }
    });

    // Count signals by topic
    const topicCounts = new Map<RegulatoryTopic, number>();
    regulatorySignals.forEach(s => {
        const topic = s.regulatory?.topic;
        if (topic) {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        }
    });

    // Filter topics by search
    const filteredTopics = REGULATORY_TOPICS.filter(t =>
        searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-amber-50/30 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                    <Scale size={20} className="text-amber-600" />
                    <h3 className="font-bold text-gray-900">Regulatory Intel</h3>
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {regulatorySignals.length} signals
                    </span>
                </div>

                {/* Agency Tabs */}
                <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => onAgencyChange('ALL')}
                        className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-semibold transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                            activeAgency === 'ALL'
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        All ({agencyCounts.get('ALL') || 0})
                    </button>
                    {REGULATORY_AGENCIES.map(agency => (
                        <button
                            key={agency.id}
                            onClick={() => onAgencyChange(agency.id)}
                            className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-semibold transition-all",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                                activeAgency === agency.id
                                    ? "text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                            style={{
                                backgroundColor: activeAgency === agency.id ? agency.color : undefined,
                            }}
                        >
                            {agency.icon} {agency.name}
                            <span className="ml-1 opacity-70">
                                {agencyCounts.get(agency.id) || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Deadline Tracker */}
            <div className="p-3 border-b border-amber-100">
                <DeadlineTracker
                    signals={regulatorySignals}
                    maxItems={3}
                    onSelectSignal={onSelectSignal}
                />
            </div>

            {/* Topic Filter */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">Filter by Topic</span>
                    {activeTopic && (
                        <button
                            onClick={() => onTopicChange(null)}
                            className="ml-auto flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                        >
                            <X size={12} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Search Topics */}
                <div className="relative mb-3">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                </div>

                {/* Topic List */}
                <div className="space-y-1">
                    {filteredTopics.map(topic => {
                        const count = topicCounts.get(topic.id) || 0;
                        const isSelected = activeTopic === topic.id;

                        return (
                            <button
                                key={topic.id}
                                onClick={() => onTopicChange(isSelected ? null : topic.id)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                                    isSelected
                                        ? "bg-amber-100 border border-amber-200"
                                        : "hover:bg-gray-50 border border-transparent"
                                )}
                            >
                                <span
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                    style={{ backgroundColor: `${topic.color}20` }}
                                >
                                    {topic.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-800 truncate">
                                            {topic.name}
                                        </span>
                                        {topic.relevance === 'critical' && (
                                            <span className="flex-shrink-0 px-1 py-0.5 bg-red-100 text-red-700 text-[8px] font-bold rounded">
                                                CRITICAL
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                        {count} signal{count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-amber-100 bg-amber-50/50">
                <p className="text-[10px] text-gray-500 text-center">
                    Monitoring 6 agencies • 10 topics
                </p>
            </div>
        </div>
    );
};
