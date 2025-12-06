import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TagData {
    id: string;          // e.g. "priority/high"
    namespace: string;   // "priority"
    value: string;       // "high"
    count: number;       // usage count
    lastUsed: string;   // ISO date
}

interface TagState {
    tags: Record<string, TagData>;

    // Actions
    registerTag: (fullTag: string) => void;
    getTagsByNamespace: (namespace: string) => TagData[];
    getAllTags: () => TagData[];
    getPopularTags: (limit?: number) => TagData[];
}

export const useTagStore = create<TagState>()(
    persist(
        (set, get) => ({
            tags: {},

            registerTag: (fullTag: string) => {
                // Remove # prefix if valid
                const cleanTag = fullTag.startsWith('#') ? fullTag.slice(1) : fullTag;

                // Parse namespace
                const parts = cleanTag.split('/');
                const namespace = parts.length > 1 ? parts[0].toLowerCase() : 'default';
                const value = parts.length > 1 ? parts.slice(1).join('/') : cleanTag;
                const id = cleanTag.toLowerCase();

                set((state) => {
                    const existing = state.tags[id];
                    const now = new Date().toISOString();

                    return {
                        tags: {
                            ...state.tags,
                            [id]: {
                                id,
                                namespace,
                                value,
                                count: (existing?.count || 0) + 1,
                                lastUsed: now,
                            },
                        },
                    };
                });
            },

            getTagsByNamespace: (namespace: string) => {
                const { tags } = get();
                return Object.values(tags)
                    .filter(t => t.namespace === namespace.toLowerCase())
                    .sort((a, b) => b.count - a.count);
            },

            getAllTags: () => {
                return Object.values(get().tags).sort((a, b) => b.count - a.count);
            },

            getPopularTags: (limit = 10) => {
                return Object.values(get().tags)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, limit);
            },
        }),
        {
            name: 'cafe-tags',
        }
    )
);
