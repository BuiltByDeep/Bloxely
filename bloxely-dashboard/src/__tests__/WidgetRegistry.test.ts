import { describe, it, expect } from 'vitest';
import { widgetRegistry } from '../services/WidgetRegistry';
import type { WidgetDefinition } from '../types';

describe('WidgetRegistry', () => {
  const testWidget: WidgetDefinition = {
    type: 'test-widget' as any,
    name: 'Test Widget',
    description: 'A test widget',
    icon: '🧪',
    defaultSize: { w: 2, h: 2 },
    defaultConfig: { title: 'Test' },
    defaultContent: { value: 'test' },
  };

  it('should register and retrieve widgets', () => {
    widgetRegistry.register(testWidget);
    
    const retrieved = widgetRegistry.get('test-widget' as any);
    expect(retrieved).toEqual(testWidget);
  });

  it('should check if widget exists', () => {
    widgetRegistry.register(testWidget);
    
    expect(widgetRegistry.has('test-widget' as any)).toBe(true);
    expect(widgetRegistry.has('non-existent' as any)).toBe(false);
  });

  it('should return all registered widgets', () => {
    const widgets = widgetRegistry.getAll();
    
    // Should include default widgets
    expect(widgets.length).toBeGreaterThan(0);
    expect(widgets.map(w => w.type)).toContain('clock');
    expect(widgets.map(w => w.type)).toContain('todo');
  });

  it('should return available widgets sorted by name', () => {
    const available = widgetRegistry.getAvailable();
    
    expect(available.length).toBeGreaterThan(0);
    
    // Check if sorted
    for (let i = 1; i < available.length; i++) {
      expect(available[i-1].name.localeCompare(available[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it('should return undefined for non-existent widget', () => {
    const nonExistent = widgetRegistry.get('non-existent' as any);
    expect(nonExistent).toBeUndefined();
  });
});