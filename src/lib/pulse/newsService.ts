// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Live News Service
// US Healthcare Market Intelligence with Multi-Provider Failover
// ═══════════════════════════════════════════════════════════════════════════

import type { PulseSignal, SignalDomain, SignalPriority, SignalSource, SignalEntities } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

interface NewsProvider {
    name: string;
    baseUrl: string;
    apiKey: string;
    requestsToday: number;
    dailyLimit: number;
    lastError?: Date;
    consecutiveErrors: number;
}

const NEWS_PROVIDERS: NewsProvider[] = [
    {
        name: 'NewsData',
        baseUrl: 'https://newsdata.io/api/1/news',
        apiKey: 'pub_7e3154d195594324b93d42c069b54eb2',
        requestsToday: 0,
        dailyLimit: 200,
        consecutiveErrors: 0,
    },
    {
        name: 'GNews',
        baseUrl: 'https://gnews.io/api/v4/search',
        apiKey: '68b5d0ea9ae621c76a4ae250e9efae1e',
        requestsToday: 0,
        dailyLimit: 100,
        consecutiveErrors: 0,
    },
];

// Current provider index for rotation
let currentProviderIndex = 0;

// ─────────────────────────────────────────────────────────────────────────────
// US HEALTHCARE KEYWORDS
// ─────────────────────────────────────────────────────────────────────────────

const HEALTHCARE_COMPANIES = [
    'UnitedHealth', 'UnitedHealthcare', 'CVS Health', 'CVS', 'Cigna',
    'Humana', 'Anthem', 'Elevance', 'Kaiser Permanente', 'Kaiser',
    'HCA Healthcare', 'HCA', 'Tenet Healthcare', 'Centene', 'Molina',
    'WellCare', 'Aetna', 'Blue Cross', 'Blue Shield', 'BCBS',
    'Optum', 'Express Scripts', 'Walgreens', 'McKesson',
    'AmerisourceBergen', 'Cardinal Health', 'Pfizer', 'Johnson & Johnson',
    'Merck', 'AbbVie', 'Bristol-Myers', 'Eli Lilly', 'Amgen', 'Gilead',
    'Moderna', 'Regeneron', 'Biogen', 'Vertex', 'Illumina',
];

const HEALTHCARE_REGULATORY = [
    'FDA', 'CMS', 'HHS', 'CDC', 'NIH', 'HIPAA', 'Medicare', 'Medicaid',
    'drug approval', 'clinical trial', 'drug recall', 'EUA',
    'emergency use authorization', 'ACA', 'Affordable Care Act',
    'healthcare policy', 'pharmaceutical regulation',
    '340B', 'PBM', 'pharmacy benefit', 'prior authorization',
];

const HEALTHCARE_TECHNOLOGY = [
    'EHR', 'electronic health record', 'Epic Systems', 'Cerner', 'Oracle Health',
    'telehealth', 'telemedicine', 'digital health', 'health tech', 'healthtech',
    'medical device', 'MedTech', 'health AI', 'healthcare AI', 'AI diagnosis',
    'remote patient monitoring', 'RPM', 'wearable health', 'digital therapeutics',
];

const HEALTHCARE_TOPICS = [
    'drug pricing', 'hospital', 'health insurance', 'healthcare costs',
    'pharmacy', 'claims', 'reimbursement', 'value-based care',
    'healthcare spending', 'medical debt', 'health equity', 'patient care',
    'nursing shortage', 'healthcare workforce', 'mental health', 'behavioral health',
];

