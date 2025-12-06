import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Badge, Pill } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResourceCardSkeleton, PersonCardSkeleton, FAQCardSkeleton } from '../../components/ui/Skeleton';
import { ResourceCard } from '../../components/cards/ResourceCard';
import { FAQCard } from '../../components/cards/FAQCard';
import { PersonCard } from '../../components/cards/PersonCard';
import { searchResources, searchFAQs, searchPeople } from '../../data/mockData';
import { useSearchStore } from '../../stores';

interface SearchResultsPageProps {
    initialQuery?: string;
    onNavigate?: (section: string) => void;
}

type ResultTab = 'all' | 'resources' | 'faqs' | 'people';

const tabs: { id: ResultTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'resources', label: 'Resources' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'people', label: 'People' },
];

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
    initialQuery = '',
}) => {
    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<ResultTab>('all');
    const [isLoading, setIsLoading] = useState(false);
    const { addRecentSearch, recentSearches } = useSearchStore();

    // Sync initialQuery to local state on prop change
    // Using a ref to track if this is the first mount
    const isInitialMount = React.useRef(true);

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (initialQuery && initialQuery !== query) {
            // Wrap in startTransition to avoid cascading render warning
            const handler = () => {
                setQuery(initialQuery);
                setIsLoading(true);
                addRecentSearch(initialQuery);
                setTimeout(() => setIsLoading(false), 300);
            };
            handler();
        }
    }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    // Perform search
    const results = useMemo(() => {
        if (!query.trim()) return null;

        const resources = searchResources(query);
        const faqs = searchFAQs(query);
        const people = searchPeople(query);

        return {
            resources,
            faqs,
            people,
            totalCount: resources.length + faqs.length + people.length,
        };
    }, [query]);

    const handleRecentSearch = (searchQuery: string) => {
        setIsLoading(true);
        setQuery(searchQuery);
        addRecentSearch(searchQuery);
        setTimeout(() => setIsLoading(false), 300);
    };

    const getTabCount = (tab: ResultTab) => {
        if (!results) return 0;
        switch (tab) {
            case 'resources': return results.resources.length;
            case 'faqs': return results.faqs.length;
            case 'people': return results.people.length;
            case 'all': return results.totalCount;
        }
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                        <ResourceCardSkeleton />
                    </div>
                    <div className="space-y-3">
                        <FAQCardSkeleton />
                        <FAQCardSkeleton />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PersonCardSkeleton />
                        <PersonCardSkeleton />
                    </div>
                </div>
            );
        }

        if (!query.trim()) {
            return (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Search Product Café
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Use the search bar above to find resources, FAQs, and experts.
                    </p>

                    {recentSearches.length > 0 && (
                        <div className="max-w-md mx-auto">
                            <p className="text-sm text-gray-500 mb-3">Recent searches:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {recentSearches.slice(0, 5).map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentSearch(search)}
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (!results || results.totalCount === 0) {
            return (
                <EmptyState
                    type="no-results"
                    title="No results found"
                    description={`We couldn't find anything matching "${query}". Try different keywords or browse categories.`}
                    action={{
                        label: 'Clear search',
                        onClick: () => setQuery(''),
                    }}
                />
            );
        }

        return (
            <div className="space-y-8">
                {/* Resources */}
                {(activeTab === 'all' || activeTab === 'resources') && results.resources.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            📚 Resources
                            <Badge size="sm">{results.resources.length}</Badge>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.resources.slice(0, activeTab === 'all' ? 6 : undefined).map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                        {activeTab === 'all' && results.resources.length > 6 && (
                            <button
                                onClick={() => setActiveTab('resources')}
                                className="mt-4 text-cafe-600 hover:text-cafe-700 font-medium text-sm"
                            >
                                View all {results.resources.length} resources →
                            </button>
                        )}
                    </section>
                )}

                {/* FAQs */}
                {(activeTab === 'all' || activeTab === 'faqs') && results.faqs.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            ❓ FAQs
                            <Badge size="sm">{results.faqs.length}</Badge>
                        </h2>
                        <div className="space-y-3">
                            {results.faqs.slice(0, activeTab === 'all' ? 3 : undefined).map((faq) => (
                                <FAQCard key={faq.id} faq={faq} />
                            ))}
                        </div>
                        {activeTab === 'all' && results.faqs.length > 3 && (
                            <button
                                onClick={() => setActiveTab('faqs')}
                                className="mt-4 text-cafe-600 hover:text-cafe-700 font-medium text-sm"
                            >
                                View all {results.faqs.length} FAQs →
                            </button>
                        )}
                    </section>
                )}

                {/* People */}
                {(activeTab === 'all' || activeTab === 'people') && results.people.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            👥 People
                            <Badge size="sm">{results.people.length}</Badge>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.people.slice(0, activeTab === 'all' ? 4 : undefined).map((person) => (
                                <PersonCard key={person.id} person={person} />
                            ))}
                        </div>
                        {activeTab === 'all' && results.people.length > 4 && (
                            <button
                                onClick={() => setActiveTab('people')}
                                className="mt-4 text-cafe-600 hover:text-cafe-700 font-medium text-sm"
                            >
                                View all {results.people.length} people →
                            </button>
                        )}
                    </section>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <section>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🔍</span>
                    <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
                </div>
                {query && (
                    <p className="text-gray-600">
                        Showing results for "<strong>{query}</strong>"
                    </p>
                )}
            </section>

            {/* Results Header with Tabs */}
            {results && results.totalCount > 0 && (
                <section className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                            Found <strong>{results.totalCount}</strong> results
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {tabs.map((tab) => (
                            <Pill
                                key={tab.id}
                                variant={activeTab === tab.id ? 'primary' : 'default'}
                                onClick={() => setActiveTab(tab.id)}
                                isActive={activeTab === tab.id}
                            >
                                {tab.label} ({getTabCount(tab.id)})
                            </Pill>
                        ))}
                    </div>
                </section>
            )}

            {/* Results */}
            <section>
                {renderResults()}
            </section>
        </div>
    );
};
