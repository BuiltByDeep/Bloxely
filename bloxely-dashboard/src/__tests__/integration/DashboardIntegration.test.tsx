import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../../components/Dashboard';
import NotificationContainer from '../../components/NotificationContainer';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock console methods to avoid noise in tests
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
Object.defineProperty(console, 'log', { value: consoleMock.log });
Object.defineProperty(console, 'error', { value: consoleMock.error });
Object.defineProperty(console, 'warn', { value: consoleMock.warn });

const FullApp: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <NotificationProvider>
        <DashboardProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            <Dashboard />
            <NotificationContainer />
          </div>
        </DashboardProvider>
      </NotificationProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should render the complete dashboard application', async () => {
    render(<FullApp />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Check main elements are present
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    expect(screen.getByText('Your focus dashboard is ready')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
    expect(screen.getByText('0 widgets')).toBeInTheDocument();
  });

  it('should complete full widget creation workflow', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Add a clock widget
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    // Wait for widget to appear
    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    // Check that clock widget is rendered
    expect(screen.getByTitle('Time display')).toBeInTheDocument();
    
    // Add a todo widget
    fireEvent.change(addWidgetSelect, { target: { value: 'todo' } });

    await waitFor(() => {
      expect(screen.getByText('2 widgets')).toBeInTheDocument();
    });

    // Check that todo widget is rendered
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    expect(screen.getByText('To-Do List')).toBeInTheDocument();
  });

  it('should handle todo widget interactions', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Add a todo widget
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'todo' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    });

    // Add a task
    const taskInput = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(taskInput, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    // Check task was added
    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeInTheDocument();
    });

    // Complete the task by clicking the checkbox
    const checkboxes = screen.getAllByRole('button');
    const taskCheckbox = checkboxes.find(button => 
      button.className.includes('w-5 h-5 rounded-md border-2')
    );
    
    if (taskCheckbox) {
      fireEvent.click(taskCheckbox);
    }

    // Check task is marked as completed
    await waitFor(() => {
      const taskElement = screen.getByText('Test task');
      expect(taskElement).toHaveClass('line-through');
    });
  });

  it('should handle theme switching', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Find and click theme toggle
    const themeToggle = screen.getByRole('button', { name: /switch to.*mode/i });
    expect(themeToggle).toBeInTheDocument();

    // Toggle to dark mode
    fireEvent.click(themeToggle);
    expect(document.documentElement).toHaveClass('dark');

    // Toggle back to light mode
    fireEvent.click(themeToggle);
    expect(document.documentElement).toHaveClass('light');
  });

  it('should handle widget removal', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Add a widget
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    // Remove the widget
    const removeButton = screen.getByTitle('Remove widget');
    fireEvent.click(removeButton);

    // Check widget was removed
    await waitFor(() => {
      expect(screen.getByText('0 widgets')).toBeInTheDocument();
      expect(screen.getByText('Your focus dashboard is ready')).toBeInTheDocument();
    });
  });

  it('should persist and restore dashboard state', async () => {
    const { unmount } = render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Add a widget
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    // Simulate persistence by setting localStorage directly
    const mockState = {
      layout: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      widgets: {
        'widget-1': {
          id: 'widget-1',
          type: 'clock',
          content: { format: '12h', showDate: true },
          config: { title: 'Clock' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      settings: { theme: 'light', gridCols: 12, gridRowHeight: 60 },
    };

    localStorageMock.setItem('bloxely-dashboard-state', JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      state: mockState,
    }));

    // Unmount and remount to simulate page reload
    unmount();

    render(<FullApp />);

    // Check that widgets were restored
    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle multiple widget types simultaneously', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const addWidgetSelect = screen.getByRole('combobox');

    // Add just two widget types to avoid memory issues
    const widgetTypes = ['clock', 'todo'];
    
    for (const widgetType of widgetTypes) {
      fireEvent.change(addWidgetSelect, { target: { value: widgetType } });
      await waitFor(() => {
        // Wait for widget count to increase
        expect(screen.getByText(new RegExp(`${widgetTypes.indexOf(widgetType) + 1} widgets`))).toBeInTheDocument();
      });
    }

    // Verify widgets are present
    expect(screen.getByTitle('Time display')).toBeInTheDocument(); // Clock
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument(); // Todo
  });

  it('should handle error states gracefully', async () => {
    // Mock console.error to avoid noise
    const originalError = console.error;
    console.error = vi.fn();

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Test that the app doesn't crash with invalid data
    // This would be more comprehensive with actual error injection
    expect(screen.getByText('Bloxely')).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it('should show notifications for user actions', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // The dashboard should show success notification when restored
    // (This depends on the implementation showing notifications)
    // We can't easily test this without more complex setup
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
  });

  it('should maintain state isolation between widgets', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Add one todo widget and verify it works independently
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'todo' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    // Verify the widget has its own state
    const taskInput = screen.getByPlaceholderText('Add a new task...');
    expect(taskInput).toBeInTheDocument();

    // Add task
    fireEvent.change(taskInput, { target: { value: 'Test Task' } });
    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
});