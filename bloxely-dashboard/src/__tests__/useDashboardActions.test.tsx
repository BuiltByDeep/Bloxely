import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import { useDashboardActions } from '../hooks/useDashboardActions';
import { useDashboardSelectors } from '../hooks/useDashboardSelectors';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

// Combined hook for testing
function useDashboard() {
  const actions = useDashboardActions();
  const selectors = useDashboardSelectors();
  return { ...actions, ...selectors };
}

describe('useDashboardActions', () => {
  it('should add a widget to the dashboard', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // Initially no widgets
    expect(result.current.getWidgetCount).toBe(0);

    // Add a widget
    act(() => {
      result.current.addWidget('clock');
    });

    // Should have one widget now
    expect(result.current.getWidgetCount).toBe(1);
    expect(result.current.hasWidgets).toBe(true);
  });

  it('should remove a widget from the dashboard', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // Add a widget first
    act(() => {
      result.current.addWidget('todo');
    });

    const widgetId = result.current.widgetIds[0];
    expect(result.current.getWidgetCount).toBe(1);

    // Remove the widget
    act(() => {
      result.current.removeWidget(widgetId);
    });

    // Should have no widgets now
    expect(result.current.getWidgetCount).toBe(0);
    expect(result.current.hasWidgets).toBe(false);
  });

  it('should update widget content', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // Add a todo widget
    act(() => {
      result.current.addWidget('todo');
    });

    const widgetId = result.current.widgetIds[0];
    const initialWidget = result.current.getWidget(widgetId);
    
    expect(initialWidget?.content).toEqual({ tasks: [] });

    // Update widget content
    const newContent = { tasks: [{ id: '1', text: 'Test task', completed: false, createdAt: new Date() }] };
    
    act(() => {
      result.current.updateWidget(widgetId, newContent);
    });

    const updatedWidget = result.current.getWidget(widgetId);
    expect(updatedWidget?.content).toEqual(newContent);
  });
});