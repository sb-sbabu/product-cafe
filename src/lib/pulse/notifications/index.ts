// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Notification System Index
// Clean exports for the intelligent notification system
// ═══════════════════════════════════════════════════════════════════════════

// Intelligent Notification Engine
export {
    // Types
    type IntelligentSignal,
    type NotificationCluster,
    type UserBehaviorData,
    type UrgencyLevel,
    type FatigueCheckResult,

    // Scoring & Processing
    calculateSIS,
    determineUrgency,
    processSignal,

    // Fatigue Prevention
    checkFatigueLimits,
    recordDelivery,
    getBudgetStatus,

    // Clustering
    findOrCreateCluster,
    createCluster,

    // User Behavior Learning
    getUserBehavior,
    initializeUserBehavior,
    recordInteraction,
    clearLearningData,

    // Signal Storage
    getIntelligentSignals,
    saveIntelligentSignals,
    getClusters,
    saveClusters,

    // Signal Queue
    addToQueue,
    getQueue,
    processQueue,
    clearQueue,

    // Signal Actions
    markSignalAsRead,
    dismissSignal,
    markAllAsRead,
    provideFeedback,
    getUnreadCount,
    getActiveSignals,
    getUnreadSignals,

    // Demo Data
    initDemoData,
} from './intelligentNotificationEngine';

// Notification Preferences Engine
export {
    // Types
    type NotificationPersona,
    type PersonaSettings,
    type FocusZone,
    type FocusSchedule,
    type ActiveFocus,
    type CustomAlertRule,
    type RuleCondition,
    type RuleAction,
    type RuleConditionType,
    type RuleActionType,
    type QuietHoursConfig,
    type IntelligentPreferences,
    type NotifyDecision,

    // Constants
    DEFAULT_PERSONAS,
    DEFAULT_PREFERENCES,

    // Preferences
    getPreferences,
    savePreferences,
    resetPreferences,

    // Personas
    getActivePersona,
    setActivePersona,
    createCustomPersona,
    deleteCustomPersona,
    getAllPersonas,

    // Focus Zones
    createFocusZone,
    activateFocusZone,
    deactivateFocusZone,
    getActiveFocus,
    deleteFocusZone,

    // Alert Rules
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    toggleAlertRule,

    // Quiet Hours
    isQuietHoursActive,
    setQuietHours,

    // Snooze
    snoozeNotifications,
    unsnooze,
    isSnoozed,
    getSnoozeEndTime,

    // Decision
    shouldNotify,
} from './notificationPreferencesEngine';
