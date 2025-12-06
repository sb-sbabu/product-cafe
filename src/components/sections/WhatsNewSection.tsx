import React from 'react';
import { Sparkles, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import type { Resource } from '../../types';

interface WhatsNewSectionProps {
    resources: Resource[];
    onViewAll?: () => void;
    className?: string;
}

/**
 * What's New Section - Shows recently updated resources
 * Displays resources updated in the last 30 days with animated cards
 */
export const WhatsNewSection: React.FC<WhatsNewSectionProps> = ({
    resources,
    onViewAll,
    className,
}) => {
    // Filter resources updated in last 30 days and sort by update date
    const recentResources = resources
        .filter(r => !r.isArchived)
        .filter(r => {
            const updatedAt = new Date(r.updatedAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return updatedAt >= thirtyDaysAgo;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    if (recentResources.length === 0) {
        return null;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'grab-and-go': return 'bg-amber-100 text-amber-800';
            case 'library': return 'bg-purple-100 text-purple-800';
            case 'community': return 'bg-cyan-100 text-cyan-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <section className={cn('animate-fade-in', className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 animate-float">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">What's New</h2>
                    <Badge size="sm" variant="success">
                        {recentResources.length} updates
                    </Badge>
                </div>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-cafe-600 hover:text-cafe-700 text-sm font-medium flex items-center gap-1 press-effect"
                    >
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {recentResources.map((resource, idx) => (
                    <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'group flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100',
                            'hover:border-cafe-200 hover:shadow-md transition-all duration-200',
                            'hover-lift animate-slide-up',
                            `stagger-${idx + 1}`
                        )}
                        style={{ animationFillMode: 'both' }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    'text-xs font-medium px-2 py-0.5 rounded-full',
                                    getCategoryColor(resource.category)
                                )}>
                                    {resource.category === 'grab-and-go' ? '☕ Grab & Go' : '📚 Library'}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(resource.updatedAt)}
                                </span>
                            </div>
                            <h3 className="font-medium text-gray-900 group-hover:text-cafe-600 transition-colors line-clamp-1">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                                {resource.description}
                            </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-cafe-500 transition-colors flex-shrink-0 mt-1" />
                    </a>
                ))}
            </div>
        </section>
    );
};
