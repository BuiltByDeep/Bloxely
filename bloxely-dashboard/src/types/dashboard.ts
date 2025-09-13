export type WidgetType = 'clock' | 'sticky-note' | 'todo' | 'pomodoro' | 'kanban';

export interface GridLayout {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetConfig {
  title?: string;
  [key: string]: any;
}

export interface WidgetData {
  id: string;
  type: WidgetType;
  content: any;
  config: WidgetConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardSettings {
  theme: 'dark' | 'light';
  gridCols: number;
  gridRowHeight: number;
  // When true, widgets can be placed freely without automatic vertical compaction or collision prevention
  allowFreePlacement?: boolean;
}

export interface DashboardState {
  layout: GridLayout[];
  widgets: Record<string, WidgetData>;
  settings: DashboardSettings;
}

// Widget-specific data types
export interface TodoData {
  tasks: Task[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface StickyNoteColor {
  name: string;
  gradient: string;
}

export interface StickyNoteData {
  content: string;
  color: StickyNoteColor;
}

export interface PomodoroData {
  timeRemaining: number;
  isRunning: boolean;
  mode: 'work' | 'break';
  colorTheme?: 'red' | 'green' | 'black' | 'yellow';
  workDuration: number;
  breakDuration: number;
}

export interface ClockData {
  format: '12h' | '24h';
  showDate: boolean;
  timeColor?: string;
  dateColor?: string;
  backgroundColor?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  priority: 'normal' | 'urgent' | 'high';
  column: 'todo' | 'progress' | 'done';
  createdAt: Date;
}

export interface KanbanData {
  tasks: KanbanTask[];
}


