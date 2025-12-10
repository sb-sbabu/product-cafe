import React from 'react';
import { Book, Clock, Star, BookOpen, Check, Plus, Bookmark, Zap } from 'lucide-react';
import type { Book as BookType } from '../types';
import { useLibraryStore } from '../libraryStore';
import { getAuthorsByIds } from '../data/authors';
import { calculateBookCredits, getCreditTier } from '../creditUtils';
import { cn } from '../../../lib/utils';

interface BookCardProps {
    book: BookType;
    variant?: 'default' | 'compact' | 'featured';
    onClick?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, variant = 'default', onClick }) => {
    const { isInReadingList, addToReadingList, removeFromReadingList, getBookProgress, userLibrary } = useLibraryStore();

    const authors = getAuthorsByIds(book.authorIds);
    const authorNames = authors.map(a => a.name).join(', ') || 'Various Authors';
    const inReadingList = isInReadingList(book.id);
    const progress = getBookProgress(book.id);
    const isCompleted = userLibrary.completedBookIds.includes(book.id);
    const bookCredits = calculateBookCredits(book);
    const creditTier = getCreditTier(bookCredits);

    const handleToggleReadingList = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inReadingList) {
            removeFromReadingList(book.id);
        } else {
            addToReadingList(book.id);
        }
    };

    const getDifficultyBadge = () => {
        const colors = {
            beginner: 'bg-green-100 text-green-700',
            intermediate: 'bg-amber-100 text-amber-700',
            advanced: 'bg-red-100 text-red-700'
        };
        return (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colors[book.difficulty])}>
                {book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1)}
            </span>
        );
    };

    if (variant === 'compact') {
        return (
            <div
                onClick={onClick}
                onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
                role="button"
                tabIndex={0}
                aria-label={`${book.title} by ${authorNames}${isCompleted ? ', completed' : ''}`}
                className={cn(
                    'flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100',
                    'hover:border-cafe-200 hover:shadow-md transition-all cursor-pointer group',
                    'focus:outline-none focus:ring-2 focus:ring-cafe-300 focus:ring-offset-2'
                )}
            >
                <div className="w-12 h-16 bg-gradient-to-br from-cafe-100 to-cafe-200 rounded-lg flex items-center justify-center shrink-0">
                    <Book className="w-6 h-6 text-cafe-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-cafe-600 transition-colors">
                        {book.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{authorNames}</p>
                </div>
                {isCompleted && (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                    </div>
                )}
                {progress && progress.progress > 0 && progress.progress < 100 && (
                    <div className="text-xs font-medium text-cafe-600">{Math.round(progress.progress)}%</div>
                )}
            </div>
        );
    }

    if (variant === 'featured') {
        return (
            <div
                onClick={onClick}
                onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
                role="article"
                tabIndex={0}
                aria-label={`Featured book: ${book.title} by ${authorNames}`}
                className={cn(
                    'relative overflow-hidden rounded-2xl bg-gradient-to-br from-cafe-50 to-white',
                    'border border-cafe-200 hover:border-cafe-300 hover:shadow-xl',
                    'transition-all cursor-pointer group p-6',
                    'focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:ring-offset-2'
                )}
            >
                <div className="flex gap-6">
                    {/* Book Cover */}
                    <div className="w-32 h-44 bg-gradient-to-br from-cafe-200 to-cafe-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-cafe-600 transition-colors">
                                    {book.title}
                                </h3>
                                {book.subtitle && (
                                    <p className="text-sm text-gray-500 mt-1">{book.subtitle}</p>
                                )}
                                <p className="text-sm text-cafe-600 font-medium mt-2">{authorNames}</p>
                            </div>

                            <button
                                onClick={handleToggleReadingList}
                                className={cn(
                                    'p-2 rounded-full transition-all shrink-0',
                                    inReadingList
                                        ? 'bg-cafe-100 text-cafe-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-cafe-50 hover:text-cafe-500'
                                )}
                            >
                                {inReadingList ? <Bookmark className="w-5 h-5 fill-current" /> : <Plus className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium text-gray-900">{book.rating}</span>
                                <span className="text-xs text-gray-400">({book.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{book.readingTimeHours}h read</span>
                            </div>
                            {getDifficultyBadge()}
                            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', creditTier.color)}>
                                <Zap className="w-3 h-3" />
                                +{bookCredits} credits
                            </div>
                        </div>

                        {/* Key Takeaways Preview */}
                        {book.keyTakeaways.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Key Takeaways</p>
                                <ul className="space-y-1">
                                    {book.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="text-cafe-500 mt-1">•</span>
                                            <span className="line-clamp-1">{takeaway}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress indicator */}
                {progress && progress.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                        <div
                            className="h-full bg-cafe-500 transition-all"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                )}

                {isCompleted && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Completed
                    </div>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            role="article"
            tabIndex={0}
            aria-label={`${book.title} by ${authorNames}, ${book.rating} stars, ${book.readingTimeHours} hour read`}
            className={cn(
                'group relative bg-white rounded-xl border border-gray-100 overflow-hidden',
                'hover:border-cafe-200 hover:shadow-lg transition-all cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-cafe-300 focus:ring-offset-2'
            )}
        >
            {/* Book Cover */}
            <div className="relative h-40 bg-gradient-to-br from-cafe-100 via-cafe-200 to-cafe-300 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-cafe-600/50 group-hover:scale-110 transition-transform" />

                {/* Reading List Button */}
                <button
                    onClick={handleToggleReadingList}
                    className={cn(
                        'absolute top-3 right-3 p-2 rounded-full transition-all',
                        inReadingList
                            ? 'bg-white text-cafe-600 shadow-md'
                            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-cafe-500'
                    )}
                >
                    {inReadingList ? <Bookmark className="w-4 h-4 fill-current" /> : <Plus className="w-4 h-4" />}
                </button>

                {/* Completed Badge */}
                {isCompleted && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white p-1.5 rounded-full">
                        <Check className="w-3 h-3" />
                    </div>
                )}

                {/* Difficulty Badge */}
                <div className="absolute bottom-3 left-3">
                    {getDifficultyBadge()}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-cafe-600 transition-colors">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{authorNames}</p>

                {/* Stats Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-700">{book.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{book.readingTimeHours}h</span>
                    </div>
                    <div className={cn('flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold', creditTier.color)}>
                        <Zap className="w-3 h-3" />
                        +{bookCredits}
                    </div>
                </div>

                {/* Progress Bar */}
                {progress && progress.progress > 0 && progress.progress < 100 && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Reading</span>
                            <span className="text-cafe-600 font-medium">{Math.round(progress.progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cafe-500 rounded-full transition-all"
                                style={{ width: `${progress.progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
