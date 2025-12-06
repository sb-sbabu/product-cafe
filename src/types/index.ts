// ========================================
// PRODUCT CAFÉ - TYPE DEFINITIONS
// ========================================

// -------------------- ENUMS --------------------

export type Category = 'grab-and-go' | 'library' | 'community';

export type Pillar =
    | 'product-craft'
    | 'healthcare'
    | 'internal-playbook'
    | 'tools-access';

export type ContentType =
    | 'doc'
    | 'guide'
    | 'template'
    | 'video'
    | 'link'
    | 'tool'
    | 'faq'
    | 'learning-path';

export type SourceSystem =
    | 'sharepoint'
    | 'confluence'
    | 'teams'
    | 'servicenow'
    | 'smartsheet'
    | 'external'
    | 'internal';

export type FAQCategory = 'access' | 'process' | 'tools' | 'org' | 'general';

export type Audience = 'all' | 'pm' | 'po' | 'leader' | 'new-hire';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// -------------------- RESOURCE --------------------

export interface Resource {
    id: string;
    slug: string;
    title: string;
    description: string;
    url: string;
    category: Category;
    pillar: Pillar;
    contentType: ContentType;
    sourceSystem: SourceSystem;
    sourceId?: string;
    tags: string[];
    audience: Audience[];
    difficulty?: Difficulty;
    estimatedTime?: number; // minutes
    isFeatured: boolean;
    isArchived: boolean;
    displayOrder?: number;
    parentId?: string;
    relatedResourceIds: string[];
    expertIds: string[];
    owner: string;
    createdAt: string;
    updatedAt: string;
    lastVerifiedAt: string;
    viewCount: number;
    helpfulCount: number;
    searchKeywords: string[];
    synonyms: string[];
}

// -------------------- FAQ --------------------

export interface FAQStep {
    order: number;
    instruction: string;
    linkUrl?: string;
    linkText?: string;
    note?: string;
}

export interface FAQ {
    id: string;
    slug: string;
    question: string;
    alternateQuestions: string[];
    answerSummary: string;
    answerSteps?: FAQStep[];
    answerHtml?: string;
    category: FAQCategory;
    tags: string[];
    relatedResourceIds: string[];
    relatedFAQIds: string[];
    expertIds: string[];
    owner: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    helpfulCount: number;
    unhelpfulCount: number;
}

// -------------------- PERSON --------------------

export interface Person {
    id: string;
    email: string;
    displayName: string;
    title: string;
    team: string;
    location?: string;
    avatarUrl?: string;
    expertiseAreas: string[];
    canHelpWith: string[];
    teamsDeepLink: string;
    slackHandle?: string;
    isActive: boolean;
    lastUpdatedAt: string;
}

// -------------------- CHATBOT --------------------

export type IntentPatternType = 'keyword' | 'regex' | 'phrase';

export interface IntentPattern {
    type: IntentPatternType;
    value: string;
    weight: number;
}

export interface QuickReply {
    id: string;
    label: string;
    value: string;
    icon?: string;
    intentOverride?: string;
}

export interface ClarificationStep {
    question: string;
    quickReplies: QuickReply[];
    entityToCapture: string;
}

export interface Intent {
    id: string;
    name: string;
    displayName: string;
    patterns: IntentPattern[];
    requiredEntities: string[];
    optionalEntities: string[];
    responseTemplateId: string;
    clarificationFlow?: ClarificationStep[];
    isActive: boolean;
    priority: number;
}

export interface ResponseTemplate {
    id: string;
    name: string;
    messageTemplate: string;
    includeResources: boolean;
    resourceQuery?: {
        filters: Record<string, string>;
        maxResults: number;
    };
    includeQuickReplies: boolean;
    quickReplies?: QuickReply[];
    includePeople: boolean;
    peopleQuery?: {
        expertiseFilter: string[];
        maxResults: number;
    };
    followUpPrompt?: string;
}

// -------------------- CHAT MESSAGE --------------------

export type MessageRole = 'user' | 'bot';

export interface ChatResourceCard {
    resource: Resource;
}

export interface ChatFAQCard {
    faq: FAQ;
}

export interface ChatPersonCard {
    person: Person;
}

export type ChatAttachment =
    | { type: 'resource'; data: ChatResourceCard }
    | { type: 'faq'; data: ChatFAQCard }
    | { type: 'person'; data: ChatPersonCard };

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    attachments?: ChatAttachment[];
    quickReplies?: QuickReply[];
    isTyping?: boolean;
    traceId?: string; // For debugging NLU pipeline
}

// -------------------- NLU RESULT --------------------

export interface ExtractedEntity {
    name: string;
    value: string;
    confidence: number;
}

export interface IntentMatch {
    intent: Intent;
    score: number;
    matchedPatterns: string[];
}

export interface NLUResult {
    originalInput: string;
    preprocessedTokens: string[];
    entities: ExtractedEntity[];
    intentMatches: IntentMatch[];
    selectedIntent: Intent | null;
    confidence: number;
    needsClarification: boolean;
    clarificationStep?: ClarificationStep;
}

// -------------------- SEARCH --------------------

export interface SearchResult {
    resources: Resource[];
    faqs: FAQ[];
    people: Person[];
    totalCount: number;
    query: string;
}

export interface SearchFilters {
    category?: Category;
    pillar?: Pillar;
    contentType?: ContentType;
    tags?: string[];
    audience?: Audience;
}

// -------------------- UI STATE --------------------

export interface UIState {
    theme: 'light' | 'dark';
    isChatOpen: boolean;
    isSearchOpen: boolean;
    activePillar: Pillar | null;
    activeCategory: Category | null;
}
