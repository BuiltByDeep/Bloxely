import React, { useRef, useState } from 'react';
import { useWallpaper } from '../context/WallpaperContext';
import type { BaseWidgetProps } from '../types/widget';

interface CustomImageWidgetProps extends BaseWidgetProps {
  onClose?: () => void;
}

const CustomImageWidget: React.FC<CustomImageWidgetProps> = ({ widget, onUpdate, onConfigUpdate, onClose }) => {
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

  return (
    <div className="custom-image-widget h-full w-full">
      {/* Single Clean Upload Area that handles all states */}
      <div
        className={`w-full h-full border-2 border-dashed rounded-xl text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center shadow-sm hover:shadow-md ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : customImageUrl
            ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
            : preview
            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/70'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Icon */}
        <div className="icon-container mb-4">
          {customImageUrl ? (
            <div className="overflow-hidden border-2 border-green-500 shadow-sm">
              <img
                src={customImageUrl}
                alt="Current custom background"
                className="w-full h-full object-cover"
              />
            </div>
          ) : preview ? (
            <div className="overflow-hidden border-2 border-blue-500 shadow-sm">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-400 dark:border-slate-500 flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm rounded-full">
              <span>📷</span>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {customImageUrl ? 'Custom Image Active' : preview ? 'Preview Ready' : 'Upload Custom Image'}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            {customImageUrl
              ? 'Click to change image'
              : preview
              ? 'Click to apply this image'
              : 'Drag and drop or click to browse'
            }
          </p>

          {isDragging && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
              Drop to upload
            </p>
          )}

          {!customImageUrl && !preview && !isDragging && (
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Supports JPG, PNG, GIF
            </p>
          )}
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
      <div className="action-buttons flex gap-3 mt-4 w-full">
        <button
          onClick={handleRemove}
          disabled={!customImageUrl && !preview}
          className={`action-button flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
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
            className="action-button flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            Apply Image
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomImageWidget;