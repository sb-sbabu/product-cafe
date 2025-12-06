
import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { TagAutocomplete } from './TagAutocomplete';

interface SmartTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onValueChange?: (value: string) => void;
}

export const SmartTextarea: React.FC<SmartTextareaProps> = ({
    className,
    value,
    onChange,
    onValueChange,
    ...props
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [autocompleteState, setAutocompleteState] = useState<{
        isOpen: boolean;
        position: { top: number; left: number };
        searchTerm: string;
        triggerIndex: number;
    }>({
        isOpen: false,
        position: { top: 0, left: 0 },
        searchTerm: '',
        triggerIndex: -1
    });

    const getCursorCoordinates = () => {
        if (!textareaRef.current) return { top: 0, left: 0 };

        const { selectionStart } = textareaRef.current;

        // Create a dummy div to mirror the textarea's content and styling
        // This is a common trick to find the pixel coordinates of the caret
        const div = document.createElement('div');
        const style = window.getComputedStyle(textareaRef.current);

        // Copy styles
        Array.from(style).forEach((prop) => {
            div.style.setProperty(prop, style.getPropertyValue(prop));
        });

        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.top = '0';
        div.style.left = '0';

        // Content up to the cursor
        const content = (value as string).substring(0, selectionStart);
        div.textContent = content;

        // Create a span for the cursor position
        const span = document.createElement('span');
        span.textContent = '|';
        div.appendChild(span);

        document.body.appendChild(div);

        const { offsetLeft, offsetTop } = span;
        const { top, left } = textareaRef.current.getBoundingClientRect();

        document.body.removeChild(div);

        // Adjust relative to the textarea's real position on screen
        // We add line-height/padding offsets approximately
        return {
            top: top + offsetTop + parseInt(style.lineHeight || '20', 10), // position below line
            left: left + offsetLeft
        };
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPosition = e.target.selectionStart;

        // Propagate change
        onChange?.(e);
        onValueChange?.(newValue);

        // Check for tag trigger
        // Look backwards from cursor to find the last '#'
        const textBeforeCursor = newValue.substring(0, cursorPosition);
        const lastHashIndex = textBeforeCursor.lastIndexOf('#');

        if (lastHashIndex !== -1) {
            // Ensure no spaces between hash and cursor (tags can't have spaces yet)
            // Or if they can, we need a different heuristic. For now, assume no spaces.
            const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1);

            if (!/\s/.test(textAfterHash)) {
                // Determine screen coordinates
                const coords = getCursorCoordinates();

                setAutocompleteState({
                    isOpen: true,
                    position: coords,
                    searchTerm: textAfterHash,
                    triggerIndex: lastHashIndex
                });
                return;
            }
        }

        // If we didn't return above, close the autocomplete
        setAutocompleteState(prev => ({ ...prev, isOpen: false }));
    };

    const handleSelectTag = (tag: string) => {
        if (!textareaRef.current) return;

        const currentValue = value as string;
        const { triggerIndex, searchTerm } = autocompleteState;

        // Replace '#searchTerm' with '#tag '
        const before = currentValue.substring(0, triggerIndex);
        const after = currentValue.substring(triggerIndex + 1 + searchTerm.length);
        const newValue = `${before}#${tag} ${after}`;

        // Update value
        onValueChange?.(newValue);

        // Close
        setAutocompleteState(prev => ({ ...prev, isOpen: false }));

        // Focus back
        textareaRef.current.focus();
    };

    return (
        <>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                className={cn(className)}
                {...props}
            />

            {autocompleteState.isOpen && (
                <TagAutocomplete
                    searchTerm={autocompleteState.searchTerm}
                    position={autocompleteState.position}
                    onSelect={handleSelectTag}
                    onClose={() => setAutocompleteState(prev => ({ ...prev, isOpen: false }))}
                />
            )}
        </>
    );
};
