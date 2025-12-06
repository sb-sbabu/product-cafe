/**
 * AdminBadgePanel - Admin interface for managing badges
 * 
 * Features:
 * - Manually award badges to users
 * - View all available badges
 * - See recently awarded badges
 */

import React, { useState } from 'react';
import { Award, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ALL_BADGES, type BadgeDefinition } from '../../types/gamification';
import { mockPeople } from '../../data/mockData';

interface AdminBadgePanelProps {
    onAwardBadge: (userId: string, badgeId: string) => void;
    className?: string;
}

export const AdminBadgePanel: React.FC<AdminBadgePanelProps> = ({
    onAwardBadge,
    className,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const categories = ['all', 'discussion', 'content', 'community'];

    const filteredBadges = ALL_BADGES.filter(
        (b: BadgeDefinition) => categoryFilter === 'all' || b.category === categoryFilter
    );

    const filteredUsers = mockPeople.filter(user =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
        if (selectedUserId) setSelectedUserId('');
    };

    const selectUser = (user: typeof mockPeople[0]) => {
        setSearchQuery(user.displayName);
        setSelectedUserId(user.id);
        setShowResults(false);
    };

    const handleAward = () => {
        if (!selectedUserId || !selectedBadge) return;
        onAwardBadge(selectedUserId, selectedBadge);
        setSelectedBadge('');
        setSearchQuery('');
        setSelectedUserId('');
    };

    return (
        <div className={cn(
            'bg-white rounded-xl border border-gray-200 shadow-sm p-5',
            className
        )}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Badge Management
            </h3>

            {/* User Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search user to award badge..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowResults(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />

                {/* Search Results Dropdown */}
                {showResults && searchQuery && !selectedUserId && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user)}
                                    className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-2"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={user.avatarUrl || ''} alt={user.displayName} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                                        <p className="text-xs text-gray-500">{user.title}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                            categoryFilter === cat
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Badge Grid */}
            <div className="max-h-64 overflow-y-auto mb-4">
                <div className="grid grid-cols-2 gap-2">
                    {filteredBadges.map((badge: BadgeDefinition) => (
                        <button
                            key={badge.id}
                            onClick={() => setSelectedBadge(badge.id)}
                            className={cn(
                                'flex items-center gap-2 p-2 rounded-lg border text-left transition-all',
                                selectedBadge === badge.id
                                    ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            )}
                        >
                            <span className="text-xl">{badge.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">{badge.name}</p>
                                <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Award Button */}
            <button
                onClick={handleAward}
                disabled={!selectedUserId || !selectedBadge}
                className={cn(
                    'w-full py-2.5 rounded-lg font-medium text-sm transition-colors',
                    'bg-purple-500 hover:bg-purple-600 text-white',
                    'disabled:bg-gray-200 disabled:text-gray-400'
                )}
            >
                Award Badge
            </button>
        </div>
    );
};

export default AdminBadgePanel;
