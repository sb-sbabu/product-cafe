import React from 'react';
import { Book, Target, TrendingUp, Bookmark, Sparkles } from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

export const ReadingStatsWidget: React.FC = () => {
    const { getReadingStats, userLibrary } = useLibraryStore();
    const stats = getReadingStats();

    const goalProgress = Math.min(stats.goalProgress, 100);

    const statItems = [
        {
            label: 'Completed',
            value: stats.booksCompleted,
            icon: Book,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'In Progress',
            value: stats.booksInProgress,
            icon: TrendingUp,
            color: 'text-cafe-600',
            bg: 'bg-cafe-100'
        },
        {
            label: 'Reading List',
            value: stats.booksInList,
            icon: Bookmark,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            label: 'Highlights',
            value: stats.highlightsCount,
            icon: Sparkles,
            color: 'text-amber-600',
            bg: 'bg-amber-100'
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Reading Stats</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Target className="w-4 h-4" />
                    <span>{userLibrary.readingGoal.booksPerYear} books/year</span>
                </div>
            </div>

            {/* Goal Progress Ring */}
            <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="8"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="url(#goalGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${goalProgress * 2.51} 251`}
                            className="transition-all duration-500"
                        />
                        <defs>
                            <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#c6a86e" />
                                <stop offset="100%" stopColor="#dbbf8f" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{stats.booksCompleted}</span>
                        <span className="text-xs text-gray-500">of {userLibrary.readingGoal.booksPerYear}</span>
                    </div>
                </div>

                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                        {stats.booksCompleted >= userLibrary.readingGoal.booksPerYear
                            ? "🎉 You've reached your goal!"
                            : `${userLibrary.readingGoal.booksPerYear - stats.booksCompleted} books to go!`
                        }
                    </p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cafe-400 to-cafe-600 rounded-full transition-all"
                            style={{ width: `${goalProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{Math.round(goalProgress)}% of yearly goal</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
                {statItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className="text-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className={cn('w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-2', item.bg)}>
                                <Icon className={cn('w-4 h-4', item.color)} />
                            </div>
                            <div className="text-lg font-bold text-gray-900">{item.value}</div>
                            <div className="text-xs text-gray-500">{item.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
