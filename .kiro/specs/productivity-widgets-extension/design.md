# Design Document

## Overview

This design extends the existing Bloxely Focus Dashboard with four advanced productivity widgets that maintain the established architecture while adding sophisticated functionality. The widgets leverage the existing React + TypeScript foundation, widget factory system, and localStorage persistence while introducing new capabilities for music streaming, task prioritization, habit tracking, and image management. The design emphasizes seamless integration with the current system and maintains the lo-fi aesthetic.

## Architecture

### Technology Stack Extensions
- **Audio APIs:** Web Audio API and HTML5 Audio for music streaming
- **File Handling:** FileReader API and Clipboard API for image processing
- **Canvas API:** For thumbnail generation and image processing
- **External APIs:** YouTube Embed API, SoundCloud Widget API (optional Spotify Web API)
- **Storage:** Enhanced localStorage with image data management

### Widget Type Extensions
The existing `WidgetType` union will be extended to include:
```typescript
export type WidgetType = 'clock' | 'sticky-note' | 'todo' | 'pomodoro' | 'kanban' | 
                         'music-player' | 'priority-matrix' | 'habit-tracker' | 'image-collector';
```

## Components and Interfaces

### 1. Lo-fi Music Player Widget

#### Component Structure
```
MusicPlayerWidget/
├── index.tsx (main player component)
├── StationSelector.tsx (preset station grid)
├── PlayerControls.tsx (play/pause/volume controls)
├── NowPlaying.tsx (current track display)
├── SleepTimer.tsx (auto-stop functionality)
└── AudioVisualizer.tsx (optional visual feedback)
```

#### Data Models
```typescript
interface MusicStation {
  id: string;
  name: string;
  description: string;
  source: 'youtube' | 'soundcloud' | 'spotify' | 'local';
  streamUrl: string;
  thumbnail: string;
  category: 'lofi' | 'ambient' | 'jazz' | 'nature';
  isLive: boolean;
}

interface MusicPlayerData {
  currentStation: MusicStation | null;
  volume: number;
  isPlaying: boolean;
  isMinimized: boolean;
  sleepTimer: {
    enabled: boolean;
    duration: number; // minutes
    remaining: number;
  };
  favoriteStations: string[];
}
```

#### Key Features Implementation
- **Station Management:** Predefined stations with YouTube embed URLs for lo-fi streams
- **Audio Control:** HTML5 Audio element with custom controls overlay
- **Sleep Timer:** setInterval-based countdown with automatic pause
- **Persistence:** Save current station, volume, and favorites to localStorage

#### Size Constraints
- Default: 4x3 grid units
- Minimum: 3x2 grid units (compact mode)
- Maximum: 6x4 grid units (expanded mode)

### 2. Priority Matrix Widget (Eisenhower Quadrant)

#### Component Structure
```
PriorityMatrixWidget/
├── index.tsx (main 2x2 grid container)
├── Quadrant.tsx (individual quadrant component)
├── TaskItem.tsx (draggable task component)
├── TaskInput.tsx (add new task input)
└── QuadrantLabels.tsx (quadrant headers and descriptions)
```

#### Data Models
```typescript
interface PriorityTask {
  id: string;
  text: string;
  quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  createdAt: Date;
  updatedAt: Date;
}

interface QuadrantConfig {
  id: string;
  label: string;
  description: string;
  color: string;
  backgroundColor: string;
}

interface PriorityMatrixData {
  tasks: PriorityTask[];
  quadrants: Record<string, QuadrantConfig>;
}
```

#### Drag and Drop Implementation
- **React DnD:** Use react-beautiful-dnd for smooth drag-and-drop between quadrants
- **Visual Feedback:** Highlight drop zones during drag operations
- **State Updates:** Update task quadrant and trigger persistence on drop

#### Size Constraints
- Fixed: 4x4 grid units (maintains square aspect ratio for 2x2 layout)
- Minimum: 4x4 grid units (non-resizable to preserve quadrant proportions)

### 3. Habit Streak Tracker Widget

#### Component Structure
```
HabitTrackerWidget/
├── index.tsx (main tracker container)
├── HabitList.tsx (list of trackable habits)
├── CalendarGrid.tsx (90-day calendar view)
├── StreakCounter.tsx (current streak display)
├── ProgressRing.tsx (completion percentage visualization)
└── HabitForm.tsx (add/edit habit form)
```

#### Data Models
```typescript
interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  isActive: boolean;
}

interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: Date;
}

interface HabitTrackerData {
  habits: Habit[];
  completions: HabitCompletion[];
  streaks: Record<string, number>; // habitId -> current streak
}
```

#### Calendar Implementation
- **Date Calculations:** Generate 90-day grid using date-fns library
- **Visual Indicators:** Color-coded dots/squares for completion status
- **Streak Logic:** Calculate consecutive completion days for each habit
- **Animations:** Celebration effects for milestone streaks (7, 30, 60, 90 days)

#### Size Constraints
- Default: 5x4 grid units
- Minimum: 4x3 grid units
- Maximum: 6x5 grid units

### 4. Simple Image & Screenshot Collector Widget

#### Component Structure
```
ImageCollectorWidget/
├── index.tsx (main container with drop zone)
├── DropZone.tsx (drag-and-drop area)
├── ImageGrid.tsx (3x3 thumbnail grid)
├── ImagePreview.tsx (full-size modal)
├── PasteHandler.tsx (clipboard paste detection)
└── ThumbnailGenerator.tsx (image compression utility)
```

