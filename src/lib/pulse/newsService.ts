import type { PulseSignal, SignalDomain, SignalType, SignalPriority, SignalEntities } from './types';
import { API_CONFIG, TIER_1_COMPETITORS } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — News Service
// Implements strict rate limiting for NewsAPI (100 calls/day)
// ═══════════════════════════════════════════════════════════════════════════

// API Configuration (environment variable with fallback for development)
const NEWS_API_KEY = import.meta.env.VITE_NEWSAPI_KEY || 'c7ad7aa3a77141f88dde0a0ebd1e8483';
const BASE_URL = 'https://newsapi.org/v2/everything';

// Network configuration
const NETWORK_CONFIG = {
    TIMEOUT_MS: 15000,           // 15 second timeout
    MAX_RETRIES: 2,              // Retry failed requests twice
    RETRY_DELAY_MS: 1000,        // 1 second between retries
} as const;

// Cache keys
const CACHE_KEY = 'cafe-pulse-signals-cache';
const LAST_FETCH_KEY = 'cafe-pulse-last-fetch';
const FETCH_COUNT_KEY = 'cafe-pulse-fetch-count';

// Active fetch abort controller (for race condition prevention)
let activeFetchController: AbortController | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// NewsAPI Response Types
// ─────────────────────────────────────────────────────────────────────────────

