/**
 * LOPReadingList - Curated reading lists for Love of Product sessions
 * 
 * Features:
 * - Auto-generated lists per LOP topic
 * - Pre-session primers
 * - Speaker book recommendations
 * - Deep-dive post-session reads
 */

import React, { useMemo } from 'react';
import { BookOpen, Clock, ArrowRight, Sparkles, GraduationCap, Play } from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface LOPSession {
    id: string;
    title: string;
    topic: string;
    speakerName?: string;
    tags: string[];
}

interface LOPReadingListProps {
    session: LOPSession;
    variant?: 'compact' | 'full';
    onBookClick?: (bookId: string) => void;
    className?: string;
}

// Topic to book tags mapping
const TOPIC_BOOK_MAPPING: Record<string, string[]> = {
    'product-strategy': ['strategy', 'product-management', 'business'],
    'user-research': ['discovery', 'customer-development', 'research'],
    'leadership': ['leadership', 'management', 'teams'],
    'discovery': ['discovery', 'experimentation', 'customer-development'],
    'execution': ['agile', 'delivery', 'teams'],
    'metrics': ['analytics', 'metrics', 'data'],
    'growth': ['growth', 'marketing', 'business'],
    'innovation': ['innovation', 'disruption', 'strategy'],
    'ai-ml': ['ai', 'ml', 'technology'],
    'design': ['design', 'ux', 'user-experience'],
};

export const LOPReadingList: React.FC<LOPReadingListProps> = ({
    session,
    variant = 'compact',
    onBookClick,
    className
}) => {
    const { books, isInReadingList, addToReadingList, getBookProgress } = useLibraryStore();

    // Find relevant books based on session topic and tags
    const relevantBooks = useMemo(() => {
        const topicTags = TOPIC_BOOK_MAPPING[session.topic] || [];
        const allTags = [...topicTags, ...session.tags];

        // Score books by relevance
        const scoredBooks = books.map(book => {
            let score = 0;

            // Tag matching
            book.tags.forEach(tag => {
                if (allTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                    score += 10;
                }
            });

            // Bonus for featured books
            if (book.collections.includes('featured')) score += 5;

            // Bonus for high rating
            if (book.rating >= 4.5) score += 3;

            return { book, score };
        });

        return scoredBooks
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, variant === 'compact' ? 3 : 6)
            .map(({ book }) => book);
    }, [books, session, variant]);

    // Categorize books
    const categorizedBooks = useMemo(() => {
        const primer = relevantBooks.filter(b => b.difficulty === 'beginner').slice(0, 1);
        const core = relevantBooks.filter(b => b.difficulty === 'intermediate').slice(0, 2);
        const deepDive = relevantBooks.filter(b => b.difficulty === 'advanced').slice(0, 1);

        return { primer, core, deepDive };
    }, [relevantBooks]);

    const handleAddToList = (e: React.MouseEvent, bookId: string) => {
        e.stopPropagation();
        addToReadingList(bookId);
    };

    if (relevantBooks.length === 0) {
        return null; // No relevant books found
    }

    if (variant === 'compact') {
        return (
            <div className={cn("bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100", className)}>
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">Related Reading</span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {relevantBooks.length} books
                    </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {relevantBooks.map(book => {
                        const progress = getBookProgress(book.id);
                        const inList = isInReadingList(book.id);

                        return (
                            <button
                                key={book.id}
                                onClick={() => onBookClick?.(book.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all shrink-0 group"
                            >
                                <div className="w-8 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-medium text-gray-900 line-clamp-1 max-w-[120px] group-hover:text-purple-700">
                                        {book.title}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {progress && progress.progress > 0 ? (
                                            <span className="text-[10px] text-purple-600">{Math.round(progress.progress)}%</span>
                                        ) : inList ? (
                                            <span className="text-[10px] text-green-600">In list</span>
                                        ) : (
                                            <span className="text-[10px] text-gray-400">{book.readingTimeHours}h</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Full variant
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Prepare for This Session</h3>
                        <p className="text-xs text-gray-500">Curated reading based on "{session.title}"</p>
                    </div>
                </div>
            </div>

            {/* Primer Section */}
            {categorizedBooks.primer.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Quick Primer</span>
                    </div>
                    {categorizedBooks.primer.map(book => (
                        <BookRow key={book.id} book={book} onBookClick={onBookClick} onAddToList={handleAddToList} />
                    ))}
                </div>
            )}

            {/* Core Reading */}
            {categorizedBooks.core.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Essential Reading</span>
                    </div>
                    {categorizedBooks.core.map(book => (
                        <BookRow key={book.id} book={book} onBookClick={onBookClick} onAddToList={handleAddToList} />
                    ))}
                </div>
            )}

            {/* Deep Dive */}
            {categorizedBooks.deepDive.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Deep Dive</span>
                    </div>
                    {categorizedBooks.deepDive.map(book => (
                        <BookRow key={book.id} book={book} onBookClick={onBookClick} onAddToList={handleAddToList} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper component for book rows
interface BookRowProps {
    book: {
        id: string;
        title: string;
        readingTimeHours: number;
        rating: number;
        difficulty: string;
    };
    onBookClick?: (bookId: string) => void;
    onAddToList: (e: React.MouseEvent, bookId: string) => void;
}

const BookRow: React.FC<BookRowProps> = ({ book, onBookClick, onAddToList }) => {
    const { isInReadingList, getBookProgress } = useLibraryStore();
    const inList = isInReadingList(book.id);
    const progress = getBookProgress(book.id);

    return (
        <div
            onClick={() => onBookClick?.(book.id)}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer group"
        >
            <div className="w-10 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                    {book.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {book.readingTimeHours}h
                    </div>
                    {progress && progress.progress > 0 && (
                        <span className="text-xs text-purple-600 font-medium">
                            {Math.round(progress.progress)}% complete
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={(e) => onAddToList(e, book.id)}
                disabled={inList}
                className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    inList
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200 opacity-0 group-hover:opacity-100"
                )}
            >
                {inList ? '✓ Added' : 'Add'}
            </button>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" />
        </div>
    );
};

export default LOPReadingList;
