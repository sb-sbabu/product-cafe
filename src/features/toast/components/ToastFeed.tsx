/**
 * ToastFeed - Recognition feed with filters
 * Displays recognitions with infinite scroll
 */

import React, { useMemo } from 'react';
import { TrendingUp, Users, Building2, Star, Plus } from 'lucide-react';
import { useToastStore } from '../toastStore';
import { RecognitionCard } from './RecognitionCard';

type FeedFilter = 'all' | 'following' | 'my-team' | 'org-wide' | 'monthly-winners';

interface ToastFeedProps {
    onCreateToast?: () => void;
}

export const ToastFeed: React.FC<ToastFeedProps> = ({ onCreateToast }) => {
    // Use selectors instead of method calls for stability
    const recognitions = useToastStore(state => state.recognitions);
    const feedFilter = useToastStore(state => state.feedFilter);
    const setFeedFilter = useToastStore(state => state.setFeedFilter);
    const users = useToastStore(state => state.users);
    const currentUserId = useToastStore(state => state.currentUserId);

    const currentUser = useMemo(() => users.get(currentUserId), [users, currentUserId]);

    // Filter recognitions
    const filteredRecognitions = useMemo(() => {
        let filtered = [...recognitions];

        switch (feedFilter) {
            case 'my-team':
                // Filter to user's team (simplified - would check team membership)
                filtered = filtered.filter(r =>
                    r.recipients.some(rec => rec.team === currentUser?.team) ||
                    r.giverId === currentUser?.id
                );
                break;
            case 'monthly-winners':
                filtered = filtered.filter(r => r.nominatedForMonthly);
                break;
            case 'following':
                // Would filter to following list - for demo show all
                break;
            default:
                // 'all' and 'org-wide' show everything
                break;
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filtered;
    }, [recognitions, feedFilter, currentUser]);

    const filterOptions: { id: FeedFilter; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'following', label: 'Following', icon: <Users className="w-4 h-4" /> },
        { id: 'my-team', label: 'My Team', icon: <Users className="w-4 h-4" /> },
        { id: 'org-wide', label: 'Org-Wide', icon: <Building2 className="w-4 h-4" /> },
        { id: 'monthly-winners', label: '⭐ Monthly', icon: <Star className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-4">
            {/* Header with filters */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Trending Toasts
                </h2>

                {/* Create button */}
                {onCreateToast && (
                    <button
                        onClick={onCreateToast}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Raise Toast</span>
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filterOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => setFeedFilter(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${feedFilter === option.id
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                            }`}
                    >
                        {option.icon}
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>

            {/* Recognition cards */}
            <div className="space-y-4">
                {filteredRecognitions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-4xl mb-3">🥂</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No toasts yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Be the first to raise a toast!</p>
                        {onCreateToast && (
                            <button
                                onClick={onCreateToast}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600"
                            >
                                Raise a Toast
                            </button>
                        )}
                    </div>
                ) : (
                    filteredRecognitions.map(recognition => (
                        <RecognitionCard key={recognition.id} recognition={recognition} />
                    ))
                )}
            </div>

            {/* Load more (would implement infinite scroll) */}
            {filteredRecognitions.length >= 10 && (
                <div className="text-center">
                    <button className="px-6 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
};

export default ToastFeed;
