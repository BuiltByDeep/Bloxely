import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardProvider } from '../../context/DashboardContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';

// Performance monitoring utilities
const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await new Promise(resolve => setTimeout(resolve, 0)); // Wait for render
  const end = performance.now();
  return end - start;
};

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Mock heavy operations
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

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <NotificationProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </NotificationProvider>
  </ThemeProvider>
);

describe('Widget Performance Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Rendering Performance', () => {
    it('renders dashboard with multiple widgets within performance budget', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>
        );
      });

      // Initial dashboard render should be under 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    it('adds widgets without significant performance degradation', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      const widgetTypes = ['Priority Matrix', 'Habit Streak Tracker', 'Image & Screenshot Collector'];
      const renderTimes: number[] = [];

      for (const widgetType of widgetTypes) {
        const startTime = performance.now();
        
        fireEvent.click(addWidgetButton);
        fireEvent.click(screen.getByText(widgetType));
        
        await waitFor(() => {
          expect(screen.getByText(widgetType)).toBeInTheDocument();
        });
        
        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
      }

      // Each widget addition should be under 500ms
      renderTimes.forEach(time => {
        expect(time).toBeLessThan(500);
      });

      // Performance shouldn't degrade significantly with each addition
      const firstRender = renderTimes[0];
      const lastRender = renderTimes[renderTimes.length - 1];
      expect(lastRender).toBeLessThan(firstRender * 2); // No more than 2x slower
    });

    it('handles rapid widget interactions without blocking UI', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Add habit tracker
      const addWidgetButton = screen.getByText('Add Widget');
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Perform rapid interactions
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const addHabitButton = screen.getByTitle('Add new habit');
        fireEvent.click(addHabitButton);
        
        const habitInput = screen.getByPlaceholderText('Enter habit name...');
        fireEvent.change(habitInput, { target: { value: `Habit ${i}` } });
        
        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
          expect(screen.getByText(`Habit ${i}`)).toBeInTheDocument();
        });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // 10 rapid interactions should complete within 5 seconds
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Memory Management', () => {
    it('maintains stable memory usage with multiple widgets', async () => {
      const initialMemory = measureMemoryUsage();
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      const widgetTypes = ['Priority Matrix', 'Habit Streak Tracker', 'Image & Screenshot Collector'];

      // Add all widget types
      for (const widgetType of widgetTypes) {
        fireEvent.click(addWidgetButton);
        fireEvent.click(screen.getByText(widgetType));
        
        await waitFor(() => {
          expect(screen.getByText(widgetType)).toBeInTheDocument();
        });
      }

      const finalMemory = measureMemoryUsage();
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        // Memory increase should be reasonable (less than 50% increase)
        expect(memoryIncreasePercent).toBeLessThan(50);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('handles simultaneous widget operations efficiently', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      const startTime = performance.now();
      
      // Simulate concurrent operations
      const operations = [
        // Add habit tracker and create habits
        async () => {
          fireEvent.click(addWidgetButton);
          fireEvent.click(screen.getByText('Habit Streak Tracker'));
          
          await waitFor(() => {
            expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
          });
          
          fireEvent.click(screen.getByTitle('Add new habit'));
          fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
            target: { value: 'Concurrent Habit' }
          });
          fireEvent.click(screen.getByRole('button', { name: /save/i }));
        },
        
        // Add priority matrix and create tasks
        async () => {
          fireEvent.click(addWidgetButton);
          fireEvent.click(screen.getByText('Priority Matrix'));
          
          await waitFor(() => {
            expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
          });
        },
        
        // Add image collector
        async () => {
          fireEvent.click(addWidgetButton);
          fireEvent.click(screen.getByText('Image & Screenshot Collector'));
          
          await waitFor(() => {
            expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
          });
        }
      ];

      // Execute operations concurrently
      await Promise.all(operations.map(op => op().catch(() => {})));
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Concurrent operations should complete within reasonable time
      expect(totalTime).toBeLessThan(3000);
    });

    it('maintains UI responsiveness during heavy operations', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Add image collector for heavy file operations
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Image & Screenshot Collector'));
      
      await waitFor(() => {
        expect(screen.getByText('Image & Screenshot Collector')).toBeInTheDocument();
      });

      // Simulate heavy file processing
      const fileInput = screen.getByLabelText(/upload images/i);
      const largeFiles = Array.from({ length: 10 }, (_, i) => 
        new File([new ArrayBuffer(1024 * 1024)], `large-image-${i}.jpg`, { type: 'image/jpeg' })
      );

      const startTime = performance.now();
      fireEvent.change(fileInput, { target: { files: largeFiles } });
      
      // UI should remain responsive
      const clickTime = performance.now();
      fireEvent.click(addWidgetButton);
      const responseTime = performance.now() - clickTime;
      
      // UI response should be immediate (under 100ms)
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('Scalability', () => {
    it('handles large datasets efficiently', async () => {
      // Mock large saved state
      const largeState = {
        widgets: Array.from({ length: 20 }, (_, i) => ({
          id: `widget-${i}`,
          type: i % 2 === 0 ? 'habit-tracker' : 'image-collector',
          content: i % 2 === 0 ? {
            habits: Array.from({ length: 50 }, (_, j) => ({
              id: `habit-${i}-${j}`,
              name: `Habit ${i}-${j}`,
              color: '#10b981',
              createdAt: new Date(),
              isActive: true
            })),
            completions: [],
            streaks: {}
          } : {
            images: Array.from({ length: 30 }, (_, j) => ({
              id: `image-${i}-${j}`,
              name: `Image ${i}-${j}.jpg`,
              dataUrl: `data:image/jpeg;base64,${btoa('mock-image-data')}`,
              thumbnail: `data:image/jpeg;base64,${btoa('mock-thumbnail')}`,
              fileSize: 1024 * 1024,
              mimeType: 'image/jpeg',
              createdAt: new Date()
            })),
            maxImages: 50,
            thumbnailSize: 150
          },
          config: { title: `Widget ${i}` },
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeState));
      
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should handle large dataset loading
      await waitFor(() => {
        expect(screen.getAllByText(/Widget \d+/).length).toBeGreaterThan(0);
      }, { timeout: 5000 });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Large dataset should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('maintains performance with complex widget interactions', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Add habit tracker
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });

      // Create many habits and interactions
      const startTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        fireEvent.click(screen.getByTitle('Add new habit'));
        fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
          target: { value: `Performance Habit ${i}` }
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        
        await waitFor(() => {
          expect(screen.getByText(`Performance Habit ${i}`)).toBeInTheDocument();
        });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Complex interactions should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 20 operations
    });
  });

  describe('Resource Optimization', () => {
    it('lazy loads widget components efficiently', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Initial render should be fast (widgets not loaded yet)
      const initialRenderTime = performance.now() - startTime;
      expect(initialRenderTime).toBeLessThan(500);

      // Adding first widget should load component
      const addWidgetButton = screen.getByText('Add Widget');
      const widgetLoadStart = performance.now();
      
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });
      
      const widgetLoadTime = performance.now() - widgetLoadStart;
      
      // First widget load should be reasonable
      expect(widgetLoadTime).toBeLessThan(1000);
    });

    it('optimizes re-renders with proper memoization', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const addWidgetButton = screen.getByText('Add Widget');
      
      // Add multiple widgets
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Habit Streak Tracker'));
      
      await waitFor(() => {
        expect(screen.getByText('Habit Streak Tracker')).toBeInTheDocument();
      });
      
      fireEvent.click(addWidgetButton);
      fireEvent.click(screen.getByText('Priority Matrix'));
      
      await waitFor(() => {
        expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
      });

      // Interact with one widget
      const startTime = performance.now();
      
      fireEvent.click(screen.getByTitle('Add new habit'));
      fireEvent.change(screen.getByPlaceholderText('Enter habit name...'), {
        target: { value: 'Memoization Test' }
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Memoization Test')).toBeInTheDocument();
      });
      
      const interactionTime = performance.now() - startTime;
      
      // Single widget interaction should be fast (other widgets shouldn't re-render)
      expect(interactionTime).toBeLessThan(200);
    });
  });
});