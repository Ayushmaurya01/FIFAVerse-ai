import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('⚠️ Uncaught Operations Platform Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-fifa-dark px-4 py-16 text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
            <div className="h-16 w-16 bg-red-500/15 border border-red-500/30 text-fifa-red flex items-center justify-center rounded-full mx-auto mb-6 animate-pulse">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Operations Center Error
            </h1>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The stadium operations dashboard encountered an unexpected error. Safe local operation modes are active, but a reload is recommended.
            </p>

            <button
              onClick={this.handleRetry}
              className="w-full bg-fifa-blue hover:bg-fifa-blue/90 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
            >
              Retry Operations Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
