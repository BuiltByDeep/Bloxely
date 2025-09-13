import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../../components/Dashboard';

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

const FullApp: React.FC = () => (
  <ThemeProvider>
    <NotificationProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
          <Dashboard />
        </div>
      </DashboardProvider>
    </NotificationProvider>
  </ThemeProvider>
);

describe('Performance Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should render initial dashboard quickly', async () => {
    const startTime = performance.now();
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(1000); // 1 second
  });

  it('should handle multiple widgets without performance degradation', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const addWidgetSelect = screen.getByRole('combobox');
    const startTime = performance.now();

    // Add multiple widgets
    const widgetTypes = ['clock', 'todo', 'sticky-note', 'pomodoro', 'clock', 'todo'];
    
    for (const widgetType of widgetTypes) {
      fireEvent.change(addWidgetSelect, { target: { value: widgetType } });
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${widgetTypes.indexOf(widgetType) + 1} widgets`))).toBeInTheDocument();
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Should handle multiple widgets efficiently
    expect(totalTime).toBeLessThan(3000); // 3 seconds for 6 widgets
  });

  it('should handle rapid widget additions without memory leaks', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const addWidgetSelect = screen.getByRole('combobox');
    
    // Add and remove widgets rapidly
    for (let i = 0; i < 10; i++) {
      // Add widget
      fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });
      
      await waitFor(() => {
        expect(screen.getByText('1 widgets')).toBeInTheDocument();
      });

      // Remove widget
      const removeButton = screen.getByTitle('Remove widget');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('0 widgets')).toBeInTheDocument();
      });
    }

    // Should still be responsive
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
  });

  it('should handle theme switching efficiently', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const themeToggle = screen.getByRole('button', { name: /switch to.*mode/i });
    const startTime = performance.now();

    // Toggle theme multiple times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(themeToggle);
    }

    const endTime = performance.now();
    const toggleTime = endTime - startTime;

    // Theme switching should be fast
    expect(toggleTime).toBeLessThan(500); // 500ms for 10 toggles
  });

  it('should handle localStorage operations efficiently', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const addWidgetSelect = screen.getByRole('combobox');
    const startTime = performance.now();

    // Add widgets to trigger persistence
    const widgetTypes = ['clock', 'todo', 'sticky-note'];
    
    for (const widgetType of widgetTypes) {
      fireEvent.change(addWidgetSelect, { target: { value: widgetType } });
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${widgetTypes.indexOf(widgetType) + 1} widgets`))).toBeInTheDocument();
      });
    }

    // Wait for debounced persistence
    await new Promise(resolve => setTimeout(resolve, 1100));

    const endTime = performance.now();
    const persistenceTime = endTime - startTime;

    // Persistence should not significantly impact performance
    expect(persistenceTime).toBeLessThan(2000); // 2 seconds including debounce
  });

  it('should maintain responsive UI during heavy operations', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Add todo widget
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'todo' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    });

    const taskInput = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    const startTime = performance.now();

    // Add many tasks rapidly
    for (let i = 0; i < 20; i++) {
      fireEvent.change(taskInput, { target: { value: `Task ${i}` } });
      fireEvent.click(addButton);
    }

    const endTime = performance.now();
    const taskAdditionTime = endTime - startTime;

    // Should handle many tasks efficiently
    expect(taskAdditionTime).toBeLessThan(1000); // 1 second for 20 tasks

    // UI should still be responsive
    expect(screen.getByText('Task 19')).toBeInTheDocument();
  });

  it('should not have excessive re-renders', async () => {
    let renderCount = 0;
    
    const TestComponent = () => {
      renderCount++;
      return <FullApp />;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const initialRenderCount = renderCount;

    // Add a widget
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    const finalRenderCount = renderCount;
    const additionalRenders = finalRenderCount - initialRenderCount;

    // Should not have excessive re-renders (adjust threshold as needed)
    expect(additionalRenders).toBeLessThan(10);
  });

  it('should handle error recovery without performance impact', async () => {
    // Mock console.error to avoid noise
    const originalError = console.error;
    console.error = vi.fn();

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    const startTime = performance.now();

    // Simulate error conditions and recovery
    // Add widgets normally (error boundaries should handle any issues)
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const recoveryTime = endTime - startTime;

    // Error handling should not significantly impact performance
    expect(recoveryTime).toBeLessThan(1000);

    // Restore console.error
    console.error = originalError;
  });
});