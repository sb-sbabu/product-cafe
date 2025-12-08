// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Google Custom Search Service
// US Healthcare Market Intelligence with STRICT Daily Limits
// MAX 40-50 searches per day across ALL users (cost protection)
// ═══════════════════════════════════════════════════════════════════════════

import type { PulseSignal, SignalDomain, SignalPriority, SignalSource, SignalEntities } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = 'AIzaSyCKcFz_TrXYpS8DoGOLHH82LO-9hHTJr3Y';
const GOOGLE_SEARCH_ENGINE_ID = '0378edd08dd904791'; // Custom Search Engine ID

// STRICT LIMITS - Never exceed these no matter what
const DAILY_LIMIT_ABSOLUTE = 40; // Hard limit, never exceed
const DAILY_LIMIT_WARNING = 30;  // Start conserving after this
const STORAGE_KEY = 'pulse_google_search_usage';

// ─────────────────────────────────────────────────────────────────────────────
// USAGE TRACKING (Persisted across sessions)
// ─────────────────────────────────────────────────────────────────────────────

interface UsageData {
    date: string;           // YYYY-MM-DD format
    count: number;          // Searches used today
    lastSearchTime: number; // Timestamp of last search
}

function getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getUsageData(): UsageData {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored) as UsageData;
            // Reset if it's a new day
            if (data.date !== getTodayDate()) {
                return { date: getTodayDate(), count: 0, lastSearchTime: 0 };
            }
            return data;
        }
    } catch {
        // Ignore parse errors
    }
    return { date: getTodayDate(), count: 0, lastSearchTime: 0 };
}

function saveUsageData(data: UsageData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Ignore quota errors
    }
}

