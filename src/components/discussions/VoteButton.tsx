/**
 * VoteButton - Animated upvote button with toggle and count
 * 
 * Features:
 * - Shows upvote count
 * - Highlights when user has voted
 * - Animates on vote add
 * - Prevents duplicate votes via store
 */

import React, { useState } from 'react';
import { ArrowBigUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VoteButtonProps {
    count: number;
    hasVoted: boolean;
    onVote: () => void;
    size?: 'sm' | 'md';
    className?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
    count,
    hasVoted,
    onVote,
    size = 'md',
    className,
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (!hasVoted) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
        onVote();
    };

    const sizeClasses = size === 'sm'
        ? 'px-2 py-1 text-xs gap-1'
        : 'px-3 py-1.5 text-sm gap-1.5';

    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    return (
        <button
            onClick={handleClick}
            className={cn(
                'inline-flex items-center rounded-lg font-medium transition-all duration-200',
                sizeClasses,
                hasVoted
                    ? 'bg-orange-100 text-orange-600 border border-orange-200 hover:bg-orange-50'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-700',
                isAnimating && 'scale-110',
                className
            )}
            aria-label={hasVoted ? 'Remove upvote' : 'Upvote'}
            aria-pressed={hasVoted}
        >
            <ArrowBigUp
                className={cn(
                    iconSize,
                    'transition-transform',
                    hasVoted && 'fill-orange-500',
                    isAnimating && '-translate-y-0.5'
                )}
            />
            <span className={cn(
                'tabular-nums',
                isAnimating && 'font-bold'
            )}>
                {count}
            </span>
        </button>
    );
};

export default VoteButton;
