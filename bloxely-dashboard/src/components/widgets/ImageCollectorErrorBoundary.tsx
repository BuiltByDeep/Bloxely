import { Component } from 'react';
import type { ErrorInfo } from 'react';
import type { ReactNode } from 'react';
import type { WidgetData } from '../../types/dashboard';

interface Props {
  children: ReactNode;
  widget: WidgetData;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ImageCollectorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Image Collector Widget Error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReset = () => {
    console.log('Resetting Image Collector to default state');
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="image-collector-error-boundary bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-6 m-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Image Collector Error
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                The Image Collector widget encountered an error and couldn't process your images properly. 
                This might be due to unsupported file formats or browser limitations.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Reset Widget
                </button>
              </div>
              <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                <p><strong>Troubleshooting tips:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Try uploading smaller image files (under 5MB)</li>
                  <li>Use common formats: JPG, PNG, GIF, WebP</li>
                  <li>Check if your browser supports the FileReader API</li>
                  <li>Clear browser cache if issues persist</li>
                </ul>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ImageCollectorErrorBoundary;