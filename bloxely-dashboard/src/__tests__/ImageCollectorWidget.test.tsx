import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImageCollectorWidget from '../components/widgets/ImageCollectorWidget';
import type { WidgetData, ImageCollectorData } from '../types/dashboard';

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockThumbnail'),
  width: 0,
  height: 0,
};

// Mock Image constructor
const mockImage = {
  onload: null as (() => void) | null,
  src: '',
  width: 100,
  height: 100,
};

beforeEach(() => {
  // Store original createElement
  const originalCreateElement = document.createElement.bind(document);
  
  // Mock document.createElement for canvas
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas as any;
    }
    return originalCreateElement(tagName);
  });

  // Mock Image constructor
  global.Image = vi.fn(() => mockImage) as any;

  // Mock FileReader
  global.FileReader = vi.fn(() => ({
    readAsDataURL: vi.fn(function(this: any) {
      // Simulate successful file read
      setTimeout(() => {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/png;base64,mockImageData' } });
        }
        // Trigger image onload for thumbnail generation
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);
    }),
    onload: null,
  })) as any;

  // Mock ClipboardEvent for testing
  global.ClipboardEvent = vi.fn((type, init) => ({
    type,
    clipboardData: init?.clipboardData,
    preventDefault: vi.fn(),
  })) as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe('ImageCollectorWidget', () => {
  const mockOnUpdate = vi.fn();
  const mockOnConfigUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnConfigUpdate.mockClear();
  });

  describe('Empty State', () => {
    it('should render empty state when no images', () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      expect(screen.getByText('Images (0)')).toBeInTheDocument();
      expect(screen.getByText('Drop images here or press Ctrl+V')).toBeInTheDocument();
      expect(screen.getByText('Supports JPG, PNG, GIF, WebP')).toBeInTheDocument();
    });

    it('should not show clear all button when empty', () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('should display images in grid when present', () => {
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
          name: 'test2.jpg',
          dataUrl: 'data:image/jpeg;base64,test2',
          thumbnail: 'data:image/jpeg;base64,thumb2',
          fileSize: 2048,
          mimeType: 'image/jpeg',
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

      expect(screen.getByText('Images (2)')).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
      expect(screen.getByText('18 slots remaining • Ctrl+V to paste')).toBeInTheDocument();
      
      // Check images are rendered
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'data:image/png;base64,thumb1');
      expect(images[1]).toHaveAttribute('src', 'data:image/jpeg;base64,thumb2');
    });

    it('should show image info on hover', async () => {
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

      const imageContainer = screen.getByRole('img').closest('.group');
      expect(imageContainer).toBeInTheDocument();
      
      // Image info should be present but hidden initially
      expect(screen.getByText('test-image.png')).toBeInTheDocument();
      expect(screen.getByText('1.0KB')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag over events', () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');
      
      fireEvent.dragOver(dropZone!, {
        dataTransfer: {
          files: [new File([''], 'test.png', { type: 'image/png' })],
        },
      });

      // Should show drag overlay
      expect(screen.getByText('Drop images to add them')).toBeInTheDocument();
    });

    it('should handle file drop', async () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      // Wait for file processing
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.images).toHaveLength(1);
      expect(updateCall.images[0].name).toBe('test.png');
    });

    it('should filter non-image files', async () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');
      const imageFile = new File(['test'], 'test.png', { type: 'image/png' });
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [imageFile, textFile],
        },
      });

      // Wait for file processing
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.images).toHaveLength(1);
      expect(updateCall.images[0].name).toBe('test.png');
    });
  });

  describe('Clipboard Paste', () => {
    it('should handle clipboard paste events', async () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Mock clipboard data
      const mockClipboardData = {
        items: [
          {
            type: 'image/png',
            getAsFile: () => new File(['test'], 'screenshot.png', { type: 'image/png' }),
          },
        ],
      };

      // Simulate paste event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData as any,
      });

      fireEvent(document, pasteEvent);

      // Wait for file processing
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.images).toHaveLength(1);
      expect(updateCall.images[0].name).toContain('Screenshot_');
    });

    it('should ignore non-image clipboard data', () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Mock clipboard data with text
      const mockClipboardData = {
        items: [
          {
            type: 'text/plain',
            getAsFile: () => null,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData as any,
      });

      fireEvent(document, pasteEvent);

      // Should not call onUpdate
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Image Management', () => {
    it('should delete images when delete button clicked', () => {
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

      // Find and click delete button (×)
      const deleteButtons = screen.getAllByText('×');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnUpdate).toHaveBeenCalledWith({
        images: [mockImages[1]], // Should remove first image
        maxImages: 20,
        thumbnailSize: 150,
      });
    });

    it('should clear all images when clear all clicked', () => {
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

      fireEvent.click(screen.getByText('Clear All'));

      expect(mockOnUpdate).toHaveBeenCalledWith({
        images: [],
        maxImages: 20,
        thumbnailSize: 150,
      });
    });

    it('should enforce maximum image limit', async () => {
      // Create widget with 20 images (at limit)
      const mockImages = Array.from({ length: 20 }, (_, i) => ({
        id: i.toString(),
        name: `test${i}.png`,
        dataUrl: `data:image/png;base64,test${i}`,
        thumbnail: `data:image/png;base64,thumb${i}`,
        fileSize: 1024,
        mimeType: 'image/png',
        createdAt: new Date(Date.now() - i * 1000), // Different timestamps
      }));

      const widget = createMockWidget(mockImages);
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      // Add one more image
      const dropZone = screen.getByText('0 slots remaining • Ctrl+V to paste').closest('div')?.parentElement;
      const file = new File(['test'], 'new.png', { type: 'image/png' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.images).toHaveLength(20); // Should still be 20
      expect(updateCall.images[0].name).toBe('new.png'); // New image should be first
    });
  });

  describe('Thumbnail Generation', () => {
    it('should generate thumbnails for images', async () => {
      const widget = createMockWidget();
      
      render(
        <ImageCollectorWidget
          widget={widget}
          onUpdate={mockOnUpdate}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const dropZone = screen.getByText('Drop images here or press Ctrl+V').closest('div');
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      // Trigger image onload
      if (mockImage.onload) {
        mockImage.onload();
      }

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.images[0].thumbnail).toBe('data:image/jpeg;base64,mockThumbnail');
    });
  });
});