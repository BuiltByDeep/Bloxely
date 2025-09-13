import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import WidgetRenderer from '../components/WidgetRenderer';
import type { WidgetData } from '../types/dashboard';

// Wrapper component for testing
const wrapper = ({ children }: { children: ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

const mockWidget: WidgetData = {
  id: 'test-widget-1',
  type: 'clock',
  content: { format: '12h', showDate: true },
  config: { title: 'Test Clock' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('WidgetRenderer', () => {
  it('should render a widget with title and remove button', () => {
    render(<WidgetRenderer widget={mockWidget} />, { wrapper });

    expect(screen.getByText('Test Clock')).toBeInTheDocument();
    expect(screen.getByTitle('Remove widget')).toBeInTheDocument();
  });

  it('should render actual clock widget for clock type', () => {
    render(<WidgetRenderer widget={mockWidget} />, { wrapper });

    // Clock widget should show actual time and format controls
    expect(screen.getByText('12-hour format')).toBeInTheDocument();
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('Hide Date')).toBeInTheDocument();
  });

  it('should render placeholder widget for different widget types', () => {
    const todoWidget: WidgetData = {
      ...mockWidget,
      type: 'todo',
      config: { title: 'My Tasks' },
    };

    render(<WidgetRenderer widget={todoWidget} />, { wrapper });

    expect(screen.getByText('My Tasks')).toBeInTheDocument();
    expect(screen.getByText('Todo Widget')).toBeInTheDocument();
  });

  it('should handle unknown widget types', () => {
    const unknownWidget: WidgetData = {
      ...mockWidget,
      type: 'unknown' as any,
      config: { title: 'Unknown Widget' },
    };

    render(<WidgetRenderer widget={unknownWidget} />, { wrapper });

    // Check for the title in the header
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Unknown Widget');
    // Check for the placeholder content
    expect(screen.getByText('Coming soon...')).toBeInTheDocument();
  });
});