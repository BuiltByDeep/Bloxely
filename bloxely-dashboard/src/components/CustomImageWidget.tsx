import React, { useRef, useState } from 'react';
import { useWallpaper } from '../context/WallpaperContext';
import type { BaseWidgetProps } from '../types';

interface CustomImageWidgetProps extends BaseWidgetProps {
  onClose?: () => void;
}

const CustomImageWidget: React.FC<CustomImageWidgetProps> = () => {
  const { setCustomImage, setWallpaper, customImageUrl } = useWallpaper();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleApply = () => {
    if (preview) {
      setCustomImage(preview);
      setWallpaper('custom');
      setPreview(null); // Clear preview after applying
    }
  };

  const handleRemove = () => {
    setCustomImage(null);
    setWallpaper('dots');
    setPreview(null); // Clear preview
  };

  const handleAreaClick = () => {
    // Only trigger file input if there's no image or preview
    if (!customImageUrl && !preview) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="custom-wallpaper-widget h-full w-full flex flex-col p-3 md:p-4">
      {/* Upload Area */}
      <div
        className={`flex-1 border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md min-h-[200px] relative ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : customImageUrl
            ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
            : preview
            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        {/* Remove button for uploaded images */}
        {(customImageUrl || preview) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Change button for uploaded images */}
        {customImageUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute top-2 left-2 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            title="Change image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {/* Image Preview or Icon */}
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          {customImageUrl ? (
            <div className="w-full h-full max-h-[150px] md:max-h-[200px] flex items-center justify-center">
              <img
                src={customImageUrl}
                alt="Current custom background"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : preview ? (
            <div className="w-full h-full max-h-[150px] md:max-h-[200px] flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-dashed border-slate-400 dark:border-slate-500 flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm rounded-full mx-auto">
                <span className="text-2xl md:text-3xl">📷</span>
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className="text-center space-y-1 mt-3 md:mt-4">
            <h3 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
              {customImageUrl ? 'Custom Image Active' : preview ? 'Preview Ready' : 'Upload Custom Image'}
            </h3>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              {customImageUrl
                ? 'Use buttons above to change or remove'
                : preview
                ? 'Click apply button below to set as wallpaper'
                : 'Drag and drop or click to browse'
              }
            </p>

            {isDragging && (
              <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                Drop to upload
              </p>
            )}

            {!customImageUrl && !preview && !isDragging && (
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Supports JPG, PNG, GIF
              </p>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-4">
        <button
          onClick={handleRemove}
          disabled={!customImageUrl && !preview}
          className={`py-2 px-3 md:px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm md:text-base ${
            customImageUrl || preview
              ? 'text-red-600 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-slate-400 border border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          Remove
        </button>
        {preview && (
          <button
            onClick={handleApply}
            className="py-2 px-3 md:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm md:text-base flex-1"
          >
            Apply Image
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomImageWidget;