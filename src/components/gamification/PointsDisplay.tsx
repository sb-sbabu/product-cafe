/**
 * PointsDisplay - Café Credits indicator
 * 
 * Shows total points with heart icon.
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PointsDisplayProps {
    points: number;
    variant?: 'inline' | 'badge' | 'large';
    showLabel?: boolean;
    className?: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
    points,
    variant = 'inline',
    showLabel = false,
    className,
}) => {
    const formatPoints = (p: number): string => {
        if (p >= 10000) return `${(p / 1000).toFixed(1)}k`;
        if (p >= 1000) return `${(p / 1000).toFixed(1)}k`;
        return p.toLocaleString();
    };

    if (variant === 'inline') {
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 text-sm text-pink-600 font-medium',
                    className
                )}
                title={`${points.toLocaleString()} Café Credits`}
            >
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                <span>{formatPoints(points)}</span>
            </span>
        );
    }

    if (variant === 'badge') {
        return (
            <div
                className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                    'bg-gradient-to-r from-pink-50 to-rose-50',
                    'border border-pink-200 text-pink-700 font-semibold text-sm',
                    className
                )}
                title={`${points.toLocaleString()} Café Credits`}
            >
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>{formatPoints(points)}</span>
                {showLabel && <span className="text-pink-500 font-normal">pts</span>}
            </div>
        );
    }

    // Large variant
    return (
        <div className={cn('flex flex-col items-center', className)}>
            <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
                <span className="text-3xl font-bold text-gray-900">
                    {points.toLocaleString()}
                </span>
            </div>
            {showLabel && (
                <span className="text-sm text-gray-500 mt-1">Café Credits</span>
            )}
        </div>
    );
};

// Animated point change indicator
export const PointsChange: React.FC<{
    points: number;
    className?: string;
}> = ({ points, className }) => {
    const isPositive = points > 0;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 text-sm font-semibold',
                isPositive ? 'text-green-600' : 'text-red-600',
                className
            )}
        >
            <Heart className={cn(
                'w-3 h-3',
                isPositive ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'
            )} />
            <span>{isPositive ? '+' : ''}{points}</span>
        </span>
    );
};
