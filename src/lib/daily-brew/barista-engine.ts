import type { BrewItem, RoastProfile } from './types';

/**
 * THE ROASTER
 * The core algorithmic engine for The Daily Brew.
 * Distills noise into signal.
 */

// Algo 1: The "Caffeine" Score (Gravity/Urgency)
// Score = (UserWeight * ContentWeight) + EmergencyBoost
export const calculateCaffeineScore = (
    type: string,
    userRelationship: 'manager' | 'peer' | 'system' | 'report' = 'peer',
    isEmergency: boolean = false
): number => {
    let userWeight = 1.0;
    if (userRelationship === 'manager') userWeight = 1.5; // Double Shot
    if (userRelationship === 'report') userWeight = 1.2;
    if (userRelationship === 'system') userWeight = 0.8;

    let contentWeight = 10;
    switch (type) {
        case 'mention': contentWeight = 50; break;
        case 'approval': contentWeight = 45; break;
        case 'direct_message': contentWeight = 40; break;
        case 'toast_received': contentWeight = 30; break;
        case 'comment': contentWeight = 20; break;
        case 'like': contentWeight = 5; break;
        case 'system_update': contentWeight = 15; break;
        default: contentWeight = 10;
    }

    const emergencyBoost = isEmergency ? 50 : 0;

    // Calculate raw score
    let score = (userWeight * contentWeight) + emergencyBoost;

    // Clamp to 0-100
    return Math.min(Math.max(score, 0), 100);
};

// Algo 4: The "Freshness" Curve (Temporal Decay)
// Score = Score / TimeFactor
// News goes stale quickly; Tasks ripen (stay relevant).
export const getFreshnessDecay = (item: BrewItem, now: number = Date.now()): number => {
    const ageInHours = (now - item.timestamp) / (1000 * 60 * 60);

    // Action items (Dark Roast) should NOT decay as fast - they "ripen" (stay important)
    if (item.roast === 'dark') {
        // Very slow decay for critical items
        return item.caffeineScore * Math.max(0.9, 1 - (ageInHours * 0.01));
    }

    // Light/Medium roasts decay like espresso crema
    // Exponential decay
    const decayFactor = Math.max(1, ageInHours * 0.5);
    return Math.round(item.caffeineScore / decayFactor);
};

/**
 * Determine the Roast Profile based on Caffeine Score
 */
export const determineRoastProfile = (score: number): RoastProfile => {
    if (score >= 75) return 'dark';   // The Shot (Critical)
    if (score >= 30) return 'medium'; // The Blend (Intelligence)
    return 'light';                   // The Froth (Ambient)
};

/**
 * ALGO 2: The "Blend" (Semantic Clustering)
 * Groups related signals into bundled notifications to reduce noise.
 * 
 * Clustering Rules:
 * - Same source + same action type + same target = group
 * - E.g., "Alice liked your toast" + "Bob liked your toast" → "Alice, Bob +1 liked your toast"
 */

export interface BlendedBrewItem extends BrewItem {
    isBlended: boolean;
    blendedCount: number;
    blendedActors: { name: string; avatar?: string }[];
    originalItems: BrewItem[];
}

/**
 * Generate a clustering key for a BrewItem
 * Items with the same key will be blended together
 */
const getClusterKey = (item: BrewItem): string => {
    // Extract action type from flavorNotes or use source
    const actionType = item.flavorNotes?.[0] || 'general';

    // Extract target entity from metadata or title pattern
    const target = item.metadata?.targetId ||
        item.metadata?.threadId ||
        item.link ||
        'global';

    return `${item.source}:${actionType}:${target}`;
};

/**
 * Merge multiple items into a single blended notification
 */
const mergeToBlendedItem = (items: BrewItem[]): BlendedBrewItem => {
    // Sort by timestamp, newest first
    const sorted = items.sort((a, b) => b.timestamp - a.timestamp);
    const primary = sorted[0];

    // Collect all unique actors
    const allActors = items
        .flatMap(item => item.actors || [])
        .filter((actor, idx, arr) =>
            arr.findIndex(a => a.name === actor.name) === idx
        );

    // Calculate combined caffeine score (highest + bonus for volume)
    const maxScore = Math.max(...items.map(i => i.caffeineScore));
    const volumeBonus = Math.min(items.length * 2, 20); // Up to +20 for volume

    // Generate blended title
    let blendedTitle = primary.title;
    if (allActors.length > 1) {
        const firstTwo = allActors.slice(0, 2).map(a => a.name.split(' ')[0]);
        const remaining = allActors.length - 2;
        if (remaining > 0) {
            blendedTitle = `${firstTwo.join(', ')} +${remaining} others`;
        } else {
            blendedTitle = firstTwo.join(' and ');
        }

        // Append action context
        const action = primary.flavorNotes?.[0] || 'interacted';
        blendedTitle += ` ${action}`;
    }

    return {
        ...primary,
        id: `blend:${primary.id}`,
        title: blendedTitle,
        caffeineScore: Math.min(maxScore + volumeBonus, 100),
        roast: determineRoastProfile(Math.min(maxScore + volumeBonus, 100)),
        isBlended: true,
        blendedCount: items.length,
        blendedActors: allActors,
        originalItems: sorted,
        actors: allActors,
    };
};

