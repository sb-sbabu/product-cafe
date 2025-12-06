import React from 'react';
import { Coffee, Bell } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface HeaderProps {
    onSearch?: (query: string) => void;
    userName?: string;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    onSearch,
    userName = 'User',
    className,
}) => {
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
                        <SearchBar
                            placeholder="Search resources, FAQs, people..."
                            onSearch={onSearch}
                            size="sm"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
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

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="relative"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>

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
