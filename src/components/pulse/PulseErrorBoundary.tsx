import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PULSE ERROR BOUNDARY — Graceful error handling for the Pulse module
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class PulseErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('🚨 Pulse Error Boundary caught:', error, errorInfo);
        this.setState({ errorInfo });

        // In production, you could send to error monitoring service
        // sendToErrorMonitoring({ error, errorInfo, module: 'pulse' });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Something went wrong
                    </h2>

                    <p className="text-gray-500 max-w-md mb-6">
                        The Pulse intelligence module encountered an unexpected error.
                        This has been logged for review.
                    </p>

                    {/* Error details (development only) */}
                    {import.meta.env.DEV && this.state.error && (
                        <details className="mb-6 text-left w-full max-w-lg">
                            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600">
                                Error details
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-cafe-500 text-white rounded-lg hover:bg-cafe-600 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Home size={16} />
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Wrap component with error boundary
// ─────────────────────────────────────────────────────────────────────────────

export function withPulseErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const WithErrorBoundary = (props: P) => (
        <PulseErrorBoundary fallback={fallback}>
            <WrappedComponent {...props} />
        </PulseErrorBoundary>
    );

    WithErrorBoundary.displayName = `withPulseErrorBoundary(${displayName})`;
    return WithErrorBoundary;
}
