import React from 'react';
import { widgetRegistry } from './WidgetRegistry';
import PlaceholderWidget from '../components/widgets/PlaceholderWidget';
import ClockWidget from '../components/widgets/ClockWidget';
import StickyNoteWidget from '../components/widgets/StickyNoteWidget';
import TodoWidget from '../components/widgets/TodoWidget';
import PomodoroWidget from '../components/widgets/PomodoroWidget';
import KanbanWidget from '../components/widgets/KanbanWidget';
import CustomImageWidget from '../components/CustomImageWidget';
import PersonalImageWidget from '../components/widgets/PersonalImageWidget';
import HabitWidget from '../components/HabitWidget';
import PriorityMatrixWidget from '../components/widgets/PriorityMatrixWidget';
import YouTubePlayerWidget from '../components/widgets/YouTubePlayerWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import VoiceTextNotesWidget from '../components/widgets/VoiceTextNotesWidget';
import type { WidgetType, WidgetData, WidgetConfig, WidgetDefinition, BaseWidgetProps } from '../types';

class WidgetFactoryService {
  private widgetComponents: Map<WidgetType, React.ComponentType<BaseWidgetProps>> = new Map();

  // Register a widget component
  registerComponent(type: WidgetType, component: React.ComponentType<BaseWidgetProps>): void {
    this.widgetComponents.set(type, component);
  }

  // Create a widget instance
  createWidget(widget: WidgetData, onUpdate: (content: any) => void, onConfigUpdate: (config: WidgetConfig) => void): React.ReactElement {
    const WidgetComponent = this.widgetComponents.get(widget.type);
    
    if (!WidgetComponent) {
      // Fallback to placeholder widget if component not found
      return (
        <PlaceholderWidget 
          key={widget.id}
          widget={widget}
          onUpdate={onUpdate}
          onConfigUpdate={onConfigUpdate}
        />
      );
    }

    return (
      <WidgetComponent
        key={widget.id}
        widget={widget}
        onUpdate={onUpdate}
        onConfigUpdate={onConfigUpdate}
      />
    );
  }

  // Get available widget definitions
  getAvailableWidgets(): WidgetDefinition[] {
    return widgetRegistry.getAvailable();
  }

  // Get widget definition by type
  getWidgetDefinition(type: WidgetType): WidgetDefinition | undefined {
    return widgetRegistry.get(type);
  }

  // Check if widget type is supported
  isSupported(type: WidgetType): boolean {
    return this.widgetComponents.has(type);
  }

  // Get default widget data for a type
  getDefaultWidgetData(type: WidgetType, id: string): WidgetData | null {
    const definition = widgetRegistry.get(type);
    if (!definition) {
      return null;
    }

    return {
      id,
      type,
      content: definition.defaultContent,
      config: definition.defaultConfig,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get default size for a widget type
  getDefaultSize(type: WidgetType) {
    const definition = widgetRegistry.get(type);
    return definition?.defaultSize || { w: 2, h: 2, minW: 1, minH: 1 };
  }
}

// Create singleton instance
export const widgetFactory = new WidgetFactoryService();

// Register widget components
widgetFactory.registerComponent('clock', ClockWidget);
widgetFactory.registerComponent('todo', TodoWidget);
widgetFactory.registerComponent('sticky-note', StickyNoteWidget);
widgetFactory.registerComponent('pomodoro', PomodoroWidget);
widgetFactory.registerComponent('kanban', KanbanWidget);
widgetFactory.registerComponent('custom-wallpaper', CustomImageWidget);
widgetFactory.registerComponent('personal-image', PersonalImageWidget);
widgetFactory.registerComponent('habit-tracker', HabitWidget);
widgetFactory.registerComponent('priority-matrix', PriorityMatrixWidget);
widgetFactory.registerComponent('youtube-player', YouTubePlayerWidget);
widgetFactory.registerComponent('calendar', CalendarWidget);
widgetFactory.registerComponent('voice-text-notes', VoiceTextNotesWidget);
