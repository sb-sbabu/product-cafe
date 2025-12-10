import type { Author } from '../types';

export const AUTHORS: Author[] = [
    {
        id: 'marty-cagan',
        name: 'Marty Cagan',
        bio: 'Founder of Silicon Valley Product Group (SVPG). Former VP Product at eBay, Netscape, and HP. Author of Inspired and Empowered.',
        expertise: ['Product Management', 'Product Teams', 'Product Discovery', 'Product Leadership'],
        socialLinks: {
            twitter: 'cabortz',
            linkedin: 'martycagan',
            website: 'https://svpg.com'
        }
    },
    {
        id: 'teresa-torres',
        name: 'Teresa Torres',
        bio: 'Product discovery coach and author. Helps product teams adopt continuous discovery practices.',
        expertise: ['Product Discovery', 'User Research', 'Opportunity Solution Trees', 'Customer Interviews'],
        socialLinks: {
            twitter: 'ttorres',
            linkedin: 'teresatorres',
            website: 'https://producttalk.org'
        }
    },
    {
        id: 'rob-fitzpatrick',
        name: 'Rob Fitzpatrick',
        bio: 'Entrepreneur and author. Created the practical approach to customer conversations outlined in The Mom Test.',
        expertise: ['Customer Interviews', 'Startup Validation', 'User Research'],
        socialLinks: {
            website: 'https://robfitz.com'
        }
    },
    {
        id: 'jake-knapp',
        name: 'Jake Knapp',
        bio: 'Creator of the Design Sprint process at Google Ventures. Author of Sprint and Make Time.',
        expertise: ['Design Sprints', 'Time Management', 'Product Design', 'Prototyping'],
        socialLinks: {
            twitter: 'jakek',
            website: 'https://jakeknapp.com'
        }
    },
    {
        id: 'richard-rumelt',
        name: 'Richard Rumelt',
        bio: 'Professor at UCLA Anderson School of Management. One of the most influential thinkers on strategy.',
        expertise: ['Business Strategy', 'Strategic Thinking', 'Competitive Advantage'],
    },
    {
        id: 'ag-lafley',
        name: 'A.G. Lafley',
        bio: 'Former CEO of Procter & Gamble. Transformed P&G into a global design and innovation leader.',
        expertise: ['Corporate Strategy', 'Innovation', 'Brand Management', 'Leadership'],
    },
    {
        id: 'camille-fournier',
        name: 'Camille Fournier',
        bio: 'Former CTO of Rent the Runway. Author and technical leadership expert.',
        expertise: ['Engineering Leadership', 'Management', 'Career Development', 'Technical Leadership'],
        socialLinks: {
            twitter: 'skamille',
            linkedin: 'camille-fournier',
        }
    },
    {
        id: 'andy-grove',
        name: 'Andy Grove',
        bio: 'Legendary former CEO of Intel. Pioneer in semiconductor manufacturing and management practices.',
        expertise: ['Operations', 'Management', 'Leadership', 'Technology Strategy'],
    },
    {
        id: 'kim-scott',
        name: 'Kim Scott',
        bio: 'Co-founder of Radical Candor. Former Google and Apple executive. Leadership coach.',
        expertise: ['Feedback', 'Leadership', 'Management', 'Communication'],
        socialLinks: {
            twitter: 'kimballscott',
            website: 'https://radicalcandor.com'
        }
    },
    {
        id: 'cal-newport',
        name: 'Cal Newport',
        bio: 'Computer Science professor at Georgetown. Author of Deep Work, Digital Minimalism, and So Good They Cant Ignore You.',
        expertise: ['Productivity', 'Focus', 'Career Strategy', 'Deep Work'],
        socialLinks: {
            website: 'https://calnewport.com'
        }
    },
    {
        id: 'greg-mckeown',
        name: 'Greg McKeown',
        bio: 'Author, speaker, and leadership consultant. Created the Essentialism framework for focused work.',
        expertise: ['Essentialism', 'Productivity', 'Leadership', 'Focus'],
        socialLinks: {
            twitter: 'GregoryMcKeown',
            website: 'https://gregmckeown.com'
        }
    },
    {
        id: 'david-allen',
        name: 'David Allen',
        bio: 'Creator of the Getting Things Done (GTD) methodology. Productivity consultant and coach.',
        expertise: ['Productivity', 'Task Management', 'Organization', 'Workflow'],
        socialLinks: {
            website: 'https://gettingthingsdone.com'
        }
    },
    {
        id: 'peter-drucker',
        name: 'Peter Drucker',
        bio: 'Father of modern management. Prolific author and consultant who shaped management thinking.',
        expertise: ['Management', 'Leadership', 'Effectiveness', 'Knowledge Work'],
    },
    {
        id: 'clayton-christensen',
        name: 'Clayton Christensen',
        bio: 'Harvard Business School professor. Creator of disruptive innovation theory and Jobs to Be Done.',
        expertise: ['Innovation', 'Disruption', 'Jobs to Be Done', 'Business Strategy'],
    },
    {
        id: 'chip-huyen',
        name: 'Chip Huyen',
        bio: 'ML engineer and author. Expert in machine learning systems and MLOps.',
        expertise: ['Machine Learning', 'ML Systems', 'AI Products', 'MLOps'],
        socialLinks: {
            twitter: 'chipro',
            website: 'https://huyenchip.com'
        }
    },
    {
        id: 'shreyas-doshi',
        name: 'Shreyas Doshi',
        bio: 'Former PM at Stripe, Twitter, Google, Yahoo. Known for product thinking frameworks and mental models.',
        expertise: ['Product Thinking', 'Mental Models', 'Prioritization', 'Impact'],
        socialLinks: {
            twitter: 'shreyas',
            linkedin: 'shreyasdoshi'
        }
    },
    {
        id: 'lenny-rachitsky',
        name: 'Lenny Rachitsky',
        bio: 'Former Growth PM at Airbnb. Creator of Lennys Newsletter, the #1 product newsletter.',
        expertise: ['Growth', 'Product Management', 'Career Advice', 'Hiring'],
        socialLinks: {
            twitter: 'lennysan',
            website: 'https://lennysnewsletter.com'
        }
    },
    {
        id: 'gibson-biddle',
        name: 'Gibson Biddle',
        bio: 'Former VP Product at Netflix and Chegg. Creator of the DHM Model for product strategy.',
        expertise: ['Product Strategy', 'DHM Model', 'A/B Testing', 'Consumer Products'],
        socialLinks: {
            twitter: 'gibsonbiddle',
            website: 'https://gibsonbiddle.com'
        }
    }
];

export const getAuthorById = (id: string): Author | undefined =>
    AUTHORS.find(a => a.id === id);

export const getAuthorsByIds = (ids: string[]): Author[] =>
    ids.map(id => getAuthorById(id)).filter(Boolean) as Author[];
