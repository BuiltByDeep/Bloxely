import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import ClockWidget from '../components/widgets/ClockWidget';
import type { WidgetData } from '../types';

// Mock timers
vi.useFakeTimers();

// Wrapper component for testing
const wrapper = ({ children }: { children: ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

const mockClockWidget: WidgetData = {
  id: 'clock-1',
  type: 'clock',
  content: {
    format: '12h',
    showDate: true,
  },
  config: { title: 'Clock' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ClockWidget', () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;
  let mockOnConfigUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnUpdate = vi.fn();
    mockOnConfigUpdate = vi.fn();
    vi.setSystemTime(new Date('2024-01-15 14:30:45'));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('should display current time in 12-hour format by default', () => {
    render(
      <ClockWidget
        widget={mockClockWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('should display current date when showDate is true', () => {
    render(
      <ClockWidget
        widget={mockClockWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
  });

  it('should update time every second', () => {
    render(
      <ClockWidget
        widget={mockClockWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    expect(screen.getByText('2:30 PM')).toBeInTheDocument();

    // Advance time by 1 minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText('2:31 PM')).toBeInTheDocument();
  });

  it('should show date when time is clicked and date is hidden', () => {
    const widgetNoDate = {
      ...mockClockWidget,
      content: {
        format: '12h',
        showDate: false,
      },
    };

    render(
      <ClockWidget
        widget={widgetNoDate}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const timeDisplay = screen.getByText('2:30 PM');
    
    fireEvent.click(timeDisplay);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      format: '12h',
      showDate: true,
    });
  });

  it('should hide date when date is clicked', () => {
    render(
      <ClockWidget
        widget={mockClockWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const dateDisplay = screen.getByText('Monday, January 15, 2024');
    
    fireEvent.click(dateDisplay);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      format: '12h',
      showDate: false,
    });
  });

  it('should not display date when showDate is false', () => {
    const widgetNoDate = {
      ...mockClockWidget,
      content: {
        format: '12h',
        showDate: false,
      },
    };

    render(
      <ClockWidget
        widget={widgetNoDate}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    expect(screen.queryByText('Monday, January 15, 2024')).not.toBeInTheDocument();
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('should apply correct CSS classes based on date visibility', () => {
    const { rerender } = render(
      <ClockWidget
        widget={mockClockWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    // With date
    expect(screen.getByText('2:30 PM').closest('.clock-widget-card')).toHaveClass('with-date');

    // Without date
    const widgetNoDate = {
      ...mockClockWidget,
      content: { format: '12h', showDate: false },
    };

    rerender(
      <ClockWidget
        widget={widgetNoDate}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('2:30 PM').closest('.clock-widget-card')).toHaveClass('time-only');
  });



  it('should display time with larger font when date is hidden', () => {
    const widgetNoDate = {
      ...mockClockWidget,
      content: {
        format: '12h',
        showDate: false,
      },
    };

    render(
      <ClockWidget
        widget={widgetNoDate}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const timeElement = screen.getByText('2:30 PM');
    expect(timeElement.closest('.clock-widget-card')).toHaveClass('time-only');
  });

  it('should clean up timer on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    
    const { unmount } = render(
      <ClockWidget
        widget={mockClockWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});