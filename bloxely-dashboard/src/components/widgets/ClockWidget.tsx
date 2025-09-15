import React, { useState, useEffect } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import type { ClockData } from '../../types/dashboard';

// Background color palette with new colors
const BG_COLOR_PALETTE = [
  { name: 'Sky Blue', value: '#38BDF8' },
  { name: 'Emerald Green', value: '#10B981' },
  { name: 'Amber', value: '#FBBF24' },
  { name: 'Coral Red', value: '#F87171' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Slate Gray', value: '#64748B' },
  { name: 'White', value: '#F9FAFB' },
  { name: 'Charcoal Black', value: '#111827' },
];

const ClockWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const clockData = widget.content as ClockData;

  // Default colors
  const defaultTimeColor = '#ffffff';
  const defaultDateColor = '#d1d5db';
  const defaultBackgroundColor = '#111827';

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time in 12-hour format only
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Toggle date display
  const toggleDateDisplay = () => {
    const currentShowDate = clockData?.showDate ?? true;
    const updatedContent = {
      format: '12h', // Always use 12h format
      showDate: !currentShowDate,
      timeColor: clockData?.timeColor || defaultTimeColor,
      dateColor: clockData?.dateColor || defaultDateColor,
      backgroundColor: backgroundColor, // Use the current backgroundColor value
    };
    onUpdate(updatedContent);
  };

  // Update background color
  const updateBackgroundColor = (backgroundColor: string) => {
    const updatedContent = {
      format: '12h', // Always use 12h format
      showDate: clockData?.showDate ?? true,
      timeColor: clockData?.timeColor ?? defaultTimeColor,
      dateColor: clockData?.dateColor ?? defaultDateColor,
      backgroundColor,
    };
    onUpdate(updatedContent);
  };

  // Handle background color picker toggle
  const toggleBgColorPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBgColorPickerOpen(!isBgColorPickerOpen);
  };

  // Handle background color change
  const handleBackgroundColorChange = (color: string) => {
    updateBackgroundColor(color);
    setIsBgColorPickerOpen(false); // Close the picker after selection
  };

  // Error handling
  if (!currentTime) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div>Loading time...</div>
      </div>
    );
  }

  const showDate = clockData?.showDate ?? true;
  const timeColor = clockData?.timeColor || defaultTimeColor;
  const dateColor = clockData?.dateColor || defaultDateColor;
  const backgroundColor = clockData?.backgroundColor || defaultBackgroundColor;

  return (
    <div
      className={`clock-widget-card h-full ${showDate ? 'with-date' : 'time-only'} relative`}
      style={{ backgroundColor }}
    >
      {/* Background color picker button */}
      <button
        onClick={toggleBgColorPicker}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute bottom-2 left-2 w-6 h-6 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors z-10 clickable bg-color-picker-btn"
        style={{ backgroundColor: backgroundColor }}
        title="Change background color"
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Background color picker dropdown */}
      {isBgColorPickerOpen && (
        <div className="absolute bottom-10 left-2 bg-white rounded-lg shadow-lg p-4 z-20 border border-gray-200 min-w-48 bg-color-picker-dropdown">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="grid grid-cols-4 gap-2">
              {BG_COLOR_PALETTE.map((color, index) => (
                <button
                  key={`bg-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBackgroundColorChange(color.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                    color.value === backgroundColor ? 'border-gray-800' : 'border-gray-300'
                  } clickable bg-color-option`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Display - clickable to toggle */}
      {showDate && (
        <div
          className="clock-date-label clickable"
          onClick={(e) => {
            e.stopPropagation();
            toggleDateDisplay();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          title="Click to hide date"
          style={{ color: dateColor }}
        >
          {formatDate(currentTime)}
        </div>
      )}
      
      {/* Time Display - clickable to show date when hidden */}
      <div
        className="clock-time-text clickable"
        onClick={(e) => {
          e.stopPropagation();
          if (!showDate) {
            toggleDateDisplay();
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        title={showDate ? "Time display" : "Click to show date"}
        style={{ color: timeColor }}
      >
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default ClockWidget;