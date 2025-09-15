import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImageCollectorWidget from '../components/widgets/ImageCollectorWidget';
import type { WidgetData, ImageCollectorData } from '../types/dashboard';

// Mock the image processing utilities
vi.mock('../utils/imageProcessing', () => ({
  processImageFile: vi.fn(() => Promise.resolve({
    dataUrl: 'data:image/png;base64,mockProcessedImage',
    thumbnail: 'data:image/jpeg;base64,mockThumbnail',
    mimeType: 'image/png',
    fileSize: 1024,
    dimensions: { width: 100, height: 100 }
  })),
  validateImageDataUrl: vi.fn(() => ({
    isValid: true,
    mimeType: 'image/png',
    fileSize: 1024
  })),
  compressImageIfNeeded: vi.fn((dataUrl) => Promise.resolve(dataUrl)),
  calculateStorageUsage: vi.fn(() => ({
    totalSize: 2048,
    formattedSize: '2 KB',
    imageCount: 2
  })),
  formatFileSize: vi.fn((bytes) => `${(bytes / 1024).toFixed(1)} KB`)
}));

const createMockWidget = (images: any[] = []): WidgetData => ({
  id: 'test-image-collector',
  type: 'image-collector',
  content: {
    images,
    maxImages: 20,
    thumbnailSize: 150,
  } as ImageCollectorData,
  config: { title: 'Image Collector' },
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('ImageCollector Integration Tests', () => {
  const mockOnUpdate = vi.fn();
  const mockOnConfigUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnConfigUpdate.mockClear();
  });

  describe('Complete User Workflows', () => {
    it('should handle complete image addition workflow', async () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Should show empty state initially
      expect(screen.getByText('Drop images here or press Ctrl+V')).toBeInTheDocument();
      expect(screen.getByText('Images (0)')).toBeInTheDocument();

      // Simulate file drop
      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText('Processing image...')).toBeInTheDocument();
      });

      // Should update with new image
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('should handle image viewing workflow', () => {
      const mockImages = [
        {
          id: '1',
          name: 'test-image.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Should show image in grid
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'data:image/png;base64,thumb1');

      // Click to open modal
      const imageContainer = image.closest('.cursor-pointer');
      fireEvent.click(imageContainer!);

      // Should show modal with full image
      expect(screen.getByText('test-image.png')).toBeInTheDocument();
      expect(screen.getByText('1.0 KB • PNG')).toBeInTheDocument();
      expect(screen.getByText('1 of 1')).toBeInTheDocument();
    });

    it('should handle image deletion workflow', () => {
      const mockImages = [
        {
          id: '1',
          name: 'test1.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'test2.png',
          dataUrl: 'data:image/png;base64,test2',
          thumbnail: 'data:image/png;base64,thumb2',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Should show both images
      expect(screen.getByText('Images (2)')).toBeInTheDocument();
      expect(screen.getByText('2 KB')).toBeInTheDocument();

      // Delete first image
      const deleteButtons = screen.getAllByText('×');
      fireEvent.click(deleteButtons[0]);

      // Should update with one image removed
      expect(mockOnUpdate).toHaveBeenCalledWith({
        images: [mockImages[1]],
        maxImages: 20,
        thumbnailSize: 150,
      });
    });

    it('should handle clear all workflow', () => {
      const mockImages = [
        {
          id: '1',
          name: 'test1.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Click clear all
      fireEvent.click(screen.getByText('Clear All'));

      // Should clear all images
      expect(mockOnUpdate).toHaveBeenCalledWith({
        images: [],
        maxImages: 20,
        thumbnailSize: 150,
      });
    });
  });

  describe('Modal Navigation', () => {
    it('should navigate between images with arrow keys', () => {
      const mockImages = [
        {
          id: '1',
          name: 'image1.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'image2.png',
          dataUrl: 'data:image/png;base64,test2',
          thumbnail: 'data:image/png;base64,thumb2',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Open modal with first image
      const images = screen.getAllByRole('img');
      fireEvent.click(images[0].closest('.cursor-pointer')!);

      // Should show first image
      expect(screen.getByText('image1.png')).toBeInTheDocument();
      expect(screen.getByText('1 of 2')).toBeInTheDocument();

      // Navigate to next image
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByText('image2.png')).toBeInTheDocument();
      expect(screen.getByText('2 of 2')).toBeInTheDocument();

      // Navigate back to first image
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByText('image1.png')).toBeInTheDocument();
      expect(screen.getByText('1 of 2')).toBeInTheDocument();
    });

    it('should close modal with escape key', () => {
      const mockImages = [
        {
          id: '1',
          name: 'test.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Open modal
      const image = screen.getByRole('img');
      fireEvent.click(image.closest('.cursor-pointer')!);

      // Should show modal
      expect(screen.getByText('test.png')).toBeInTheDocument();

      // Press escape
      fireEvent.keyDown(document, { key: 'Escape' });

      // Modal should be closed
      expect(screen.queryByText('ESC to close')).not.toBeInTheDocument();
    });

    it('should delete image from modal with delete key', () => {
      const mockImages = [
        {
          id: '1',
          name: 'test.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Open modal
      const image = screen.getByRole('img');
      fireEvent.click(image.closest('.cursor-pointer')!);

      // Press delete key
      fireEvent.keyDown(document, { key: 'Delete' });

      // Should delete the image
      expect(mockOnUpdate).toHaveBeenCalledWith({
        images: [],
        maxImages: 20,
        thumbnailSize: 150,
      });
    });
  });

  describe('Drag and Drop Visual Feedback', () => {
    it('should show visual feedback during drag operations', () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');

      // Start drag
      fireEvent.dragOver(dropZone!);

      // Should show drag feedback
      expect(screen.getByText('Drop images to add them')).toBeInTheDocument();

      // End drag
      fireEvent.dragLeave(dropZone!);
    });

    it('should show enhanced empty state styling', () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Should show enhanced empty state
      expect(screen.getByText('Drop images here or press Ctrl+V')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
      expect(screen.getByText('Drop')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });
  });

  describe('Storage Information', () => {
    it('should display storage usage information', () => {
      const mockImages = [
        {
          id: '1',
          name: 'test1.png',
          dataUrl: 'data:image/png;base64,test1',
          thumbnail: 'data:image/png;base64,thumb1',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'test2.png',
          dataUrl: 'data:image/png;base64,test2',
          thumbnail: 'data:image/png;base64,thumb2',
          fileSize: 1024,
          mimeType: 'image/png',
          createdAt: new Date(),
        },
      ];

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Should show storage info
      expect(screen.getByText('Images (2)')).toBeInTheDocument();
      expect(screen.getByText('2 KB')).toBeInTheDocument();
      expect(screen.getByText('18 slots remaining • Ctrl+V to paste')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock processImageFile to throw an error
      const { processImageFile } = await import('../utils/imageProcessing');
      vi.mocked(processImageFile).mockRejectedValueOnce(new Error('Processing failed'));

      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Simulate file drop
      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      // Should handle error gracefully (not crash)
      await waitFor(() => {
        expect(screen.queryByText('Processing image...')).not.toBeInTheDocument();
      });

      // Should not have called onUpdate due to error
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });
});