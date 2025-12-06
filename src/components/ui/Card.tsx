import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'bordered' | 'section';
    accent?: 'grab' | 'library' | 'community' | 'none';
    isHoverable?: boolean;
    isClickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            accent = 'none',
            isHoverable = false,
            isClickable = false,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      bg-white rounded-xl transition-all duration-200
    `;

        const variants = {
            default: 'border border-gray-100 shadow-soft',
            elevated: 'shadow-lg border border-gray-50',
            bordered: 'border-2 border-gray-200',
            section: 'border border-gray-100 shadow-soft relative overflow-hidden',
        };

        const accents = {
            grab: 'before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-accent-grab',
            library: 'before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-accent-library',
            community: 'before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-accent-community',
            none: '',
        };

        const interactionStyles = cn(
            isHoverable && 'hover:shadow-lg hover:border-gray-200',
            isClickable && 'cursor-pointer active:scale-[0.99]'
        );

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    variant === 'section' && accents[accent],
                    interactionStyles,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader: React.FC<CardHeaderProps> = ({
    className,
    children,
    ...props
}) => (
    <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
        {children}
    </div>
);

// Card Content
type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent: React.FC<CardContentProps> = ({
    className,
    children,
    ...props
}) => (
    <div className={cn('px-6 py-4', className)} {...props}>
        {children}
    </div>
);

// Card Footer
type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter: React.FC<CardFooterProps> = ({
    className,
    children,
    ...props
}) => (
    <div
        className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50/50', className)}
        {...props}
    >
        {children}
    </div>
);
