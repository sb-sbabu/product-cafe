/**
 * DETERMINISTIC RESPONSE GENERATOR
 * Template-based response generation with data lookup
 */

import type {
    Intent,
    ExtractedEntity,
    ChatMessage,
    QuickReply,
    ChatAttachment,
} from '../../../types';
import { generateId } from '../../../lib/utils';
import { getEntityValue } from './entityExtractor';
import {
    searchResources,
    searchFAQs,
    searchPeople,
    getResourcesByCategory,
} from '../../../data/mockData';

interface ResponseContext {
    intent: Intent;
    entities: ExtractedEntity[];
    originalInput: string;
}

/**
 * Generate response for matched intent
 */
export function generateResponse(context: ResponseContext): ChatMessage {
    const { intent, entities, originalInput } = context;

    switch (intent.name) {
        case 'TOOL_ACCESS_REQUEST':
            return generateToolAccessResponse(entities);

        case 'TOOL_FIND':
            return generateToolFindResponse(entities);

        case 'NAV_GRAB_GO':
            return generateNavGrabGoResponse();

        case 'NAV_LIBRARY':
            return generateNavLibraryResponse();

        case 'NAV_HOME':
            return generateNavHomeResponse();

        case 'NAV_COMMUNITY':
            return generateNavCommunityResponse();

        case 'NAV_MY_CAFE':
            return generateNavMyCafeResponse();

        case 'FAQ_HOW_TO':
            return generateHowToResponse(entities, originalInput);

        case 'FAQ_WHAT_IS':
            return generateWhatIsResponse(entities, originalInput);

        case 'FAQ_WHERE_IS':
            return generateWhereIsResponse(entities, originalInput);

        case 'ONBOARDING_HELP':
            return generateOnboardingResponse();

        case 'FIND_EXPERT':
            return generateFindExpertResponse(entities, originalInput);

        case 'LEARN_TOPIC':
            return generateLearnResponse(entities);

        case 'HELP':
            return generateHelpResponse();

        case 'GREETING':
            return generateGreetingResponse();

        case 'THANKS':
            return generateThanksResponse();

        case 'SEARCH_QUERY':
            return generateSearchResponse(entities, originalInput);

        case 'FEEDBACK':
            return generateFeedbackResponse();

        case 'SETTINGS':
            return generateSettingsResponse();

        case 'TIPS':
            return generateTipsResponse();

        case 'WHATS_NEW':
            return generateWhatsNewResponse();

        case 'RECENT_ACTIVITY':
            return generateRecentActivityResponse();

        case 'SHORTCUTS':
            return generateShortcutsResponse();

        case 'FALLBACK':
        default:
            return generateFallbackResponse(originalInput);
    }
}

function generateToolAccessResponse(entities: ExtractedEntity[]): ChatMessage {
    const tool = getEntityValue(entities, 'tool');

    if (!tool) {
        return createMessage(
            "I'd be happy to help you get tool access! Which tool do you need?",
            [
                { id: 'jira', label: '🔧 Jira', value: 'jira access' },
                { id: 'confluence', label: '📝 Confluence', value: 'confluence access' },
                { id: 'smartsheet', label: '📊 Smartsheet', value: 'smartsheet access' },
                { id: 'other', label: '❓ Something else', value: 'list all tools' },
            ]
        );
    }

    // Search for relevant FAQ
    const faqs = searchFAQs(`${tool} access`);
    const resources = searchResources(tool, { category: 'grab-and-go' });

    const toolName = tool.charAt(0).toUpperCase() + tool.slice(1);

    let content = `Here's how to get ${toolName} access:\n\n`;

    if (faqs.length > 0) {
        const faq = faqs[0];
        content += faq.answerSummary + '\n\n';
        if (faq.answerSteps) {
            faq.answerSteps.forEach((step, idx) => {
                content += `${idx + 1}️⃣ ${step.instruction}\n`;
            });
        }
    } else {
        content += `1️⃣ Go to ServiceNow IT Portal\n`;
        content += `2️⃣ Click "Software Request"\n`;
        content += `3️⃣ Search for "${toolName}"\n`;
        content += `4️⃣ Submit with manager approval\n`;
        content += `\n⏱️ Typical turnaround: 2-3 business days`;
    }

    const attachments: ChatAttachment[] = resources.slice(0, 2).map(r => ({
        type: 'resource',
        data: { resource: r },
    }));

    // Find expert for this tool
    const experts = searchPeople(tool);
    if (experts.length > 0) {
        attachments.push({
            type: 'person',
            data: { person: experts[0] },
        });
    }

    return createMessage(content, undefined, attachments);
}

