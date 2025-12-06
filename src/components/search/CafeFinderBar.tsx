/**
 * Café Finder: Enhanced Search Bar with Instant Results
 * The main search interface for Product Café
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, Sparkles, User, Wrench, HelpCircle, FileText, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSearchStore } from '../../stores/searchStore';
import { cafeFinder } from '../../lib/search';
import type { PersonResult, ToolResult, FAQResult, ResourceResult, DiscussionResult } from '../../lib/search/types';

interface CafeFinderBarProps {
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onResultClick?: (result: PersonResult | ToolResult | FAQResult | ResourceResult | DiscussionResult) => void;
    showShortcut?: boolean;
}

export const CafeFinderBar: React.FC<CafeFinderBarProps> = ({
    placeholder = 'Search Product Café...',
    size = 'md',
    className,
    onResultClick,
    showShortcut = true,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [localQuery, setLocalQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        results,
        recentSearches,
        selectedIndex,
        isSearching,
        quickSearch,
        clearResults,
        addRecentSearch,
        removeRecentSearch,
        setSelectedIndex,
        navigateUp,
        navigateDown,
    } = useSearchStore();

    const sizes = {
        sm: { input: 'py-2 pl-9 pr-9 text-sm', icon: 16 },
        md: { input: 'py-2.5 pl-10 pr-10 text-base', icon: 18 },
        lg: { input: 'py-3 pl-11 pr-11 text-lg', icon: 20 },
    };

    // Initialize search engine on mount
    useEffect(() => {
        cafeFinder.initialize();
    }, []);

    // Handle debounced search
    const handleQueryChange = useCallback((value: string) => {
        setLocalQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!value.trim()) {
            clearResults();
            return;
        }

        debounceRef.current = setTimeout(() => {
            quickSearch(value);
        }, 100); // 100ms debounce for snappy feel
    }, [quickSearch, clearResults]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateDown();
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateUp();
                break;
            case 'Enter':
                e.preventDefault();
                if (results && selectedIndex >= 0) {
                    const allResults = [
                        ...results.results.faqs,
                        ...results.results.people,
                        ...results.results.tools,
                        ...results.results.resources,
                        ...results.results.discussions,
                    ];
                    if (allResults[selectedIndex]) {
                        handleResultClick(allResults[selectedIndex]);
                    }
                } else if (localQuery.trim()) {
                    addRecentSearch(localQuery);
                    // Trigger full search
                }
                break;
            case 'Escape':
                handleClear();
                inputRef.current?.blur();
                break;
        }
    };

    // Handle result click
    const handleResultClick = (result: PersonResult | ToolResult | FAQResult | ResourceResult | DiscussionResult) => {
        addRecentSearch(localQuery);
        onResultClick?.(result);
        handleClear();
    };

    // Handle clear
    const handleClear = () => {
        setLocalQuery('');
        clearResults();
        setSelectedIndex(0);
    };

    // Handle recent search click
    const handleRecentClick = (query: string) => {
        setLocalQuery(query);
        quickSearch(query);
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsFocused(true);
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const hasResults = results && results.totalCount > 0;
    const showDropdown = isFocused && (hasResults || recentSearches.length > 0 || localQuery === '');

    // Flatten results for indexing
    const allResults = results ? [
        ...results.results.faqs,
        ...results.results.people,
        ...results.results.tools,
        ...results.results.resources,
        ...results.results.discussions,
    ] : [];

    return (
        <div className={cn('relative w-full', className)}>
            {/* Search Input */}
            <div className="relative">
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {isSearching ? (
                        <svg className="animate-spin" width={sizes[size].icon} height={sizes[size].icon} viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <Search size={sizes[size].icon} />
                    )}
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={localQuery}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    aria-controls="cafe-finder-results"
                    aria-describedby="cafe-finder-hint"
                    className={cn(
                        'w-full bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-500',
                        'hover:border-gray-300',
                        sizes[size].input,
                        isFocused && 'ring-2 ring-cafe-500/20 border-cafe-500 shadow-lg'
                    )}
                />
                <span id="cafe-finder-hint" className="sr-only">
                    Type to search. Use up and down arrows to navigate results, Enter to select.
                </span>

                {/* Shortcut Badge or Clear Button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {localQuery ? (
                        <button
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            aria-label="Clear search"
                        >
                            <X size={sizes[size].icon - 2} />
                        </button>
                    ) : showShortcut ? (
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                            ⌘K
                        </kbd>
                    ) : null}
                </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    id="cafe-finder-results"
                    role="listbox"
                    aria-label="Search results"
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                >
                    {/* Results */}
                    {hasResults ? (
                        <div className="py-2">
                            {/* FAQs */}
                            {results.results.faqs.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <HelpCircle size={12} />
                                        FAQs
                                    </div>
                                    {results.results.faqs.slice(0, 3).map((faq, idx) => (
                                        <button
                                            key={faq.id}
                                            onClick={() => handleResultClick(faq)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors',
                                                allResults.indexOf(faq) === selectedIndex && 'bg-cafe-50'
                                            )}
                                        >
                                            <HelpCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{faq.question}</div>
                                                <div className="text-xs text-gray-500 truncate">{faq.answerSummary}</div>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">FAQ</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* People */}
                            {results.results.people.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mt-2">
                                        <User size={12} />
                                        People
                                    </div>
                                    {results.results.people.slice(0, 3).map((person) => (
                                        <button
                                            key={person.id}
                                            onClick={() => handleResultClick(person)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors',
                                                allResults.indexOf(person) === selectedIndex && 'bg-cafe-50'
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-cafe-100 flex items-center justify-center text-cafe-600 font-medium text-sm shrink-0">
                                                {person.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                                <div className="text-xs text-gray-500">{person.title} • {person.team}</div>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Person</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tools */}
                            {results.results.tools.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mt-2">
                                        <Wrench size={12} />
                                        Tools
                                    </div>
                                    {results.results.tools.slice(0, 3).map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => handleResultClick(tool)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors',
                                                allResults.indexOf(tool) === selectedIndex && 'bg-cafe-50'
                                            )}
                                        >
                                            <Wrench size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{tool.description}</div>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Tool</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Resources */}
                            {results.results.resources.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mt-2">
                                        <FileText size={12} />
                                        Resources
                                    </div>
                                    {results.results.resources.slice(0, 3).map((resource) => (
                                        <button
                                            key={resource.id}
                                            onClick={() => handleResultClick(resource)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors',
                                                allResults.indexOf(resource) === selectedIndex && 'bg-cafe-50'
                                            )}
                                        >
                                            <FileText size={16} className="text-green-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{resource.title}</div>
                                                <div className="text-xs text-gray-500">{resource.pillar} • {resource.category}</div>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Resource</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Discussions */}
                            {results.results.discussions.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mt-2">
                                        <MessageSquare size={12} />
                                        Discussions
                                    </div>
                                    {results.results.discussions.slice(0, 2).map((discussion) => (
                                        <button
                                            key={discussion.id}
                                            onClick={() => handleResultClick(discussion)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors',
                                                allResults.indexOf(discussion) === selectedIndex && 'bg-cafe-50'
                                            )}
                                        >
                                            <MessageSquare size={16} className="text-purple-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{discussion.title}</div>
                                                <div className="text-xs text-gray-500">{discussion.authorName} • {discussion.replyCount} replies</div>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Discussion</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Search metrics footer */}
                            <div className="px-3 py-2 mt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                <span>
                                    {results.totalCount} result{results.totalCount !== 1 ? 's' : ''} in {results.metrics.totalTimeMs.toFixed(0)}ms
                                </span>
                                <span className="flex items-center gap-1">
                                    <Sparkles size={12} className="text-cafe-500" />
                                    Powered by Café Finder
                                </span>
                            </div>
                        </div>
                    ) : localQuery ? (
                        /* No results */
                        <div className="py-8 text-center">
                            <div className="text-gray-400 mb-2">
                                <Search size={24} className="mx-auto" />
                            </div>
                            <div className="text-sm text-gray-600">No results for "{localQuery}"</div>
                            <div className="text-xs text-gray-400 mt-1">Try different keywords or start a discussion</div>
                        </div>
                    ) : (
                        /* Empty state with recent searches */
                        <div className="py-2">
                            {recentSearches.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={12} />
                                        Recent Searches
                                    </div>
                                    {recentSearches.slice(0, 5).map((recent, idx) => (
                                        <div
                                            key={idx}
                                            className="w-full px-3 py-2 hover:bg-gray-50 flex items-center justify-between group"
                                        >
                                            <button
                                                onClick={() => handleRecentClick(recent.query)}
                                                className="flex items-center gap-2 text-sm text-gray-700"
                                            >
                                                <Clock size={14} className="text-gray-400" />
                                                {recent.query}
                                            </button>
                                            <button
                                                onClick={() => removeRecentSearch(recent.query)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Suggestions */}
                            <div className="mt-2 border-t border-gray-100 pt-2">
                                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp size={12} />
                                    Try searching for
                                </div>
                                <div className="px-3 py-2 flex flex-wrap gap-2">
                                    {['Jira access', 'COB', 'PRD template', 'Sarah Chen'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleRecentClick(suggestion)}
                                            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
