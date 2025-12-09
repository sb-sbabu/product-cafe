import React, { useMemo } from 'react';
import { Sun, ArrowDown, Check, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateDigest, type DigestCategory } from '../../lib/daily-brew/barista-engine';
import type { BrewItem } from '../../lib/daily-brew/types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MORNING POUR — The Daily Digest Summary Card
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Phase 3: Premium summary card for the Daily Brew experience.
 * - Time-aware greeting
 * - Visual category breakdown
 * - Quick actions: "One-Click Sip" and "Dive In"
 */

interface MorningPourProps {
    items: BrewItem[];
    onSipAll: () => void;
    onDiveIn: () => void;
    userName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY PILL - Compact count display for each category
// ═══════════════════════════════════════════════════════════════════════════

const CategoryPill: React.FC<{ category: DigestCategory }> = ({ category }) => (
    <div
        className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
            'transition-all duration-200 hover:scale-105',
            category.bgColor,
            'ring-1 ring-black/5'
        )}
    >
        <span className="text-sm">{category.icon}</span>
        <span className={cn('text-xs font-semibold', category.color)}>
            {category.items.length}
        </span>
        <span className="text-xs text-gray-500 hidden sm:inline">
            {category.label}
        </span>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const MorningPour: React.FC<MorningPourProps> = ({
    items,
    onSipAll,
    onDiveIn,
    userName = 'there'
}) => {
    const digest = useMemo(() => generateDigest(items), [items]);

    // Don't render if nothing pending
    if (digest.totalPending === 0) {
        return (
            <div className="mx-3 mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-md shadow-emerald-200/50">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-emerald-800">
                            {digest.greeting}, {userName}! {digest.greetingIcon}
                        </p>
                        <p className="text-sm text-emerald-600">
                            You're all caught up — enjoy your coffee! ☕
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-3 mt-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50/30 border border-amber-100/80 shadow-sm">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GREETING */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md shadow-amber-200/50">
                        <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900">
                                {digest.greeting}, {userName}!
                            </h3>
                            <span className="text-lg">{digest.greetingIcon}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {digest.totalPending === 1
                                ? '1 item waiting for you'
                                : `${digest.totalPending} items waiting for you`
                            }
                        </p>
                    </div>
                </div>

                {/* Priority indicator */}
                {digest.topPriority && (
                    <div className="shrink-0 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg ring-1 ring-rose-200">
                        🔥 Hot
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CATEGORY BREAKDOWN */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {digest.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {digest.categories.map(category => (
                        <CategoryPill key={category.key} category={category} />
                    ))}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* QUICK ACTIONS */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onSipAll}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2',
                        'px-4 py-2.5 rounded-xl',
                        'bg-white hover:bg-gray-50',
                        'border border-gray-200 hover:border-gray-300',
                        'text-sm font-semibold text-gray-700',
                        'transition-all duration-200',
                        'shadow-sm hover:shadow'
                    )}
                >
                    <Check className="w-4 h-4 text-emerald-500" />
                    One-Click Sip
                </button>
                <button
                    onClick={onDiveIn}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2',
                        'px-4 py-2.5 rounded-xl',
                        'bg-gradient-to-r from-amber-500 to-orange-500',
                        'hover:from-amber-600 hover:to-orange-600',
                        'text-sm font-semibold text-white',
                        'transition-all duration-200',
                        'shadow-md shadow-amber-200/50 hover:shadow-lg'
                    )}
                >
                    <ArrowDown className="w-4 h-4" />
                    Dive In
                </button>
            </div>

            {/* Subtle animation keyframe */}
            <style>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default MorningPour;
