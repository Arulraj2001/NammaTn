import React from "react";
import { RefreshCw, AlertCircle, Home } from "lucide-react";

/**
 * Global Error Boundary — catches all unhandled React render errors.
 * Usage: wrap your app root or individual route sections.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in production for server-side collection
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback: FallbackComponent, minimal } = this.props;

    if (FallbackComponent) {
      return <FallbackComponent error={this.state.error} onReset={this.handleReset} />;
    }

    if (minimal) {
      return (
        <div className="flex items-center justify-center p-8 text-slate-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">Something went wrong.</span>
          <button
            onClick={this.handleReset}
            className="ml-3 text-xs text-blue-500 hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Please try refreshing the page.
            {(process.env.NODE_ENV === 'development') && this.state.error && (
              <span className="block mt-2 font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded text-left text-red-600 dark:text-red-400 break-all">
                {this.state.error.message}
              </span>
            )}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;