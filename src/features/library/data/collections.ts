import type { Collection } from '../types';

export const COLLECTIONS: Collection[] = [
    {
        id: 'pm-foundations',
        title: 'PM Foundations',
        description: 'Essential reads for every product manager. Master the fundamentals of product discovery, user research, and team dynamics.',
        icon: '📚',
        color: 'bg-purple-100 text-purple-600',
        bookIds: ['inspired', 'empowered', 'continuous-discovery', 'mom-test', 'sprint'],
        featured: true
    },
    {
        id: 'strategy',
        title: 'Product Strategy',
        description: 'Strategic thinking frameworks for product leaders. Learn to craft compelling visions and make winning strategic choices.',
        icon: '🎯',
        color: 'bg-blue-100 text-blue-600',
        bookIds: ['good-strategy-bad-strategy', 'playing-to-win', 'innovators-dilemma'],
        featured: true
    },
    {
        id: 'user-understanding',
        title: 'User Understanding',
        description: 'Deep dive into user research, customer interviews, and discovery practices. Build products users actually want.',
        icon: '🔍',
        color: 'bg-green-100 text-green-600',
        bookIds: ['continuous-discovery', 'mom-test', 'sprint'],
        featured: false
    },
    {
        id: 'leadership',
        title: 'Leadership & Management',
        description: 'Grow as a leader and manager. From first-time manager to executive, learn to lead teams and influence organizations.',
        icon: '👥',
        color: 'bg-amber-100 text-amber-600',
        bookIds: ['managers-path', 'high-output-management', 'radical-candor', 'effective-executive'],
        featured: true
    },
    {
        id: 'productivity',
        title: 'Time & Productivity',
        description: 'Master your time and focus. Learn systems for deep work, prioritization, and stress-free productivity.',
        icon: '⏱️',
        color: 'bg-rose-100 text-rose-600',
        bookIds: ['deep-work', 'essentialism', 'getting-things-done', 'effective-executive'],
        featured: false
    },
    {
        id: 'ai-for-pms',
        title: 'AI for Product Managers',
        description: 'Understand AI/ML concepts, build AI-first products, and lead in the age of artificial intelligence.',
        icon: '🤖',
        color: 'bg-cyan-100 text-cyan-600',
        bookIds: ['designing-ml-systems', 'ai-first-products'],
        featured: true
    },
    {
        id: 'healthcare',
        title: 'Healthcare Domain',
        description: 'Master the healthcare industry. Understand RCM, eligibility, compliance, and the healthcare ecosystem.',
        icon: '🏥',
        color: 'bg-teal-100 text-teal-600',
        bookIds: ['healthcare-rcm-essentials', 'eligibility-verification-guide'],
        featured: false
    }
];

export const getCollectionById = (id: string): Collection | undefined =>
    COLLECTIONS.find(c => c.id === id);

export const getFeaturedCollections = (): Collection[] =>
    COLLECTIONS.filter(c => c.featured);

export const getAllCollections = (): Collection[] => COLLECTIONS;
