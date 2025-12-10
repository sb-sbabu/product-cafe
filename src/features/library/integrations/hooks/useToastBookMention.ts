/**
 * useToastBookMention - Hook for integrating book mentions into TOAST recognitions
 * 
 * Features:
 * - Track mentioned book in recognition
 * - Generate "Inspired by 📚" badge
 * - Award bonus credits for book-linked recognitions
 */

import { useState, useCallback } from 'react';
import { useLibraryStore } from '../libraryStore';

export interface BookMention {
    id: string;
    title: string;
    authorNames: string;
}

export interface UseToastBookMentionReturn {
    mentionedBook: BookMention | null;
    setMentionedBook: (book: BookMention | null) => void;
    clearMention: () => void;
    generateMentionBadge: () => { icon: string; label: string; color: string } | null;
    awardBookMentionCredits: () => void;
}

export const useToastBookMention = (): UseToastBookMentionReturn => {
    const [mentionedBook, setMentionedBook] = useState<BookMention | null>(null);
    const { earnCredits } = useLibraryStore();

    const clearMention = useCallback(() => {
        setMentionedBook(null);
    }, []);

    const generateMentionBadge = useCallback(() => {
        if (!mentionedBook) return null;

        return {
            icon: '📚',
            label: `Inspired by: ${mentionedBook.title}`,
            color: 'bg-purple-50 text-purple-700 border-purple-200'
        };
    }, [mentionedBook]);

    const awardBookMentionCredits = useCallback(() => {
        if (mentionedBook) {
            // Award credits for linking recognition to learning
            earnCredits(
                'resource_view',
                `Linked recognition to "${mentionedBook.title}"`,
                { bookId: mentionedBook.id, action: 'toast_mention' }
            );
        }
    }, [mentionedBook, earnCredits]);

    return {
        mentionedBook,
        setMentionedBook,
        clearMention,
        generateMentionBadge,
        awardBookMentionCredits
    };
};

export default useToastBookMention;
