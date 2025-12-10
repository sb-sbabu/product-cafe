import React from 'react';
import { cn } from '../../../lib/utils';

interface SkeletonCardProps {
    variant: 'book' | 'collection' | 'path' | 'resource' | 'stats';
    className?: string;
}

const shimmerClass = 'animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]';

export const LibrarySkeletonCard: React.FC<SkeletonCardProps> = ({ variant, className }) => {
    if (variant === 'book') {
        return (
            <div className={cn('bg-white rounded-xl border border-gray-100 overflow-hidden', className)}>
                <div className={cn('h-40', shimmerClass)} />
                <div className="p-4 space-y-3">
                    <div className={cn('h-5 w-3/4 rounded', shimmerClass)} />
                    <div className={cn('h-4 w-1/2 rounded', shimmerClass)} />
                    <div className="flex justify-between pt-3 border-t border-gray-50">
                        <div className={cn('h-4 w-16 rounded', shimmerClass)} />
                        <div className={cn('h-4 w-12 rounded', shimmerClass)} />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'collection') {
        return (
            <div className={cn('bg-white rounded-xl border border-gray-100 p-5', className)}>
                <div className="flex items-start gap-4">
                    <div className={cn('w-14 h-14 rounded-xl shrink-0', shimmerClass)} />
                    <div className="flex-1 space-y-2">
                        <div className={cn('h-5 w-2/3 rounded', shimmerClass)} />
                        <div className={cn('h-4 w-full rounded', shimmerClass)} />
                        <div className={cn('h-4 w-1/4 rounded', shimmerClass)} />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'path') {
        return (
            <div className={cn('bg-white rounded-2xl border border-gray-100 overflow-hidden', className)}>
                <div className={cn('h-24', shimmerClass)} />
                <div className="p-5 space-y-3">
                    <div className={cn('h-4 w-full rounded', shimmerClass)} />
                    <div className={cn('h-4 w-3/4 rounded', shimmerClass)} />
                    <div className="flex gap-4 pt-3">
                        <div className={cn('h-4 w-20 rounded', shimmerClass)} />
                        <div className={cn('h-4 w-20 rounded', shimmerClass)} />
                    </div>
                    <div className="space-y-2 pt-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={cn('w-5 h-5 rounded-full', shimmerClass)} />
                                <div className={cn('h-4 flex-1 rounded', shimmerClass)} />
                            </div>
                        ))}
                    </div>
                    <div className={cn('h-10 w-full rounded-xl mt-4', shimmerClass)} />
                </div>
            </div>
        );
    }

    if (variant === 'resource') {
        return (
            <div className={cn('bg-white rounded-xl border border-gray-100 overflow-hidden', className)}>
                <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className={cn('w-12 h-12 rounded-xl shrink-0', shimmerClass)} />
                        <div className="flex-1 space-y-2">
                            <div className={cn('h-5 w-3/4 rounded', shimmerClass)} />
                            <div className="flex gap-2">
                                <div className={cn('h-4 w-16 rounded-full', shimmerClass)} />
                                <div className={cn('h-4 w-12 rounded', shimmerClass)} />
                            </div>
                        </div>
                    </div>
                    <div className={cn('h-4 w-full rounded', shimmerClass)} />
                    <div className={cn('h-4 w-2/3 rounded', shimmerClass)} />
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <div className={cn('h-4 w-24 rounded', shimmerClass)} />
                    <div className={cn('h-4 w-16 rounded-full', shimmerClass)} />
                </div>
            </div>
        );
    }

    if (variant === 'stats') {
        return (
            <div className={cn('bg-white rounded-2xl border border-gray-100 p-5', className)}>
                <div className="flex items-center justify-between mb-5">
                    <div className={cn('h-5 w-24 rounded', shimmerClass)} />
                    <div className={cn('h-4 w-20 rounded', shimmerClass)} />
                </div>
                <div className="flex items-center gap-6 mb-6">
                    <div className={cn('w-24 h-24 rounded-full', shimmerClass)} />
                    <div className="flex-1 space-y-3">
                        <div className={cn('h-4 w-3/4 rounded', shimmerClass)} />
                        <div className={cn('h-2 w-full rounded-full', shimmerClass)} />
                        <div className={cn('h-3 w-1/2 rounded', shimmerClass)} />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl flex flex-col items-center">
                            <div className={cn('w-8 h-8 rounded-lg mb-2', shimmerClass)} />
                            <div className={cn('h-5 w-8 rounded mb-1', shimmerClass)} />
                            <div className={cn('h-3 w-12 rounded', shimmerClass)} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

// Grid of skeleton cards
export const LibrarySkeletonGrid: React.FC<{
    variant: SkeletonCardProps['variant'];
    count?: number;
    columns?: 1 | 2 | 3 | 4;
}> = ({ variant, count = 4, columns = 4 }) => {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={cn('grid gap-4', gridClasses[columns])}>
            {Array.from({ length: count }).map((_, i) => (
                <LibrarySkeletonCard key={i} variant={variant} />
            ))}
        </div>
    );
};
