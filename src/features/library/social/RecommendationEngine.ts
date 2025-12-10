/**
 * RecommendationEngine - Smart book recommendations
 * 
 * Features:
 * - Collaborative filtering: "PMs who read X also read..."
 * - Content-based: Tags, difficulty, author overlap
 * - Social: What your team is reading
 * - Trending: Hot books across the org
 */

import type { Book } from '../types';

interface RecommendationContext {
    completedBookIds: string[];
    currentlyReadingIds: string[];
    readingListIds: string[];
    preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    preferredTags?: string[];
    teamBookIds?: string[];
}

interface ScoredBook {
    book: Book;
    score: number;
    reasons: string[];
}

type RecommendationType = 'similar' | 'trending' | 'team' | 'continue-journey' | 'challenge';

interface Recommendation {
    type: RecommendationType;
    title: string;
    books: ScoredBook[];
}

// Collaborative filtering data (mock - would come from analytics)
const ALSO_READ: Record<string, string[]> = {
    'inspired': ['empowered', 'continuous-discovery', 'escaping-the-build-trap'],
    'empowered': ['inspired', 'radical-focus', 'measure-what-matters'],
    'continuous-discovery': ['inspired', 'mom-test', 'sprint'],
    'deep-work': ['essentialism', 'atomic-habits', 'the-one-thing'],
    'good-strategy-bad-strategy': ['playing-to-win', 'the-hard-thing-about-hard-things'],
};

// Trending books (mock - would come from analytics)
const TRENDING_BOOK_IDS = [
    'inspired',
    'empowered',
    'continuous-discovery',
    'deep-work',
    'sprint',
];

export class RecommendationEngine {
    private books: Book[];
    private context: RecommendationContext;

    constructor(books: Book[], context: RecommendationContext) {
        this.books = books;
        this.context = context;
    }

    /**
     * Get all recommendation categories
     */
    getAllRecommendations(): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Similar to what you've read
        const similar = this.getSimilarBooks();
        if (similar.length > 0) {
            recommendations.push({
                type: 'similar',
                title: 'Because You Read...',
                books: similar,
            });
        }

        // Trending
        const trending = this.getTrendingBooks();
        if (trending.length > 0) {
            recommendations.push({
                type: 'trending',
                title: 'Trending at Product Café',
                books: trending,
            });
        }

        // Team reading
        const team = this.getTeamReading();
        if (team.length > 0) {
            recommendations.push({
                type: 'team',
                title: 'Your Team is Reading',
                books: team,
            });
        }

        // Continue your journey
        const journey = this.getContinueJourney();
        if (journey.length > 0) {
            recommendations.push({
                type: 'continue-journey',
                title: 'Continue Your Learning Journey',
                books: journey,
            });
        }

        // Challenge yourself
        const challenge = this.getChallengeBooks();
        if (challenge.length > 0) {
            recommendations.push({
                type: 'challenge',
                title: 'Challenge Yourself',
                books: challenge,
            });
        }