function generateToolFindResponse(entities: ExtractedEntity[]): ChatMessage {
    const tool = getEntityValue(entities, 'tool');

    if (!tool) {
        return createMessage(
            "Which tool are you looking for?",
            [
                { id: 'jira', label: 'Jira', value: 'find jira' },
                { id: 'confluence', label: 'Confluence', value: 'find confluence' },
                { id: 'smartsheet', label: 'Smartsheet', value: 'find smartsheet' },
            ]
        );
    }

    const resources = searchResources(tool);

    if (resources.length === 0) {
        return createMessage(`I couldn't find specific resources for ${tool}. Try browsing the Tools & Access section.`);
    }

    const attachments: ChatAttachment[] = resources.slice(0, 3).map(r => ({
        type: 'resource',
        data: { resource: r },
    }));

    return createMessage(
        `Here are the ${tool} resources I found:`,
        undefined,
        attachments
    );
}

function generateNavGrabGoResponse(): ChatMessage {
    const resources = getResourcesByCategory('grab-and-go').slice(0, 3);
    const attachments: ChatAttachment[] = resources.map(r => ({
        type: 'resource',
        data: { resource: r },
    }));

    return createMessage(
        "Here's what's in Grab & Go - your quick access to tools, links, and FAQs:",
        [
            { id: 'tools', label: '🔧 Tools & Access', value: 'show tools' },
            { id: 'faqs', label: '❓ FAQs', value: 'show faqs' },
            { id: 'links', label: '🔗 Quick Links', value: 'show quick links' },
        ],
        attachments
    );
}

function generateNavLibraryResponse(): ChatMessage {
    return createMessage(
        "Welcome to the Library! 📚 What would you like to explore?",
        [
            { id: 'craft', label: '💡 Product Craft', value: 'product craft resources' },
            { id: 'healthcare', label: '🏥 Healthcare/Industry', value: 'healthcare resources' },
            { id: 'playbook', label: '📘 Internal Playbook', value: 'internal playbook' },
            { id: 'browse', label: '📂 Browse All', value: 'show all resources' },
        ]
    );
}

function generateNavHomeResponse(): ChatMessage {
    return createMessage(
        "Taking you home! ☕ Here's your café menu:",
        [
            { id: 'grab', label: '☕ Grab & Go', value: 'show grab and go' },
            { id: 'library', label: '📚 Library', value: 'show library' },
            { id: 'community', label: '💬 Community', value: 'find someone' },
        ]
    );
}

function generateHowToResponse(_entities: ExtractedEntity[], input: string): ChatMessage {
    // Search FAQs based on the input
    const faqs = searchFAQs(input);

    if (faqs.length > 0) {
        const topFaqs = faqs.slice(0, 2);
        const attachments: ChatAttachment[] = topFaqs.map(f => ({
            type: 'faq',
            data: { faq: f },
        }));

        return createMessage(
            "I found these helpful answers:",
            undefined,
            attachments
        );
    }

    // Search resources as fallback
    const resources = searchResources(input);
    if (resources.length > 0) {
        const attachments: ChatAttachment[] = resources.slice(0, 3).map(r => ({
            type: 'resource',
            data: { resource: r },
        }));

        return createMessage(
            "I didn't find an exact FAQ, but these resources might help:",
            undefined,
            attachments
        );
    }

    return createMessage(
        "I don't have a specific answer for that. Would you like to:",
        [
            { id: 'browse', label: '📚 Browse FAQs', value: 'show faqs' },
            { id: 'expert', label: '👤 Find an expert', value: 'find expert' },
            { id: 'search', label: '🔍 Search resources', value: 'search resources' },
        ]
    );
}

