import { useState, useEffect } from 'react';

/**
 * Hook to simulate page loading state
 * @param delay - Loading delay in ms (default: 300ms)
 * @returns isLoading - Whether the page is still loading
 */
export function usePageLoading(delay: number = 300): boolean {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return isLoading;
}
