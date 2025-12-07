
import React from 'react';
import type { DiscussionResult } from '../../../lib/search/types';
import { MessageSquare, CheckCircle, ThumbsUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface DiscussionCardProps {
    discussion: DiscussionResult;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
    discussion,
    onClick,
    className,
    isSelected
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group bg-white rounded-xl border border-gray-100 p-3 hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer",
                isSelected && "bg-purple-50/50 border-purple-200 shadow-sm",
                className
            )}
        >
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100 shrink-0 mt-0.5">
                    <MessageSquare size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                            {discussion.title}
                        </h3>
                        {discussion.status === 'resolved' && (
                            <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" aria-label="Resolved" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {discussion.bodyPreview}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                        <span className="font-medium text-gray-600">{discussion.authorName}</span>
                        <span className="flex items-center gap-1">
                            <MessageSquare size={10} />
                            {discussion.replyCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp size={10} />
                            {discussion.upvoteCount}
                        </span>
                        {discussion.tags && discussion.tags.length > 0 && (
                            <div className="flex gap-1 ml-auto">
                                {discussion.tags.slice(0, 1).map(tag => (
                                    <span key={tag} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
