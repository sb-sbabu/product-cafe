// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Intelligent Notification Engine
// The world's best notification system for market intelligence
// Zero fatigue. Total control. 10x better.
// ═══════════════════════════════════════════════════════════════════════════

import type { SignalDomain, SignalPriority, PulseSignal } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — Signal Intelligence Architecture
// ─────────────────────────────────────────────────────────────────────────────

export type UrgencyLevel = 'immediate' | 'timely' | 'batched' | 'digest';

export interface IntelligentSignal {
    id: string;
    signalId: string;
    title: string;
    summary: string;
    domain: SignalDomain;
    priority: SignalPriority;

    // Intelligence Scoring
    sis: number;                    // Signal Intelligence Score (0-100)
    urgency: UrgencyLevel;

    // Clustering
    clusterId?: string;             // Related signals grouped
    clusterCount?: number;          // Number of signals in cluster

    // Delivery
    deliveryTime?: Date;            // Scheduled delivery time
    overridesQuietHours: boolean;

    // Metadata
    createdAt: Date;
    readAt?: Date;
    dismissedAt?: Date;
    feedbackScore?: -1 | 0 | 1;     // User feedback: not helpful, neutral, helpful

    // Source
    sourceUrl?: string;
    sourceIcon?: string;

    // Entities - for competitor matching
    entities?: {
        companies: string[];
    };
}

export interface NotificationCluster {
    id: string;
    title: string;
    domain: SignalDomain;
    signals: IntelligentSignal[];
    topSIS: number;
    urgency: UrgencyLevel;
    createdAt: Date;
}

export interface UserBehaviorData {
    // Engagement patterns
    readRates: Record<SignalDomain, number>;      // % of signals read per domain
    dismissRates: Record<SignalDomain, number>;   // % dismissed without reading
    avgTimeToRead: Record<SignalDomain, number>;  // ms to read per domain

    // Preference signals
    preferredDomains: SignalDomain[];             // Ordered by engagement
    preferredPriorities: SignalPriority[];

    // Timing patterns
    activeHours: number[];                        // Hours when most active (0-23)
    activeDays: number[];                         // Days when most active (0-6)

    // Feedback
    helpfulCount: number;
    notHelpfulCount: number;

    // Stats
    lastUpdated: Date;
    totalInteractions: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING WEIGHTS — Multi-Factor Intelligence
// ─────────────────────────────────────────────────────────────────────────────

const SIS_WEIGHTS = {
    baseRelevance: 0.35,    // Domain match, entity importance
    priorityWeight: 0.30,   // Signal priority level
    recency: 0.15,          // Time decay function
    userHistory: 0.20,      // Learning from past interactions
} as const;

const PRIORITY_SCORES: Record<SignalPriority, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
};

