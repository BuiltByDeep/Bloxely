import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedPersistence } from '../hooks/useDebouncedPersistence';
import * as persistenceUtils from '../utils/persistence';
import type { DashboardState } from '../types/dashboard';

// Mock the persistence utils
vi.mock('../utils/persistence', () => ({
  saveDashboardState: vi.fn()
}));

const mockSaveDashboardState = vi.mocked(persistenceUtils.saveDashboardState);

// Mock console
const consoleMock = {
  log: vi.fn()
};
Object.defineProperty(console, 'log', { value: consoleMock.log });

describe('useDebouncedPersistence', () => {
  const mockDashboardState: DashboardState = {
    layout: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
    widgets: {
      'widget-1': {
        id: 'widget-1',
        type: 'clock',
        content: { format: '12h', showDate: true },
        config: { title: 'Clock' },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    settings: {
      theme: 'dark',
      gridCols: 12,
      gridRowHeight: 60
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce save operations', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    renderHook(() =>
      useDebouncedPersistence(mockDashboardState, { delay: 1000 })
    );

    // Should not save immediately
    expect(mockSaveDashboardState).not.toHaveBeenCalled();

    // Fast forward time to trigger debounced save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveDashboardState).toHaveBeenCalledWith(mockDashboardState);
    expect(mockSaveDashboardState).toHaveBeenCalledTimes(1);
  });

  it('should not save when disabled', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    renderHook(() =>
      useDebouncedPersistence(mockDashboardState, { 
        delay: 1000, 
        enabled: false 
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveDashboardState).not.toHaveBeenCalled();
  });

  it('should reset debounce timer on state changes', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    const { rerender } = renderHook(
      ({ state }) => useDebouncedPersistence(state, { delay: 1000 }),
      { initialProps: { state: mockDashboardState } }
    );

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Change state (should reset timer)
    const updatedState = {
      ...mockDashboardState,
      widgets: {
        ...mockDashboardState.widgets,
        'widget-1': {
          ...mockDashboardState.widgets['widget-1'],
          updatedAt: new Date()
        }
      }
    };

    rerender({ state: updatedState });

    // Advance time by another 500ms (total 1000ms from start, but only 500ms from state change)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not have saved yet
    expect(mockSaveDashboardState).not.toHaveBeenCalled();

    // Advance another 500ms to complete the debounce
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSaveDashboardState).toHaveBeenCalledWith(updatedState);
  });

  it('should provide forceSave functionality', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    const { result } = renderHook(() =>
      useDebouncedPersistence(mockDashboardState, { delay: 1000 })
    );

    // Force save immediately
    act(() => {
      const success = result.current.forceSave();
      expect(success).toBe(true);
    });

    expect(mockSaveDashboardState).toHaveBeenCalledWith(mockDashboardState);
    expect(mockSaveDashboardState).toHaveBeenCalledTimes(1);
  });

  it('should not save duplicate states', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    const { rerender } = renderHook(
      ({ state }) => useDebouncedPersistence(state, { delay: 1000 }),
      { initialProps: { state: mockDashboardState } }
    );

    // First save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveDashboardState).toHaveBeenCalledTimes(1);

    // Rerender with same state
    rerender({ state: mockDashboardState });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not save again since state hasn't changed
    expect(mockSaveDashboardState).toHaveBeenCalledTimes(1);
  });

  it('should handle save failures gracefully', async () => {
    mockSaveDashboardState.mockReturnValue(false);

    const { result } = renderHook(() =>
      useDebouncedPersistence(mockDashboardState, { delay: 1000 })
    );

    act(() => {
      const success = result.current.forceSave();
      expect(success).toBe(false);
    });

    expect(mockSaveDashboardState).toHaveBeenCalledWith(mockDashboardState);
  });

  it('should cleanup timeout on unmount', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    const { unmount } = renderHook(() =>
      useDebouncedPersistence(mockDashboardState, { delay: 1000 })
    );

    // Unmount before debounce completes
    unmount();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not save after unmount
    expect(mockSaveDashboardState).not.toHaveBeenCalled();
  });

  it('should use custom delay', async () => {
    mockSaveDashboardState.mockReturnValue(true);

    renderHook(() =>
      useDebouncedPersistence(mockDashboardState, { delay: 2000 })
    );

    // Should not save at 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockSaveDashboardState).not.toHaveBeenCalled();

    // Should save at 2000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockSaveDashboardState).toHaveBeenCalledTimes(1);
  });
});