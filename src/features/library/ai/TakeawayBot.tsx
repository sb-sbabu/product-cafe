/**
 * TakeawayBot - Auto-generate insights from highlights
 * 
 * Features:
 * - Group highlights by theme
 * - Generate insight cards
 * - Spaced repetition scheduling
 * - Share-ready cards
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    Sparkles, Lightbulb, Share2, RefreshCw, Brain,
    Clock, ChevronRight, Copy, Check, X
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface TakeawayBotProps {
    bookId?: string;
    className?: string;
}

interface InsightCard {
    id: string;
    theme: string;
    insight: string;
    highlights: { text: string; bookTitle: string }[];
    nextReviewDate: Date;
}

const THEMES = [
    'Leadership & Teams',
    'Strategy & Vision',
    'Discovery & Research',
    'Execution & Delivery',
    'Growth & Metrics',
    'Culture & Communication',
];

export const TakeawayBot: React.FC<TakeawayBotProps> = ({
    bookId,
    className
}) => {
    const { userLibrary, books, earnCredits } = useLibraryStore();

    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    // Get highlights (optionally filtered by book)
    const highlights = useMemo(() => {
        let filtered = userLibrary.highlights;
        if (bookId) {
            filtered = filtered.filter(h => h.bookId === bookId);
        }
        return filtered;
    }, [userLibrary.highlights, bookId]);

    // Generate insight cards from highlights
    const insightCards = useMemo((): InsightCard[] => {
        if (highlights.length === 0) return [];

        // Group highlights by books and themes
        const cards: InsightCard[] = [];

        highlights.forEach((highlight, idx) => {
            const book = books.find(b => b.id === highlight.bookId);
            if (!book) return;

            // Assign a theme based on book tags
            const theme = THEMES.find(t =>
                book.tags.some(tag => t.toLowerCase().includes(tag.toLowerCase()))
            ) || THEMES[idx % THEMES.length];

            // Generate synthesized insight
            const insight = generateInsight(highlight.text, theme);

            cards.push({
                id: `insight-${highlight.id}`,
                theme,
                insight,
                highlights: [{ text: highlight.text, bookTitle: book.title }],
                nextReviewDate: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000)
            });
        });

        // Deduplicate and group similar themes
        const grouped = new Map<string, InsightCard>();
        cards.forEach(card => {
            const existing = grouped.get(card.theme);
            if (existing && existing.highlights.length < 3) {
                existing.highlights.push(...card.highlights);
            } else if (!grouped.has(card.theme)) {
                grouped.set(card.theme, card);
            }
        });

        return Array.from(grouped.values())
            .filter(card => !dismissedIds.has(card.id))
            .slice(0, 5);
    }, [highlights, books, dismissedIds]);

    const handleCopy = (card: InsightCard) => {
        const text = `💡 ${card.insight}\n\n📚 Based on:\n${card.highlights.map(h => `• "${h.text}" - ${h.bookTitle}`).join('\n')}`;
        navigator.clipboard.writeText(text);
        setCopiedId(card.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDismiss = (cardId: string) => {
        setDismissedIds(prev => new Set([...prev, cardId]));
    };

    const handleRegenerate = async () => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDismissedIds(new Set());
        setIsGenerating(false);

        earnCredits(
            'resource_view',
            'Generated new insights from highlights',
            { action: 'regenerate_insights' }
        );
    };

    // Due for review (mock - would track actual SRS schedule)
    const dueForReview = insightCards.filter(card =>
        card.nextReviewDate <= new Date()
    ).length;

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Takeaway Bot</h3>
                            <p className="text-xs text-gray-500">
                                {highlights.length} highlights → {insightCards.length} insights
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {dueForReview > 0 && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                {dueForReview} to review
                            </span>
                        )}
                        <button
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {highlights.length === 0 ? (
                    <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No highlights yet</p>
                        <p className="text-sm text-gray-400">
                            Save highlights while reading to generate insights
                        </p>
                    </div>
                ) : isGenerating ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
                            <Sparkles className="w-6 h-6 text-violet-600" />
                        </div>
                        <p className="text-gray-500">Generating insights...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {insightCards.map(card => (
                            <div
                                key={card.id}
                                className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-violet-200 transition-all group"
                            >
                                {/* Theme Badge */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                                        {card.theme}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(card)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy"
                                        >
                                            {copiedId === card.id ? (
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDismiss(card.id)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Dismiss"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Insight */}
                                <div className="flex items-start gap-2 mb-3">
                                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                        {card.insight}
                                    </p>
                                </div>

                                {/* Source highlights */}
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                    {card.highlights.map((h, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs">
                                            <ChevronRight className="w-3 h-3 text-gray-300 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-gray-500 italic">"{h.text.slice(0, 80)}..."</span>
                                                <span className="text-gray-400 ml-1">— {h.bookTitle}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Next review */}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Review in {Math.ceil((card.nextReviewDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days</span>
                                    </div>
                                    <button className="text-violet-600 hover:text-violet-700 font-medium">
                                        Review now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper to generate synthesized insights
function generateInsight(highlightText: string, theme: string): string {
    // Simple rule-based insight generation (would use AI in production)
    const insights: Record<string, string[]> = {
        'Leadership & Teams': [
            'Great leaders focus on empowering their team members to make decisions independently.',
            'Building trust requires consistent actions and transparent communication.',
            'Team success comes from aligning individual strengths with shared goals.',
        ],
        'Strategy & Vision': [
            'Effective strategy requires saying no to good opportunities to focus on great ones.',
            'Vision provides direction, but strategy defines how to get there.',
            'The best strategies are simple enough to be understood and executed.',
        ],
        'Discovery & Research': [
            'Understanding the problem deeply is more valuable than rushing to solutions.',
            'Customer insights come from watching behavior, not just listening to words.',
            'The best discoveries often come from unexpected sources.',
        ],
        'Execution & Delivery': [
            'Consistent small wins compound into significant outcomes over time.',
            'Focus on outcomes over outputs for meaningful impact.',
            'Iteration beats perfection when speed of learning matters.',
        ],
        'Growth & Metrics': [
            'Measure what matters, not what\'s easy to measure.',
            'Growth comes from understanding and serving customer needs better.',
            'The best metrics drive behavior change, not just reporting.',
        ],
        'Culture & Communication': [
            'Culture is shaped by what behaviors are rewarded and tolerated.',
            'Clear communication prevents most organizational problems.',
            'Psychological safety enables innovation and honest feedback.',
        ],
    };

    const themeInsights = insights[theme] || insights['Strategy & Vision'];
    return themeInsights[Math.floor(Math.random() * themeInsights.length)];
}

export default TakeawayBot;
