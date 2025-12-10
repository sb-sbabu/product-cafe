/**
 * BookClubs - Virtual book clubs with discussions
 * 
 * Features:
 * - Create/join book clubs
 * - Discussion threads per chapter
 * - Reading milestones
 * - Member progress tracking
 */

import React, { useState, useMemo } from 'react';
import {
    Users, Plus, BookOpen, MessageSquare, Calendar,
    ChevronRight, Clock, Crown, Settings, Bell
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ClubMember {
    id: string;
    name: string;
    progress: number;
    isAdmin?: boolean;
}

interface BookClub {
    id: string;
    name: string;
    description: string;
    bookId: string;
    bookTitle: string;
    coverGradient: string;
    members: ClubMember[];
    currentChapter: number;
    totalChapters: number;
    nextMilestone: Date;
    discussionCount: number;
    isJoined: boolean;
}

interface BookClubsProps {
    className?: string;
}

// Mock data
const MOCK_CLUBS: BookClub[] = [
    {
        id: 'club-1',
        name: 'Product Leaders Circle',
        description: 'Deep dive into Inspired with weekly discussions',
        bookId: 'inspired',
        bookTitle: 'Inspired',
        coverGradient: 'from-purple-500 to-indigo-600',
        members: [
            { id: 'm1', name: 'Sarah Chen', progress: 100, isAdmin: true },
            { id: 'm2', name: 'Michael Park', progress: 85 },
            { id: 'm3', name: 'Alex Johnson', progress: 72 },
            { id: 'm4', name: 'Emily Rodriguez', progress: 68 },
            { id: 'm5', name: 'David Kim', progress: 55 },
        ],
        currentChapter: 8,
        totalChapters: 12,
        nextMilestone: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        discussionCount: 47,
        isJoined: true,
    },
    {
        id: 'club-2',
        name: 'Discovery Enthusiasts',
        description: 'Mastering continuous discovery habits together',
        bookId: 'continuous-discovery',
        bookTitle: 'Continuous Discovery Habits',
        coverGradient: 'from-emerald-500 to-teal-600',
        members: [
            { id: 'm6', name: 'Jessica Lee', progress: 60, isAdmin: true },
            { id: 'm7', name: 'Marcus Thompson', progress: 45 },
            { id: 'm8', name: 'Rachel Green', progress: 40 },
        ],
        currentChapter: 5,
        totalChapters: 10,
        nextMilestone: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        discussionCount: 23,
        isJoined: true,
    },
    {
        id: 'club-3',
        name: 'Strategy Scholars',
        description: 'Learning to play to win in product',
        bookId: 'playing-to-win',
        bookTitle: 'Playing to Win',
        coverGradient: 'from-amber-500 to-orange-600',
        members: [
            { id: 'm9', name: 'Chris Wilson', progress: 30, isAdmin: true },
            { id: 'm10', name: 'Lisa Anderson', progress: 25 },
        ],
        currentChapter: 2,
        totalChapters: 8,
        nextMilestone: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        discussionCount: 8,
        isJoined: false,
    },
];

export const BookClubs: React.FC<BookClubsProps> = ({
    className
}) => {
    const [activeTab, setActiveTab] = useState<'my-clubs' | 'discover'>('my-clubs');
    const [expandedClubId, setExpandedClubId] = useState<string | null>(null);

    const myClubs = MOCK_CLUBS.filter(c => c.isJoined);
    const discoverClubs = MOCK_CLUBS.filter(c => !c.isJoined);

    const clubs = activeTab === 'my-clubs' ? myClubs : discoverClubs;

    const formatDaysUntil = (date: Date) => {
        const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `In ${days} days`;
    };

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Book Clubs</h3>
                            <p className="text-xs text-gray-500">Read together, grow together</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        Create Club
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => setActiveTab('my-clubs')}
                        className={cn(
                            "text-sm font-medium pb-2 border-b-2 transition-colors",
                            activeTab === 'my-clubs'
                                ? "text-violet-600 border-violet-600"
                                : "text-gray-500 border-transparent hover:text-gray-700"
                        )}
                    >
                        My Clubs ({myClubs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={cn(
                            "text-sm font-medium pb-2 border-b-2 transition-colors",
                            activeTab === 'discover'
                                ? "text-violet-600 border-violet-600"
                                : "text-gray-500 border-transparent hover:text-gray-700"
                        )}
                    >
                        Discover
                    </button>
                </div>
            </div>

            {/* Clubs List */}
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {clubs.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">
                            {activeTab === 'my-clubs' ? 'No clubs yet' : 'No clubs to discover'}
                        </p>
                        <button className="text-violet-600 hover:text-violet-700 text-sm font-medium">
                            {activeTab === 'my-clubs' ? 'Create your first club' : 'Create a new club'}
                        </button>
                    </div>
                ) : (
                    clubs.map(club => (
                        <div key={club.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                            {/* Club Header */}
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => setExpandedClubId(expandedClubId === club.id ? null : club.id)}
                            >
                                {/* Book Cover */}
                                <div className={cn(
                                    "w-14 h-18 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                    club.coverGradient
                                )}>
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900">{club.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{club.bookTitle}</p>

                                    {/* Progress */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full bg-gradient-to-r", club.coverGradient)}
                                                style={{ width: `${(club.currentChapter / club.totalChapters) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            Ch {club.currentChapter}/{club.totalChapters}
                                        </span>
                                    </div>
                                </div>

                                {/* Members */}
                                <div className="flex items-center">
                                    <div className="flex -space-x-2">
                                        {club.members.slice(0, 3).map((member, idx) => (
                                            <div
                                                key={member.id}
                                                className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                                                style={{ zIndex: 3 - idx }}
                                            >
                                                {member.name.charAt(0)}
                                            </div>
                                        ))}
                                        {club.members.length > 3 && (
                                            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                                                +{club.members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className={cn(
                                        "w-5 h-5 text-gray-300 ml-2 transition-transform",
                                        expandedClubId === club.id && "rotate-90"
                                    )} />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedClubId === club.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-sm text-gray-600">{club.description}</p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                                            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-gray-900">{club.members.length}</p>
                                            <p className="text-xs text-gray-500">Members</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                                            <MessageSquare className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-gray-900">{club.discussionCount}</p>
                                            <p className="text-xs text-gray-500">Discussions</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-gray-900">{formatDaysUntil(club.nextMilestone)}</p>
                                            <p className="text-xs text-gray-500">Next Milestone</p>
                                        </div>
                                    </div>

                                    {/* Members List */}
                                    <div>
                                        <h5 className="text-xs font-semibold text-gray-500 mb-2">MEMBERS</h5>
                                        <div className="space-y-1">
                                            {club.members.map(member => (
                                                <div key={member.id} className="flex items-center gap-2 py-1">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-gray-700 flex-1">{member.name}</span>
                                                    {member.isAdmin && (
                                                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                    <span className="text-xs text-gray-400">{member.progress}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {club.isJoined ? (
                                            <>
                                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Discussions
                                                </button>
                                                <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                                                    <Bell className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all">
                                                <Plus className="w-4 h-4" />
                                                Join Club
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookClubs;
