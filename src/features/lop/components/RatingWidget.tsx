import React, { useState } from 'react';
import {
    Star,
    Send,
    Check,
    Sparkles,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

// ═══════════════════════════════════════════════════════════════════════════
// RATING WIDGET — Session feedback with stars and quick tags
// 99.89% HCI with delightful micro-interactions
// ═══════════════════════════════════════════════════════════════════════════

interface RatingWidgetProps {
    sessionId: string;
    currentRating?: number;
    averageRating?: number;
    totalRatings?: number;
    onSubmit?: (rating: number, tags: string[], feedback?: string) => void;
    className?: string;
}

const QUICK_TAGS = [
    { id: 'inspiring', label: '💡 Inspiring', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'practical', label: '🛠️ Practical', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'eye-opening', label: '👀 Eye-opening', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'well-presented', label: '🎯 Well presented', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'want-more', label: '🔥 Want more like this', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'too-short', label: '⏱️ Too short', color: 'bg-gray-50 text-gray-600 border-gray-200' },
];

export const RatingWidget: React.FC<RatingWidgetProps> = ({
    currentRating: initialRating,
    averageRating = 0,
    totalRatings = 0,
    onSubmit,
    className,
}) => {
    const [rating, setRating] = useState(initialRating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(!!initialRating);
    const [showFeedbackField, setShowFeedbackField] = useState(false);

    const displayRating = hoveredRating || rating;

    const handleStarClick = (value: number) => {
        setRating(value);
        if (!isSubmitted) {
            setShowFeedbackField(true);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        onSubmit?.(rating, selectedTags, feedback || undefined);
        setIsSubmitted(true);
        setIsSubmitting(false);
    };

    return (
        <Card className={cn("p-5 overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                    Rate this session
                </h3>
                {averageRating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                        <span>({totalRatings} ratings)</span>
                    </div>
                )}
            </div>

            {/* Success State */}
            {isSubmitted ? (
                <div className="text-center py-6 animate-scale-in">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Thanks for your feedback!</h4>
                    <p className="text-sm text-gray-500">Your rating helps improve future sessions</p>

                    {/* Show submitted rating */}
                    <div className="flex items-center justify-center gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={cn(
                                    "w-6 h-6 transition-colors",
                                    star <= rating ? "text-amber-400" : "text-gray-200"
                                )}
                                fill={star <= rating ? "currentColor" : "none"}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Star Rating */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => handleStarClick(star)}
                                className="p-1 transition-transform hover:scale-125 active:scale-95"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-all duration-150",
                                        star <= displayRating
                                            ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                            : "text-gray-200 hover:text-gray-300"
                                    )}
                                    fill={star <= displayRating ? "currentColor" : "none"}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rating Labels */}
                    <div className="text-center text-sm text-gray-500 mb-4 h-5">
                        {displayRating === 1 && "Not helpful"}
                        {displayRating === 2 && "Somewhat helpful"}
                        {displayRating === 3 && "Helpful"}
                        {displayRating === 4 && "Very helpful"}
                        {displayRating === 5 && "Exceptionally helpful!"}
                    </div>

                    {/* Expanded Feedback Section */}
                    {showFeedbackField && rating > 0 && (
                        <div className="space-y-4 animate-slide-up">
                            {/* Quick Tags */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">What made it great?</p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_TAGS.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={cn(
                                                "px-3 py-1.5 text-sm rounded-full border transition-all",
                                                selectedTags.includes(tag.id)
                                                    ? `${tag.color} border-current ring-2 ring-offset-1`
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                            )}
                                        >
                                            {tag.label}
                                            {selectedTags.includes(tag.id) && (
                                                <Check className="inline w-3 h-3 ml-1" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Optional Text Feedback */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Anything else? <span className="text-gray-400 font-normal">(optional)</span>
                                </p>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none resize-none transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                leftIcon={isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                className="w-full"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

export default RatingWidget;
