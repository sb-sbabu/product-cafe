import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { FAQ } from '../../types';

interface FAQCardProps {
    faq: FAQ;
    defaultExpanded?: boolean;
    onHelpful?: (isHelpful: boolean) => void;
}

export const FAQCard: React.FC<FAQCardProps> = ({
    faq,
    defaultExpanded = false,
    onHelpful,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null);

    const handleFeedback = (isHelpful: boolean) => {
        setFeedbackGiven(isHelpful ? 'helpful' : 'not-helpful');
        onHelpful?.(isHelpful);
    };

    return (
        <Card className="overflow-hidden">
            {/* Question Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    `w-full flex items-center justify-between p-5 text-left
           hover:bg-gray-50 transition-colors`,
                    isExpanded && 'bg-gray-50/50'
                )}
            >
                <div className="flex items-start gap-3">
                    <span className="text-xl">❓</span>
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
            </button>

            {/* Answer - Expandable */}
            {isExpanded && (
                <div className="px-5 pb-5 animate-fade-in">
                    {/* Summary */}
                    <div className="pl-9 mb-4">
                        <p className="text-gray-700">{faq.answerSummary}</p>
                    </div>

                    {/* Steps */}
                    {faq.answerSteps && faq.answerSteps.length > 0 && (
                        <div className="pl-9 mb-4">
                            <h4 className="font-medium text-gray-900 mb-3">Steps:</h4>
                            <ol className="space-y-3">
                                {faq.answerSteps.map((step) => (
                                    <li key={step.order} className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 bg-cafe-100 text-cafe-700 rounded-full text-sm font-medium shrink-0">
                                            {step.order}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-gray-700">{step.instruction}</p>
                                            {step.linkUrl && (
                                                <a
                                                    href={step.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-cafe-600 hover:text-cafe-700 text-sm mt-1"
                                                >
                                                    {step.linkText || 'Open Link'}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                            {step.note && (
                                                <p className="text-sm text-gray-500 mt-1 italic">
                                                    💡 {step.note}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Rich HTML Answer */}
                    {faq.answerHtml && (
                        <div
                            className="pl-9 prose prose-sm max-w-none mb-4"
                            dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                        />
                    )}

                    {/* Tags */}
                    <div className="pl-9 flex items-center gap-2 flex-wrap mb-4">
                        {faq.tags.map((tag) => (
                            <Badge key={tag} size="sm">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Feedback */}
                    <div className="pl-9 pt-4 border-t border-gray-100">
                        {feedbackGiven ? (
                            <p className="text-sm text-gray-500">
                                {feedbackGiven === 'helpful'
                                    ? '👍 Thanks for your feedback!'
                                    : '📝 Thanks! We will improve this answer.'}
                            </p>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">Was this helpful?</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<ThumbsUp className="w-4 h-4" />}
                                        onClick={() => handleFeedback(true)}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<ThumbsDown className="w-4 h-4" />}
                                        onClick={() => handleFeedback(false)}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};