function generateWhatIsResponse(entities: ExtractedEntity[], input: string): ChatMessage {
    const topic = getEntityValue(entities, 'topic');

    // Search for explanations
    const faqs = searchFAQs(input);
    const resources = searchResources(input, { pillar: 'healthcare' });

    const attachments: ChatAttachment[] = [];

    if (faqs.length > 0) {
        attachments.push({
            type: 'faq',
            data: { faq: faqs[0] },
        });
    }

    if (resources.length > 0) {
        attachments.push({
            type: 'resource',
            data: { resource: resources[0] },
        });
    }

    if (attachments.length > 0) {
        return createMessage(
            "Here's what I found:",
            [
                { id: 'more', label: '📚 Learn more', value: `learn about ${topic || 'this topic'}` },
                { id: 'expert', label: '👤 Talk to expert', value: 'find expert' },
            ],
            attachments
        );
    }

    return createMessage(
        "I couldn't find a direct explanation. Would you like to explore the Library?",
        [
            { id: 'library', label: '📚 Go to Library', value: 'show library' },
            { id: 'healthcare', label: '🏥 Healthcare 101', value: 'healthcare resources' },
        ]
    );
}

function generateWhereIsResponse(entities: ExtractedEntity[], input: string): ChatMessage {
    const templateType = getEntityValue(entities, 'templateType');

    if (templateType) {
        const resources = searchResources(templateType);
        if (resources.length > 0) {
            const attachments: ChatAttachment[] = resources.slice(0, 2).map(r => ({
                type: 'resource',
                data: { resource: r },
            }));

            return createMessage(
                `Here's the ${templateType.toUpperCase()} template:`,
                undefined,
                attachments
            );
        }
    }

    // Generic search
    const resources = searchResources(input);
    if (resources.length > 0) {
        const attachments: ChatAttachment[] = resources.slice(0, 3).map(r => ({
            type: 'resource',
            data: { resource: r },
        }));

        return createMessage(
            "I found these resources:",
            undefined,
            attachments
        );
    }

    return createMessage(
        "I couldn't find that specific resource. Try:",
        [
            { id: 'templates', label: '📄 Browse Templates', value: 'show templates' },
            { id: 'grab', label: '☕ Grab & Go', value: 'show grab and go' },
        ]
    );
}

function generateOnboardingResponse(): ChatMessage {
    const onboardingResources = searchResources('onboarding');
    const attachments: ChatAttachment[] = onboardingResources.slice(0, 2).map(r => ({
        type: 'resource',
        data: { resource: r },
    }));

    return createMessage(
        `Welcome to the team! 🎉 Here's your New PM Starter Path:

📍 **Week 1: Get Set Up**
• Tool access checklist
• Key meetings to join
• People to meet

📍 **Week 2: Learn the Domain**
• Healthcare 101
• RCM Fundamentals

📍 **Week 3-4: How We Work**
• Product Development Process
• Key rituals and meetings

Where would you like to start?`,
        [
            { id: 'tools', label: '🔧 Get Tool Access', value: 'tool access' },
            { id: 'healthcare', label: '🏥 Healthcare 101', value: 'learn healthcare' },
            { id: 'people', label: '👥 Who to Meet', value: 'find people to meet' },
        ],
        attachments
    );
}

