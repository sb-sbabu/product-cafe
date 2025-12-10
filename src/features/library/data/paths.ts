import type { LearningPath } from '../types';

export const LEARNING_PATHS: LearningPath[] = [
    // Career Paths
    {
        id: 'new-pm-journey',
        title: 'New PM Journey',
        description: 'Your first 90 days and beyond. Build a strong foundation in product management with essential readings and frameworks.',
        type: 'career',
        icon: '🌱',
        color: 'from-green-400 to-emerald-500',
        targetPersonas: ['ic-pm'],
        durationWeeks: 8,
        prerequisites: [],
        featured: true,
        modules: [
            {
                id: 'npm-1',
                title: 'PM Foundations',
                description: 'Understand what product management really means and how great product teams operate.',
                bookIds: ['inspired'],
                durationWeeks: 2,
                order: 1
            },
            {
                id: 'npm-2',
                title: 'Talking to Customers',
                description: 'Learn to have effective customer conversations that yield real insights.',
                bookIds: ['mom-test'],
                durationWeeks: 2,
                order: 2
            },
            {
                id: 'npm-3',
                title: 'Continuous Discovery',
                description: 'Embed discovery into your weekly practice with sustainable habits.',
                bookIds: ['continuous-discovery'],
                durationWeeks: 2,
                order: 3
            },
            {
                id: 'npm-4',
                title: 'Rapid Validation',
                description: 'Learn to test ideas quickly with design sprints and prototyping.',
                bookIds: ['sprint'],
                durationWeeks: 2,
                order: 4
            }
        ]
    },
    {
        id: 'senior-pm-track',
        title: 'Senior PM Track',
        description: 'Level up from IC to senior PM. Develop strategic thinking, stakeholder management, and cross-functional influence.',
        type: 'career',
        icon: '🌿',
        color: 'from-blue-400 to-indigo-500',
        targetPersonas: ['senior-pm', 'product-lead'],
        durationWeeks: 10,
        prerequisites: ['new-pm-journey'],
        featured: true,
        modules: [
            {
                id: 'spm-1',
                title: 'Strategic Thinking',
                description: 'Learn to craft and communicate compelling product strategy.',
                bookIds: ['good-strategy-bad-strategy'],
                durationWeeks: 3,
                order: 1
            },
            {
                id: 'spm-2',
                title: 'Empowered Teams',
                description: 'Understand what truly empowered product teams look like and how to build them.',
                bookIds: ['empowered'],
                durationWeeks: 3,
                order: 2
            },
            {
                id: 'spm-3',
                title: 'Focus & Prioritization',
                description: 'Master the art of saying no and focusing on what truly matters.',
                bookIds: ['essentialism', 'deep-work'],
                durationWeeks: 2,
                order: 3
            },
            {
                id: 'spm-4',
                title: 'Influence & Communication',
                description: 'Build trust and influence across the organization.',
                bookIds: ['radical-candor'],
                durationWeeks: 2,
                order: 4
            }
        ]
    },
    {
        id: 'leadership-track',
        title: 'Product Leadership Track',
        description: 'From senior PM to product leader. Develop the skills to lead teams, manage managers, and shape product culture.',
        type: 'career',
        icon: '🏔️',
        color: 'from-purple-400 to-violet-500',
        targetPersonas: ['product-lead', 'director'],
        durationWeeks: 12,
        prerequisites: ['senior-pm-track'],
        featured: true,
        modules: [
            {
                id: 'plt-1',
                title: 'Management Foundations',
                description: 'Learn the fundamentals of effective management from tech industry legends.',
                bookIds: ['managers-path', 'high-output-management'],
                durationWeeks: 4,
                order: 1
            },
            {
                id: 'plt-2',
                title: 'Executive Effectiveness',
                description: 'Develop the practices of highly effective executives.',
                bookIds: ['effective-executive'],
                durationWeeks: 2,
                order: 2
            },
            {
                id: 'plt-3',
                title: 'Strategic Choices',
                description: 'Make winning strategic choices and build organizational capabilities.',
                bookIds: ['playing-to-win'],
                durationWeeks: 3,
                order: 3
            },
            {
                id: 'plt-4',
                title: 'Innovation Leadership',
                description: 'Navigate disruption and lead innovation at scale.',
                bookIds: ['innovators-dilemma'],
                durationWeeks: 3,
                order: 4
            }
        ]
    },

    // Skill Paths
    {
        id: 'discovery-mastery',
        title: 'Discovery Mastery',
        description: 'Become an expert in product discovery. Master customer interviews, opportunity mapping, and assumption testing.',
        type: 'skill',
        icon: '🔍',
        color: 'from-teal-400 to-cyan-500',
        targetPersonas: ['ic-pm', 'senior-pm'],
        durationWeeks: 6,
        prerequisites: [],
        featured: true,
        modules: [
            {
                id: 'dm-1',
                title: 'Customer Conversations',
                description: 'Learn to have conversations that reveal real customer needs.',
                bookIds: ['mom-test'],
                durationWeeks: 2,
                order: 1
            },
            {
                id: 'dm-2',
                title: 'Continuous Discovery',
                description: 'Build sustainable discovery habits with weekly touchpoints.',
                bookIds: ['continuous-discovery'],
                durationWeeks: 2,
                order: 2
            },
            {
                id: 'dm-3',
                title: 'Rapid Experimentation',
                description: 'Test ideas quickly with sprints and prototypes.',
                bookIds: ['sprint'],
                durationWeeks: 2,
                order: 3
            }
        ]
    },
    {
        id: 'ai-for-pms',
        title: 'AI for Product Managers',
        description: 'Understand AI/ML fundamentals, build AI-first products, and lead in the age of artificial intelligence.',
        type: 'skill',
        icon: '🤖',
        color: 'from-cyan-400 to-blue-500',
        targetPersonas: ['ic-pm', 'senior-pm', 'technical-pm'],
        durationWeeks: 5,
        prerequisites: [],
        featured: true,
        modules: [
            {
                id: 'ai-1',
                title: 'AI/ML Fundamentals',
                description: 'Understand how machine learning systems work from a PM perspective.',
                bookIds: ['designing-ml-systems'],
                durationWeeks: 3,
                order: 1
            },
            {
                id: 'ai-2',
                title: 'Building AI Products',
                description: 'Learn patterns for building AI-first products responsibly.',
                bookIds: ['ai-first-products'],
                durationWeeks: 2,
                order: 2
            }
        ]
    },
    {
        id: 'healthcare-rcm-path',
        title: 'Healthcare RCM Mastery',
        description: 'Deep dive into the healthcare revenue cycle. Understand claims, eligibility, and the healthcare ecosystem.',
        type: 'skill',
        icon: '🏥',
        color: 'from-rose-400 to-pink-500',
        targetPersonas: ['ic-pm', 'senior-pm'],
        durationWeeks: 6,
        prerequisites: [],
        featured: false,
        modules: [
            {
                id: 'rcm-1',
                title: 'RCM Fundamentals',
                description: 'Understand the end-to-end healthcare revenue cycle.',
                bookIds: ['healthcare-rcm-essentials'],
                durationWeeks: 4,
                order: 1
            },
            {
                id: 'rcm-2',
                title: 'Eligibility & Benefits',
                description: 'Deep dive into patient eligibility verification and insurance.',
                bookIds: ['eligibility-verification-guide'],
                durationWeeks: 2,
                order: 2
            }
        ]
    }
];

export const getPathById = (id: string): LearningPath | undefined =>
    LEARNING_PATHS.find(p => p.id === id);

export const getCareerPaths = (): LearningPath[] =>
    LEARNING_PATHS.filter(p => p.type === 'career');

export const getSkillPaths = (): LearningPath[] =>
    LEARNING_PATHS.filter(p => p.type === 'skill');

export const getFeaturedPaths = (): LearningPath[] =>
    LEARNING_PATHS.filter(p => p.featured);

export const getAllPaths = (): LearningPath[] => LEARNING_PATHS;
