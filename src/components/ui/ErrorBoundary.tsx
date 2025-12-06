import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[200px] flex items-center justify-center p-8">
                    <Card className="p-8 max-w-md text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 text-sm mb-4">
                            We encountered an unexpected error. Please try refreshing or contact support if this persists.
                        </p>
                        {this.state.error && (
                            <details className="mb-4 text-left">
                                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                                    Technical details
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <Button
                            variant="primary"
                            onClick={this.handleReset}
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            Try Again
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
