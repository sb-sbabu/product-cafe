import React from 'react';
import {
    Zap,
    BookOpen,
    Users,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Coffee,
    Clock,
    ExternalLink,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ResourceCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { ResourceCard } from '../../components/cards/ResourceCard';
import { cn, formatRelativeTime } from '../../lib/utils';
import { getFeaturedResources, mockResources } from '../../data/mockData';
import { usePageLoading } from '../../hooks';

interface HomePageProps {
    onNavigate?: (section: string) => void;
    userName?: string;
}

const entryPoints = [
    {
        id: 'grab-and-go',
        title: 'Grab & Go',
        description: 'Quick links, tools, FAQs',
        icon: Zap,
        color: 'bg-amber-500',
        hoverColor: 'hover:bg-amber-50',
        borderColor: 'hover:border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
    },
    {
        id: 'library',
        title: 'Library',
        description: 'Learn product craft, domain, playbooks',
        icon: BookOpen,
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-50',
        borderColor: 'hover:border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
    {
        id: 'community',
        title: 'Community',
        description: 'Find people, ask questions',
        icon: Users,
        color: 'bg-cyan-500',
        hoverColor: 'hover:bg-cyan-50',
        borderColor: 'hover:border-cyan-200',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
    },
];

// Get recently updated resources from mockData
const getRecentlyUpdated = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return mockResources
        .filter(r => !r.isArchived && new Date(r.updatedAt) >= thirtyDaysAgo)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4);
};

export const HomePage: React.FC<HomePageProps> = ({
    onNavigate,
    userName = 'there',
}) => {
    const isLoading = usePageLoading(400);
    const featuredResources = getFeaturedResources().slice(0, 4);
    const recentResources = getRecentlyUpdated();
    const firstName = userName.split(' ')[0];

    // Loading state skeleton
    if (isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                {/* Welcome Skeleton */}
                <section>
                    <div className="space-y-2 mb-6">
                        <Skeleton width="60%" height={32} />
                        <Skeleton width="40%" height={20} />
                    </div>
                </section>

                {/* Entry Points Skeleton */}
                <section>
                    <Skeleton width={120} height={24} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-6 rounded-xl border border-gray-100 bg-white">
                                <div className="flex items-start gap-4">
                                    <Skeleton variant="rect" width={48} height={48} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton width="60%" height={20} />
                                        <Skeleton width="80%" height={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured Resources Skeleton */}
                <section>
                    <Skeleton width={180} height={24} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Welcome back, {firstName}!
                            <span className="animate-float inline-block">☀️</span>
                        </h1>
                        <p className="text-gray-600 mt-1">
                            What would you like to explore today?
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">/</kbd> to search</span>
                    </div>
                </div>
            </section>

            {/* Entry Points Grid */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-cafe-500" />
                    Your Café
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {entryPoints.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Card
                                key={item.id}
                                isHoverable
                                isClickable
                                onClick={() => onNavigate?.(item.id)}
                                className={cn(
                                    'p-6 group transition-all duration-300 hover-lift',
                                    item.hoverColor,
                                    item.borderColor,
                                    'animate-slide-up',
                                    `stagger-${idx + 1}`
                                )}
                                style={{ animationFillMode: 'both' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn('p-3 rounded-xl transition-transform group-hover:scale-110', item.iconBg)}>
                                        <Icon className={cn('w-6 h-6', item.iconColor)} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {item.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* What's New - Dynamic from mockData */}
            {recentResources.length > 0 && (
                <section className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 animate-float">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            What's New
                            <Badge size="sm" variant="success">{recentResources.length} updates</Badge>
                        </h2>
                        <button
                            onClick={() => onNavigate?.('library')}
                            className="text-sm text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1 press-effect"
                        >
                            View all <ArrowRight className="w-4 h-4" />
                        </button>
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
                                            resource.category === 'grab-and-go'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-purple-100 text-purple-800'
                                        )}>
                                            {resource.category === 'grab-and-go' ? '☕ Grab & Go' : '📚 Library'}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatRelativeTime(resource.updatedAt)}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-cafe-600 transition-colors line-clamp-1">
                                        {resource.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                                        {resource.description}
                                    </p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-cafe-500 transition-colors flex-shrink-0 mt-1" />
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Resources */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cafe-500" />
                        Featured Resources
                    </h2>
                    <button
                        onClick={() => onNavigate?.('library')}
                        className="text-sm text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1 press-effect"
                    >
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredResources.map((resource, idx) => (
                        <div
                            key={resource.id}
                            className={cn('animate-scale-in', `stagger-${idx + 1}`)}
                            style={{ animationFillMode: 'both' }}
                        >
                            <ResourceCard
                                resource={resource}
                                variant="default"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Stats (decorative) */}
            <section className="bg-gradient-to-br from-cafe-50 to-amber-50 rounded-2xl p-6 hover-lift">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-cafe-600">150+</p>
                        <p className="text-sm text-gray-600 mt-1">Resources</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-cafe-600">50+</p>
                        <p className="text-sm text-gray-600 mt-1">FAQs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-cafe-600">30+</p>
                        <p className="text-sm text-gray-600 mt-1">Experts</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-cafe-600">4</p>
                        <p className="text-sm text-gray-600 mt-1">Learning Paths</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
