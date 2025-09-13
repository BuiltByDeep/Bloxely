import { useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { WidgetType, GridLayout, DashboardSettings } from '../types/dashboard';

export function useDashboardActions() {
  const { dispatch } = useDashboard();

  const addWidget = useCallback((widgetType: WidgetType, position?: { x: number; y: number }) => {
    dispatch({
      type: 'ADD_WIDGET',
      payload: { widgetType, position },
    });
  }, [dispatch]);

  const removeWidget = useCallback((widgetId: string) => {
    dispatch({
      type: 'REMOVE_WIDGET',
      payload: { widgetId },
    });
  }, [dispatch]);

  const updateWidget = useCallback((widgetId: string, content: any) => {
    dispatch({
      type: 'UPDATE_WIDGET',
      payload: { widgetId, content },
    });
  }, [dispatch]);

  const updateLayout = useCallback((layout: GridLayout[]) => {
    dispatch({
      type: 'UPDATE_LAYOUT',
      payload: { layout },
    });
  }, [dispatch]);

  const updateSettings = useCallback((settings: Partial<DashboardSettings>) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { settings },
    });
  }, [dispatch]);

  const loadState = useCallback((state: any) => {
    dispatch({
      type: 'LOAD_STATE',
      payload: { state },
    });
  }, [dispatch]);

  const resetDashboard = useCallback(() => {
    dispatch({
      type: 'RESET_DASHBOARD',
    });
  }, [dispatch]);

  return {
    addWidget,
    removeWidget,
    updateWidget,
    updateLayout,
    updateSettings,
    loadState,
    resetDashboard,
  };
}