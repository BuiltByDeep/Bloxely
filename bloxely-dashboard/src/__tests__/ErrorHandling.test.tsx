import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

import ImageCollectorWidget from '../components/widgets/ImageCollectorWidget';

import ImageCollectorErrorBoundary from '../components/widgets/ImageCollectorErrorBoundary';
import type { WidgetData } from '../types/dashboard';

// Mock console.error to avoid test noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock FileReader for image tests
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mockImageData',
  onload: null as any,
  onerror: null as any,
};
global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  
  describe('Habit Tracker Error Handling', () => {
    const mockWidget: WidgetData = {
      id: 'test-habit-tracker',
      type: 'habit-tracker',
      content: {
        habits: [],
        completions: [],
        streaks: {}
      },
      config: { title: 'Habit Tracker' },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('renders error boundary when widget throws error', () => {
      const ThrowingComponent = () => {
        throw new Error('Habit tracker error');
      };

      render(
        <HabitTrackerErrorBoundary widget={mockWidget}>
          <ThrowingComponent />
        </HabitTrackerErrorBoundary>
      );

      expect(screen.getByText('Habit Tracker Error')).toBeInTheDocument();
      expect(screen.getByText(/streak data is safe/)).toBeInTheDocument();
    });

    it('handles corrupted habit data gracefully', () => {
      const corruptedWidget: WidgetData = {
        ...mockWidget,
        content: {
          habits: [
            // Missing required fields
            { id: 'habit-1' } as any,
            // Invalid date
            { id: 'habit-2', name: 'Test', createdAt: 'invalid-date' } as any
          ],
          completions: ['invalid-completion'] as any,
          streaks: { 'invalid-habit': 'not-a-number' } as any
        }
      };

      const mockOnUpdate = vi.fn();
      
      render(
        <HabitTrackerErrorBoundary widget={corruptedWidget}>
          <HabitTrackerWidget 
            widget={corruptedWidget} 
            onUpdate={mockOnUpdate} 
            onConfigUpdate={vi.fn()} 
          />
        </HabitTrackerErrorBoundary>
      );

      // Widget should render without crashing
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
    });

    it('handles date calculation errors', () => {
      const mockOnUpdate = vi.fn();
      
      // Mock Date constructor to throw error
      const originalDate = global.Date;
      global.Date = vi.fn(() => {
        throw new Error('Date error');
      }) as any;

      render(
        <HabitTrackerErrorBoundary widget={mockWidget}>
          <HabitTrackerWidget 
            widget={mockWidget} 
            onUpdate={mockOnUpdate} 
            onConfigUpdate={vi.fn()} 
          />
        </HabitTrackerErrorBoundary>
      );

      // Should show error boundary
      expect(screen.getByText('Habit Tracker Error')).toBeInTheDocument();

      // Restore Date
      global.Date = originalDate;
    });
  });

  describe('Image Collector Error Handling', () => {
    const mockWidget: WidgetData = {
      id: 'test-image-collector',
      type: 'image-collector',
      content: {
        images: [],
        maxImages: 20,
        thumbnailSize: 150
      },
      config: { title: 'Image Collector' },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('renders error boundary when widget throws error', () => {
      const ThrowingComponent = () => {
        throw new Error('Image collector error');
      };

      render(
        <ImageCollectorErrorBoundary widget={mockWidget}>
          <ThrowingComponent />
        </ImageCollectorErrorBoundary>
      );

      expect(screen.getByText('Image Collector Error')).toBeInTheDocument();
      expect(screen.getByText(/troubleshooting tips/i)).toBeInTheDocument();
      expect(screen.getByText(/Try uploading smaller image files/)).toBeInTheDocument();
    });

    it('handles file processing errors', async () => {
      const mockOnUpdate = vi.fn();
      
      // Mock FileReader to fail
      mockFileReader.onerror = vi.fn();
      mockFileReader.readAsDataURL.mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onerror) {
            mockFileReader.onerror(new Error('File read error') as any);
          }
        }, 0);
      });

      render(
        <ImageCollectorErrorBoundary widget={mockWidget}>
          <ImageCollectorWidget 
            widget={mockWidget} 
            onUpdate={mockOnUpdate} 
            onConfigUpdate={vi.fn()} 
          />
        </ImageCollectorErrorBoundary>
      );

      // Try to upload a file
      const fileInput = screen.getByLabelText(/upload images/i);
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByText('Image Collector')).toBeInTheDocument();
      });
    });

    it('shows error for oversized files', async () => {
      const mockOnUpdate = vi.fn();
      
      render(
        <ImageCollectorWidget 
          widget={mockWidget} 
          onUpdate={mockOnUpdate} 
          onConfigUpdate={vi.fn()} 
        />
      );

      // Try to upload a large file (>10MB)
      const fileInput = screen.getByLabelText(/upload images/i);
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/File size too large/)).toBeInTheDocument();
      });
    });

    it('shows error for invalid file types', async () => {
      const mockOnUpdate = vi.fn();
      
      render(
        <ImageCollectorWidget 
          widget={mockWidget} 
          onUpdate={mockOnUpdate} 
          onConfigUpdate={vi.fn()} 
        />
      );

      // Try to upload a non-image file
      const fileInput = screen.getByLabelText(/upload images/i);
      const textFile = new File(['test content'], 'test.txt', { 
        type: 'text/plain' 
      });
      
      fireEvent.change(fileInput, { target: { files: [textFile] } });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
      });
    });

    it('handles FileReader API unavailability', () => {
      // Mock FileReader as undefined (unsupported browser)
      const originalFileReader = global.FileReader;
      (global as any).FileReader = undefined;

      const mockOnUpdate = vi.fn();
      
      render(
        <ImageCollectorErrorBoundary widget={mockWidget}>
          <ImageCollectorWidget 
            widget={mockWidget} 
            onUpdate={mockOnUpdate} 
            onConfigUpdate={vi.fn()} 
          />
        </ImageCollectorErrorBoundary>
      );

      // Widget should still render
      expect(screen.getByText('Image Collector')).toBeInTheDocument();

      // Restore FileReader
      global.FileReader = originalFileReader;
    });
  });

  describe('Recovery Mechanisms', () => {
    it('allows error dismissal in widgets', async () => {
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

      // Trigger an error
      const fileInput = screen.getByLabelText(/upload images/i);
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
      });

      // Dismiss the error
      fireEvent.click(screen.getByText('Dismiss'));

      // Error should be gone
      await waitFor(() => {
        expect(screen.queryByText(/Invalid file type/)).not.toBeInTheDocument();
      });
    });

    it('provides helpful error messages with context', () => {
      const ThrowingComponent = () => {
        throw new Error('Network error: Failed to fetch');
      };

      const mockWidget: WidgetData = {
        id: 'test-widget',
        type: 'habit-tracker',
        content: { habits: [], completions: [], streaks: {} },
        config: { title: 'Test Widget' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      render(
        <HabitTrackerErrorBoundary widget={mockWidget}>
          <ThrowingComponent />
        </HabitTrackerErrorBoundary>
      );

      expect(screen.getByText('Habit Tracker Error')).toBeInTheDocument();
      expect(screen.getByText(/Your data is safe/)).toBeInTheDocument();
      expect(screen.getByText(/try to recover/)).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility Fallbacks', () => {
    it('handles missing localStorage gracefully', () => {
      // Mock localStorage as undefined
      const originalLocalStorage = global.localStorage;
      (global as any).localStorage = undefined;

      const mockWidget: WidgetData = {
        id: 'test-widget',
        type: 'habit-tracker',
        content: { habits: [], completions: [], streaks: {} },
        config: { title: 'Test Widget' },
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

      // Widget should still render
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument();

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });

    it('handles missing modern JavaScript features', () => {
      // Mock missing Array.from
      const originalArrayFrom = Array.from;
      (Array as any).from = undefined;

      const mockWidget: WidgetData = {
        id: 'test-widget',
        type: 'habit-tracker',
        content: { habits: [], completions: [], streaks: {} },
        config: { title: 'Test Widget' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOnUpdate = vi.fn();

      render(
        <HabitTrackerErrorBoundary widget={mockWidget}>
          <HabitTrackerWidget
            widget={mockWidget}
            onUpdate={mockOnUpdate}
            onConfigUpdate={vi.fn()}
          />
        </HabitTrackerErrorBoundary>
      );

      // Widget should handle missing features gracefully
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument();

      // Restore Array.from
      Array.from = originalArrayFrom;
    });
  });
});