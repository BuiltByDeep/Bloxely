import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateImageFile,
  validateImageDataUrl,
  generateThumbnail,
  processImageFile,
  getImageDimensions,
  compressImageIfNeeded,
  calculateStorageUsage,
  formatFileSize,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE
} from '../utils/imageProcessing';

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockThumbnail'),
  width: 0,
  height: 0,
};

// Mock Image constructor
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  width: 100,
  height: 100,
};

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(function(this: any) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/png;base64,mockImageData' } });
      }
    }, 0);
  }),
  onload: null as ((event: any) => void) | null,
  onerror: null as (() => void) | null,
};

beforeEach(() => {
  // Mock document.createElement for canvas
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas as any;
    }
    return document.createElement(tagName);
  });

  // Mock Image constructor
  global.Image = vi.fn(() => mockImage) as any;

  // Mock FileReader
  global.FileReader = vi.fn(() => mockFileReader) as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Image Processing Utilities', () => {
  describe('validateImageFile', () => {
    it('should validate supported image formats', () => {
      const validFile = new File(['test'], 'test.png', { type: 'image/png' });
      const result = validateImageFile(validFile);
      
      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/png');
      expect(result.fileSize).toBe(4); // 'test' as bytes
    });

    it('should reject unsupported file formats', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateImageFile(invalidFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['x'.repeat(MAX_FILE_SIZE + 1)], 'large.png', { type: 'image/png' });
      const result = validateImageFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File too large');
    });

    it('should validate all supported formats', () => {
      SUPPORTED_IMAGE_FORMATS.forEach(format => {
        const file = new File(['test'], `test.${format.split('/')[1]}`, { type: format });
        const result = validateImageFile(file);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateImageDataUrl', () => {
    it('should validate valid image data URLs', () => {
      const validDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const result = validateImageDataUrl(validDataUrl);
      
      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/png');
    });

    it('should reject invalid data URL format', () => {
      const invalidDataUrl = 'invalid-data-url';
      const result = validateImageDataUrl(invalidDataUrl);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data URL format');
    });

    it('should reject unsupported image formats in data URL', () => {
      const unsupportedDataUrl = 'data:image/tiff;base64,somedata';
      const result = validateImageDataUrl(unsupportedDataUrl);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
    });

    it('should estimate file size from base64 data', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const result = validateImageDataUrl(dataUrl);
      
      expect(result.isValid).toBe(true);
      expect(result.fileSize).toBeGreaterThan(0);
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with default options', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const thumbnailPromise = generateThumbnail(dataUrl);
      
      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const thumbnail = await thumbnailPromise;
      expect(thumbnail).toBe('data:image/jpeg;base64,mockThumbnail');
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should generate thumbnail with custom options', async () => {
      const dataUrl = 'data:image/png;base64,test';
      const options = {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.9,
        format: 'png' as const
      };
      
      const thumbnailPromise = generateThumbnail(dataUrl, options);
      
      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      await thumbnailPromise;
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.9);
    });

    it('should handle image load errors', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const thumbnailPromise = generateThumbnail(dataUrl);
      
      // Trigger image error
      if (mockImage.onerror) {
        mockImage.onerror();
      }
      
      await expect(thumbnailPromise).rejects.toThrow('Failed to load image');
    });

    it('should calculate aspect ratio correctly for landscape images', async () => {
      mockImage.width = 200;
      mockImage.height = 100;
      
      const dataUrl = 'data:image/png;base64,test';
      const thumbnailPromise = generateThumbnail(dataUrl, { maxWidth: 150, maxHeight: 150 });
      
      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      await thumbnailPromise;
      expect(mockCanvas.width).toBe(150);
      expect(mockCanvas.height).toBe(75); // 150 / 2 (aspect ratio)
    });

    it('should calculate aspect ratio correctly for portrait images', async () => {
      mockImage.width = 100;
      mockImage.height = 200;
      
      const dataUrl = 'data:image/png;base64,test';
      const thumbnailPromise = generateThumbnail(dataUrl, { maxWidth: 150, maxHeight: 150 });
      
      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      await thumbnailPromise;
      expect(mockCanvas.width).toBe(75); // 150 / 2 (aspect ratio)
      expect(mockCanvas.height).toBe(150);
    });
  });

  describe('getImageDimensions', () => {
    it('should return image dimensions', async () => {
      mockImage.width = 300;
      mockImage.height = 200;
      
      const dataUrl = 'data:image/png;base64,test';
      const dimensionsPromise = getImageDimensions(dataUrl);
      
      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const dimensions = await dimensionsPromise;
      expect(dimensions).toEqual({ width: 300, height: 200 });
    });

    it('should handle image load errors', async () => {
      const dataUrl = 'data:image/png;base64,test';
      const dimensionsPromise = getImageDimensions(dataUrl);
      
      // Trigger image error
      if (mockImage.onerror) {
        mockImage.onerror();
      }
      
      await expect(dimensionsPromise).rejects.toThrow('Failed to load image');
    });
  });

  describe('processImageFile', () => {
    it('should process valid image file', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      const processPromise = processImageFile(file);
      
      // Trigger FileReader onload
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: 'data:image/png;base64,mockImageData' } });
        }
        // Trigger Image onload for thumbnail generation
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);
      
      const result = await processPromise;
      
      expect(result.dataUrl).toBe('data:image/png;base64,mockImageData');
      expect(result.thumbnail).toBe('data:image/jpeg;base64,mockThumbnail');
      expect(result.mimeType).toBe('image/png');
      expect(result.fileSize).toBe(4);
      expect(result.dimensions).toEqual({ width: 100, height: 100 });
    });

    it('should reject invalid files', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await expect(processImageFile(file)).rejects.toThrow('Unsupported file format');
    });

    it('should handle FileReader errors', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      const processPromise = processImageFile(file);
      
      // Trigger FileReader error
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror();
        }
      }, 0);
      
      await expect(processPromise).rejects.toThrow('Failed to read file');
    });
  });

  describe('calculateStorageUsage', () => {
    it('should calculate storage usage for images', () => {
      const images = [
        {
          dataUrl: 'data:image/png;base64,dGVzdA==', // 'test' in base64
          thumbnail: 'data:image/jpeg;base64,dGVzdA==' // 'test' in base64
        },
        {
          dataUrl: 'data:image/png;base64,dGVzdA==',
          thumbnail: 'data:image/jpeg;base64,dGVzdA=='
        }
      ];
      
      const result = calculateStorageUsage(images);
      
      expect(result.imageCount).toBe(2);
      expect(result.totalSize).toBeGreaterThan(0);
      expect(result.formattedSize).toContain('B');
    });

    it('should handle empty image array', () => {
      const result = calculateStorageUsage([]);
      
      expect(result.imageCount).toBe(0);
      expect(result.totalSize).toBe(0);
      expect(result.formattedSize).toBe('0 B');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal places correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2560)).toBe('2.5 KB');
      expect(formatFileSize(1024 * 1.5)).toBe('1.5 KB');
    });
  });

  describe('compressImageIfNeeded', () => {
    it('should return original image if within size limits', async () => {
      const smallDataUrl = 'data:image/png;base64,dGVzdA=='; // Small image
      
      const result = await compressImageIfNeeded(smallDataUrl);
      expect(result).toBe(smallDataUrl);
    });

    it('should compress large images', async () => {
      // Create a mock large data URL
      const largeBase64 = 'x'.repeat(MAX_FILE_SIZE / 2); // Large enough to trigger compression
      const largeDataUrl = `data:image/png;base64,${largeBase64}`;
      
      mockImage.width = 2000;
      mockImage.height = 2000;
      
      const compressPromise = compressImageIfNeeded(largeDataUrl, 1000);
      
      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const result = await compressPromise;
      expect(result).toBe('data:image/jpeg;base64,mockThumbnail');
    });

    it('should handle invalid image data', async () => {
      const invalidDataUrl = 'invalid-data-url';
      
      await expect(compressImageIfNeeded(invalidDataUrl)).rejects.toThrow();
    });
  });
});