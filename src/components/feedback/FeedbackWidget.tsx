import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FeedbackWidgetProps {
    messageId: string;
    onFeedback: (messageId: string, isHelpful: boolean, comment?: string) => void;
    className?: string;
}

type FeedbackState = 'idle' | 'helpful' | 'unhelpful' | 'commenting' | 'submitted';

/**
 * Feedback Widget - Collects helpful/not helpful feedback with optional comment
 */
export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
    messageId,
    onFeedback,
    className,
}) => {
    const [state, setState] = useState<FeedbackState>('idle');
    const [comment, setComment] = useState('');

    const handleHelpful = () => {
        setState('helpful');
        onFeedback(messageId, true);
        setTimeout(() => setState('submitted'), 1000);
    };

    const handleUnhelpful = () => {
        setState('commenting');
    };

    const submitUnhelpful = () => {
        onFeedback(messageId, false, comment || undefined);
        setState('submitted');
    };

    const cancelComment = () => {
        setState('idle');
        setComment('');
    };

    if (state === 'submitted') {
        return (
            <div className={cn('flex items-center gap-2 text-xs text-green-600 animate-scale-in', className)}>
                <Check className="w-3.5 h-3.5" />
                <span>Thanks for your feedback!</span>
            </div>
        );
    }

    if (state === 'helpful') {
        return (
            <div className={cn('flex items-center gap-2 text-xs text-cafe-600 animate-bounce-in', className)}>
                <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                <span>Glad it helped!</span>
            </div>
        );
    }

    if (state === 'commenting') {
        return (
            <div className={cn('space-y-2 animate-scale-in', className)}>
                <p className="text-xs text-gray-500">What could be better?</p>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Optional: Tell us how we can improve..."
                    className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-cafe-300 focus:ring-1 focus:ring-cafe-300 outline-none resize-none"
                    rows={2}
                    autoFocus
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={submitUnhelpful}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-cafe-500 text-white text-xs font-medium hover:bg-cafe-600 transition-colors press-effect"
                    >
                        <Check className="w-3 h-3" />
                        Submit
                    </button>
                    <button
                        onClick={cancelComment}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors press-effect"
                    >
                        <X className="w-3 h-3" />
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex items-center gap-3 text-xs', className)}>
            <span className="text-gray-400">Was this helpful?</span>
            <button
                onClick={handleHelpful}
                className="p-1.5 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors press-effect"
                aria-label="Yes, helpful"
            >
                <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={handleUnhelpful}
                className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors press-effect"
                aria-label="No, not helpful"
            >
                <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={() => setState('commenting')}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors press-effect"
                aria-label="Add comment"
            >
                <MessageCircle className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

/**
 * Compact inline feedback for chat messages
 */
interface InlineFeedbackProps {
    onFeedback: (isHelpful: boolean) => void;
    className?: string;
}

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
    onFeedback,
    className,
}) => {
    const [submitted, setSubmitted] = useState<boolean | null>(null);

    const handleFeedback = (helpful: boolean) => {
        setSubmitted(helpful);
        onFeedback(helpful);
    };

    if (submitted !== null) {
        return (
            <span className={cn('text-xs text-gray-400 animate-fade-in', className)}>
                {submitted ? '👍' : '👎'}
            </span>
        );
    }

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <button
                onClick={() => handleFeedback(true)}
                className="text-gray-300 hover:text-green-500 transition-colors"
                aria-label="Helpful"
            >
                <ThumbsUp className="w-3 h-3" />
            </button>
            <button
                onClick={() => handleFeedback(false)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Not helpful"
            >
                <ThumbsDown className="w-3 h-3" />
            </button>
        </div>
    );
};
