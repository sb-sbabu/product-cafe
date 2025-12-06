import { Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock } from '../../contexts/DockContext';

/**
 * DockTrigger - Floating action button to open Café Dock
 * 
 * Only visible when dock is fully closed.
 * Shows notification badge and animates on hover.
 */

interface DockTriggerProps {
    className?: string;
}

export const DockTrigger: React.FC<DockTriggerProps> = ({ className }) => {
    const { dockState, openDock, unreadCount } = useDock();

    // Only show when dock is completely closed
    if (dockState !== 'closed') return null;

    return (
        <button
            onClick={openDock}
            className={cn(
                'fixed z-40 flex items-center gap-2 px-4 py-3',
                'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600',
                'text-white font-medium text-sm',
                'rounded-full shadow-lg hover:shadow-xl',
                'transition-all duration-300',
                'hover:scale-105 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700',
                'active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                'group',
                // Position
                'bottom-6 right-6',
                className
            )}
            aria-label={`Open Café Dock${unreadCount > 0 ? `, ${unreadCount} notifications` : ''}`}
        >
            <Coffee className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Café Dock</span>

            {/* Notification badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
        </button>
    );
};
