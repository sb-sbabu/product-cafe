import React, { useState, useMemo, useCallback } from 'react';
import type { PulseSignal, SignalDomain, SignalPriority } from '../../lib/pulse/types';
import { DOMAIN_CONFIG, PRIORITY_CONFIG } from '../../lib/pulse/types';
import {
    searchSignals,
    getSavedSearches,
    saveSearch,
    deleteSavedSearch,
    type SearchQuery,
    type SearchFilters,
    type SavedSearch,
} from '../../lib/pulse/searchService';
import { Search, Filter, X, Tag, Star, Bookmark, Clock, Save, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchPanelProps {
    signals: PulseSignal[];
    onResultsChange: (results: PulseSignal[]) => void;
    className?: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
    signals,
    onResultsChange,
    className,
}) => {
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(getSavedSearches);

    const [filters, setFilters] = useState<SearchFilters>({
        domains: [],
        priorities: [],
        entities: [],
        isRead: null,
        isBookmarked: null,
        dateRange: { start: null, end: null },
    });

    const query: SearchQuery = useMemo(() => ({
        text: searchText,
        filters,
    }), [searchText, filters]);

    const results = useMemo(() => {
        const searchResults = searchSignals(signals, query);
        return searchResults.map(r => r.signal);
    }, [signals, query]);

    React.useEffect(() => {
        onResultsChange(results);
    }, [results, onResultsChange]);

    const toggleDomain = useCallback((domain: SignalDomain) => {
        setFilters(prev => ({
            ...prev,
            domains: prev.domains?.includes(domain)
                ? prev.domains.filter(d => d !== domain)
                : [...(prev.domains || []), domain],
        }));
    }, []);

    const togglePriority = useCallback((priority: SignalPriority) => {
        setFilters(prev => ({
            ...prev,
            priorities: prev.priorities?.includes(priority)
                ? prev.priorities.filter(p => p !== priority)
                : [...(prev.priorities || []), priority],
        }));
    }, []);

    const toggleReadStatus = useCallback((isRead: boolean) => {
        setFilters(prev => ({
            ...prev,
            isRead: prev.isRead === isRead ? null : isRead,
        }));
    }, []);

    const toggleBookmarkStatus = useCallback((isBookmarked: boolean) => {
        setFilters(prev => ({
            ...prev,
            isBookmarked: prev.isBookmarked === isBookmarked ? null : isBookmarked,
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            domains: [],
            priorities: [],
            entities: [],
            isRead: null,
            isBookmarked: null,
            dateRange: { start: null, end: null },
        });
        setSearchText('');
    }, []);

    const handleSaveSearch = useCallback(() => {
        const name = window.prompt('Name this search:');
        if (name?.trim()) {
            saveSearch(name.trim(), query);
            setSavedSearches(getSavedSearches());
        }
    }, [query]);

    const handleDeleteSavedSearch = useCallback((id: string) => {
        deleteSavedSearch(id);
        setSavedSearches(getSavedSearches());
    }, []);

    const handleApplySavedSearch = useCallback((saved: SavedSearch) => {
        setSearchText(saved.query.text);
        setFilters(saved.query.filters);
        setShowSavedSearches(false);
    }, []);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.domains?.length) count += filters.domains.length;
        if (filters.priorities?.length) count += filters.priorities.length;
        if (filters.entities?.length) count += filters.entities.length;
        if (filters.isRead !== null) count++;
        if (filters.isBookmarked !== null) count++;
        if (filters.dateRange?.start || filters.dateRange?.end) count++;
        return count;
    }, [filters]);

    return (
        <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
            <div className="p-3 border-b border-gray-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search signals..."
                        className="w-full pl-9 pr-20 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {(searchText || activeFilterCount > 0) && (
                            <button onClick={clearFilters} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Clear search">
                                <X size={14} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn("p-1.5 rounded transition-colors flex items-center gap-1", showFilters || activeFilterCount > 0 ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
                            title="Advanced filters"
                        >
                            <Filter size={14} />
                            {activeFilterCount > 0 && <span className="text-[10px] font-bold">{activeFilterCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{results.length} signal{results.length !== 1 ? 's' : ''} found</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSavedSearches(!showSavedSearches)} className="flex items-center gap-1 text-gray-400 hover:text-indigo-600">
                            <Clock size={12} />
                            Saved ({savedSearches.length})
                        </button>
                        {(searchText || activeFilterCount > 0) && (
                            <button onClick={handleSaveSearch} className="flex items-center gap-1 text-gray-400 hover:text-indigo-600">
                                <Save size={12} />
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showSavedSearches && savedSearches.length > 0 && (
                <div className="p-2 border-b border-gray-100 bg-gray-50/50 max-h-40 overflow-y-auto">
                    {savedSearches.map(saved => (
                        <div key={saved.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg group">
                            <button onClick={() => handleApplySavedSearch(saved)} className="flex-1 text-left text-sm text-gray-700 hover:text-indigo-600">
                                <Star size={12} className="inline mr-1.5 text-amber-400" />
                                {saved.name}
                            </button>
                            <button onClick={() => handleDeleteSavedSearch(saved.id)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showFilters && (
                <div className="p-3 border-b border-gray-100 space-y-3">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                            <Tag size={12} />
                            Domains
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleDomain(key as SignalDomain)}
                                    className={cn("px-2 py-1 rounded-full text-[10px] font-semibold transition-all", filters.domains?.includes(key as SignalDomain) ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                                    style={{ backgroundColor: filters.domains?.includes(key as SignalDomain) ? config.color : undefined }}
                                >
                                    {config.icon} {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Priority</div>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => togglePriority(key as SignalPriority)}
                                    className={cn("px-2 py-1 rounded-full text-[10px] font-semibold transition-all", filters.priorities?.includes(key as SignalPriority) ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                                    style={{ backgroundColor: filters.priorities?.includes(key as SignalPriority) ? config.color : undefined }}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Status</div>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => toggleReadStatus(false)}
                                className={cn("px-2 py-1 rounded-full text-[10px] font-semibold transition-all", filters.isRead === false ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                            >
                                Unread Only
                            </button>
                            <button
                                onClick={() => toggleBookmarkStatus(true)}
                                className={cn("px-2 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1", filters.isBookmarked === true ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                            >
                                <Bookmark size={10} />
                                Bookmarked
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
