import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import { NotificationProvider } from '../context/NotificationContext';
import GridLayoutManager from '../components/GridLayoutManager';

// Mock react-grid-layout
vi.mock('react-grid-layout', () => ({
  Responsive: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-grid-layout">{children}</div>
  ),
  WidthProvider: (Component: any) => Component,
}));

// Wrapper component for testing
const wrapper = ({ children }: { children: ReactNode }) => (
  <NotificationProvider>
    <DashboardProvider>{children}</DashboardProvider>
  </NotificationProvider>
);

describe('GridLayoutManager', () => {
  it('should render the grid layout container', () => {
    render(
      <GridLayoutManager>
        <div>Test Widget</div>
      </GridLayoutManager>,
      { wrapper }
    );

    expect(screen.getByTestId('responsive-grid-layout')).toBeInTheDocument();
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('should render children within the grid layout', () => {
    render(
      <GridLayoutManager>
        <div key="widget-1">Widget 1</div>
        <div key="widget-2">Widget 2</div>
      </GridLayoutManager>,
      { wrapper }
    );

    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Widget 2')).toBeInTheDocument();
  });
});