import React from 'react';
import { BookOpen, Search, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface EmptyStateProps {
    type: 'no-books' | 'no-results' | 'no-resources' | 'no-paths' | 'empty-list';
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const emptyStateConfig = {
    'no-books': {
        icon: BookOpen,
        title: 'No books found',
        description: 'Start building your reading list by exploring the Discover tab.',
    },
    'no-results': {
        icon: Search,
        title: 'No results found',
        description: 'Try adjusting your search terms or filters.',
    },
    'no-resources': {
        icon: Filter,
        title: 'No resources in this category',
        description: 'Try selecting a different pillar or clear filters.',
    },
    'no-paths': {
        icon: BookOpen,
        title: 'No learning paths available',
        description: 'Check back later for new learning paths.',
    },
    'empty-list': {
        icon: BookOpen,
        title: 'Your reading list is empty',
        description: 'Add books from the Discover tab to start tracking your reading!',
    }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    title,
    description,
    actionLabel,
    onAction
}) => {
    const config = emptyStateConfig[type];
    const Icon = config.icon;

    return (
        <div
            className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in"
            role="status"
            aria-live="polite"
        >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
                {title || config.title}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
                {description || config.description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                        'bg-cafe-100 text-cafe-700 hover:bg-cafe-200'
                    )}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
