import React, { useId } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            `w-full px-4 py-2.5 bg-white border rounded-lg text-gray-900
               placeholder-gray-400 transition-all duration-200
               focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-500`,
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
                {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
