/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RECENT HISTORY — Last 10 Accessed Actions
 * Minimal list with timestamps for quick return
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Clock, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useGrabAndGoStore } from '../store/grabAndGoStore';
import { getActionById } from '../actions/quickActions';

interface RecentHistoryProps {
    className?: string;
    maxItems?: number;
    onNavigate?: (route: string) => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
    className,
    maxItems = 5,
    onNavigate,
}) => {
    const { recentItems, clearHistory, recordAccess } = useGrabAndGoStore();

    const displayItems = recentItems.slice(0, maxItems);

    const handleClick = (actionId: string) => {
        const action = getActionById(actionId);
        if (!action) return;

        recordAccess(actionId);
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
    };

    if (displayItems.length === 0) {
        return null;
    }

    return (
        <div className={cn('', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Recent
                </h3>
                <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    title="Clear history"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {/* List */}
            <div className="space-y-1">
                {displayItems.map(item => {
                    const action = getActionById(item.actionId);
                    if (!action) return null;

                    return (
                        <RecentItem
                            key={item.actionId}
                            action={action}
                            accessedAt={item.accessedAt}
                            onClick={() => handleClick(item.actionId)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// RECENT ITEM ROW
// ═══════════════════════════════════════════════════════════════════════════

interface RecentItemProps {
    action: ReturnType<typeof getActionById>;
    accessedAt: number;
    onClick: () => void;
}

const RecentItem: React.FC<RecentItemProps> = ({ action, accessedAt, onClick }) => {
    if (!action) return null;

    const Icon = action.icon;
    const timeAgo = formatTimeAgo(accessedAt);

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-2 py-1.5 rounded-md',
                'hover:bg-gray-50 transition-colors',
                'text-left group'
            )}
        >
            {/* Icon */}
            <div className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center',
                `bg-gradient-to-br ${action.gradient}`
            )}>
                <Icon className="w-3 h-3 text-white" />
            </div>

            {/* Title */}
            <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900 truncate">
                {action.label}
            </span>

            {/* Time */}
            <span className="text-xs text-gray-400">
                {timeAgo}
            </span>

            {/* External indicator */}
            {action.url && (
                <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════════════

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default RecentHistory;
