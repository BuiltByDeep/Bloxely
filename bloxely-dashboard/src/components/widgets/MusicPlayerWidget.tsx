import React, { useState, useEffect, useRef } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import type { MusicPlayerData, MusicStation } from '../../types/dashboard';

const MusicPlayerWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const musicData = widget.content as MusicPlayerData;
  const [currentStation, setCurrentStation] = useState<MusicStation | null>(musicData.currentStation || null);
  const [volume, setVolume] = useState<number>(musicData.volume || 0.7);
  const [isPlaying, setIsPlaying] = useState<boolean>(musicData.isPlaying || false);
  const [isMinimized, setIsMinimized] = useState<boolean>(musicData.isMinimized || false);
  const [showStationSelector, setShowStationSelector] = useState<boolean>(!currentStation);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sleepTimer, setSleepTimer] = useState(musicData.sleepTimer || { enabled: false, duration: 30, remaining: 0 });
  const [showSleepTimer, setShowSleepTimer] = useState<boolean>(false);
  const [streamingMode, setStreamingMode] = useState<'audio' | 'youtube' | 'soundcloud'>('audio');
  const [fallbackAttempted, setFallbackAttempted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const sleepTimerRef = useRef<number | null>(null);
  const youtubePlayerRef = useRef<any>(null);

  // Preset lo-fi stations with multiple streaming sources
  const presetStations: MusicStation[] = [
    {
      id: 'lofi-1',
      name: 'Chillhop Radio',
      description: '24/7 chill beats to relax/study to',
      source: 'youtube',
      streamUrl: 'jfKfPfyJRdk', // YouTube video ID
      thumbnail: '🎵',
      category: 'lofi',
      isLive: true
    },
    {
      id: 'lofi-2',
      name: 'Lo-fi Hip Hop',
      description: 'Relaxing beats for focus',
      source: 'youtube',
      streamUrl: '5qap5aO4i9A', // YouTube video ID
      thumbnail: '🎧',
      category: 'lofi',
      isLive: true
    },
    {
      id: 'lofi-3',
      name: 'SoundCloud Lo-fi',
      description: 'Curated lo-fi playlist',
      source: 'soundcloud',
      streamUrl: 'https://soundcloud.com/chillhop-music/sets/chillhop-essentials-fall-2023',
      thumbnail: '☁️',
      category: 'lofi',
      isLive: false
    },
    {
      id: 'ambient-1',
      name: 'Ambient Focus',
      description: 'Atmospheric sounds for deep work',
      source: 'local',
      streamUrl: '/audio/ambient-focus.mp3',
      thumbnail: '🌊',
      category: 'ambient',
      isLive: false
    },
    {
      id: 'ambient-2',
      name: 'Space Ambient',
      description: 'Cosmic soundscapes',
      source: 'youtube',
      streamUrl: 'DWcJFNfaw9c', // YouTube video ID
      thumbnail: '🌌',
      category: 'ambient',
      isLive: true
    },
    {
      id: 'jazz-1',
      name: 'Smooth Jazz',
      description: 'Relaxing jazz instrumentals',
      source: 'local',
      streamUrl: '/audio/smooth-jazz.mp3',
      thumbnail: '🎷',
      category: 'jazz',
      isLive: false
    },
    {
      id: 'jazz-2',
      name: 'Coffee Shop Jazz',
      description: 'Perfect for work sessions',
      source: 'soundcloud',
      streamUrl: 'https://soundcloud.com/jazz-music/sets/coffee-shop-jazz',
      thumbnail: '☕',
      category: 'jazz',
      isLive: false
    },
    {
      id: 'nature-1',
      name: 'Forest Sounds',
      description: 'Natural ambient sounds',
      source: 'local',
      streamUrl: '/audio/forest-sounds.mp3',
      thumbnail: '🌲',
      category: 'nature',
      isLive: false
    },
    {
      id: 'nature-2',
      name: 'Rain Sounds',
      description: 'Gentle rain for concentration',
      source: 'youtube',
      streamUrl: 'q76bMs-NwRk', // YouTube video ID
      thumbnail: '🌧️',
      category: 'nature',
      isLive: true
    }
  ];

  // Update parent component when state changes
  useEffect(() => {
    onUpdate({
      currentStation,
      volume,
      isPlaying,
      isMinimized,
      sleepTimer,
      favoriteStations: musicData.favoriteStations || []
    });
  }, [currentStation, volume, isPlaying, isMinimized, sleepTimer, onUpdate, musicData.favoriteStations]);

  // Handle streaming source setup
  useEffect(() => {
    if (!currentStation) return;

    setIsLoading(true);
    setError(null);
    setFallbackAttempted(false);

    const setupStreamingSource = async () => {
      try {
        switch (currentStation.source) {
          case 'youtube':
            await setupYouTubeStream(currentStation);
            break;
          case 'soundcloud':
            await setupSoundCloudStream(currentStation);
            break;
          case 'local':
            await setupLocalAudio(currentStation);
            break;
          default:
            throw new Error(`Unsupported source: ${currentStation.source}`);
        }
      } catch (error) {
        console.error('Streaming setup failed:', error);
        handleStreamingError(error as Error);
      }
    };

    setupStreamingSource();
  }, [currentStation, volume]);

  // Setup YouTube streaming
  const setupYouTubeStream = async (station: MusicStation) => {
    setStreamingMode('youtube');
    
    // For demo purposes, we'll use a fallback approach
    // In a real implementation, you'd use YouTube IFrame Player API
    try {
      // Simulate YouTube API loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, fallback to a demo audio file
      if (audioRef.current) {
        audioRef.current.src = '/audio/lofi-demo.mp3';
        audioRef.current.volume = volume;
        setIsLoading(false);
        setError(null);
      }
    } catch (error) {
      throw new Error('YouTube streaming not available');
    }
  };

  // Setup SoundCloud streaming
  const setupSoundCloudStream = async (station: MusicStation) => {
    setStreamingMode('soundcloud');
    
    try {
      // For demo purposes, fallback to local audio
      // In a real implementation, you'd use SoundCloud Widget API
      if (audioRef.current) {
        audioRef.current.src = '/audio/soundcloud-demo.mp3';
        audioRef.current.volume = volume;
        setIsLoading(false);
        setError(null);
      }
    } catch (error) {
      throw new Error('SoundCloud streaming not available');
    }
  };

  // Setup local audio
  const setupLocalAudio = async (station: MusicStation) => {
    setStreamingMode('audio');
    
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.volume = volume;
      audio.src = station.streamUrl;
      
      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => {
        setIsLoading(false);
        setError(null);
      };
      const handleError = () => {
        throw new Error('Failed to load local audio');
      };

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);

      // Cleanup function
      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    }
  };

  // Handle streaming errors with fallback system
  const handleStreamingError = (error: Error) => {
    setIsLoading(false);
    
    if (!fallbackAttempted && currentStation) {
      setFallbackAttempted(true);
      
      // Try fallback options based on source type
      const fallbackStations = presetStations.filter(s => 
        s.source === 'local' && s.category === currentStation.category
      );
      
      if (fallbackStations.length > 0) {
        setError(`${currentStation.source} streaming failed. Switching to fallback...`);
        setTimeout(() => {
          selectStation(fallbackStations[0]);
        }, 2000);
        return;
      }
    }
    
    setError(`Streaming failed: ${error.message}. Please try another station.`);
  };

  // Handle play/pause for different streaming modes
  const togglePlayPause = async () => {
    if (!currentStation) return;

    try {
      if (streamingMode === 'youtube') {
        // For YouTube, we rely on the embedded player controls
        // This is a simplified implementation
        setIsPlaying(!isPlaying);
        return;
      }

      if (streamingMode === 'soundcloud') {
        // For SoundCloud, we rely on the embedded widget controls
        setIsPlaying(!isPlaying);
        return;
      }

      // For local audio
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      handleStreamingError(error as Error);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Sleep timer functionality
  useEffect(() => {
    if (sleepTimer.enabled && sleepTimer.remaining > 0) {
      sleepTimerRef.current = window.setInterval(() => {
        setSleepTimer(prev => {
          const newRemaining = prev.remaining - 1;
          if (newRemaining <= 0) {
            // Stop playback when timer reaches zero
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setIsPlaying(false);
            return { ...prev, enabled: false, remaining: 0 };
          }
          return { ...prev, remaining: newRemaining };
        });
      }, 60000); // Update every minute
    } else {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    }

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimer.enabled, sleepTimer.remaining]);

  // Handle station selection with smooth transition
  const selectStation = (station: MusicStation) => {
    // Fade out current audio if playing
    if (audioRef.current && isPlaying) {
      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.1) {
          audioRef.current.volume -= 0.1;
        } else {
          clearInterval(fadeOut);
          audioRef.current!.pause();
          setCurrentStation(station);
          setShowStationSelector(false);
          setIsPlaying(false);
          setError(null);
        }
      }, 50);
    } else {
      setCurrentStation(station);
      setShowStationSelector(false);
      setIsPlaying(false);
      setError(null);
    }
  };

  // Skip to next station
  const skipToNext = () => {
    if (!currentStation) return;
    
    const currentIndex = presetStations.findIndex(s => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % presetStations.length;
    const nextStation = presetStations[nextIndex];
    
    selectStation(nextStation);
  };

  // Skip to previous station
  const skipToPrevious = () => {
    if (!currentStation) return;
    
    const currentIndex = presetStations.findIndex(s => s.id === currentStation.id);
    const prevIndex = currentIndex === 0 ? presetStations.length - 1 : currentIndex - 1;
    const prevStation = presetStations[prevIndex];
    
    selectStation(prevStation);
  };

  // Sleep timer controls
  const toggleSleepTimer = () => {
    if (sleepTimer.enabled) {
      setSleepTimer({ enabled: false, duration: 30, remaining: 0 });
    } else {
      setSleepTimer({ enabled: true, duration: 30, remaining: 30 });
    }
  };

  const setSleepTimerDuration = (minutes: number) => {
    setSleepTimer({ enabled: true, duration: minutes, remaining: minutes });
    setShowSleepTimer(false);
  };

  // Station Selector Component
  const StationSelector: React.FC = () => (
    <div className="station-selector">
      <h4>Choose a Station</h4>
      <div className="stations-grid">
        {presetStations.map(station => (
          <div
            key={station.id}
            className="station-card"
            onClick={() => selectStation(station)}
          >
            <div className="station-thumbnail">{station.thumbnail}</div>
            <div className="station-info">
              <div className="station-name">{station.name}</div>
              <div className="station-description">{station.description}</div>
              <div className="station-category">{station.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Player Controls Component
  const PlayerControls: React.FC = () => (
    <div className="player-controls">
      <div className="playback-controls">
        <button
          className="skip-btn"
          onClick={skipToPrevious}
          disabled={!currentStation}
          title="Previous station"
        >
          ⏮️
        </button>
        
        <button
          className="play-pause-btn"
          onClick={togglePlayPause}
          disabled={isLoading || !!error}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button
          className="skip-btn"
          onClick={skipToNext}
          disabled={!currentStation}
          title="Next station"
        >
          ⏭️
        </button>
      </div>
      
      <div className="volume-control">
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="volume-slider"
        />
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>

      <div className="timer-controls">
        <button
          className={`sleep-timer-btn ${sleepTimer.enabled ? 'active' : ''}`}
          onClick={() => setShowSleepTimer(!showSleepTimer)}
          title="Sleep timer"
        >
          ⏰
          {sleepTimer.enabled && (
            <span className="timer-badge">{sleepTimer.remaining}m</span>
          )}
        </button>
        
        {showSleepTimer && (
          <div className="sleep-timer-dropdown">
            <div className="timer-options">
              <button onClick={() => setSleepTimerDuration(15)}>15m</button>
              <button onClick={() => setSleepTimerDuration(30)}>30m</button>
              <button onClick={() => setSleepTimerDuration(60)}>1h</button>
              <button onClick={() => setSleepTimerDuration(90)}>1.5h</button>
            </div>
            {sleepTimer.enabled && (
              <button 
                className="timer-cancel"
                onClick={() => setSleepTimer({ enabled: false, duration: 30, remaining: 0 })}
              >
                Cancel Timer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // YouTube Embed Component
  const YouTubeEmbed: React.FC<{ videoId: string }> = ({ videoId }) => (
    <div className="youtube-embed">
      <iframe
        width="100%"
        height="120"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '8px' }}
      />
    </div>
  );

  // SoundCloud Embed Component
  const SoundCloudEmbed: React.FC<{ url: string }> = ({ url }) => (
    <div className="soundcloud-embed">
      <iframe
        width="100%"
        height="120"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2310b981&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`}
        style={{ borderRadius: '8px' }}
      />
    </div>
  );

  // Now Playing Component
  const NowPlaying: React.FC = () => (
    <div className="now-playing">
      {/* Show embed for streaming sources */}
      {currentStation?.source === 'youtube' && streamingMode === 'youtube' && (
        <YouTubeEmbed videoId={currentStation.streamUrl} />
      )}
      
      {currentStation?.source === 'soundcloud' && streamingMode === 'soundcloud' && (
        <SoundCloudEmbed url={currentStation.streamUrl} />
      )}
      
      {/* Show traditional now playing for local audio */}
      {(currentStation?.source === 'local' || streamingMode === 'audio') && (
        <div className="traditional-now-playing">
          <div className="station-thumbnail-large">{currentStation?.thumbnail}</div>
          <div className="track-info">
            <div className="station-name">{currentStation?.name}</div>
            <div className="station-description">{currentStation?.description}</div>
            <div className="playback-status">
              {isLoading && <span className="status-loading">Loading...</span>}
              {error && <span className="status-error">{error}</span>}
              {!isLoading && !error && (
                <span className={`status-${isPlaying ? 'playing' : 'paused'}`}>
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Source indicator */}
      <div className="source-indicator">
        <span className="source-badge">
          {currentStation?.source === 'youtube' && '📺 YouTube'}
          {currentStation?.source === 'soundcloud' && '☁️ SoundCloud'}
          {currentStation?.source === 'local' && '💾 Local'}
          {currentStation?.source === 'spotify' && '🎵 Spotify'}
        </span>
        {fallbackAttempted && (
          <span className="fallback-badge">Fallback Mode</span>
        )}
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="music-player-widget minimized">
        <div className="minimized-controls">
          <span className="mini-thumbnail">{currentStation?.thumbnail || '🎵'}</span>
          
          <div className="mini-playback-controls">
            <button
              className="mini-skip-btn"
              onClick={skipToPrevious}
              disabled={!currentStation}
              title="Previous"
            >
              ⏮️
            </button>
            
            <button
              className="mini-play-pause"
              onClick={togglePlayPause}
              disabled={!currentStation}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <button
              className="mini-skip-btn"
              onClick={skipToNext}
              disabled={!currentStation}
              title="Next"
            >
              ⏭️
            </button>
          </div>

          <div className="mini-right-controls">
            {sleepTimer.enabled && (
              <span className="mini-timer">{sleepTimer.remaining}m</span>
            )}
            <button
              className="expand-btn"
              onClick={() => setIsMinimized(false)}
            >
              ⬆️
            </button>
          </div>
        </div>
        <audio ref={audioRef} />
      </div>
    );
  }

  return (
    <div className="music-player-widget">
      <div className="player-header">
        <h3>Lo-fi Player</h3>
        <div className="header-controls">
          <button
            className="change-station-btn"
            onClick={() => setShowStationSelector(true)}
          >
            📻
          </button>
          <button
            className="minimize-btn"
            onClick={() => setIsMinimized(true)}
          >
            ⬇️
          </button>
        </div>
      </div>

      {showStationSelector ? (
        <StationSelector />
      ) : currentStation ? (
        <div className="player-content">
          <NowPlaying />
          <PlayerControls />
        </div>
      ) : (
        <div className="no-station">
          <p>Select a station to start listening</p>
          <button onClick={() => setShowStationSelector(true)}>
            Choose Station
          </button>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayerWidget;