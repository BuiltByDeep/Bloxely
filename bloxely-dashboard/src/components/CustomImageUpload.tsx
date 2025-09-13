import React, { useRef, useState } from 'react';
import { useWallpaper } from '../context/WallpaperContext';

interface CustomImageUploadProps {
  onClose: () => void;
}

const CustomImageUpload: React.FC<CustomImageUploadProps> = ({ onClose }) => {
  const { setCustomImage, setWallpaper } = useWallpaper();
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
      onClose();
    }
  };

  const handleRemove = () => {
    setCustomImage(null);
    setWallpaper('dots');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="custom-image-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="custom-image-modal fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {preview ? 'Change Custom Image' : 'Custom Background Image'}
          </h3>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click to change image
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📁</div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Supports JPG, PNG, GIF
                  </p>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            {preview && (
              <>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {preview ? 'Change Image' : 'Apply'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomImageUpload;