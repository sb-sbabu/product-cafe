import React, { useMemo } from 'react';
import { useTagStore } from '../../stores/tagStore';
import { TagPill } from '../ui/TagPill';
import { Hash, Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDiscussionStore } from '../../stores/discussionStore';

interface TagDirectoryProps {
    onSelectTag?: (tag: string) => void;
}

export const TagDirectory: React.FC<TagDirectoryProps> = ({ onSelectTag }) => {
    const { getAllTags } = useTagStore();
    const { activeTagFilter, setTagFilter } = useDiscussionStore();

    const tags = getAllTags();

    // Group tags by namespace
    const tagsByNamespace = useMemo(() => {
        const groups: Record<string, typeof tags> = {};
        tags.forEach(tag => {
            if (!groups[tag.namespace]) {
                groups[tag.namespace] = [];
            }
            groups[tag.namespace].push(tag);
        });
        return groups;
    }, [tags]);

    // Sort namespaces: priority, status, then others alphabetically
    const sortedNamespaces = Object.keys(tagsByNamespace).sort((a, b) => {
        const order = ['priority', 'status', 'team', 'type', 'area', 'default'];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const handleTagClick = (fullTagFn: string) => {
        const fullTag = '#' + fullTagFn;
        if (activeTagFilter === fullTag) {
            setTagFilter(null); // Toggle off
        } else {
            setTagFilter(fullTag);
            if (onSelectTag) onSelectTag(fullTag);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-500" />
                        Knowledge Fabric
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                        {tags.length} TAGS
                    </span>
                </div>
                <p className="text-sm text-gray-500">
                    Explore topics across the organization.
                </p>
            </div>

            {/* Active Filter Banner */}
            {activeTagFilter && (
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-800">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filtering by:</span>
                        <TagPill tag={activeTagFilter} size="sm" />
                    </div>
                    <button
                        onClick={() => setTagFilter(null)}
                        className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Content Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {tags.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No tags discovered yet.</p>
                        <p className="text-sm mt-1">Start using #hashtags in discussions.</p>
                    </div>
                ) : (
                    sortedNamespaces.map(namespace => (
                        <div key={namespace} className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                {namespace !== 'default' && <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                {namespace}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {tagsByNamespace[namespace].map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagClick(tag.namespace === 'default' ? tag.value : `${tag.namespace}/${tag.value}`)}
                                        className={cn(
                                            "group flex items-center gap-2 pr-2 rounded-full border border-transparent hover:border-gray-200 hover:bg-white transition-all",
                                            activeTagFilter === `#${tag.id}` && "ring-2 ring-emerald-500 ring-offset-1 bg-white"
                                        )}
                                    >
                                        <TagPill
                                            tag={tag.namespace === 'default' ? tag.value : `${tag.namespace}/${tag.value}`}
                                            // No extra styles in pill, styling handles by button container mostly
                                            className="pointer-events-none" // let button handle click
                                        />
                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full group-hover:bg-gray-200 transition-colors">
                                            {tag.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
