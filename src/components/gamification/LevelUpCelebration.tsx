/**
 * LevelUpCelebration - Full-screen level up modal
 * 
 * Celebrates when user reaches a new level.
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, ArrowUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Level } from '../../types/gamification';
import { LevelBadge } from './LevelBadge';

interface LevelUpCelebrationProps {
    oldLevel: Level;
    newLevel: Level;
    onClose: () => void;
    className?: string;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
    oldLevel,
    newLevel,
    onClose,
    className,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Entrance animation
        requestAnimationFrame(() => setIsVisible(true));
        setTimeout(() => setShowContent(true), 300);
    }, []);

    const handleClose = () => {
        setShowContent(false);
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    // New privileges unlocked
    const newPrivileges = newLevel.privileges.filter(
        p => !oldLevel.privileges.includes(p)
    );

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center',
                'transition-all duration-500',
                isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0',
                className
            )}
            onClick={handleClose}
        >
            {/* Confetti/Sparkle background effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        }}
                    >
                        <Sparkles className="w-4 h-4 text-amber-300 opacity-60" />
                    </div>
                ))}
            </div>

            {/* Modal content */}
            <div
                className={cn(
                    'relative max-w-md w-full mx-4 p-6 rounded-2xl',
                    'bg-gradient-to-br from-amber-50 via-white to-orange-50',
                    'border-2 border-amber-200 shadow-2xl',
                    'transform transition-all duration-500 ease-out',
                    showContent
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-8 opacity-0 scale-95'
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close celebration"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-gray-900">Level Up!</h2>
                    <p className="text-gray-500 mt-1">You've reached a new level</p>
                </div>

                {/* Level transition */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <LevelBadge level={oldLevel} variant="card" className="opacity-50 scale-90" />
                    <ArrowUp className="w-8 h-8 text-amber-500 animate-bounce" />
                    <LevelBadge level={newLevel} variant="card" className="ring-4 ring-amber-300 ring-opacity-50" />
                </div>

                {/* New privileges */}
                {newPrivileges.length > 0 && (
                    <div className="bg-white/50 rounded-xl p-4 mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            New Privileges Unlocked
                        </h3>
                        <ul className="space-y-1.5">
                            {newPrivileges.map((privilege, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    {privilege}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* CTA */}
                <button
                    onClick={handleClose}
                    className={cn(
                        'w-full py-3 rounded-xl font-semibold text-white',
                        'bg-gradient-to-r from-amber-500 to-orange-500',
                        'hover:from-amber-600 hover:to-orange-600',
                        'shadow-lg shadow-amber-500/25',
                        'transition-all duration-200'
                    )}
                >
                    Continue
                </button>
            </div>

            {/* CSS for float animation */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};
