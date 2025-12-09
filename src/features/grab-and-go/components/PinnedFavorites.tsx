/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PINNED FAVORITES — User's Custom Quick Access
 * Compact grid of user-pinned actions with remove functionality
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Pin, Plus, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { QuickActionChip } from './QuickActionCard';
import { useGrabAndGoStore } from '../store/grabAndGoStore';
import { getActionById } from '../actions/quickActions';

interface PinnedFavoritesProps {
    className?: string;
    onAddPin?: () => void;
}

export const PinnedFavorites: React.FC<PinnedFavoritesProps> = ({
    className,
    onAddPin,
}) => {
    const { pinnedActionIds, unpinAction } = useGrabAndGoStore();

    const pinnedActions = pinnedActionIds
        .map(id => getActionById(id))
        .filter(Boolean);

    return (
        <div className={cn('', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Pin className="w-4 h-4 text-cafe-500" />
                    Your Pinned
                </h3>
                {onAddPin && pinnedActions.length < 8 && (
                    <button
                        onClick={onAddPin}
                        className="text-xs text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add
                    </button>
                )}
            </div>

            {/* Pinned Items */}
            {pinnedActions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {pinnedActions.map(action => action && (
                        <QuickActionChip
                            key={action.id}
                            action={action}
                            showRemove
                            onRemove={() => unpinAction(action.id)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyPinnedState onAddPin={onAddPin} />
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

const EmptyPinnedState: React.FC<{ onAddPin?: () => void }> = ({ onAddPin }) => (
    <div className={cn(
        'flex flex-col items-center justify-center py-6 px-4',
        'bg-gray-50 rounded-lg border border-dashed border-gray-200'
    )}>
        <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 text-center mb-2">
            Pin your favorites for quick access
        </p>
        {onAddPin && (
            <button
                onClick={onAddPin}
                className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md',
                    'bg-cafe-100 text-cafe-700 hover:bg-cafe-200',
                    'transition-colors'
                )}
            >
                <Plus className="w-3 h-3 inline-block mr-1" />
                Add your first pin
            </button>
        )}
    </div>
);

export default PinnedFavorites;
