import React, { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    onClear?: () => void;
    isLoading?: boolean;
    autoFocus?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search anything...',
    value: controlledValue,
    onChange,
    onSearch,
    onClear,
    isLoading = false,
    autoFocus = false,
    size = 'md',
    className,
}) => {
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue ?? internalValue;
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sizes = {
        sm: 'py-2 pl-9 pr-9 text-sm',
        md: 'py-3 pl-11 pr-11 text-base',
        lg: 'py-4 pl-12 pr-12 text-lg',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    // Debounced search using ref
    const debouncedSearch = useCallback((searchValue: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onSearch?.(searchValue);
        }, 300);
    }, [onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
        debouncedSearch(newValue);
    };

    const handleClear = () => {
        if (controlledValue === undefined) {
            setInternalValue('');
        }
        onChange?.('');
        onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch?.(value);
        }
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <div className={cn('relative w-full', className)}>
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {isLoading ? (
                    <svg
                        className="animate-spin"
                        width={iconSizes[size]}
                        height={iconSizes[size]}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                ) : (
                    <Search size={iconSizes[size]} />
                )}
            </div>

            {/* Input */}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={cn(
                    'w-full bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-500 hover:border-gray-300',
                    sizes[size]
                )}
            />

            {/* Clear Button */}
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Clear search"
                >
                    <X size={iconSizes[size] - 4} />
                </button>
            )}
        </div>
    );
};
