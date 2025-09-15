import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import MusicPlayerWidget from '../components/widgets/MusicPlayerWidget';
import type { WidgetData } from '../types/dashboard';

// Mock HTML5 Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  volume: 0.7,
  src: '',
  currentTime: 0,
  duration: 0
};

global.Audio = vi.fn().mockImplementation(() => mockAudio);

Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});

const mockOnUpdate = vi.fn();
const mockOnConfigUpdate = vi.fn();

const createMockWidget = (content: any = {}): WidgetData => ({
  id: 'music-player-1',
  type: 'music-player',
  content: {
    currentStation: null,
    volume: 0.7,
    isPlaying: false,
    isMinimized: false,
    sleepTimer: { enabled: false, duration: 30, remaining: 0 },
    favoriteStations: [],
    ...content
  },
  config: { title: 'Lo-fi Player' },
  createdAt: new Date(),
  updatedAt: new Date()
});

describe('MusicPlayerWidget Advanced Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Skip Functionality', () => {
    it('shows skip buttons when station is selected', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByTitle('Previous station')).toBeInTheDocument();
        expect(screen.getByTitle('Next station')).toBeInTheDocument();
      });
    });

    it('skips to next station when next button is clicked', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select first station (Chillhop Radio)
      const chillhopStation = screen.getByText('Chillhop Radio');
      fireEvent.click(chillhopStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      });
      
      // Click next button
      const nextButton = screen.getByTitle('Next station');
      fireEvent.click(nextButton);
      
      // Should update to next station (Lo-fi Hip Hop)
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStation: expect.objectContaining({
              name: 'Lo-fi Hip Hop'
            })
          })
        );
      });
    });

    it('skips to previous station when previous button is clicked', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select second station (Lo-fi Hip Hop)
      const lofiStation = screen.getByText('Lo-fi Hip Hop');
      fireEvent.click(lofiStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('Lo-fi Hip Hop')).toBeInTheDocument();
      });
      
      // Click previous button
      const prevButton = screen.getByTitle('Previous station');
      fireEvent.click(prevButton);
      
      // Should update to previous station (Chillhop Radio)
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStation: expect.objectContaining({
              name: 'Chillhop Radio'
            })
          })
        );
      });
    });

    it('wraps around when skipping from last to first station', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select last station (Rain Sounds)
      const rainStation = screen.getByText('Rain Sounds');
      fireEvent.click(rainStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('Rain Sounds')).toBeInTheDocument();
      });
      
      // Click next button
      const nextButton = screen.getByTitle('Next station');
      fireEvent.click(nextButton);
      
      // Should wrap to first station (Chillhop Radio)
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStation: expect.objectContaining({
              name: 'Chillhop Radio'
            })
          })
        );
      });
    });

    it('wraps around when skipping from first to last station', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select first station (Chillhop Radio)
      const chillhopStation = screen.getByText('Chillhop Radio');
      fireEvent.click(chillhopStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      });
      
      // Click previous button
      const prevButton = screen.getByTitle('Previous station');
      fireEvent.click(prevButton);
      
      // Should wrap to last station (Rain Sounds)
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStation: expect.objectContaining({
              name: 'Rain Sounds'
            })
          })
        );
      });
    });
  });

  describe('Sleep Timer Functionality', () => {
    it('shows sleep timer button', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station to show controls
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByTitle('Sleep timer')).toBeInTheDocument();
      });
    });

    it('opens sleep timer dropdown when clicked', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        const timerButton = screen.getByTitle('Sleep timer');
        expect(timerButton).toBeInTheDocument();
      });
      
      // Click timer button
      const timerButton = screen.getByTitle('Sleep timer');
      fireEvent.click(timerButton);
      
      // Should show timer options
      expect(screen.getByText('15m')).toBeInTheDocument();
      expect(screen.getByText('30m')).toBeInTheDocument();
      expect(screen.getByText('1h')).toBeInTheDocument();
      expect(screen.getByText('1.5h')).toBeInTheDocument();
    });

    it('sets sleep timer when option is selected', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        const timerButton = screen.getByTitle('Sleep timer');
        fireEvent.click(timerButton);
      });
      
      // Select 30 minute timer
      const thirtyMinButton = screen.getByText('30m');
      fireEvent.click(thirtyMinButton);
      
      // Should update sleep timer
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          sleepTimer: expect.objectContaining({
            enabled: true,
            duration: 30,
            remaining: 30
          })
        })
      );
    });

    it('shows timer badge when timer is active', async () => {
      const widget = createMockWidget({
        sleepTimer: { enabled: true, duration: 30, remaining: 25 }
      });
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('25m')).toBeInTheDocument();
      });
    });

    it('cancels sleep timer when cancel button is clicked', async () => {
      const widget = createMockWidget({
        sleepTimer: { enabled: true, duration: 30, remaining: 25 }
      });
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        const timerButton = screen.getByTitle('Sleep timer');
        fireEvent.click(timerButton);
      });
      
      // Click cancel timer
      const cancelButton = screen.getByText('Cancel Timer');
      fireEvent.click(cancelButton);
      
      // Should disable timer
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          sleepTimer: expect.objectContaining({
            enabled: false,
            duration: 30,
            remaining: 0
          })
        })
      );
    });

    it('stops playback when timer reaches zero', async () => {
      const widget = createMockWidget({
        currentStation: {
          id: 'test',
          name: 'Test Station',
          source: 'local',
          streamUrl: '/test.mp3',
          thumbnail: '🎵',
          description: 'Test',
          category: 'lofi',
          isLive: false
        },
        isPlaying: true,
        sleepTimer: { enabled: true, duration: 1, remaining: 1 }
      });
      
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Fast-forward timer by 1 minute
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      
      // Should stop playback and disable timer
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            isPlaying: false,
            sleepTimer: expect.objectContaining({
              enabled: false,
              remaining: 0
            })
          })
        );
      });
    });
  });

  describe('Minimized Mode Enhancements', () => {
    it('shows skip buttons in minimized mode', () => {
      const widget = createMockWidget({
        isMinimized: true,
        currentStation: {
          id: 'test',
          name: 'Test Station',
          thumbnail: '🎵',
          source: 'local',
          streamUrl: '/test.mp3',
          description: 'Test',
          category: 'lofi',
          isLive: false
        }
      });
      
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      expect(screen.getByTitle('Previous')).toBeInTheDocument();
      expect(screen.getByTitle('Next')).toBeInTheDocument();
    });

    it('shows timer remaining in minimized mode', () => {
      const widget = createMockWidget({
        isMinimized: true,
        currentStation: {
          id: 'test',
          name: 'Test Station',
          thumbnail: '🎵',
          source: 'local',
          streamUrl: '/test.mp3',
          description: 'Test',
          category: 'lofi',
          isLive: false
        },
        sleepTimer: { enabled: true, duration: 30, remaining: 15 }
      });
      
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      expect(screen.getByText('15m')).toBeInTheDocument();
    });

    it('skip buttons work in minimized mode', () => {
      const widget = createMockWidget({
        isMinimized: true,
        currentStation: {
          id: 'lofi-1',
          name: 'Chillhop Radio',
          thumbnail: '🎵',
          source: 'youtube',
          streamUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
          description: '24/7 chill beats to relax/study to',
          category: 'lofi',
          isLive: true
        }
      });
      
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      const nextButton = screen.getByTitle('Next');
      fireEvent.click(nextButton);
      
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStation: expect.objectContaining({
            name: 'Lo-fi Hip Hop'
          })
        })
      );
    });
  });

  describe('Smooth Transitions', () => {
    it('handles station switching with fade transition', async () => {
      const widget = createMockWidget({
        currentStation: {
          id: 'test',
          name: 'Test Station',
          source: 'local',
          streamUrl: '/test.mp3',
          thumbnail: '🎵',
          description: 'Test',
          category: 'lofi',
          isLive: false
        },
        isPlaying: true
      });
      
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Click next button to trigger transition
      const nextButton = screen.getByTitle('Next station');
      fireEvent.click(nextButton);
      
      // Should eventually update to new station
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStation: expect.objectContaining({
              name: 'Chillhop Radio'
            }),
            isPlaying: false // Should pause during transition
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('disables skip buttons when no station is selected', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Should show disabled skip buttons in no-station state
      expect(screen.queryByTitle('Previous station')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Next station')).not.toBeInTheDocument();
    });

    it('handles timer countdown correctly', async () => {
      const widget = createMockWidget({
        sleepTimer: { enabled: true, duration: 3, remaining: 3 }
      });
      
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Advance timer by 2 minutes
      act(() => {
        vi.advanceTimersByTime(120000);
      });
      
      // Should update remaining time
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            sleepTimer: expect.objectContaining({
              remaining: 1
            })
          })
        );
      });
    });
  });
});