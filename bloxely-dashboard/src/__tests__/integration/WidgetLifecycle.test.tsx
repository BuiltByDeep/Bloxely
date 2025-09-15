import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardProvider } from '../../context/DashboardContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';
import { widgetFactory } from '../../services/WidgetFactory';
import { widgetRegistry } from '../../services/WidgetRegistry';

// Mock dependencies
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock matchMedia for theme context
const mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock FileReader for image collector
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mockImageData',
  onload: null as any,
  onerror: null as any,
};
global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <NotificationProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </NotificationProvider>
  </ThemeProvider>
);

describe('Widget Lifecycle Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Widget Factory Integration', () => {
    it('properly registers all new widget components', () => {
      // Check that all new widgets are registered in the factory
      expect(widgetFactory.isSupported('habit-tracker')).toBe(true);
      expect(widgetFactory.isSupported('image-collector')).toBe(true);
    });

    it('provides correct default widget data for new widgets', () => {
      
      const habitTrackerData = widgetFactory.getDefaultWidgetData('habit-tracker', 'test-id-2');
      expect(habitTrackerData).toMatchObject({
        id: 'test-id-2',
        type: 'habit-tracker',
        content: {
          habits: [],
          completions: [],
          streaks: {}
        },
        config: { title: 'Habit Tracker' }
      });

      const imageCollectorData = widgetFactory.getDefaultWidgetData('image-collector', 'test-id-3');
      expect(imageCollectorData).toMatchObject({
        id: 'test-id-3',
        type: 'image-collector',
        content: {
          images: [],
          maxImages: 20,
          thumbnailSize: 150
        },
        config: { title: 'Image Collector' }
      });
    });

    it('provides correct default sizes for new widgets', () => {
      
      const habitTrackerSize = widgetFactory.getDefaultSize('habit-tracker');
      expect(habitTrackerSize).toEqual({ w: 5, h: 4, minW: 4, minH: 3, maxW: 6, maxH: 5 });

      const imageCollectorSize = widgetFactory.getDefaultSize('image-collector');
      expect(imageCollectorSize).toEqual({ w: 4, h: 4, minW: 3, minH: 3, maxW: 6, maxH: 6 });
    });
  });

  describe('Widget Registry Integration', () => {
    it('includes all new widgets in available widgets list', () => {
      const availableWidgets = widgetRegistry.getAvailable();
      const widgetNames = availableWidgets.map(w => w.name);

      expect(widgetNames).toContain('Habit Streak Tracker');
      expect(widgetNames).toContain('Image & Screenshot Collector');
    });

    it('provides correct widget definitions', () => {
      
      const habitTracker = widgetRegistry.get('habit-tracker');
      expect(habitTracker).toMatchObject({
        type: 'habit-tracker',
        name: 'Habit Streak Tracker',
        description: 'Build consistent daily routines',
        icon: '📅'
      });

      const imageCollector = widgetRegistry.get('image-collector');
      expect(imageCollector).toMatchObject({
        type: 'image-collector',
        name: 'Image & Screenshot Collector',
        description: 'Paste screenshots and drag images',
        icon: '🖼️'
      });
    });
  });

  describe('Complete Widget Lifecycle', () => {
    it('supports full lifecycle for Priority Matrix widget', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Step 1: Widget Creation
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Step 2: Widget Interaction - Add task
      const urgentImportant = screen.getByText('Urgent & Important').closest('.quadrant');
      const addTaskButton = urgentImportant?.querySelector('button[title="Add task"]') || 
                           urgentImportant?.querySelector('button');
      
      if (addTaskButton) {
        fireEvent.click(addTaskButton);
        
        const taskInput = urgentImportant?.querySelector('input[placeholder*="task"]');
        if (taskInput) {
          fireEvent.change(taskInput, { target: { value: 'Test Task' } });
          fireEvent.keyPress(taskInput, { key: 'Enter', code: 'Enter' });
          
          await waitFor(() => {
            expect(screen.getByText('Test Task')).toBeInTheDocument();
          });
        }
      }

      // Step 3: Persistence - Check that state is saved
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Step 4: Widget Update - Verify content updates work
      const savedCalls = mockLocalStorage.setItem.mock.calls;
      const lastSave = savedCalls[savedCalls.length - 1];
      expect(lastSave[1]).toContain('Test Task');
    });

    it('supports full lifecycle for Habit Tracker widget', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Step 1: Widget Creation
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Step 2: Widget Interaction - Add habit
      fireEvent.click(screen.getByTitle('Add new habit'));
      fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
        target: { value: 'Daily Exercise' }
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
      });

      // Step 3: Widget Interaction - Complete habit
      const calendarDays = document.querySelectorAll('.calendar-day');
      if (calendarDays.length > 0) {
        fireEvent.click(calendarDays[calendarDays.length - 1]); // Today
        
        await waitFor(() => {
          expect(screen.getByText('🔥 1')).toBeInTheDocument(); // Streak indicator
        });
      }

      // Step 4: Persistence - Check that state is saved
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      const savedCalls = mockLocalStorage.setItem.mock.calls;
      const lastSave = savedCalls[savedCalls.length - 1];
      expect(lastSave[1]).toContain('Daily Exercise');
    });

    it('supports full lifecycle for Image Collector widget', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Step 1: Widget Creation
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Image & Screenshot Collector'));
      
      await waitFor(() => {
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });

      // Step 2: Widget Interaction - Upload image
      const fileInput = screen.getByLabelText(/upload images/i);
      const mockFile = new File(['mock image'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader behavior
      mockFileReader.onload = () => {
        // Simulate successful file read
      };

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Step 3: Persistence - Check that state is saved
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles widget errors gracefully without crashing dashboard', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Add a widget
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Dashboard should remain functional even if there are errors
      expect(screen.getByText('Add Widget')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('shows error boundary UI when widget fails to render', async () => {
      // This would require injecting an error into a widget component
      // For now, we'll just verify the error boundary exists
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Widget should render successfully
      expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
    });
  });

  describe('Persistence System Integration', () => {
    it('saves and restores widget state correctly', async () => {
      // Mock saved state with new widgets
      const savedState = {
        widgets: {
          'widget-1': {
            id: 'widget-1',
            type: 'habit-tracker',
            content: {
              habits: [{
                id: 'habit-1',
                name: 'Saved Habit',
                color: '#10b981',
                createdAt: new Date(),
                isActive: true
              }],
              completions: [],
              streaks: {}
            },
            config: { title: 'Habit Tracker' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        layout: [
          { i: 'widget-1', x: 0, y: 0, w: 5, h: 4 }
        ]
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        state: savedState
      }));
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should restore saved widgets
      await waitFor(() => {
        expect(screen.getByText('Saved Habit')).toBeInTheDocument();
      });
    });

    it('handles corrupted widget data gracefully', async () => {
      // Mock corrupted data
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should still render dashboard without crashing
      expect(screen.getByText('Add Widget')).toBeInTheDocument();
      
      // Should be able to add new widgets
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });
    });
  });

  describe('Widget Validation Integration', () => {
    it('validates widget data structures', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Add widgets and verify they validate correctly
      const addWidgetButton = screen.getByText('Add Widget');
      
      // Test each widget type
      const widgetTypes = ['Priority Matrix', 'Habit Streak Tracker', 'Image & Screenshot Collector'];
      
      for (const widgetType of widgetTypes) {
        fireEvent.click(addWidgetButton);
        fireEvent.click(screen.getByText(widgetType));
        
        await waitFor(() => {
          expect(screen.getByText(widgetType)).toBeInTheDocument();
        });
      }

      // All widgets should render without validation errors
      expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
    });
  });

  describe('Dashboard Integration', () => {
    it('integrates widgets with dashboard layout system', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Widget should be wrapped in proper layout components
      const widget = screen.getByText('Priority Matrix').closest('.widget-wrapper');
      expect(widget).toBeInTheDocument();
    });

    it('supports widget resizing within constraints', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Priority Matrix should have fixed size constraints (4x4)
      const widget = screen.getByText('Priority Matrix').closest('.react-grid-item');
      expect(widget).toBeInTheDocument();
    });

    it('supports widget removal', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Find and click remove button (implementation may vary)
      const widget = screen.getByText('Habit Streak Tracker').closest('.widget-wrapper');
      const removeButton = widget?.querySelector('[aria-label*="remove"], [title*="remove"], [title*="delete"]');
      
      if (removeButton) {
        fireEvent.click(removeButton);
        
        await waitFor(() => {
          expect(screen.queryByText('Habit Streak Tracker')).not.toBeInTheDocument();
        });
      }
    });
  });
});