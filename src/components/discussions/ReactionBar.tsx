/**
 * ReactionBar - Display grouped reactions with counts
 * 
 * Features:
 * - Groups reactions by type with counts
 * - Highlights user's own reactions
 * - Click to toggle reaction
 * - Compact display with hover states
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { REACTION_CONFIG, type Reaction, type ReactionType } from '../../types/gamification';

interface ReactionBarProps {
    reactions: Reaction[];
    currentUserId: string;
    onToggle: (type: ReactionType) => void;
    className?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
    reactions,
    currentUserId,
    onToggle,
    className,
}) => {
    // Group reactions by type
    const grouped = reactions.reduce((acc, r) => {
        if (!acc[r.type]) {
            acc[r.type] = { count: 0, hasUserReacted: false };
        }
        acc[r.type].count++;
        if (r.userId === currentUserId) {
            acc[r.type].hasUserReacted = true;
        }
        return acc;
    }, {} as Record<ReactionType, { count: number; hasUserReacted: boolean }>);

    const entries = Object.entries(grouped) as [ReactionType, { count: number; hasUserReacted: boolean }][];

    if (entries.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-1', className)}>
            {entries.map(([type, { count, hasUserReacted }]) => {
                const config = REACTION_CONFIG[type];
                return (
                    <button
                        key={type}
                        onClick={() => onToggle(type)}
                        className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                            'transition-all duration-150',
                            hasUserReacted
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        )}
                        title={`${config.label}: ${count}`}
                    >
                        <span>{config.icon}</span>
                        <span className="tabular-nums">{count}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ReactionBar;
