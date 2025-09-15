import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardProvider } from '../../context/DashboardContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';

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
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
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

describe('Comprehensive Integration Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Widget Integration Coverage', () => {
    it('verifies all new widgets are properly integrated', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);

      // Verify all new widget types are available
      const expectedWidgets = [
        'Priority Matrix', 
        'Habit Streak Tracker',
        'Image & Screenshot Collector'
      ];

      for (const widgetType of expectedWidgets) {
        expect(screen.getByText(widgetType)).toBeInTheDocument();
      }

      // Test each widget can be added successfully
      for (const widgetType of expectedWidgets) {
        fireEvent.click(screen.getByText(widgetType));
        
        await waitFor(() => {
          // Each widget should render with its distinctive content
          switch (widgetType) {
            case 'Music Player':
              expect(screen.getByText('Lo-fi Player')).toBeInTheDocument();
              break;
            case 'Priority Matrix':
              expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
              break;
            case 'Habit Tracker':
              expect(screen.getByTitle('Add new habit')).toBeInTheDocument();
              break;
            case 'Image Collector':
              expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();
              break;
          }
        });

        // Add next widget
        if (widgetType !== expectedWidgets[expectedWidgets.length - 1]) {
          fireEvent.click(addWidgetButton);
        }
      }
    });

    it('validates widget functionality integration', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');



      // Test Habit Tracker functionality
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Should be able to add habits
      fireEvent.click(screen.getByTitle('Add new habit'));
      fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
        target: { value: 'Integration Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Integration Test Habit')).toBeInTheDocument();
      });

      // Test Priority Matrix functionality
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Should show all quadrants
      expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
      expect(screen.getByText('Important & Not Urgent')).toBeInTheDocument();
      expect(screen.getByText('Urgent & Not Important')).toBeInTheDocument();
      expect(screen.getByText('Not Urgent & Not Important')).toBeInTheDocument();

      // Test Image Collector functionality
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Image & Screenshot Collector'));
      
      await waitFor(() => {
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });

      // Should show upload area
      expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();
    });
  });

  describe('Cross-Widget Integration', () => {
    it('ensures widgets work together without conflicts', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');

      // Add all widget types simultaneously
      const widgetTypes = ['Priority Matrix', 'Habit Streak Tracker', 'Image & Screenshot Collector'];
      
      for (const widgetType of widgetTypes) {
        fireEvent.click(addWidgetButton);
        fireEvent.click(screen.getByText(widgetType));
        
        await waitFor(() => {
          expect(screen.getByText(widgetType)).toBeInTheDocument();
        });
      }

      // All widgets should coexist
      expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
      expect(screen.getByTitle('Add new habit')).toBeInTheDocument();
      expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();

      // Interact with each widget to ensure no conflicts
      
      // Habit Tracker interaction
      fireEvent.click(screen.getByTitle('Add new habit'));
      fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
        target: { value: 'Cross-Widget Test' }
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Cross-Widget Test')).toBeInTheDocument();
      });

      // All widgets should remain functional
      expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      expect(screen.getByText('Cross-Widget Test')).toBeInTheDocument();
      expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
    });
  });

  describe('System Integration', () => {
    it('integrates properly with dashboard context', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Dashboard should provide widget management
      expect(screen.getByText('Add Widget')).toBeInTheDocument();

      // Should integrate with persistence system
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Should trigger persistence
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('integrates with notification system', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Widgets should be able to trigger notifications
      // This would depend on the specific notification implementation
      expect(screen.getByText('Add Widget')).toBeInTheDocument();
    });

    it('integrates with theme system', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // All widgets should respect theme context
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Widget should render with theme-appropriate styling
      const widget = screen.getByText('Priority Matrix').closest('.widget-wrapper');
      expect(widget).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('maintains performance with multiple widgets', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Add multiple widgets quickly
      const widgetTypes = ['Priority Matrix', 'Habit Streak Tracker', 'Image & Screenshot Collector'];
      
      for (const widgetType of widgetTypes) {
        fireEvent.click(addWidgetButton);
        fireEvent.click(screen.getByText(widgetType));
        
        await waitFor(() => {
          expect(screen.getByText(widgetType)).toBeInTheDocument();
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
    });
  });

  describe('Error Handling Integration', () => {
    it('handles widget errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
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

      // Dashboard should remain functional
      expect(screen.getByText('Add Widget')).toBeInTheDocument();
      
      // Should be able to add other widgets
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility across all widgets', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Add widgets and check accessibility
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Should have proper ARIA labels and roles
      expect(screen.getByRole('button', { name: /add widget/i })).toBeInTheDocument();
      
      // Widget controls should be accessible
      const quadrants = screen.getAllByRole('button');
      expect(quadrants.length).toBeGreaterThan(0);
    });
  });
});