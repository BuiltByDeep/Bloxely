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
          setIsColorPickerOpen(!isColorPickerOpen);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-black/20 hover:border-black/40 transition-colors z-10 clickable"
        style={{ background: currentColor.gradient }}
        title="Change color"
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-black/60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Color picker dropdown */}
      {isColorPickerOpen && (
        <div className="absolute top-10 right-2 bg-white rounded-lg shadow-lg p-2 z-20 border border-gray-200">
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
                  color === currentColor ? 'border-gray-800' : 'border-gray-300'
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
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Type your note here..."
        className={`w-full h-full resize-none border-none outline-none bg-transparent p-4 pr-10 text-gray-800 placeholder-gray-600 font-medium leading-relaxed ${
          isFocused ? 'ring-2 ring-black/20 ring-inset' : ''
        }`}
        style={{
          minHeight: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(12px, 2.5vw, 16px)',
        }}
      />

      {/* Subtle paper texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0),
            linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.05) 50%, transparent 60%)
          `,
          backgroundSize: '20px 20px, 40px 40px',
        }}
      />

      {/* Corner fold effect */}
      <div 
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none opacity-40"
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
        }}
      />
    </div>
  );
};

export default StickyNoteWidget;