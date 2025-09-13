import type { WidgetDefinition, WidgetType } from '../types';

class WidgetRegistry {
  private widgets: Map<WidgetType, WidgetDefinition> = new Map();

  register(definition: WidgetDefinition): void {
    this.widgets.set(definition.type, definition);
  }

  get(type: WidgetType): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  getAvailable(): WidgetDefinition[] {
    return this.getAll().sort((a, b) => a.name.localeCompare(b.name));
  }

  has(type: WidgetType): boolean {
    return this.widgets.has(type);
  }
}

// Create singleton instance
export const widgetRegistry = new WidgetRegistry();

// Register default widgets
const defaultWidgets: WidgetDefinition[] = [
  {
    type: 'clock',
    name: 'Clock',
    description: 'Display current time and date',
    icon: '🕐',
    defaultSize: { w: 6, h: 3, minW: 4, minH: 2 },
    defaultConfig: { title: 'Clock' },
    defaultContent: { format: '12h', showDate: true, backgroundColor: '#38BDF8' },
  },
  {
    type: 'todo',
    name: 'To-Do List',
    description: 'Manage your daily tasks',
    icon: '📝',
    defaultSize: { w: 8, h: 8, minW: 6, minH: 6 },
    defaultConfig: { title: 'To-Do List' },
    defaultContent: { tasks: [] },
  },
  {
    type: 'sticky-note',
    name: 'Sticky Note',
    description: 'Quick notes and reminders',
    icon: '📄',
    defaultSize: { w: 6, h: 4, minW: 4, minH: 3 },
    defaultConfig: { title: 'Sticky Note' },
    defaultContent: { 
      content: '', 
      color: { name: 'Yellow', gradient: 'linear-gradient(to bottom right, #fff59d, #fff176)' }
    },
  },
  {
    type: 'pomodoro',
    name: 'Pomodoro Timer',
    description: 'Focus timer with work/break cycles',
    icon: '⏰',
    defaultSize: { w: 6, h: 3, minW: 6, minH: 3 },
    defaultConfig: { title: 'Pomodoro Timer' },
    defaultContent: {
      timeRemaining: 25 * 60,
      isRunning: false,
      mode: 'work',
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
    },
  },
  {
    type: 'kanban',
    name: 'Kanban Board',
    description: 'Task management with drag-and-drop columns',
    icon: '📋',
    defaultSize: { w: 12, h: 6, minW: 8, minH: 4 },
    defaultConfig: { title: 'Kanban Board' },
    defaultContent: {
      tasks: [],
    },
  },
  {
    type: 'custom-image',
    name: 'Custom Image',
    description: 'Upload and manage custom background images',
    icon: '🖼️',
    defaultSize: { w: 8, h: 6, minW: 6, minH: 4 },
    defaultConfig: { title: 'Custom Background' },
    defaultContent: { imageUrl: null },
  },
];

// Register all default widgets
defaultWidgets.forEach(widget => widgetRegistry.register(widget));