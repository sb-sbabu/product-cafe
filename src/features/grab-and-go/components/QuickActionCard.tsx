/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK ACTION CARD — Premium One-Click Action
 * Large, gradient card with icon and immediate action
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import { ExternalLink, Pin, PinOff } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { QuickAction } from '../actions/quickActions';
import { useGrabAndGoStore } from '../store/grabAndGoStore';

interface QuickActionCardProps {
    action: QuickAction;
    size?: 'sm' | 'md' | 'lg';
    showPin?: boolean;
    onAction?: () => void;
    onNavigate?: (route: string) => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
    action,
    size = 'md',
    showPin = false,
    onAction,
    onNavigate,
}) => {
    const { isPinned, pinAction, unpinAction, recordAccess } = useGrabAndGoStore();
    const pinned = isPinned(action.id);
    const Icon = action.icon;

    const handleClick = () => {
        recordAccess(action.id);

        // Internal route navigation (for Café features)
        if (action.internalRoute && onNavigate) {
            onNavigate(action.internalRoute);
        }
        // External URL
        else if (action.url) {
            window.open(action.url, '_blank', 'noopener,noreferrer');
        }
        // Custom action callback
        if (action.action) {
            action.action();
        }
        onAction?.();
    };

    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pinned) {
            unpinAction(action.id);
        } else {
            pinAction(action.id);
        }
    };

    const sizeClasses = {
        sm: 'p-3 min-w-[100px]',
        md: 'p-4 min-w-[140px]',
        lg: 'p-5 min-w-[160px]',
    };

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                // Base
                'relative flex flex-col items-center justify-center gap-2 rounded-xl',
                'text-white font-medium text-center',
                'transition-all duration-200 ease-out',
                'shadow-lg',
                // Gradient background
                `bg-gradient-to-br ${action.gradient}`,
                // Hover effects
                'hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20',
                'active:scale-[0.98]',
                // Focus
                'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
                // Size
                sizeClasses[size],
                // Group for pin visibility
                'group'
            )}
        >
            {/* Glow effect on hover */}
            <div className={cn(
                'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                'bg-white/10 blur-sm'
            )} />

            {/* Pin button */}
            {showPin && (
                <button
                    onClick={handlePin}
                    className={cn(
                        'absolute top-1.5 right-1.5 p-1 rounded-md',
                        'opacity-0 group-hover:opacity-100 transition-opacity',
                        'bg-white/20 hover:bg-white/30',
                        pinned && 'opacity-100'
                    )}
                    title={pinned ? 'Unpin' : 'Pin to favorites'}
                >
                    {pinned ? (
                        <PinOff className="w-3 h-3" />
                    ) : (
                        <Pin className="w-3 h-3" />
                    )}
                </button>
            )}

            {/* Icon */}
            <div className={cn(
                'relative z-10 p-2 rounded-lg bg-white/20',
                iconSizes[size] === 'w-8 h-8' && 'p-3'
            )}>
                <Icon className={cn(iconSizes[size], 'drop-shadow-sm')} />
            </div>

            {/* Label */}
            <span className={cn('relative z-10 font-semibold', textSizes[size])}>
                {action.label}
            </span>

            {/* External link indicator */}
            {action.url && (
                <ExternalLink className={cn(
                    'absolute bottom-1.5 right-1.5',
                    'w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity'
                )} />
            )}
        </button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VARIANT — For pinned/recent lists
// ═══════════════════════════════════════════════════════════════════════════

interface QuickActionChipProps {
    action: QuickAction;
    onAction?: () => void;
    onRemove?: () => void;
    showRemove?: boolean;
    onNavigate?: (route: string) => void;
}

export const QuickActionChip: React.FC<QuickActionChipProps> = ({
    action,
    onAction,
    onRemove,
    showRemove = false,
    onNavigate,
}) => {
    const { recordAccess } = useGrabAndGoStore();
    const Icon = action.icon;

    const handleClick = () => {
        recordAccess(action.id);
        // Internal route navigation
        if (action.internalRoute && onNavigate) {
            onNavigate(action.internalRoute);
        }
        // External URL
        else if (action.url) {
            window.open(action.url, '_blank', 'noopener,noreferrer');
        }
        // Custom action callback
        if (action.action) {
            action.action();
        }
        onAction?.();
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'group flex items-center gap-2 px-3 py-2 rounded-lg',
                'bg-white border border-gray-200',
                'hover:border-gray-300 hover:shadow-sm hover:bg-gray-50',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-cafe-500/50'
            )}
        >
            <div className={cn(
                'p-1.5 rounded-md',
                `bg-gradient-to-br ${action.gradient}`
            )}>
                <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {action.label}
            </span>
            {showRemove && onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-auto p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                    title="Remove"
                >
                    <span className="text-xs">×</span>
                </button>
            )}
        </button>
    );
};
