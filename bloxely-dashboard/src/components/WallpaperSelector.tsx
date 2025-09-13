import React, { useState } from 'react';
import { useWallpaper, type WallpaperType } from '../context/WallpaperContext';

const wallpaperOptions: { type: WallpaperType; name: string; icon: string }[] = [
  { type: 'dots', name: 'Dots', icon: '⚪' },
  { type: 'grid', name: 'Grid', icon: '⊞' },
  { type: 'waves', name: 'Waves', icon: '〰️' },
  { type: 'geometric', name: 'Geometric', icon: '◆' },
  { type: 'gradient', name: 'Gradient', icon: '🌈' },
  { type: 'solid', name: 'Solid', icon: '⬜' },
];

const WallpaperSelector: React.FC = () => {
  const { wallpaper, setWallpaper } = useWallpaper();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-200"
        title="Change wallpaper"
      >
        <span className="text-lg">🖼️</span>
        <span className="text-sm font-medium">Wallpaper</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide px-2 py-1 mb-1">
                Background Style
              </div>
              
              {wallpaperOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    setWallpaper(option.type);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 ${
                    wallpaper === option.type
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.name}</span>
                  {wallpaper === option.type && (
                    <span className="ml-auto text-blue-500 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WallpaperSelector;