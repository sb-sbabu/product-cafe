import { useCallback } from 'react';
import { analyticsApi, type AnalyticsEvent } from '../services/api';

/**
 * Analytics Hook
 * 
 * Provides easy-to-use analytics tracking throughout the app.
 * All events are queued and can be sent to Azure App Insights,
 * Mixpanel, Amplitude, or any telemetry backend.
 */

export function useAnalytics() {
    const trackPageView = useCallback((page: string) => {
        analyticsApi.track({ type: 'page_view', page });
    }, []);

    const trackSearch = useCallback((query: string, resultCount: number) => {
        analyticsApi.track({ type: 'search', query, resultCount });
    }, []);

    const trackResourceView = useCallback((resourceId: string) => {
        analyticsApi.track({ type: 'resource_view', resourceId });
    }, []);

    const trackResourceClick = useCallback((resourceId: string) => {
        analyticsApi.track({ type: 'resource_click', resourceId });
    }, []);

    const trackFAQView = useCallback((faqId: string) => {
        analyticsApi.track({ type: 'faq_view', faqId });
    }, []);

    const trackFAQHelpful = useCallback((faqId: string, helpful: boolean) => {
        analyticsApi.track({ type: 'faq_helpful', faqId, helpful });
    }, []);

    const trackChatMessage = useCallback((intent: string) => {
        analyticsApi.track({ type: 'chat_message', intent });
    }, []);

    const trackQuickReply = useCallback((replyId: string) => {
        analyticsApi.track({ type: 'quick_reply_click', replyId });
    }, []);

    const trackError = useCallback((message: string, stack?: string) => {
        analyticsApi.track({ type: 'error', message, stack });
    }, []);

    const track = useCallback((event: AnalyticsEvent) => {
        analyticsApi.track(event);
    }, []);

    return {
        trackPageView,
        trackSearch,
        trackResourceView,
        trackResourceClick,
        trackFAQView,
        trackFAQHelpful,
        trackChatMessage,
        trackQuickReply,
        trackError,
        track,
    };
}

/**
 * Page View Tracker Component
 * 
 * Drop this into any page to automatically track page views:
 * 
 * ```tsx
 * import { PageViewTracker } from '../hooks/useAnalytics';
 * 
 * export const LibraryPage = () => {
 *   return (
 *     <>
 *       <PageViewTracker page="library" />
 *       ... page content ...
 *     </>
 *   );
 * };
 * ```
 */
export function PageViewTracker({ page }: { page: string }) {
    const { trackPageView } = useAnalytics();

    // Track on mount
    trackPageView(page);

    return null;
}
