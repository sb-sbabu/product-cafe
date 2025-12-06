import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circle' | 'rect' | 'card';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = 'text',
    width,
    height,
    count = 1,
}) => {
    const baseStyles = 'bg-gray-200 animate-pulse rounded';

    const variants = {
        text: 'h-4 rounded',
        circle: 'rounded-full',
        rect: 'rounded-lg',
        card: 'rounded-xl',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    const items = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={cn(baseStyles, variants[variant], className)}
            style={style}
            aria-hidden="true"
        />
    ));

    return count === 1 ? items[0] : <>{items}</>;
};

// Pre-built skeleton patterns
export const ResourceCardSkeleton: React.FC = () => (
    <div className="p-5 border border-gray-100 rounded-xl bg-white">
        <div className="flex items-start gap-4">
            <Skeleton variant="rect" width={48} height={48} />
            <div className="flex-1 space-y-2">
                <Skeleton width="70%" height={20} />
                <Skeleton width="90%" height={16} />
                <Skeleton width="50%" height={16} />
            </div>
        </div>
        <div className="flex gap-2 mt-4">
            <Skeleton variant="rect" width={60} height={24} />
            <Skeleton variant="rect" width={80} height={24} />
        </div>
    </div>
);

export const PersonCardSkeleton: React.FC = () => (
    <div className="p-5 border border-gray-100 rounded-xl bg-white">
        <div className="flex items-center gap-4">
            <Skeleton variant="circle" width={56} height={56} />
            <div className="flex-1 space-y-2">
                <Skeleton width="60%" height={20} />
                <Skeleton width="40%" height={16} />
            </div>
        </div>
        <div className="flex gap-2 mt-4">
            <Skeleton variant="rect" width={80} height={28} />
            <Skeleton variant="rect" width={60} height={28} />
        </div>
    </div>
);

export const FAQCardSkeleton: React.FC = () => (
    <div className="p-5 border border-gray-100 rounded-xl bg-white">
        <div className="flex items-start gap-3">
            <Skeleton variant="circle" width={24} height={24} />
            <div className="flex-1 space-y-2">
                <Skeleton width="80%" height={20} />
                <Skeleton width="60%" height={16} />
            </div>
        </div>
    </div>
);

export const PageSkeleton: React.FC = () => (
    <div className="space-y-8 animate-fade-in">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="space-y-2">
                <Skeleton width={200} height={28} />
                <Skeleton width={300} height={16} />
            </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
            <FAQCardSkeleton />
            <FAQCardSkeleton />
            <FAQCardSkeleton />
        </div>
    </div>
);
