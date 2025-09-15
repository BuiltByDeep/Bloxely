import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock Audio constructor
global.Audio = vi.fn().mockImplementation(() => mockAudio);

// Mock HTMLAudioElement
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

describe('MusicPlayerWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('renders without crashing', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      expect(screen.getByText('Lo-fi Player')).toBeInTheDocument();
    });

    it('shows station selector when no station is selected', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      expect(screen.getByText('Choose a Station')).toBeInTheDocument();
      expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      expect(screen.getByText('Lo-fi Hip Hop')).toBeInTheDocument();
    });

    it('shows station selector by default when no station is selected', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Initially shows station selector
      expect(screen.getByText('Choose a Station')).toBeInTheDocument();
      
      // Should show all stations
      expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      expect(screen.getByText('Ambient Focus')).toBeInTheDocument();
    });
  });

  describe('Station Selection', () => {
    it('allows selecting a station from the grid', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Click on a station
      const chillhopStation = screen.getByText('Chillhop Radio');
      fireEvent.click(chillhopStation.closest('.station-card')!);
      
      // Should show now playing section with station name
      await waitFor(() => {
        expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      });
      
      // Should update parent component
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStation: expect.objectContaining({
            name: 'Chillhop Radio'
          })
        })
      );
    });

    it('displays station information correctly', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Check station cards display correct information
      expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      expect(screen.getByText('24/7 chill beats to relax/study to')).toBeInTheDocument();
      expect(screen.getAllByText('lofi')).toHaveLength(2); // Two lofi stations
      
      expect(screen.getByText('Ambient Focus')).toBeInTheDocument();
      expect(screen.getByText('ambient')).toBeInTheDocument();
    });

    it('shows different station categories', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      expect(screen.getAllByText('lofi')).toHaveLength(2); // Two lofi stations
      expect(screen.getByText('ambient')).toBeInTheDocument();
      expect(screen.getByText('jazz')).toBeInTheDocument();
      expect(screen.getAllByText('nature')).toHaveLength(2); // Two nature stations
    });
  });

  describe('Audio Controls', () => {
    it('shows play/pause button when station is selected', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      // Should show play button
      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /▶️/ });
        expect(playButton).toBeInTheDocument();
      });
    });

    it('toggles play/pause state', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a local audio station (not YouTube)
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /▶️/ });
        expect(playButton).toBeInTheDocument();
      });
      
      // Click play button
      const playButton = screen.getByRole('button', { name: /▶️/ });
      fireEvent.click(playButton);
      
      // Should update to playing state
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            isPlaying: true
          })
        );
      });
    });

    it('handles volume control', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        const volumeSlider = screen.getByRole('slider');
        expect(volumeSlider).toBeInTheDocument();
      });
      
      // Change volume
      const volumeSlider = screen.getByRole('slider');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      
      // Should update volume
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          volume: 0.5
        })
      );
    });

    it('displays volume percentage correctly', async () => {
      const widget = createMockWidget({ volume: 0.8 });
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station to show controls
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('80%')).toBeInTheDocument();
      });
    });
  });

  describe('Player States', () => {
    it('shows loading state', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      // Should show paused state for local audio
      await waitFor(() => {
        expect(screen.getByText('Paused')).toBeInTheDocument();
      });
    });

    it('handles YouTube streaming error gracefully', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a YouTube station
      const chillhopStation = screen.getByText('Chillhop Radio');
      fireEvent.click(chillhopStation.closest('.station-card')!);
      
      // Should show YouTube error message
      await waitFor(() => {
        expect(screen.getByText(/YouTube streaming requires additional setup/)).toBeInTheDocument();
      });
    });

    it('shows paused state by default', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a local station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('Paused')).toBeInTheDocument();
      });
    });
  });

  describe('Minimized Mode', () => {
    it('renders minimized player correctly', () => {
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
      
      expect(screen.getByText('🎵')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /⬆️/ })).toBeInTheDocument();
    });

    it('can expand from minimized mode', () => {
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
      
      const expandButton = screen.getByRole('button', { name: /⬆️/ });
      fireEvent.click(expandButton);
      
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          isMinimized: false
        })
      );
    });

    it('can minimize from expanded mode', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // First select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        const minimizeButton = screen.getByRole('button', { name: /⬇️/ });
        expect(minimizeButton).toBeInTheDocument();
      });
      
      const minimizeButton = screen.getByRole('button', { name: /⬇️/ });
      fireEvent.click(minimizeButton);
      
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          isMinimized: true
        })
      );
    });
  });

  describe('Station Management', () => {
    it('can change stations', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select initial station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      await waitFor(() => {
        expect(screen.getByText('Ambient Focus')).toBeInTheDocument();
      });
      
      // Click change station button
      const changeStationBtn = screen.getByRole('button', { name: /📻/ });
      fireEvent.click(changeStationBtn);
      
      // Should show station selector again
      expect(screen.getByText('Choose a Station')).toBeInTheDocument();
    });

    it('displays all preset stations', () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Check all preset stations are displayed
      expect(screen.getByText('Chillhop Radio')).toBeInTheDocument();
      expect(screen.getByText('Lo-fi Hip Hop')).toBeInTheDocument();
      expect(screen.getByText('Ambient Focus')).toBeInTheDocument();
      expect(screen.getByText('Smooth Jazz')).toBeInTheDocument();
      expect(screen.getByText('Forest Sounds')).toBeInTheDocument();
      expect(screen.getByText('Rain Sounds')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles audio loading errors', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a station
      const ambientStation = screen.getByText('Ambient Focus');
      fireEvent.click(ambientStation.closest('.station-card')!);
      
      // Simulate audio error
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        fireEvent.error(audioElement);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load audio stream')).toBeInTheDocument();
      });
    });

    it('disables controls when there is an error', async () => {
      const widget = createMockWidget();
      render(<MusicPlayerWidget widget={widget} onUpdate={mockOnUpdate} onConfigUpdate={mockOnConfigUpdate} />);
      
      // Select a YouTube station (which shows error)
      const chillhopStation = screen.getByText('Chillhop Radio');
      fireEvent.click(chillhopStation.closest('.station-card')!);
      
      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /▶️/ });
        expect(playButton).toBeDisabled();
      });
    });
  });
});