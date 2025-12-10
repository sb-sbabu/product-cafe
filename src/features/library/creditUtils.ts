// Credit calculation utilities for books
import type { Book, BookDifficulty } from './types';

// Base credits by difficulty
const BASE_CREDITS: Record<BookDifficulty, number> = {
    beginner: 30,
    intermediate: 50,
    advanced: 75
};

// Bonus multipliers
const ESSENTIAL_BONUS = 15;    // Books tagged 'essential'
const FEATURED_BONUS = 10;     // Books in 'featured' collection
const LONG_BOOK_THRESHOLD = 300; // Pages
const LONG_BOOK_BONUS = 20;
const RATING_BONUS_THRESHOLD = 4.7;
const RATING_BONUS = 10;

export function calculateBookCredits(book: Book): number {
    // If book has explicit creditReward, use it
    if (book.creditReward !== undefined) {
        return book.creditReward;
    }

    // Calculate based on difficulty
    let credits = BASE_CREDITS[book.difficulty];

    // Essential tag bonus
    if (book.tags.includes('essential')) {
        credits += ESSENTIAL_BONUS;
    }

    // Featured collection bonus
    if (book.collections.includes('featured')) {
        credits += FEATURED_BONUS;
    }

    // Long book bonus
    if (book.pageCount >= LONG_BOOK_THRESHOLD) {
        credits += LONG_BOOK_BONUS;
    }

    // High rating bonus
    if (book.rating >= RATING_BONUS_THRESHOLD) {
        credits += RATING_BONUS;
    }

    return credits;
}

// Get credit tier label
export function getCreditTier(credits: number): { label: string; color: string } {
    if (credits >= 75) return { label: '💎 Premium', color: 'text-purple-600 bg-purple-50' };
    if (credits >= 50) return { label: '🥇 Gold', color: 'text-amber-600 bg-amber-50' };
    if (credits >= 35) return { label: '🥈 Silver', color: 'text-gray-600 bg-gray-50' };
    return { label: '🥉 Bronze', color: 'text-orange-600 bg-orange-50' };
}

// Expert badges for authors
export interface ExpertBadge {
    id: string;
    name: string;
    icon: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    color: string;
}

export const EXPERT_BADGES: Record<string, ExpertBadge> = {
    'thought-leader': {
        id: 'thought-leader',
        name: 'Thought Leader',
        icon: '💡',
        description: 'Recognized industry thought leader',
        tier: 'gold',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    'bestseller-author': {
        id: 'bestseller-author',
        name: 'Bestseller Author',
        icon: '📚',
        description: 'Author of bestselling books',
        tier: 'platinum',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    'pm-pioneer': {
        id: 'pm-pioneer',
        name: 'PM Pioneer',
        icon: '🚀',
        description: 'Product management pioneer and innovator',
        tier: 'platinum',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'silicon-valley-leader': {
        id: 'silicon-valley-leader',
        name: 'Silicon Valley Leader',
        icon: '🏆',
        description: 'Proven leader in Silicon Valley tech companies',
        tier: 'gold',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    'academic-expert': {
        id: 'academic-expert',
        name: 'Academic Expert',
        icon: '🎓',
        description: 'Distinguished academic and researcher',
        tier: 'gold',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    'productivity-guru': {
        id: 'productivity-guru',
        name: 'Productivity Guru',
        icon: '⚡',
        description: 'Expert in personal productivity and effectiveness',
        tier: 'silver',
        color: 'bg-green-50 text-green-700 border-green-200'
    },
    'management-legend': {
        id: 'management-legend',
        name: 'Management Legend',
        icon: '👑',
        description: 'Legendary management thinker and practitioner',
        tier: 'platinum',
        color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    'coach': {
        id: 'coach',
        name: 'Product Coach',
        icon: '🎯',
        description: 'Experienced product and leadership coach',
        tier: 'silver',
        color: 'bg-teal-50 text-teal-700 border-teal-200'
    }
};

// Author to badge mapping
export const AUTHOR_BADGES: Record<string, string[]> = {
    'marty-cagan': ['thought-leader', 'pm-pioneer', 'silicon-valley-leader'],
    'teresa-torres': ['coach', 'thought-leader'],
    'rob-fitzpatrick': ['coach', 'bestseller-author'],
    'jake-knapp': ['silicon-valley-leader', 'thought-leader'],
    'richard-rumelt': ['academic-expert', 'bestseller-author'],
    'ag-lafley': ['management-legend', 'silicon-valley-leader'],
    'clayton-christensen': ['academic-expert', 'thought-leader', 'bestseller-author'],
    'camille-fournier': ['silicon-valley-leader', 'thought-leader'],
    'andy-grove': ['management-legend', 'silicon-valley-leader'],
    'kim-scott': ['silicon-valley-leader', 'coach'],
    'cal-newport': ['academic-expert', 'productivity-guru', 'bestseller-author'],
    'greg-mckeown': ['productivity-guru', 'bestseller-author'],
    'david-allen': ['productivity-guru', 'management-legend'],
    'peter-drucker': ['management-legend', 'academic-expert'],
    'chip-huyen': ['academic-expert', 'thought-leader']
};

export function getAuthorBadges(authorId: string): ExpertBadge[] {
    const badgeIds = AUTHOR_BADGES[authorId] || [];
    return badgeIds.map(id => EXPERT_BADGES[id]).filter(Boolean);
}
