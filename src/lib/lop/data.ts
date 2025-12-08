// ═══════════════════════════════════════════════════════════════════════════
// LOP Demo Data
// 12 sessions of product talks with realistic content
// ═══════════════════════════════════════════════════════════════════════════

import type { LOPSession, LOPLearningPath, LOPTopicSuggestion } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// SPEAKERS
// ─────────────────────────────────────────────────────────────────────────────

const SPEAKERS = {
    sarahChen: {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        title: 'Director of Product',
        team: 'Platform',
    },
    eddieSmith: {
        id: 'eddie-smith',
        name: 'Eddie Smith',
        title: 'Principal PM',
        team: 'Platform',
    },
    lisaPark: {
        id: 'lisa-park',
        name: 'Lisa Park',
        title: 'Senior PM',
        team: 'Provider Experience',
    },
    mikeTorres: {
        id: 'mike-torres',
        name: 'Mike Torres',
        title: 'Staff PM',
        team: 'Analytics',
    },
    amyLiu: {
        id: 'amy-liu',
        name: 'Dr. Amy Liu',
        title: 'Healthcare Domain Expert',
        team: 'Strategy',
    },
    jasonKim: {
        id: 'jason-kim',
        name: 'Jason Kim',
        title: 'Principal Engineer',
        team: 'Architecture',
    },
    rachelWong: {
        id: 'rachel-wong',
        name: 'Rachel Wong',
        title: 'UX Research Lead',
        team: 'Design',
    },
    davidMurphy: {
        id: 'david-murphy',
        name: 'David Murphy',
        title: 'VP of Product',
        team: 'Leadership',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS (12 past + 1 upcoming)
// ─────────────────────────────────────────────────────────────────────────────

export const LOP_SESSIONS: LOPSession[] = [
    // UPCOMING SESSION
    {
        id: 'lop-13',
        sessionNumber: 13,
        slug: 'okrs-that-actually-work',
        title: 'OKRs That Actually Work',
        subtitle: 'Why most OKRs fail and what high-performing teams do differently',
        description: 'Why most OKRs fail and what high-performing teams do differently. Real examples from our org, common pitfalls to avoid, and a framework for writing objectives that drive real outcomes.',
        sessionDate: '2025-01-16T19:00:00Z', // Jan 16, 2:00 PM ET
        status: 'upcoming',
        duration: 45,
        speaker: SPEAKERS.sarahChen,
        topics: ['OKRs', 'Goal Setting', 'Strategy', 'Leadership'],
        pillar: 'product-craft',
        difficulty: 'intermediate',
        isFeatured: true,
        isEssential: false,
        viewCount: 0,
        likeCount: 0,
        discussionCount: 0,
    },

    // COMPLETED SESSIONS
    {
        id: 'lop-12',
        sessionNumber: 12,
        slug: 'customer-discovery-at-scale',
        title: 'Customer Discovery at Scale',
        subtitle: 'How to run effective user research with thousands of users',
        description: 'How to run effective user research when you have thousands of users and limited time. Practical frameworks from our team including discovery sprints, async methods, and building a research repository.',
        sessionDate: '2024-12-12T19:00:00Z',
        status: 'completed',
        duration: 52,
        speaker: SPEAKERS.eddieSmith,
        videoUrl: 'https://example.com/video/lop-12',
        thumbnailUrl: '/images/lop/lop-12-thumb.jpg',
        slidesUrl: 'https://example.com/slides/lop-12.pdf',
        notesUrl: 'https://example.com/notes/lop-12',
        chapters: [
            { timestamp: '00:00', seconds: 0, title: 'Introduction & Context' },
            { timestamp: '05:23', seconds: 323, title: 'The Discovery Framework' },
            { timestamp: '15:47', seconds: 947, title: 'Scaling with Limited Resources' },
            { timestamp: '28:12', seconds: 1692, title: 'Real Examples from Our Team' },
            { timestamp: '42:05', seconds: 2525, title: 'Q&A Session' },
        ],
        keyTakeaways: [
            '5 users is often enough for 80% of discovery insights',
            'Batch interviews into "discovery sprints" for efficiency',
            'Use async methods (surveys, Loom videos) to scale',
            'Build a research repository to avoid duplicate work',
        ],
        topics: ['User Research', 'Discovery', 'Scaling', 'Interviews'],
        pillar: 'product-craft',
        difficulty: 'intermediate',
        isFeatured: false,
        isEssential: true,
        viewCount: 234,
        likeCount: 67,
        discussionCount: 8,
        relatedSessionIds: ['lop-8', 'lop-5'],
    },
    {
        id: 'lop-11',
        sessionNumber: 11,
        slug: 'stakeholder-management-masterclass',
        title: 'Stakeholder Management Masterclass',
        subtitle: 'Navigate complex org dynamics with confidence',
        description: 'A comprehensive guide to managing stakeholders at all levels. Learn to identify stakeholder types, build alignment, handle conflicts, and maintain trust even when saying no.',
        sessionDate: '2024-11-14T19:00:00Z',
        status: 'completed',
        duration: 48,
        speaker: SPEAKERS.lisaPark,
        videoUrl: 'https://example.com/video/lop-11',
        chapters: [
            { timestamp: '00:00', seconds: 0, title: 'The Stakeholder Landscape' },
            { timestamp: '08:15', seconds: 495, title: 'Mapping Power & Interest' },
            { timestamp: '20:30', seconds: 1230, title: 'Communication Strategies' },
            { timestamp: '35:00', seconds: 2100, title: 'Handling Difficult Conversations' },
        ],
        keyTakeaways: [
            'Map stakeholders by power vs interest for priority',
            'Over-communicate with high-power stakeholders',
            'Document decisions to avoid revisiting',
            'Build relationships before you need them',
        ],
        topics: ['Stakeholders', 'Communication', 'Leadership', 'Influence'],
        pillar: 'product-craft',
        difficulty: 'intermediate',
        isFeatured: false,
        isEssential: true,
        viewCount: 198,
        likeCount: 54,
        discussionCount: 6,
    },
    {
        id: 'lop-10',
        sessionNumber: 10,
        slug: 'data-informed-vs-data-driven',
        title: 'Data-Informed vs Data-Driven',
        subtitle: 'Finding the right balance for product decisions',
        description: 'The difference between being data-informed and data-driven, when to use each approach, and how to build a culture that uses data effectively without becoming paralyzed by it.',
        sessionDate: '2024-10-17T18:00:00Z',
        status: 'completed',
        duration: 55,
        speaker: SPEAKERS.mikeTorres,
        videoUrl: 'https://example.com/video/lop-10',
        keyTakeaways: [
            'Data-driven = data makes the decision; data-informed = data informs humans who decide',
            'Use data-driven for optimization, data-informed for innovation',
            'Beware of HiPPO (Highest Paid Person\'s Opinion) masquerading as data',
            'Build dashboards that answer questions, not just display metrics',
        ],
        topics: ['Analytics', 'Decision Making', 'Metrics', 'Data'],
        pillar: 'product-craft',
        difficulty: 'intermediate',
        isFeatured: false,
        isEssential: true,
        viewCount: 287,
        likeCount: 78,
        discussionCount: 12,
        relatedSessionIds: ['lop-8'],
    },
    {
        id: 'lop-9',
        sessionNumber: 9,
        slug: 'healthcare-product-fundamentals',
        title: 'Healthcare Product Fundamentals',
        subtitle: 'What every PM needs to know about healthcare',
        description: 'A primer on healthcare industry dynamics for product managers. Covers payers, providers, regulations, and the unique challenges of building products in this space.',
        sessionDate: '2024-09-19T18:00:00Z',
        status: 'completed',
        duration: 60,
        speaker: SPEAKERS.amyLiu,
        videoUrl: 'https://example.com/video/lop-9',
        keyTakeaways: [
            'Healthcare has 4 stakeholders: payers, providers, patients, regulators',
            'HIPAA is a floor, not a ceiling for privacy',
            'Interoperability is the holy grail (and FHIR is the path)',
            'Revenue cycle is complex but understanding it is essential',
        ],
        topics: ['Healthcare', 'Domain', 'Regulations', 'Industry'],
        pillar: 'healthcare',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: true,
        viewCount: 312,
        likeCount: 89,
        discussionCount: 15,
    },
    {
        id: 'lop-8',
        sessionNumber: 8,
        slug: 'writing-prds-that-get-read',
        title: 'Writing PRDs That Get Read',
        subtitle: 'Documentation that drives alignment, not confusion',
        description: 'How to write product requirement documents that people actually read and understand. Templates, examples, and techniques for different audiences.',
        sessionDate: '2024-08-15T18:00:00Z',
        status: 'completed',
        duration: 45,
        speaker: SPEAKERS.sarahChen,
        videoUrl: 'https://example.com/video/lop-8',
        slidesUrl: 'https://example.com/slides/lop-8.pdf',
        resourceLinks: [
            { title: 'PRD Template', url: 'https://example.com/templates/prd', type: 'template' },
            { title: 'One-Pager Template', url: 'https://example.com/templates/one-pager', type: 'template' },
        ],
        keyTakeaways: [
            'Start with the problem, not the solution',
            'Write for your audience (eng vs exec)',
            'Keep it living and versioned',
            'One-pagers for alignment, full PRDs for execution',
        ],
        topics: ['Documentation', 'PRD', 'Communication', 'Writing'],
        pillar: 'product-craft',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: true,
        viewCount: 425,
        likeCount: 112,
        discussionCount: 9,
    },
    {
        id: 'lop-7',
        sessionNumber: 7,
        slug: 'api-design-for-pms',
        title: 'API Design for PMs',
        subtitle: 'What product managers need to know about APIs',
        description: 'A non-technical guide to understanding APIs, making informed decisions about API design, and communicating effectively with engineering teams about API products.',
        sessionDate: '2024-07-18T18:00:00Z',
        status: 'completed',
        duration: 50,
        speaker: SPEAKERS.jasonKim,
        videoUrl: 'https://example.com/video/lop-7',
        keyTakeaways: [
            'APIs are contracts between systems',
            'REST vs GraphQL: use cases and tradeoffs',
            'Versioning strategy matters for partners',
            'Good API docs = developer experience',
        ],
        topics: ['APIs', 'Technical', 'Platform', 'Developer Experience'],
        pillar: 'internal-playbook',
        difficulty: 'intermediate',
        isFeatured: false,
        isEssential: false,
        viewCount: 156,
        likeCount: 41,
        discussionCount: 7,
    },
    {
        id: 'lop-6',
        sessionNumber: 6,
        slug: 'user-research-methods',
        title: 'User Research Methods',
        subtitle: 'Picking the right research method for your question',
        description: 'A comprehensive overview of user research methods, when to use each, and how to combine them for maximum insight. From surveys to ethnography.',
        sessionDate: '2024-06-20T18:00:00Z',
        status: 'completed',
        duration: 55,
        speaker: SPEAKERS.rachelWong,
        videoUrl: 'https://example.com/video/lop-6',
        keyTakeaways: [
            'Match method to question type (behavioral vs attitudinal)',
            'Qualitative for "why", quantitative for "how many"',
            'Combine methods for triangulation',
            'Synthesis is as important as collection',
        ],
        topics: ['User Research', 'Methodology', 'UX', 'Design'],
        pillar: 'product-craft',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: false,
        viewCount: 201,
        likeCount: 56,
        discussionCount: 4,
        relatedSessionIds: ['lop-12'],
    },
    {
        id: 'lop-5',
        sessionNumber: 5,
        slug: 'writing-great-user-stories',
        title: 'Writing Great User Stories',
        subtitle: 'The art of capturing requirements that engineers love',
        description: 'How to write user stories that are clear, testable, and valuable. Includes the classic format, acceptance criteria, edge cases, and common pitfalls.',
        sessionDate: '2024-05-16T18:00:00Z',
        status: 'completed',
        duration: 40,
        speaker: SPEAKERS.mikeTorres,
        videoUrl: 'https://example.com/video/lop-5',
        slidesUrl: 'https://example.com/slides/lop-5.pdf',
        keyTakeaways: [
            'As a [user], I want [goal] so that [benefit]',
            'Acceptance criteria define "done"',
            'Include edge cases and error states',
            'Stories should be independently testable',
        ],
        topics: ['User Stories', 'Agile', 'Requirements', 'Writing'],
        pillar: 'product-craft',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: true,
        viewCount: 389,
        likeCount: 98,
        discussionCount: 11,
    },
    {
        id: 'lop-4',
        sessionNumber: 4,
        slug: 'prioritization-frameworks',
        title: 'Prioritization Frameworks',
        subtitle: 'Making tough tradeoffs with confidence',
        description: 'A tour of popular prioritization frameworks (RICE, ICE, MoSCoW, Kano) and when to use each. Plus tips on building your own framework for your context.',
        sessionDate: '2024-04-18T18:00:00Z',
        status: 'completed',
        duration: 45,
        speaker: SPEAKERS.sarahChen,
        videoUrl: 'https://example.com/video/lop-4',
        slidesUrl: 'https://example.com/slides/lop-4.pdf',
        keyTakeaways: [
            'RICE = Reach × Impact × Confidence / Effort',
            'No framework is perfect; they enable discussion',
            'Combine quantitative and qualitative',
            'Document why, not just what was prioritized',
        ],
        topics: ['Prioritization', 'Strategy', 'Decision Making', 'Frameworks'],
        pillar: 'product-craft',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: true,
        viewCount: 456,
        likeCount: 134,
        discussionCount: 14,
    },
    {
        id: 'lop-3',
        sessionNumber: 3,
        slug: 'product-strategy-101',
        title: 'Product Strategy 101',
        subtitle: 'From vision to roadmap',
        description: 'The fundamentals of product strategy: vision, mission, goals, strategy, roadmap. How they connect and how to communicate each to different audiences.',
        sessionDate: '2024-03-21T18:00:00Z',
        status: 'completed',
        duration: 50,
        speaker: SPEAKERS.davidMurphy,
        videoUrl: 'https://example.com/video/lop-3',
        keyTakeaways: [
            'Vision = where we are going; Strategy = how we will get there',
            'Strategy is about saying no',
            'Roadmap is output of strategy, not input',
            'Communicate strategy constantly',
        ],
        topics: ['Strategy', 'Vision', 'Roadmap', 'Leadership'],
        pillar: 'product-craft',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: true,
        viewCount: 512,
        likeCount: 145,
        discussionCount: 18,
    },
    {
        id: 'lop-2',
        sessionNumber: 2,
        slug: 'intro-to-availity',
        title: 'Intro to Availity',
        subtitle: 'Understanding our products and customers',
        description: 'An overview of Availity\'s product portfolio, key customer segments, and how different products work together. Essential for new PMs.',
        sessionDate: '2024-02-15T19:00:00Z',
        status: 'completed',
        duration: 55,
        speaker: SPEAKERS.lisaPark,
        videoUrl: 'https://example.com/video/lop-2',
        keyTakeaways: [
            'Availity connects payers and providers',
            'Core products: Portal, Essentials, APIs',
            'Key customers: major health plans + providers',
            'Network effect drives value',
        ],
        topics: ['Availity', 'Onboarding', 'Domain', 'Products'],
        pillar: 'internal-playbook',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: false,
        viewCount: 678,
        likeCount: 167,
        discussionCount: 5,
    },
    {
        id: 'lop-1',
        sessionNumber: 1,
        slug: 'what-is-love-of-product',
        title: 'What is Love of Product?',
        subtitle: 'Launching our monthly product community talks',
        description: 'The inaugural LOP session introducing the series, its goals, and how we plan to build a stronger product culture together.',
        sessionDate: '2024-01-18T19:00:00Z',
        status: 'completed',
        duration: 30,
        speaker: SPEAKERS.davidMurphy,
        videoUrl: 'https://example.com/video/lop-1',
        keyTakeaways: [
            'LOP is a monthly space for product craft',
            'Learn from each other across teams',
            'Build a culture of continuous learning',
            'Everyone can contribute and present',
        ],
        topics: ['Culture', 'Community', 'Introduction'],
        pillar: 'internal-playbook',
        difficulty: 'beginner',
        isFeatured: false,
        isEssential: false,
        viewCount: 534,
        likeCount: 189,
        discussionCount: 22,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING PATHS
// ─────────────────────────────────────────────────────────────────────────────

export const LOP_LEARNING_PATHS: LOPLearningPath[] = [
    {
        id: 'path-essentials',
        slug: 'lop-essentials',
        title: 'LOP Essentials',
        description: 'The must-watch sessions for every PM. Covers prioritization, strategy, user stories, PRDs, and stakeholder management.',
        icon: '⭐',
        sessionIds: ['lop-4', 'lop-3', 'lop-5', 'lop-8', 'lop-11'],
        totalDuration: 228, // ~4 hours
        targetAudience: 'All PMs',
        difficulty: 'intermediate',
        isActive: true,
        displayOrder: 1,
    },
    {
        id: 'path-new-pm',
        slug: 'new-pm-starter-pack',
        title: 'New PM Starter Pack',
        description: 'Foundational talks for those new to product. Start here to build your core skills.',
        icon: '🆕',
        sessionIds: ['lop-1', 'lop-2', 'lop-3', 'lop-5'],
        totalDuration: 175, // ~3 hours
        targetAudience: 'New PMs',
        difficulty: 'beginner',
        isActive: true,
        displayOrder: 2,
    },
    {
        id: 'path-advanced',
        slug: 'advanced-craft',
        title: 'Advanced Craft',
        description: 'Deep dives for experienced PMs. Discovery at scale, data decision-making, and stakeholder mastery.',
        icon: '🚀',
        sessionIds: ['lop-12', 'lop-10', 'lop-11'],
        totalDuration: 155, // ~2.5 hours
        targetAudience: 'Experienced PMs',
        difficulty: 'advanced',
        isActive: true,
        displayOrder: 3,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const LOP_TOPIC_SUGGESTIONS: LOPTopicSuggestion[] = [
    {
        id: 'topic-1',
        title: 'Cross-functional alignment strategies',
        description: 'How to get engineering, design, and product on the same page. Practical techniques for running effective cross-functional meetings.',
        submittedBy: { name: 'Mike Torres', email: 'mike.torres@example.com' },
        submittedAt: '2024-12-01T10:00:00Z',
        status: 'under-review',
        upvotes: 23,
        upvotedBy: [],
    },
    {
        id: 'topic-2',
        title: 'Pricing & packaging for PMs',
        description: 'Understanding how pricing decisions get made and the PM role in packaging strategy.',
        submittedBy: { name: 'Sarah Chen', email: 'sarah.chen@example.com' },
        submittedAt: '2024-12-05T14:30:00Z',
        status: 'scheduled',
        upvotes: 18,
        upvotedBy: [],
        scheduledSessionId: undefined, // TBD
    },
    {
        id: 'topic-3',
        title: 'Managing up: Working with execs',
        description: 'Tips for presenting to and influencing leadership. How to manage expectations and build executive trust.',
        submittedBy: { name: 'Lisa Park', email: 'lisa.park@example.com' },
        submittedAt: '2024-12-08T09:15:00Z',
        status: 'submitted',
        upvotes: 15,
        upvotedBy: [],
    },
    {
        id: 'topic-4',
        title: 'AI/ML for product managers',
        description: 'Understanding AI capabilities and limitations for product decisions. When to use ML and when not to.',
        submittedBy: { name: 'Jason Kim', email: 'jason.kim@example.com' },
        submittedAt: '2024-12-07T16:00:00Z',
        status: 'submitted',
        upvotes: 12,
        upvotedBy: [],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getNextSession = (): LOPSession | undefined =>
    LOP_SESSIONS.find(s => s.status === 'upcoming');

export const getRecentSessions = (count = 3): LOPSession[] =>
    LOP_SESSIONS
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
        .slice(0, count);

export const getSessionBySlug = (slug: string): LOPSession | undefined =>
    LOP_SESSIONS.find(s => s.slug === slug);

export const getSessionById = (id: string): LOPSession | undefined =>
    LOP_SESSIONS.find(s => s.id === id);

export const getPathBySlug = (slug: string): LOPLearningPath | undefined =>
    LOP_LEARNING_PATHS.find(p => p.slug === slug);

export const getSessionsForPath = (path: LOPLearningPath): LOPSession[] =>
    path.sessionIds.map(id => getSessionById(id)).filter(Boolean) as LOPSession[];

export const getAllTopics = (): string[] => {
    const topics = new Set<string>();
    LOP_SESSIONS.forEach(s => s.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
};

export const getAllSpeakers = (): string[] => {
    const speakers = new Set<string>();
    LOP_SESSIONS.forEach(s => speakers.add(s.speaker.name));
    return Array.from(speakers).sort();
};
