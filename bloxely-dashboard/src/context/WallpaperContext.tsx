import React, { createContext, useContext, useState, useEffect } from 'react';

export type WallpaperType = 'dots' | 'grid' | 'waves' | 'geometric' | 'gradient' | 'solid';

interface WallpaperContextType {
  wallpaper: WallpaperType;
  setWallpaper: (wallpaper: WallpaperType) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

const WALLPAPER_STORAGE_KEY = 'bloxely-wallpaper';

interface WallpaperProviderProps {
  children: React.ReactNode;
}

export function WallpaperProvider({ children }: WallpaperProviderProps) {
  const [wallpaper, setWallpaperState] = useState<WallpaperType>(() => {
    const savedWallpaper = localStorage.getItem(WALLPAPER_STORAGE_KEY) as WallpaperType;
    if (savedWallpaper && ['dots', 'grid', 'waves', 'geometric', 'gradient', 'solid'].includes(savedWallpaper)) {
      return savedWallpaper;
    }
    return 'dots'; // Default to dots pattern
  });

  // Update document class and localStorage when wallpaper changes
  useEffect(() => {
    // Remove all wallpaper classes
    document.body.classList.remove('wallpaper-dots', 'wallpaper-grid', 'wallpaper-waves', 'wallpaper-geometric', 'wallpaper-gradient', 'wallpaper-solid');
    
    // Add current wallpaper class
    document.body.classList.add(`wallpaper-${wallpaper}`);
    
    // Save to localStorage
    localStorage.setItem(WALLPAPER_STORAGE_KEY, wallpaper);
  }, [wallpaper]);

  const setWallpaper = (newWallpaper: WallpaperType) => {
    setWallpaperState(newWallpaper);
  };

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
}