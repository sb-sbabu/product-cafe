/**
 * ReadingBuddies - Match with colleagues reading the same book
 * 
 * Features:
 * - Find buddies reading same book
 * - Side-by-side progress comparison
 * - Quick chat/nudge
 * - Accountability tracking
 */

import React, { useState, useMemo } from 'react';
import {
    Users, MessageCircle, Bell, BookOpen, TrendingUp,
    ChevronRight, Sparkles, Clock, CheckCircle2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReadingBuddy {
    id: string;
    name: string;
    avatar?: string;
    team: string;
    bookId: string;
    bookTitle: string;
    progress: number;
    lastActiveAt: Date;
    streak: number;
    isOnline: boolean;
}

interface ReadingBuddiesProps {
    currentBookId?: string;
    className?: string;
}

// Mock data
const MOCK_BUDDIES: ReadingBuddy[] = [
    {
        id: 'buddy-1',
        name: 'Alex Thompson',
        team: 'Platform',
        bookId: 'empowered',
        bookTitle: 'Empowered',
        progress: 72,
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000),
        streak: 7,
        isOnline: true,
    },
    {
        id: 'buddy-2',
        name: 'Jessica Park',
        team: 'Mobile',
        bookId: 'empowered',
        bookTitle: 'Empowered',
        progress: 45,
        lastActiveAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        streak: 3,
        isOnline: false,
    },
    {
        id: 'buddy-3',
        name: 'Michael Chen',
        team: 'Growth',
        bookId: 'playing-to-win',
        bookTitle: 'Playing to Win',
        progress: 38,
        lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        streak: 12,
        isOnline: false,
    },
    {
        id: 'buddy-4',
        name: 'Rachel Green',
        team: 'Enterprise',
        bookId: 'continuous-discovery',
        bookTitle: 'Continuous Discovery Habits',
        progress: 89,
        lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        streak: 5,
        isOnline: true,
    },
];

export const ReadingBuddies: React.FC<ReadingBuddiesProps> = ({
    currentBookId,
    className
}) => {
    const [selectedBuddyId, setSelectedBuddyId] = useState<string | null>(null);
    const [showNudgeModal, setShowNudgeModal] = useState(false);

    // Filter buddies - show same book first if currentBookId provided
    const sortedBuddies = useMemo(() => {
        const buddies = [...MOCK_BUDDIES];

        if (currentBookId) {
            return buddies.sort((a, b) => {
                if (a.bookId === currentBookId && b.bookId !== currentBookId) return -1;
                if (b.bookId === currentBookId && a.bookId !== currentBookId) return 1;
                return 0;
            });
        }

        // Sort by online status, then by last active
        return buddies.sort((a, b) => {
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
            return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
        });
    }, [currentBookId]);

    const samebookBuddies = sortedBuddies.filter(b => b.bookId === currentBookId);
    const otherBuddies = sortedBuddies.filter(b => b.bookId !== currentBookId);

    const formatLastActive = (date: Date) => {
        const mins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const handleNudge = (buddyId: string) => {
        // Would send notification
        setShowNudgeModal(true);
        setTimeout(() => setShowNudgeModal(false), 2000);
    };

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Reading Buddies</h3>
                        <p className="text-xs text-gray-500">
                            {samebookBuddies.length > 0 ? (
                                `${samebookBuddies.length} reading with you`
                            ) : (
                                'Find colleagues to read with'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Same Book Buddies */}
            {samebookBuddies.length > 0 && (
                <div className="p-4 border-b border-gray-100 bg-cyan-50/30">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                        <span className="text-xs font-semibold text-cyan-800">Reading Same Book</span>
                    </div>

                    <div className="space-y-2">
                        {samebookBuddies.map(buddy => (
                            <BuddyCard
                                key={buddy.id}
                                buddy={buddy}
                                onNudge={handleNudge}
                                isHighlighted
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Buddies */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">
                        {samebookBuddies.length > 0 ? 'Other Active Readers' : 'Active Readers'}
                    </span>
                </div>

                <div className="space-y-2">
                    {otherBuddies.map(buddy => (
                        <BuddyCard
                            key={buddy.id}
                            buddy={buddy}
                            onNudge={handleNudge}
                        />
                    ))}
                </div>
            </div>

            {/* Nudge Sent Toast */}
            {showNudgeModal && (
                <div className="fixed bottom-4 right-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm font-medium">Nudge sent! 🎉</span>
                    </div>
                </div>
            )}
        </div>
    );
};

interface BuddyCardProps {
    buddy: ReadingBuddy;
    onNudge: (id: string) => void;
    isHighlighted?: boolean;
}

const BuddyCard: React.FC<BuddyCardProps> = ({ buddy, onNudge, isHighlighted }) => {
    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-gray-50",
            isHighlighted && "bg-white shadow-sm border border-cyan-100"
        )}>
            {/* Avatar */}
            <div className="relative">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
                    isHighlighted
                        ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                )}>
                    {buddy.name.charAt(0)}
                </div>
                {buddy.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{buddy.name}</p>
                    {buddy.streak >= 7 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium flex items-center gap-0.5">
                            🔥 {buddy.streak}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{buddy.team}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400 truncate">{buddy.bookTitle}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{buddy.progress}%</p>
                    <p className="text-[10px] text-gray-400">
                        {buddy.isOnline ? 'Online' : `Active ${formatLastActive(buddy.lastActiveAt)}`}
                    </p>
                </div>

                {/* Progress Ring */}
                <div className="relative w-9 h-9">
                    <svg className="w-9 h-9 -rotate-90">
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                            fill="none"
                        />
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            stroke={isHighlighted ? "#06b6d4" : "#9ca3af"}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={94.2}
                            strokeDashoffset={94.2 - (buddy.progress / 100) * 94.2}
                        />
                    </svg>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onNudge(buddy.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-cyan-600 transition-colors"
                        title="Send nudge"
                    >
                        <Bell className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-cyan-600 transition-colors"
                        title="Message"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

function formatLastActive(date: Date): string {
    const mins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default ReadingBuddies;
