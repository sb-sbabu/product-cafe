import React from 'react';
import { ExternalLink, Clock, Eye, ThumbsUp } from 'lucide-react';
import type { InternalResource } from '../data/internalResources';
import { SOURCE_BADGES, CONTENT_TYPE_ICONS } from '../data/internalResources';
import { cn } from '../../../lib/utils';

interface ResourceCardProps {
    resource: InternalResource;
    variant?: 'default' | 'compact';
    onClick?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, variant = 'default', onClick }) => {
    const sourceBadge = SOURCE_BADGES[resource.sourceSystem] || SOURCE_BADGES.internal;
    const typeIcon = CONTENT_TYPE_ICONS[resource.contentType] || '📄';

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        }
    };

    if (variant === 'compact') {
        return (
            <div
                onClick={handleClick}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                role="button"
                tabIndex={0}
                aria-label={`${resource.title} on ${sourceBadge.label}${resource.estimatedTime ? `, ${resource.estimatedTime} minute read` : ''}`}
                className={cn(
                    'flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100',
                    'hover:border-cafe-200 hover:shadow-md transition-all cursor-pointer group',
                    'focus:outline-none focus:ring-2 focus:ring-cafe-300 focus:ring-offset-2'
                )}
            >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                    {typeIcon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-cafe-600 transition-colors">
                        {resource.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', sourceBadge.color)}>
                            {sourceBadge.label}
                        </span>
                        {resource.estimatedTime && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {resource.estimatedTime}m
                            </span>
                        )}
                    </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-cafe-500 transition-colors shrink-0" />
            </div>
        );
    }

    // Default variant
    return (
        <div
            onClick={handleClick}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            role="article"
            tabIndex={0}
            aria-label={`${resource.title}: ${resource.description.slice(0, 100)}...`}
            className={cn(
                'group relative bg-white rounded-xl border border-gray-100 overflow-hidden',
                'hover:border-cafe-200 hover:shadow-lg transition-all cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-cafe-300 focus:ring-offset-2'
            )}
        >
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {typeIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-cafe-600 transition-colors">
                                {resource.title}
                            </h3>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-cafe-500 transition-colors shrink-0 mt-1" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', sourceBadge.color)}>
                                {sourceBadge.label}
                            </span>
                            <span className="text-xs text-gray-400 capitalize">
                                {resource.contentType.replace('-', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {resource.description}
                </p>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    {resource.estimatedTime && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {resource.estimatedTime} min
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {resource.viewCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {resource.helpfulCount.toLocaleString()}
                    </span>
                </div>

                {resource.difficulty && (
                    <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        resource.difficulty === 'beginner' && 'bg-green-100 text-green-700',
                        resource.difficulty === 'intermediate' && 'bg-amber-100 text-amber-700',
                        resource.difficulty === 'advanced' && 'bg-red-100 text-red-700'
                    )}>
                        {resource.difficulty}
                    </span>
                )}
            </div>

            {/* Featured badge */}
            {resource.isFeatured && (
                <div className="absolute top-3 right-3 bg-cafe-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Featured
                </div>
            )}
        </div>
    );
};
