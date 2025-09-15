import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardProvider } from '../../context/DashboardContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';

// Mock all external dependencies
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

describe('End-to-End Productivity Workflows', () => {
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

  describe('Daily Productivity Setup Workflow', () => {
    it('completes full morning routine setup', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');

      // Step 1: Set up habit tracking for morning routine
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
      });

      // Add morning habits
      const morningHabits = ['Morning Meditation', 'Exercise', 'Healthy Breakfast', 'Review Goals'];
      
      for (const habit of morningHabits) {
        fireEvent.click(screen.getByTitle('Add new habit'));
        fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
          target: { value: habit }
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        
        await waitFor(() => {
          expect(screen.getByText(habit)).toBeInTheDocument();
        });
      }

      // Step 2: Set up priority matrix for daily tasks
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Add tasks to different quadrants
      const tasks = [
        { quadrant: 'Urgent & Important', task: 'Client presentation prep' },
        { quadrant: 'Important & Not Urgent', task: 'Strategic planning session' },
        { quadrant: 'Urgent & Not Important', task: 'Team meeting attendance' },
        { quadrant: 'Not Urgent & Not Important', task: 'Social media check' }
      ];

      for (const { quadrant, task } of tasks) {
        const quadrantElement = screen.getByText(quadrant).closest('.quadrant');
        const addTaskButton = within(quadrantElement!).getByRole('button', { name: /\+/ });
        fireEvent.click(addTaskButton);
        
        const taskInput = within(quadrantElement!).getByPlaceholderText('Enter task...');
        fireEvent.change(taskInput, { target: { value: task } });
        fireEvent.keyPress(taskInput, { key: 'Enter', code: 'Enter' });
        
        await waitFor(() => {
          expect(screen.getByText(task)).toBeInTheDocument();
        });
      }

      // Step 3: Set up inspiration board
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Image & Screenshot Collector'));
      
      await waitFor(() => {
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });

      // Verify complete setup
      expect(screen.getByText('Morning Meditation')).toBeInTheDocument();
      expect(screen.getByText('Client presentation prep')).toBeInTheDocument();
      expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();
    });

    it('supports habit completion and progress tracking workflow', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Set up habit tracker with pre-existing habits
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Add a habit
      fireEvent.click(screen.getByTitle('Add new habit'));
      fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
        target: { value: 'Daily Reading' }
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Daily Reading')).toBeInTheDocument();
      });

      // Complete habit for today (should show calendar)
      const calendarDays = document.querySelectorAll('.calendar-day');
      expect(calendarDays.length).toBe(90); // 90-day calendar

      // Click on today (last day in calendar)
      const todayCell = calendarDays[calendarDays.length - 1];
      fireEvent.click(todayCell);

      // Verify completion (cell should have completed class or style)
      await waitFor(() => {
        expect(todayCell).toHaveClass('completed');
      });

      // Check streak counter updates
      expect(screen.getByText('🔥 1')).toBeInTheDocument();
      
      // Check completion percentage
      expect(screen.getByText('1%')).toBeInTheDocument(); // 1 out of 90 days
    });
  });

  describe('Data Persistence Workflow', () => {
    it('saves and restores complete workspace state', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Create a complete workspace with all widget types
      const workspaceSetup = [
        { type: 'Habit Streak Tracker', data: { habits: ['Morning Run', 'Read 30min'] } },
        { type: 'Priority Matrix', data: { tasks: ['Important Task', 'Urgent Task'] } },
        { type: 'Image & Screenshot Collector', data: { images: [] } }
      ];

      for (const widget of workspaceSetup) {
        fireEvent.click(addWidgetButton);
        fireEvent.click(screen.getByText(widget.type));
        
        await waitFor(() => {
          expect(screen.getByText(widget.type)).toBeInTheDocument();
        });

        // Add specific data based on widget type
        if (widget.type === 'Habit Streak Tracker') {
          for (const habit of widget.data.habits) {
            fireEvent.click(screen.getByTitle('Add new habit'));
            fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
              target: { value: habit }
            });
            fireEvent.click(screen.getByRole('button', { name: /save/i }));
            
            await waitFor(() => {
              expect(screen.getByText(habit)).toBeInTheDocument();
            });
          }
        }
      }

      // Verify localStorage was called to save state
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Simulate page reload by re-rendering with saved state
      const savedCalls = mockLocalStorage.setItem.mock.calls;
      const lastSave = savedCalls[savedCalls.length - 1];
      mockLocalStorage.getItem.mockReturnValue(lastSave[1]);

      // Re-render app
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Verify all data is restored
      await waitFor(() => {
        expect(screen.getByText('Morning Run')).toBeInTheDocument();
        expect(screen.getByText('Read 30min')).toBeInTheDocument();
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });
    });
  });
});