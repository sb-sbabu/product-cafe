/**
 * LevelBadge - Visual level indicator
 * 
 * Displays the user's level with icon and optional details.
 */

import React from 'react';
import { cn } from '../../lib/utils';
import type { Level } from '../../types/gamification';

interface LevelBadgeProps {
    level: Level;
    variant?: 'inline' | 'profile' | 'card';
    showName?: boolean;
    className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
    level,
    variant = 'inline',
    showName = false,
    className,
}) => {
    // Get level-based colors
    const getLevelColors = () => {
        switch (level.id) {
            case 1: return 'bg-gray-100 text-gray-600 border-gray-200';
            case 2: return 'bg-amber-50 text-amber-700 border-amber-200';
            case 3: return 'bg-amber-100 text-amber-800 border-amber-300';
            case 4: return 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-500';
            case 5: return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-500';
            case 6: return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-purple-500';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    if (variant === 'inline') {
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border',
                    getLevelColors(),
                    className
                )}
                title={`${level.name}: ${level.tagline}`}
            >
                <span>{level.icon}</span>
                {showName && <span>{level.name.replace('Café ', '')}</span>}
            </span>
        );
    }

    if (variant === 'profile') {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border',
                    getLevelColors(),
                    className
                )}
            >
                <span className="text-xl">{level.icon}</span>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{level.name}</span>
                    <span className="text-xs opacity-80">{level.tagline}</span>
                </div>
            </div>
        );
    }

    // Card variant
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center',
                getLevelColors(),
                className
            )}
        >
            <span className="text-3xl mb-2">{level.icon}</span>
            <span className="font-bold text-lg">{level.name}</span>
            <span className="text-xs opacity-80 mt-1">{level.tagline}</span>
        </div>
    );
};

// Compact version for lists
export const LevelIcon: React.FC<{ level: Level; className?: string }> = ({ level, className }) => (
    <span
        className={cn('text-base', className)}
        title={level.name}
    >
        {level.icon}
    </span>
);
