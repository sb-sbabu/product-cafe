import React from 'react';
import { Coffee, Heart, Award } from 'lucide-react';
import { CafeFinderBar } from '../search/CafeFinderBar';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { usePointsStore } from '../../stores/pointsStore';
import { useLevelStore } from '../../stores/levelStore';
import { useBadgeStore } from '../../stores/badgeStore';
import { NotificationHub } from '../pulse/notifications/NotificationHub';

interface HeaderProps {
    onSearch?: (query: string) => void;
    userName?: string;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    onSearch: _onSearch,
    userName = 'User',
    className,
}) => {
    const { totalPoints } = usePointsStore();
    const { currentLevel } = useLevelStore();
    const { earnedBadges } = useBadgeStore();

    return (
        <header
            className={cn(
                `sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100`,
                className
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-cafe-500 rounded-xl">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-gray-900">Product Café</h1>
                            <p className="text-xs text-gray-500 -mt-0.5">Your Product Home Base</p>
                        </div>
                    </div>

                    {/* Search - Center */}
                    <div className="flex-1 max-w-xl hidden md:block">
                        <CafeFinderBar
                            placeholder="Search resources, FAQs, people..."
                            size="sm"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Café Credits Display */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-full border border-pink-100">
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            <span className="text-sm font-semibold text-pink-700">{totalPoints.toLocaleString()}</span>
                        </div>

                        {/* Level Badge */}
                        {currentLevel && (
                            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full border border-amber-100">
                                <span className="text-sm">{currentLevel.icon}</span>
                                <span className="text-xs font-medium text-amber-700">L{currentLevel.id}</span>
                            </div>
                        )}

                        {/* Badge Count */}
                        {earnedBadges.length > 0 && (
                            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full border border-purple-100">
                                <Award className="w-3.5 h-3.5 text-purple-500" />
                                <span className="text-xs font-medium text-purple-700">{earnedBadges.length}</span>
                            </div>
                        )}

                        {/* Mobile Search Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            aria-label="Search"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </Button>

                        {/* Notifications - Global Intelligence Hub */}
                        <NotificationHub />

                        {/* User Menu */}
                        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 bg-cafe-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden lg:block text-sm font-medium text-gray-700">
                                {userName.split(' ')[0]}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