function incrementUsage(): void {
    const data = getUsageData();
    data.count++;
    data.lastSearchTime = Date.now();
    saveUsageData(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: CHECK IF SEARCH IS ALLOWED
// ─────────────────────────────────────────────────────────────────────────────

export function canPerformGoogleSearch(): { allowed: boolean; reason?: string; remaining: number } {
    const usage = getUsageData();
    const remaining = DAILY_LIMIT_ABSOLUTE - usage.count;

    if (usage.count >= DAILY_LIMIT_ABSOLUTE) {
        return {
            allowed: false,
            reason: `Daily limit reached (${DAILY_LIMIT_ABSOLUTE}). Resets at midnight.`,
            remaining: 0,
        };
    }

    // Rate limit: minimum 30 seconds between searches to prevent abuse
    const timeSinceLastSearch = Date.now() - usage.lastSearchTime;
    if (timeSinceLastSearch < 30000 && usage.count > 0) {
        return {
            allowed: false,
            reason: `Please wait ${Math.ceil((30000 - timeSinceLastSearch) / 1000)} seconds before next search.`,
            remaining,
        };
    }

    return { allowed: true, remaining };
}

export function getGoogleSearchStats(): { used: number; remaining: number; limitReached: boolean; conserveMode: boolean } {
    const usage = getUsageData();
    const remaining = DAILY_LIMIT_ABSOLUTE - usage.count;
    return {
        used: usage.count,
        remaining,
        limitReached: usage.count >= DAILY_LIMIT_ABSOLUTE,
        conserveMode: usage.count >= DAILY_LIMIT_WARNING,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// US HEALTHCARE KEYWORDS (for filtering)
// ─────────────────────────────────────────────────────────────────────────────

const HEALTHCARE_COMPANIES = [
    'UnitedHealth', 'CVS Health', 'Cigna', 'Humana', 'Anthem', 'Elevance',
    'Kaiser Permanente', 'HCA Healthcare', 'Centene', 'Aetna',
    'Optum', 'Pfizer', 'Johnson & Johnson', 'Merck', 'AbbVie',
    'Moderna', 'Regeneron', 'Biogen', 'Vertex',
];

const HEALTHCARE_REGULATORY = [
    'FDA', 'CMS', 'HHS', 'CDC', 'NIH', 'HIPAA', 'Medicare', 'Medicaid',
    'ACA', 'Affordable Care Act',
];

const HEALTHCARE_TECH = [
    'telehealth', 'telemedicine', 'digital health', 'EHR', 'electronic health record',
    'health AI', 'medical device',
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

function classifyDomain(title: string, snippet: string): SignalDomain {
    const text = `${title} ${snippet}`.toLowerCase();

    const competitivePatterns = [/acqui/i, /merger/i, /earnings/i, /stock/i, /ceo/i, /partnership/i];
    for (const company of HEALTHCARE_COMPANIES) {
        if (text.includes(company.toLowerCase())) {
            if (competitivePatterns.some(p => p.test(text))) {
                return 'COMPETITIVE';
            }
        }
    }

    const regulatoryPatterns = [/fda/i, /cms/i, /approval/i, /regulation/i, /policy/i, /medicare/i, /medicaid/i];
    if (regulatoryPatterns.some(p => p.test(text))) {
        return 'REGULATORY';
    }

    const techPatterns = [/telehealth/i, /digital health/i, /ai\s/i, /ehr/i, /software/i];
    if (techPatterns.some(p => p.test(text))) {
        return 'TECHNOLOGY';
    }

    const marketPatterns = [/market/i, /investor/i, /funding/i, /ipo/i, /valuation/i];
    if (marketPatterns.some(p => p.test(text))) {
        return 'MARKET';
    }

    return 'NEWS';
}

function determinePriority(title: string, snippet: string): SignalPriority {
    const text = `${title} ${snippet}`.toLowerCase();

    if (/recall|warning|emergency|breaking|urgent/.test(text)) return 'critical';
    if (/acqui|merger|billion|major|announce|launch/.test(text)) return 'high';
    if (/report|study|research|update|grow/.test(text)) return 'medium';
    return 'low';
}

function calculateRelevanceScore(title: string, snippet: string): number {
    const text = `${title} ${snippet}`.toLowerCase();
    let score = 0.3;

    const allKeywords = [...HEALTHCARE_COMPANIES, ...HEALTHCARE_REGULATORY, ...HEALTHCARE_TECH];
    for (const keyword of allKeywords) {
        if (text.includes(keyword.toLowerCase())) {
            score += 0.1;
        }
    }

    return Math.min(1.0, score);
}

function extractEntities(title: string, snippet: string): SignalEntities {
    const text = `${title} ${snippet}`;
    const companies: string[] = [];
    const regulations: string[] = [];
    const topics: string[] = [];

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

    return {
        companies: [...new Set(companies)].slice(0, 5),
        people: [],
        topics: [...new Set(topics)].slice(0, 5),
        products: [],
        regulations: [...new Set(regulations)].slice(0, 5),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CUSTOM SEARCH API
// ─────────────────────────────────────────────────────────────────────────────

interface GoogleSearchResult {
    title: string;
    link: string;
    snippet: string;
    pagemap?: {
        cse_thumbnail?: Array<{ src: string }>;
        metatags?: Array<{ 'og:image'?: string }>;
    };
}

interface GoogleSearchResponse {
    items?: GoogleSearchResult[];
    searchInformation?: {
        totalResults: string;
    };
    error?: {
        message: string;
        code: number;
    };
}

function createSignalSource(url: string): SignalSource {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        return {
            id: `google-${hostname}`,
            name: hostname,
            tier: 2,
            type: 'crawl',
            url: url,
        };
    } catch {
        return {
            id: 'google-search',
            name: 'Google Search',
            tier: 2,
            type: 'crawl',
        };
    }
}

function resultToPulseSignal(result: GoogleSearchResult, index: number): PulseSignal {
    const domain = classifyDomain(result.title, result.snippet);
    const priority = determinePriority(result.title, result.snippet);
    const relevanceScore = calculateRelevanceScore(result.title, result.snippet);
    const entities = extractEntities(result.title, result.snippet);
    const now = new Date().toISOString();

    let imageUrl: string | undefined;
    if (result.pagemap?.cse_thumbnail?.[0]?.src) {
        imageUrl = result.pagemap.cse_thumbnail[0].src;
    } else if (result.pagemap?.metatags?.[0]?.['og:image']) {
        imageUrl = result.pagemap.metatags[0]['og:image'];
    }

    return {
        id: `google-${Date.now()}-${index}`,
        title: result.title,
        summary: result.snippet,
        url: result.link,
        imageUrl,
        domain,
        signalType: 'NEWS',
        priority,
        relevanceScore,
        importanceScore: relevanceScore * (priority === 'critical' ? 1.0 : priority === 'high' ? 0.8 : 0.6),
        source: createSignalSource(result.link),
        publishedAt: now,
        processedAt: now,
        entities,
        isRead: false,
        isBookmarked: false,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: PERFORM GOOGLE SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export async function searchGoogleHealthcare(query: string): Promise<{
    signals: PulseSignal[];
    error?: string;
    usageStats: ReturnType<typeof getGoogleSearchStats>;
}> {
    // Check if search is allowed
    const check = canPerformGoogleSearch();
    if (!check.allowed) {
        return {
            signals: [],
            error: check.reason,
            usageStats: getGoogleSearchStats(),
        };
    }

    // Add healthcare context to query if not present
    const healthcareQuery = query.toLowerCase().includes('health')
        ? query
        : `${query} healthcare United States`;

    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(healthcareQuery)}&num=10`;

    try {
        console.log(`[GoogleSearch] Searching: "${healthcareQuery}" (${getUsageData().count + 1}/${DAILY_LIMIT_ABSOLUTE} today)`);

        const response = await fetch(url);
        const data: GoogleSearchResponse = await response.json();

        // Increment usage AFTER successful API call
        incrementUsage();

        if (data.error) {
            console.error('[GoogleSearch] API Error:', data.error.message);
            return {
                signals: [],
                error: data.error.message,
                usageStats: getGoogleSearchStats(),
            };
        }

        if (!data.items || data.items.length === 0) {
            return {
                signals: [],
                error: 'No results found',
                usageStats: getGoogleSearchStats(),
            };
        }

        const signals = data.items.map((result, index) => resultToPulseSignal(result, index));

        console.log(`[GoogleSearch] Found ${signals.length} results`);
        return {
            signals,
            usageStats: getGoogleSearchStats(),
        };

    } catch (error) {
        console.error('[GoogleSearch] Fetch error:', error);
        return {
            signals: [],
            error: error instanceof Error ? error.message : 'Search failed',
            usageStats: getGoogleSearchStats(),
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART SEARCH (Conserves API calls when in conservation mode)
// ─────────────────────────────────────────────────────────────────────────────

let searchCache: Map<string, { signals: PulseSignal[]; timestamp: number }> = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minute cache for Google results

export async function smartSearchHealthcare(query: string): Promise<{
    signals: PulseSignal[];
    error?: string;
    cached: boolean;
    usageStats: ReturnType<typeof getGoogleSearchStats>;
}> {
    const normalizedQuery = query.toLowerCase().trim();
    const stats = getGoogleSearchStats();

    // Check cache first
    const cached = searchCache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[GoogleSearch] Returning cached results for: "${query}"`);
        return {
            signals: cached.signals,
            cached: true,
            usageStats: stats,
        };
    }

    // If in conserve mode, extend cache TTL
    if (stats.conserveMode) {
        const extendedCache = searchCache.get(normalizedQuery);
        if (extendedCache && Date.now() - extendedCache.timestamp < CACHE_TTL * 2) {
            console.log(`[GoogleSearch] Conservation mode - returning extended cache for: "${query}"`);
            return {
                signals: extendedCache.signals,
                cached: true,
                usageStats: stats,
            };
        }
    }

    // Perform actual search
    const result = await searchGoogleHealthcare(query);

    // Cache successful results
    if (result.signals.length > 0) {
        searchCache.set(normalizedQuery, {
            signals: result.signals,
            timestamp: Date.now(),
        });
    }

    return {
        ...result,
        cached: false,
    };
}

// Clear cache (for testing)
export function clearGoogleSearchCache(): void {
    searchCache.clear();
    console.log('[GoogleSearch] Cache cleared');
}

// Reset daily usage (for testing only)
export function resetDailyUsage(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[GoogleSearch] Daily usage reset');
}
