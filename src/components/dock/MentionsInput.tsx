import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { mockPeople } from '../../data/mockData';
import type { Person } from '../../types';

/**
 * MentionsInput - Textarea with @mentions autocomplete for experts
 * 
 * Usage: Type @ to trigger autocomplete dropdown with expert suggestions.
 * Selected experts are highlighted in the text.
 */

interface MentionsInputProps {
    value: string;
    onChange: (value: string) => void;
    onMention?: (person: Person) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}

export const MentionsInput: React.FC<MentionsInputProps> = ({
    value,
    onChange,
    onMention,
    placeholder,
    rows = 5,
    className,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionStartPos, setMentionStartPos] = useState(-1);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Filter people based on search query
    const suggestions = mockPeople
        .filter(p =>
            p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);

    // Handle text change and detect @mentions
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursor = e.target.selectionStart || 0;

        onChange(newValue);
        setCursorPosition(cursor);

        // Check if we're in a mention context
        const textBeforeCursor = newValue.slice(0, cursor);
        const atIndex = textBeforeCursor.lastIndexOf('@');

        if (atIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(atIndex + 1);
            // Only trigger if @ is at start or after whitespace, and no space after @
            const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
            const hasSpaceAfterAt = textAfterAt.includes(' ');

            if ((charBeforeAt === ' ' || charBeforeAt === '\n' || atIndex === 0) && !hasSpaceAfterAt) {
                setShowSuggestions(true);
                setSearchQuery(textAfterAt);
                setMentionStartPos(atIndex);
                setSelectedIndex(0);
                return;
            }
        }

        setShowSuggestions(false);
        setSearchQuery('');
        setMentionStartPos(-1);
    }, [onChange]);

    // Insert selected mention
    const insertMention = useCallback((person: Person) => {
        if (mentionStartPos === -1) return;

        const beforeMention = value.slice(0, mentionStartPos);
        const afterCursor = value.slice(cursorPosition);
        const mentionText = `@${person.displayName.split(' ')[0]} `;

        const newValue = beforeMention + mentionText + afterCursor;
        onChange(newValue);

        // Move cursor after mention
        const newCursorPos = mentionStartPos + mentionText.length;
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = newCursorPos;
                textareaRef.current.selectionEnd = newCursorPos;
                textareaRef.current.focus();
            }
        }, 0);

        setShowSuggestions(false);
        setSearchQuery('');
        setMentionStartPos(-1);
        onMention?.(person);
    }, [value, mentionStartPos, cursorPosition, onChange, onMention]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                insertMention(suggestions[selectedIndex]);
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    }, [showSuggestions, suggestions, selectedIndex, insertMention]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                textareaRef.current &&
                !textareaRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                className={cn(
                    'w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors',
                    className
                )}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        Mention an expert (↑↓ to navigate, Enter to select)
                    </div>
                    {suggestions.map((person, index) => (
                        <button
                            key={person.id}
                            onClick={() => insertMention(person)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                                index === selectedIndex
                                    ? 'bg-amber-50 text-amber-900'
                                    : 'hover:bg-gray-50'
                            )}
                        >
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                                'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700'
                            )}>
                                {person.displayName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {person.displayName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {person.title} · {person.expertiseAreas.slice(0, 2).join(', ')}
                                </div>
                            </div>
                            {person.expertiseAreas.length > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded">
                                    EXPERT
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Helper text */}
            <div className="mt-1.5 text-xs text-gray-400">
                💡 Type <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">@</kbd> to mention and notify an expert
            </div>
        </div>
    );
};
