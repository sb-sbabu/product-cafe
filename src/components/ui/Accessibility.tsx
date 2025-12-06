import React from 'react';
import { cn } from '../../lib/utils';

interface VisuallyHiddenProps {
    children: React.ReactNode;
    as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Visually hides content but keeps it accessible to screen readers
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
    children,
    as: Component = 'span'
}) => {
    const styles: React.CSSProperties = {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
    };

    const Tag = Component;
    return (
        <Tag className="sr-only" style={styles}>
            {children}
        </Tag>
    );
};

interface SkipLinkProps {
    href: string;
    children: React.ReactNode;
}

/**
 * Skip to main content link for keyboard users
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => (
    <a
        href={href}
        className={cn(
            'sr-only focus:not-sr-only',
            'focus:fixed focus:top-4 focus:left-4 focus:z-[200]',
            'focus:px-4 focus:py-2 focus:bg-cafe-500 focus:text-white',
            'focus:rounded-lg focus:shadow-lg focus:outline-none',
            'focus:ring-2 focus:ring-cafe-700 focus:ring-offset-2'
        )}
    >
        {children}
    </a>
);

interface LiveRegionProps {
    children: React.ReactNode;
    mode?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all';
}

/**
 * ARIA live region for announcing dynamic content changes
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
    children,
    mode = 'polite',
    atomic = true,
    relevant = 'additions',
}) => (
    <div
        role="status"
        aria-live={mode}
        aria-atomic={atomic}
        aria-relevant={relevant}
        className="sr-only"
    >
        {children}
    </div>
);

interface FocusableProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    disabled?: boolean;
}

/**
 * Makes a non-interactive element focusable and interactive
 */
export const Focusable = React.forwardRef<HTMLDivElement, FocusableProps>(
    ({ children, disabled = false, onClick, onKeyDown, ...props }, ref) => {
        const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
            }
            onKeyDown?.(event);
        };

        return (
            <div
                ref={ref}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={disabled ? undefined : onClick}
                onKeyDown={handleKeyDown}
                aria-disabled={disabled}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Focusable.displayName = 'Focusable';

/**
 * Helpers to generate ARIA attributes
 */
export const ariaHelpers = {
    // For expandable sections
    expandable: (isExpanded: boolean, controlsId: string) => ({
        'aria-expanded': isExpanded,
        'aria-controls': controlsId,
    }),

    // For popups/dropdowns
    popup: (isOpen: boolean, popupId: string) => ({
        'aria-haspopup': true as const,
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? popupId : undefined,
    }),

    // For describedby
    described: (descriptionId: string | undefined) =>
        descriptionId ? { 'aria-describedby': descriptionId } : {},

    // For labelledby
    labelled: (labelId: string | undefined) =>
        labelId ? { 'aria-labelledby': labelId } : {},

    // For required fields
    required: (isRequired: boolean) => ({
        'aria-required': isRequired,
    }),

    // For invalid fields
    invalid: (isInvalid: boolean, errorId?: string) => ({
        'aria-invalid': isInvalid,
        'aria-errormessage': isInvalid && errorId ? errorId : undefined,
    }),
};
