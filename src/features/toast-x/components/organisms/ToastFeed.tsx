/**
 * Toast X - Toast Feed Component
 * Displays the feed of recognitions with filtering
 */

import React, { memo } from 'react';
import { useFeedRecognitions, useFeedFilter } from '../../hooks';
import { RecognitionCard, RecognitionCardSkeleton } from '../organisms/RecognitionCard';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type FeedFilter = 'all' | 'following' | 'my-team' | 'org-wide' | 'monthly-winners';

interface FilterOption {
    value: FeedFilter;
    label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
    { value: 'all', label: 'Feed' },
    { value: 'following', label: 'Following' },
    { value: 'my-team', label: 'My Team' },
    { value: 'org-wide', label: 'Org-Wide' },
    { value: 'monthly-winners', label: 'Monthly Winners' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface FilterTabsProps {
    activeFilter: FeedFilter;
    onFilterChange: (filter: FeedFilter) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = memo(({ activeFilter, onFilterChange }) => (
    <div className="toast-feed__filters" role="tablist" aria-label="Feed filters">
        {FILTER_OPTIONS.map((option) => (
            <button
                key={option.value}
                className={`toast-feed__filter-btn ${activeFilter === option.value ? 'toast-feed__filter-btn--active' : ''}`}
                onClick={() => onFilterChange(option.value)}
                role="tab"
                aria-selected={activeFilter === option.value}
                aria-controls="toast-feed-content"
            >
                {option.label}
            </button>
        ))}
    </div>
));

FilterTabs.displayName = 'FilterTabs';

interface EmptyFeedProps {
    filter: FeedFilter;
}

const EmptyFeed: React.FC<EmptyFeedProps> = ({ filter }) => {
    const messages: Record<FeedFilter, { icon: string; message: string }> = {
        all: { icon: '🌟', message: 'No recognitions yet. Be the first to raise a toast!' },
        following: { icon: '👀', message: 'No recognitions from people you follow.' },
        'my-team': { icon: '👥', message: 'No team recognitions yet. Celebrate your teammates!' },
        'org-wide': { icon: '🏢', message: 'No organization-wide recognitions yet.' },
        'monthly-winners': { icon: '🏆', message: 'No monthly winners yet. Nominations open!' },
    };

    const { icon, message } = messages[filter];

    return (
        <div className="toast-feed__empty" role="status">
            <div className="toast-feed__empty-icon">{icon}</div>
            <p>{message}</p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ToastFeedProps {
    className?: string;
    showFilters?: boolean;
    maxItems?: number;
}

/**
 * Toast Feed component
 * Displays list of recognitions with optional filtering
 */
export const ToastFeed: React.FC<ToastFeedProps> = memo(({
    className = '',
    showFilters = true,
    maxItems,
}) => {
    const recognitions = useFeedRecognitions();
    const [feedFilter, setFeedFilter] = useFeedFilter();

    // Apply max items limit if specified
    const displayedRecognitions = maxItems
        ? recognitions.slice(0, maxItems)
        : recognitions;

    return (
        <section
            className={`toast-feed ${className}`}
            aria-label="Recognition feed"
        >
            {showFilters && (
                <header className="toast-feed__header">
                    <h2 className="toast-feed__title">Recognitions</h2>
                    <FilterTabs
                        activeFilter={feedFilter}
                        onFilterChange={setFeedFilter}
                    />
                </header>
            )}

            <div
                id="toast-feed-content"
                role="feed"
                aria-busy={false}
            >
                {displayedRecognitions.length === 0 ? (
                    <EmptyFeed filter={feedFilter} />
                ) : (
                    displayedRecognitions.map((recognition) => (
                        <RecognitionCard
                            key={recognition.id}
                            recognitionId={recognition.id}
                        />
                    ))
                )}
            </div>
        </section>
    );
});

ToastFeed.displayName = 'ToastFeed';

export default ToastFeed;
