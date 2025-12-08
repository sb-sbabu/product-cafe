import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'default' | 'grab' | 'library' | 'community' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'default',
    size = 'sm',
    icon,
    children,
    ...props
}) => {
    const variants: Record<BadgeVariant, string> = {
        default: 'bg-gray-100 text-gray-700',
        grab: 'bg-amber-100 text-amber-800',
        library: 'bg-purple-100 text-purple-800',
        community: 'bg-cyan-100 text-cyan-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        outline: 'bg-transparent border border-gray-200 text-gray-600',
    };

    const sizes: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 font-medium rounded-full',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </span>
    );
};

// Pill variant for quick replies
interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'accent';
    icon?: React.ReactNode;
    isActive?: boolean;
}

export const Pill: React.FC<PillProps> = ({
    className,
    variant = 'default',
    icon,
    isActive = false,
    children,
    ...props
}) => {
    const variants = {
        default: `
      bg-gray-100 text-gray-700 
      hover:bg-gray-200 hover:text-gray-900
    `,
        primary: `
      bg-cafe-100 text-cafe-700
      hover:bg-cafe-200 hover:text-cafe-800
    `,
        accent: `
      bg-white text-gray-700 border border-gray-200
      hover:border-cafe-300 hover:bg-cafe-50
    `,
    };

    const activeStyles = isActive
        ? 'ring-2 ring-cafe-500 ring-offset-1'
        : '';

    return (
        <button
            className={cn(
                `inline-flex items-center gap-2 px-4 py-2 rounded-full
         text-sm font-medium transition-all duration-200
         cursor-pointer active:scale-95`,
                variants[variant],
                activeStyles,
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
};
