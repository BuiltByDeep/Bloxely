# Kanban Board Widget Design

## Overview

The Kanban Board Widget is a clean, responsive task management component that displays three columns (To Do, In Progress, Done) without any outer wrapper containers. The design prioritizes simplicity, readability, and responsive behavior while maintaining the visual hierarchy shown in the reference image.

## Architecture

### Component Structure
```
KanbanWidget (Main Component)
├── Column Container (Grid Layout)
│   ├── Column Header (Colored Background)
│   │   ├── Title + Task Count
│   │   └── Add Task Button (+)
│   └── Task List (Scrollable Area)
│       ├── Task Card (White Background)
│       │   ├── Task Title (Multi-line)
│       │   └── Priority Label (Bottom-right)
│       └── Add Task Form (When active)
└── Drag & Drop Handlers
```

### State Management
- `tasks`: Array of task objects with id, title, priority, column
- `showAddTask`: String indicating which column is adding a task
- `newTaskTitle`: String for new task input
- `newTaskPriority`: String for selected priority level
- `draggedTask`: Object for drag and drop functionality

## Components and Interfaces

### KanbanWidget Component
```typescript
interface KanbanTask {
  id: string;
  title: string;
  priority: 'normal' | 'urgent' | 'high';
  column: 'todo' | 'progress' | 'done';
  createdAt: Date;
}

interface KanbanData {
  tasks: KanbanTask[];
}

interface KanbanWidgetProps extends BaseWidgetProps {
  widget: WidgetData;
  onUpdate: (data: KanbanData) => void;
}
```

### Column Configuration
```typescript
const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#8B5CF6' },
  { id: 'progress', title: 'In Progress', color: '#3B82F6' },
  { id: 'done', title: 'Done', color: '#10B981' }
];
```

### Priority Configuration
```typescript
const PRIORITIES = {
  normal: { label: 'NORMAL', color: 'text-blue-600' },
  urgent: { label: 'URGENT', color: 'text-red-600' },
  high: { label: 'HIGH', color: 'text-orange-600' }
};
```

## Data Models

### Task Data Model
```typescript
interface KanbanTask {
  id: string;           // Unique identifier
  title: string;        // Task description
  priority: Priority;   // normal | urgent | high
  column: Column;       // todo | progress | done
  createdAt: Date;      // Creation timestamp
}
```

### Widget Data Model
```typescript
interface KanbanData {
  tasks: KanbanTask[];  // Array of all tasks
}
```

## Layout Design

### Container Layout
- **Width**: `max-w-[40%]` of screen width
- **Grid**: `grid-cols-1 md:grid-cols-3` (responsive)
- **Gap**: `gap-4` between columns
- **Height**: `min-h-[400px]` minimum height

### Column Layout
- **Structure**: Header + Task List
- **Header**: Colored background with title, count, and add button
- **Task Area**: Scrollable white background area
- **Spacing**: Proper padding and margins for readability

### Card Layout
- **Background**: White with subtle shadow
- **Padding**: `p-4` for good spacing
- **Border**: Rounded corners for modern look
- **Priority**: Bottom-right positioning with color coding

## Responsive Behavior

### Desktop (md and up)
- 3-column grid layout
- 40% max width of screen
- Horizontal task organization
- Proper column spacing

### Mobile (below md)
- Single column stack
- Full width utilization
- Vertical task organization
- Maintained card proportions

### Resize Handling
- Text wrapping for long titles
- Maintained rectangular card shapes
- Responsive font sizes
- Flexible container dimensions

## Error Handling

### Data Validation
- Validate task structure on load
- Handle missing or corrupted data
- Provide default empty state
- Graceful degradation for invalid priorities

### User Input Validation
- Prevent empty task titles
- Validate priority selection
- Handle drag and drop errors
- Provide user feedback for failures

## Testing Strategy

### Unit Tests
- Task creation and management
- Priority handling and display
- Column organization logic
- Drag and drop functionality

### Integration Tests
- Widget data persistence
- Responsive layout behavior
- User interaction flows
- Error handling scenarios

### Visual Tests
- Column header styling
- Task card appearance
- Priority color coding
- Responsive breakpoints

## Performance Considerations

### Optimization Strategies
- Efficient task filtering by column
- Minimal re-renders on state changes
- Optimized drag and drop handling
- Lazy loading for large task lists

### Memory Management
- Clean up event listeners
- Efficient state updates
- Minimal DOM manipulations
- Proper component lifecycle handling