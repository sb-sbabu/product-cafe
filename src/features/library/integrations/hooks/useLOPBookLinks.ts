/**
 * useLOPBookLinks - Hook for linking books to LOP sessions
 * 
 * Features:
 * - Find books related to session topic
 * - Track reading for session prep
 * - Award credits for pre-session reading
 */

import { useMemo, useCallback } from 'react';
import { useLibraryStore } from '../libraryStore';
import type { Book } from '../types';

interface LOPSession {
    id: string;
    title: string;
    topic: string;
    tags: string[];
}

interface UseLOPBookLinksReturn {
    getRelatedBooks: (session: LOPSession) => Book[];
    getSpeakerBooks: (speakerId: string) => Book[];
    getPreSessionPrimers: (session: LOPSession) => Book[];
    getDeepDiveBooks: (session: LOPSession) => Book[];
    awardSessionPrepCredits: (sessionId: string, bookId: string) => void;
}

// Topic to book tags mapping
const TOPIC_BOOK_MAPPING: Record<string, string[]> = {
    'product-strategy': ['strategy', 'product-management', 'business'],
    'user-research': ['discovery', 'customer-development', 'research'],
    'leadership': ['leadership', 'management', 'teams'],
    'discovery': ['discovery', 'experimentation', 'customer-development'],
    'execution': ['agile', 'delivery', 'teams'],
    'metrics': ['analytics', 'metrics', 'data'],
    'growth': ['growth', 'marketing', 'business'],
    'innovation': ['innovation', 'disruption', 'strategy'],
    'ai-ml': ['ai', 'ml', 'technology'],
    'design': ['design', 'ux', 'user-experience'],
};

export const useLOPBookLinks = (): UseLOPBookLinksReturn => {
    const { books, earnCredits } = useLibraryStore();

    const getRelatedBooks = useCallback((session: LOPSession): Book[] => {
        const topicTags = TOPIC_BOOK_MAPPING[session.topic] || [];
        const allTags = [...topicTags, ...session.tags];

        // Score books by relevance
        const scoredBooks = books.map(book => {
            let score = 0;

            book.tags.forEach(tag => {
                if (allTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                    score += 10;
                }
            });

            if (book.collections.includes('featured')) score += 5;
            if (book.rating >= 4.5) score += 3;

            return { book, score };
        });

        return scoredBooks
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(({ book }) => book);
    }, [books]);

    const getSpeakerBooks = useCallback((speakerId: string): Book[] => {
        // Find books by this author/speaker
        return books.filter(book => book.authorIds.includes(speakerId));
    }, [books]);

    const getPreSessionPrimers = useCallback((session: LOPSession): Book[] => {
        const related = getRelatedBooks(session);
        return related.filter(book => book.difficulty === 'beginner').slice(0, 2);
    }, [getRelatedBooks]);

    const getDeepDiveBooks = useCallback((session: LOPSession): Book[] => {
        const related = getRelatedBooks(session);
        return related.filter(book => book.difficulty === 'advanced').slice(0, 2);
    }, [getRelatedBooks]);

    const awardSessionPrepCredits = useCallback((sessionId: string, bookId: string) => {
        earnCredits(
            'article_read',
            'Prepared for LOP session with related reading',
            { sessionId, bookId, action: 'lop_prep' }
        );
    }, [earnCredits]);

    return {
        getRelatedBooks,
        getSpeakerBooks,
        getPreSessionPrimers,
        getDeepDiveBooks,
        awardSessionPrepCredits
    };
};

export default useLOPBookLinks;
