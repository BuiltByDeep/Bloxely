import React, { useState, useRef, useCallback } from 'react';
import type { BaseWidgetProps } from '../../types/widget';

interface PersonalImageWidgetProps extends BaseWidgetProps {
  widget: {
    content: {
      imageUrl?: string;
    };
  };
}

const PersonalImageWidget: React.FC<PersonalImageWidgetProps> = ({ widget, onUpdate }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const data = widget.content;

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onUpdate({ imageUrl });
    };
    reader.readAsDataURL(file);
  }, [onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    onUpdate({ imageUrl: undefined });
  }, [onUpdate]);

  const handleClick = useCallback(() => {
    // Always trigger file input to allow image replacement
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="personal-image-widget h-full w-full relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {data.imageUrl ? (
        // Display image with remove button
        <div className="w-full h-full relative">
          <img
            src={data.imageUrl}
            alt="Personal image"
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleClick}
            draggable="false"
          />
          {/* Remove button - only shows on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 opacity-0 hover:opacity-100"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        // Empty state - simple upload area
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className={`text-center p-4 border-2 border-dashed rounded-lg transition-all ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400'
          }`}>
            <div className="text-3xl mb-2">🖼️</div>
            <p className="text-sm text-slate-600 font-medium">Click or drag image</p>
            <p className="text-xs text-slate-500 mt-1">to add personal image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalImageWidget;