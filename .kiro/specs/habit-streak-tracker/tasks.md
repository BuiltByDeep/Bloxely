# Implementation Plan

- [ ] 1. Set up habit tracker widget foundation and type system

  - Add 'habit-tracker' to WidgetType union in types/dashboard.ts
  - Create HabitTrackerData interface with Habit, HabitCompletion, and HabitStreak types
  - Create basic HabitStreakWidget component structure with BaseWidgetProps
  - Register habit tracker widget in WidgetRegistry with proper size constraints (w: 8, h: 7)
  - Write unit tests for type definitions and widget registration
  - _Requirements: 4.1, 4.2_

- [ ] 2. Implement core habit data management system

  - Create useHabitData hook for habit CRUD operations and state management
  - Implement HabitManager class with createHabit, updateHabit, deleteHabit methods
  - Build habit validation system with name sanitization and icon validation
  - Add localStorage integration for habit data persistence with error handling
  - Write unit tests for habit management operations and data validation
  - _Requirements: 3.1, 3.2, 7.1, 7.2_

- [ ] 3. Build habit completion tracking and date management

  - Create DateRangeManager utility for 8-week heatmap date calculations
  - Implement habit completion recording with 0-4 intensity levels
  - Build completion data storage system with efficient date-based indexing
  - Create getCompletionsForDate and getCompletionsForHabit query methods
  - Write unit tests for date calculations and completion data management
  - _Requirements: 1.1, 1.2, 3.3, 7.3_

- [ ] 4. Implement streak calculation and tracking system

  - Create useStreakCalculation hook for real-time streak computation
  - Build streak calculation logic for consecutive completion tracking
  - Implement streak reset logic for missed days and gap handling
  - Add streak persistence and automatic recalculation on data changes
  - Write unit tests for streak calculation edge cases and accuracy
  - _Requirements: 2.1, 2.2, 3.3_

- [ ] 5. Create HabitBar component for top habits display

  - Build HabitBar component showing 3 habits with icons and streak numbers
  - Implement habit cycling functionality to view all habits
  - Add streak number formatting with emoji display ("🔥 7" format)
  - Create smooth transition animations between habit cycles
  - Write unit tests for habit bar display logic and cycling behavior
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [ ] 6. Build HeatmapGrid component with coffee-themed visualization

  - Create HeatmapGrid component with 7×8 grid layout (56 cells)
  - Implement coffee color palette for 5 completion levels (0-4 intensity)
  - Add cell hover tooltips showing habit name, date, and completion level
  - Create responsive cell sizing (12px × 12px) with proper spacing
  - Write unit tests for heatmap rendering and color level calculations
  - _Requirements: 1.1, 1.3, 1.4, 4.4_

- [ ] 7. Implement ActionButtons component with habit management

  - Create ActionButtons component with "+" and "✓" button layout
  - Build inline habit creation modal with name input and icon picker
  - Implement today's completion overlay with 0-4 level selection
  - Add habit limit validation (maximum 6 habits) with user feedback
  - Write unit tests for action button functionality and modal interactions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 8. Add interactive editing and keyboard navigation

  - Implement long press editing for individual heatmap cells
  - Add double-click functionality to create habits for specific dates
  - Create right-click context menu for habit editing and deletion
  - Implement keyboard shortcuts (Space for today's completion)
  - Write unit tests for interactive editing features and keyboard handling
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Create smooth animations and micro-interactions

  - Implement habit completion animation with scale and color transitions
  - Add streak increment count-up animation with celebration effects
  - Create hover animations with gentle lift effects (translateY(-2px))
  - Build fade-in animations for new habit creation
  - Write unit tests for animation state management and performance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Apply container-free styling and visual integration

  - Style widget with warm cream background (#f7f3e9) and 12px rounded corners
  - Implement container-free design matching sticky note aesthetic
  - Add soft drop shadow (0 4px 12px rgba(0,0,0,0.1)) for depth
  - Create typography scale (14px habit names, 16px streak numbers, 10px day labels)
  - Write visual regression tests for design consistency
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 11. Implement comprehensive error handling and empty states

  - Create HabitWidgetErrorBoundary for graceful error recovery
  - Add empty state display with "Start tracking habits" message
  - Implement data corruption detection with automatic reset functionality
  - Create user-friendly error messages for storage quota and validation failures
  - Write unit tests for error scenarios and recovery mechanisms
  - _Requirements: 2.4, 7.4, 7.5_

- [ ] 12. Optimize performance and add accessibility features
  - Implement efficient rendering with memoization for expensive calculations
  - Add ARIA labels and keyboard navigation for screen reader support
  - Create focus management for modal interactions and grid navigation
  - Optimize localStorage usage with data cleanup for old completions
  - Write performance tests ensuring 60fps animations and smooth interactions
  - _Requirements: 5.5, 6.5, 7.1_
