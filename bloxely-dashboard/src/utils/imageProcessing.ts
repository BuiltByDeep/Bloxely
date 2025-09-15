/**
 * Image processing utilities for the Image Collector widget
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface ThumbnailOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
  dataUrl: string;
  thumbnail: string;
  mimeType: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml'
];

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_THUMBNAIL_SIZE = 500 * 1024; // 500KB

/**
 * Validates if a file is a supported image format and within size limits
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check file type
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported file format: ${file.type}. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return {
    isValid: true,
    mimeType: file.type,
    fileSize: file.size
  };
}

/**
 * Validates if a data URL contains a supported image format
 */
export function validateImageDataUrl(dataUrl: string): ImageValidationResult {
  try {
    const [header] = dataUrl.split(',');
    const mimeMatch = header.match(/data:([^;]+)/);
    
    if (!mimeMatch) {
      return {
        isValid: false,
        error: 'Invalid data URL format'
      };
    }

    const mimeType = mimeMatch[1];
    
    if (!SUPPORTED_IMAGE_FORMATS.includes(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported image format: ${mimeType}`
      };
    }

    // Estimate file size from base64 data
    const base64Data = dataUrl.split(',')[1];
    const fileSize = Math.round((base64Data.length * 3) / 4);

    if (fileSize > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Image too large: ${(fileSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    return {
      isValid: true,
      mimeType,
      fileSize
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate image data'
    };
  }
}

/**
 * Generates a compressed thumbnail from an image data URL
 */
export function generateThumbnail(
  dataUrl: string, 
  options: Partial<ThumbnailOptions> = {}
): Promise<string> {
  const defaultOptions: ThumbnailOptions = {
    maxWidth: 150,
    maxHeight: 150,
    quality: 0.8,
    format: 'jpeg'
  };

  const opts = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let { maxWidth, maxHeight } = opts;
        
        if (aspectRatio > 1) {
          // Landscape
          maxHeight = maxWidth / aspectRatio;
        } else {
          // Portrait or square
          maxWidth = maxHeight * aspectRatio;
        }

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the image
        ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

        // Convert to data URL with specified format and quality
        const thumbnailDataUrl = canvas.toDataURL(`image/${opts.format}`, opts.quality);
        
        // Check if thumbnail is within size limits
        const thumbnailSize = Math.round((thumbnailDataUrl.split(',')[1].length * 3) / 4);
        
        if (thumbnailSize > MAX_THUMBNAIL_SIZE) {
          // Reduce quality and try again
          const reducedQuality = Math.max(0.3, opts.quality - 0.2);
          const compressedThumbnail = canvas.toDataURL(`image/${opts.format}`, reducedQuality);
          resolve(compressedThumbnail);
        } else {
          resolve(thumbnailDataUrl);
        }
      } catch (error) {
        reject(new Error(`Failed to generate thumbnail: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail generation'));
    };

    img.src = dataUrl;
  });
}

/**
 * Processes a file and returns image data with thumbnail
 */
export function processImageFile(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        
        if (!dataUrl) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Validate the data URL
        const dataValidation = validateImageDataUrl(dataUrl);
        if (!dataValidation.isValid) {
          reject(new Error(dataValidation.error));
          return;
        }

        // Generate thumbnail
        const thumbnail = await generateThumbnail(dataUrl);

        // Get image dimensions
        const dimensions = await getImageDimensions(dataUrl);

        resolve({
          dataUrl,
          thumbnail,
          mimeType: validation.mimeType!,
          fileSize: validation.fileSize!,
          dimensions
        });
      } catch (error) {
        reject(new Error(`Failed to process image: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Gets the dimensions of an image from a data URL
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for dimension calculation'));
    };

    img.src = dataUrl;
  });
}

/**
 * Compresses an image if it's too large
 */
export async function compressImageIfNeeded(
  dataUrl: string, 
  maxSize: number = MAX_FILE_SIZE
): Promise<string> {
  const validation = validateImageDataUrl(dataUrl);
  
  if (!validation.isValid || !validation.fileSize) {
    throw new Error(validation.error || 'Invalid image data');
  }

  // If image is within size limits, return as-is
  if (validation.fileSize <= maxSize) {
    return dataUrl;
  }

  // Compress the image
  const img = new Image();
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate compression ratio
      const compressionRatio = Math.sqrt(maxSize / validation.fileSize!);
      const newWidth = Math.floor(img.width * compressionRatio);
      const newHeight = Math.floor(img.height * compressionRatio);

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Try different quality levels until we get under the size limit
      let quality = 0.8;
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      let compressedSize = Math.round((compressedDataUrl.split(',')[1].length * 3) / 4);

      while (compressedSize > maxSize && quality > 0.1) {
        quality -= 0.1;
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        compressedSize = Math.round((compressedDataUrl.split(',')[1].length * 3) / 4);
      }

      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataUrl;
  });
}

/**
 * Estimates storage usage for an array of images
 */
export function calculateStorageUsage(images: Array<{ dataUrl: string; thumbnail: string }>): {
  totalSize: number;
  formattedSize: string;
  imageCount: number;
} {
  const totalSize = images.reduce((total, image) => {
    const imageSize = Math.round((image.dataUrl.split(',')[1].length * 3) / 4);
    const thumbnailSize = Math.round((image.thumbnail.split(',')[1].length * 3) / 4);
    return total + imageSize + thumbnailSize;
  }, 0);

  const formattedSize = formatFileSize(totalSize);

  return {
    totalSize,
    formattedSize,
    imageCount: images.length
  };
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}