/**
 * The Blender - Semantic Clustering Engine
 * Groups related items and returns a reduced, prioritized list
 */
// ═══════════════════════════════════════════════════════════════════════════
// ALGO 5: THE DIGEST (Phase 3 - Morning Pour)
// Generates a categorized summary of pending items for the daily digest view
// ═══════════════════════════════════════════════════════════════════════════

export interface DigestCategory {
    key: 'critical' | 'recognition' | 'market' | 'learning';
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    items: BrewItem[];
}

export interface Digest {
    greeting: string;
    greetingIcon: string;
    totalPending: number;
    categories: DigestCategory[];
    topPriority: BrewItem | null;
}

/**
 * Get time-based greeting based on hour (0-23)
 */
const getTimeGreeting = (hour: number): { greeting: string; icon: string } => {
    if (hour >= 5 && hour < 12) {
        return { greeting: 'Good Morning', icon: '☀️' };
    } else if (hour >= 12 && hour < 17) {
        return { greeting: 'Good Afternoon', icon: '🌤️' };
    } else if (hour >= 17 && hour < 21) {
        return { greeting: 'Good Evening', icon: '🌅' };
    } else {
        return { greeting: 'Night Owl Mode', icon: '🌙' };
    }
};

/**
 * Category definitions with matching flavorNotes patterns
 */
const CATEGORY_CONFIG: Array<{
    key: DigestCategory['key'];
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    matchPatterns: string[];
}> = [
        {
            key: 'critical',
            label: 'Critical',
            icon: '🔴',
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            matchPatterns: ['urgent', 'approval', 'mention', 'deadline', 'blocker', 'critical']
        },
        {
            key: 'recognition',
            label: 'Recognition',
            icon: '🏆',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            matchPatterns: ['recognition', 'toast', 'kudos', 'celebration', 'shoutout', 'thanks']
        },
        {
            key: 'market',
            label: 'Market',
            icon: '📊',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            matchPatterns: ['market', 'pulse', 'insight', 'metric', 'trend', 'analytics', 'report']
        },
        {
            key: 'learning',
            label: 'Learning',
            icon: '📚',
            color: 'text-violet-600',
            bgColor: 'bg-violet-50',
            matchPatterns: ['lop', 'learning', 'session', 'training', 'workshop', 'education']
        }
    ];

/**
 * Generate the Morning Pour Digest
 * Categorizes pending items and generates a time-aware summary
 */
export const generateDigest = (items: BrewItem[], hour?: number): Digest => {
    const currentHour = hour ?? new Date().getHours();
    const { greeting, icon: greetingIcon } = getTimeGreeting(currentHour);

    // Filter to unread items only
    const pendingItems = items.filter(item => !item.isRead);

    // Initialize categories
    const categoryMap = new Map<DigestCategory['key'], BrewItem[]>();
    CATEGORY_CONFIG.forEach(cat => categoryMap.set(cat.key, []));

    // Categorize items based on flavorNotes
    pendingItems.forEach(item => {
        const notes = item.flavorNotes?.map(n => n.toLowerCase()) || [];
        let matched = false;

        for (const config of CATEGORY_CONFIG) {
            if (config.matchPatterns.some(pattern => notes.includes(pattern))) {
                categoryMap.get(config.key)!.push(item);
                matched = true;
                break; // Item only goes to first matching category
            }
        }

        // If no category match, put high-priority items in critical, others ignored for digest
        if (!matched && item.roast === 'dark') {
            categoryMap.get('critical')!.push(item);
        }
    });

    // Build category list with counts
    const categories: DigestCategory[] = CATEGORY_CONFIG.map(config => ({
        key: config.key,
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        items: categoryMap.get(config.key) || []
    })).filter(cat => cat.items.length > 0); // Only include non-empty categories

    // Find top priority item (highest caffeine score among pending)
    const topPriority = pendingItems.length > 0
        ? pendingItems.reduce((top, item) =>
            item.caffeineScore > top.caffeineScore ? item : top
        )
        : null;

    return {
        greeting,
        greetingIcon,
        totalPending: pendingItems.length,
        categories,
        topPriority
    };
};

export const blendItems = (items: BrewItem[]): (BrewItem | BlendedBrewItem)[] => {
    if (items.length === 0) return [];

    // Step 1: Group items by cluster key
    const clusters = new Map<string, BrewItem[]>();

    items.forEach(item => {
        const key = getClusterKey(item);
        const existing = clusters.get(key) || [];
        existing.push(item);
        clusters.set(key, existing);
    });

    // Step 2: Merge clusters with 2+ items, keep singles as-is
    const result: (BrewItem | BlendedBrewItem)[] = [];

    clusters.forEach((clusterItems) => {
        if (clusterItems.length >= 2) {
            // Blend multiple items into one
            result.push(mergeToBlendedItem(clusterItems));
        } else {
            // Single item, pass through
            result.push(clusterItems[0]);
        }
    });

    // Step 3: Sort by caffeine score (hottest first)
    return result.sort((a, b) => b.caffeineScore - a.caffeineScore);
};

