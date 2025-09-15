import React, { useState, useEffect } from 'react';

interface FloatingControlPanelProps {
  appContainerRef: React.RefObject<HTMLDivElement | null>;
}

const FloatingControlPanel: React.FC<FloatingControlPanelProps> = ({ appContainerRef }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomLevels = [100, 85, 75];
  const currentZoomIndex = zoomLevels.indexOf(zoomLevel);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setIsFullscreen(fullscreen);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      // 'f' key for fullscreen toggle
      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      }
      // Escape key for exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const canvasContainer = appContainerRef.current;
    if (!canvasContainer) return;

    // Apply zoom transform to canvas content
    const scaleFactor = zoomLevel / 100;

    canvasContainer.style.transform = `scale(${scaleFactor})`;
    canvasContainer.style.transformOrigin = 'center center';
    canvasContainer.style.transition = 'transform 0.3s ease';

    // Adjust container dimensions for proper scaling
    canvasContainer.style.width = `${100 / scaleFactor}%`;
    canvasContainer.style.height = `${100 / scaleFactor}%`;

    return () => {
      // Cleanup styles
      canvasContainer.style.transform = '';
      canvasContainer.style.transformOrigin = '';
      canvasContainer.style.transition = '';
      canvasContainer.style.width = '';
      canvasContainer.style.height = '';
    };
  }, [zoomLevel, appContainerRef]);

  const handleZoomOut = () => {
    const nextIndex = (currentZoomIndex + 1) % zoomLevels.length;
    const newZoomLevel = zoomLevels[nextIndex];
    setZoomLevel(newZoomLevel);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (appContainerRef.current) {
          await appContainerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  return (
    <div className="floating-controls-container fixed bottom-4 right-4 z-[9999] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-3 flex gap-2 transform-gpu">
      {/* Current Zoom Level */}
      <div className="bg-slate-100 dark:bg-slate-700/50 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-600/50">
        {zoomLevel}%
      </div>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-110 group relative shadow-sm hover:shadow-md active:scale-95 active:bg-slate-200 dark:active:bg-slate-600/50"
        title={`Zoom: ${zoomLevel}%`}
        aria-label={`Zoom to ${zoomLevels[(currentZoomIndex + 1) % zoomLevels.length]}%`}
      >
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {/* Magnifying glass circle */}
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
            {/* Magnifying glass handle */}
            <line x1="15" y1="15" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            {/* Minus sign in the center */}
            <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
        </div>
      </button>

      {/* Fullscreen Toggle Button */}
      <button
        onClick={handleToggleFullscreen}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 hover:scale-105 group relative active:scale-95 active:bg-slate-200 dark:active:bg-slate-600/50"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        <div className="relative">
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
              {/* Exit fullscreen - arrows pointing inward */}
              <path d="M8 3v5H3m13-5v5h5M3 16v5h5m13-5v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
              {/* Enter fullscreen - arrows pointing outward */}
              <path d="M8 3H3v5m0 8v5h5m8-13h5v5m-5 8h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
        </div>
      </button>
    </div>
  );
};

export default FloatingControlPanel;