const DOMAIN_BASE_RELEVANCE: Record<SignalDomain, number> = {
    COMPETITIVE: 90,    // Direct business impact
    REGULATORY: 85,     // Compliance critical
    TECHNOLOGY: 70,     // Strategic importance
    MARKET: 65,         // Contextual value
    NEWS: 50,           // General awareness
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────────────────────

const SIGNALS_KEY = 'pulse_intelligent_signals';
const CLUSTERS_KEY = 'pulse_signal_clusters';
const BEHAVIOR_KEY = 'pulse_user_behavior';
const COUNTERS_KEY = 'pulse_delivery_counters';
const QUEUE_KEY = 'pulse_signal_queue';

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENT SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function calculateSIS(
    signal: Pick<PulseSignal, 'domain' | 'priority' | 'relevanceScore' | 'publishedAt'>,
    behavior: UserBehaviorData | null
): number {
    // 1. Base Relevance Score (35%)
    const domainBase = DOMAIN_BASE_RELEVANCE[signal.domain];
    const contentRelevance = signal.relevanceScore * 100;
    const baseRelevance = (domainBase * 0.4 + contentRelevance * 0.6);

    // 2. Priority Weight (30%)
    const priorityScore = PRIORITY_SCORES[signal.priority];

    // 3. Recency Score (15%) - Exponential decay
    const ageMs = Date.now() - new Date(signal.publishedAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    const halfLife = 24; // Score halves every 24 hours
    const recencyScore = 100 * Math.pow(0.5, ageHours / halfLife);

    // 4. User History Score (20%)
    let historyScore = 50; // Default neutral
    if (behavior) {
        const domainReadRate = behavior.readRates[signal.domain] || 0.5;
        const domainPreferenceIndex = behavior.preferredDomains.indexOf(signal.domain);
        const preferenceBoost = domainPreferenceIndex >= 0
            ? (5 - Math.min(domainPreferenceIndex, 4)) * 10  // Top domain gets +50
            : 0;

        historyScore = domainReadRate * 50 + preferenceBoost;
    }

    // Combined weighted score
    const sis = Math.round(
        baseRelevance * SIS_WEIGHTS.baseRelevance +
        priorityScore * SIS_WEIGHTS.priorityWeight +
        recencyScore * SIS_WEIGHTS.recency +
        historyScore * SIS_WEIGHTS.userHistory
    );

    return Math.min(100, Math.max(0, sis));
}

export function determineUrgency(
    sis: number,
    priority: SignalPriority,
    _behavior: UserBehaviorData | null
): UrgencyLevel {
    // Critical priority always immediate
    if (priority === 'critical') return 'immediate';

    // High SIS gets timely treatment
    if (sis >= 80) return 'immediate';
    if (sis >= 60) return 'timely';
    if (sis >= 40) return 'batched';

    return 'digest';
}

// ─────────────────────────────────────────────────────────────────────────────
// FATIGUE PREVENTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

interface DeliveryCounters {
    hourly: { count: number; resetAt: number };
    daily: { count: number; resetAt: number };
    lastDelivery: number;
}

interface DeliveryBudget {
    hourlyLimit: number;
    dailyLimit: number;
    minimumGapMs: number;    // Minimum time between notifications
}

const DEFAULT_BUDGET: DeliveryBudget = {
    hourlyLimit: 8,
    dailyLimit: 30,
    minimumGapMs: 2 * 60 * 1000,  // 2 minutes minimum gap
};

function getDeliveryCounters(): DeliveryCounters {
    try {
        const stored = localStorage.getItem(COUNTERS_KEY);
        if (!stored) return createFreshCounters();

        const parsed = JSON.parse(stored) as DeliveryCounters;
        const now = Date.now();

        // Reset if expired
        if (now > parsed.hourly.resetAt) {
            parsed.hourly = { count: 0, resetAt: now + 60 * 60 * 1000 };
        }
        if (now > parsed.daily.resetAt) {
            parsed.daily = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
        }

        return parsed;
    } catch {
        return createFreshCounters();
    }
}

function createFreshCounters(): DeliveryCounters {
    const now = Date.now();
    return {
        hourly: { count: 0, resetAt: now + 60 * 60 * 1000 },
        daily: { count: 0, resetAt: now + 24 * 60 * 60 * 1000 },
        lastDelivery: 0,
    };
}

function saveDeliveryCounters(counters: DeliveryCounters): void {
    try {
        localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
    } catch {
        // Quota exceeded
    }
}

export interface FatigueCheckResult {
    allowed: boolean;
    reason?: string;
    budgetRemaining: {
        hourly: number;
        daily: number;
        percentUsed: number;
    };
    nextDeliveryAt?: Date;
}

export function checkFatigueLimits(
    urgency: UrgencyLevel,
    budget: DeliveryBudget = DEFAULT_BUDGET
): FatigueCheckResult {
    const counters = getDeliveryCounters();
    const now = Date.now();

    const hourlyRemaining = budget.hourlyLimit - counters.hourly.count;
    const dailyRemaining = budget.dailyLimit - counters.daily.count;
    const percentUsed = Math.round(
        (counters.daily.count / budget.dailyLimit) * 100
    );

    const budgetRemaining = {
        hourly: Math.max(0, hourlyRemaining),
        daily: Math.max(0, dailyRemaining),
        percentUsed,
    };

    // Immediate urgency bypasses some limits
    if (urgency === 'immediate') {
        // Still respect minimum gap unless critical
        if (now - counters.lastDelivery < budget.minimumGapMs / 2) {
            return {
                allowed: false,
                reason: 'Rate limiting: too many rapid notifications',
                budgetRemaining,
                nextDeliveryAt: new Date(counters.lastDelivery + budget.minimumGapMs / 2),
            };
        }
        return { allowed: true, budgetRemaining };
    }

    // Check hourly limit
    if (hourlyRemaining <= 0) {
        return {
            allowed: false,
            reason: `Hourly limit reached (${budget.hourlyLimit})`,
            budgetRemaining,
            nextDeliveryAt: new Date(counters.hourly.resetAt),
        };
    }

    // Check daily limit
    if (dailyRemaining <= 0) {
        return {
            allowed: false,
            reason: `Daily limit reached (${budget.dailyLimit})`,
            budgetRemaining,
            nextDeliveryAt: new Date(counters.daily.resetAt),
        };
    }

    // Check minimum gap
    if (now - counters.lastDelivery < budget.minimumGapMs) {
        return {
            allowed: false,
            reason: 'Minimum gap between notifications',
            budgetRemaining,
            nextDeliveryAt: new Date(counters.lastDelivery + budget.minimumGapMs),
        };
    }

    // Exponential backoff when approaching limits
    const hourlyUsagePercent = counters.hourly.count / budget.hourlyLimit;
    if (hourlyUsagePercent > 0.8 && urgency !== 'timely') {
        return {
            allowed: false,
            reason: 'Budget preservation: batching lower priority signals',
            budgetRemaining,
        };
    }

    return { allowed: true, budgetRemaining };
}

export function recordDelivery(): void {
    const counters = getDeliveryCounters();
    counters.hourly.count++;
    counters.daily.count++;
    counters.lastDelivery = Date.now();
    saveDeliveryCounters(counters);
}

export function getBudgetStatus(): FatigueCheckResult['budgetRemaining'] {
    const counters = getDeliveryCounters();
    return {
        hourly: Math.max(0, DEFAULT_BUDGET.hourlyLimit - counters.hourly.count),
        daily: Math.max(0, DEFAULT_BUDGET.dailyLimit - counters.daily.count),
        percentUsed: Math.round(
            (counters.daily.count / DEFAULT_BUDGET.dailyLimit) * 100
        ),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL CLUSTERING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const CLUSTER_TIME_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

export function findOrCreateCluster(
    signal: IntelligentSignal,
    existingClusters: NotificationCluster[]
): NotificationCluster | null {
    const recentClusters = existingClusters.filter(c =>
        Date.now() - c.createdAt.getTime() < CLUSTER_TIME_WINDOW_MS &&
        c.domain === signal.domain
    );

    // Simple clustering by domain and time window
    for (const cluster of recentClusters) {
        // Check if signal fits this cluster
        if (cluster.signals.length < 5) {  // Max 5 signals per cluster
            return cluster;
        }
    }

    return null;
}

export function createCluster(
    signals: IntelligentSignal[],
    domain: SignalDomain
): NotificationCluster | null {
    // Guard: empty array check
    if (!signals || signals.length === 0) {
        return null;
    }

    const validSignals = signals.filter(s => s && s.sis !== undefined);
    if (validSignals.length === 0) return null;

    const topSIS = Math.max(...validSignals.map(s => s.sis));
    const topUrgency = determineClusterUrgency(validSignals);

    return {
        id: `cluster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: `${validSignals.length} ${domain.toLowerCase()} signals`,
        domain,
        signals: validSignals,
        topSIS,
        urgency: topUrgency,
        createdAt: new Date(),
    };
}

function determineClusterUrgency(signals: IntelligentSignal[]): UrgencyLevel {
    if (!signals || signals.length === 0) return 'digest';

    const urgencyOrder: UrgencyLevel[] = ['immediate', 'timely', 'batched', 'digest'];
    let highestIndex = 3; // Start with digest

    for (const signal of signals) {
        if (!signal || !signal.urgency) continue;
        const index = urgencyOrder.indexOf(signal.urgency);
        if (index >= 0 && index < highestIndex) {
            highestIndex = index;
        }
    }

    return urgencyOrder[highestIndex];
}

// ─────────────────────────────────────────────────────────────────────────────
// USER BEHAVIOR LEARNING
// ─────────────────────────────────────────────────────────────────────────────

export function getUserBehavior(): UserBehaviorData | null {
    try {
        const stored = localStorage.getItem(BEHAVIOR_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        return {
            ...parsed,
            lastUpdated: new Date(parsed.lastUpdated),
        };
    } catch {
        return null;
    }
}

export function initializeUserBehavior(): UserBehaviorData {
    return {
        readRates: {
            COMPETITIVE: 0.5,
            REGULATORY: 0.5,
            TECHNOLOGY: 0.5,
            MARKET: 0.5,
            NEWS: 0.5,
        },
        dismissRates: {
            COMPETITIVE: 0.5,
            REGULATORY: 0.5,
            TECHNOLOGY: 0.5,
            MARKET: 0.5,
            NEWS: 0.5,
        },
        avgTimeToRead: {
            COMPETITIVE: 30000,
            REGULATORY: 45000,
            TECHNOLOGY: 30000,
            MARKET: 25000,
            NEWS: 20000,
        },
        preferredDomains: ['COMPETITIVE', 'REGULATORY', 'TECHNOLOGY', 'MARKET', 'NEWS'],
        preferredPriorities: ['critical', 'high', 'medium', 'low'],
        activeHours: [9, 10, 11, 14, 15, 16],
        activeDays: [1, 2, 3, 4, 5],
        helpfulCount: 0,
        notHelpfulCount: 0,
        lastUpdated: new Date(),
        totalInteractions: 0,
    };
}

export function recordInteraction(
    signal: IntelligentSignal,
    action: 'read' | 'dismiss' | 'feedback',
    feedbackScore?: -1 | 0 | 1
): void {
    let behavior = getUserBehavior() || initializeUserBehavior();

    const domain = signal.domain;
    const interactionWeight = 0.1; // How much each interaction affects the average

    if (action === 'read') {
        const currentRate = behavior.readRates[domain];
        behavior.readRates[domain] = currentRate * (1 - interactionWeight) + 1 * interactionWeight;
    } else if (action === 'dismiss') {
        const currentRate = behavior.dismissRates[domain];
        behavior.dismissRates[domain] = currentRate * (1 - interactionWeight) + 1 * interactionWeight;
    } else if (action === 'feedback' && feedbackScore !== undefined) {
        if (feedbackScore === 1) behavior.helpfulCount++;
        else if (feedbackScore === -1) behavior.notHelpfulCount++;
    }

    // Update preferred domains based on read rates
    behavior.preferredDomains = (Object.keys(behavior.readRates) as SignalDomain[])
        .sort((a, b) => behavior.readRates[b] - behavior.readRates[a]);

    behavior.totalInteractions++;
    behavior.lastUpdated = new Date();

    try {
        localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(behavior));
    } catch {
        // Quota exceeded
    }
}

export function clearLearningData(): void {
    localStorage.removeItem(BEHAVIOR_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL STORAGE & RETRIEVAL
// ─────────────────────────────────────────────────────────────────────────────

export function getIntelligentSignals(): IntelligentSignal[] {
    try {
        const stored = localStorage.getItem(SIGNALS_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored) as IntelligentSignal[];
        return parsed.map(s => ({
            ...s,
            createdAt: new Date(s.createdAt),
            readAt: s.readAt ? new Date(s.readAt) : undefined,
            dismissedAt: s.dismissedAt ? new Date(s.dismissedAt) : undefined,
            deliveryTime: s.deliveryTime ? new Date(s.deliveryTime) : undefined,
        }));
    } catch {
        return [];
    }
}

export function saveIntelligentSignals(signals: IntelligentSignal[]): void {
    try {
        // Keep max 200 signals, prioritized by SIS
        const sorted = [...signals].sort((a, b) => b.sis - a.sis);
        const toSave = sorted.slice(0, 200);
        localStorage.setItem(SIGNALS_KEY, JSON.stringify(toSave));
    } catch {
        // Quota exceeded, keep only 100
        const sorted = [...signals].sort((a, b) => b.sis - a.sis);
        localStorage.setItem(SIGNALS_KEY, JSON.stringify(sorted.slice(0, 100)));
    }
}

export function getClusters(): NotificationCluster[] {
    try {
        const stored = localStorage.getItem(CLUSTERS_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored) as NotificationCluster[];
        return parsed.map(c => ({
            ...c,
            createdAt: new Date(c.createdAt),
            signals: c.signals.map(s => ({
                ...s,
                createdAt: new Date(s.createdAt),
                readAt: s.readAt ? new Date(s.readAt) : undefined,
                dismissedAt: s.dismissedAt ? new Date(s.dismissedAt) : undefined,
            })),
        }));
    } catch {
        return [];
    }
}

export function saveClusters(clusters: NotificationCluster[]): void {
    try {
        // Keep only last 50 clusters
        const toSave = clusters.slice(-50);
        localStorage.setItem(CLUSTERS_KEY, JSON.stringify(toSave));
    } catch {
        localStorage.setItem(CLUSTERS_KEY, JSON.stringify(clusters.slice(-25)));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROCESSING PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

export function processSignal(signal: PulseSignal): IntelligentSignal | null {
    // Guard: validate input signal
    if (!signal || !signal.id || !signal.domain || !signal.priority) {
        console.warn('[NotificationEngine] Invalid signal received:', signal?.id);
        return null;
    }

    try {
        const behavior = getUserBehavior();

        // Calculate Signal Intelligence Score
        const sis = calculateSIS(signal, behavior);

        // Determine urgency
        const urgency = determineUrgency(sis, signal.priority, behavior);

        // Check fatigue limits
        const fatigueCheck = checkFatigueLimits(urgency);

        // Create intelligent signal
        const intelligentSignal: IntelligentSignal = {
            id: `isig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            signalId: signal.id,
            title: signal.title || 'Untitled Signal',
            summary: signal.summary || '',
            domain: signal.domain,
            priority: signal.priority,
            sis,
            urgency,
            overridesQuietHours: signal.priority === 'critical' && sis >= 90,
            createdAt: new Date(),
            sourceUrl: signal.url,
        };

        // If not allowed due to fatigue, add to queue instead of immediate delivery
        if (!fatigueCheck.allowed) {
            addToQueue(intelligentSignal);
            return null;
        }

        // Record delivery
        recordDelivery();

        // Save signal
        const signals = getIntelligentSignals();
        signals.unshift(intelligentSignal);
        saveIntelligentSignals(signals);

        return intelligentSignal;
    } catch (error) {
        console.error('[NotificationEngine] Error processing signal:', error);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL QUEUE (for batched/digest signals)
// ─────────────────────────────────────────────────────────────────────────────

export function addToQueue(signal: IntelligentSignal): void {
    try {
        const queue = getQueue();
        queue.push(signal);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
        // Quota exceeded
    }
}

export function getQueue(): IntelligentSignal[] {
    try {
        const stored = localStorage.getItem(QUEUE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored) as IntelligentSignal[];
        return parsed.map(s => ({
            ...s,
            createdAt: new Date(s.createdAt),
        }));
    } catch {
        return [];
    }
}

export function processQueue(): IntelligentSignal[] {
    const queue = getQueue();
    if (queue.length === 0) return [];

    const delivered: IntelligentSignal[] = [];
    const remaining: IntelligentSignal[] = [];

    // Sort by SIS descending
    queue.sort((a, b) => b.sis - a.sis);

    for (const signal of queue) {
        const fatigueCheck = checkFatigueLimits(signal.urgency);
        if (fatigueCheck.allowed) {
            recordDelivery();
            delivered.push(signal);
        } else {
            remaining.push(signal);
        }
    }

    // Save delivered signals
    if (delivered.length > 0) {
        const signals = getIntelligentSignals();
        signals.unshift(...delivered);
        saveIntelligentSignals(signals);
    }

    // Update queue
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));

    return delivered;
}

export function clearQueue(): void {
    localStorage.removeItem(QUEUE_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function markSignalAsRead(id: string): void {
    const signals = getIntelligentSignals();
    const signal = signals.find(s => s.id === id);
    if (signal) {
        signal.readAt = new Date();
        saveIntelligentSignals(signals);
        recordInteraction(signal, 'read');
    }
}

export function dismissSignal(id: string): void {
    const signals = getIntelligentSignals();
    const signal = signals.find(s => s.id === id);
    if (signal) {
        signal.dismissedAt = new Date();
        saveIntelligentSignals(signals);
        recordInteraction(signal, 'dismiss');
    }
}

export function markAllAsRead(): void {
    const signals = getIntelligentSignals();
    const now = new Date();
    signals.forEach(s => {
        if (!s.readAt) s.readAt = now;
    });
    saveIntelligentSignals(signals);
}

export function provideFeedback(id: string, score: -1 | 0 | 1): void {
    const signals = getIntelligentSignals();
    const signal = signals.find(s => s.id === id);
    if (signal) {
        signal.feedbackScore = score;
        saveIntelligentSignals(signals);
        recordInteraction(signal, 'feedback', score);
    }
}

export function getUnreadCount(): number {
    return getIntelligentSignals().filter(s => !s.readAt && !s.dismissedAt).length;
}

export function getActiveSignals(): IntelligentSignal[] {
    return getIntelligentSignals().filter(s => !s.dismissedAt);
}

export function getUnreadSignals(): IntelligentSignal[] {
    return getIntelligentSignals().filter(s => !s.readAt && !s.dismissedAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA — Hackathon Sample Signals
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_SIGNALS: Array<{
    title: string;
    summary: string;
    domain: SignalDomain;
    priority: SignalPriority;
    sourceUrl?: string;
    entities?: { companies: string[] };
}> = [
        // COMPETITIVE - Tier 1 Competitors
        {
            title: "Waystar announces AI-powered prior authorization platform",
            summary: "New ML-based system promises 40% faster auth decisions. Direct competition to Availity's essentials prior auth solution.",
            domain: 'COMPETITIVE',
            priority: 'critical',
            entities: { companies: ['Waystar'] },
            sourceUrl: 'https://waystar.com/news',
        },
        {
            title: "Change Healthcare resumes operations after Optum integration",
            summary: "Full platform integration complete. Combined entity now serves 5,000+ hospitals with end-to-end RCM.",
            domain: 'COMPETITIVE',
            priority: 'high',
            entities: { companies: ['Change Healthcare', 'Optum'] },
            sourceUrl: 'https://changehealthcare.com',
        },
        {
            title: "R1 RCM expands AI claims processing nationwide",
            summary: "Generative AI tools now available to all 900+ health system clients. Claims denial rates down 15%.",
            domain: 'COMPETITIVE',
            priority: 'high',
            entities: { companies: ['R1 RCM'] },
        },
        {
            title: "Experian Health partners with major payer network",
            summary: "New eligibility verification partnership covers 180M+ lives. Real-time benefit checks now available.",
            domain: 'COMPETITIVE',
            priority: 'high',
            entities: { companies: ['Experian Health'] },
        },
        // REGULATORY - CMS & Healthcare Policy
        {
            title: "CMS announces 2025 interoperability requirements",
            summary: "New FHIR R4 mandates for all payers by January 2025. Prior authorization data sharing rules finalized.",
            domain: 'REGULATORY',
            priority: 'critical',
            sourceUrl: 'https://cms.gov/regulations',
        },
        {
            title: "HHS updates HIPAA compliance framework",
            summary: "Enhanced security requirements for health data exchange. 180-day implementation timeline for covered entities.",
            domain: 'REGULATORY',
            priority: 'high',
            sourceUrl: 'https://hhs.gov/hipaa',
        },
        {
            title: "Medicare Advantage payment rates increase 3.5%",
            summary: "CMS finalizes 2025 rates. Positive impact for payers and RCM vendors processing MA claims.",
            domain: 'REGULATORY',
            priority: 'medium',
        },
        // TECHNOLOGY - Healthcare Tech Advancements
        {
            title: "Epic Systems launches new payer platform module",
            summary: "Direct payer connectivity embedded in EHR. Could reduce need for external clearinghouse connections.",
            domain: 'TECHNOLOGY',
            priority: 'high',
            entities: { companies: ['Epic'] },
        },
        {
            title: "Akasa raises $60M for generative AI RCM automation",
            summary: "Series C funding to accelerate AI-driven denials management. Direct threat to traditional RCM vendors.",
            domain: 'TECHNOLOGY',
            priority: 'high',
            entities: { companies: ['Akasa'] },
        },
        {
            title: "Cohere Health expands AI prior auth to 20 new payers",
            summary: "Rapid payer adoption of intelligent prior authorization platform. Processing 2M+ auths monthly.",
            domain: 'TECHNOLOGY',
            priority: 'medium',
            entities: { companies: ['Cohere Health'] },
        },
        // MARKET - Industry & M&A
        {
            title: "UnitedHealth Group Q4 revenue exceeds expectations",
            summary: "Optum segment shows 12% YoY growth. Healthcare services demand strong across all segments.",
            domain: 'MARKET',
            priority: 'medium',
            entities: { companies: ['Optum'] },
            sourceUrl: 'https://unitedhealthgroup.com/investors',
        },
        {
            title: "PE firm acquires mid-market RCM company for $800M",
            summary: "Consolidation trend continues in healthcare IT. Third major RCM acquisition this quarter.",
            domain: 'MARKET',
            priority: 'medium',
        },
        // NEWS - General Healthcare Movement
        {
            title: "Healthcare IT spending projected to grow 8% in 2025",
            summary: "Gartner report highlights AI, interoperability, and patient experience as top investment priorities.",
            domain: 'NEWS',
            priority: 'low',
        },
        {
            title: "Infinitus Systems announces voice AI partnership with major health system",
            summary: "AI-powered benefit verification calls now handling 50% of volume for 15-hospital network.",
            domain: 'NEWS',
            priority: 'medium',
            entities: { companies: ['Infinitus'] },
        },
    ];

export function initDemoData(): void {
    // Check if we already have signals
    const existing = getIntelligentSignals();
    if (existing.length > 0) {
        return; // Don't overwrite existing data
    }

    // Create demo signals
    const now = Date.now();
    const signals: IntelligentSignal[] = DEMO_SIGNALS.map((demo, index) => {
        const createdAt = new Date(now - index * 3600000);
        // Build a minimal signal structure for SIS calculation
        const signalForSIS = {
            domain: demo.domain,
            priority: demo.priority,
            relevanceScore: demo.priority === 'critical' ? 0.95 : demo.priority === 'high' ? 0.8 : demo.priority === 'medium' ? 0.6 : 0.4,
            publishedAt: createdAt.toISOString(),
        };
        const sis = calculateSIS(signalForSIS, null);
        return {
            id: `demo-${Date.now()}-${index}`,
            signalId: `pulse-demo-${index}`,
            title: demo.title,
            summary: demo.summary,
            domain: demo.domain,
            priority: demo.priority,
            sis,
            urgency: determineUrgency(sis, demo.priority, null),
            overridesQuietHours: demo.priority === 'critical',
            createdAt,
            sourceUrl: demo.sourceUrl,
            entities: demo.entities, // Include competitor tags for matching
        };
    });

    // Save demo signals
    saveIntelligentSignals(signals);
    console.log('[IntelligentNotificationEngine] Demo data initialized with', signals.length, 'signals');
}

// Auto-initialize demo data on module load (for hackathon)
initDemoData();