#### Data Models
```typescript
interface SavedImage {
  id: string;
  name: string;
  dataUrl: string; // Base64 encoded image
  thumbnail: string; // Compressed Base64 thumbnail
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

interface ImageCollectorData {
  images: SavedImage[];
  maxImages: number; // Default: 20
  thumbnailSize: number; // Default: 150px
}
```

#### File Handling Implementation
- **Clipboard API:** Listen for paste events and extract image data
- **Drag & Drop:** FileReader API to process dropped image files
- **Thumbnail Generation:** Canvas API to create compressed thumbnails
- **Storage Management:** Automatic cleanup when exceeding maxImages limit

#### Size Constraints
- Default: 4x4 grid units (accommodates 3x3 thumbnail grid)
- Minimum: 3x3 grid units
- Maximum: 6x6 grid units

## Data Models Integration

### Extended Dashboard Types
```typescript
// Add to existing WidgetData content types
interface MusicPlayerData {
  currentStation: MusicStation | null;
  volume: number;
  isPlaying: boolean;
  isMinimized: boolean;
  sleepTimer: SleepTimerConfig;
  favoriteStations: string[];
}

interface PriorityMatrixData {
  tasks: PriorityTask[];
  quadrants: Record<string, QuadrantConfig>;
}

interface HabitTrackerData {
  habits: Habit[];
  completions: HabitCompletion[];
  streaks: Record<string, number>;
}

interface ImageCollectorData {
  images: SavedImage[];
  maxImages: number;
  thumbnailSize: number;
}
```

### Widget Registry Extensions
```typescript
// Add to WidgetRegistry.ts
const newWidgetDefinitions: WidgetDefinition[] = [
  {
    type: 'music-player',
    name: 'Lo-fi Music Player',
    description: 'Stream ambient focus music',
    icon: '🎵',
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2, maxW: 6, maxH: 4 },
    defaultConfig: { title: 'Lo-fi Player' },
    defaultContent: {
      currentStation: null,
      volume: 0.7,
      isPlaying: false,
      isMinimized: false,
      sleepTimer: { enabled: false, duration: 30, remaining: 0 },
      favoriteStations: []
    }
  },
  // ... other widget definitions
];
```

## Error Handling

### Music Player Error Handling
- **Stream Failures:** Fallback to alternative sources or show error state
- **Audio API Errors:** Graceful degradation with basic HTML5 audio controls
- **Network Issues:** Retry logic with exponential backoff

### Image Collector Error Handling
- **File Size Limits:** Validate and compress large images before storage
- **Storage Quota:** Handle localStorage quota exceeded errors
- **Invalid Formats:** Filter and reject unsupported file types
- **Clipboard Access:** Handle permission denied scenarios gracefully

### Habit Tracker Error Handling
- **Date Calculations:** Validate date ranges and handle timezone issues
- **Data Corruption:** Validate habit completion data on load
- **Performance:** Optimize for large datasets (1+ years of data)

### Priority Matrix Error Handling
- **Drag Operations:** Handle failed drops and restore original positions
- **Task Validation:** Ensure task text is not empty before creation
- **Quadrant Integrity:** Validate task assignments to valid quadrants

## Testing Strategy

### Unit Testing Focus Areas
1. **Music Player:** Audio control logic, station switching, sleep timer
2. **Priority Matrix:** Drag-and-drop state management, task CRUD operations
3. **Habit Tracker:** Date calculations, streak logic, completion tracking
4. **Image Collector:** File processing, thumbnail generation, storage management

### Integration Testing
1. **Widget Factory:** Registration and creation of new widget types
2. **Persistence:** Save/load functionality for complex data structures
3. **Dashboard Integration:** Layout management with new widget sizes

### Browser Compatibility Testing
1. **Audio APIs:** Test across different browsers and mobile devices
2. **Clipboard API:** Verify paste functionality and permission handling
3. **File APIs:** Test drag-and-drop across different operating systems
4. **Canvas API:** Ensure thumbnail generation works consistently

## Performance Considerations

### Music Player Optimization
- **Lazy Loading:** Load audio streams only when playing
- **Memory Management:** Clean up audio resources when widget is removed
- **Background Processing:** Minimize CPU usage when minimized

### Image Collector Optimization
- **Thumbnail Caching:** Generate thumbnails once and cache in localStorage
- **Memory Limits:** Implement image compression to stay within storage limits
- **Batch Processing:** Handle multiple file drops efficiently

### Habit Tracker Optimization
- **Data Pagination:** Load only visible date ranges for large datasets
- **Calculation Caching:** Cache streak calculations to avoid recomputation
- **Efficient Rendering:** Use React.memo for calendar grid cells

### Priority Matrix Optimization
- **Drag Performance:** Optimize drag-and-drop for smooth interactions
- **State Updates:** Minimize re-renders during drag operations
- **Task Rendering:** Virtualize task lists for large numbers of tasks

## Security Considerations

### Content Security Policy
- **Audio Sources:** Whitelist trusted streaming domains
- **Image Processing:** Validate image data before processing
- **External APIs:** Use HTTPS endpoints and validate responses

### Data Privacy
- **Local Storage:** All data remains client-side, no external transmission
- **Image Data:** Inform users about local storage of image data
- **Audio Streaming:** Use embedded players to avoid direct API keys

### Input Validation
- **File Types:** Strict validation of uploaded image formats
- **Text Input:** Sanitize task and habit text to prevent XSS
- **URL Validation:** Validate streaming URLs before use