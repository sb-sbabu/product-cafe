/**
 * BadgeDisplay - Badge visualization components
 * 
 * Shows earned badges and badge details.
 */

import React from 'react';
import { Award, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BadgeDefinition, EarnedBadge, BadgeProgress } from '../../types/gamification';

interface BadgeIconProps {
    badge: BadgeDefinition;
    earned?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
    badge,
    earned = true,
    size = 'md',
    className,
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-3xl',
    };

    // Map numeric tier (1|2|3) to gradient colors
    const getTierGradient = (tier?: number) => {
        switch (tier) {
            case 1: return 'from-amber-600 to-orange-700'; // bronze
            case 2: return 'from-gray-400 to-slate-500'; // silver
            case 3: return 'from-yellow-400 to-amber-500'; // gold
            default: return 'from-amber-600 to-orange-700'; // fallback to bronze
        }
    };

    return (
        <div
            className={cn(
                'relative flex items-center justify-center rounded-full',
                earned
                    ? `bg-gradient-to-br ${getTierGradient(badge.tier)} shadow-lg`
                    : 'bg-gray-200',
                sizeClasses[size],
                className
            )}
            title={badge.name}
        >
            {earned ? (
                <span className={cn('drop-shadow-sm', !earned && 'opacity-50')}>
                    {badge.icon}
                </span>
            ) : (
                <Lock className="w-1/2 h-1/2 text-gray-400" />
            )}
        </div>
    );
};

interface BadgeCardProps {
    badge: BadgeDefinition;
    earned?: boolean;
    earnedAt?: string;
    progress?: BadgeProgress;
    onClick?: () => void;
    className?: string;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
    badge,
    earned = false,
    earnedAt,
    progress,
    onClick,
    className,
}) => {
    // Map numeric tier (1|2|3) to border colors
    const getTierBorder = (tier?: number) => {
        switch (tier) {
            case 1: return 'border-amber-600'; // bronze
            case 2: return 'border-gray-400'; // silver
            case 3: return 'border-yellow-400'; // gold
            default: return 'border-amber-600'; // fallback to bronze
        }
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                'hover:shadow-md hover:scale-[1.02]',
                earned
                    ? `${getTierBorder(badge.tier)} bg-white`
                    : 'border-gray-200 bg-gray-50 opacity-70',
                className
            )}
        >
            <BadgeIcon badge={badge} earned={earned} />
            <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-gray-900">{badge.name}</div>
                <div className="text-xs text-gray-500">{badge.description}</div>

                {/* Progress bar if not earned */}
                {!earned && progress && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>{progress.currentValue}/{progress.targetValue}</span>
                            <span>{progress.percentComplete}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full transition-all"
                                style={{ width: `${progress.percentComplete}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Earned date if earned */}
                {earned && earnedAt && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Earned {new Date(earnedAt).toLocaleDateString()}
                    </div>
                )}
            </div>
        </button>
    );
};

// Grid layout for badges
interface BadgeGridProps {
    badges: BadgeDefinition[];
    earnedBadges: EarnedBadge[];
    progressMap?: Record<string, BadgeProgress>;
    onBadgeClick?: (badge: BadgeDefinition) => void;
    className?: string;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
    badges,
    earnedBadges,
    progressMap = {},
    onBadgeClick,
    className,
}) => {
    const earnedIds = new Set(earnedBadges.map(b => b.badgeId));
    const earnedMap = earnedBadges.reduce((acc, b) => {
        acc[b.badgeId] = b;
        return acc;
    }, {} as Record<string, EarnedBadge>);

    return (
        <div className={cn('grid grid-cols-2 gap-3', className)}>
            {badges.map(badge => (
                <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={earnedIds.has(badge.id)}
                    earnedAt={earnedMap[badge.id]?.earnedAt}
                    progress={progressMap[badge.id]}
                    onClick={() => onBadgeClick?.(badge)}
                />
            ))}
        </div>
    );
};

// Compact badge strip
export const BadgeStrip: React.FC<{
    badges: BadgeDefinition[];
    maxVisible?: number;
    className?: string;
}> = ({ badges, maxVisible = 5, className }) => {
    const visible = badges.slice(0, maxVisible);
    const remaining = badges.length - maxVisible;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {visible.map(badge => (
                <BadgeIcon key={badge.id} badge={badge} size="sm" earned={true} />
            ))}
            {remaining > 0 && (
                <span className="text-xs text-gray-500 ml-1">+{remaining}</span>
            )}
        </div>
    );
};
