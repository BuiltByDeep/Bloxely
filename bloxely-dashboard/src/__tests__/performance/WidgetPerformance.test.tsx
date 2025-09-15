import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

import ImageCollectorWidget from '../../components/widgets/ImageCollectorWidget';
import type { WidgetData } from '../../types/dashboard';

// Performance monitoring utilities
const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await new Promise(resolve => setTimeout(resolve, 0));
  const end = performance.now();
  return end - start;
};

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Mock FileReader for image tests
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mockImageData',
  onload: null as any,
  onerror: null as any,
};
global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

describe('Widget Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  
  describe('Habit Tracker Performance', () => {
    const createLargeHabitSet = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `habit-${i}`,
        name: `Habit ${i} - Daily routine activity`,
        color: '#10b981',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        isActive: true
      }));
    };

    it('renders calendar efficiently with multiple habits', async () => {
      const largeHabits = createLargeHabitSet(20);
      const mockWidget: WidgetData = {
        id: 'test-habit-tracker',
        type: 'habit-tracker',
        content: {
          habits: largeHabits,
          completions: [],
          streaks: {}
        },
        config: { title: 'Habit Tracker' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const renderTime = await measureRenderTime(() => {
        render(
          <HabitTrackerWidget 
            widget={mockWidget} 
            onUpdate={vi.fn()} 
            onConfigUpdate={vi.fn()} 
          />
        );
      });

      // Should render calendar efficiently even with many habits
      expect(renderTime).toBeLessThan(1000); // 1 second
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
    });

    it('handles rapid habit completions efficiently', async () => {
      const mockWidget: WidgetData = {
        id: 'test-habit-tracker',
        type: 'habit-tracker',
        content: {
          habits: createLargeHabitSet(5),
          completions: [],
          streaks: {}
        },
        config: { title: 'Habit Tracker' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOnUpdate = vi.fn();
      
      render(
        <HabitTrackerWidget 
          widget={mockWidget} 
          onUpdate={mockOnUpdate} 
          onConfigUpdate={vi.fn()} 
        />
      );

      const startTime = performance.now();
      
      // Simulate rapid calendar interactions
      const calendarDays = document.querySelectorAll('.calendar-day');
      for (let i = 0; i < Math.min(30, calendarDays.length); i++) {
        fireEvent.click(calendarDays[i]);
      }

      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      // Should handle rapid interactions efficiently
      expect(interactionTime).toBeLessThan(1500); // 1.5 seconds for 30 clicks
    });

    it('optimizes streak calculations', async () => {
      // Create habits with many completions
      const habits = createLargeHabitSet(3);
      const completions = [];
      
      // Generate 90 days of completions for each habit
      for (const habit of habits) {
        for (let day = 0; day < 90; day++) {
          if (Math.random() > 0.3) { // 70% completion rate
            completions.push({
              habitId: habit.id,
              date: new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              completed: true
            });
          }
        }
      }

      const mockWidget: WidgetData = {
        id: 'test-habit-tracker',
        type: 'habit-tracker',
        content: {
          habits,
          completions,
          streaks: {}
        },
        config: { title: 'Habit Tracker' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const renderTime = await measureRenderTime(() => {
        render(
          <HabitTrackerWidget 
            widget={mockWidget} 
            onUpdate={vi.fn()} 
            onConfigUpdate={vi.fn()} 
          />
        );
      });

      // Should calculate streaks efficiently even with large datasets
      expect(renderTime).toBeLessThan(800); // 800ms
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
    });
  });

  describe('Image Collector Performance', () => {
    const createLargeImageSet = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `image-${i}`,
        name: `Image ${i}.jpg`,
        dataUrl: `data:image/jpeg;base64,${btoa('mock-image-data-' + i)}`,
        thumbnail: `data:image/jpeg;base64,${btoa('mock-thumbnail-' + i)}`,
        fileSize: Math.floor(Math.random() * 5000000), // Random size up to 5MB
        mimeType: 'image/jpeg',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }));
    };

    it('renders efficiently with many images', async () => {
      const largeImages = createLargeImageSet(50);
      const mockWidget: WidgetData = {
        id: 'test-image-collector',
        type: 'image-collector',
        content: {
          images: largeImages,
          maxImages: 100,
          thumbnailSize: 150
        },
        config: { title: 'Image Collector' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const renderTime = await measureRenderTime(() => {
        render(
          <ImageCollectorWidget 
            widget={mockWidget} 
            onUpdate={vi.fn()} 
            onConfigUpdate={vi.fn()} 
          />
        );
      });

      // Should render image grid efficiently
      expect(renderTime).toBeLessThan(1000); // 1 second
      expect(screen.getByText('Image Collector')).toBeInTheDocument();
    });

    it('handles file processing efficiently', async () => {
      const mockWidget: WidgetData = {
        id: 'test-image-collector',
        type: 'image-collector',
        content: { images: [], maxImages: 20, thumbnailSize: 150 },
        config: { title: 'Image Collector' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOnUpdate = vi.fn();
      
      render(
        <ImageCollectorWidget 
          widget={mockWidget} 
          onUpdate={mockOnUpdate} 
          onConfigUpdate={vi.fn()} 
        />
      );

      const startTime = performance.now();
      
      // Simulate multiple file uploads
      const fileInput = screen.getByLabelText(/upload images/i);
      const mockFiles = Array.from({ length: 5 }, (_, i) => 
        new File([`mock-content-${i}`], `test-${i}.jpg`, { type: 'image/jpeg' })
      );

      // Mock FileReader to resolve quickly
      mockFileReader.readAsDataURL.mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: { result: mockFileReader.result } } as any);
          }
        }, 10);
      });

      for (const file of mockFiles) {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should process files efficiently
      expect(processingTime).toBeLessThan(2000); // 2 seconds for 5 files
    });

    it('optimizes memory usage with large images', async () => {
      const initialMemory = measureMemoryUsage();
      
      const largeImages = createLargeImageSet(30);
      const mockWidget: WidgetData = {
        id: 'test-image-collector',
        type: 'image-collector',
        content: {
          images: largeImages,
          maxImages: 50,
          thumbnailSize: 150
        },
        config: { title: 'Image Collector' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOnUpdate = vi.fn();
      
      const { unmount } = render(
        <ImageCollectorWidget 
          widget={mockWidget} 
          onUpdate={mockOnUpdate} 
          onConfigUpdate={vi.fn()} 
        />
      );

      const afterRenderMemory = measureMemoryUsage();
      
      // Unmount to test cleanup
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const afterUnmountMemory = measureMemoryUsage();
      
      if (initialMemory > 0 && afterRenderMemory > 0 && afterUnmountMemory > 0) {
        const memoryIncrease = afterRenderMemory - initialMemory;
        const memoryAfterCleanup = afterUnmountMemory - initialMemory;
        
        // Memory should be cleaned up after unmount
        expect(memoryAfterCleanup).toBeLessThan(memoryIncrease * 1.2); // Allow 20% overhead
      }
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('handles missing IntersectionObserver gracefully', () => {
      // Mock missing IntersectionObserver
      const originalIntersectionObserver = global.IntersectionObserver;
      (global as any).IntersectionObserver = undefined;

      const mockWidget: WidgetData = {
        id: 'test-image-collector',
        type: 'image-collector',
        content: { images: [], maxImages: 20, thumbnailSize: 150 },
        config: { title: 'Image Collector' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        render(
          <ImageCollectorWidget 
            widget={mockWidget} 
            onUpdate={vi.fn()} 
            onConfigUpdate={vi.fn()} 
          />
        );
      }).not.toThrow();

      expect(screen.getByText('Image Collector')).toBeInTheDocument();

      // Restore IntersectionObserver
      global.IntersectionObserver = originalIntersectionObserver;
    });

    it('handles missing performance.memory gracefully', () => {
      const originalPerformance = global.performance;
      (global as any).performance = { now: () => Date.now() };

      const memoryUsage = measureMemoryUsage();
      expect(memoryUsage).toBe(0); // Should return 0 when memory API is unavailable

      // Restore performance
      global.performance = originalPerformance;
    });

    it('handles missing requestAnimationFrame gracefully', () => {
      const originalRAF = global.requestAnimationFrame;
      (global as any).requestAnimationFrame = undefined;

      const mockWidget: WidgetData = {
        id: 'test-image-collector',
        type: 'image-collector',
        content: { images: [], maxImages: 20, thumbnailSize: 150 },
        config: { title: 'Image Collector' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        render(
          <ImageCollectorWidget
            widget={mockWidget}
            onUpdate={vi.fn()}
            onConfigUpdate={vi.fn()}
          />
        );
      }).not.toThrow();

      expect(screen.getByText('Image Collector')).toBeInTheDocument();

      // Restore requestAnimationFrame
      global.requestAnimationFrame = originalRAF;
    });
  });

  describe('End-to-End Performance', () => {
    it('maintains performance across all widgets simultaneously', async () => {
      const widgets = [
        {
          id: 'habit-tracker-1',
          type: 'habit-tracker' as const,
          content: { habits: createLargeHabitSet(5), completions: [], streaks: {} },
          config: { title: 'Habit Tracker' },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'image-collector-1',
          type: 'image-collector' as const,
          content: { images: createLargeImageSet(10), maxImages: 20, thumbnailSize: 150 },
          config: { title: 'Image Collector' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const startTime = performance.now();
      
      const { container } = render(
        <div>
          <HabitTrackerWidget widget={widgets[0]} onUpdate={vi.fn()} onConfigUpdate={vi.fn()} />
          <ImageCollectorWidget widget={widgets[1]} onUpdate={vi.fn()} onConfigUpdate={vi.fn()} />
        </div>
      );

      const endTime = performance.now();
      const totalRenderTime = endTime - startTime;
      
      // All widgets should render together within reasonable time
      expect(totalRenderTime).toBeLessThan(2000); // 2 seconds
      
      // All widgets should be present
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
      expect(screen.getByText('Image Collector')).toBeInTheDocument();
      
      // DOM should not be excessively large
      const domNodes = container.querySelectorAll('*').length;
      expect(domNodes).toBeLessThan(1000); // Reasonable DOM size
    });
  });

  
  function createLargeHabitSet(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `habit-${i}`,
      name: `Habit ${i}`,
      color: '#10b981',
      createdAt: new Date(),
      isActive: true
    }));
  }

  function createLargeImageSet(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `image-${i}`,
      name: `Image ${i}.jpg`,
      dataUrl: `data:image/jpeg;base64,${btoa('mock-image-data')}`,
      thumbnail: `data:image/jpeg;base64,${btoa('mock-thumbnail')}`,
      fileSize: 1024 * 1024, // 1MB
      mimeType: 'image/jpeg',
      createdAt: new Date()
    }));
  }
});