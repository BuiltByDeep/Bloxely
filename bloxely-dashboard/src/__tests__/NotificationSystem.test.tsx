import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import NotificationContainer from '../components/NotificationContainer';
import { afterEach } from 'node:test';

// Test component that uses notifications
const TestComponent: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAllNotifications } = useNotifications();

  return (
    <div>
      <button onClick={() => showSuccess('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => showError('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning!', 'Be careful')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info', 'Just so you know')}>
        Show Info
      </button>
      <button onClick={clearAllNotifications}>
        Clear All
      </button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <NotificationProvider>
      <TestComponent />
      <NotificationContainer />
    </NotificationProvider>
  );
};

describe('Notification System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show success notification', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('should show error notification', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show warning notification', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('should show info notification', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Just so you know')).toBeInTheDocument();
  });

  it('should auto-remove notifications after duration', async () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();

    // Fast forward time and wait for state update
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('should allow manual dismissal of notifications', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('should clear all notifications', () => {
    renderWithProvider();

    // Add multiple notifications
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Warning!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear All'));

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    expect(screen.queryByText('Error!')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning!')).not.toBeInTheDocument();
  });

  it('should show multiple notifications simultaneously', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('should handle notifications with actions', () => {
    const actionMock = vi.fn();

    const TestWithAction: React.FC = () => {
      const { showInfo } = useNotifications();
      
      return (
        <button
          onClick={() =>
            showInfo('Info with action', 'Click the action', {
              action: { label: 'Do something', onClick: actionMock },
            })
          }
        >
          Show with Action
        </button>
      );
    };

    render(
      <NotificationProvider>
        <TestWithAction />
        <NotificationContainer />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByText('Show with Action'));
    expect(screen.getByText('Do something')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Do something'));
    expect(actionMock).toHaveBeenCalled();
  });
});