// Combined search queries for APIs - RCM & AI/ML focused
const SEARCH_QUERIES = [
    'healthcare revenue cycle management',
    'healthcare AI automation',
    'RCM technology healthcare',
    'prior authorization automation',
    'healthcare claims processing',
    'eligibility verification healthcare',
    'healthcare technology acquisition',
    'digital health AI',
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

function classifyDomain(title: string, description: string): SignalDomain {
    const text = `${title} ${description}`.toLowerCase();

    const competitivePatterns = [
        /acqui(re|sition|red)/i, /merger/i, /earnings/i, /revenue/i,
        /stock/i, /shares/i, /market cap/i, /CEO/i, /leadership/i,
        /partnership/i, /deal/i, /contract/i, /lawsuit/i,
    ];
    for (const company of HEALTHCARE_COMPANIES) {
        if (text.includes(company.toLowerCase())) {
            if (competitivePatterns.some(p => p.test(text))) {
                return 'COMPETITIVE';
            }
        }
    }

    const regulatoryPatterns = [
        /fda/i, /cms/i, /hhs/i, /approval/i, /clearance/i, /recall/i,
        /regulation/i, /policy/i, /mandate/i, /compliance/i, /hipaa/i,
        /medicare/i, /medicaid/i, /legislation/i, /law/i, /rule/i,
    ];
    if (regulatoryPatterns.some(p => p.test(text))) {
        return 'REGULATORY';
    }

    const techPatterns = [
        /ehr/i, /electronic health/i, /telehealth/i, /telemedicine/i,
        /digital health/i, /health tech/i, /ai\s/i, /artificial intelligence/i,
        /machine learning/i, /wearable/i, /app/i, /platform/i, /software/i,
    ];
    if (techPatterns.some(p => p.test(text))) {
        return 'TECHNOLOGY';
    }

    const marketPatterns = [
        /market/i, /investor/i, /funding/i, /ipo/i, /valuation/i,
        /venture/i, /private equity/i, /growth/i, /forecast/i,
    ];
    if (marketPatterns.some(p => p.test(text))) {
        return 'MARKET';
    }

    return 'NEWS';
}

function determinePriority(title: string, description: string): SignalPriority {
    const text = `${title} ${description}`.toLowerCase();

    const criticalPatterns = [
        /recall/i, /warning/i, /emergency/i, /urgent/i, /breaking/i,
        /fda\s+(approve|reject|halt)/i, /death/i, /outbreak/i,
    ];
    if (criticalPatterns.some(p => p.test(text))) {
        return 'critical';
    }

    const highPatterns = [
        /acqui/i, /merger/i, /billion/i, /major/i, /significant/i,
        /announce/i, /launch/i, /partnership/i, /contract/i,
    ];
    if (highPatterns.some(p => p.test(text))) {
        return 'high';
    }

    const mediumPatterns = [
        /report/i, /study/i, /research/i, /update/i, /expand/i,
        /grow/i, /increase/i, /decrease/i,
    ];
    if (mediumPatterns.some(p => p.test(text))) {
        return 'medium';
    }

    return 'low';
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTHCARE RELEVANCE FILTER
// ─────────────────────────────────────────────────────────────────────────────

function isHealthcareRelevant(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();

    const allKeywords = [
        ...HEALTHCARE_COMPANIES,
        ...HEALTHCARE_REGULATORY,
        ...HEALTHCARE_TECHNOLOGY,
        ...HEALTHCARE_TOPICS,
    ];

    return allKeywords.some(keyword =>
        text.includes(keyword.toLowerCase())
    );
}

function calculateRelevanceScore(title: string, description: string): number {
    const text = `${title} ${description}`.toLowerCase();
    let score = 0;

    const allKeywords = [
        ...HEALTHCARE_COMPANIES,
        ...HEALTHCARE_REGULATORY,
        ...HEALTHCARE_TECHNOLOGY,
        ...HEALTHCARE_TOPICS,
    ];

    for (const keyword of allKeywords) {
        if (text.includes(keyword.toLowerCase())) {
            if (HEALTHCARE_COMPANIES.includes(keyword)) {
                score += 0.15;
            } else if (HEALTHCARE_REGULATORY.includes(keyword)) {
                score += 0.12;
            } else {
                score += 0.08;
            }
        }
    }

    return Math.min(1.0, Math.max(0.3, score));
}

function extractEntities(title: string, description: string): SignalEntities {
    const text = `${title} ${description}`;
    const companies: string[] = [];
    const topics: string[] = [];
    const regulations: string[] = [];

    for (const company of HEALTHCARE_COMPANIES) {
        if (text.toLowerCase().includes(company.toLowerCase())) {
            companies.push(company);
        }
    }

    for (const reg of HEALTHCARE_REGULATORY) {
        if (text.toLowerCase().includes(reg.toLowerCase())) {
            if (['FDA', 'CMS', 'HHS', 'CDC', 'NIH', 'HIPAA', 'ACA'].includes(reg)) {
                regulations.push(reg);
            } else {
                topics.push(reg);
            }
        }
    }

    for (const topic of HEALTHCARE_TOPICS) {
        if (text.toLowerCase().includes(topic.toLowerCase())) {
            topics.push(topic);
        }
    }

    return {
        companies: [...new Set(companies)].slice(0, 5),
        people: [],
        topics: [...new Set(topics)].slice(0, 5),
        products: [],
        regulations: [...new Set(regulations)].slice(0, 5),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// API FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

interface RawArticle {
    title: string;
    description: string;
    content?: string;
    url: string;
    image?: string;
    publishedAt: string;
    source: { name: string; url?: string };
}

async function fetchFromNewsData(query: string): Promise<RawArticle[]> {
    const provider = NEWS_PROVIDERS[0];
    const url = `${provider.baseUrl}?apikey=${provider.apiKey}&q=${encodeURIComponent(query)}&country=us&language=en&category=health,business`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NewsData API error: ${response.status}`);
        }

        const data = await response.json();
        provider.requestsToday++;
        provider.consecutiveErrors = 0;

        if (data.status !== 'success' || !data.results) {
            return [];
        }

        return data.results.map((article: {
            title: string;
            description: string;
            content?: string;
            link: string;
            image_url?: string;
            pubDate: string;
            source_id: string;
            source_url?: string;
        }) => ({
            title: article.title || '',
            description: article.description || '',
            content: article.content,
            url: article.link,
            image: article.image_url,
            publishedAt: article.pubDate,
            source: { name: article.source_id, url: article.source_url },
        }));
    } catch (error) {
        console.error('[NewsData] Fetch error:', error);
        provider.consecutiveErrors++;
        provider.lastError = new Date();
        throw error;
    }
}

async function fetchFromGNews(query: string): Promise<RawArticle[]> {
    const provider = NEWS_PROVIDERS[1];
    const url = `${provider.baseUrl}?q=${encodeURIComponent(query)}&token=${provider.apiKey}&lang=en&country=us&max=10`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`GNews API error: ${response.status}`);
        }

        const data = await response.json();
        provider.requestsToday++;
        provider.consecutiveErrors = 0;

        if (!data.articles) {
            return [];
        }

        return data.articles.map((article: {
            title: string;
            description: string;
            content?: string;
            url: string;
            image?: string;
            publishedAt: string;
            source: { name: string; url?: string };
        }) => ({
            title: article.title || '',
            description: article.description || '',
            content: article.content,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            source: article.source,
        }));
    } catch (error) {
        console.error('[GNews] Fetch error:', error);
        provider.consecutiveErrors++;
        provider.lastError = new Date();
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENT ROTATION & FAILOVER
// ─────────────────────────────────────────────────────────────────────────────

function getNextProvider(): NewsProvider | null {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const provider of NEWS_PROVIDERS) {
        if (provider.lastError && provider.lastError < startOfDay) {
            provider.requestsToday = 0;
            provider.consecutiveErrors = 0;
        }
    }

    for (let i = 0; i < NEWS_PROVIDERS.length; i++) {
        const index = (currentProviderIndex + i) % NEWS_PROVIDERS.length;
        const provider = NEWS_PROVIDERS[index];

        if (provider.requestsToday >= provider.dailyLimit) {
            continue;
        }

        if (provider.consecutiveErrors >= 3 && provider.lastError) {
            const cooldownMs = 5 * 60 * 1000;
            if (now.getTime() - provider.lastError.getTime() < cooldownMs) {
                continue;
            }
        }

        currentProviderIndex = (index + 1) % NEWS_PROVIDERS.length;
        return provider;
    }

    return null;
}

async function fetchWithFailover(query: string): Promise<RawArticle[]> {
    const triedProviders = new Set<string>();

    while (triedProviders.size < NEWS_PROVIDERS.length) {
        const provider = getNextProvider();

        if (!provider) {
            console.warn('[NewsService] All providers exhausted or in cooldown');
            break;
        }

        if (triedProviders.has(provider.name)) {
            break;
        }
        triedProviders.add(provider.name);

        try {
            console.log(`[NewsService] Fetching from ${provider.name}...`);

            if (provider.name === 'NewsData') {
                return await fetchFromNewsData(query);
            } else if (provider.name === 'GNews') {
                return await fetchFromGNews(query);
            }
        } catch {
            console.warn(`[NewsService] ${provider.name} failed, trying next provider...`);
        }
    }

    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFORM TO PULSE SIGNALS
// ─────────────────────────────────────────────────────────────────────────────

function createSignalSource(sourceName: string, sourceUrl?: string): SignalSource {
    return {
        id: `src-${sourceName.toLowerCase().replace(/\s+/g, '-')}`,
        name: sourceName,
        tier: 2,
        type: 'api',
        url: sourceUrl,
    };
}

function articleToPulseSignal(article: RawArticle, index: number): PulseSignal {
    const domain = classifyDomain(article.title, article.description);
    const priority = determinePriority(article.title, article.description);
    const relevanceScore = calculateRelevanceScore(article.title, article.description);
    const entities = extractEntities(article.title, article.description);
    const now = new Date().toISOString();

    return {
        id: `news-${Date.now()}-${index}`,
        title: article.title,
        summary: article.description || article.content?.substring(0, 200) || '',
        url: article.url,
        imageUrl: article.image,
        domain,
        signalType: 'NEWS',
        priority,
        relevanceScore,
        importanceScore: relevanceScore * (priority === 'critical' ? 1.0 : priority === 'high' ? 0.8 : priority === 'medium' ? 0.6 : 0.4),
        source: createSignalSource(article.source.name, article.source.url),
        publishedAt: article.publishedAt || now,
        processedAt: now,
        entities,
        isRead: false,
        isBookmarked: false,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE & STATE
// ─────────────────────────────────────────────────────────────────────────────

let cachedSignals: PulseSignal[] = [];
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTimestamp: Date | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API (matches usePulseStore expectations)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchNewsSignals(force = false): Promise<PulseSignal[]> {
    // Return cached if fresh and not forced
    if (!force && cachedSignals.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
        console.log('[NewsService] Returning cached signals');
        return cachedSignals;
    }

    console.log('[NewsService] Fetching fresh healthcare news...');
    const allArticles: RawArticle[] = [];

    // Fetch from multiple queries for broader coverage
    const queriesToUse = SEARCH_QUERIES.slice(0, 2); // Limit to conserve API calls

    for (const query of queriesToUse) {
        try {
            const articles = await fetchWithFailover(query);
            allArticles.push(...articles);
        } catch (error) {
            console.error('[NewsService] Query failed:', query, error);
        }
    }

    // Filter for healthcare relevance
    const healthcareArticles = allArticles.filter(article =>
        isHealthcareRelevant(article.title, article.description)
    );

    console.log(`[NewsService] Found ${healthcareArticles.length} healthcare-relevant articles from ${allArticles.length} total`);

    // Remove duplicates by URL
    const uniqueArticles = healthcareArticles.filter((article, index, self) =>
        index === self.findIndex(a => a.url === article.url)
    );

    // Transform to PulseSignals
    const signals = uniqueArticles.map((article, index) =>
        articleToPulseSignal(article, index)
    );

    // Sort by priority then recency
    signals.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Cache results
    cachedSignals = signals.slice(0, 20);
    cacheTimestamp = Date.now();
    lastFetchTimestamp = new Date();

    return cachedSignals;
}

export function getLastFetchTimestamp(): Date | null {
    return lastFetchTimestamp;
}

export function canRefresh(): boolean {
    if (!lastFetchTimestamp) return true;
    return Date.now() - lastFetchTimestamp.getTime() >= CACHE_TTL;
}

export function getRateLimitStatus(): { used: number; remaining: number } {
    const totalUsed = NEWS_PROVIDERS.reduce((sum, p) => sum + p.requestsToday, 0);
    const totalLimit = NEWS_PROVIDERS.reduce((sum, p) => sum + p.dailyLimit, 0);
    return {
        used: totalUsed,
        remaining: totalLimit - totalUsed,
    };
}

export function getProviderStats(): { name: string; requestsToday: number; dailyLimit: number; status: string }[] {
    return NEWS_PROVIDERS.map(p => ({
        name: p.name,
        requestsToday: p.requestsToday,
        dailyLimit: p.dailyLimit,
        status: p.consecutiveErrors >= 3 ? 'cooldown' : p.requestsToday >= p.dailyLimit ? 'exhausted' : 'active',
    }));
}

export function clearNewsCache(): void {
    cachedSignals = [];
    cacheTimestamp = 0;
    console.log('[NewsService] Cache cleared');
}

// Export for testing
export { isHealthcareRelevant, classifyDomain, determinePriority };
