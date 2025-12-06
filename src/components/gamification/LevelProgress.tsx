/**
 * LevelProgress - Progress bar toward next level
 * 
 * Shows current points and progress to next level threshold.
 */

import React from 'react';
import { cn } from '../../lib/utils';
import type { Level } from '../../types/gamification';
import { LEVELS } from '../../types/gamification';

interface LevelProgressProps {
    currentPoints: number;
    currentLevel: Level;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
    currentPoints,
    currentLevel,
    showLabels = true,
    size = 'md',
    className,
}) => {
    // Calculate progress
    const isMaxLevel = currentLevel.maxPoints === null;
    const nextLevel = LEVELS.find(l => l.id === currentLevel.id + 1);

    let progress = 100;
    let pointsNeeded = 0;

    if (!isMaxLevel && nextLevel) {
        const levelRange = currentLevel.maxPoints! - currentLevel.minPoints + 1;
        const pointsInLevel = currentPoints - currentLevel.minPoints;
        progress = Math.min(100, Math.round((pointsInLevel / levelRange) * 100));
        pointsNeeded = nextLevel.minPoints - currentPoints;
    }

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const getProgressColor = () => {
        if (currentLevel.id >= 5) return 'bg-gradient-to-r from-purple-500 to-violet-600';
        if (currentLevel.id >= 4) return 'bg-gradient-to-r from-amber-500 to-orange-500';
        return 'bg-gradient-to-r from-amber-400 to-orange-400';
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabels && (
                <div className="flex items-center justify-between mb-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span>{currentLevel.icon}</span>
                        <span className="font-medium text-gray-700">{currentLevel.name.replace('Café ', '')}</span>
                    </div>
                    {nextLevel && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <span>{nextLevel.icon}</span>
                            <span>{nextLevel.name.replace('Café ', '')}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Progress bar */}
            <div className={cn(
                'w-full bg-gray-100 rounded-full overflow-hidden',
                sizeClasses[size]
            )}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        getProgressColor()
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Points label */}
            {showLabels && (
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span className="font-mono">{currentPoints.toLocaleString()} pts</span>
                    {!isMaxLevel && nextLevel ? (
                        <span>{pointsNeeded.toLocaleString()} to next level</span>
                    ) : (
                        <span className="text-purple-600 font-medium">🏆 Max Level!</span>
                    )}
                </div>
            )}
        </div>
    );
};

// Compact inline version
export const LevelProgressInline: React.FC<{
    currentPoints: number;
    currentLevel: Level;
    className?: string;
}> = ({ currentPoints, currentLevel, className }) => {
    const isMaxLevel = currentLevel.maxPoints === null;
    const progress = isMaxLevel
        ? 100
        : Math.min(100, Math.round(
            ((currentPoints - currentLevel.minPoints) /
                (currentLevel.maxPoints! - currentLevel.minPoints + 1)) * 100
        ));

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-sm">{currentLevel.icon}</span>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 font-mono">
                {currentPoints.toLocaleString()}
            </span>
        </div>
    );
};