interface NewsApiArticle {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsApiArticle[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache Management
// ─────────────────────────────────────────────────────────────────────────────

function getLastFetchTime(): number | null {
    const stored = localStorage.getItem(LAST_FETCH_KEY);
    return stored ? parseInt(stored, 10) : null;
}

function getCacheAge(): number {
    const lastFetch = getLastFetchTime();
    if (!lastFetch) return Infinity;
    return Date.now() - lastFetch;
}

function isCacheValid(): boolean {
    return getCacheAge() < API_CONFIG.CACHE_DURATION_MS;
}

function getCachedSignals(): PulseSignal[] {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return [];

        const parsed = JSON.parse(cached);

        // Validate it's an array
        if (!Array.isArray(parsed)) {
            console.warn('Pulse: Cache data is not an array, clearing');
            localStorage.removeItem(CACHE_KEY);
            return [];
        }

        // Basic schema validation - filter out malformed signals
        return parsed.filter((signal: unknown): signal is PulseSignal => {
            if (!signal || typeof signal !== 'object') return false;
            const s = signal as Record<string, unknown>;
            return (
                typeof s.id === 'string' &&
                typeof s.title === 'string' &&
                typeof s.domain === 'string' &&
                typeof s.priority === 'string'
            );
        });
    } catch (e) {
        console.warn('Pulse: Failed to parse cached signals, clearing', e);
        try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
        return [];
    }
}

function setCachedSignals(signals: PulseSignal[]): void {
    try {
        const data = JSON.stringify(signals);
        localStorage.setItem(CACHE_KEY, data);
        localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
    } catch (e) {
        // Handle quota exceeded error
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
            console.warn('⚠️ Pulse: Storage quota exceeded, clearing old cache');
            try {
                localStorage.removeItem(CACHE_KEY);
                localStorage.setItem(CACHE_KEY, JSON.stringify(signals.slice(0, 15))); // Keep only recent
                localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
            } catch {
                console.error('Pulse: Failed to cache signals even after clearing');
            }
        } else {
            console.warn('Pulse: Failed to cache signals', e);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Tracking
// ─────────────────────────────────────────────────────────────────────────────

function getTodaysFetchCount(): number {
    try {
        const data = localStorage.getItem(FETCH_COUNT_KEY);
        if (!data) return 0;
        const { date, count } = JSON.parse(data);
        const today = new Date().toISOString().split('T')[0];
        return date === today ? count : 0;
    } catch {
        return 0;
    }
}

function incrementFetchCount(): void {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentCount = getTodaysFetchCount();
        localStorage.setItem(FETCH_COUNT_KEY, JSON.stringify({ date: today, count: currentCount + 1 }));
    } catch (e) {
        console.warn('Pulse: Failed to increment fetch count', e);
    }
}

export function getRateLimitStatus(): { used: number; remaining: number; nextRefreshIn: number } {
    const used = getTodaysFetchCount();
    const remaining = API_CONFIG.MAX_CALLS_PER_DAY - used;
    const cacheAge = getCacheAge();
    const nextRefreshIn = Math.max(0, API_CONFIG.CACHE_DURATION_MS - cacheAge);
    return { used, remaining, nextRefreshIn };
}

// ─────────────────────────────────────────────────────────────────────────────
// Signal Scoring (from PRD §3.3)
// ─────────────────────────────────────────────────────────────────────────────

function calculateRelevanceScore(article: NewsApiArticle, entities: SignalEntities): number {
    let score = 0.3; // Base relevance for healthcare news

    const text = `${article.title} ${article.description || ''}`.toLowerCase();

    // Competitor mentions (+0.3)
    if (entities.companies.length > 0) score += 0.3;

    // Healthcare keywords (+0.2)
    const healthcareKeywords = ['healthcare', 'health care', 'medical', 'hospital', 'payer', 'provider', 'cms', 'medicaid', 'medicare'];
    if (healthcareKeywords.some(kw => text.includes(kw))) score += 0.2;

    // Availity-specific topics (+0.2)
    const availityTopics = ['prior auth', 'eligibility', 'claims', 'rcm', 'revenue cycle', 'fhir', 'interoperability'];
    if (availityTopics.some(kw => text.includes(kw))) score += 0.2;

    return Math.min(1, score);
}

function calculateImportanceScore(article: NewsApiArticle, entities: SignalEntities, signalType: SignalType): number {
    let score = 0.2; // Base importance

    // Signal type weight
    const typeWeights: Partial<Record<SignalType, number>> = {
        M_AND_A: 0.4,
        FUNDING: 0.35,
        FINAL_RULE: 0.35,
        PRODUCT_LAUNCH: 0.3,
        LEADERSHIP: 0.25,
        PARTNERSHIP: 0.25,
        ENFORCEMENT: 0.3,
    };
    score += typeWeights[signalType] || 0.1;

    // Tier 1 competitor mention (+0.25)
    const tier1Names = TIER_1_COMPETITORS.map(c => c.name.toLowerCase());
    if (entities.companies.some(c => tier1Names.includes(c.toLowerCase()))) {
        score += 0.25;
    }

    // Recency boost (articles within 24h)
    const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) score += 0.15;
    else if (ageHours < 72) score += 0.05;

    return Math.min(1, score);
}

function determinePriority(importanceScore: number): SignalPriority {
    if (importanceScore >= 0.8) return 'critical';
    if (importanceScore >= 0.6) return 'high';
    if (importanceScore >= 0.4) return 'medium';
    return 'low';
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Extraction (Basic keyword matching)
// ─────────────────────────────────────────────────────────────────────────────

function extractEntities(article: NewsApiArticle): SignalEntities {
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`;
    const textLower = text.toLowerCase();

    // Extract companies
    const companies: string[] = [];
    const companyPatterns = [
        'Waystar', 'Change Healthcare', 'Optum', 'UnitedHealth', 'Availity',
        'Epic', 'Cerner', 'Oracle Health', 'athenahealth', 'R1 RCM',
        'Inovalon', 'Trizetto', 'Experian Health', 'Rhyme', 'Edifecs',
        'Cotiviti', 'Zelis', 'Cohere Health', 'Infinitus', 'Tennr', 'Akasa',
    ];
    companyPatterns.forEach(company => {
        if (textLower.includes(company.toLowerCase())) {
            companies.push(company);
        }
    });

    // Extract topics
    const topics: string[] = [];
    const topicPatterns: Record<string, string> = {
        'prior auth': 'Prior Authorization',
        'revenue cycle': 'RCM',
        'claims': 'Claims Processing',
        'eligibility': 'Eligibility',
        'interoperability': 'Interoperability',
        'fhir': 'FHIR',
        'artificial intelligence': 'AI/ML',
        ' ai ': 'AI/ML',
        'machine learning': 'AI/ML',
        'cms': 'CMS',
        'hipaa': 'HIPAA',
        'merger': 'M&A',
        'acquisition': 'M&A',
    };
    Object.entries(topicPatterns).forEach(([pattern, topic]) => {
        if (textLower.includes(pattern) && !topics.includes(topic)) {
            topics.push(topic);
        }
    });

    return {
        companies,
        people: [],
        topics,
        products: [],
        regulations: [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain & Signal Type Classification
// ─────────────────────────────────────────────────────────────────────────────

function classifySignal(article: NewsApiArticle, entities: SignalEntities): { domain: SignalDomain; signalType: SignalType } {
    const text = `${article.title} ${article.description || ''}`.toLowerCase();

    // Domain classification
    let domain: SignalDomain = 'NEWS';

    if (entities.companies.length > 0) {
        domain = 'COMPETITIVE';
    } else if (text.includes('cms') || text.includes('regulation') || text.includes('rule') || text.includes('compliance')) {
        domain = 'REGULATORY';
    } else if (text.includes('ai') || text.includes('technology') || text.includes('fhir') || text.includes('api')) {
        domain = 'TECHNOLOGY';
    } else if (text.includes('funding') || text.includes('acquisition') || text.includes('merger') || text.includes('investment')) {
        domain = 'MARKET';
    }

    // Signal type classification
    let signalType: SignalType = 'NEWS';

    if (text.includes('acqui') || text.includes('merger') || text.includes('buys') || text.includes('purchase')) {
        signalType = 'M_AND_A';
    } else if (text.includes('funding') || text.includes('raises') || text.includes('investment') || text.includes('series')) {
        signalType = 'FUNDING';
    } else if (text.includes('launch') || text.includes('announces') || text.includes('releases') || text.includes('introduces')) {
        signalType = 'PRODUCT_LAUNCH';
    } else if (text.includes('partner') || text.includes('collaboration') || text.includes('alliance')) {
        signalType = 'PARTNERSHIP';
    } else if (text.includes('ceo') || text.includes('cfo') || text.includes('appoint') || text.includes('hire') || text.includes('joins')) {
        signalType = 'LEADERSHIP';
    } else if (text.includes('final rule') || text.includes('finalizes')) {
        signalType = 'FINAL_RULE';
    } else if (text.includes('proposed rule') || text.includes('proposes')) {
        signalType = 'PROPOSED_RULE';
    }

    return { domain, signalType };
}

// ─────────────────────────────────────────────────────────────────────────────
// Article → Signal Transformation
// ─────────────────────────────────────────────────────────────────────────────

function normalizeArticle(article: NewsApiArticle): PulseSignal | null {
    // Validate required fields
    if (!article.url || !article.title || article.title === '[Removed]') {
        return null;
    }

    const entities = extractEntities(article);
    const { domain, signalType } = classifySignal(article, entities);
    const relevanceScore = calculateRelevanceScore(article, entities);
    const importanceScore = calculateImportanceScore(article, entities, signalType);
    const priority = determinePriority(importanceScore);

    // Safe ID generation that handles Unicode characters
    const safeHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    };

    // Safe URL hostname extraction
    let hostname = 'unknown';
    try {
        hostname = new URL(article.url).hostname;
    } catch {
        // Invalid URL, use fallback
    }

    return {
        id: `signal-${safeHash(article.url)}`,
        hash: safeHash(article.title),
        title: article.title,
        summary: article.description || '',
        url: article.url,
        imageUrl: article.urlToImage || undefined,
        publishedAt: article.publishedAt,
        processedAt: new Date().toISOString(),
        domain,
        signalType,
        priority,
        relevanceScore,
        importanceScore,
        entities,
        source: {
            id: article.source.id || 'newsapi',
            name: article.source.name,
            tier: 1,
            type: 'api',
            favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
        },
        isRead: false,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Network Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Check if browser is offline */
function isOffline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/** Fetch with timeout wrapper */
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = NETWORK_CONFIG.TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw error;
    }
}

/** Sleep utility for retry delays */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// Main Fetch Function
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchNewsSignals(forceRefresh = false): Promise<PulseSignal[]> {
    // Abort any in-flight request to prevent race conditions
    if (activeFetchController) {
        activeFetchController.abort();
    }
    activeFetchController = new AbortController();
    const currentController = activeFetchController;

    // Check offline status first
    if (isOffline()) {
        console.warn('📴 Pulse: Browser is offline. Using cache.');
        return getCachedSignals();
    }

    // Check cache first
    if (!forceRefresh && isCacheValid()) {
        if (import.meta.env.DEV) {
            console.log('📦 Pulse: Returning cached signals (cache valid for',
                Math.round((API_CONFIG.CACHE_DURATION_MS - getCacheAge()) / 60000), 'more minutes)');
        }
        return getCachedSignals();
    }

    // Check rate limit
    const { remaining } = getRateLimitStatus();
    if (remaining <= 0) {
        console.warn('⚠️ Pulse: Daily API limit reached. Using cache.');
        return getCachedSignals();
    }

    // Build optimized query
    const query = 'healthcare technology OR health IT OR medical insurance OR prior authorization';

    const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '30',
        apiKey: NEWS_API_KEY,
    });

    const url = `${BASE_URL}?${params.toString()}`;
    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt <= NETWORK_CONFIG.MAX_RETRIES; attempt++) {
        // Check if this request was superseded by a newer one
        if (currentController !== activeFetchController) {
            console.log('🔄 Pulse: Request superseded by newer fetch');
            return getCachedSignals();
        }

        try {
            if (attempt > 0) {
                if (import.meta.env.DEV) {
                    console.log(`🔄 Pulse: Retry attempt ${attempt}/${NETWORK_CONFIG.MAX_RETRIES}`);
                }
                await sleep(NETWORK_CONFIG.RETRY_DELAY_MS * attempt); // Exponential backoff
            }

            if (import.meta.env.DEV && attempt === 0) {
                console.log('🔄 Pulse: Fetching fresh news from NewsAPI...');
            }

            const response = await fetchWithTimeout(url, {
                signal: currentController.signal,
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('⚠️ Pulse: Rate limit exceeded by NewsAPI. Using cache.');
                    return getCachedSignals();
                }
                throw new Error(`NewsAPI Error: ${response.status} ${response.statusText}`);
            }

            const data: NewsApiResponse = await response.json();

            if (data.status !== 'ok') {
                throw new Error('NewsAPI returned error status');
            }

            // Normalize and filter - with defensive error handling
            const signals = data.articles
                .filter(article => article.url && article.title && article.title !== '[Removed]')
                .map(article => {
                    try {
                        return normalizeArticle(article);
                    } catch (e) {
                        if (import.meta.env.DEV) {
                            console.warn('Pulse: Failed to normalize article', article.url, e);
                        }
                        return null;
                    }
                })
                .filter((s): s is PulseSignal => s !== null && s.relevanceScore >= 0.3)
                .sort((a, b) => b.importanceScore - a.importanceScore)
                .slice(0, 100); // Cap at 100 signals max

            if (signals.length === 0 && import.meta.env.DEV) {
                console.info('📭 Pulse: No relevant signals found in API response');
            }

            // Update cache
            setCachedSignals(signals);
            incrementFetchCount();

            if (import.meta.env.DEV) {
                console.log(`✅ Pulse: Fetched ${signals.length} signals (${remaining - 1} API calls remaining today)`);
            }

            return signals;

        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't retry on abort
            if (error instanceof Error && error.name === 'AbortError') {
                return getCachedSignals();
            }

            // Don't retry if offline
            if (isOffline()) {
                console.warn('📴 Pulse: Network went offline. Using cache.');
                return getCachedSignals();
            }
        }
    }

    // All retries failed
    console.error('❌ Pulse: All fetch attempts failed', lastError);
    return getCachedSignals();
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Exports
// ─────────────────────────────────────────────────────────────────────────────

export function getLastFetchTimestamp(): string | null {
    const lastFetch = getLastFetchTime();
    return lastFetch ? new Date(lastFetch).toISOString() : null;
}

export function canRefresh(): boolean {
    return !isCacheValid() || getTodaysFetchCount() < API_CONFIG.SAFE_CALLS_PER_DAY;
}

/** Check if currently online */
export function isOnline(): boolean {
    return !isOffline();
}
