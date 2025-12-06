/**
 * UserHoverCard - Quick-view popup with user stats
 * 
 * Features:
 * - Avatar, name, title
 * - Level badge
 * - Key stats (discussions, replies, points)
 * - Recent badges
 * - Link to full profile
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Award, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LevelBadge } from '../gamification';
import { LEVELS } from '../../types/gamification';

interface UserHoverCardProps {
    userId: string;
    displayName: string;
    title?: string;
    team?: string;
    avatarUrl?: string;
    totalPoints: number;
    discussionCount: number;
    replyCount: number;
    badgeCount: number;
    levelNumber?: number;
    onViewProfile?: (userId: string) => void;
    children: React.ReactNode; // Trigger element
    className?: string;
}

export const UserHoverCard: React.FC<UserHoverCardProps> = ({
    userId,
    displayName,
    title,
    team,
    avatarUrl,
    totalPoints,
    discussionCount,
    replyCount,
    badgeCount,
    levelNumber = 1,
    onViewProfile,
    children,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const level = LEVELS[levelNumber - 1] || LEVELS[0];

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                });
            }
            setIsOpen(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    // Cancel timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={cn('inline-block', className)}
            >
                {children}
            </div>

            {isOpen && (
                <div
                    ref={cardRef}
                    className={cn(
                        'fixed z-50 w-72 p-4',
                        'bg-white rounded-xl shadow-xl border border-gray-200',
                        'animate-in fade-in-0 zoom-in-95 duration-150'
                    )}
                    style={{
                        top: position.top,
                        left: position.left,
                    }}
                    onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                                {displayName.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
                            {title && (
                                <p className="text-sm text-gray-500 truncate">{title}</p>
                            )}
                            {team && (
                                <p className="text-xs text-gray-400">{team}</p>
                            )}
                        </div>
                    </div>

                    {/* Level Badge */}
                    <div className="mb-3">
                        <LevelBadge level={level} variant="inline" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <span className="text-sm font-medium text-gray-700">{discussionCount}</span>
                            <p className="text-xs text-gray-400">Discuss</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <ThumbsUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <span className="text-sm font-medium text-gray-700">{replyCount}</span>
                            <p className="text-xs text-gray-400">Replies</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <Award className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <span className="text-sm font-medium text-gray-700">{badgeCount}</span>
                            <p className="text-xs text-gray-400">Badges</p>
                        </div>
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Café Credits</span>
                        <span className="text-sm font-bold text-orange-600">❤️ {totalPoints.toLocaleString()}</span>
                    </div>

                    {/* View Profile */}
                    {onViewProfile && (
                        <button
                            onClick={() => onViewProfile(userId)}
                            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            View Profile
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

export default UserHoverCard;
