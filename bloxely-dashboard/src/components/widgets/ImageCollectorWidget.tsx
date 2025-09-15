import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import type { ImageCollectorData, SavedImage } from '../../types/dashboard';
import { 
  processImageFile, 
  validateImageDataUrl, 
  compressImageIfNeeded,
  calculateStorageUsage,
  formatFileSize 
} from '../../utils/imageProcessing';

const ImageCollectorWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate, onConfigUpdate }) => {
  const data = widget.content as ImageCollectorData;
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  // Save image from data URL
  const saveImageFromDataUrl = useCallback(async (dataUrl: string, fileName?: string) => {
    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingFile(fileName || 'pasted image');
    
    try {
      // Step 1: Validate the image data (20% progress)
      setProcessingProgress(20);
      const validation = validateImageDataUrl(dataUrl);
      if (!validation.isValid) {
        throw new Error(`Invalid image: ${validation.error}`);
      }

      // Step 2: Compress if needed (50% progress)
      setProcessingProgress(50);
      const compressedDataUrl = await compressImageIfNeeded(dataUrl);
      
      // Step 3: Process the image to get thumbnail and metadata (80% progress)
      setProcessingProgress(80);
      const processedImage = await processImageFile(
        new File([dataUrl], fileName || 'pasted-image.png', { type: validation.mimeType! })
      );
      
      const newImage: SavedImage = {
        id: Date.now().toString(),
        name: fileName || `Image_${new Date().toISOString().slice(0, 10)}_${Date.now()}`,
        dataUrl: compressedDataUrl,
        thumbnail: processedImage.thumbnail,
        fileSize: validation.fileSize!,
        mimeType: validation.mimeType!,
        createdAt: new Date(),
      };

      let updatedImages = [newImage, ...data.images];
      
      // Step 4: Complete (100% progress)
      setProcessingProgress(100);
      
      // Remove oldest images if exceeding maxImages limit
      if (updatedImages.length > data.maxImages) {
        updatedImages = updatedImages.slice(0, data.maxImages);
      }

      onUpdate({
        ...data,
        images: updatedImages,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      setError(errorMessage);
      setProcessingProgress(0);
    } finally {
      setIsProcessing(false);
      setProcessingFile(null);
      // Clear progress after a delay
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  }, [data, onUpdate]);

  // Save image from file
  const saveImageFromFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingFile(file.name);
    
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image file.');
      }
      
      setProcessingProgress(30);
      const processedImage = await processImageFile(file);
      
      setProcessingProgress(80);
      const newImage: SavedImage = {
        id: Date.now().toString(),
        name: file.name,
        dataUrl: processedImage.dataUrl,
        thumbnail: processedImage.thumbnail,
        fileSize: processedImage.fileSize,
        mimeType: processedImage.mimeType,
        createdAt: new Date(),
      };

      let updatedImages = [newImage, ...data.images];
      
      // Remove oldest images if exceeding maxImages limit
      if (updatedImages.length > data.maxImages) {
        updatedImages = updatedImages.slice(0, data.maxImages);
      }

      setProcessingProgress(100);
      onUpdate({
        ...data,
        images: updatedImages,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      setProcessingProgress(0);
    } finally {
      setIsProcessing(false);
      setProcessingFile(null);
      // Clear progress after a delay
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  }, [data, onUpdate]);

  // Handle clipboard paste
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          saveImageFromFile(new File([blob], `Screenshot_${Date.now()}.png`, { type: blob.type }));
        }
      }
    }
  }, [saveImageFromFile]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Process files sequentially to avoid overwhelming the system
    imageFiles.forEach((file, index) => {
      setTimeout(() => {
        saveImageFromFile(file);
      }, index * 100); // Stagger processing by 100ms
    });
  }, [saveImageFromFile]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  // Delete image with memory cleanup
  const deleteImage = useCallback((imageId: string) => {
    // Clean up image reference for memory management
    const imageRef = imageRefs.current.get(imageId);
    if (imageRef) {
      imageRef.src = '';
      imageRefs.current.delete(imageId);
    }
    
    const updatedImages = data.images.filter(img => img.id !== imageId);
    onUpdate({
      ...data,
      images: updatedImages,
    });
  }, [data, onUpdate]);

  // Navigate between images in modal
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (!selectedImage || data.images.length <= 1) return;
    
    const currentIndex = data.images.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : data.images.length - 1;
    } else {
      newIndex = currentIndex < data.images.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(data.images[newIndex]);
  }, [selectedImage, data.images]);

  // Set up clipboard event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Set up keyboard navigation for modal
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateImage('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateImage('next');
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteImage(selectedImage.id);
          // Close modal if this was the last image or navigate to next
          if (data.images.length <= 1) {
            setSelectedImage(null);
          } else {
            navigateImage('next');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, navigateImage, deleteImage, data.images.length]);

  const isEmpty = data.images.length === 0;
  const storageInfo = calculateStorageUsage(data.images);

  return (
    <div className="h-full bg-slate-800 rounded-lg p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Images ({data.images.length})</span>
            {!isEmpty && (
              <span className="text-xs text-slate-400">{storageInfo.formattedSize}</span>
            )}
          </div>
        </div>
        {data.images.length > 0 && (
          <button
            onClick={() => onUpdate({ ...data, images: [] })}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Loading State */}
      {isProcessing && (
        <div className="mb-4 bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
            <div className="flex-1">
              <div className="text-sm text-slate-200 mb-1">
                Processing {processingFile}...
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-400 hover:text-red-300 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone / Image Grid */}
      <div
        ref={dropZoneRef}
        className={`flex-1 relative ${
          isEmpty ? 'flex items-center justify-center' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isEmpty ? (
          // Empty State
          <div
            className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
              isDragOver
                ? 'border-blue-400 bg-blue-400/10 scale-105'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
            }`}
          >
            <div className={`text-5xl mb-3 transition-transform duration-300 ${isDragOver ? 'scale-110' : 'opacity-60'}`}>
              📷
            </div>
            <p className="text-sm text-slate-300 text-center mb-2 font-medium">
              Drop images here or press Ctrl+V
            </p>
            <p className="text-xs text-slate-500 text-center mb-3">
              Supports JPG, PNG, GIF, WebP, BMP, SVG • Max 10MB
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <span>📋</span>
                <span>Paste</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📁</span>
                <span>Drop</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🖼️</span>
                <span>View</span>
              </div>
            </div>
          </div>
        ) : (
          // Image Grid
          <div className="grid grid-cols-3 gap-2 h-full overflow-auto">
            {data.images.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-square bg-slate-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer hover:scale-105"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.thumbnail}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform"
                />
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(image.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-sm font-bold shadow-lg"
                >
                  ×
                </button>

                {/* View Icon */}
                <div className="absolute top-2 left-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  <span className="text-xs">👁</span>
                </div>

                {/* Image Info on Hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate font-medium">{image.name}</p>
                  <p className="text-xs text-slate-300">
                    {formatFileSize(image.fileSize)} • {image.mimeType.split('/')[1].toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-400/20 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-blue-200 font-medium">Drop images to add them</p>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-slate-200">Processing image...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isEmpty && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          {data.maxImages - data.images.length} slots remaining • Ctrl+V to paste
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-full bg-slate-800 rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-700 border-b border-slate-600">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-white truncate">{selectedImage.name}</h3>
                <p className="text-sm text-slate-300">
                  {formatFileSize(selectedImage.fileSize)} • {selectedImage.mimeType.split('/')[1].toUpperCase()} • 
                  Added {selectedImage.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => deleteImage(selectedImage.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="relative p-4 max-h-[70vh] overflow-auto">
              <img
                src={selectedImage.dataUrl}
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain mx-auto rounded"
              />
              
              {/* Navigation Arrows */}
              {data.images.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-700 border-t border-slate-600 text-center">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {data.images.findIndex(img => img.id === selectedImage.id) + 1} of {data.images.length}
                </span>
                <span>
                  ESC to close • ← → to navigate • DEL to delete
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCollectorWidget;