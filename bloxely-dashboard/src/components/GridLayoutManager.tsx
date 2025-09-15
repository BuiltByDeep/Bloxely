import React, { useState, useCallback, useRef, useEffect } from 'react';

interface FreeLayoutManagerProps {
  children: React.ReactNode;
}

interface WidgetSize {
  id: string;
  width: number;
  height: number;
}

/**
 * Free layout manager that displays widgets with unrestricted movement
 * similar to Miro, using refs for positions to prevent React re-render issues.
 */
const FreeLayoutManager: React.FC<FreeLayoutManagerProps> = ({ children }) => {
  const childArray = React.Children.toArray(children) as React.ReactElement[];
  const [widgetSizes, setWidgetSizes] = useState<WidgetSize[]>([]);
  const widgetPositionsRef = useRef<Record<string, {x: number, y: number}>>({});
  const resizingWidget = useRef<{id: string, startX: number, startY: number, startWidth: number, startHeight: number, element: HTMLElement} | null>(null);
  const draggingWidget = useRef<{id: string, startX: number, startY: number, startLeft: number, startTop: number, element: HTMLElement} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const prevChildrenCountRef = useRef(0);

  // Initialize widget sizes and positions
  React.useEffect(() => {
    const currentChildrenCount = childArray.length;
    
    // Check if we have new widgets
    const hasNewWidgets = currentChildrenCount > prevChildrenCountRef.current;
    
    // Always update for new widgets, but only initialize once for the initial set
    if (!initializedRef.current || hasNewWidgets) {
      const initialSizes: WidgetSize[] = childArray.map((child, idx) => {
        const props: any = child.props || {};
        const widgetId = props.widget?.id || props.widgetId || props['data-widget-id'] || `child-${idx}`;
        
        // Check if we already have a size for this widget
        const existingSize = widgetSizes.find(size => size.id === widgetId);
        if (existingSize) {
          return existingSize;
        }
        
        // Default size
        return {
          id: widgetId,
          width: 300,
          height: 300
        };
      });
      
      setWidgetSizes(initialSizes);
      
      // Initialize positions in ref for new widgets
      childArray.forEach((child, idx) => {
        const props: any = child.props || {};
        const widgetId = props.widget?.id || props.widgetId || props['data-widget-id'] || `child-${idx}`;
        
        // Skip if we already have a position for this widget
        if (widgetPositionsRef.current[widgetId]) {
          return;
        }
        
        // Default position - arrange in a more organic, free-form layout
        const angle = (idx / childArray.length) * 2 * Math.PI;
        const radius = 200 + (idx % 3) * 100;
        const centerX = window.innerWidth / 2 - 150; // Center roughly, accounting for widget width
        const centerY = window.innerHeight / 2 - 150; // Center roughly, accounting for widget height
        
        widgetPositionsRef.current[widgetId] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      });
      
      // Set initial positions directly on DOM elements after a short delay
      setTimeout(() => {
        Object.entries(widgetPositionsRef.current).forEach(([widgetId, position]) => {
          const element = document.getElementById(`widget-${widgetId}`);
          if (element) {
            // Position directly using style for immediate effect
            element.style.left = `${position.x}px`;
            element.style.top = `${position.y}px`;
            
            // Ensure resize handle is properly attached
            const resizeHandle = element.querySelector('.resize-handle');
            if (resizeHandle) {
              // Remove any existing event listeners to prevent duplicates
              const newResizeHandle = resizeHandle.cloneNode(true);
              resizeHandle.parentNode?.replaceChild(newResizeHandle, resizeHandle);
              
              // Add event listener to the new resize handle
              newResizeHandle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                handleResizeStart(e as any, widgetId);
              });
            }
          }
        });
        
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
        
        // Update the previous children count
        prevChildrenCountRef.current = currentChildrenCount;
      }, 100);
    }
  }, [childArray, widgetSizes]);

  const handleResizeStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = document.getElementById(`widget-${widgetId}`);
    if (!element) return;
    
    const widgetSize = widgetSizes.find(size => size.id === widgetId);
    if (!widgetSize) return;
    
    resizingWidget.current = {
      id: widgetId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: widgetSize.width,
      startHeight: widgetSize.height,
      element
    };
    
    // Add class to body to prevent text selection during resize
    document.body.classList.add('resizing');
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [widgetSizes]);

  const handleDragStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = document.getElementById(`widget-${widgetId}`);
    if (!element) return;
    
    // Get current position from our ref
    const position = widgetPositionsRef.current[widgetId] || { x: 0, y: 0 };
    
    draggingWidget.current = {
      id: widgetId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y,
      element
    };
    
    // Add class to body to prevent text selection during drag
    document.body.classList.add('dragging');
    
    // Add dragging class to widget for visual feedback
    element.classList.add('dragging');
    
    // Bring to front
    element.style.zIndex = '1000';
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingWidget.current) return;

    const { startX, startY, startWidth, startHeight, element } = resizingWidget.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Get the current zoom level from the canvas container
    const canvasContainer = element.closest('.canvas-container') as HTMLElement;
    let zoomLevel = 1;
    if (canvasContainer) {
      const transform = window.getComputedStyle(canvasContainer).transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        zoomLevel = matrix.a; // scale factor
      }
    }

    // Adjust delta for zoom level to make resizing feel consistent
    const adjustedDeltaX = deltaX / zoomLevel;
    const adjustedDeltaY = deltaY / zoomLevel;

    const newWidth = Math.max(200, startWidth + adjustedDeltaX);
    const newHeight = Math.max(200, startHeight + adjustedDeltaY);

    // Update size directly on DOM element for immediate feedback
    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;

    // Update state for persistence
    setWidgetSizes(prev =>
      prev.map(size =>
        size.id === resizingWidget.current?.id
          ? { ...size, width: newWidth, height: newHeight }
          : size
      )
    );
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!draggingWidget.current) return;

    const { startX, startY, startLeft, startTop, element, id } = draggingWidget.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Get the current zoom level from the canvas container
    const canvasContainer = element.closest('.canvas-container') as HTMLElement;
    let zoomLevel = 1;
    if (canvasContainer) {
      const transform = window.getComputedStyle(canvasContainer).transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        zoomLevel = matrix.a; // scale factor
      }
    }

    // Adjust delta for zoom level to make movement feel natural
    const adjustedDeltaX = deltaX / zoomLevel;
    const adjustedDeltaY = deltaY / zoomLevel;

    let newLeft = startLeft + adjustedDeltaX;
    let newTop = startTop + adjustedDeltaY;

    // Use viewport dimensions for boundaries to allow movement across entire screen
    const viewportWidth = window.innerWidth / zoomLevel;
    const viewportHeight = window.innerHeight / zoomLevel;
    const elementRect = element.getBoundingClientRect();
    const elementWidth = elementRect.width / zoomLevel;
    const elementHeight = elementRect.height / zoomLevel;

    // Allow movement across entire viewport with more padding at lower zoom levels
    const basePadding = 50;
    const zoomPaddingMultiplier = 100 / zoomLevel; // More padding at lower zoom levels
    const padding = basePadding * zoomPaddingMultiplier;
    const minLeft = -padding;
    const maxLeft = viewportWidth - elementWidth + padding;
    const minTop = -padding;
    const maxTop = viewportHeight - elementHeight + padding;

    newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
    newTop = Math.max(minTop, Math.min(maxTop, newTop));

    // Update position directly on DOM element for immediate feedback
    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;

    // Also update our ref to keep track of the position
    widgetPositionsRef.current[id] = { x: newLeft, y: newTop };
  }, []);

  const handleResizeEnd = useCallback(() => {
    if (!resizingWidget.current) return;
    
    const { element, id, startWidth, startHeight } = resizingWidget.current;
    resizingWidget.current = null;
    
    // Remove class from body
    document.body.classList.remove('resizing');
    
    // Remove resizing class and restore normal state
    element.classList.remove('resizing');
    element.style.zIndex = '';
    
    // Get the final dimensions
    const computedStyle = window.getComputedStyle(element);
    const finalWidth = parseInt(computedStyle.width, 10) || startWidth;
    const finalHeight = parseInt(computedStyle.height, 10) || startHeight;
    
    // Update the size in state
    setWidgetSizes(prev =>
      prev.map(size =>
        size.id === id
          ? { ...size, width: finalWidth, height: finalHeight }
          : size
      )
    );
    
    // Add smooth transition back to normal state
    element.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    // Remove transition after animation completes
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  const handleDragEnd = useCallback(() => {
    if (!draggingWidget.current) return;
    
    const { element, id } = draggingWidget.current;
    
    // Get the final position from the element
    const computedStyle = window.getComputedStyle(element);
    const finalX = parseInt(computedStyle.left, 10) || 0;
    const finalY = parseInt(computedStyle.top, 10) || 0;
    
    // Update our ref with the final position
    widgetPositionsRef.current[id] = { x: finalX, y: finalY };
    
    draggingWidget.current = null;
    
    // Remove class from body to restore text selection
    document.body.classList.remove('dragging');
    
    // Remove dragging class and restore normal state
    element.classList.remove('dragging');
    element.style.zIndex = '';
    
    // Add smooth transition back to normal state
    element.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    // Remove transition after animation completes
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragMove]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`free-layout-container w-full relative min-h-screen ${draggingWidget.current ? 'dragging-active' : ''}`}
      style={{ cursor: draggingWidget.current ? 'grabbing' : 'default', background: 'transparent' }}
    >
      {childArray.map((child, idx) => {
        const props: any = child.props || {};
        const widgetId = props.widget?.id || props.widgetId || props['data-widget-id'] || `child-${idx}`;
        const widgetSize = widgetSizes.find(size => size.id === widgetId);
        const widgetPosition = widgetPositionsRef.current[widgetId] || { x: 0, y: 0 };
        const isDragging = draggingWidget.current?.id === widgetId;
        
        return (
          <div
            key={widgetId}
            id={`widget-${widgetId}`}
            className={`widget-container absolute cursor-move ${isDragging ? 'dragging' : ''}`}
            style={{
              width: widgetSize?.width || 300,
              height: widgetSize?.height || 300,
              left: widgetPosition.x,
              top: widgetPosition.y,
              zIndex: isDragging ? 1000 : 1,
              transform: isDragging ? 'scale(1.05) rotate(2deg)' : 'none',
              transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
              willChange: isDragging ? 'transform' : 'auto',
              boxShadow: isDragging ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onMouseDown={(e) => {
              // Only start drag if not clicking on interactive elements
              if ((e.target as HTMLElement).closest('button, input, textarea, select, a')) {
                return;
              }
              handleDragStart(e, widgetId);
            }}
          >
            {child}
            <div
              className="resize-handle"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleResizeStart(e, widgetId);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FreeLayoutManager;