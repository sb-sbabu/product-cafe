import React from 'react';
import {
    Inbox,
    Users,
    Search,
    FileQuestion,
    BookX,
    RefreshCw
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

type EmptyStateType =
    | 'no-results'
    | 'no-data'
    | 'error'
    | 'no-people'
    | 'no-resources'
    | 'no-faqs';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const defaultConfigs: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
    'no-results': {
        icon: <Search className="w-12 h-12" />,
        title: 'No results found',
        description: 'Try adjusting your search or filters to find what you need.',
    },
    'no-data': {
        icon: <Inbox className="w-12 h-12" />,
        title: 'No data available',
        description: 'There is nothing to show here yet.',
    },
    'error': {
        icon: <FileQuestion className="w-12 h-12" />,
        title: 'Something went wrong',
        description: 'We could not load this content. Please try again.',
    },
    'no-people': {
        icon: <Users className="w-12 h-12" />,
        title: 'No people found',
        description: 'Try searching with different keywords or expertise areas.',
    },
    'no-resources': {
        icon: <BookX className="w-12 h-12" />,
        title: 'No resources found',
        description: 'Try adjusting your filters or browse a different category.',
    },
    'no-faqs': {
        icon: <FileQuestion className="w-12 h-12" />,
        title: 'No FAQs found',
        description: 'Try a different search or ask the Café Assistant.',
    },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'no-data',
    title,
    description,
    icon,
    action,
    className,
}) => {
    const config = defaultConfigs[type];

    const displayIcon = icon || config.icon;
    const displayTitle = title || config.title;
    const displayDescription = description || config.description;

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-6 text-center',
                className
            )}
            role="status"
            aria-label={displayTitle}
        >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                {displayIcon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {displayTitle}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
                {displayDescription}
            </p>
            {action && (
                <Button
                    variant="secondary"
                    onClick={action.onClick}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
};
