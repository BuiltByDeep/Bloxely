import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { DashboardState, DashboardSettings, WidgetData, GridLayout } from '../types/dashboard';
import type { DashboardAction } from '../types/actions';
import { loadDashboardState, isStorageAvailable } from '../utils/persistence';
import { validateDashboardState } from '../utils/validation';
import { useDebouncedPersistence } from '../hooks/useDebouncedPersistence';
import { useNotifications } from '../context/NotificationContext';

// Initial state
const initialSettings: DashboardSettings = {
  theme: 'dark',
  gridCols: 12,
  gridRowHeight: 60,
  allowFreePlacement: false,
};

const initialState: DashboardState = {
  layout: [],
  widgets: {},
  settings: initialSettings,
};

// Dashboard reducer
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'ADD_WIDGET': {
      const { widgetType, position } = action.payload;
      const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create new widget data
      const newWidget: WidgetData = {
        id: widgetId,
        type: widgetType,
        content: getDefaultContent(widgetType),
        config: { title: getDefaultTitle(widgetType) },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create layout item with default size based on widget type
      const defaultSize = getDefaultSize(widgetType);
      
      // Calculate center position if no position is specified
      const centerX = position?.x ?? Math.max(0, Math.floor((state.settings.gridCols - defaultSize.w) / 2));
      const centerY = position?.y ?? Math.max(0, Math.floor((getMaxYPosition(state.layout) + 1)));
      
      const newLayoutItem: GridLayout = {
        i: widgetId,
        x: centerX,
        y: centerY,
        w: defaultSize.w,
        h: defaultSize.h,
        minW: defaultSize.minW,
        minH: defaultSize.minH,
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

    case 'UPDATE_WIDGET': {
      const { widgetId, content } = action.payload;
      
      if (!state.widgets[widgetId]) {
        return state;
      }

      return {
        ...state,
        widgets: {
          ...state.widgets,
          [widgetId]: {
            ...state.widgets[widgetId],
            content,
            updatedAt: new Date(),
          },
        },
      };
    }

    case 'UPDATE_LAYOUT': {
      const { layout } = action.payload;
      
      return {
        ...state,
        layout,
      };
    }

    case 'UPDATE_SETTINGS': {
      const { settings } = action.payload;
      
      return {
        ...state,
        settings: {
          ...state.settings,
          ...settings,
        },
      };
    }

    case 'LOAD_STATE': {
      const { state: loadedState } = action.payload;
      
      return {
        ...initialState,
        ...loadedState,
      };
    }

    case 'RESET_DASHBOARD': {
      return initialState;
    }

    default:
      return state;
  }
}

// Import widget factory for default values
import { widgetFactory } from '../services/WidgetFactory';

// Helper functions
function getDefaultContent(widgetType: string) {
  const definition = widgetFactory.getWidgetDefinition(widgetType as any);
  return definition?.defaultContent || {};
}

function getDefaultTitle(widgetType: string): string {
  const definition = widgetFactory.getWidgetDefinition(widgetType as any);
  return definition?.defaultConfig.title || 'Widget';
}

function getDefaultSize(widgetType: string) {
  return widgetFactory.getDefaultSize(widgetType as any);
}

// Helper function to find the maximum Y position in the current layout
function getMaxYPosition(layout: GridLayout[]): number {
  if (layout.length === 0) return 0;
  return Math.max(...layout.map(item => item.y + item.h));
}

// Context
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  isLoading: boolean;
  persistenceEnabled: boolean;
  forceSave: () => boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const { showError, showWarning, showSuccess } = useNotifications();

  // Initialize persistence and load saved state
  useEffect(() => {
    const initializePersistence = async () => {
      try {
        // Check if localStorage is available
        const storageAvailable = isStorageAvailable();
        setPersistenceEnabled(storageAvailable);

        if (storageAvailable) {
          // Try to load saved state
          const savedState = loadDashboardState();
          
          if (savedState) {
            // Validate loaded state
            const validation = validateDashboardState(savedState);
            
            if (validation.isValid) {
              console.log('Restoring dashboard state from localStorage');
              dispatch({ type: 'LOAD_STATE', payload: { state: savedState } });
              showSuccess('Dashboard Restored', 'Your workspace has been restored from local storage.');
            } else {
              console.warn('Loaded state is invalid:', validation.errors);
              showWarning(
                'Invalid Data Detected',
                'Some saved data was corrupted and has been reset to defaults.',
                { duration: 8000 }
              );
              // Use default state instead
            }
          } else {
            console.log('No saved state found, using default state');
          }
        } else {
          console.warn('localStorage not available, persistence disabled');
          showWarning(
            'Auto-save Disabled',
            'Local storage is not available. Your changes will not be saved.',
            { persistent: true }
          );
        }
      } catch (error) {
        console.error('Failed to initialize persistence:', error);
        setPersistenceEnabled(false);
        showError(
          'Initialization Error',
          'Failed to initialize the dashboard. Some features may not work correctly.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializePersistence();
  }, [showError, showWarning, showSuccess]);

  // Set up debounced persistence
  const { forceSave } = useDebouncedPersistence(state, {
    enabled: persistenceEnabled && !isLoading,
    delay: 1000
  });

  return (
    <DashboardContext.Provider 
      value={{ 
        state, 
        dispatch, 
        isLoading, 
        persistenceEnabled, 
        forceSave 
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook
export function useDashboard() {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
}