        return recommendations;
    }

    /**
     * Get books similar to what user has read (collaborative filtering)
     */
    private getSimilarBooks(): ScoredBook[] {
        const excluded = new Set([
            ...this.context.completedBookIds,
            ...this.context.currentlyReadingIds,
            ...this.context.readingListIds,
        ]);

        const scores = new Map<string, { score: number; reasons: string[] }>();

        // For each completed book, find "also read" books
        this.context.completedBookIds.forEach(completedId => {
            const alsoRead = ALSO_READ[completedId] || [];
            const completedBook = this.books.find(b => b.id === completedId);

            alsoRead.forEach(bookId => {
                if (excluded.has(bookId)) return;

                const existing = scores.get(bookId) || { score: 0, reasons: [] };
                existing.score += 20;
                if (completedBook) {
                    existing.reasons.push(`Readers of "${completedBook.title}" also loved this`);
                }
                scores.set(bookId, existing);
            });

            // Also add books with similar tags
            if (completedBook) {
                this.books.forEach(book => {
                    if (excluded.has(book.id)) return;

                    const commonTags = book.tags.filter(t => completedBook.tags.includes(t));
                    if (commonTags.length >= 2) {
                        const existing = scores.get(book.id) || { score: 0, reasons: [] };
                        existing.score += commonTags.length * 5;
                        existing.reasons.push(`Similar topics: ${commonTags.slice(0, 2).join(', ')}`);
                        scores.set(book.id, existing);
                    }
                });
            }
        });

        return this.scoresToRecommendations(scores);
    }

    /**
     * Get trending books
     */
    private getTrendingBooks(): ScoredBook[] {
        const excluded = new Set([
            ...this.context.completedBookIds,
            ...this.context.currentlyReadingIds,
        ]);

        return TRENDING_BOOK_IDS
            .filter(id => !excluded.has(id))
            .map(id => this.books.find(b => b.id === id))
            .filter((book): book is Book => book !== undefined)
            .slice(0, 4)
            .map((book, idx) => ({
                book,
                score: 100 - idx * 10,
                reasons: [`#${idx + 1} trending this week`],
            }));
    }

    /**
     * Get books your team is reading
     */
    private getTeamReading(): ScoredBook[] {
        if (!this.context.teamBookIds || this.context.teamBookIds.length === 0) {
            return [];
        }

        const excluded = new Set([
            ...this.context.completedBookIds,
            ...this.context.currentlyReadingIds,
        ]);

        return this.context.teamBookIds
            .filter(id => !excluded.has(id))
            .map(id => this.books.find(b => b.id === id))
            .filter((book): book is Book => book !== undefined)
            .slice(0, 3)
            .map(book => ({
                book,
                score: 80,
                reasons: ['Being read by teammates'],
            }));
    }

    /**
     * Get books that continue learning journey (same author, series, etc.)
     */
    private getContinueJourney(): ScoredBook[] {
        const excluded = new Set([
            ...this.context.completedBookIds,
            ...this.context.currentlyReadingIds,
            ...this.context.readingListIds,
        ]);

        const scores = new Map<string, { score: number; reasons: string[] }>();

        this.context.completedBookIds.forEach(completedId => {
            const completedBook = this.books.find(b => b.id === completedId);
            if (!completedBook) return;

            // Find books by same author
            this.books.forEach(book => {
                if (excluded.has(book.id)) return;

                const sameAuthor = book.authorIds.some(a => completedBook.authorIds.includes(a));
                if (sameAuthor) {
                    const existing = scores.get(book.id) || { score: 0, reasons: [] };
                    existing.score += 30;
                    existing.reasons.push(`More from the same author`);
                    scores.set(book.id, existing);
                }
            });
        });

        return this.scoresToRecommendations(scores);
    }

    /**
     * Get books that challenge the user (higher difficulty)
     */
    private getChallengeBooks(): ScoredBook[] {
        const excluded = new Set([
            ...this.context.completedBookIds,
            ...this.context.currentlyReadingIds,
            ...this.context.readingListIds,
        ]);

        // Determine user's average difficulty
        const completedBooks = this.context.completedBookIds
            .map(id => this.books.find(b => b.id === id))
            .filter((b): b is Book => b !== undefined);

        const difficultyLevels = { beginner: 1, intermediate: 2, advanced: 3 };
        const avgDifficulty = completedBooks.length > 0
            ? completedBooks.reduce((sum, b) => sum + difficultyLevels[b.difficulty], 0) / completedBooks.length
            : 1;

        // Recommend books one level up
        const targetDifficulty: ('intermediate' | 'advanced')[] = avgDifficulty < 2
            ? ['intermediate', 'advanced']
            : ['advanced'];

        return this.books
            .filter(book => !excluded.has(book.id) && targetDifficulty.includes(book.difficulty as 'intermediate' | 'advanced'))
            .filter(book => book.rating >= 4.5)
            .slice(0, 3)
            .map(book => ({
                book,
                score: 70,
                reasons: ['Challenge your thinking with advanced concepts'],
            }));
    }

    /**
     * Convert score map to sorted recommendations
     */
    private scoresToRecommendations(scores: Map<string, { score: number; reasons: string[] }>): ScoredBook[] {
        return Array.from(scores.entries())
            .map(([bookId, { score, reasons }]) => {
                const book = this.books.find(b => b.id === bookId);
                if (!book) return null;
                return { book, score, reasons: [...new Set(reasons)] };
            })
            .filter((r): r is ScoredBook => r !== null)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
    }

    /**
     * Get a single "next book" recommendation
     */
    getTopRecommendation(): ScoredBook | null {
        const all = this.getAllRecommendations();
        const allBooks = all.flatMap(r => r.books);

        if (allBooks.length === 0) return null;

        return allBooks.sort((a, b) => b.score - a.score)[0];
    }
}

// Hook for easy use in components
export function createRecommendationEngine(books: Book[], context: RecommendationContext) {
    return new RecommendationEngine(books, context);
}

export default RecommendationEngine;
