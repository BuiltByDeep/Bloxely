import React from 'react';
import type { ErrorInfo } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useDashboardActions } from '../hooks/useDashboardActions';
import type { WidgetData } from '../types/dashboard';

interface WidgetErrorBoundaryProps {
  widget: WidgetData;
  children: React.ReactNode;
}

const WidgetErrorBoundary: React.FC<WidgetErrorBoundaryProps> = ({ widget, children }) => {
  const { removeWidget } = useDashboardActions();

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log widget-specific error information
    console.error(`Widget Error [${widget.type}:${widget.id}]:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      widget: {
        id: widget.id,
        type: widget.type,
        config: widget.config,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
      },
    });

    // You could also send this to an error reporting service here
    // Example: errorReportingService.captureException(error, { widget, errorInfo });
  };

  const handleRemoveWidget = () => {
    removeWidget(widget.id);
  };

  const errorFallback = (
    <div className="widget-error-container bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 h-full flex flex-col justify-center items-center text-center">
      <div className="mb-3">
        <svg
          className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      
      <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
        Widget Error
      </h4>
      
      <p className="text-xs text-red-700 dark:text-red-300 mb-4 max-w-xs">
        The {widget.config.title || widget.type} widget encountered an error and couldn't load.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 text-xs font-medium"
        >
          Reload Widget
        </button>
        
        <button
          onClick={handleRemoveWidget}
          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 text-xs font-medium"
        >
          Remove Widget
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400">
          Widget ID: {widget.id}
        </div>
      )}
    </div>
  );

  return (
    <ErrorBoundary
      fallback={errorFallback}
      onError={handleError}
      resetKeys={[widget.id, widget.updatedAt.getTime()]}
      resetOnPropsChange={false}
    >
      {children}
    </ErrorBoundary>
  );
};

export default WidgetErrorBoundary;