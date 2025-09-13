import { describe, it, expect } from 'vitest';
import {
  validateWidget,
  validateWidgetContent,
  validateGridLayout,
  validateDashboardState,
  sanitizeWidgetContent,
} from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateWidget', () => {
    it('should validate a correct widget', () => {
      const widget = {
        id: 'widget-1',
        type: 'clock',
        content: { format: '12h', showDate: true },
        config: { title: 'My Clock' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateWidget(widget);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject widget with missing required fields', () => {
      const widget = {
        type: 'clock',
        content: {},
        config: {},
      };

      const result = validateWidget(widget);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should reject widget with invalid types', () => {
      const widget = {
        id: 123, // Should be string
        type: 'clock',
        content: {},
        config: {},
        createdAt: 'not-a-date', // Should be Date
        updatedAt: new Date(),
      };

      const result = validateWidget(widget);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateWidgetContent', () => {
    it('should validate clock widget content', () => {
      const content = { format: '12h', showDate: true };
      const result = validateWidgetContent('clock', content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid clock format', () => {
      const content = { format: 'invalid', showDate: true };
      const result = validateWidgetContent('clock', content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'content.format',
          code: 'INVALID_VALUE',
        })
      );
    });

    it('should validate todo widget content', () => {
      const content = {
        tasks: [
          { id: '1', text: 'Task 1', completed: false, createdAt: new Date() },
          { id: '2', text: 'Task 2', completed: true, createdAt: new Date() },
        ],
      };
      const result = validateWidgetContent('todo', content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid todo tasks', () => {
      const content = {
        tasks: [
          { id: 123, text: 'Task 1', completed: 'not-boolean' }, // Invalid types
        ],
      };
      const result = validateWidgetContent('todo', content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate sticky note content', () => {
      const content = {
        content: 'My note',
        color: { name: 'Yellow', gradient: 'linear-gradient(...)' },
      };
      const result = validateWidgetContent('sticky-note', content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate pomodoro content', () => {
      const content = {
        workDuration: 25,
        breakDuration: 5,
        isRunning: false,
      };
      const result = validateWidgetContent('pomodoro', content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateGridLayout', () => {
    it('should validate correct grid layout', () => {
      const layout = [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 3 },
      ];

      const result = validateGridLayout(layout);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid layout structure', () => {
      const layout = [
        { i: 'widget-1', x: -1, y: 0, w: 4, h: 3 }, // Negative x
        { x: 0, y: 0, w: 4, h: 3 }, // Missing id
      ];

      const result = validateGridLayout(layout);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateDashboardState', () => {
    it('should validate complete dashboard state', () => {
      const state = {
        layout: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
        widgets: {
          'widget-1': {
            id: 'widget-1',
            type: 'clock',
            content: { format: '12h' },
            config: { title: 'Clock' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        settings: {
          theme: 'dark',
          gridCols: 12,
          gridRowHeight: 60,
        },
      };

      const result = validateDashboardState(state);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid dashboard state', () => {
      const state = {
        layout: 'not-an-array',
        widgets: 'not-an-object',
        settings: {
          theme: 'invalid-theme',
          gridCols: -1,
        },
      };

      const result = validateDashboardState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeWidgetContent', () => {
    it('should sanitize todo widget content', () => {
      const content = {
        tasks: [
          { id: '1', text: '<script>alert("xss")</script>Task 1', completed: false },
          { id: '2', text: 'Normal task', completed: true },
        ],
      };

      const sanitized = sanitizeWidgetContent('todo', content);
      expect(sanitized.tasks[0].text).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;Task 1');
      expect(sanitized.tasks[1].text).toBe('Normal task');
    });

    it('should sanitize sticky note content', () => {
      const content = {
        content: '<img src="x" onerror="alert(1)">Note content',
      };

      const sanitized = sanitizeWidgetContent('sticky-note', content);
      expect(sanitized.content).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;Note content');
    });

    it('should not modify other widget types', () => {
      const content = { format: '12h', showDate: true };
      const sanitized = sanitizeWidgetContent('clock', content);
      
      expect(sanitized).toEqual(content);
    });
  });
});