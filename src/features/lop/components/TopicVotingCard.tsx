import React from 'react';
import {
    ChevronUp,
    Flame,
    Clock,
    User,
    Tag,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

// ═══════════════════════════════════════════════════════════════════════════
// TOPIC VOTING CARD — Enhanced voting UI with animations
// Community engagement for topic suggestions
// ═══════════════════════════════════════════════════════════════════════════

interface TopicVotingCardProps {
    topic: {
        id: string;
        title: string;
        description?: string;
        submittedBy: { name: string };
        submittedAt: string;
        upvotes: number;
        status: 'submitted' | 'under-review' | 'scheduled' | 'declined';
        category?: string;
    };
    hasVoted?: boolean;
    onVote?: (topicId: string) => void;
    isTrending?: boolean;
    className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    'submitted': { label: 'Voting', color: 'bg-blue-100 text-blue-700' },
    'under-review': { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
    'scheduled': { label: 'Scheduled! 🎉', color: 'bg-emerald-100 text-emerald-700' },
    'declined': { label: 'Declined', color: 'bg-gray-100 text-gray-500' },
};

export const TopicVotingCard: React.FC<TopicVotingCardProps> = ({
    topic,
    hasVoted = false,
    onVote,
    isTrending = false,
    className,
}) => {
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [localVotes, setLocalVotes] = React.useState(topic.upvotes);
    const [localHasVoted, setLocalHasVoted] = React.useState(hasVoted);

    const handleVote = () => {
        if (localHasVoted) {
            setLocalVotes(v => v - 1);
            setLocalHasVoted(false);
        } else {
            setIsAnimating(true);
            setLocalVotes(v => v + 1);
            setLocalHasVoted(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
        onVote?.(topic.id);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const status = STATUS_CONFIG[topic.status];

    return (
        <Card className={cn(
            "p-4 transition-all duration-200 hover:shadow-md",
            localHasVoted && "ring-2 ring-rose-100 bg-rose-50/30",
            isTrending && "border-amber-200 bg-gradient-to-r from-amber-50/50 to-transparent",
            className
        )}>
            <div className="flex gap-4">
                {/* Vote Button */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleVote}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            localHasVoted
                                ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        )}
                    >
                        <ChevronUp className={cn(
                            "w-6 h-6 transition-transform",
                            isAnimating && "animate-bounce"
                        )} />
                    </button>
                    <span className={cn(
                        "text-lg font-bold mt-1 transition-all",
                        localHasVoted ? "text-rose-600" : "text-gray-600",
                        isAnimating && "scale-125"
                    )}>
                        {localVotes}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 leading-snug">
                            {topic.title}
                        </h4>
                        {isTrending && (
                            <Flame className="w-5 h-5 text-orange-500 shrink-0 animate-pulse" />
                        )}
                    </div>

                    {topic.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {topic.description}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {topic.category && (
                            <Badge variant="outline" size="sm">
                                <Tag className="w-3 h-3 mr-1" />
                                {topic.category}
                            </Badge>
                        )}
                        <Badge className={status.color} size="sm">
                            {status.label}
                        </Badge>
                        <span className="text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {topic.submittedBy.name}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(topic.submittedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TopicVotingCard;
