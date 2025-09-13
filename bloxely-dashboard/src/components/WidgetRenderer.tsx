import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import WidgetErrorBoundary from './WidgetErrorBoundary';
import { widgetFactory } from '../services/WidgetFactory';
import { useDashboardActions } from '../hooks/useDashboardActions';
import { validateWidget } from '../utils/validation';
import { useNotifications } from '../context/NotificationContext';
import type { WidgetData } from '../types/dashboard';

interface WidgetRendererProps {
  widget: WidgetData;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const { updateWidget } = useDashboardActions();
  const { showError } = useNotifications();

  // Validate widget data
  const validation = validateWidget(widget);
  if (!validation.isValid) {
    console.error('Invalid widget data:', validation.errors);
    showError(
      'Widget Validation Error',
      `Widget "${widget.config?.title || widget.type}" has invalid data and may not work correctly.`,
      { persistent: true }
    );
  }

  const handleContentUpdate = (content: any) => {
    try {
      updateWidget(widget.id, content);
    } catch (error) {
      console.error('Failed to update widget content:', error);
      showError(
        'Update Failed',
        `Failed to update ${widget.config?.title || widget.type} widget.`
      );
    }
  };

  const handleConfigUpdate = (config: any) => {
    try {
      // For now, we'll handle config updates through the same mechanism
      // In a more complex implementation, this might be separate
      updateWidget(widget.id, { ...widget.content, _config: config });
    } catch (error) {
      console.error('Failed to update widget config:', error);
      showError(
        'Configuration Update Failed',
        `Failed to update ${widget.config?.title || widget.type} widget configuration.`
      );
    }
  };

  const widgetComponent = widgetFactory.createWidget(
    widget,
    handleContentUpdate,
    handleConfigUpdate
  );

  return (
    <WidgetErrorBoundary widget={widget}>
      <WidgetWrapper widget={widget}>
        {widgetComponent}
      </WidgetWrapper>
    </WidgetErrorBoundary>
  );
};

export default WidgetRenderer;