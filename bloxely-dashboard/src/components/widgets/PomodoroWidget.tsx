import React, { useState, useEffect, useRef } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import type { PomodoroData } from '../../types/dashboard';

type ColorTheme = 'red' | 'green' | 'black' | 'yellow';

const PomodoroWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const pomodoroData = widget.content as PomodoroData;
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('black');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const workDuration = 25 * 60; // 25 minutes
  const breakDuration = 5 * 60; // 5 minutes

  // Initialize state from props
  useEffect(() => {
    setIsRunning(pomodoroData.isRunning || false);
    setTimeRemaining(pomodoroData.timeRemaining || 25 * 60);
    setMode(pomodoroData.mode || 'work');
    setColorTheme(pomodoroData.colorTheme || 'black');
  }, [pomodoroData.isRunning, pomodoroData.timeRemaining, pomodoroData.mode, pomodoroData.colorTheme]);

  // Update parent component when state changes
  useEffect(() => {
    onUpdate({
      timeRemaining,
      isRunning,
      mode,
      colorTheme,
      workDuration,
      breakDuration,
    });
  }, [timeRemaining, isRunning, mode, colorTheme, workDuration, breakDuration, onUpdate]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer reached zero
            setIsRunning(false);
            playAlarm();
            
            // Switch modes
            if (mode === 'work') {
              setMode('break');
              return breakDuration;
            } else {
              setMode('work');
              return workDuration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, mode, workDuration, breakDuration]);

  // Play alarm sound
  const playAlarm = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800 Hz tone
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle start/pause button
  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  // Handle reset button
  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setTimeRemaining(workDuration);
    } else {
      setTimeRemaining(breakDuration);
    }
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    const totalTime = mode === 'work' ? workDuration : breakDuration;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  // Handle color theme change
  const handleColorChange = (newColor: ColorTheme) => {
    setColorTheme(newColor);
    setShowColorPicker(false);
  };

  // Color theme configurations
  const colorThemes = {
    red: {
      name: 'Red',
      emoji: '🔴',
      gradient: 'linear-gradient(135deg, #f87171, #dc2626, #991b1b)',
      shadow: 'rgba(220, 38, 38, 0.3)',
      hoverShadow: 'rgba(220, 38, 38, 0.4)',
      textColor: 'white',
      buttonColor: '#dc2626'
    },
    green: {
      name: 'Green',
      emoji: '🟢',
      gradient: 'linear-gradient(135deg, #4ade80, #16a34a, #15803d)',
      shadow: 'rgba(22, 163, 74, 0.3)',
      hoverShadow: 'rgba(22, 163, 74, 0.4)',
      textColor: 'white',
      buttonColor: '#16a34a'
    },
    black: {
      name: 'Black',
      emoji: '⚫',
      gradient: 'linear-gradient(135deg, #374151, #1f2937, #111827)',
      shadow: 'rgba(31, 41, 55, 0.3)',
      hoverShadow: 'rgba(31, 41, 55, 0.4)',
      textColor: 'white',
      buttonColor: '#1f2937'
    },
    yellow: {
      name: 'Yellow',
      emoji: '🟡',
      gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
      shadow: 'rgba(245, 158, 11, 0.3)',
      hoverShadow: 'rgba(245, 158, 11, 0.4)',
      textColor: '#1f2937',
      buttonColor: '#f59e0b'
    }
  };

  const currentTheme = colorThemes[colorTheme];

  return (
    <div 
      className={`pomodoro-widget-card pomodoro-theme-${colorTheme}`}
      style={{
        background: currentTheme.gradient,
        boxShadow: `0 8px 25px ${currentTheme.shadow}`,
        color: currentTheme.textColor
      }}
    >
      {/* Color picker button */}
      <div className="pomodoro-color-picker-container">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          onMouseDown={(e) => e.stopPropagation()}
          className="pomodoro-color-picker-btn clickable"
          title="Change color theme"
        >
          🎨
        </button>
        
        {showColorPicker && (
          <div className="pomodoro-color-picker-dropdown">
            {Object.entries(colorThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleColorChange(key as ColorTheme)}
                onMouseDown={(e) => e.stopPropagation()}
                className={`pomodoro-color-option ${colorTheme === key ? 'active' : ''} clickable`}
                title={theme.name}
              >
                {theme.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main container with left-right layout */}
      <div className="pomodoro-content">
        {/* LEFT SIDE - Timer Display */}
        <div className="pomodoro-timer-section">
          {/* Session type indicator */}
          <div 
            className="pomodoro-session-label"
            style={{ color: colorTheme === 'yellow' ? currentTheme.textColor : 'rgba(255, 255, 255, 0.8)' }}
          >
            {mode === 'work' ? 'WORK' : 'BREAK'}
          </div>
          
          {/* Large timer display */}
          <div 
            className="pomodoro-time-display"
            style={{ color: currentTheme.textColor }}
          >
            {formatTime(timeRemaining)}
          </div>
          
          {/* Progress bar */}
          <div className="pomodoro-progress-container">
            <div 
              className="pomodoro-progress-bar"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* RIGHT SIDE - Control Buttons */}
        <div className="pomodoro-controls-section">
          <button
            onClick={handleStartPause}
            onMouseDown={(e) => e.stopPropagation()}
            className={`pomodoro-control-btn pomodoro-primary-btn ${
              isRunning ? 'pomodoro-pause-btn' : 'pomodoro-start-btn'
            } clickable`}
            style={{
              background: isRunning
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white'
            }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={handleReset}
            onMouseDown={(e) => e.stopPropagation()}
            className="pomodoro-control-btn pomodoro-reset-btn clickable"
            style={{
              background: colorTheme === 'yellow' ? 'rgba(31, 41, 55, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              color: currentTheme.textColor,
              border: `1px solid ${colorTheme === 'yellow' ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`
            }}
          >
            Reset
          </button>
          
          {/* Status indicator */}
          <div className={`pomodoro-status-indicator ${isRunning ? 'running' : 'paused'}`}>
            <div className="pomodoro-status-dot" />
            <span 
              className="pomodoro-status-text"
              style={{ color: colorTheme === 'yellow' ? currentTheme.textColor : 'rgba(255, 255, 255, 0.8)' }}
            >
              {isRunning ? 'Running' : 'Paused'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroWidget;