/**
 * PointToast - Animated point award notification
 * 
 * Shows a toast when user earns points with subtle animation.
 */

import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PointAction } from '../../types/gamification';
import { POINT_ACTIONS } from '../../stores/pointsStore';

interface PointToastProps {
    action: PointAction;
    points: number;
    onClose: () => void;
    duration?: number;
    className?: string;
}

export const PointToast: React.FC<PointToastProps> = ({
    action,
    points,
    onClose,
    duration = 3000,
    className,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const config = POINT_ACTIONS[action];
    const description = config?.description || action.replace(/_/g, ' ');

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto-close
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={cn(
                'fixed bottom-4 right-4 z-50',
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'bg-white/95 backdrop-blur-lg border border-pink-200',
                'shadow-lg shadow-pink-500/10',
                'transform transition-all duration-300 ease-out',
                isVisible && !isExiting
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-4 opacity-0 scale-95',
                className
            )}
            role="alert"
        >
            {/* Heart icon with pulse */}
            <div className="relative">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
            </div>

            {/* Content */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-pink-600">+{points}</span>
                    <span className="text-sm text-gray-500">Café Credits</span>
                </div>
                <span className="text-xs text-gray-400">{description}</span>
            </div>

            {/* Close button */}
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
};

// Toast container for multiple toasts
interface ToastContainerProps {
    toasts: Array<{
        id: string;
        action: PointAction;
        points: number;
    }>;
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ transform: `translateY(-${index * 8}px)` }}
                >
                    <PointToast
                        action={toast.action}
                        points={toast.points}
                        onClose={() => onRemove(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

// Hook for managing toast state
export function usePointToast() {
    const [toasts, setToasts] = useState<Array<{
        id: string;
        action: PointAction;
        points: number;
    }>>([]);

    const showToast = (action: PointAction, points: number) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, action, points }]);

        // Limit to 3 toasts
        if (toasts.length >= 3) {
            setToasts(prev => prev.slice(1));
        }
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, showToast, removeToast };
}
