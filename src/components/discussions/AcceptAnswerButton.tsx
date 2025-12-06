/**
 * AcceptAnswerButton - Button to mark a reply as the accepted answer
 * 
 * Features:
 * - Only visible to discussion author
 * - Shows checkmark when accepted
 * - Click to toggle accepted state
 */

import React from 'react';
import { Check, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AcceptAnswerButtonProps {
    isAccepted: boolean;
    isAuthor: boolean; // Is current user the discussion author?
    onToggle: () => void;
    className?: string;
}

export const AcceptAnswerButton: React.FC<AcceptAnswerButtonProps> = ({
    isAccepted,
    isAuthor,
    onToggle,
    className,
}) => {
    // Non-authors see a static indicator if accepted
    if (!isAuthor) {
        if (isAccepted) {
            return (
                <div className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
                    'bg-emerald-100 text-emerald-700 text-xs font-medium',
                    className
                )}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accepted Answer
                </div>
            );
        }
        return null;
    }

    // Authors can toggle
    return (
        <button
            onClick={onToggle}
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                'transition-all duration-200',
                isAccepted
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
                className
            )}
            aria-label={isAccepted ? 'Unaccept this answer' : 'Accept this answer'}
            aria-pressed={isAccepted}
        >
            {isAccepted ? (
                <>
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-500" />
                    Accepted
                </>
            ) : (
                <>
                    <Check className="w-3.5 h-3.5" />
                    Accept
                </>
            )}
        </button>
    );
};

export default AcceptAnswerButton;
