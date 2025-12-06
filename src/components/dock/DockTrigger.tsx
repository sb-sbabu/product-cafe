import { Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock } from '../../contexts/DockContext';

/**
 * DockTrigger - Floating action button to open Café Dock
 * 
 * Shows notification badge when there are unread items.
 * Positioned at bottom-right of screen.
 */

interface DockTriggerProps {
    className?: string;
}

export const DockTrigger: React.FC<DockTriggerProps> = ({ className }) => {
    const { isOpen, openDock, unreadCount } = useDock();

    if (isOpen) return null;

    return (
        <button
            onClick={openDock}
            className={cn(
                'fixed z-40 flex items-center gap-2 px-4 py-3',
                'bg-gradient-to-r from-cafe-500 to-orange-500',
                'text-white font-medium text-sm',
                'rounded-full shadow-lg hover:shadow-xl',
                'transition-all duration-300 hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-cafe-500 focus:ring-offset-2',
                // Position
                'bottom-6 right-6',
                // Mobile adjustments
                'md:bottom-6 md:right-6',
                className
            )}
            aria-label={`Open Café Dock${unreadCount > 0 ? `, ${unreadCount} notifications` : ''}`}
        >
            <Coffee className="w-5 h-5" />
            <span className="hidden sm:inline">Café Dock</span>

            {/* Notification badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};