function generateFindExpertResponse(entities: ExtractedEntity[], input: string): ChatMessage {
    const topic = getEntityValue(entities, 'topic');
    const tool = getEntityValue(entities, 'tool');

    const searchQuery = topic || tool || input;
    const experts = searchPeople(searchQuery);

    if (experts.length === 0) {
        return createMessage(
            "I couldn't find a specific expert for that. What area do you need help with?",
            [
                { id: 'healthcare', label: '🏥 Healthcare/RCM', value: 'healthcare expert' },
                { id: 'process', label: '📋 Product Process', value: 'process expert' },
                { id: 'tools', label: '🔧 Tools & Systems', value: 'tools expert' },
            ]
        );
    }

    const attachments: ChatAttachment[] = experts.slice(0, 3).map(p => ({
        type: 'person',
        data: { person: p },
    }));

    return createMessage(
        `Here are experts who can help with ${searchQuery}:`,
        undefined,
        attachments
    );
}

function generateLearnResponse(entities: ExtractedEntity[]): ChatMessage {
    const pillar = getEntityValue(entities, 'pillar');
    const topic = getEntityValue(entities, 'topic');

    if (pillar === 'healthcare' || topic === 'healthcare' || topic === 'rcm') {
        const resources = searchResources('healthcare');
        const attachments: ChatAttachment[] = resources.slice(0, 3).map(r => ({
            type: 'resource',
            data: { resource: r },
        }));

        return createMessage(
            "Great choice! Here's your healthcare learning path:",
            [
                { id: 'hc101', label: '🏥 Healthcare 101', value: 'healthcare 101' },
                { id: 'rcm', label: '💰 RCM Deep Dive', value: 'rcm fundamentals' },
                { id: 'cob', label: '📋 COB Explained', value: 'what is cob' },
            ],
            attachments
        );
    }

    return createMessage(
        "What would you like to learn about?",
        [
            { id: 'craft', label: '💡 Product Craft', value: 'learn product craft' },
            { id: 'healthcare', label: '🏥 Healthcare/RCM', value: 'learn healthcare' },
            { id: 'playbook', label: '📘 How We Work', value: 'learn internal process' },
        ]
    );
}

function generateHelpResponse(): ChatMessage {
    return createMessage(
        `I'm your Product Café Assistant! ☕ Here's what I can help with:

🔧 **Tool Access** - "How do I get Jira access?"
📚 **Find Resources** - "Where is the PRD template?"
❓ **Answer Questions** - "What is COB?"
👤 **Find Experts** - "Who knows about RCM?"
🆕 **Onboarding** - "I'm new here"

Just ask naturally - I understand questions like:
• "I need Smartsheet access"
• "Show me healthcare resources"
• "Who can help with releases?"`,
        [
            { id: 'grab', label: '☕ Grab & Go', value: 'show grab and go' },
            { id: 'library', label: '📚 Library', value: 'show library' },
            { id: 'new', label: '🆕 New Here?', value: 'onboarding help' },
        ]
    );
}

function generateFallbackResponse(input: string): ChatMessage {
    // Try a broad search
    const resources = searchResources(input);
    const faqs = searchFAQs(input);
    const people = searchPeople(input);

    const attachments: ChatAttachment[] = [];

    if (resources.length > 0) {
        attachments.push({
            type: 'resource',
            data: { resource: resources[0] },
        });
    }

    if (faqs.length > 0) {
        attachments.push({
            type: 'faq',
            data: { faq: faqs[0] },
        });
    }

    if (people.length > 0) {
        attachments.push({
            type: 'person',
            data: { person: people[0] },
        });
    }

    if (attachments.length > 0) {
        return createMessage(
            "I'm not sure exactly what you need, but here's what I found:",
            [
                { id: 'more', label: '🔍 Search more', value: 'help' },
                { id: 'expert', label: '👤 Find expert', value: 'find expert' },
            ],
            attachments
        );
    }

    return createMessage(
        `I'm not sure how to help with that. Here are some things I can do:`,
        [
            { id: 'tools', label: '🔧 Tool Access', value: 'tool access help' },
            { id: 'faqs', label: '❓ Browse FAQs', value: 'show faqs' },
            { id: 'library', label: '📚 Library', value: 'show library' },
            { id: 'expert', label: '👤 Find Expert', value: 'find expert' },
        ]
    );
}

