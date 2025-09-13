import React from 'react';
import type { BaseWidgetProps } from '../../types/widget';

interface BaseWidgetState {
  isLoading?: boolean;
  error?: string;
}

export abstract class BaseWidget<T = any> extends React.Component<BaseWidgetProps, BaseWidgetState> {
  constructor(props: BaseWidgetProps) {
    super(props);
    this.state = {
      isLoading: false,
      error: undefined,
    };
  }

  // Abstract method that must be implemented by child widgets
  abstract renderContent(): React.ReactNode;

  // Helper method to update widget content
  protected updateContent = (newContent: Partial<T>) => {
    const updatedContent = {
      ...this.props.widget.content,
      ...newContent,
    };
    this.props.onUpdate(updatedContent);
  };

  // Helper method to update widget config
  protected updateConfig = (newConfig: Partial<typeof this.props.widget.config>) => {
    const updatedConfig = {
      ...this.props.widget.config,
      ...newConfig,
    };
    this.props.onConfigUpdate(updatedConfig);
  };

  // Error boundary-like error handling
  protected setError = (error: string) => {
    this.setState({ error });
  };

  protected clearError = () => {
    this.setState({ error: undefined });
  };

  protected setLoading = (isLoading: boolean) => {
    this.setState({ isLoading });
  };

  // Render error state
  private renderError() {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-sm text-center">Widget Error</p>
        <p className="text-xs text-slate-500 mt-1">{this.state.error}</p>
        <button
          onClick={this.clearError}
          className="mt-2 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render loading state
  private renderLoading() {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="animate-spin text-2xl mb-2">⏳</div>
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  render() {
    if (this.state.error) {
      return this.renderError();
    }

    if (this.state.isLoading) {
      return this.renderLoading();
    }

    try {
      return this.renderContent();
    } catch (error) {
      console.error('Widget render error:', error);
      this.setError(error instanceof Error ? error.message : 'Unknown error');
      return this.renderError();
    }
  }
}

// Functional component version for hooks-based widgets
export interface FunctionalBaseWidgetProps extends BaseWidgetProps {
  children: React.ReactNode;
}

export const FunctionalBaseWidget: React.FC<FunctionalBaseWidgetProps> = ({
  children,
}) => {
  return <>{children}</>;
};