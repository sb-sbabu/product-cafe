import React, { useState } from 'react';
import { Users, Filter } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Badge';
import { PersonCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { PersonCard } from '../../components/cards/PersonCard';
import { searchPeople, mockPeople } from '../../data/mockData';
import { usePageLoading } from '../../hooks';

interface CommunityPageProps {
    onNavigate?: (section: string) => void;
}

const expertiseFilters = [
    'All',
    'Healthcare',
    'RCM',
    'Product Process',
    'Agile',
    'Tools',
];

export const CommunityPage: React.FC<CommunityPageProps> = () => {
    const isLoading = usePageLoading(350);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Filter people
    let filteredPeople = mockPeople.filter(p => p.isActive);

    if (searchQuery) {
        filteredPeople = searchPeople(searchQuery);
    }

    if (activeFilter !== 'All') {
        filteredPeople = filteredPeople.filter(p =>
            p.expertiseAreas.some(area =>
                area.toLowerCase().includes(activeFilter.toLowerCase())
            )
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
                        <Skeleton width={140} height={32} />
                    </div>
                    <Skeleton width="60%" height={20} />
                </section>

                {/* Search Skeleton */}
                <section>
                    <Skeleton width="100%" height={48} className="rounded-xl" />
                </section>

                {/* Filters Skeleton */}
                <section>
                    <div className="flex items-center gap-4">
                        <Skeleton width={120} height={20} />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} variant="rect" width={70} height={32} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* People Grid Skeleton */}
                <section>
                    <Skeleton width={180} height={24} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <PersonCardSkeleton />
                        <PersonCardSkeleton />
                        <PersonCardSkeleton />
                        <PersonCardSkeleton />
                        <PersonCardSkeleton />
                        <PersonCardSkeleton />
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
                    <span className="text-3xl">💬</span>
                    <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                </div>
                <p className="text-gray-600">
                    Find experts, ask questions, and connect with your product peers.
                </p>
            </section>

            {/* Search */}
            <section>
                <SearchBar
                    placeholder="Search by name, expertise, or team..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    size="md"
                />
            </section>

            {/* Filters */}
            <section>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Filter by expertise:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {expertiseFilters.map((filter) => (
                            <Pill
                                key={filter}
                                variant={activeFilter === filter ? 'primary' : 'default'}
                                onClick={() => setActiveFilter(filter)}
                                isActive={activeFilter === filter}
                            >
                                {filter}
                            </Pill>
                        ))}
                    </div>
                </div>
            </section>

            {/* People Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-500" />
                        People Directory
                        <span className="text-gray-400 font-normal">
                            ({filteredPeople.length})
                        </span>
                    </h2>
                </div>

                {filteredPeople.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPeople.map((person) => (
                            <PersonCard
                                key={person.id}
                                person={person}
                                variant="default"
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">No people found</h3>
                        <p className="text-gray-500 text-sm">
                            Try adjusting your search or filters.
                        </p>
                    </Card>
                )}
            </section>
        </div>
    );
};
