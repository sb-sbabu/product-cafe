import React from 'react';
import {
    Wrench,
    HelpCircle,
    Link2,
    MapPin,
    ArrowRight,
    Star,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ResourceCardSkeleton, FAQCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { ResourceCard } from '../../components/cards/ResourceCard';
import { FAQCard } from '../../components/cards/FAQCard';
import { cn } from '../../lib/utils';
import { getResourcesByCategory, mockFAQs } from '../../data/mockData';
import { usePageLoading } from '../../hooks';

interface GrabAndGoPageProps {
    onNavigate?: (section: string) => void;
}

const subCategories = [
    {
        id: 'tools',
        title: 'Tools & Access',
        description: 'Request access, find tools, integration guides',
        icon: Wrench,
        color: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        id: 'faqs',
        title: 'FAQs',
        description: 'How do I...? Top questions answered',
        icon: HelpCircle,
        color: 'bg-green-100',
        iconColor: 'text-green-600',
    },
    {
        id: 'links',
        title: 'Quick Links',
        description: 'Most-used links across all systems',
        icon: Link2,
        color: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
    {
        id: 'spaces',
        title: 'Key Spaces',
        description: 'Teams channels, SharePoint sites',
        icon: MapPin,
        color: 'bg-orange-100',
        iconColor: 'text-orange-600',
    },
];

export const GrabAndGoPage: React.FC<GrabAndGoPageProps> = () => {
    const isLoading = usePageLoading(350);
    const resources = getResourcesByCategory('grab-and-go');
    const topFAQs = mockFAQs.filter(f => f.category === 'access' || f.category === 'tools').slice(0, 5);

    // Loading state skeleton
    if (isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                {/* Header Skeleton */}
                <section>
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton variant="circle" width={40} height={40} />
                        <Skeleton width={150} height={32} />
                    </div>
                    <Skeleton width="60%" height={20} />
                </section>

                {/* Sub-categories Skeleton */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="p-5 rounded-xl border border-gray-100 bg-white">
                                <Skeleton variant="rect" width={48} height={48} className="mb-4" />
                                <Skeleton width="70%" height={20} className="mb-2" />
                                <Skeleton width="90%" height={16} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Requests Skeleton */}
                <section>
                    <Skeleton width={200} height={24} className="mb-4" />
                    <div className="space-y-2">
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                    </div>
                </section>

                {/* FAQs Skeleton */}
                <section>
                    <Skeleton width={150} height={24} className="mb-4" />
                    <div className="space-y-3">
                        <FAQCardSkeleton />
                        <FAQCardSkeleton />
                        <FAQCardSkeleton />
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
                    <span className="text-3xl">☕</span>
                    <h1 className="text-2xl font-bold text-gray-900">Grab & Go</h1>
                </div>
                <p className="text-gray-600">
                    Quick access to tools, links, and answers. Get what you need and go!
                </p>
            </section>

            {/* Sub-categories Grid */}
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Card
                                key={cat.id}
                                isHoverable
                                isClickable
                                className="p-5 group"
                            >
                                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', cat.color)}>
                                    <Icon className={cn('w-6 h-6', cat.iconColor)} />
                                </div>
                                <h3 className="font-semibold text-gray-900">{cat.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                                <div className="mt-3 flex items-center text-sm text-cafe-600 font-medium group-hover:gap-2 transition-all">
                                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Top Requests */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Top Requests Right Now
                    </h2>
                </div>
                <div className="space-y-2">
                    {resources.slice(0, 5).map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            variant="list"
                        />
                    ))}
                </div>
            </section>

            {/* Popular FAQs */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-green-500" />
                        Popular FAQs
                    </h2>
                    <button className="text-sm text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1">
                        View all FAQs
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-3">
                    {topFAQs.map((faq) => (
                        <FAQCard key={faq.id} faq={faq} />
                    ))}
                </div>
            </section>
        </div>
    );
};
