import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Resource, FAQ, Person } from '../types';

// ============================================
// UI Store - Theme, panels, filters
// ============================================

interface UIState {
    // Chat panel
    isChatOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;

    // Search
    isSearchFocused: boolean;
    setSearchFocused: (focused: boolean) => void;

    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // Mobile menu
    isMobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        (set) => ({
            // Chat panel
            isChatOpen: false,
            openChat: () => set({ isChatOpen: true }),
            closeChat: () => set({ isChatOpen: false }),
            toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

            // Search
            isSearchFocused: false,
            setSearchFocused: (focused) => set({ isSearchFocused: focused }),

            // Theme
            theme: 'light',
            setTheme: (theme) => set({ theme }),

            // Mobile menu
            isMobileMenuOpen: false,
            setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
        }),
        { name: 'ui-store' }
    )
);

// ============================================
// Favorites Store - User preferences
// ============================================

interface FavoritesState {
    favoriteResourceIds: string[];
    favoriteFAQIds: string[];
    favoritePersonIds: string[];

    // Actions
    addFavoriteResource: (id: string) => void;
    removeFavoriteResource: (id: string) => void;
    toggleFavoriteResource: (id: string) => void;
    isFavoriteResource: (id: string) => boolean;

    addFavoriteFAQ: (id: string) => void;
    removeFavoriteFAQ: (id: string) => void;
    toggleFavoriteFAQ: (id: string) => void;
    isFavoriteFAQ: (id: string) => boolean;

    addFavoritePerson: (id: string) => void;
    removeFavoritePerson: (id: string) => void;
    toggleFavoritePerson: (id: string) => void;
    isFavoritePerson: (id: string) => boolean;

    clearAllFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    devtools(
        persist(
            (set, get) => ({
                favoriteResourceIds: [],
                favoriteFAQIds: [],
                favoritePersonIds: [],

                addFavoriteResource: (id) =>
                    set((state) => ({
                        favoriteResourceIds: [...state.favoriteResourceIds, id]
                    })),
                removeFavoriteResource: (id) =>
                    set((state) => ({
                        favoriteResourceIds: state.favoriteResourceIds.filter(x => x !== id)
                    })),
                toggleFavoriteResource: (id) => {
                    const isFav = get().favoriteResourceIds.includes(id);
                    if (isFav) {
                        get().removeFavoriteResource(id);
                    } else {
                        get().addFavoriteResource(id);
                    }
                },
                isFavoriteResource: (id) => get().favoriteResourceIds.includes(id),

                addFavoriteFAQ: (id) =>
                    set((state) => ({
                        favoriteFAQIds: [...state.favoriteFAQIds, id]
                    })),
                removeFavoriteFAQ: (id) =>
                    set((state) => ({
                        favoriteFAQIds: state.favoriteFAQIds.filter(x => x !== id)
                    })),
                toggleFavoriteFAQ: (id) => {
                    const isFav = get().favoriteFAQIds.includes(id);
                    if (isFav) {
                        get().removeFavoriteFAQ(id);
                    } else {
                        get().addFavoriteFAQ(id);
                    }
                },
                isFavoriteFAQ: (id) => get().favoriteFAQIds.includes(id),

                addFavoritePerson: (id) =>
                    set((state) => ({
                        favoritePersonIds: [...state.favoritePersonIds, id]
                    })),
                removeFavoritePerson: (id) =>
                    set((state) => ({
                        favoritePersonIds: state.favoritePersonIds.filter(x => x !== id)
                    })),
                toggleFavoritePerson: (id) => {
                    const isFav = get().favoritePersonIds.includes(id);
                    if (isFav) {
                        get().removeFavoritePerson(id);
                    } else {
                        get().addFavoritePerson(id);
                    }
                },
                isFavoritePerson: (id) => get().favoritePersonIds.includes(id),

                clearAllFavorites: () => set({
                    favoriteResourceIds: [],
                    favoriteFAQIds: [],
                    favoritePersonIds: []
                }),
            }),
            { name: 'favorites-storage' }
        ),
        { name: 'favorites-store' }
    )
);

// ============================================
// Search Store - Search state and results
// ============================================

interface SearchResult {
    resources: Resource[];
    faqs: FAQ[];
    people: Person[];
    totalCount: number;
}

interface SearchState {
    query: string;
    isSearching: boolean;
    results: SearchResult | null;
    recentSearches: string[];

    setQuery: (query: string) => void;
    setSearching: (isSearching: boolean) => void;
    setResults: (results: SearchResult | null) => void;
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
    devtools(
        persist(
            (set, get) => ({
                query: '',
                isSearching: false,
                results: null,
                recentSearches: [],

                setQuery: (query) => set({ query }),
                setSearching: (isSearching) => set({ isSearching }),
                setResults: (results) => set({ results }),

                addRecentSearch: (query) => {
                    if (!query.trim()) return;
                    const existing = get().recentSearches;
                    const filtered = existing.filter(s => s !== query);
                    set({ recentSearches: [query, ...filtered].slice(0, 10) });
                },

                clearRecentSearches: () => set({ recentSearches: [] }),
            }),
            {
                name: 'search-storage',
                partialize: (state) => ({ recentSearches: state.recentSearches }),
            }
        ),
        { name: 'search-store' }
    )
);

// ============================================
// Chat History Store - Conversation persistence
// ============================================

interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: string;
    intent?: string;
}

interface ChatHistoryState {
    conversations: {
        id: string;
        title: string;
        messages: ChatMessage[];
        createdAt: string;
        updatedAt: string;
    }[];
    activeConversationId: string | null;

    startNewConversation: () => string;
    setActiveConversation: (id: string | null) => void;
    addMessageToConversation: (conversationId: string, message: ChatMessage) => void;
    deleteConversation: (id: string) => void;
    clearAllConversations: () => void;
}

export const useChatHistoryStore = create<ChatHistoryState>()(
    devtools(
        persist(
            (set) => ({
                conversations: [],
                activeConversationId: null,

                startNewConversation: () => {
                    const id = `conv-${Date.now()}`;
                    const newConversation = {
                        id,
                        title: 'New Conversation',
                        messages: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    set((state) => ({
                        conversations: [newConversation, ...state.conversations],
                        activeConversationId: id,
                    }));
                    return id;
                },

                setActiveConversation: (id) => set({ activeConversationId: id }),

                addMessageToConversation: (conversationId, message) => {
                    set((state) => ({
                        conversations: state.conversations.map((conv) => {
                            if (conv.id === conversationId) {
                                // Update title based on first user message
                                const newTitle = conv.messages.length === 0 && message.role === 'user'
                                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                                    : conv.title;
                                return {
                                    ...conv,
                                    title: newTitle,
                                    messages: [...conv.messages, message],
                                    updatedAt: new Date().toISOString(),
                                };
                            }
                            return conv;
                        }),
                    }));
                },

                deleteConversation: (id) => {
                    set((state) => ({
                        conversations: state.conversations.filter((c) => c.id !== id),
                        activeConversationId:
                            state.activeConversationId === id ? null : state.activeConversationId,
                    }));
                },

                clearAllConversations: () => set({
                    conversations: [],
                    activeConversationId: null
                }),
            }),
            { name: 'chat-history-storage' }
        ),
        { name: 'chat-history-store' }
    )
);
