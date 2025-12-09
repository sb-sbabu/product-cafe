/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATUS DASHBOARD — Pending Requests & Upcoming Deadlines
 * Live status cards for IT requests and calendar items
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
    Bell,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Zap,
    FileCheck,
    Users,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import {
    usePendingRequests,
    useUpcomingDeadlines,
    type PendingRequest,
    type UpcomingDeadline,
} from '../store/grabAndGoStore';

interface StatusDashboardProps {
    className?: string;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
    className,
}) => {
    const pendingRequests = usePendingRequests();
    const upcomingDeadlines = useUpcomingDeadlines();

    // Only show active requests (pending or recently resolved)
    const activeRequests = pendingRequests.filter(r =>
        r.status === 'pending' ||
        (r.resolvedAt && Date.now() - r.resolvedAt < 7 * 24 * 60 * 60 * 1000) // 7 days
    );

    // Only show deadlines in next 14 days
    const upcomingOnly = upcomingDeadlines.filter(d =>
        d.dueAt > Date.now() && d.dueAt < Date.now() + 14 * 24 * 60 * 60 * 1000
    );

    if (activeRequests.length === 0 && upcomingOnly.length === 0) {
        return null;
    }

    return (
        <div className={cn('', className)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Status</h3>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRequests.map(req => (
                    <RequestCard key={req.id} request={req} />
                ))}
                {upcomingOnly.map(deadline => (
                    <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST CARD
// ═══════════════════════════════════════════════════════════════════════════

const RequestCard: React.FC<{ request: PendingRequest }> = ({ request }) => {
    const statusConfig = {
        pending: {
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            label: 'Pending',
        },
        approved: {
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            label: 'Approved',
        },
        denied: {
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            border: 'border-red-200',
            label: 'Denied',
        },
    };

    const config = statusConfig[request.status];
    const StatusIcon = config.icon;
    const timeAgo = formatTimeAgo(request.submittedAt);

    return (
        <Card className={cn(
            'p-3 border',
            config.bg,
            config.border
        )}>
            <div className="flex items-start gap-3">
                <div className={cn('p-1.5 rounded-lg', config.bg)}>
                    <StatusIcon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {request.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {config.label} • {timeAgo}
                    </p>
                </div>
            </div>
        </Card>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// DEADLINE CARD
// ═══════════════════════════════════════════════════════════════════════════

const DeadlineCard: React.FC<{ deadline: UpcomingDeadline }> = ({ deadline }) => {
    const typeConfig: Record<UpcomingDeadline['type'], { icon: typeof Calendar; color: string }> = {
        release: { icon: Zap, color: 'text-blue-500' },
        review: { icon: FileCheck, color: 'text-purple-500' },
        meeting: { icon: Users, color: 'text-amber-500' },
        other: { icon: Calendar, color: 'text-gray-500' },
    };

    const config = typeConfig[deadline.type];
    const TypeIcon = config.icon;
    const daysUntil = Math.ceil((deadline.dueAt - Date.now()) / (24 * 60 * 60 * 1000));
    const isUrgent = daysUntil <= 3;

    return (
        <Card className={cn(
            'p-3 border',
            isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
        )}>
            <div className="flex items-start gap-3">
                <div className={cn(
                    'p-1.5 rounded-lg',
                    isUrgent ? 'bg-red-100' : 'bg-blue-100'
                )}>
                    <TypeIcon className={cn(
                        'w-4 h-4',
                        isUrgent ? 'text-red-500' : config.color
                    )} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {deadline.title}
                    </p>
                    <p className={cn(
                        'text-xs mt-0.5',
                        isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'
                    )}>
                        {daysUntil === 0 ? 'Today!' :
                            daysUntil === 1 ? 'Tomorrow' :
                                `in ${daysUntil} days`}
                    </p>
                </div>
            </div>
        </Card>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════════════

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default StatusDashboard;
