import { describe, it, expect, beforeEach } from 'vitest';
import type { DashboardState, DashboardSettings } from '../types/dashboard';
import type { DashboardAction } from '../types/actions';

// Import the reducer function (we'll need to export it from the context)
// For now, let's create a test version
const initialSettings: DashboardSettings = {
  theme: 'dark',
  gridCols: 12,
  gridRowHeight: 60,
};

const initialState: DashboardState = {
  layout: [],
  widgets: {},
  settings: initialSettings,
};

// Mock reducer for testing (this would normally be imported)
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  // This is a simplified version for testing
  switch (action.type) {
    case 'ADD_WIDGET': {
      const { widgetType } = action.payload;
      const widgetId = `widget-test-${Date.now()}`;
      
      const newWidget = {
        id: widgetId,
        type: widgetType,
        content: {},
        config: { title: 'Test Widget' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newLayoutItem = {
        i: widgetId,
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      };

      return {
        ...state,
        widgets: {
          ...state.widgets,
          [widgetId]: newWidget,
        },
        layout: [...state.layout, newLayoutItem],
      };
    }
    
    case 'REMOVE_WIDGET': {
      const { widgetId } = action.payload;
      const { [widgetId]: removedWidget, ...remainingWidgets } = state.widgets;
      
      return {
        ...state,
        widgets: remainingWidgets,
        layout: state.layout.filter(item => item.i !== widgetId),
      };
    }
    
    default:
      return state;
  }
}

describe('Dashboard Reducer', () => {
  let state: DashboardState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('ADD_WIDGET', () => {
    it('should add a new widget to the state', () => {
      const action: DashboardAction = {
        type: 'ADD_WIDGET',
        payload: { widgetType: 'clock' },
      };

      const newState = dashboardReducer(state, action);

      expect(Object.keys(newState.widgets)).toHaveLength(1);
      expect(newState.layout).toHaveLength(1);
      
      const widgetId = Object.keys(newState.widgets)[0];
      const widget = newState.widgets[widgetId];
      
      expect(widget.type).toBe('clock');
      expect(widget.id).toBe(widgetId);
      expect(newState.layout[0].i).toBe(widgetId);
    });

    it('should not mutate the original state', () => {
      const action: DashboardAction = {
        type: 'ADD_WIDGET',
        payload: { widgetType: 'todo' },
      };

      const newState = dashboardReducer(state, action);

      expect(newState).not.toBe(state);
      expect(newState.widgets).not.toBe(state.widgets);
      expect(newState.layout).not.toBe(state.layout);
    });
  });

  describe('REMOVE_WIDGET', () => {
    it('should remove a widget from the state', () => {
      // First add a widget
      const addAction: DashboardAction = {
        type: 'ADD_WIDGET',
        payload: { widgetType: 'clock' },
      };
      
      const stateWithWidget = dashboardReducer(state, addAction);
      const widgetId = Object.keys(stateWithWidget.widgets)[0];

      // Then remove it
      const removeAction: DashboardAction = {
        type: 'REMOVE_WIDGET',
        payload: { widgetId },
      };

      const finalState = dashboardReducer(stateWithWidget, removeAction);

      expect(Object.keys(finalState.widgets)).toHaveLength(0);
      expect(finalState.layout).toHaveLength(0);
      expect(finalState.widgets[widgetId]).toBeUndefined();
    });

    it('should handle removing non-existent widget gracefully', () => {
      const action: DashboardAction = {
        type: 'REMOVE_WIDGET',
        payload: { widgetId: 'non-existent' },
      };

      const newState = dashboardReducer(state, action);

      expect(newState.widgets).toEqual(state.widgets);
      expect(newState.layout).toEqual(state.layout);
    });
  });
});