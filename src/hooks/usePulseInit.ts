// ═══════════════════════════════════════════════════════════════════════════
// CAFÉ PULSE — Initialization Hook
// Auto-fetches live healthcare news on app load + periodic refresh
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import { usePulseStore } from '../lib/pulse/usePulseStore';
import { initDemoData } from '../lib/pulse/notifications';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function usePulseInit() {
    const fetchSignals = usePulseStore(state => state.fetchSignals);
    const isLoading = usePulseStore(state => state.isLoading);
    const lastFetchedAt = usePulseStore(state => state.lastFetchedAt);
    const signals = usePulseStore(state => state.signals);

    const hasInitialized = useRef(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate time since last fetch
    const getTimeSinceLastFetch = useCallback(() => {
        if (!lastFetchedAt) return null;
        const now = new Date();
        const lastFetch = new Date(lastFetchedAt);
        const diffMs = now.getTime() - lastFetch.getTime();

        const minutes = Math.floor(diffMs / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        return 'over a day ago';
    }, [lastFetchedAt]);

    // Initial fetch on mount
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        console.log('[PULSE] Initializing...');

        // Initialize demo data as fallback
        initDemoData();

        // Fetch live news (non-blocking)
        const initFetch = async () => {
            try {
                console.log('[PULSE] Fetching live healthcare news...');
                await fetchSignals(false); // Use cache if available
                console.log('[PULSE] Initial fetch complete');
            } catch (error) {
                console.warn('[PULSE] Initial fetch failed, using demo data:', error);
            }
        };

        // Delay slightly to not block initial render
        setTimeout(initFetch, 1000);
    }, [fetchSignals]);

    // Set up periodic refresh
    useEffect(() => {
        refreshIntervalRef.current = setInterval(() => {
            console.log('[PULSE] Periodic refresh triggered');
            fetchSignals(false).catch(err => {
                console.warn('[PULSE] Periodic refresh failed:', err);
            });
        }, REFRESH_INTERVAL_MS);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [fetchSignals]);

    // Manual refresh function
    const forceRefresh = useCallback(async () => {
        console.log('[PULSE] Force refresh requested');
        await fetchSignals(true);
    }, [fetchSignals]);

    return {
        isLoading,
        lastFetchedAt,
        timeSinceLastFetch: getTimeSinceLastFetch(),
        signalCount: signals.length,
        forceRefresh,
    };
}
