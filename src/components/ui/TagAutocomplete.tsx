
import React, { useEffect, useRef, useState } from 'react';
import { useTagStore, type TagData } from '../../stores/tagStore';
import { cn } from '../../lib/utils';
import { Hash, Sparkles } from 'lucide-react';

interface TagAutocompleteProps {
    searchTerm: string; // The word being typed after #
    onSelect: (tag: string) => void;
    position: { top: number; left: number };
    onClose: () => void;
}

export const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
    searchTerm,
    onSelect,
    position,
    onClose,
}) => {
    const { getAllTags } = useTagStore();
    const [suggestions, setSuggestions] = useState<TagData[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load and filter
    useEffect(() => {
        const allTags = getAllTags();
        const lowerTerm = searchTerm.toLowerCase();

        // 1. Exact matches first, then partial matches
        // 2. Sort by usage count
        const filtered = allTags
            .filter(tag => tag.id.includes(lowerTerm))
            .sort((a, b) => {
                const aStarts = a.id.startsWith(lowerTerm);
                const bStarts = b.id.startsWith(lowerTerm);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return b.count - a.count;
            })
            .slice(0, 5); // Limit to top 5

        setSuggestions(filtered);
        setSelectedIndex(0); // Reset selection
    }, [searchTerm, getAllTags]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (suggestions.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                onSelect(suggestions[selectedIndex].id);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown, true); // Capture phase to prevent textarea default
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [suggestions, selectedIndex, onSelect, onClose]);

    // Close if clicked outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (suggestions.length === 0 && searchTerm.length < 1) return null;

    // Show namespace hint if just starting to type
    const showNamespaceHint = searchTerm.length === 0;

    return (
        <div
            ref={containerRef}
            className="fixed z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {/* Header */}
            <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Suggested Tags
                </span>
                <span className="text-[10px] text-gray-400">Tab to select</span>
            </div>

            {/* Suggestions List */}
            <div className="py-1 max-h-60 overflow-y-auto">
                {showNamespaceHint && suggestions.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">
                        Type to search tags...
                    </div>
                )}

                {suggestions.map((tag, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <button
                            key={tag.id}
                            onClick={() => onSelect(tag.id)}
                            className={cn(
                                'w-full text-left px-3 py-2 flex items-center justify-between transition-colors',
                                isSelected ? 'bg-amber-50' : 'hover:bg-gray-50'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    'p-1 rounded-md',
                                    isSelected ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                                )}>
                                    <Hash className="w-3 h-3" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        'text-sm font-medium',
                                        isSelected ? 'text-gray-900' : 'text-gray-700'
                                    )}>
                                        {tag.namespace}
                                        <span className="text-gray-400">/</span>
                                        {tag.value}
                                    </span>
                                </div>
                            </div>
                            {tag.count > 0 && (
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {tag.count}
                                </span>
                            )}
                        </button>
                    );
                })}

                {suggestions.length === 0 && !showNamespaceHint && (
                    <button
                        onClick={() => onSelect(searchTerm)}
                        className={cn(
                            'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors',
                            'bg-amber-50/50 hover:bg-amber-50'
                        )}
                    >
                        <div className="p-1 rounded-md bg-amber-100 text-amber-600">
                            <Hash className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium text-amber-700">
                            Create "{searchTerm}"
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};
