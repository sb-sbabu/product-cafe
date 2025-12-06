/**
 * DiscussionStatus - Status badge for discussion lifecycle
 * 
 * Displays: open, resolved, stale
 * With appropriate colors and icons
 */

import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type StatusType = 'open' | 'resolved' | 'stale';

interface DiscussionStatusProps {
    status: StatusType;
    className?: string;
}

const statusConfig: Record<StatusType, { icon: React.FC<{ className?: string }>; label: string; className: string }> = {
    open: {
        icon: AlertCircle,
        label: 'Open',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    resolved: {
        icon: CheckCircle2,
        label: 'Resolved',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    stale: {
        icon: Clock,
        label: 'Stale',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
};

export const DiscussionStatus: React.FC<DiscussionStatusProps> = ({
    status,
    className,
}) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
            config.className,
            className
        )}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

export default DiscussionStatus;
