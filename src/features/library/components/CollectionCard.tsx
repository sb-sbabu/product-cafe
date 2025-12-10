import React from 'react';
import { ChevronRight, BookOpen } from 'lucide-react';
import type { Collection } from '../types';
import { cn } from '../../../lib/utils';

interface CollectionCardProps {
    collection: Collection;
    bookCount: number;
    onClick?: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, bookCount, onClick }) => {
    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            role="article"
            tabIndex={0}
            aria-label={`${collection.title} collection: ${collection.description}, ${bookCount} books`}
            className={cn(
                'group relative p-5 rounded-xl bg-white border border-gray-100',
                'hover:border-cafe-200 hover:shadow-lg transition-all cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-cafe-300 focus:ring-offset-2'
            )}
        >
            {/* Background Decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-cafe-100/50 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0',
                    'bg-gradient-to-br shadow-sm',
                    collection.color
                )}>
                    {collection.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-cafe-600 transition-colors">
                            {collection.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-cafe-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {collection.description}
                    </p>

                    {/* Book Count */}
                    <div className="flex items-center gap-2 mt-4">
                        <BookOpen className="w-4 h-4 text-cafe-500" />
                        <span className="text-sm font-medium text-cafe-600">{bookCount} {bookCount === 1 ? 'book' : 'books'}</span>
                    </div>
                </div>
            </div>

            {/* Featured Badge */}
            {collection.featured && (
                <div className="absolute top-3 right-3 bg-cafe-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Featured
                </div>
            )}
        </div>
    );
};
