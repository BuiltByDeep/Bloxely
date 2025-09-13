import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PomodoroWidget from '../components/widgets/PomodoroWidget';
import type { WidgetData } from '../types/dashboard';

// Mock widget data
const mockPomodoroWidget: WidgetData = {
  id: 'pomodoro-1',
  type: 'pomodoro',
  content: {
    timeRemaining: 25 * 60, // 25 minutes
    isRunning: false,
    mode: 'work',
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
  },
  config: { title: 'Pomodoro Timer' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBreakModeWidget: WidgetData = {
  ...mockPomodoroWidget,
  content: {
    ...mockPomodoroWidget.content,
    mode: 'break',
    timeRemaining: 5 * 60, // 5 minutes break
  },
};

describe('PomodoroWidget', () => {
  const mockOnUpdate = vi.fn();
  const mockOnConfigUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display initial work mode timer', () => {
    render(
      <PomodoroWidget
        widget={mockPomodoroWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('🍅 Focus Time')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('▶️ Start')).toBeInTheDocument();
    expect(screen.getByText('🔄 Reset')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('should display break mode correctly', () => {
    render(
      <PomodoroWidget
        widget={mockBreakModeWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('☕ Break Time')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('should have start and reset buttons', () => {
    render(
      <PomodoroWidget
        widget={mockPomodoroWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('▶️ Start')).toBeInTheDocument();
    expect(screen.getByText('🔄 Reset')).toBeInTheDocument();
  });

  it('should call onUpdate when buttons are clicked', () => {
    render(
      <PomodoroWidget
        widget={mockPomodoroWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const startButton = screen.getByText('▶️ Start');
    fireEvent.click(startButton);

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('should format time correctly', () => {
    const testCases = [
      { timeRemaining: 1500, expected: '25:00' },
      { timeRemaining: 65, expected: '01:05' },
      { timeRemaining: 9, expected: '00:09' },
    ];

    testCases.forEach(({ timeRemaining, expected }) => {
      const widget = {
        ...mockPomodoroWidget,
        content: { ...mockPomodoroWidget.content, timeRemaining },
      };

      const { unmount } = render(
        <PomodoroWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should show work and break durations', () => {
    render(
      <PomodoroWidget
        widget={mockPomodoroWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('Work: 25min • Break: 5min')).toBeInTheDocument();
  });

  it('should display progress ring', () => {
    render(
      <PomodoroWidget
        widget={mockPomodoroWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    // Check that progress circle exists
    const progressCircle = document.querySelector('circle[stroke="white"]');
    expect(progressCircle).toBeInTheDocument();
  });

  it('should show running status when timer is active', () => {
    const runningWidget = {
      ...mockPomodoroWidget,
      content: { ...mockPomodoroWidget.content, isRunning: true },
    };

    render(
      <PomodoroWidget
        widget={runningWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('⏸️ Pause')).toBeInTheDocument();
  });
});