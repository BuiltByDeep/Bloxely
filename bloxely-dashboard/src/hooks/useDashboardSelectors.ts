import { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { WidgetData, WidgetType } from '../types/dashboard';

export function useDashboardSelectors() {
  const { state } = useDashboard();

  const widgets = useMemo(() => state.widgets, [state.widgets]);
  
  const layout = useMemo(() => state.layout, [state.layout]);
  
  const settings = useMemo(() => state.settings, [state.settings]);

  const widgetIds = useMemo(() => Object.keys(state.widgets), [state.widgets]);

  const getWidget = useMemo(() => {
    return (widgetId: string): WidgetData | undefined => {
      return state.widgets[widgetId];
    };
  }, [state.widgets]);

  const getWidgetsByType = useMemo(() => {
    return (widgetType: WidgetType): WidgetData[] => {
      return Object.values(state.widgets).filter(widget => widget.type === widgetType);
    };
  }, [state.widgets]);

  const getWidgetCount = useMemo(() => {
    return Object.keys(state.widgets).length;
  }, [state.widgets]);

  const getWidgetCountByType = useMemo(() => {
    return (widgetType: WidgetType): number => {
      return Object.values(state.widgets).filter(widget => widget.type === widgetType).length;
    };
  }, [state.widgets]);

  const hasWidgets = useMemo(() => {
    return Object.keys(state.widgets).length > 0;
  }, [state.widgets]);

  return {
    widgets,
    layout,
    settings,
    widgetIds,
    getWidget,
    getWidgetsByType,
    getWidgetCount,
    getWidgetCountByType,
    hasWidgets,
  };
}