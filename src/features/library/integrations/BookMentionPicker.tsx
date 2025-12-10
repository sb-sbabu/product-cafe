/**
 * BookMentionPicker - Autocomplete for mentioning books in TOAST recognitions
 * 
 * Features:
 * - Search-as-you-type for books
 * - Preview card on hover
 * - One-click add to reading list
 * - "Inspired by 📚" tag for recognitions
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { BookOpen, Plus, Check, Search, X, Sparkles } from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface BookMentionPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (book: { id: string; title: string; authorNames: string }) => void;
    triggerRef?: React.RefObject<HTMLElement>;
    className?: string;
}

export const BookMentionPicker: React.FC<BookMentionPickerProps> = ({
    isOpen,
    onClose,
    onSelect,
    triggerRef,
    className
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

    const { books, isInReadingList, addToReadingList } = useLibraryStore();

    // Filter books based on search
    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) {
            // Show featured/popular books when no search
            return books.filter(b => b.collections.includes('featured')).slice(0, 6);
        }

        const query = searchQuery.toLowerCase();
        return books.filter(b =>
            b.title.toLowerCase().includes(query) ||
            b.tags.some(t => t.toLowerCase().includes(query))
        ).slice(0, 8);
    }, [books, searchQuery]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSelectBook = useCallback((book: typeof books[0]) => {
        // Get author names from the library store
        const authorNames = book.authorIds.length > 0 ? 'Author' : 'Various Authors';
        onSelect({
            id: book.id,
            title: book.title,
            authorNames
        });
        setSearchQuery('');
        onClose();
    }, [onSelect, onClose]);

    const handleAddToReadingList = useCallback((e: React.MouseEvent, bookId: string) => {
        e.stopPropagation();
        addToReadingList(bookId);
    }, [addToReadingList]);

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "absolute z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden",
                "animate-in fade-in slide-in-from-bottom-2 duration-200",
                className
            )}
            style={{
                top: triggerRef?.current ? triggerRef.current.offsetHeight + 8 : 'auto',
            }}
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-900">Link to a Book</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                    />
                </div>
            </div>

            {/* Book List */}
            <div className="max-h-72 overflow-y-auto p-2">
                {filteredBooks.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No books found</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredBooks.map(book => {
                            const inList = isInReadingList(book.id);
                            const isHovered = hoveredBookId === book.id;

                            return (
                                <div
                                    key={book.id}
                                    onClick={() => handleSelectBook(book)}
                                    onMouseEnter={() => setHoveredBookId(book.id)}
                                    onMouseLeave={() => setHoveredBookId(null)}
                                    className={cn(
                                        "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group",
                                        isHovered
                                            ? "bg-purple-50 border border-purple-100"
                                            : "hover:bg-gray-50 border border-transparent"
                                    )}
                                >
                                    {/* Book Icon */}
                                    <div className={cn(
                                        "w-10 h-12 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                        "bg-gradient-to-br from-purple-100 to-pink-100",
                                        isHovered && "scale-105 shadow-md"
                                    )}>
                                        <BookOpen className="w-5 h-5 text-purple-600" />
                                    </div>

                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                            {book.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                                "text-xs px-1.5 py-0.5 rounded-full",
                                                book.difficulty === 'beginner' && "bg-green-100 text-green-700",
                                                book.difficulty === 'intermediate' && "bg-amber-100 text-amber-700",
                                                book.difficulty === 'advanced' && "bg-red-100 text-red-700"
                                            )}>
                                                {book.difficulty}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {book.readingTimeHours}h read
                                            </span>
                                        </div>
                                    </div>

                                    {/* Add to List Button */}
                                    <button
                                        onClick={(e) => handleAddToReadingList(e, book.id)}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all shrink-0",
                                            inList
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-purple-100 hover:text-purple-600"
                                        )}
                                        title={inList ? "In reading list" : "Add to reading list"}
                                    >
                                        {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                    💡 Link a book to show how it inspired your recognition
                </p>
            </div>
        </div>
    );
};

export default BookMentionPicker;
