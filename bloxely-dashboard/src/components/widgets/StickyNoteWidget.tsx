import React, { useState, useRef, useEffect } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import type { StickyNoteData, StickyNoteColor } from '../../types/dashboard';

// Predefined color palette with gradients
const COLOR_PALETTE: StickyNoteColor[] = [
  { name: 'Yellow', gradient: 'linear-gradient(to bottom right, #fff59d, #fff176)' },
  { name: 'Pink', gradient: 'linear-gradient(to bottom right, #f48fb1, #f06292)' },
  { name: 'Blue', gradient: 'linear-gradient(to bottom right, #81d4fa, #4fc3f7)' },
  { name: 'Orange', gradient: 'linear-gradient(to bottom right, #ffb74d, #ffa726)' },
  { name: 'Green', gradient: 'linear-gradient(to bottom right, #aed581, #9ccc65)' },
  { name: 'Purple', gradient: 'linear-gradient(to bottom right, #ce93d8, #ba68c8)' },
  { name: 'Mint', gradient: 'linear-gradient(to bottom right, #80cbc4, #4db6ac)' },
  { name: 'Peach', gradient: 'linear-gradient(to bottom right, #ffab91, #ff8a65)' },
];

const StickyNoteWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const stickyData = widget.content as StickyNoteData;
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [stickyData.content]);

  // Handle text change with real-time save
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onUpdate({
      ...stickyData,
      content: newContent,
    });
  };

  // Handle color change
  const handleColorChange = (newColor: StickyNoteColor) => {
    console.log('Color changed to:', newColor.name);
    onUpdate({
      ...stickyData,
      color: newColor,
    });
    setIsColorPickerOpen(false);
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const currentColor = stickyData?.color || COLOR_PALETTE[0];
  const currentContent = stickyData?.content || '';

  return (
    <div 
      className="sticky-note-widget h-full relative"
      style={{ background: currentColor.gradient }}
    >
      {/* Color picker button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Color picker button clicked, current state:', isColorPickerOpen);
          setIsColorPickerOpen(!isColorPickerOpen);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute bottom-2 left-2 w-8 h-8 rounded-full border-2 border-white/50 hover:border-white/80 transition-all z-10 clickable hover:scale-110 shadow-lg"
        style={{ background: 'rgba(255, 255, 255, 0.9)' }}
        title="Change color"
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Color picker dropdown */}
      {isColorPickerOpen && (
        <div className="absolute bottom-10 left-2 bg-white rounded-lg shadow-lg p-2 z-50 border border-gray-200">
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PALETTE.map((color, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorChange(color);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                  color.name === currentColor.name ? 'border-gray-800' : 'border-gray-300'
                } clickable`}
                style={{ background: color.gradient }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={currentContent}
        onChange={handleTextChange}
        onFocus={(e) => {
          e.stopPropagation();
          handleFocus();
        }}
        onBlur={handleBlur}
        placeholder="Type your note here..."
        className={`w-full h-full resize-none border-none outline-none bg-transparent p-4 pl-12 pr-4 text-gray-800 placeholder-gray-600 font-medium leading-relaxed relative z-10 ${
          isFocused ? 'ring-2 ring-black/20 ring-inset' : ''
        }`}
        style={{
          minHeight: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(12px, 2.5vw, 16px)',
        }}
      />

      </div>
  );
};

export default StickyNoteWidget;