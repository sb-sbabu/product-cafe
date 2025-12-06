/**
 * ReactionPicker - Emoji reaction picker popover
 * 
 * Features:
 * - Shows available reaction emojis
 * - Hover labels for each reaction
 * - Click to add/toggle reaction
 * - Uses REACTION_CONFIG from gamification types
 */

import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { cn } from '../../lib/utils';
import { REACTION_CONFIG, type ReactionType } from '../../types/gamification';

interface ReactionPickerProps {
    onSelect: (type: ReactionType) => void;
    className?: string;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
    onSelect,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const reactions = Object.entries(REACTION_CONFIG) as [ReactionType, { icon: string; label: string }][];

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'p-1.5 rounded-md transition-colors',
                    isOpen
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                )}
                aria-label="Add reaction"
                aria-expanded={isOpen}
            >
                <Smile className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className={cn(
                    'absolute z-50 left-0 mt-1 p-2',
                    'bg-white rounded-xl shadow-lg border border-gray-200',
                    'grid grid-cols-5 gap-1',
                    'w-[190px]',
                    'animate-in fade-in-0 zoom-in-95 duration-150'
                )}>
                    {reactions.map(([type, config]) => (
                        <button
                            key={type}
                            onClick={() => {
                                onSelect(type);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'p-1.5 rounded-lg text-lg',
                                'hover:bg-gray-100 active:scale-95',
                                'transition-all duration-100',
                                'focus:outline-none focus:ring-2 focus:ring-orange-300'
                            )}
                            title={config.label}
                            aria-label={config.label}
                        >
                            {config.icon}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReactionPicker;
