/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAB & GO — Feature Exports
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Main Page
export { GrabAndGoPage, default } from './GrabAndGoPage';

// Components
export { QuickActionCard, QuickActionChip } from './components/QuickActionCard';
export { SmartSuggestionRail } from './components/SmartSuggestionRail';
export { PinnedFavorites } from './components/PinnedFavorites';
export { RecentHistory } from './components/RecentHistory';
export { StatusDashboard } from './components/StatusDashboard';

// Store
export {
    useGrabAndGoStore,
    usePinnedActions,
    useRecentItems,
    usePendingRequests,
    useUpcomingDeadlines,
} from './store/grabAndGoStore';

// Actions
export {
    QUICK_ACTIONS,
    CATEGORY_GRADIENTS,
    CATEGORY_LABELS,
    getDefaultActions,
    getActionsByCategory,
    searchActions,
    getActionById,
    type QuickAction,
    type QuickActionCategory,
} from './actions/quickActions';

// Engine
export {
    generateSmartSuggestions,
    getCurrentContext,
    getGreeting,
    getContextualMessage,
    type SmartSuggestion,
    type SuggestionContext,
    type UserRole,
} from './engine/smartSuggestionEngine';
