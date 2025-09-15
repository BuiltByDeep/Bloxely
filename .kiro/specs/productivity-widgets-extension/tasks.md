# Implementation Plan

- [x] 1. Extend widget type system and factory for new widgets

  - Add new widget types to WidgetType union in dashboard.ts
  - Create data interface definitions for all 4 new widgets
  - Update WidgetFactory to support new widget types
  - Create placeholder components for each new widget type
  - Write unit tests for extended type system and factory registration
  - _Requirements: 5.1, 5.2_

- [x] 2. Implement Simple Image & Screenshot Collector widget foundation

  - Create ImageCollectorWidget component with basic structure
  - Implement clipboard paste detection using Clipboard API
  - Add drag-and-drop zone with visual feedback
  - Create image data model and localStorage integration
  - Write unit tests for clipboard and drag-drop functionality
  - _Requirements: 4.1, 4.2, 4.7_

- [x] 3. Build image processing and thumbnail generation system

  - Implement FileReader API integration for image file processing
  - Create Canvas API thumbnail generation utility
  - Add image format validation and file size limits
  - Implement automatic storage cleanup when exceeding 20 images
  - Write unit tests for image processing and thumbnail generation
  - _Requirements: 4.8, 7.1, 7.2_

- [x] 4. Complete Image Collector with grid display and modal preview

  - Create 3x3 thumbnail grid layout component
  - Implement full-size image modal with click-to-view functionality
  - Add hover effects and delete functionality for thumbnails
  - Create empty state with helpful instructions and drop zone styling
  - Write integration tests for complete image collector workflow
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Implement Priority Matrix widget structure and quadrant system

  - Create PriorityMatrixWidget component with 2x2 grid layout
  - Build individual Quadrant components with color-coded backgrounds
  - Implement task data model and quadrant assignment logic
  - Create task input functionality for adding tasks to specific quadrants
  - Write unit tests for quadrant system and task management
  - _Requirements: 2.1, 2.4, 2.7_

- [x] 6. Add drag-and-drop functionality to Priority Matrix

  - Integrate react-beautiful-dnd for smooth task dragging between quadrants
  - Implement visual feedback during drag operations
  - Add task editing inline functionality with immediate save
  - Create task count badges and hover animations for quadrants
  - Write unit tests for drag-and-drop state management
  - _Requirements: 2.2, 2.3, 2.5, 2.6_

- [x] 7. Build Habit Streak Tracker widget foundation

  - Create HabitTrackerWidget component with habit management system
  - Implement habit data model with creation and deletion functionality
  - Build 90-day calendar grid using date calculation utilities
  - Create habit completion tracking with date-based storage
  - Write unit tests for habit CRUD operations and date calculations
  - _Requirements: 3.1, 3.2, 3.7_

- [x] 8. Implement habit completion and streak calculation system

  - Add habit completion marking with visual calendar updates
  - Create streak calculation logic for consecutive completion days
  - Implement celebration animations for milestone streaks
  - Build completion percentage display with progress ring visualization
  - Write unit tests for streak logic and completion tracking
  - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 9. Create Lo-fi Music Player widget structure and audio system

  - Build MusicPlayerWidget component with preset station system
  - Define music station data model with multiple source support
  - Implement HTML5 Audio integration with custom control overlay
  - Create station selector with thumbnail grid display
  - Write unit tests for audio control logic and station management
  - _Requirements: 1.1, 1.2, 6.1_

- [x] 10. Implement music player controls and advanced features

  - Add play/pause/skip functionality with smooth transitions
  - Create volume control slider with real-time audio adjustment
  - Implement now playing display with track information
  - Build sleep timer functionality with automatic playback stop
  - Add minimize/expand modes for compact player view
  - Write unit tests for player controls and timer functionality
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 11. Integrate streaming sources and external API support

  - Implement YouTube embed integration for lo-fi stream URLs
  - Add SoundCloud widget API support for playlist streaming
  - Create fallback system for failed streaming sources
  - Implement preset station configuration with multiple categories
  - Write integration tests for external streaming API functionality
  - _Requirements: 6.2, 6.3, 6.5, 6.6_

- [x] 12. Register all new widgets in factory and update dashboard integration

  - Register all 4 new widget components in WidgetFactory
  - Update widget registry with proper size constraints and defaults
  - Ensure proper integration with existing error boundary system
  - Verify persistence system works with new widget data structures
  - Write integration tests for complete widget lifecycle
  - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_

- [ ] 13. Apply consistent styling and lo-fi theme integration

  - Style all new widgets with established dark theme color palette
  - Ensure consistent spacing, typography, and visual hierarchy
  - Add smooth hover effects and transitions for interactive elements
  - Implement responsive design for different widget sizes
  - Create visual consistency with existing dashboard widgets
  - _Requirements: 5.2, 7.3, 7.4, 7.5_

- [x] 14. Implement comprehensive error handling and user feedback

  - Add error boundaries specific to each new widget type
  - Create loading states for async operations (image processing, audio loading)
  - Implement graceful fallbacks for API failures and browser compatibility
  - Add user-friendly error messages with recovery options
  - Write unit tests for error scenarios and recovery mechanisms
  - _Requirements: 5.4, 6.5, 7.6_

- [x] 15. Optimize performance and conduct final integration testing
  - Implement lazy loading for audio streams and large images
  - Add memory management for audio resources and image data
  - Optimize drag-and-drop performance and calendar rendering
  - Conduct cross-browser compatibility testing
  - Perform end-to-end testing of all widget interactions
  - _Requirements: 5.5, 5.6, 7.7_
