import React from 'react';
import { Heart, Star, Trash2, Clock, BookOpen, Users, HelpCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResourceCard } from '../../components/cards/ResourceCard';
import { FAQCard } from '../../components/cards/FAQCard';
import { PersonCard } from '../../components/cards/PersonCard';
import { cn } from '../../lib/utils';
import { useFavoritesStore } from '../../stores';
import { mockResources, mockFAQs, mockPeople } from '../../data/mockData';

interface MyCafePageProps {
    onNavigate?: (section: string) => void;
}

type TabType = 'favorites' | 'recent' | 'suggested';

export const MyCafePage: React.FC<MyCafePageProps> = () => {
    const [activeTab, setActiveTab] = React.useState<TabType>('favorites');

    const {
        favoriteResourceIds,
        favoriteFAQIds,
        favoritePersonIds,
        clearAllFavorites,
    } = useFavoritesStore();

    // Get favorite items
    const favoriteResources = mockResources.filter(r => favoriteResourceIds.includes(r.id));
    const favoriteFAQs = mockFAQs.filter(f => favoriteFAQIds.includes(f.id));
    const favoritePeople = mockPeople.filter(p => favoritePersonIds.includes(p.id));

    const totalFavorites = favoriteResources.length + favoriteFAQs.length + favoritePeople.length;

    const tabs = [
        { id: 'favorites' as TabType, label: 'Favorites', icon: Heart, count: totalFavorites },
        { id: 'recent' as TabType, label: 'Recent', icon: Clock, count: 0 },
        { id: 'suggested' as TabType, label: 'For You', icon: Star, count: 5 },
    ];

    const renderFavorites = () => {
        if (totalFavorites === 0) {
            return (
                <EmptyState
                    type="no-data"
                    title="No favorites yet"
                    description="Save your favorite resources, FAQs, and contacts for quick access."
                    icon={<Heart className="w-12 h-12" />}
                />
            );
        }

        return (
            <div className="space-y-8">
                {/* Favorite Resources */}
                {favoriteResources.length > 0 && (
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            Resources
                            <Badge size="sm">{favoriteResources.length}</Badge>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {favoriteResources.map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Favorite FAQs */}
                {favoriteFAQs.length > 0 && (
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-amber-500" />
                            FAQs
                            <Badge size="sm">{favoriteFAQs.length}</Badge>
                        </h3>
                        <div className="space-y-3">
                            {favoriteFAQs.map((faq) => (
                                <FAQCard key={faq.id} faq={faq} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Favorite People */}
                {favoritePeople.length > 0 && (
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-500" />
                            People
                            <Badge size="sm">{favoritePeople.length}</Badge>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {favoritePeople.map((person) => (
                                <PersonCard key={person.id} person={person} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Clear All Button */}
                <div className="pt-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFavorites}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        className="text-gray-500 hover:text-red-500"
                    >
                        Clear all favorites
                    </Button>
                </div>
            </div>
        );
    };

    const renderRecent = () => (
        <EmptyState
            type="no-data"
            title="No recent activity"
            description="Your recently viewed resources will appear here."
            icon={<Clock className="w-12 h-12" />}
        />
    );

    const renderSuggested = () => {
        // Show featured resources as suggestions
        const suggested = mockResources.filter(r => r.isFeatured).slice(0, 6);

        return (
            <div className="space-y-6">
                <p className="text-gray-600">
                    Based on your role and recent activity, we recommend these resources:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggested.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'favorites':
                return renderFavorites();
            case 'recent':
                return renderRecent();
            case 'suggested':
                return renderSuggested();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <section>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">☕</span>
                    <h1 className="text-2xl font-bold text-gray-900">My Café</h1>
                </div>
                <p className="text-gray-600">
                    Your personalized hub for favorites, recent activity, and recommendations.
                </p>
            </section>

            {/* Tabs */}
            <section>
                <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 -mb-px border-b-2 transition-all text-sm font-medium',
                                    activeTab === tab.id
                                        ? 'border-cafe-500 text-cafe-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <Badge size="sm">
                                        {tab.count}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Content */}
            <section>
                {renderContent()}
            </section>
        </div>
    );
};
