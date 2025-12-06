/**
 * LeaderboardPage - Café Credits Leaderboard
 * 
 * Shows top contributors by points, with filtering by time period.
 */

import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePointsStore } from '../../stores/pointsStore';
import { useLevelStore } from '../../stores/levelStore';
import { useBadgeStore } from '../../stores/badgeStore';
import { LEVELS } from '../../types/gamification';
import { Card } from '../../components/ui/Card';

type TimePeriod = 'all_time' | 'monthly' | 'weekly';

// Mock leaderboard data - in real app from API
const mockLeaderboard = [
    { id: '1', name: 'Sarah Chen', title: 'Sr. Product Manager', points: 4850, level: 4, badges: 12, avatar: 'SC' },
    { id: '2', name: 'Mike Rivera', title: 'Product Lead', points: 3720, level: 4, badges: 9, avatar: 'MR' },
    { id: '3', name: 'Alex Kumar', title: 'PM II', points: 2150, level: 3, badges: 7, avatar: 'AK' },
    { id: '4', name: 'Jordan Lee', title: 'Product Ops', points: 1830, level: 3, badges: 6, avatar: 'JL' },
    { id: '5', name: 'Priya Sharma', title: 'Sr. PM', points: 1420, level: 3, badges: 5, avatar: 'PS' },
    { id: '6', name: 'David Kim', title: 'PM I', points: 980, level: 2, badges: 4, avatar: 'DK' },
    { id: '7', name: 'Emma Wilson', title: 'Associate PM', points: 720, level: 2, badges: 3, avatar: 'EW' },
    { id: '8', name: 'Chris Taylor', title: 'PM II', points: 540, level: 2, badges: 3, avatar: 'CT' },
    { id: 'current-user', name: 'You', title: 'Product Manager', points: 0, level: 1, badges: 0, avatar: 'Y' },
];

export const LeaderboardPage: React.FC = () => {
    const [period, setPeriod] = useState<TimePeriod>('monthly');
    const [searchQuery, setSearchQuery] = useState('');

    const { totalPoints } = usePointsStore();
    const { currentLevel } = useLevelStore();
    const { earnedBadges } = useBadgeStore();

    // Combine mock data with current user's real stats
    const leaderboardData = mockLeaderboard.map(entry =>
        entry.id === 'current-user'
            ? { ...entry, points: totalPoints, level: currentLevel?.id || 1, badges: earnedBadges.length }
            : entry
    ).sort((a, b) => b.points - a.points);

    // Filter by search
    const filteredData = searchQuery
        ? leaderboardData.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : leaderboardData;

    // Add ranks after sorting
    const rankedData = filteredData.map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    // Find current user's rank
    const currentUserRank = rankedData.find(e => e.id === 'current-user')?.rank || 0;

    const periodOptions: { value: TimePeriod; label: string }[] = [
        { value: 'weekly', label: 'This Week' },
        { value: 'monthly', label: 'This Month' },
        { value: 'all_time', label: 'All Time' },
    ];

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
        return <span className="w-5 h-5 text-center text-sm font-bold text-gray-500">#{rank}</span>;
    };

    const getRankStyles = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
        return 'bg-white border-gray-100';
    };

    const getLevelInfo = (levelId: number) => {
        return LEVELS.find(l => l.id === levelId) || LEVELS[0];
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <section>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                </div>
                <p className="text-gray-600">
                    Top Café Credits earners in the community
                </p>
            </section>

            {/* Your Ranking Card */}
            <section className="bg-gradient-to-r from-cafe-50 to-orange-50 rounded-2xl border border-cafe-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cafe-400 to-cafe-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            Y
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Your Ranking</h3>
                            <p className="text-gray-600">Keep contributing to climb!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-cafe-600">#{currentUserRank}</p>
                            <p className="text-sm text-gray-500">Rank</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-pink-600">{totalPoints.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Credits</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-amber-600">{earnedBadges.length}</p>
                            <p className="text-sm text-gray-500">Badges</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {periodOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                period === opt.value
                                    ? 'bg-cafe-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-400"
                    />
                </div>
            </section>

            {/* Leaderboard Table */}
            <section>
                <Card className="divide-y divide-gray-100">
                    {rankedData.map((entry) => {
                        const level = getLevelInfo(entry.level);
                        const isCurrentUser = entry.id === 'current-user';

                        return (
                            <div
                                key={entry.id}
                                className={cn(
                                    'flex items-center p-4 transition-colors hover:bg-gray-50',
                                    getRankStyles(entry.rank),
                                    isCurrentUser && 'ring-2 ring-cafe-300 ring-inset'
                                )}
                            >
                                {/* Rank */}
                                <div className="w-12 flex justify-center shrink-0">
                                    {getRankIcon(entry.rank)}
                                </div>

                                {/* Avatar & Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                                        entry.rank <= 3
                                            ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700'
                                            : 'bg-gray-100 text-gray-600'
                                    )}>
                                        {entry.avatar}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn(
                                            'font-semibold truncate',
                                            isCurrentUser ? 'text-cafe-700' : 'text-gray-900'
                                        )}>
                                            {entry.name}
                                            {isCurrentUser && <span className="ml-2 text-xs font-normal text-cafe-500">(you)</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{entry.title}</p>
                                    </div>
                                </div>

                                {/* Level */}
                                <div className="w-24 text-center shrink-0">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full text-xs font-medium text-amber-700">
                                        <span>{level.icon}</span>
                                        <span>L{entry.level}</span>
                                    </span>
                                </div>

                                {/* Badges */}
                                <div className="w-20 text-center shrink-0">
                                    <span className="inline-flex items-center gap-1 text-purple-600">
                                        <Award className="w-4 h-4" />
                                        <span className="font-medium">{entry.badges}</span>
                                    </span>
                                </div>

                                {/* Points */}
                                <div className="w-28 text-right shrink-0">
                                    <span className="text-lg font-bold text-pink-600">
                                        {entry.points.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-1">☕</span>
                                </div>
                            </div>
                        );
                    })}
                </Card>
            </section>

            {/* How to Earn More */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    How to Earn More Café Credits
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl mb-2">💬</p>
                        <h4 className="font-medium text-gray-900">Discussions</h4>
                        <p className="text-sm text-gray-600">Ask questions, post answers, get accepted</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl mb-2">🗳️</p>
                        <h4 className="font-medium text-gray-900">Voting</h4>
                        <p className="text-sm text-gray-600">Give upvotes and reactions</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-2xl mb-2">🤝</p>
                        <h4 className="font-medium text-gray-900">Community</h4>
                        <p className="text-sm text-gray-600">Welcome new members, mentor others</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LeaderboardPage;
