import React, { useState, useRef, useEffect } from 'react';
import { useWallpaper, type WallpaperType } from '../context/WallpaperContext';
import { useDashboardActions } from '../hooks/useDashboardActions';

const wallpaperOptions: { type: WallpaperType; name: string; icon: string }[] = [
  { type: 'dots', name: 'Dots', icon: '⚪' },
  { type: 'grid', name: 'Grid', icon: '⊞' },
  { type: 'waves', name: 'Waves', icon: '🌊' },
  { type: 'geometric', name: 'Geometric', icon: '◇' },
  { type: 'solid', name: 'Solid', icon: '⬜' },
  { type: 'custom', name: 'Custom Wallpaper', icon: '🖼️' },
];

const WallpaperSelector: React.FC = () => {
  const { wallpaper, setWallpaper, customImageUrl } = useWallpaper();
  const { addWidget } = useDashboardActions();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="wallpaper-dropdown-container" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-200"
        title="Change wallpaper"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">Wallpaper</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="wallpaper-dropdown absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden"
        >
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide px-2 py-1 mb-1">
                Background Style
              </div>
              
              {wallpaperOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Wallpaper clicked:', option.type);
                    if (option.type === 'custom') {
                      // Add custom wallpaper widget to the canvas
                      addWidget('custom-wallpaper');
                      setIsOpen(false);
                    } else {
                      setWallpaper(option.type);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 pointer-events-auto ${
                    wallpaper === option.type
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{option.name}</span>
                    {option.type === 'custom' && customImageUrl && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">Image uploaded</span>
                    )}
                  </div>
                  {wallpaper === option.type && (
                    <span className="ml-auto text-blue-500 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperSelector;
