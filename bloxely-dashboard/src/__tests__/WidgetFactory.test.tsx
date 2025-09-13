import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import { widgetFactory } from '../services/WidgetFactory';
import type { WidgetData, BaseWidgetProps } from '../types';

// Mock widget component for testing
const MockWidget: React.FC<BaseWidgetProps> = ({ widget }) => (
  <div data-testid={`mock-${widget.type}`}>
    Mock {widget.type} Widget
  </div>
);

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

describe('WidgetFactory', () => {
  beforeEach(() => {
    // Reset factory state
    widgetFactory.registerComponent('test-widget' as any, MockWidget);
  });

  it('should return available widget definitions', () => {
    const availableWidgets = widgetFactory.getAvailableWidgets();
    
    expect(availableWidgets).toHaveLength(4);
    expect(availableWidgets.map(w => w.type)).toContain('clock');
    expect(availableWidgets.map(w => w.type)).toContain('todo');
    expect(availableWidgets.map(w => w.type)).toContain('sticky-note');
    expect(availableWidgets.map(w => w.type)).toContain('pomodoro');
  });

  it('should get widget definition by type', () => {
    const clockDefinition = widgetFactory.getWidgetDefinition('clock');
    
    expect(clockDefinition).toBeDefined();
    expect(clockDefinition?.type).toBe('clock');
    expect(clockDefinition?.name).toBe('Clock');
    expect(clockDefinition?.icon).toBe('🕐');
  });

  it('should create widget with registered component', () => {
    const testWidget: WidgetData = {
      ...mockWidget,
      type: 'test-widget' as any,
    };

    const widgetElement = widgetFactory.createWidget(
      testWidget,
      () => {},
      () => {}
    );

    render(widgetElement, { wrapper });
    expect(screen.getByTestId('mock-test-widget')).toBeInTheDocument();
  });

  it('should fallback to placeholder for unregistered widget', () => {
    const unknownWidget: WidgetData = {
      ...mockWidget,
      type: 'unknown' as any,
    };

    const widgetElement = widgetFactory.createWidget(
      unknownWidget,
      () => {},
      () => {}
    );

    render(widgetElement, { wrapper });
    expect(screen.getByText('Unknown Widget')).toBeInTheDocument();
  });

  it('should check if widget type is supported', () => {
    expect(widgetFactory.isSupported('clock')).toBe(true);
    expect(widgetFactory.isSupported('unknown' as any)).toBe(false);
  });

  it('should get default widget data', () => {
    const defaultData = widgetFactory.getDefaultWidgetData('clock', 'test-id');
    
    expect(defaultData).toBeDefined();
    expect(defaultData?.id).toBe('test-id');
    expect(defaultData?.type).toBe('clock');
    expect(defaultData?.content).toEqual({ format: '12h', showDate: true });
    expect(defaultData?.config).toEqual({ title: 'Clock' });
  });

  it('should get default size for widget type', () => {
    const clockSize = widgetFactory.getDefaultSize('clock');
    
    expect(clockSize).toEqual({ w: 2, h: 1, minW: 2, minH: 1 });
  });
});