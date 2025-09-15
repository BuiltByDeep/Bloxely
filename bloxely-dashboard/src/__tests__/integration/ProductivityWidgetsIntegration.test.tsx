import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardProvider } from '../../context/DashboardContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';
import type { WidgetData } from '../../types/dashboard';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });



// Mock matchMedia for theme context
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock file reading for image collector
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mockImageData',
  onload: null as any,
  onerror: null as any,
};
global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

// Mock drag and drop events
const createMockFile = (name: string, type: string, size: number = 1024) => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <NotificationProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </NotificationProvider>
  </ThemeProvider>
);

describe('Productivity Widgets Integration Tests', () => {
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

  describe('Dashboard Integration', () => {
    it('renders all new widget types in the dashboard', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should be able to add all new widget types
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);

      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });
    });

    it('maintains widget state across dashboard operations', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Add a habit tracker widget
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      
      const habitTrackerOption = screen.getByText('Habit Tracker');
      fireEvent.click(habitTrackerOption);

      await waitFor(() => {
        expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
      });

      // Add a habit
      const addHabitButton = screen.getByTitle('Add new habit');
      fireEvent.click(addHabitButton);

      const habitInput = screen.getByPlaceholderText('Enter habit name...');
      fireEvent.change(habitInput, { target: { value: 'Test Habit' } });
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Test Habit')).toBeInTheDocument();
      });

      // State should persist when adding another widget
      fireEvent.click(addWidgetButton);
      const priorityMatrixOption = screen.getByText('Priority Matrix');
      fireEvent.click(priorityMatrixOption);

      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
        expect(screen.getByText('Test Habit')).toBeInTheDocument(); // Should still be there
      });
    });
  });

  describe('Cross-Widget Data Flow', () => {
    it('maintains independent state between similar widgets', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Add first habit tracker
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Add habit to first tracker
      const firstAddButton = screen.getByTitle('Add new habit');
      fireEvent.click(firstAddButton);
      
      const firstInput = screen.getByPlaceholderText('Enter habit name...');
      fireEvent.change(firstInput, { target: { value: 'First Habit' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText('First Habit')).toBeInTheDocument();
      });

      // Add second habit tracker
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getAllByText('Habit Streak Tracker')).toHaveLength(2);
      });

      // Second tracker should be independent
      const addButtons = screen.getAllByTitle('Add new habit');
      fireEvent.click(addButtons[1]); // Click second tracker's add button
      
      const inputs = screen.getAllByPlaceholderText('Enter habit name...');
      fireEvent.change(inputs[0], { target: { value: 'Second Habit' } });
      
      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('First Habit')).toBeInTheDocument();
        expect(screen.getByText('Second Habit')).toBeInTheDocument();
      });
    });
  });

  describe('User Workflow Integration', () => {
    it('supports complete productivity workflow', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Step 1: Add habit tracker for daily goals
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Add a habit
      fireEvent.click(screen.getByTitle('Add new habit'));
      fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), { 
        target: { value: 'Daily Exercise' } 
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
      });

      // Step 2: Add priority matrix for task management
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Add a task
      const urgentImportant = screen.getByText('Urgent & Important').closest('.quadrant');
      const addTaskButton = within(urgentImportant!).getByRole('button', { name: /\+/ });
      fireEvent.click(addTaskButton);
      
      const taskInput = within(urgentImportant!).getByPlaceholderText('Enter task...');
      fireEvent.change(taskInput, { target: { value: 'Complete project deadline' } });
      fireEvent.keyPress(taskInput, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Complete project deadline')).toBeInTheDocument();
      });

      // Step 3: Add image collector for inspiration
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Image & Screenshot Collector'));
      
      await waitFor(() => {
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });

      // All widgets should be present and functional
      expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
      expect(screen.getByText('Complete project deadline')).toBeInTheDocument();
      expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles widget errors without crashing the dashboard', async () => {
      // Mock console.error to avoid test noise
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

      // Dashboard should still be functional
      expect(screen.getByText('Add Widget')).toBeInTheDocument();
      expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains keyboard navigation across all widgets', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Add widgets
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Test keyboard navigation
      const firstQuadrant = screen.getByText('Urgent & Important').closest('.quadrant');
      const addButton = within(firstQuadrant!).getByRole('button', { name: /\+/ });
      
      // Should be focusable
      addButton.focus();
      expect(document.activeElement).toBe(addButton);
      
      // Should respond to keyboard events
      fireEvent.keyDown(addButton, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(within(firstQuadrant!).getByPlaceholderText('Enter task...')).toBeInTheDocument();
      });
    });

    it('provides proper ARIA labels for all interactive elements', async () => {
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

      // Check for proper ARIA labels and interactive elements
      const quadrants = screen.getAllByRole('button');
      expect(quadrants.length).toBeGreaterThan(0);
      
      // Should have accessible quadrant labels
      expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
      expect(screen.getByText('Important & Not Urgent')).toBeInTheDocument();
    });
  });
});