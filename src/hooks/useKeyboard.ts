import { useEffect, useCallback, useRef, useState } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    handler: KeyHandler;
    description?: string;
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        for (const shortcut of shortcuts) {
            const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
            const matchesCtrl = !!shortcut.ctrl === event.ctrlKey;
            const matchesAlt = !!shortcut.alt === event.altKey;
            const matchesShift = !!shortcut.shift === event.shiftKey;
            const matchesMeta = !!shortcut.meta === event.metaKey;

            if (matchesKey && matchesCtrl && matchesAlt && matchesShift && matchesMeta) {
                event.preventDefault();
                shortcut.handler(event);
                break;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Hook for focus trapping within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isActive) return;

        // Store the previously focused element
        previousFocusRef.current = document.activeElement as HTMLElement;

        const container = containerRef.current;
        if (!container) return;

        // Get all focusable elements
        const focusableSelector =
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstFocusable?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    event.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    event.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            // Restore focus to previous element
            previousFocusRef.current?.focus();
        };
    }, [isActive]);

    return containerRef;
}

/**
 * Hook for arrow key navigation within a list
 */
export function useArrowNavigation<T extends HTMLElement>(
    items: React.RefObject<T>[],
    options: {
        orientation?: 'horizontal' | 'vertical' | 'both';
        wrap?: boolean;
        onSelect?: (index: number) => void;
    } = {}
) {
    const { orientation = 'vertical', wrap = true, onSelect } = options;
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentIndexRef = useRef(0);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const isVertical = orientation === 'vertical' || orientation === 'both';
        const isHorizontal = orientation === 'horizontal' || orientation === 'both';

        let newIndex = currentIndexRef.current;

        if ((event.key === 'ArrowUp' && isVertical) ||
            (event.key === 'ArrowLeft' && isHorizontal)) {
            event.preventDefault();
            newIndex = currentIndexRef.current - 1;
            if (newIndex < 0) {
                newIndex = wrap ? items.length - 1 : 0;
            }
        } else if ((event.key === 'ArrowDown' && isVertical) ||
            (event.key === 'ArrowRight' && isHorizontal)) {
            event.preventDefault();
            newIndex = currentIndexRef.current + 1;
            if (newIndex >= items.length) {
                newIndex = wrap ? 0 : items.length - 1;
            }
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect?.(currentIndexRef.current);
            return;
        } else if (event.key === 'Home') {
            event.preventDefault();
            newIndex = 0;
        } else if (event.key === 'End') {
            event.preventDefault();
            newIndex = items.length - 1;
        } else {
            return;
        }

        currentIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
        items[newIndex]?.current?.focus();
    }, [items, orientation, wrap, onSelect]);

    const getItemProps = useCallback((index: number) => ({
        tabIndex: index === currentIndexRef.current ? 0 : -1,
        onKeyDown: handleKeyDown,
        onFocus: () => {
            currentIndexRef.current = index;
            setCurrentIndex(index);
        },
    }), [handleKeyDown]);

    return { getItemProps, currentIndex };
}

/**
 * Hook for detecting clicks outside an element
 */
export function useClickOutside<T extends HTMLElement>(
    callback: () => void,
    refs: React.RefObject<T | null>[]
) {
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const isOutside = refs.every(ref =>
                ref.current && !ref.current.contains(event.target as Node)
            );
            if (isOutside) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [callback, refs]);
}

/**
 * Hook for escape key handling
 */
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callback();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [callback, isActive]);
}
