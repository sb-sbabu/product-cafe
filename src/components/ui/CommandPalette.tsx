import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ArrowRight, FileText, HelpCircle, Users, ChevronRight, Clock, Command } from 'lucide-react';
import { cn } from '../../lib/utils';
import { searchApi } from '../../services/api';
import type { Resource, FAQ, Person } from '../../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (section: string) => void;
    onSelectResource?: (resource: Resource) => void;
    onSelectFaq?: (faq: FAQ) => void;
    onSelectPerson?: (person: Person) => void;
}

interface SearchResult {
    type: 'resource' | 'faq' | 'person' | 'action';
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    action: () => void;
}

/**
 * Command Palette - Universal search with keyboard navigation
 * 
 * Opens with Cmd+K or /
 * Navigate with arrow keys
 * Select with Enter
 * Close with Escape
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onNavigate,
    onSelectResource,
    onSelectFaq,
    onSelectPerson,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Quick actions - memoized to prevent recreation on every render
    const quickActions: SearchResult[] = React.useMemo(() => [
        {
            type: 'action',
            id: 'home',
            title: 'Go to Home',
            subtitle: 'Starting point',
            icon: <Command className="w-4 h-4" />,
            action: () => { onNavigate?.('home'); onClose(); },
        },
        {
            type: 'action',
            id: 'pulse',
            title: 'PULSE Intelligence',
            subtitle: 'Market signals & competitors',
            icon: <ArrowRight className="w-4 h-4 text-purple-500" />,
            action: () => { onNavigate?.('pulse'); onClose(); },
        },
        {
            type: 'action',
            id: 'grab-go',
            title: 'Grab & Go',
            subtitle: 'Quick links and tools',
            icon: <ArrowRight className="w-4 h-4" />,
            action: () => { onNavigate?.('grab-and-go'); onClose(); },
        },
        {
            type: 'action',
            id: 'library',
            title: 'Library',
            subtitle: 'Learning resources',
            icon: <FileText className="w-4 h-4" />,
            action: () => { onNavigate?.('library'); onClose(); },
        },
        {
            type: 'action',
            id: 'community',
            title: 'Community',
            subtitle: 'Find experts',
            icon: <Users className="w-4 h-4" />,
            action: () => { onNavigate?.('community'); onClose(); },
        },
        {
            type: 'action',
            id: 'leaderboard',
            title: 'Leaderboard',
            subtitle: 'Top contributors',
            icon: <ArrowRight className="w-4 h-4 text-amber-500" />,
            action: () => { onNavigate?.('leaderboard'); onClose(); },
        },
        {
            type: 'action',
            id: 'credits',
            title: 'Credits',
            subtitle: 'Your reward balance',
            icon: <ArrowRight className="w-4 h-4 text-yellow-500" />,
            action: () => { onNavigate?.('credits'); onClose(); },
        },
        {
            type: 'action',
            id: 'admin',
            title: 'Admin',
            subtitle: 'Settings & management',
            icon: <ArrowRight className="w-4 h-4 text-gray-500" />,
            action: () => { onNavigate?.('admin'); onClose(); },
        },
    ], [onNavigate, onClose]);

    // Search with debounce
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults(quickActions);
            return;
        }

        setIsLoading(true);
        try {
            const { resources, faqs, people } = await searchApi.quickSearch(searchQuery, 3);

            const searchResults: SearchResult[] = [];

            // Add resources
            resources.forEach(r => {
                searchResults.push({
                    type: 'resource',
                    id: r.id,
                    title: r.title,
                    subtitle: r.description.slice(0, 60) + '...',
                    icon: <FileText className="w-4 h-4 text-purple-500" />,
                    action: () => {
                        onSelectResource?.(r);
                        window.open(r.url, '_blank');
                        onClose();
                    },
                });
            });

            // Add FAQs
            faqs.forEach(f => {
                searchResults.push({
                    type: 'faq',
                    id: f.id,
                    title: f.question,
                    subtitle: f.answerSummary.slice(0, 60) + '...',
                    icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
                    action: () => {
                        onSelectFaq?.(f);
                        onNavigate?.('grab-and-go');
                        onClose();
                    },
                });
            });

            // Add people
            people.forEach(p => {
                searchResults.push({
                    type: 'person',
                    id: p.id,
                    title: p.displayName,
                    subtitle: p.title,
                    icon: <Users className="w-4 h-4 text-cyan-500" />,
                    action: () => {
                        onSelectPerson?.(p);
                        onNavigate?.('community');
                        onClose();
                    },
                });
            });

            setResults(searchResults.length > 0 ? searchResults : quickActions);
        } catch (error) {
            console.error('Search error:', error);
            setResults(quickActions);
        } finally {
            setIsLoading(false);
        }
    }, [onClose, onNavigate, onSelectFaq, onSelectPerson, onSelectResource, quickActions]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 200);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setResults(quickActions);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, quickActions]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, results.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        results[selectedIndex].action();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        const container = resultsRef.current;
        if (!container) return;

        const selectedEl = container.children[selectedIndex] as HTMLElement;
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Palette - Full screen on mobile, centered on desktop */}
            <div className={cn(
                "fixed z-50 animate-scale-in",
                // Mobile: full screen with safe areas
                "inset-0 p-4 pt-safe",
                // Desktop: centered modal
                "md:inset-auto md:top-[20%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl md:p-0"
            )}>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 h-full md:h-auto flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-4 md:py-3 border-b border-gray-100 shrink-0">
                        <Search className="w-5 h-5 text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search resources, FAQs, people..."
                            className="flex-1 text-lg outline-none placeholder:text-gray-400 min-w-0"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <kbd className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                            esc
                        </kbd>
                    </div>

                    {/* Results - Scrollable area */}
                    <div ref={resultsRef} className="flex-1 overflow-y-auto py-2 min-h-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <Clock className="w-5 h-5 animate-spin" />
                                <span className="ml-2">Searching...</span>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No results found
                            </div>
                        ) : (
                            results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={result.action}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                        index === selectedIndex ? 'bg-cafe-50' : 'hover:bg-gray-50'
                                    )}
                                >
                                    <div className={cn(
                                        'p-2 rounded-lg',
                                        index === selectedIndex ? 'bg-cafe-100' : 'bg-gray-100'
                                    )}>
                                        {result.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                            {result.title}
                                        </div>
                                        {result.subtitle && (
                                            <div className="text-sm text-gray-500 truncate">
                                                {result.subtitle}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className={cn(
                                        'w-4 h-4 transition-opacity',
                                        index === selectedIndex ? 'opacity-100 text-cafe-600' : 'opacity-0'
                                    )} />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <span><kbd className="px-1 py-0.5 bg-white rounded border">↑↓</kbd> Navigate</span>
                            <span><kbd className="px-1 py-0.5 bg-white rounded border">↵</kbd> Select</span>
                        </div>
                        <span>Product Café Search</span>
                    </div>
                </div>
            </div>
        </>
    );
};
