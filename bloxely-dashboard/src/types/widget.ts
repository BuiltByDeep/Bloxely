import type { ReactElement } from 'react';
import type { WidgetType, WidgetData, WidgetConfig } from './dashboard';

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
  defaultConfig: WidgetConfig;
  defaultContent: any;
}

export interface BaseWidgetProps {
  widget: WidgetData;
  onUpdate: (content: any) => void;
  onConfigUpdate: (config: WidgetConfig) => void;
}

export interface WidgetFactory {
  createWidget(type: WidgetType, id: string, config?: WidgetConfig): ReactElement;
  getAvailableWidgets(): WidgetDefinition[];
  registerWidget(definition: WidgetDefinition): void;
  getWidgetDefinition(type: WidgetType): WidgetDefinition | undefined;
}