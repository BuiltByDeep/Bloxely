# Requirements Document

## Introduction

This specification extends the existing Bloxely Focus Dashboard with four advanced productivity widgets designed to create a comprehensive lo-fi productivity environment. The new widgets include a Lo-fi Music Streaming Player for ambient focus music, a Priority Matrix for task prioritization using the Eisenhower method, a Habit Streak Tracker for building consistent daily routines, and a Simple Image & Screenshot Collector for visual reference management. These widgets maintain the minimalist aesthetic while adding powerful functionality for deep work sessions.

## Requirements

### Requirement 1

**User Story:** As a user, I want to stream lo-fi music while working so that I can maintain focus with ambient background audio.

#### Acceptance Criteria

1. WHEN the user adds a music player widget THEN the system SHALL display preset lo-fi stations with thumbnails
2. WHEN the user selects a station THEN the system SHALL begin streaming audio from the selected source
3. WHEN the user clicks play/pause THEN the system SHALL control audio playback accordingly
4. WHEN the user adjusts the volume slider THEN the system SHALL change audio volume in real-time
5. WHEN the user switches stations THEN the system SHALL smoothly transition between audio sources
6. WHEN audio is playing THEN the system SHALL display current track information and station name
7. WHEN the user enables sleep timer THEN the system SHALL automatically stop playback after the specified duration
8. WHEN the user minimizes the player THEN the system SHALL show a compact view while maintaining playback controls

### Requirement 2

**User Story:** As a user, I want to organize tasks using the Eisenhower Priority Matrix so that I can focus on what matters most.

#### Acceptance Criteria

1. WHEN the user adds a priority matrix widget THEN the system SHALL display a 2x2 grid with four labeled quadrants
2. WHEN the user adds a task to any quadrant THEN the system SHALL create the task in the specified priority category
3. WHEN the user drags a task between quadrants THEN the system SHALL move the task and update its priority level
4. WHEN tasks exist in quadrants THEN the system SHALL display color-coded backgrounds (red, orange, yellow, gray)
5. WHEN the user hovers over quadrants THEN the system SHALL show task count badges and gentle animations
6. WHEN the user edits a task inline THEN the system SHALL save changes immediately
7. WHEN quadrants contain tasks THEN the system SHALL maintain visual hierarchy with proper spacing

### Requirement 3

**User Story:** As a user, I want to track daily habits with streak visualization so that I can build consistent routines.

#### Acceptance Criteria

1. WHEN the user adds a habit tracker widget THEN the system SHALL display a calendar-style grid for the last 90 days
2. WHEN the user adds a new habit THEN the system SHALL create a trackable daily ritual with completion tracking
3. WHEN the user marks a habit complete THEN the system SHALL update the visual calendar with completion indicator
4. WHEN the user completes habits THEN the system SHALL calculate and display current streak counts
5. WHEN streaks reach milestones THEN the system SHALL show celebration animations
6. WHEN viewing habit history THEN the system SHALL display completion percentages with progress rings
7. WHEN the user removes a habit THEN the system SHALL delete all associated tracking data

### Requirement 4

**User Story:** As a user, I want to collect screenshots and images for reference so that I can organize visual information quickly.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+V with an image in clipboard THEN the system SHALL paste and save the screenshot automatically
2. WHEN the user drags image files onto the widget THEN the system SHALL accept and display them in a grid layout
3. WHEN images are added THEN the system SHALL display them as thumbnails in a 3x3 grid (150px each)
4. WHEN the user clicks a thumbnail THEN the system SHALL open the image in full-size modal view
5. WHEN the user hovers over images THEN the system SHALL show delete button (X) with hover effects
6. WHEN the user clicks delete THEN the system SHALL remove the image from storage and grid
7. WHEN the widget is empty THEN the system SHALL display helpful instructions with drop zone styling
8. WHEN storage reaches 20 images THEN the system SHALL remove oldest images when adding new ones

### Requirement 5

**User Story:** As a user, I want all new widgets to integrate seamlessly with the existing dashboard so that they maintain visual consistency and functionality.

#### Acceptance Criteria

1. WHEN new widgets are added THEN the system SHALL use the existing widget factory and registration system
2. WHEN widgets are displayed THEN the system SHALL maintain the established dark theme and lo-fi color palette
3. WHEN widgets persist data THEN the system SHALL use the existing localStorage persistence system
4. WHEN widgets handle errors THEN the system SHALL use the established error boundary and recovery mechanisms
5. WHEN widgets are resized or moved THEN the system SHALL respect the existing grid layout constraints
6. WHEN widgets are removed THEN the system SHALL clean up resources and update the dashboard state properly

### Requirement 6

**User Story:** As a user, I want the music player to support multiple streaming sources so that I have variety in my focus music options.

#### Acceptance Criteria

1. WHEN the system loads preset stations THEN the system SHALL support YouTube embedded streams for lo-fi content
2. WHEN the system loads preset stations THEN the system SHALL support SoundCloud playlist integration
3. WHEN the system loads preset stations THEN the system SHALL support Spotify Web Player integration (if available)
4. WHEN the system loads preset stations THEN the system SHALL support local audio file playback
5. WHEN streaming fails THEN the system SHALL provide fallback options and error messaging
6. WHEN switching between sources THEN the system SHALL handle different API requirements seamlessly

### Requirement 7

**User Story:** As a user, I want the image collector to handle various image formats and provide visual feedback so that I can work with different types of visual content.

#### Acceptance Criteria

1. WHEN processing images THEN the system SHALL accept common formats (JPG, PNG, GIF, WebP)
2. WHEN images are large THEN the system SHALL generate compressed thumbnails for grid display
3. WHEN drag operations occur THEN the system SHALL provide visual feedback with border highlighting
4. WHEN images are processing THEN the system SHALL show loading states for better user experience
5. WHEN clipboard contains non-image data THEN the system SHALL ignore paste events gracefully
6. WHEN multiple files are dropped THEN the system SHALL process all valid image files simultaneously