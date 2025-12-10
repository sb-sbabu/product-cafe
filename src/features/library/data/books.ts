import type { Book } from '../types';

export const BOOKS: Book[] = [
    // PM Foundations
    {
        id: 'inspired',
        title: 'Inspired',
        subtitle: 'How to Create Tech Products Customers Love',
        authorIds: ['marty-cagan'],
        coverUrl: '/covers/inspired.jpg',
        pageCount: 368,
        publishedYear: 2017,
        collections: ['pm-foundations', 'featured'],
        tags: ['product-management', 'discovery', 'teams', 'essential'],
        keyTakeaways: [
            'Empowered product teams vs feature teams',
            'Continuous product discovery',
            'The importance of product vision and strategy',
            'How to structure world-class product organizations'
        ],
        readingTimeHours: 8,
        difficulty: 'beginner',
        rating: 4.9,
        reviewCount: 2847,
        description: 'The definitive guide to building products customers love. Marty Cagan shares insights from his decades of working with successful product companies.',
        whyShouldRead: [
            'New to product management',
            'Transitioning from engineering to product',
            'Want to understand modern product practices'
        ],
        aiSummary: 'Inspired is the bible of product management, outlining how the best product companies create products that customers love. It covers the difference between empowered teams and feature teams, how to run effective product discovery, and the organizational structures that enable great products.'
    },
    {
        id: 'empowered',
        title: 'Empowered',
        subtitle: 'Ordinary People, Extraordinary Products',
        authorIds: ['marty-cagan'],
        coverUrl: '/covers/empowered.jpg',
        pageCount: 432,
        publishedYear: 2020,
        collections: ['pm-foundations', 'leadership'],
        tags: ['product-leadership', 'teams', 'organization', 'coaching'],
        keyTakeaways: [
            'What truly empowered product teams look like',
            'The role of product leadership in coaching teams',
            'How to transform feature teams into product teams',
            'Building a strong product culture'
        ],
        readingTimeHours: 10,
        difficulty: 'intermediate',
        rating: 4.8,
        reviewCount: 1523,
        description: 'The sequel to Inspired, focusing on building and coaching empowered product teams. Essential reading for product leaders.',
        whyShouldRead: [
            'Lead or manage product teams',
            'Want to transform your product organization',
            'Seeking to build a strong product culture'
        ]
    },
    {
        id: 'continuous-discovery',
        title: 'Continuous Discovery Habits',
        subtitle: 'Discover Products that Create Customer Value and Business Value',
        authorIds: ['teresa-torres'],
        coverUrl: '/covers/cdh.jpg',
        pageCount: 240,
        publishedYear: 2021,
        collections: ['pm-foundations', 'user-understanding'],
        tags: ['discovery', 'user-research', 'frameworks', 'essential'],
        keyTakeaways: [
            'The Opportunity Solution Tree framework',
            'How to conduct weekly customer interviews',
            'Assumption testing and experimentation',
            'Connecting discovery to delivery'
        ],
        readingTimeHours: 6,
        difficulty: 'beginner',
        rating: 4.8,
        reviewCount: 1876,
        description: 'A practical guide to embedding continuous discovery into your product practice. Teresa Torres provides actionable frameworks for sustainable discovery.',
        whyShouldRead: [
            'Want to talk to customers more regularly',
            'Struggle to connect research to decisions',
            'Looking for practical discovery frameworks'
        ],
        aiSummary: 'This book introduces the Opportunity Solution Tree and a systematic approach to weekly customer interviews. It bridges the gap between research and product decisions, providing a sustainable framework for continuous discovery.'
    },
    {
        id: 'mom-test',
        title: 'The Mom Test',
        subtitle: 'How to Talk to Customers and Learn if Your Business is a Good Idea',
        authorIds: ['rob-fitzpatrick'],
        coverUrl: '/covers/mom-test.jpg',
        pageCount: 130,
        publishedYear: 2013,
        collections: ['pm-foundations', 'user-understanding'],
        tags: ['customer-interviews', 'validation', 'user-research', 'essential'],
        keyTakeaways: [
            'Ask about past behavior, not future intentions',
            'Avoid leading questions and compliments',
            'Get specifics, not generalities',
            'Anyone can learn to run good customer conversations'
        ],
        readingTimeHours: 3,
        difficulty: 'beginner',
        rating: 4.7,
        reviewCount: 3421,
        description: 'A short, practical guide to having useful customer conversations. The Mom Test teaches you how to get honest feedback from anyone.',
        whyShouldRead: [
            'Struggle to get honest feedback from customers',
            'Want to validate ideas before building',
            'New to customer research'
        ]
    },
    {
        id: 'sprint',
        title: 'Sprint',
        subtitle: 'How to Solve Big Problems and Test New Ideas in Just Five Days',
        authorIds: ['jake-knapp'],
        coverUrl: '/covers/sprint.jpg',
        pageCount: 274,
        publishedYear: 2016,
        collections: ['pm-foundations', 'user-understanding'],
        tags: ['design-sprints', 'prototyping', 'validation', 'process'],
        keyTakeaways: [
            'The 5-day Design Sprint process',
            'Rapid prototyping techniques',
            'User testing with real customers',
            'Avoiding endless debates with structured decision-making'
        ],
        readingTimeHours: 6,
        difficulty: 'beginner',
        rating: 4.5,
        reviewCount: 2156,
        description: 'The book that introduced the Design Sprint methodology. Learn how to solve big problems and test ideas in just five days.',
        whyShouldRead: [
            'Need to validate ideas quickly',
            'Want to run design sprints',
            'Looking for structured innovation processes'
        ]
    },

    // Product Strategy
    {
        id: 'good-strategy-bad-strategy',
        title: 'Good Strategy Bad Strategy',
        subtitle: 'The Difference and Why It Matters',
        authorIds: ['richard-rumelt'],
        coverUrl: '/covers/gsbs.jpg',
        pageCount: 336,
        publishedYear: 2011,
        collections: ['strategy'],
        tags: ['strategy', 'business', 'planning', 'essential'],
        keyTakeaways: [
            'The kernel of good strategy: diagnosis, guiding policy, coherent actions',
            'How to identify and avoid bad strategy',
            'Strategy is about focus and saying no',
            'The importance of identifying leverage points'
        ],
        readingTimeHours: 9,
        difficulty: 'intermediate',
        rating: 4.6,
        reviewCount: 2891,
        description: 'A masterclass in strategic thinking. Rumelt shows what distinguishes good strategy from bad and provides a framework for crafting effective strategy.',
        whyShouldRead: [
            'Making strategic decisions',
            'Want to improve your analytical thinking',
            'Leading product strategy initiatives'
        ],
        aiSummary: 'Rumelt defines good strategy as having three elements: a diagnosis of the challenge, a guiding policy for addressing it, and coherent actions. He provides numerous examples of good and bad strategy from business and military history.'
    },
    {
        id: 'playing-to-win',
        title: 'Playing to Win',
        subtitle: 'How Strategy Really Works',
        authorIds: ['ag-lafley'],
        coverUrl: '/covers/ptw.jpg',
        pageCount: 272,
        publishedYear: 2013,
        collections: ['strategy'],
        tags: ['strategy', 'business', 'frameworks', 'competitive'],
        keyTakeaways: [
            'The Strategy Choice Cascade framework',
            'Where to play and how to win decisions',
            'Building strategic capabilities',
            'Strategy as an integrated set of choices'
        ],
        readingTimeHours: 7,
        difficulty: 'intermediate',
        rating: 4.5,
        reviewCount: 1876,
        description: 'P&Gs former CEO shares the strategic framework that transformed the company. A practical guide to making strategic choices.',
        whyShouldRead: [
            'Defining product or company strategy',
            'Need a practical strategy framework',
            'Making where to play decisions'
        ]
    },
    {
        id: 'innovators-dilemma',
        title: 'The Innovators Dilemma',
        subtitle: 'When New Technologies Cause Great Firms to Fail',
        authorIds: ['clayton-christensen'],
        coverUrl: '/covers/innovators-dilemma.jpg',
        pageCount: 286,
        publishedYear: 1997,
        collections: ['strategy'],
        tags: ['innovation', 'disruption', 'strategy', 'classic'],
        keyTakeaways: [
            'Sustaining vs disruptive innovation',
            'Why successful companies fail to adapt',
            'How new entrants disrupt incumbents',
            'Managing innovation portfolios'
        ],
        readingTimeHours: 8,
        difficulty: 'intermediate',
        rating: 4.4,
        reviewCount: 3567,
        description: 'The seminal work on disruptive innovation. Christensen explains why great companies fail and how to avoid their fate.',
        whyShouldRead: [
            'Understanding competitive dynamics',
            'Working on innovation strategy',
            'Product leader at an established company'
        ]
    },

    // Leadership & Management
    {
        id: 'managers-path',
        title: 'The Managers Path',
        subtitle: 'A Guide for Tech Leaders Navigating Growth and Change',
        authorIds: ['camille-fournier'],
        coverUrl: '/covers/managers-path.jpg',
        pageCount: 244,
        publishedYear: 2017,
        collections: ['leadership'],
        tags: ['management', 'leadership', 'career', 'tech-leadership'],
        keyTakeaways: [
            'The journey from IC to manager to VP',
            'How to have effective 1:1s',
            'Managing teams and managing managers',
            'Technical leadership responsibilities'
        ],
        readingTimeHours: 6,
        difficulty: 'intermediate',
        rating: 4.7,
        reviewCount: 2134,
        description: 'The essential guide for tech leaders at every stage. Fournier shares practical advice for navigating the management journey.',
        whyShouldRead: [
            'New or aspiring managers',
            'Growing in your leadership role',
            'Managing technical teams'
        ],
        aiSummary: 'A stage-by-stage guide to technical leadership, from mentoring to managing teams of teams. Each chapter addresses a different level of the management ladder with practical advice and common pitfalls.'
    },
    {
        id: 'high-output-management',
        title: 'High Output Management',
        authorIds: ['andy-grove'],
        coverUrl: '/covers/hom.jpg',
        pageCount: 272,
        publishedYear: 1983,
        collections: ['leadership'],
        tags: ['management', 'operations', 'leadership', 'classic'],
        keyTakeaways: [
            'Management output = team output',
            'Leverage as a management concept',
            'Running effective meetings',
            'Performance reviews and feedback'
        ],
        readingTimeHours: 7,
        difficulty: 'intermediate',
        rating: 4.6,
        reviewCount: 2987,
        description: 'Andy Groves management classic. A practical guide to running teams and organizations from the legendary Intel CEO.',
        whyShouldRead: [
            'Want to be a more effective manager',
            'Looking for timeless management principles',
            'Running larger teams or organizations'
        ]
    },
    {
        id: 'radical-candor',
        title: 'Radical Candor',
        subtitle: 'Be a Kick-Ass Boss Without Losing Your Humanity',
        authorIds: ['kim-scott'],
        coverUrl: '/covers/radical-candor.jpg',
        pageCount: 272,
        publishedYear: 2017,
        collections: ['leadership'],
        tags: ['feedback', 'communication', 'management', 'culture'],
        keyTakeaways: [
            'Care personally and challenge directly',
            'The four quadrants: Radical Candor, Ruinous Empathy, Obnoxious Aggression, Manipulative Insincerity',
            'How to give and receive feedback',
            'Building trust with your team'
        ],
        readingTimeHours: 7,
        difficulty: 'beginner',
        rating: 4.5,
        reviewCount: 2654,
        description: 'Kim Scotts framework for giving honest, caring feedback. A guide to building relationships that enable hard conversations.',
        whyShouldRead: [
            'Struggle with giving feedback',
            'Want to build a high-trust team',
            'New manager learning to communicate'
        ]
    },

    // Time & Productivity
    {
        id: 'deep-work',
        title: 'Deep Work',
        subtitle: 'Rules for Focused Success in a Distracted World',
        authorIds: ['cal-newport'],
        coverUrl: '/covers/deep-work.jpg',
        pageCount: 296,
        publishedYear: 2016,
        collections: ['productivity'],
        tags: ['focus', 'productivity', 'time-management', 'essential'],
        keyTakeaways: [
            'Deep work is the superpower of the 21st century',
            'Shallow work is non-negotiable but should be minimized',
            'Rituals and routines enable focus',
            'Embrace boredom and quit social media'
        ],
        readingTimeHours: 7,
        difficulty: 'beginner',
        rating: 4.6,
        reviewCount: 4532,
        description: 'Cal Newports manifesto for focused work in an age of distraction. Learn to do more meaningful work in less time.',
        whyShouldRead: [
            'Struggle with distractions and focus',
            'Want to produce higher quality work',
            'Overwhelmed by shallow work'
        ],
        aiSummary: 'Newport argues that the ability to perform deep work is becoming rare at the same time it is becoming valuable. He provides strategies for cultivating deep work habits, including batching, rituals, and productive meditation.'
    },
    {
        id: 'essentialism',
        title: 'Essentialism',
        subtitle: 'The Disciplined Pursuit of Less',
        authorIds: ['greg-mckeown'],
        coverUrl: '/covers/essentialism.jpg',
        pageCount: 272,
        publishedYear: 2014,
        collections: ['productivity'],
        tags: ['focus', 'prioritization', 'productivity', 'essential'],
        keyTakeaways: [
            'Less but better as a guiding principle',
            'The power of saying no',
            'Trade-offs are not just negative',
            'The disciplined pursuit of what matters'
        ],
        readingTimeHours: 6,
        difficulty: 'beginner',
        rating: 4.5,
        reviewCount: 3876,
        description: 'A systematic discipline for discerning what is essential. McKeown shows how to achieve more by doing less.',
        whyShouldRead: [
            'Overcommitted and overwhelmed',
            'Struggle with prioritization',
            'Want to focus on what matters most'
        ]
    },
    {
        id: 'getting-things-done',
        title: 'Getting Things Done',
        subtitle: 'The Art of Stress-Free Productivity',
        authorIds: ['david-allen'],
        coverUrl: '/covers/gtd.jpg',
        pageCount: 352,
        publishedYear: 2001,
        collections: ['productivity'],
        tags: ['productivity', 'task-management', 'organization', 'system'],
        keyTakeaways: [
            'Capture everything in a trusted system',
            'The two-minute rule',
            'Next actions thinking',
            'Weekly reviews for staying organized'
        ],
        readingTimeHours: 8,
        difficulty: 'beginner',
        rating: 4.3,
        reviewCount: 5123,
        description: 'The classic task management system. GTD provides a complete methodology for organizing work and life.',
        whyShouldRead: [
            'Overwhelmed by tasks and commitments',
            'Need a productivity system',
            'Want stress-free organization'
        ]
    },
    {
        id: 'effective-executive',
        title: 'The Effective Executive',
        subtitle: 'The Definitive Guide to Getting the Right Things Done',
        authorIds: ['peter-drucker'],
        coverUrl: '/covers/effective-executive.jpg',
        pageCount: 208,
        publishedYear: 1967,
        collections: ['productivity', 'leadership'],
        tags: ['effectiveness', 'leadership', 'management', 'classic'],
        keyTakeaways: [
            'Effectiveness can be learned',
            'Know where your time goes',
            'Focus on contribution, not effort',
            'Build on strengths'
        ],
        readingTimeHours: 5,
        difficulty: 'beginner',
        rating: 4.4,
        reviewCount: 2876,
        description: 'Druckers timeless guide to personal effectiveness. Learn the practices that make executives effective.',
        whyShouldRead: [
            'Want to be more effective, not just efficient',
            'Leader or aspiring leader',
            'Looking for foundational management wisdom'
        ]
    },

    // AI for PMs
    {
        id: 'designing-ml-systems',
        title: 'Designing Machine Learning Systems',
        subtitle: 'An Iterative Process for Production-Ready Applications',
        authorIds: ['chip-huyen'],
        coverUrl: '/covers/dmls.jpg',
        pageCount: 392,
        publishedYear: 2022,
        collections: ['ai-for-pms'],
        tags: ['machine-learning', 'ai', 'systems', 'technical'],
        keyTakeaways: [
            'The ML lifecycle from problem framing to deployment',
            'Data engineering for ML systems',
            'Model development and evaluation',
            'MLOps and monitoring in production'
        ],
        readingTimeHours: 12,
        difficulty: 'advanced',
        rating: 4.8,
        reviewCount: 876,
        description: 'A comprehensive guide to building ML systems in production. Essential for PMs working with AI/ML teams.',
        whyShouldRead: [
            'PM on an AI/ML product',
            'Want to understand ML systems deeply',
            'Working with ML engineering teams'
        ],
        aiSummary: 'Huyen provides a comprehensive guide to designing ML systems for production, covering everything from problem framing to monitoring. Written for practitioners, it bridges the gap between academic ML and production systems.'
    },
    {
        id: 'ai-first-products',
        title: 'Building AI-First Products',
        subtitle: 'A Product Manager\\\'s Guide to Artificial Intelligence',
        authorIds: [],
        coverUrl: '/covers/ai-first.jpg',
        pageCount: 280,
        publishedYear: 2023,
        collections: ['ai-for-pms'],
        tags: ['ai', 'product-management', 'llm', 'modern'],
        keyTakeaways: [
            'How AI changes product discovery and design',
            'LLM applications and limitations',
            'AI ethics and bias considerations',
            'Building AI-powered features responsibly'
        ],
        readingTimeHours: 7,
        difficulty: 'intermediate',
        rating: 4.5,
        reviewCount: 432,
        description: 'A practical guide for product managers building AI-first products. Covers LLMs, responsible AI, and modern AI product patterns.',
        whyShouldRead: [
            'Building products with AI/LLM features',
            'Want to understand AI product patterns',
            'Leading AI product initiatives'
        ]
    },

    // Healthcare RCM
    {
        id: 'healthcare-rcm-essentials',
        title: 'Healthcare RCM Essentials',
        subtitle: 'A Product Manager\\\'s Guide to Revenue Cycle Management',
        authorIds: [],
        coverUrl: '/covers/rcm-essentials.jpg',
        pageCount: 320,
        publishedYear: 2024,
        collections: ['healthcare'],
        tags: ['healthcare', 'rcm', 'domain', 'internal'],
        keyTakeaways: [
            'The end-to-end revenue cycle: from scheduling to final payment',
            'Key players: payers, providers, clearinghouses, patients',
            'Claims processing, denials management, and appeals',
            'Regulatory landscape: HIPAA, CMS rules, state regulations'
        ],
        readingTimeHours: 10,
        difficulty: 'intermediate',
        rating: 4.7,
        reviewCount: 156,
        description: 'An internal guide to understanding the healthcare revenue cycle. Essential for PMs building healthcare products.',
        whyShouldRead: [
            'New to healthcare domain',
            'Working on RCM products',
            'Need to understand claims and billing'
        ],
        aiSummary: 'A comprehensive primer on healthcare revenue cycle management, covering the full lifecycle from patient scheduling through payment collection. Includes regulatory context and common RCM challenges.'
    },
    {
        id: 'eligibility-verification-guide',
        title: 'Patient Eligibility & Benefits',
        subtitle: 'Understanding Insurance Verification in Healthcare',
        authorIds: [],
        coverUrl: '/covers/eligibility.jpg',
        pageCount: 180,
        publishedYear: 2024,
        collections: ['healthcare'],
        tags: ['healthcare', 'eligibility', 'insurance', 'domain'],
        keyTakeaways: [
            'Real-time vs batch eligibility verification',
            'Understanding EOBs and ERA files',
            'Common eligibility challenges and solutions',
            'Payer connectivity and clearinghouse integrations'
        ],
        readingTimeHours: 5,
        difficulty: 'intermediate',
        rating: 4.6,
        reviewCount: 89,
        description: 'Deep dive into patient eligibility verification. Understand how insurance verification works and common challenges.',
        whyShouldRead: [
            'Building eligibility products',
            'Need to understand insurance verification',
            'Working with payer integrations'
        ]
    }
];

export const getBookById = (id: string): Book | undefined =>
    BOOKS.find(b => b.id === id);

export const getBooksByIds = (ids: string[]): Book[] =>
    ids.map(id => getBookById(id)).filter(Boolean) as Book[];

export const getBooksByCollection = (collectionId: string): Book[] =>
    BOOKS.filter(b => b.collections.includes(collectionId));

export const getBooksByTag = (tag: string): Book[] =>
    BOOKS.filter(b => b.tags.includes(tag));

export const getFeaturedBooks = (): Book[] =>
    BOOKS.filter(b => b.collections.includes('featured'));

export const searchBooks = (query: string): Book[] => {
    const lowerQuery = query.toLowerCase();
    return BOOKS.filter(b =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.subtitle?.toLowerCase().includes(lowerQuery) ||
        b.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        b.keyTakeaways.some(kt => kt.toLowerCase().includes(lowerQuery))
    );
};