function generateNavCommunityResponse(): ChatMessage {
    return createMessage(
        "Welcome to the Community! 👥 Connect with experts across the organization.",
        [
            { id: 'healthcare', label: '🏥 Healthcare Experts', value: 'find healthcare expert' },
            { id: 'product', label: '💡 Product Experts', value: 'find product expert' },
            { id: 'tools', label: '🔧 Tools Experts', value: 'find tools expert' },
            { id: 'browse', label: '👤 Browse All', value: 'show all people' },
        ]
    );
}

function generateNavMyCafeResponse(): ChatMessage {
    return createMessage(
        "☕ Your personalized Café hub! Here you can access your favorites, recent activity, and personalized recommendations.",
        [
            { id: 'favorites', label: '❤️ My Favorites', value: 'show my favorites' },
            { id: 'recent', label: '🕐 Recent', value: 'show recent' },
            { id: 'suggested', label: '⭐ For You', value: 'show suggestions' },
        ]
    );
}

function generateGreetingResponse(): ChatMessage {
    const greetings = [
        "Hello! ☕ Welcome to Product Café! How can I help you today?",
        "Hi there! 👋 I'm your Café Assistant. What can I help you find?",
        "Hey! Good to see you. Need help with tools, resources, or finding someone?",
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    return createMessage(
        greeting,
        [
            { id: 'grab', label: '☕ Grab & Go', value: 'show grab and go' },
            { id: 'library', label: '📚 Library', value: 'show library' },
            { id: 'new', label: '🆕 New Here?', value: 'onboarding help' },
        ]
    );
}

function generateThanksResponse(): ChatMessage {
    const responses = [
        "You're welcome! ☕ Let me know if you need anything else.",
        "Happy to help! 😊 Anything else I can assist with?",
        "Glad I could help! Feel free to ask if you have more questions.",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];

    return createMessage(
        response,
        [
            { id: 'more', label: '🔍 Search more', value: 'help' },
            { id: 'favorites', label: '❤️ My Favorites', value: 'my favorites' },
        ]
    );
}

function generateSearchResponse(_entities: ExtractedEntity[], originalInput: string): ChatMessage {
    // Extract search query from input
    const query = originalInput
        .replace(/search for|look for|find/gi, '')
        .trim();

    const resources = searchResources(query);
    const faqs = searchFAQs(query);
    const people = searchPeople(query);

    const attachments: ChatAttachment[] = [];

    if (resources.length > 0) {
        attachments.push({
            type: 'resource',
            data: { resource: resources[0] },
        });
    }
    if (faqs.length > 0) {
        attachments.push({
            type: 'faq',
            data: { faq: faqs[0] },
        });
    }
    if (people.length > 0) {
        attachments.push({
            type: 'person',
            data: { person: people[0] },
        });
    }

    const totalCount = resources.length + faqs.length + people.length;

    if (totalCount === 0) {
        return createMessage(
            `I couldn't find anything matching "${query}". Try different keywords?`,
            [
                { id: 'grab', label: '☕ Browse Grab & Go', value: 'show grab and go' },
                { id: 'library', label: '📚 Browse Library', value: 'show library' },
                { id: 'expert', label: '👤 Ask an Expert', value: 'find expert' },
            ]
        );
    }

    return createMessage(
        `Found ${totalCount} results for "${query}":`,
        [
            { id: 'more', label: '🔍 See all results', value: `search ${query}` },
        ],
        attachments.slice(0, 3)
    );
}

function generateFeedbackResponse(): ChatMessage {
    return createMessage(
        `📝 **We'd love your feedback!**

How can I help you today?

• **Report a Bug** - Something not working right?
• **Suggest a Feature** - Got ideas for improvement?
• **General Feedback** - Tell us what you think!

Your input helps make Product Café better for everyone.`,
        [
            { id: 'bug', label: '🐛 Report Bug', value: 'I found a bug' },
            { id: 'feature', label: '💡 Suggest Feature', value: 'I have a feature idea' },
            { id: 'general', label: '💬 General', value: 'I have general feedback' },
        ]
    );
}

function generateSettingsResponse(): ChatMessage {
    return createMessage(
        `⚙️ **Your Settings**

Here's what you can customize:

• **Notifications** - Control what alerts you receive
• **Theme** - Light or dark mode preference
• **Default View** - Choose your landing page
• **Favorites** - Manage your saved items

Head to My Café to manage all your preferences!`,
        [
            { id: 'mycafe', label: '☕ Open My Café', value: 'show my cafe' },
            { id: 'favorites', label: '⭐ View Favorites', value: 'show my favorites' },
        ]
    );
}

function generateTipsResponse(): ChatMessage {
    const tips = [
        '💡 **Pro Tip:** Press `/` anywhere to quickly search for resources!',
        '💡 **Pro Tip:** Add resources to favorites by clicking the ⭐ icon!',
        '💡 **Pro Tip:** Use "gh", "gl", "gc" keyboard shortcuts for quick navigation!',
        '💡 **Pro Tip:** The Library has learning paths for structured onboarding!',
        '💡 **Pro Tip:** Find domain experts in Community when you need guidance!',
        '💡 **Pro Tip:** Grab & Go has quick links to all your daily tools!',
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return createMessage(
        `${randomTip}

Want another tip?`,
        [
            { id: 'another', label: '🎲 Another Tip', value: 'give me a tip' },
            { id: 'shortcuts', label: '⌨️ All Shortcuts', value: 'keyboard shortcuts' },
            { id: 'explore', label: '🧭 Explore Features', value: 'help' },
        ]
    );
}

function generateWhatsNewResponse(): ChatMessage {
    return createMessage(
        `✨ **What's New in Product Café**

**Recent Updates:**
• 📍 **Universal Search** - Find anything with Cmd+K
• 📍 **Keyboard Shortcuts** - Navigate faster with hotkeys  
• 📍 **My Café** - Your personalized dashboard
• 📍 **Enhanced Chat** - More intents and better responses
• 📍 **Favorites** - Save and organize resources

**Coming Soon:**
• Azure AD integration
• SharePoint Lists sync
• Mobile app`,
        [
            { id: 'home', label: '🏠 Check Home', value: 'go home' },
            { id: 'explore', label: '🔍 Explore Features', value: 'help' },
        ]
    );
}

function generateRecentActivityResponse(): ChatMessage {
    return createMessage(
        `📊 **Your Recent Activity**

I can show you:
• Recently viewed resources
• Your search history
• Saved favorites
• Chat history

Head to **My Café** for your complete activity history!`,
        [
            { id: 'mycafe', label: '☕ My Café', value: 'show my cafe' },
            { id: 'favorites', label: '⭐ My Favorites', value: 'show my favorites' },
            { id: 'search', label: '🔍 Search Something', value: 'search resources' },
        ]
    );
}

function generateShortcutsResponse(): ChatMessage {
    return createMessage(
        `⌨️ **Keyboard Shortcuts**

**Global:**
• \`/\` or \`Cmd+K\` - Focus search
• \`Shift+?\` - Open chat
• \`Esc\` - Return home

**Navigation (press g, then):**
• \`g\` → \`h\` - Go Home
• \`g\` → \`l\` - Go Library
• \`g\` → \`c\` - Go Community

Try them now!`,
        [
            { id: 'tips', label: '💡 More Tips', value: 'give me a tip' },
            { id: 'help', label: '❓ Full Help', value: 'help' },
        ]
    );
}

// Helper to create message objects
function createMessage(
    content: string,
    quickReplies?: QuickReply[],
    attachments?: ChatAttachment[]
): ChatMessage {
    return {
        id: generateId(),
        role: 'bot',
        content,
        timestamp: new Date().toISOString(),
        quickReplies,
        attachments,
    };
}

