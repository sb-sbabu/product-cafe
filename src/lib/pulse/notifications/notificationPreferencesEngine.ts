// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Notification Preferences Engine
// Deep customization with Personas, Focus Zones, and Visual Rules
// ═══════════════════════════════════════════════════════════════════════════

import type { SignalDomain, SignalPriority } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION PERSONAS — Pre-built profiles for different work modes
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationPersona {
    id: string;
    name: string;
    icon: string;
    description: string;
    isCustom: boolean;
    settings: PersonaSettings;
}

export interface PersonaSettings {
    minPriority: SignalPriority;
    domains: Record<SignalDomain, boolean>;
    batchMode: 'realtime' | 'smart' | 'digest';
    quietHoursEnabled: boolean;
    soundEnabled: boolean;
    maxPerHour: number;
    maxPerDay: number;
}

export const DEFAULT_PERSONAS: NotificationPersona[] = [
    {
        id: 'executive',
        name: 'Executive',
        icon: '🎯',
        description: 'Critical + High only, digest the rest. For C-Suite and busy days.',
        isCustom: false,
        settings: {
            minPriority: 'high',
            domains: { COMPETITIVE: true, REGULATORY: true, TECHNOLOGY: true, MARKET: true, NEWS: false },
            batchMode: 'smart',
            quietHoursEnabled: true,
            soundEnabled: false,
            maxPerHour: 3,
            maxPerDay: 15,
        },
    },
    {
        id: 'monitor',
        name: 'Monitor',
        icon: '📡',
        description: 'Everything batched, no interrupts. Perfect for deep work.',
        isCustom: false,
        settings: {
            minPriority: 'low',
            domains: { COMPETITIVE: true, REGULATORY: true, TECHNOLOGY: true, MARKET: true, NEWS: true },
            batchMode: 'digest',
            quietHoursEnabled: false,
            soundEnabled: false,
            maxPerHour: 0,
            maxPerDay: 1,
        },
    },
    {
        id: 'livewire',
        name: 'Live Wire',
        icon: '⚡',
        description: 'Real-time for all high+ signals. Active monitoring mode.',
        isCustom: false,
        settings: {
            minPriority: 'high',
            domains: { COMPETITIVE: true, REGULATORY: true, TECHNOLOGY: true, MARKET: true, NEWS: true },
            batchMode: 'realtime',
            quietHoursEnabled: false,
            soundEnabled: true,
            maxPerHour: 10,
            maxPerDay: 50,
        },
    },
    {
        id: 'research',
        name: 'Research',
        icon: '🔬',
        description: 'Deep focus on 1-2 domains, suppress the rest.',
        isCustom: false,
        settings: {
            minPriority: 'medium',
            domains: { COMPETITIVE: true, REGULATORY: true, TECHNOLOGY: false, MARKET: false, NEWS: false },
            batchMode: 'smart',
            quietHoursEnabled: true,
            soundEnabled: false,
            maxPerHour: 5,
            maxPerDay: 25,
        },
    },
    {
        id: 'zen',
        name: 'Zen',
        icon: '💤',
        description: 'Digest only, once per day. For vacation and weekends.',
        isCustom: false,
        settings: {
            minPriority: 'critical',
            domains: { COMPETITIVE: true, REGULATORY: true, TECHNOLOGY: false, MARKET: false, NEWS: false },
            batchMode: 'digest',
            quietHoursEnabled: true,
            soundEnabled: false,
            maxPerHour: 1,
            maxPerDay: 5,
        },
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS ZONES — Domain-specific focus periods
// ─────────────────────────────────────────────────────────────────────────────

export interface FocusZone {
    id: string;
    name: string;
    domains: SignalDomain[];
    schedule?: FocusSchedule;
    isActive: boolean;
    createdAt: Date;
}

export interface FocusSchedule {
    dayOfWeek: number[];       // 0-6 (Sun-Sat)
    startTime: string;         // "09:00"
    endTime: string;           // "11:00"
    timezone: string;
}

export interface ActiveFocus {
    zone: FocusZone;
    startedAt: Date;
    endsAt?: Date;
    signalsCollected: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ALERT RULES — Visual Rule Builder storage
// ─────────────────────────────────────────────────────────────────────────────

export type RuleConditionType =
    | 'domain'
    | 'priority'
    | 'competitor'
    | 'topic'
    | 'signalType';

export type RuleActionType =
    | 'urgency'
    | 'sound'
    | 'overrideQuietHours'
    | 'highlight';

export interface RuleCondition {
    type: RuleConditionType;
    operator: 'equals' | 'contains' | 'notEquals';
    value: string | string[];
}

export interface RuleAction {
    type: RuleActionType;
    value: string | boolean;
}

export interface CustomAlertRule {
    id: string;
    name: string;
    enabled: boolean;
    conditions: RuleCondition[];
    conditionLogic: 'AND' | 'OR';
    actions: RuleAction[];
    createdAt: Date;
    lastTriggeredAt?: Date;
    triggerCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIET HOURS — Enhanced with urgency override
// ─────────────────────────────────────────────────────────────────────────────

export interface QuietHoursConfig {
    enabled: boolean;
    start: string;           // "22:00"
    end: string;             // "08:00"
    timezone: string;
    allowCriticalOverride: boolean;
    weekendsOnly: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER PREFERENCES — Complete user configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface IntelligentPreferences {
    // Active persona
    activePersonaId: string;
    customPersonas: NotificationPersona[];

    // Focus zones
    focusZones: FocusZone[];
    activeFocus: ActiveFocus | null;

    // Custom rules
    alertRules: CustomAlertRule[];

    // Quiet hours
    quietHours: QuietHoursConfig;

    // Global snooze
    snoozedUntil: Date | null;

    // Learning preferences
    learningEnabled: boolean;

    // Digest settings
    digestSchedule: {
        enabled: boolean;
        time: string;        // "09:00"
        frequency: 'daily' | 'weekdays' | 'weekly';
    };

    // UI preferences
    showBadgeCount: boolean;
    animationsEnabled: boolean;
    compactMode: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: IntelligentPreferences = {
    activePersonaId: 'executive',
    customPersonas: [],
    focusZones: [],
    activeFocus: null,
    alertRules: [],
    quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        allowCriticalOverride: true,
        weekendsOnly: false,
    },
    snoozedUntil: null,
    learningEnabled: true,
    digestSchedule: {
        enabled: true,
        time: '09:00',
        frequency: 'daily',
    },
    showBadgeCount: true,
    animationsEnabled: true,
    compactMode: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────────────────────

const PREFS_KEY = 'pulse_intelligent_prefs';

export function getPreferences(): IntelligentPreferences {
    try {
        const stored = localStorage.getItem(PREFS_KEY);
        if (!stored) return DEFAULT_PREFERENCES;

        const parsed = JSON.parse(stored);

        // Merge with defaults for new fields
        return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
            snoozedUntil: parsed.snoozedUntil ? new Date(parsed.snoozedUntil) : null,
            focusZones: (parsed.focusZones || []).map((z: FocusZone) => ({
                ...z,
                createdAt: new Date(z.createdAt),
            })),
            activeFocus: parsed.activeFocus ? {
                ...parsed.activeFocus,
                startedAt: new Date(parsed.activeFocus.startedAt),
                endsAt: parsed.activeFocus.endsAt ? new Date(parsed.activeFocus.endsAt) : undefined,
            } : null,
            alertRules: (parsed.alertRules || []).map((r: CustomAlertRule) => ({
                ...r,
                createdAt: new Date(r.createdAt),
                lastTriggeredAt: r.lastTriggeredAt ? new Date(r.lastTriggeredAt) : undefined,
            })),
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export function savePreferences(prefs: IntelligentPreferences): void {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // Quota exceeded
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export function getActivePersona(): NotificationPersona {
    const prefs = getPreferences();
    const allPersonas = [...DEFAULT_PERSONAS, ...prefs.customPersonas];
    return allPersonas.find(p => p.id === prefs.activePersonaId) || DEFAULT_PERSONAS[0];
}

export function setActivePersona(personaId: string): void {
    const prefs = getPreferences();
    prefs.activePersonaId = personaId;
    savePreferences(prefs);
}

export function createCustomPersona(
    name: string,
    icon: string,
    description: string,
    settings: PersonaSettings
): NotificationPersona {
    const persona: NotificationPersona = {
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        icon,
        description,
        isCustom: true,
        settings,
    };

    const prefs = getPreferences();
    prefs.customPersonas.push(persona);
    savePreferences(prefs);

    return persona;
}

export function deleteCustomPersona(personaId: string): void {
    const prefs = getPreferences();
    prefs.customPersonas = prefs.customPersonas.filter(p => p.id !== personaId);

    // If deleted persona was active, switch to default
    if (prefs.activePersonaId === personaId) {
        prefs.activePersonaId = 'executive';
    }

    savePreferences(prefs);
}

export function getAllPersonas(): NotificationPersona[] {
    const prefs = getPreferences();
    return [...DEFAULT_PERSONAS, ...prefs.customPersonas];
}

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS ZONE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export function createFocusZone(
    name: string,
    domains: SignalDomain[],
    schedule?: FocusSchedule
): FocusZone {
    const zone: FocusZone = {
        id: `focus_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        domains,
        schedule,
        isActive: false,
        createdAt: new Date(),
    };

    const prefs = getPreferences();
    prefs.focusZones.push(zone);
    savePreferences(prefs);

    return zone;
}

export function activateFocusZone(zoneId: string, durationMinutes?: number): ActiveFocus | null {
    const prefs = getPreferences();
    const zone = prefs.focusZones.find(z => z.id === zoneId);

    if (!zone) return null;

    const now = new Date();
    const activeFocus: ActiveFocus = {
        zone,
        startedAt: now,
        endsAt: durationMinutes
            ? new Date(now.getTime() + durationMinutes * 60 * 1000)
            : undefined,
        signalsCollected: 0,
    };

    prefs.activeFocus = activeFocus;
    savePreferences(prefs);

    return activeFocus;
}

export function deactivateFocusZone(): { signalsCollected: number; duration: number } | null {
    const prefs = getPreferences();

    if (!prefs.activeFocus) return null;

    const result = {
        signalsCollected: prefs.activeFocus.signalsCollected,
        duration: Date.now() - prefs.activeFocus.startedAt.getTime(),
    };

    prefs.activeFocus = null;
    savePreferences(prefs);

    return result;
}

export function getActiveFocus(): ActiveFocus | null {
    const prefs = getPreferences();

    if (!prefs.activeFocus) return null;

    // Check if focus has expired
    if (prefs.activeFocus.endsAt && new Date() > prefs.activeFocus.endsAt) {
        prefs.activeFocus = null;
        savePreferences(prefs);
        return null;
    }

    return prefs.activeFocus;
}

export function deleteFocusZone(zoneId: string): void {
    const prefs = getPreferences();
    prefs.focusZones = prefs.focusZones.filter(z => z.id !== zoneId);

    // Deactivate if this zone was active
    if (prefs.activeFocus?.zone.id === zoneId) {
        prefs.activeFocus = null;
    }

    savePreferences(prefs);
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ALERT RULES
// ─────────────────────────────────────────────────────────────────────────────

export function createAlertRule(
    name: string,
    conditions: RuleCondition[],
    conditionLogic: 'AND' | 'OR',
    actions: RuleAction[]
): CustomAlertRule {
    const rule: CustomAlertRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        enabled: true,
        conditions,
        conditionLogic,
        actions,
        createdAt: new Date(),
        triggerCount: 0,
    };

    const prefs = getPreferences();
    prefs.alertRules.push(rule);
    savePreferences(prefs);

    return rule;
}

export function updateAlertRule(ruleId: string, updates: Partial<CustomAlertRule>): void {
    const prefs = getPreferences();
    const ruleIndex = prefs.alertRules.findIndex(r => r.id === ruleId);

    if (ruleIndex >= 0) {
        prefs.alertRules[ruleIndex] = { ...prefs.alertRules[ruleIndex], ...updates };
        savePreferences(prefs);
    }
}

export function deleteAlertRule(ruleId: string): void {
    const prefs = getPreferences();
    prefs.alertRules = prefs.alertRules.filter(r => r.id !== ruleId);
    savePreferences(prefs);
}

export function toggleAlertRule(ruleId: string): void {
    const prefs = getPreferences();
    const rule = prefs.alertRules.find(r => r.id === ruleId);

    if (rule) {
        rule.enabled = !rule.enabled;
        savePreferences(prefs);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIET HOURS
// ─────────────────────────────────────────────────────────────────────────────

export function isQuietHoursActive(): boolean {
    const prefs = getPreferences();

    if (!prefs.quietHours.enabled) return false;

    const now = new Date();

    // Check weekends only
    if (prefs.quietHours.weekendsOnly) {
        const day = now.getDay();
        if (day !== 0 && day !== 6) return false;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Safe time parsing with fallbacks
    const parseTime = (timeStr: string): number => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split(':');
        if (parts.length < 2) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        return hours * 60 + minutes;
    };

    const start = parseTime(prefs.quietHours.start);
    const end = parseTime(prefs.quietHours.end);

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (start > end) {
        return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
}

export function setQuietHours(config: Partial<QuietHoursConfig>): void {
    const prefs = getPreferences();
    prefs.quietHours = { ...prefs.quietHours, ...config };
    savePreferences(prefs);
}

// ─────────────────────────────────────────────────────────────────────────────
// SNOOZE
// ─────────────────────────────────────────────────────────────────────────────

export function snoozeNotifications(durationMinutes: number): Date {
    const prefs = getPreferences();
    const snoozedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    prefs.snoozedUntil = snoozedUntil;
    savePreferences(prefs);
    return snoozedUntil;
}

export function unsnooze(): void {
    const prefs = getPreferences();
    prefs.snoozedUntil = null;
    savePreferences(prefs);
}

export function isSnoozed(): boolean {
    const prefs = getPreferences();
    return prefs.snoozedUntil !== null && new Date() < prefs.snoozedUntil;
}

export function getSnoozeEndTime(): Date | null {
    const prefs = getPreferences();
    if (!prefs.snoozedUntil || new Date() >= prefs.snoozedUntil) return null;
    return prefs.snoozedUntil;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOULD NOTIFY CHECK — Master decision function
// ─────────────────────────────────────────────────────────────────────────────

export interface NotifyDecision {
    allowed: boolean;
    reason?: string;
    urgencyOverride?: 'immediate' | 'timely' | 'batched' | 'digest';
    matchedRules?: CustomAlertRule[];
}

export function shouldNotify(
    domain: SignalDomain,
    priority: SignalPriority,
    _entityMatches?: { competitors?: string[]; topics?: string[] }
): NotifyDecision {
    const prefs = getPreferences();
    const persona = getActivePersona();

    // Check snooze first
    if (isSnoozed() && priority !== 'critical') {
        return { allowed: false, reason: 'Notifications snoozed' };
    }

    // Check quiet hours
    if (isQuietHoursActive()) {
        const canOverride = prefs.quietHours.allowCriticalOverride && priority === 'critical';
        if (!canOverride) {
            return { allowed: false, reason: 'Quiet hours active' };
        }
    }

    // Check active focus zone
    const activeFocus = getActiveFocus();
    if (activeFocus) {
        if (!activeFocus.zone.domains.includes(domain)) {
            return {
                allowed: false,
                reason: `Domain not in focus zone: ${activeFocus.zone.name}`,
                urgencyOverride: 'batched',
            };
        }
    }

    // Check persona settings
    if (!persona.settings.domains[domain]) {
        return { allowed: false, reason: `Domain disabled in ${persona.name} mode` };
    }

    // Check priority threshold
    const priorityRank: Record<SignalPriority, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
    };

    if (priorityRank[priority] < priorityRank[persona.settings.minPriority]) {
        return {
            allowed: false,
            reason: `Priority below threshold for ${persona.name} mode`,
            urgencyOverride: 'digest',
        };
    }

    // Check custom alert rules (they can override settings)
    const matchedRules = prefs.alertRules.filter(rule => {
        if (!rule.enabled) return false;

        const conditionsMet = rule.conditions.map(cond => {
            switch (cond.type) {
                case 'domain':
                    return cond.operator === 'equals'
                        ? domain === cond.value
                        : domain !== cond.value;
                case 'priority':
                    return cond.operator === 'equals'
                        ? priority === cond.value
                        : priority !== cond.value;
                default:
                    return false;
            }
        });

        return rule.conditionLogic === 'AND'
            ? conditionsMet.every(Boolean)
            : conditionsMet.some(Boolean);
    });

    if (matchedRules.length > 0) {
        // Custom rules can escalate urgency
        for (const rule of matchedRules) {
            const urgencyAction = rule.actions.find(a => a.type === 'urgency');
            if (urgencyAction) {
                return {
                    allowed: true,
                    urgencyOverride: urgencyAction.value as 'immediate' | 'timely',
                    matchedRules,
                };
            }
        }
    }

    return { allowed: true, matchedRules };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export function resetPreferences(): void {
    localStorage.removeItem(PREFS_KEY);
}
