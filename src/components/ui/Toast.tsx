import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn, generateId } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    showToast: (options: { message: string; type?: ToastType; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = generateId();
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const showToast = useCallback((options: { message: string; type?: ToastType; duration?: number }) => {
        addToast({
            title: options.message,
            type: options.type || 'info',
            duration: options.duration,
        });
    }, [addToast]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container
interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

// Individual Toast
interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const backgrounds = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        warning: 'border-amber-200 bg-amber-50',
        info: 'border-blue-200 bg-blue-50',
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up bg-white',
                backgrounds[toast.type]
            )}
            role="alert"
            aria-live="polite"
        >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{toast.title}</p>
                {toast.description && (
                    <p className="text-gray-600 text-sm mt-0.5">{toast.description}</p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
