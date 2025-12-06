/**
 * Café Finder: Search Store
 * State management for search functionality
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cafeFinder, type SearchResponse, type SearchContext } from '../lib/search';

// ============================================
// STORE TYPES
// ============================================

interface RecentSearch {
    query: string;
    timestamp: string;
}

interface SearchState {
    // Current search state
    query: string;
    isSearching: boolean;
    results: SearchResponse | null;
    error: string | null;

    // Recent searches
    recentSearches: RecentSearch[];

    // Search context
    context: SearchContext | null;

    // UI state
    isOpen: boolean;
    selectedIndex: number; // For keyboard navigation

    // Actions
    setQuery: (query: string) => void;
    search: (query: string, context?: SearchContext) => Promise<void>;
    quickSearch: (query: string) => void;
    clearResults: () => void;

    // Recent searches
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
    removeRecentSearch: (query: string) => void;

    // UI actions
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    setSelectedIndex: (index: number) => void;
    navigateUp: () => void;
    navigateDown: () => void;

    // Context
    setContext: (context: SearchContext | null) => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useSearchStore = create<SearchState>()(
    persist(
        (set, get) => ({
            // Initial state
            query: '',
            isSearching: false,
            results: null,
            error: null,
            recentSearches: [],
            context: null,
            isOpen: false,
            selectedIndex: 0,

            // Set query (for controlled input)
            setQuery: (query) => {
                set({ query });
            },

            // Full search
            search: async (query, context) => {
                if (!query.trim()) {
                    set({ results: null, error: null });
                    return;
                }

                set({ isSearching: true, error: null, query });

                try {
                    const results = cafeFinder.search(query, context || get().context || undefined);
                    set({ results, isSearching: false });

                    // Add to recent searches
                    get().addRecentSearch(query);
                } catch (error) {
                    console.error('[SearchStore] Search error:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Search failed',
                        isSearching: false
                    });
                }
            },

            // Quick search (for autocomplete, with error handling)
            quickSearch: (query) => {
                if (!query || typeof query !== 'string' || !query.trim()) {
                    set({ results: null, error: null });
                    return;
                }

                try {
                    const results = cafeFinder.search(query, get().context || undefined);
                    set({ results, query, error: null, isSearching: false });
                } catch (error) {
                    console.error('[SearchStore] Quick search error:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Search failed',
                        isSearching: false
                    });
                }
            },

            // Clear results
            clearResults: () => {
                set({ results: null, query: '', error: null, selectedIndex: 0 });
            },

            // Add to recent searches
            addRecentSearch: (query) => {
                const trimmed = query.trim();
                if (!trimmed || trimmed.length < 2) return;

                const { recentSearches } = get();

                // Remove duplicate if exists
                const filtered = recentSearches.filter(
                    s => s.query.toLowerCase() !== trimmed.toLowerCase()
                );

                // Add new search at the beginning
                const newSearch: RecentSearch = {
                    query: trimmed,
                    timestamp: new Date().toISOString(),
                };

                // Keep only last 10
                const updated = [newSearch, ...filtered].slice(0, 10);

                set({ recentSearches: updated });
            },

            // Clear all recent searches
            clearRecentSearches: () => {
                set({ recentSearches: [] });
            },

            // Remove a specific recent search
            removeRecentSearch: (query) => {
                const { recentSearches } = get();
                set({
                    recentSearches: recentSearches.filter(
                        s => s.query.toLowerCase() !== query.toLowerCase()
                    ),
                });
            },

            // Open search modal/panel
            openSearch: () => {
                set({ isOpen: true, selectedIndex: 0 });
            },

            // Close search
            closeSearch: () => {
                set({ isOpen: false, query: '', results: null, selectedIndex: 0 });
            },

            // Toggle search
            toggleSearch: () => {
                const { isOpen } = get();
                if (isOpen) {
                    get().closeSearch();
                } else {
                    get().openSearch();
                }
            },

            // Set selected index for keyboard nav
            setSelectedIndex: (index) => {
                set({ selectedIndex: Math.max(0, index) });
            },

            // Navigate up
            navigateUp: () => {
                const { selectedIndex } = get();
                set({ selectedIndex: Math.max(0, selectedIndex - 1) });
            },

            // Navigate down
            navigateDown: () => {
                const { selectedIndex, results } = get();
                if (!results) return;

                const totalResults =
                    results.results.people.length +
                    results.results.tools.length +
                    results.results.faqs.length +
                    results.results.resources.length +
                    results.results.discussions.length;

                set({ selectedIndex: Math.min(totalResults - 1, selectedIndex + 1) });
            },

            // Set context
            setContext: (context) => {
                set({ context });
            },
        }),
        {
            name: 'cafe-finder-search',
            partialize: (state) => ({
                recentSearches: state.recentSearches,
            }),
        }
    )
);

// ============================================
// SELECTORS
// ============================================

export const selectHasResults = (state: SearchState) =>
    state.results !== null && state.results.totalCount > 0;

export const selectTopResults = (state: SearchState, limit = 5) => {
    if (!state.results) return [];

    const { results } = state.results;
    return [
        ...results.faqs.slice(0, limit),
        ...results.people.slice(0, limit),
        ...results.tools.slice(0, limit),
        ...results.resources.slice(0, limit),
    ].slice(0, limit);
};

export const selectSearchMetrics = (state: SearchState) => state.results?.metrics;
