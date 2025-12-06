import React, { useState } from 'react';
import {
    Lightbulb,
    Stethoscope,
    BookOpen,
    Folder,
    Filter,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge, Pill } from '../../components/ui/Badge';
import { ResourceCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { ResourceCard } from '../../components/cards/ResourceCard';
import { cn, slugToDisplay } from '../../lib/utils';
import { getResourcesByPillar, getResourcesByCategory } from '../../data/mockData';
import { usePageLoading } from '../../hooks';

interface LibraryPageProps {
    onNavigate?: (section: string) => void;
}

const pillars = [
    {
        id: 'product-craft',
        title: 'Product Craft',
        description: 'Discovery, roadmapping, stakeholder management, metrics',
        icon: Lightbulb,
        color: 'bg-purple-100',
        iconColor: 'text-purple-600',
        accent: 'purple',
    },
    {
        id: 'healthcare',
        title: 'Healthcare & Industry',
        description: 'Healthcare ecosystem, RCM, regulatory, market intel',
        icon: Stethoscope,
        color: 'bg-blue-100',
        iconColor: 'text-blue-600',
        accent: 'blue',
    },
    {
        id: 'internal-playbook',
        title: 'Internal Playbook',
        description: 'How we work, org structure, rituals, templates',
        icon: BookOpen,
        color: 'bg-green-100',
        iconColor: 'text-green-600',
        accent: 'green',
    },
];

const contentTypes = ['All', 'Guide', 'Template', 'Video', 'Learning Path'];

export const LibraryPage: React.FC<LibraryPageProps> = () => {
    const isLoading = usePageLoading(400);
    const [activePillar, setActivePillar] = useState<string | null>(null);
    const [activeType, setActiveType] = useState('All');

    const libraryResources = getResourcesByCategory('library');

    // Filter resources
    let filteredResources = libraryResources;
    if (activePillar) {
        filteredResources = filteredResources.filter(r => r.pillar === activePillar);
    }
    if (activeType !== 'All') {
        filteredResources = filteredResources.filter(
            r => r.contentType.toLowerCase() === activeType.toLowerCase()
        );
    }

    // Loading state skeleton
    if (isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                {/* Header Skeleton */}
                <section>
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton variant="circle" width={40} height={40} />
                        <Skeleton width={100} height={32} />
                    </div>
                    <Skeleton width="70%" height={20} />
                </section>

                {/* Pillar Cards Skeleton */}
                <section>
                    <Skeleton width={150} height={24} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-5 rounded-xl border border-gray-100 bg-white">
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

                {/* Filters Skeleton */}
                <section>
                    <div className="flex items-center gap-4">
                        <Skeleton width={100} height={20} />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} variant="rect" width={70} height={32} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Resource Grid Skeleton */}
                <section>
                    <Skeleton width={200} height={24} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
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
            {/* Header */}
            <section>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">📚</span>
                    <h1 className="text-2xl font-bold text-gray-900">Library</h1>
                </div>
                <p className="text-gray-600">
                    Deep learning resources for product craft, healthcare domain, and internal practices.
                </p>
            </section>

            {/* Pillar Cards */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Explore by Pillar</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pillars.map((pillar) => {
                        const Icon = pillar.icon;
                        const isActive = activePillar === pillar.id;
                        const pillarResources = getResourcesByPillar(pillar.id);

                        return (
                            <Card
                                key={pillar.id}
                                isHoverable
                                isClickable
                                onClick={() => setActivePillar(isActive ? null : pillar.id)}
                                className={cn(
                                    'p-5 transition-all duration-200',
                                    isActive && 'ring-2 ring-cafe-500 border-cafe-200'
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', pillar.color)}>
                                        <Icon className={cn('w-6 h-6', pillar.iconColor)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{pillar.title}</h3>
                                            <Badge size="sm">{pillarResources.length}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {pillar.description}
                                        </p>
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-cafe-600 font-medium">
                                        Viewing {pillar.title} resources
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Filters */}
            <section>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Filter by type:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {contentTypes.map((type) => (
                            <Pill
                                key={type}
                                variant={activeType === type ? 'primary' : 'default'}
                                onClick={() => setActiveType(type)}
                                isActive={activeType === type}
                            >
                                {type}
                            </Pill>
                        ))}
                    </div>
                    {activePillar && (
                        <button
                            onClick={() => setActivePillar(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Clear pillar filter
                        </button>
                    )}
                </div>
            </section>

            {/* Resource Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {activePillar
                            ? `${slugToDisplay(activePillar)} Resources`
                            : 'All Resources'}
                        <span className="text-gray-400 font-normal ml-2">
                            ({filteredResources.length})
                        </span>
                    </h2>
                </div>

                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map((resource) => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                variant="default"
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">No resources found</h3>
                        <p className="text-gray-500 text-sm">
                            Try adjusting your filters or browse all resources.
                        </p>
                    </Card>
                )}
            </section>
        </div>
    );
};
