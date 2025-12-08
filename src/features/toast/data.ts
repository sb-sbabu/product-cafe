/**
 * Café TOAST - Demo Data
 * Company Values, Awards, Badges, and Sample Recognitions
 */

import type {
    CompanyValue,
    ValueDefinition,
    Award,
    AwardType,
    Badge,
    MilestoneBadge,
    Recognition,
    ToastUser,
    ToastImage,
    ImageCategory,
    ReactionType,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// COMPANY VALUES (6 Core Values)
// ═══════════════════════════════════════════════════════════════════════════

export const COMPANY_VALUES: Record<CompanyValue, ValueDefinition> = {
    DO_IT_DIFFERENTLY: {
        id: 'DO_IT_DIFFERENTLY',
        name: 'We Do It Differently',
        shortName: 'Do It Differently',
        description: 'We question assumptions, redefine the industry standard, and create unexpected solutions using a holistic perspective and bold approach.',
        icon: '🚀',
        color: '#845EC2',
        gradient: 'from-purple-500 to-indigo-600',
        awardName: 'The Maverick',
        awardIcon: '🎨',
        behaviors: [
            'Challenged the status quo',
            'Proposed an unconventional solution',
            'Brought a fresh perspective that changed thinking',
            'Took a bold risk that paid off',
            'Questioned "the way we\'ve always done it"',
        ],
    },
    HEALTHCARE_IS_PERSONAL: {
        id: 'HEALTHCARE_IS_PERSONAL',
        name: 'Healthcare Is Personal',
        shortName: 'Healthcare Is Personal',
        description: 'We consider patient experience in every decision we make, and we connect the dots between payers and providers.',
        icon: '💜',
        color: '#FF6B6B',
        gradient: 'from-rose-400 to-pink-500',
        awardName: 'The Heartbeat',
        awardIcon: '💗',
        behaviors: [
            'Put the patient at the center of a decision',
            'Went beyond the requirement to improve patient experience',
            'Connected payer-provider dots in a meaningful way',
            'Showed deep empathy in their work',
            'Made healthcare less confusing for real people',
        ],
    },
    BE_ALL_IN: {
        id: 'BE_ALL_IN',
        name: 'Be All In',
        shortName: 'Be All In',
        description: 'We work across silos and embrace diverse perspectives to tackle hard problems head-on — together. One Team. One Mission. One Availity.',
        icon: '🤝',
        color: '#FFD93D',
        gradient: 'from-amber-400 to-yellow-500',
        awardName: 'The Bridge Builder',
        awardIcon: '🌟',
        behaviors: [
            'Broke down silos to bring teams together',
            'Volunteered to help outside their area',
            'Embraced a perspective different from their own',
            'Demonstrated exceptional teamwork',
            'Put collective success above personal recognition',
        ],
    },
    OWN_THE_OUTCOME: {
        id: 'OWN_THE_OUTCOME',
        name: 'Own The Outcome',
        shortName: 'Own The Outcome',
        description: '"If not us, then who?" Regardless of our role, we each own the impact on customers, colleagues, and patients.',
        icon: '🎯',
        color: '#D4A574',
        gradient: 'from-amber-600 to-orange-700',
        awardName: 'The Owner',
        awardIcon: '🦁',
        behaviors: [
            'Took full responsibility without being asked',
            'Saw something broken and fixed it',
            'Didn\'t pass the buck when things got hard',
            'Delivered impact beyond their job description',
            'Asked "if not me, then who?"',
        ],
    },
    DO_THE_RIGHT_THING: {
        id: 'DO_THE_RIGHT_THING',
        name: 'Do The Right Thing',
        shortName: 'Do The Right Thing',
        description: 'When we say we are going to do something, we do it with the highest integrity. We earn trust and protect our customers, patients, and each other.',
        icon: '⚖️',
        color: '#4B7BEC',
        gradient: 'from-blue-500 to-indigo-600',
        awardName: 'The Guardian',
        awardIcon: '🛡️',
        behaviors: [
            'Spoke up when something wasn\'t right',
            'Kept their word even when it was hard',
            'Protected customer/patient interests',
            'Chose integrity over the easy path',
            'Demonstrated trustworthiness in a visible way',
        ],
    },
    EXPLORE_FEARLESSLY: {
        id: 'EXPLORE_FEARLESSLY',
        name: 'Explore Fearlessly',
        shortName: 'Explore Fearlessly',
        description: 'We stay curious and don\'t rest on our laurels. Our passion for continuous learning and data-driven insights gives us the knowledge to create market-leading innovation.',
        icon: '🔭',
        color: '#6BCB77',
        gradient: 'from-emerald-500 to-teal-600',
        awardName: 'The Explorer',
        awardIcon: '🚀',
        behaviors: [
            'Learned something new and shared it',
            'Experimented with a new approach',
            'Used data to discover unexpected insights',
            'Pushed boundaries of what\'s possible',
            'Stayed curious when others were content',
        ],
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// AWARDS
// ═══════════════════════════════════════════════════════════════════════════

export const AWARDS: Record<AwardType, Award> = {
    // Value Awards
    MAVERICK: {
        type: 'MAVERICK',
        name: 'The Maverick',
        description: 'For challenging assumptions, bold approaches, and unexpected solutions',
        icon: '🎨',
        color: '#845EC2',
        value: 'DO_IT_DIFFERENTLY',
        isSpecial: false,
    },
    HEARTBEAT: {
        type: 'HEARTBEAT',
        name: 'The Heartbeat',
        description: 'For patient-centered decisions, empathy, and connecting payers & providers',
        icon: '💗',
        color: '#FF6B6B',
        value: 'HEALTHCARE_IS_PERSONAL',
        isSpecial: false,
    },
    BRIDGE_BUILDER: {
        type: 'BRIDGE_BUILDER',
        name: 'The Bridge Builder',
        description: 'For exceptional cross-team collaboration and One Team spirit',
        icon: '🌟',
        color: '#FFD93D',
        value: 'BE_ALL_IN',
        isSpecial: false,
    },
    OWNER: {
        type: 'OWNER',
        name: 'The Owner',
        description: 'For taking responsibility, \"if not me, who?\", and driving to results',
        icon: '🦁',
        color: '#D4A574',
        value: 'OWN_THE_OUTCOME',
        isSpecial: false,
    },
    GUARDIAN: {
        type: 'GUARDIAN',
        name: 'The Guardian',
        description: 'For integrity, speaking up, and protecting customers & patients',
        icon: '🛡️',
        color: '#4B7BEC',
        value: 'DO_THE_RIGHT_THING',
        isSpecial: false,
    },
    EXPLORER: {
        type: 'EXPLORER',
        name: 'The Explorer',
        description: 'For learning, curiosity, innovation, and data-driven insights',
        icon: '🚀',
        color: '#6BCB77',
        value: 'EXPLORE_FEARLESSLY',
        isSpecial: false,
    },
    // Special Awards
    TOAST_OF_THE_MONTH: {
        type: 'TOAST_OF_THE_MONTH',
        name: 'Toast of the Month',
        description: 'Most impactful recognition of the month',
        icon: '⭐',
        color: '#FF9F43',
        isSpecial: true,
    },
    VALUES_CHAMPION: {
        type: 'VALUES_CHAMPION',
        name: 'Values Champion',
        description: 'Received awards across all 6 company values',
        icon: '🌈',
        color: '#A55EEA',
        isSpecial: true,
    },
    GRATITUDE_GURU: {
        type: 'GRATITUDE_GURU',
        name: 'Gratitude Guru',
        description: 'Given 50+ recognitions to others',
        icon: '🎁',
        color: '#FC5C65',
        isSpecial: true,
    },
    QUARTERLY_GEM: {
        type: 'QUARTERLY_GEM',
        name: 'Quarterly Gem',
        description: 'Leadership-selected exceptional contributor',
        icon: '💎',
        color: '#45AAF2',
        isSpecial: true,
    },
    SUNSHINE_AWARD: {
        type: 'SUNSHINE_AWARD',
        name: 'Sunshine Award',
        description: 'For consistently bringing positivity and lifting others up',
        icon: '🌻',
        color: '#FED330',
        isSpecial: true,
    },
    BULLSEYE: {
        type: 'BULLSEYE',
        name: 'Bullseye',
        description: 'For exceptional precision and quality in work',
        icon: '🎯',
        color: '#EB3B5A',
        isSpecial: true,
    },
    PUZZLE_MASTER: {
        type: 'PUZZLE_MASTER',
        name: 'Puzzle Master',
        description: 'For solving complex, seemingly impossible problems',
        icon: '🧩',
        color: '#8854D0',
        isSpecial: true,
    },
    MENTOR_STAR: {
        type: 'MENTOR_STAR',
        name: 'Mentor Star',
        description: 'For exceptional guidance and support of others\' growth',
        icon: '🎓',
        color: '#20BF6B',
        isSpecial: true,
    },
    FIRE_STARTER: {
        type: 'FIRE_STARTER',
        name: 'Fire Starter',
        description: 'For igniting new initiatives that gained momentum',
        icon: '🔥',
        color: '#FA8231',
        isSpecial: true,
    },
    CALM_IN_THE_STORM: {
        type: 'CALM_IN_THE_STORM',
        name: 'Calm In The Storm',
        description: 'For exceptional composure and leadership during crisis',
        icon: '🌊',
        color: '#2D98DA',
        isSpecial: true,
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE BADGES
// ═══════════════════════════════════════════════════════════════════════════

export const BADGES: Record<MilestoneBadge, Badge> = {
    // Giving Milestones
    TOAST_DEBUT: { type: 'TOAST_DEBUT', name: 'Toast Debut', description: 'First recognition given', icon: '🌱', requirement: 1, category: 'giving' },
    GRATEFUL_DOZEN: { type: 'GRATEFUL_DOZEN', name: 'Grateful Dozen', description: '12 recognitions given', icon: '🌿', requirement: 12, category: 'giving' },
    TOAST_TREE: { type: 'TOAST_TREE', name: 'Toast Tree', description: '50 recognitions given', icon: '🌳', requirement: 50, category: 'giving' },
    MOUNTAIN_TOP: { type: 'MOUNTAIN_TOP', name: 'Mountain Top', description: '100 recognitions given', icon: '🏔️', requirement: 100, category: 'giving' },
    // Receiving Milestones
    FIRST_TOAST: { type: 'FIRST_TOAST', name: 'First Toast', description: 'First recognition received', icon: '✨', requirement: 1, category: 'receiving' },
    RISING_STAR: { type: 'RISING_STAR', name: 'Rising Star', description: '10 recognitions received', icon: '💫', requirement: 10, category: 'receiving' },
    STAR_QUALITY: { type: 'STAR_QUALITY', name: 'Star Quality', description: '25 recognitions received', icon: '🌟', requirement: 25, category: 'receiving' },
    CONSTELLATION: { type: 'CONSTELLATION', name: 'Constellation', description: '50 recognitions received', icon: '⭐', requirement: 50, category: 'receiving' },
    GALAXY: { type: 'GALAXY', name: 'Galaxy', description: '100 recognitions received', icon: '🌌', requirement: 100, category: 'receiving' },
    // Anniversary
    YEAR_ONE: { type: 'YEAR_ONE', name: 'Year One', description: '1 year work anniversary', icon: '🎂', requirement: 1, category: 'anniversary' },
    TRIPLE: { type: 'TRIPLE', name: 'Triple', description: '3 year work anniversary', icon: '🎊', requirement: 3, category: 'anniversary' },
    HALF_DECADE: { type: 'HALF_DECADE', name: 'Half Decade', description: '5 year work anniversary', icon: '🏆', requirement: 5, category: 'anniversary' },
    DIAMOND: { type: 'DIAMOND', name: 'Diamond', description: '10 year work anniversary', icon: '💎', requirement: 10, category: 'anniversary' },
};

// ═══════════════════════════════════════════════════════════════════════════
// REACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
    { type: 'applause', emoji: '👏', label: 'Applause' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { type: 'love', emoji: '💜', label: 'Love' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'star', emoji: '⭐', label: 'Star' },
    { type: 'praise', emoji: '🙌', label: 'Praise' },
    { type: 'strong', emoji: '💪', label: 'Strong' },
    { type: 'magic', emoji: '✨', label: 'Magic' },
    { type: 'rocket', emoji: '🚀', label: 'Rocket' },
    { type: 'brilliant', emoji: '💡', label: 'Brilliant' },
    { type: 'shine', emoji: '🌟', label: 'Shine' },
    { type: 'gem', emoji: '💎', label: 'Gem' },
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPERT AREAS
// ═══════════════════════════════════════════════════════════════════════════

export const EXPERT_AREAS = [
    { id: 'claims', name: 'Claims Processing' },
    { id: 'eligibility', name: 'Eligibility & Benefits' },
    { id: 'prior-auth', name: 'Prior Authorization' },
    { id: 'remittance', name: 'Remittance Advice' },
    { id: 'api-integration', name: 'API Integration' },
    { id: 'fhir', name: 'FHIR/HL7' },
    { id: 'security', name: 'Security & Compliance' },
    { id: 'ux-design', name: 'UX Design' },
    { id: 'data-analytics', name: 'Data Analytics' },
    { id: 'payer-relations', name: 'Payer Relations' },
    { id: 'provider-support', name: 'Provider Support' },
    { id: 'product-strategy', name: 'Product Strategy' },
    { id: 'devops', name: 'DevOps' },
    { id: 'frontend', name: 'Frontend Development' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'ai-ml', name: 'AI/ML' },
];

// ═══════════════════════════════════════════════════════════════════════════
// DEMO USERS
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_USERS: ToastUser[] = [
    {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@availity.com',
        avatar: undefined,
        title: 'Senior Software Engineer',
        team: 'Claims Platform',
        department: 'Engineering',
        managerId: 'user-10',
        credits: 450,
        creditsThisMonth: 85,
        recognitionsGiven: 23,
        recognitionsReceived: 18,
        expertAreas: [
            { id: 'claims', name: 'Claims Processing', score: 180 },
            { id: 'api-integration', name: 'API Integration', score: 140 },
            { id: 'backend', name: 'Backend Development', score: 120 },
        ],
        earnedBadges: [
            { badge: 'FIRST_TOAST', earnedAt: '2024-03-15T10:00:00Z' },
            { badge: 'RISING_STAR', earnedAt: '2024-06-01T14:30:00Z' },
            { badge: 'TOAST_DEBUT', earnedAt: '2024-02-20T09:00:00Z' },
            { badge: 'GRATEFUL_DOZEN', earnedAt: '2024-08-10T11:00:00Z' },
        ],
        earnedAwards: [
            { award: 'BRIDGE_BUILDER', recognitionId: 'rec-1', earnedAt: '2024-10-15T16:00:00Z' },
        ],
        valuesCounts: {
            DO_IT_DIFFERENTLY: 3,
            HEALTHCARE_IS_PERSONAL: 2,
            BE_ALL_IN: 8,
            OWN_THE_OUTCOME: 3,
            DO_THE_RIGHT_THING: 1,
            EXPLORE_FEARLESSLY: 1,
        },
        dailyQuickToasts: 1,
        dailyStandingOvations: 0,
        lastRecognitionReset: new Date().toISOString().split('T')[0],
        recentRecipients: [],
        joinedAt: '2022-06-15T09:00:00Z',
        lastActiveAt: new Date().toISOString(),
    },
    {
        id: 'user-2',
        name: 'Raj Patel',
        email: 'raj.patel@availity.com',
        avatar: undefined,
        title: 'Staff Engineer',
        team: 'Eligibility Services',
        department: 'Engineering',
        managerId: 'user-10',
        credits: 620,
        creditsThisMonth: 120,
        recognitionsGiven: 35,
        recognitionsReceived: 28,
        expertAreas: [
            { id: 'eligibility', name: 'Eligibility & Benefits', score: 220 },
            { id: 'fhir', name: 'FHIR/HL7', score: 180 },
            { id: 'devops', name: 'DevOps', score: 90 },
        ],
        earnedBadges: [
            { badge: 'FIRST_TOAST', earnedAt: '2023-01-10T10:00:00Z' },
            { badge: 'RISING_STAR', earnedAt: '2023-05-01T14:30:00Z' },
            { badge: 'STAR_QUALITY', earnedAt: '2024-02-15T11:00:00Z' },
            { badge: 'TOAST_DEBUT', earnedAt: '2023-01-05T09:00:00Z' },
            { badge: 'GRATEFUL_DOZEN', earnedAt: '2023-06-20T11:00:00Z' },
            { badge: 'TOAST_TREE', earnedAt: '2024-11-01T16:00:00Z' },
        ],
        earnedAwards: [
            { award: 'BRIDGE_BUILDER', recognitionId: 'rec-1', earnedAt: '2024-10-15T16:00:00Z' },
            { award: 'EXPLORER', recognitionId: 'rec-5', earnedAt: '2024-08-20T14:00:00Z' },
        ],
        valuesCounts: {
            DO_IT_DIFFERENTLY: 4,
            HEALTHCARE_IS_PERSONAL: 3,
            BE_ALL_IN: 12,
            OWN_THE_OUTCOME: 5,
            DO_THE_RIGHT_THING: 2,
            EXPLORE_FEARLESSLY: 2,
        },
        dailyQuickToasts: 0,
        dailyStandingOvations: 0,
        lastRecognitionReset: new Date().toISOString().split('T')[0],
        recentRecipients: [],
        joinedAt: '2021-03-01T09:00:00Z',
        lastActiveAt: new Date().toISOString(),
    },
    {
        id: 'user-3',
        name: 'Jennifer Martinez',
        email: 'jennifer.martinez@availity.com',
        avatar: undefined,
        title: 'Product Manager',
        team: 'Platform Products',
        department: 'Product',
        managerId: 'user-11',
        credits: 380,
        creditsThisMonth: 65,
        recognitionsGiven: 42,
        recognitionsReceived: 15,
        expertAreas: [
            { id: 'product-strategy', name: 'Product Strategy', score: 200 },
            { id: 'payer-relations', name: 'Payer Relations', score: 150 },
            { id: 'ux-design', name: 'UX Design', score: 80 },
        ],
        earnedBadges: [
            { badge: 'FIRST_TOAST', earnedAt: '2024-01-15T10:00:00Z' },
            { badge: 'RISING_STAR', earnedAt: '2024-09-01T14:30:00Z' },
            { badge: 'TOAST_DEBUT', earnedAt: '2023-12-10T09:00:00Z' },
            { badge: 'GRATEFUL_DOZEN', earnedAt: '2024-03-15T11:00:00Z' },
            { badge: 'TOAST_TREE', earnedAt: '2024-10-20T16:00:00Z' },
        ],
        earnedAwards: [
            { award: 'GRATITUDE_GURU', recognitionId: 'auto', earnedAt: '2024-10-20T16:00:00Z' },
        ],
        valuesCounts: {
            DO_IT_DIFFERENTLY: 2,
            HEALTHCARE_IS_PERSONAL: 5,
            BE_ALL_IN: 4,
            OWN_THE_OUTCOME: 2,
            DO_THE_RIGHT_THING: 1,
            EXPLORE_FEARLESSLY: 1,
        },
        dailyQuickToasts: 2,
        dailyStandingOvations: 1,
        lastRecognitionReset: new Date().toISOString().split('T')[0],
        recentRecipients: [],
        joinedAt: '2023-08-01T09:00:00Z',
        lastActiveAt: new Date().toISOString(),
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// DEMO RECOGNITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_RECOGNITIONS: Recognition[] = [
    {
        id: 'rec-1',
        type: 'STANDING_OVATION',
        giverId: 'user-3',
        giverName: 'Jennifer Martinez',
        giverTitle: 'Product Manager',
        recipientIds: ['user-1', 'user-2'],
        recipients: [
            { id: 'user-1', name: 'Sarah Chen', title: 'Senior Software Engineer', team: 'Claims Platform' },
            { id: 'user-2', name: 'Raj Patel', title: 'Staff Engineer', team: 'Eligibility Services' },
        ],
        value: 'BE_ALL_IN',
        expertAreas: ['claims', 'api-integration', 'eligibility'],
        message: 'When the Claims team was drowning during the Q3 migration, Sarah and Raj didn\'t wait for permission. They assembled a strike team from Engineering, worked through the entire weekend, and helped us deliver on time. This is what "One Team, One Mission" means in action.',
        impact: 'Migration completed on schedule, avoiding $500K penalty clause. Customer relationship strengthened. Team morale boosted seeing leadership in action.',
        imageId: 'img-puzzle-complete',
        award: 'BRIDGE_BUILDER',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        reactions: [
            { type: 'love', userId: 'user-4', userName: 'Mike Torres', createdAt: new Date().toISOString() },
            { type: 'applause', userId: 'user-5', userName: 'Lisa Wong', createdAt: new Date().toISOString() },
            { type: 'fire', userId: 'user-6', userName: 'David Kim', createdAt: new Date().toISOString() },
        ],
        comments: [
            {
                id: 'comment-1',
                userId: 'user-4',
                userName: 'Mike Torres',
                userTitle: 'Claims Team Lead',
                content: 'This is what One Availity means! 🙌',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                reactions: [
                    { type: 'love', userId: 'user-7', userName: 'Alex Johnson', createdAt: new Date().toISOString() },
                ],
                mentions: [],
            },
            {
                id: 'comment-2',
                userId: 'user-5',
                userName: 'Lisa Wong',
                userTitle: 'Director, Engineering',
                content: 'Couldn\'t have done it without you two!',
                createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                reactions: [],
                mentions: [],
            },
        ],
        reposts: 5,
        bookmarks: 12,
        isPrivate: false,
        notifyManagers: true,
        nominatedForMonthly: true,
        chainDepth: 0,
    },
    {
        id: 'rec-2',
        type: 'QUICK_TOAST',
        giverId: 'user-6',
        giverName: 'David Kim',
        giverTitle: 'Senior Engineer',
        recipientIds: ['user-7'],
        recipients: [
            { id: 'user-7', name: 'Priya Sharma', title: 'Business Analyst', team: 'Regulatory' },
        ],
        value: 'EXPLORE_FEARLESSLY',
        expertAreas: ['data-analytics', 'security'],
        message: 'Your deep dive into the new CMS rule saved me hours of research. Thanks for sharing your findings with the whole team!',
        imageId: 'img-virtual-high-five',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
        reactions: [
            { type: 'love', userId: 'user-1', userName: 'Sarah Chen', createdAt: new Date().toISOString() },
            { type: 'brilliant', userId: 'user-3', userName: 'Jennifer Martinez', createdAt: new Date().toISOString() },
        ],
        comments: [],
        reposts: 1,
        bookmarks: 3,
        isPrivate: false,
        notifyManagers: false,
        nominatedForMonthly: false,
        chainDepth: 0,
    },
    {
        id: 'rec-3',
        type: 'QUICK_TOAST',
        giverId: 'user-1',
        giverName: 'Sarah Chen',
        giverTitle: 'Senior Software Engineer',
        recipientIds: ['user-8'],
        recipients: [
            { id: 'user-8', name: 'Marcus Williams', title: 'QA Lead', team: 'Quality Assurance' },
        ],
        value: 'OWN_THE_OUTCOME',
        expertAreas: ['security'],
        message: 'Marcus caught a critical security issue in the PR review that we all missed. His attention to detail prevented a potential breach. True ownership! 🛡️',
        imageId: 'img-lighthouse',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        reactions: [
            { type: 'strong', userId: 'user-2', userName: 'Raj Patel', createdAt: new Date().toISOString() },
            { type: 'star', userId: 'user-3', userName: 'Jennifer Martinez', createdAt: new Date().toISOString() },
        ],
        comments: [
            {
                id: 'comment-3',
                userId: 'user-10',
                userName: 'Director Engineering',
                userTitle: 'Director of Engineering',
                content: 'This is exactly the kind of vigilance we need. Great catch, Marcus!',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                reactions: [],
                mentions: [],
            },
        ],
        reposts: 2,
        bookmarks: 8,
        isPrivate: false,
        notifyManagers: true,
        nominatedForMonthly: false,
        chainDepth: 0,
    },
    {
        id: 'rec-4',
        type: 'TEAM_TOAST',
        giverId: 'user-10',
        giverName: 'Alex Director',
        giverTitle: 'Director of Engineering',
        recipientIds: ['user-1', 'user-2', 'user-6', 'user-8', 'user-9'],
        recipients: [
            { id: 'user-1', name: 'Sarah Chen', title: 'Senior Software Engineer', team: 'Claims Platform' },
            { id: 'user-2', name: 'Raj Patel', title: 'Staff Engineer', team: 'Eligibility Services' },
            { id: 'user-6', name: 'David Kim', title: 'Senior Engineer', team: 'API Platform' },
            { id: 'user-8', name: 'Marcus Williams', title: 'QA Lead', team: 'Quality Assurance' },
            { id: 'user-9', name: 'Emily Rodriguez', title: 'DevOps Engineer', team: 'Platform Ops' },
        ],
        value: 'DO_IT_DIFFERENTLY',
        expertAreas: ['devops', 'api-integration', 'backend'],
        message: 'The API Platform team completely reimagined our deployment pipeline. What used to take 4 hours now takes 12 minutes. This is innovation at its finest!',
        impact: '95% reduction in deployment time. Zero-downtime releases now possible. Developer satisfaction scores up 40%.',
        imageId: 'img-rocket-launch',
        award: 'MAVERICK',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        reactions: [
            { type: 'rocket', userId: 'user-3', userName: 'Jennifer Martinez', createdAt: new Date().toISOString() },
            { type: 'fire', userId: 'user-7', userName: 'Priya Sharma', createdAt: new Date().toISOString() },
            { type: 'celebrate', userId: 'user-11', userName: 'VP Product', createdAt: new Date().toISOString() },
        ],
        comments: [],
        reposts: 15,
        bookmarks: 25,
        isPrivate: false,
        notifyManagers: true,
        nominatedForMonthly: true,
        chainDepth: 0,
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// TOAST IMAGES (Nana Banana Pro Style Placeholders)
// ═══════════════════════════════════════════════════════════════════════════

export const TOAST_IMAGES: ToastImage[] = [
    // Celebration
    { id: 'img-confetti-moment', name: 'Confetti Moment', description: 'Person with arms raised, colorful confetti falling', category: 'CELEBRATION', recommendedValues: ['DO_IT_DIFFERENTLY', 'OWN_THE_OUTCOME'], mood: ['triumph', 'joy', 'celebration'], altText: 'Person celebrating with colorful confetti', thumbnailUrl: '/images/toast/celebration-confetti.png', fullUrl: '/images/toast/celebration-confetti.png', usageCount: 45 },
    { id: 'img-virtual-high-five', name: 'Virtual High Five', description: 'Two diverse hands meeting in high-five with sparkles', category: 'CELEBRATION', recommendedValues: ['BE_ALL_IN'], mood: ['collaboration', 'quick-win', 'partnership'], altText: 'Two hands in high-five with sparkles', thumbnailUrl: '/images/toast/celebration-highfive.png', fullUrl: '/images/toast/celebration-highfive.png', usageCount: 82 },
    { id: 'img-standing-ovation', name: 'Standing Ovation', description: 'Small crowd clapping with hearts floating up', category: 'CELEBRATION', recommendedValues: ['BE_ALL_IN', 'OWN_THE_OUTCOME'], mood: ['public-recognition', 'community'], altText: 'Crowd applauding', thumbnailUrl: '/images/toast/celebration-ovation.png', fullUrl: '/images/toast/celebration-ovation.png', usageCount: 38 },
    { id: 'img-trophy-moment', name: 'Trophy Moment', description: 'Golden trophy with soft glow and laurel leaves', category: 'CELEBRATION', recommendedValues: ['OWN_THE_OUTCOME'], mood: ['achievement', 'excellence'], altText: 'Golden trophy with laurel leaves', thumbnailUrl: '/images/toast/celebration-trophy.png', fullUrl: '/images/toast/celebration-trophy.png', usageCount: 29 },
    { id: 'img-sunrise-celebration', name: 'Sunrise Celebration', description: 'Silhouette on mountain peak at golden sunrise', category: 'CELEBRATION', recommendedValues: ['OWN_THE_OUTCOME', 'EXPLORE_FEARLESSLY'], mood: ['accomplishment', 'perseverance'], altText: 'Person on mountain at sunrise', thumbnailUrl: '/images/toast/celebration-sunrise.png', fullUrl: '/images/toast/celebration-sunrise.png', usageCount: 21 },
    // Teamwork
    { id: 'img-puzzle-complete', name: 'Puzzle Complete', description: 'Final puzzle piece being placed by multiple hands', category: 'TEAMWORK', recommendedValues: ['BE_ALL_IN'], mood: ['collaboration', 'unity'], altText: 'Hands completing puzzle together', thumbnailUrl: '/images/toast/teamwork-puzzle.png', fullUrl: '/images/toast/teamwork-puzzle.png', usageCount: 67 },
    { id: 'img-bridge-of-hands', name: 'Bridge of Hands', description: 'Diverse hands forming bridge with person crossing', category: 'TEAMWORK', recommendedValues: ['BE_ALL_IN', 'HEALTHCARE_IS_PERSONAL'], mood: ['support', 'connection'], altText: 'Hands forming supportive bridge', thumbnailUrl: '/images/toast/teamwork-bridge.png', fullUrl: '/images/toast/teamwork-bridge.png', usageCount: 54 },
    { id: 'img-team-huddle', name: 'Team Huddle', description: 'Circle of diverse people hands joined from above', category: 'TEAMWORK', recommendedValues: ['BE_ALL_IN'], mood: ['unity', 'team-spirit'], altText: 'Team with joined hands from above', thumbnailUrl: '/images/toast/teamwork-huddle.png', fullUrl: '/images/toast/teamwork-huddle.png', usageCount: 43 },
    { id: 'img-rowing-together', name: 'Rowing Together', description: 'Team rowing boat in sync toward finish line', category: 'TEAMWORK', recommendedValues: ['BE_ALL_IN'], mood: ['momentum', 'shared-goal'], altText: 'Team rowing together', thumbnailUrl: '/images/toast/teamwork-rowing.png', fullUrl: '/images/toast/teamwork-rowing.png', usageCount: 31 },
    // Innovation
    { id: 'img-lightbulb-moment', name: 'Lightbulb Moment', description: 'Person with illuminating lightbulb above head', category: 'INNOVATION', recommendedValues: ['DO_IT_DIFFERENTLY', 'EXPLORE_FEARLESSLY'], mood: ['innovation', 'breakthrough'], altText: 'Person with lightbulb idea', thumbnailUrl: '/images/toast/innovation-lightbulb.png', fullUrl: '/images/toast/innovation-lightbulb.png', usageCount: 56 },
    { id: 'img-rocket-launch', name: 'Rocket Launch', description: 'Colorful rocket launching with trail of stars', category: 'INNOVATION', recommendedValues: ['EXPLORE_FEARLESSLY', 'DO_IT_DIFFERENTLY'], mood: ['bold-moves', 'ambition'], altText: 'Rocket launching into stars', thumbnailUrl: '/images/toast/innovation-rocket.png', fullUrl: '/images/toast/innovation-rocket.png', usageCount: 48 },
    { id: 'img-breaking-mold', name: 'Breaking the Mold', description: 'Figure emerging from cracked box with butterfly wings', category: 'INNOVATION', recommendedValues: ['DO_IT_DIFFERENTLY'], mood: ['transformation', 'challenge'], altText: 'Figure breaking free with wings', thumbnailUrl: '/images/toast/innovation-break.png', fullUrl: '/images/toast/innovation-break.png', usageCount: 35 },
    { id: 'img-curiosity-compass', name: 'Curiosity Compass', description: 'Whimsical compass with heart needle and map', category: 'INNOVATION', recommendedValues: ['EXPLORE_FEARLESSLY'], mood: ['discovery', 'learning'], altText: 'Compass pointing to unexplored territory', thumbnailUrl: '/images/toast/innovation-compass.png', fullUrl: '/images/toast/innovation-compass.png', usageCount: 27 },
    // Care
    { id: 'img-healing-hands', name: 'Healing Hands', description: 'Gentle hands cupping a glowing heart', category: 'CARE', recommendedValues: ['HEALTHCARE_IS_PERSONAL'], mood: ['compassion', 'care'], altText: 'Hands holding glowing heart', thumbnailUrl: '/images/toast/care-healing.png', fullUrl: '/images/toast/care-healing.png', usageCount: 41 },
    { id: 'img-connected-care', name: 'Connected Care', description: 'Network of hearts connected by gentle lines', category: 'CARE', recommendedValues: ['HEALTHCARE_IS_PERSONAL', 'BE_ALL_IN'], mood: ['connection', 'ecosystem'], altText: 'Network of connected hearts', thumbnailUrl: '/images/toast/care-connected.png', fullUrl: '/images/toast/care-connected.png', usageCount: 33 },
    { id: 'img-empathy-embrace', name: 'Empathy Embrace', description: 'Two figures in supportive side-hug with warm glow', category: 'CARE', recommendedValues: ['HEALTHCARE_IS_PERSONAL', 'BE_ALL_IN'], mood: ['understanding', 'support'], altText: 'Two figures embracing supportively', thumbnailUrl: '/images/toast/care-embrace.png', fullUrl: '/images/toast/care-embrace.png', usageCount: 25 },
    // Integrity
    { id: 'img-standing-strong', name: 'Standing Strong', description: 'Figure standing firm with deep roots like a tree', category: 'INTEGRITY', recommendedValues: ['DO_THE_RIGHT_THING'], mood: ['integrity', 'steadfast'], altText: 'Person standing strong like a tree', thumbnailUrl: '/images/toast/integrity-strong.png', fullUrl: '/images/toast/integrity-strong.png', usageCount: 22 },
    { id: 'img-lighthouse', name: 'Lighthouse', description: 'Warm lighthouse beam cutting through fog', category: 'INTEGRITY', recommendedValues: ['DO_THE_RIGHT_THING', 'OWN_THE_OUTCOME'], mood: ['guidance', 'reliability'], altText: 'Lighthouse guiding through fog', thumbnailUrl: '/images/toast/integrity-lighthouse.png', fullUrl: '/images/toast/integrity-lighthouse.png', usageCount: 38 },
    { id: 'img-ownership-crown', name: 'Ownership Crown', description: 'Figure wearing crown of responsibility symbols', category: 'INTEGRITY', recommendedValues: ['OWN_THE_OUTCOME'], mood: ['accountability', 'leadership'], altText: 'Person with crown of keys', thumbnailUrl: '/images/toast/integrity-crown.png', fullUrl: '/images/toast/integrity-crown.png', usageCount: 19 },
    // Gratitude
    { id: 'img-thank-you-garden', name: 'Thank You Garden', description: 'Beautiful garden where each flower is a thank you', category: 'GRATITUDE', recommendedValues: [], mood: ['gratitude', 'nurturing'], altText: 'Garden of thank you flowers', thumbnailUrl: '/images/toast/gratitude-garden.png', fullUrl: '/images/toast/gratitude-garden.png', usageCount: 52 },
    { id: 'img-gift-of-time', name: 'Gift of Time', description: 'Clock wrapped as gift with heart hands', category: 'GRATITUDE', recommendedValues: [], mood: ['sacrifice', 'generosity'], altText: 'Clock gift with heart', thumbnailUrl: '/images/toast/gratitude-time.png', fullUrl: '/images/toast/gratitude-time.png', usageCount: 36 },
    { id: 'img-coffee-cheers', name: 'Coffee Cheers', description: 'Two coffee cups clinking with heart steam', category: 'GRATITUDE', recommendedValues: [], mood: ['casual', 'warmth'], altText: 'Coffee cups clinking', thumbnailUrl: '/images/toast/gratitude-coffee.png', fullUrl: '/images/toast/gratitude-coffee.png', usageCount: 89 },
    { id: 'img-sunshine-person', name: 'Sunshine Person', description: 'Person radiating sunshine warming others', category: 'GRATITUDE', recommendedValues: [], mood: ['positivity', 'energy'], altText: 'Person radiating warm light', thumbnailUrl: '/images/toast/gratitude-sunshine.png', fullUrl: '/images/toast/gratitude-sunshine.png', usageCount: 44 },
    { id: 'img-mentor-magic', name: 'Mentor Magic', description: 'Figure sharing lantern light with smaller figure', category: 'GRATITUDE', recommendedValues: ['EXPLORE_FEARLESSLY'], mood: ['guidance', 'teaching'], altText: 'Mentor sharing lantern light', thumbnailUrl: '/images/toast/gratitude-mentor.png', fullUrl: '/images/toast/gratitude-mentor.png', usageCount: 31 },
    { id: 'img-unsung-hero', name: 'Unsung Hero', description: 'Figure in spotlight emerging from shadows with cape', category: 'GRATITUDE', recommendedValues: ['OWN_THE_OUTCOME'], mood: ['hidden-contributions'], altText: 'Hero emerging from shadows', thumbnailUrl: '/images/toast/gratitude-hero.png', fullUrl: '/images/toast/gratitude-hero.png', usageCount: 28 },
];

// Helper to get images by category
export const getImagesByCategory = (category: ImageCategory): ToastImage[] => {
    return TOAST_IMAGES.filter(img => img.category === category);
};

// Helper to get recommended images for a value
export const getRecommendedImages = (value: CompanyValue): ToastImage[] => {
    return TOAST_IMAGES.filter(img => img.recommendedValues.includes(value));
};
