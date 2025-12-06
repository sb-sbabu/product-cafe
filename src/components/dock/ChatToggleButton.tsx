import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ChatToggleButton - Floating button to toggle chat dock
 * 
 * Position: Bottom-right, moves left when dock is open
 * Icon: Chat bubble when closed, X when open
 */

interface ChatToggleButtonProps {
    isOpen: boolean;
    onClick: () => void;
    dockWidth?: number; // Width of dock when open
    className?: string;
}

export const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({
    isOpen,
    onClick,
    dockWidth = 380,
    className,
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'fixed z-50 bottom-6',
                'flex items-center justify-center',
                'w-14 h-14 rounded-full shadow-lg',
                'transition-all duration-300 ease-out',
                'bg-gradient-to-br from-amber-500 to-orange-500',
                'hover:from-amber-600 hover:to-orange-600',
                'hover:shadow-xl hover:scale-105',
                'text-white',
                className
            )}
            style={{
                // Move left when dock is open to stay outside of dock
                right: isOpen ? `${dockWidth + 24}px` : '24px',
            }}
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
            title={isOpen ? 'Close chat' : 'Ask Café Assistant'}
        >
            {isOpen ? (
                <X className="w-6 h-6" />
            ) : (
                <MessageCircle className="w-6 h-6" />
            )}
        </button>
    );
};
