/**
 * BadgeUnlockModal - Badge earned celebration
 * 
 * Shows when user earns a new badge.
 */

import React, { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BadgeDefinition } from '../../types/gamification';
import { BadgeIcon } from './BadgeDisplay';

interface BadgeUnlockModalProps {
    badge: BadgeDefinition;
    onClose: () => void;
    className?: string;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
    badge,
    onClose,
    className,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));
        setTimeout(() => setShowContent(true), 200);
    }, []);

    const handleClose = () => {
        setShowContent(false);
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    // Map numeric tier (1|2|3) to gradient colors
    const getTierGradient = (tier?: number) => {
        switch (tier) {
            case 1: return 'from-amber-600 to-orange-700'; // bronze
            case 2: return 'from-gray-400 to-slate-500'; // silver
            case 3: return 'from-yellow-400 to-amber-500'; // gold
            default: return 'from-amber-600 to-orange-700'; // fallback
        }
    };

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center',
                'transition-all duration-300',
                isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0',
                className
            )}
            onClick={handleClose}
        >
            {/* Modal content */}
            <div
                className={cn(
                    'relative max-w-sm w-full mx-4 p-6 rounded-2xl',
                    'bg-white shadow-2xl',
                    'transform transition-all duration-400 ease-out',
                    showContent
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-4 opacity-0 scale-95'
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>

                {/* Badge showcase */}
                <div className="text-center">
                    {/* Glowing badge */}
                    <div className="relative inline-block mb-4">
                        <div
                            className={cn(
                                'absolute inset-0 rounded-full blur-xl opacity-50',
                                `bg-gradient-to-br ${getTierGradient(badge.tier)}`
                            )}
                        />
                        <BadgeIcon badge={badge} size="lg" earned={true} className="relative" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">
                            Badge Unlocked!
                        </span>
                    </div>

                    {/* Badge info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{badge.description}</p>

                    {/* Tier indicator */}
                    <div className={cn(
                        'inline-block px-3 py-1 rounded-full text-xs font-medium',
                        badge.tier === 1 && 'bg-amber-100 text-amber-700',
                        badge.tier === 2 && 'bg-gray-100 text-gray-700',
                        badge.tier === 3 && 'bg-yellow-100 text-yellow-700',
                        !badge.tier && 'bg-amber-100 text-amber-700'
                    )}>
                        {badge.tier === 1 ? 'Bronze' : badge.tier === 2 ? 'Silver' : badge.tier === 3 ? 'Gold' : 'Bronze'} Tier
                    </div>
                </div>

                {/* Dismiss CTA */}
                <button
                    onClick={handleClose}
                    className={cn(
                        'w-full mt-6 py-2.5 rounded-xl font-medium text-white',
                        `bg-gradient-to-r ${getTierGradient(badge.tier)}`,
                        'shadow-lg transition-all duration-200 hover:opacity-90'
                    )}
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};
