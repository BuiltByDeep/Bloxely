import React, { useState, useRef, useEffect } from 'react';
import { Palette, Move } from 'lucide-react';
import type { BaseWidgetProps } from '../../types/widget';
import type { StickyNoteData, StickyNoteColor } from '../../types/dashboard';

// Predefined color palette with beautiful gradients
const STICKY_NOTE_COLORS: StickyNoteColor[] = [
  { name: 'Yellow', gradient: 'linear-gradient(135deg, #fff59d, #fff176)' },
  { name: 'Pink', gradient: 'linear-gradient(135deg, #f8bbd9, #f48fb1)' },
  { name: 'Blue', gradient: 'linear-gradient(135deg, #81d4fa, #4fc3f7)' },
  { name: 'Green', gradient: 'linear-gradient(135deg, #a5d6a7, #81c784)' },
  { name: 'Orange', gradient: 'linear-gradient(135deg, #ffcc02, #ffab00)' },
  { name: 'Purple', gradient: 'linear-gradient(135deg, #ce93d8, #ba68c8)' },
  { name: 'Mint', gradient: 'linear-gradient(135deg, #80cbc4, #4db6ac)' },
  { name: 'Peach', gradient: 'linear-gradient(135deg, #ffab91, #ff8a65)' },
];

const StickyNoteWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get current data or use defaults
  const currentData = widget.content as StickyNoteData;
  const content = currentData?.content || '';
  const currentColor = currentData?.color || STICKY_NOTE_COLORS[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleContentChange = (newContent: string) => {
    onUpdate({
      content: newContent,
      color: currentColor,
    });
  };

  const handleColorChange = (newColor: StickyNoteColor) => {
    onUpdate({
      content,
      color: newColor,
    });
    setShowColorPicker(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value);
  };

  return (
    <div 
      className="sticky-note-widget h-full w-full relative rounded-lg transition-all duration-200"
      style={{ 
        background: currentColor.gradient
      }}
    >
      {/* Top bar with drag handle and color picker */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-3 z-10">
        {/* Drag handle - left side */}
        <div 
          className="drag-handle flex items-center gap-1 px-2 py-1 rounded-md bg-black/5 hover:bg-black/10 transition-colors duration-200 cursor-move select-none"
          title="Drag to move"
        >
          <Move size={12} className="text-black/60" />
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-black/30 rounded-full"></div>
            <div className="w-1 h-1 bg-black/30 rounded-full"></div>
            <div className="w-1 h-1 bg-black/30 rounded-full"></div>
          </div>
        </div>
        
        {/* Color picker button - right side */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors duration-200"
          title="Change color"
        >
          <Palette size={16} className="text-black/60" />
        </button>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowColorPicker(false)}
          />
          <div className="absolute top-14 right-3 bg-white/95 backdrop-blur-lg border border-white/50 rounded-xl p-3 shadow-2xl z-50 animate-fade-in">
            <div className="grid grid-cols-4 gap-2">
              {STICKY_NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange(color);
                  }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    currentColor.name === color.name 
                      ? 'border-black/40 ring-2 ring-black/20' 
                      : 'border-white/50 hover:border-black/30'
                  }`}
                  style={{ background: color.gradient }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main text area */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextareaChange}
        placeholder="Write your note here..."
        className="w-full h-full pt-10 pb-4 px-4 bg-transparent border-none outline-none resize-none text-black/80 placeholder-black/50 font-medium leading-relaxed rounded-lg"
        style={{
          fontFamily: "'Inter', 'Kalam', cursive",
          fontSize: 'clamp(12px, 2.5vw, 16px)',
          minHeight: '100%',
        }}
        spellCheck={true}
        onMouseDown={(e) => {
          // Allow text selection and editing by preventing drag start
          e.stopPropagation();
        }}
      />
    </div>
  );
};

export default StickyNoteWidget;