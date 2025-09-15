import React, { createContext, useContext, useState, useEffect } from 'react';

export type WallpaperType = 'dots' | 'grid' | 'waves' | 'geometric' | 'solid' | 'custom';

interface WallpaperContextType {
  wallpaper: WallpaperType;
  customImageUrl: string | null;
  setWallpaper: (wallpaper: WallpaperType) => void;
  setCustomImage: (imageUrl: string | null) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

const WALLPAPER_STORAGE_KEY = 'bloxely-wallpaper';
const CUSTOM_IMAGE_STORAGE_KEY = 'bloxely-custom-wallpaper';

interface WallpaperProviderProps {
  children: React.ReactNode;
}

export function WallpaperProvider({ children }: WallpaperProviderProps) {
  const [wallpaper, setWallpaperState] = useState<WallpaperType>(() => {
    const savedWallpaper = localStorage.getItem(WALLPAPER_STORAGE_KEY) as WallpaperType;
    if (savedWallpaper && ['dots', 'grid', 'waves', 'geometric', 'solid', 'custom'].includes(savedWallpaper)) {
      return savedWallpaper;
    }
    return 'dots'; // Default to dots pattern
  });

  const [customImageUrl, setCustomImageState] = useState<string | null>(() => {
    return localStorage.getItem(CUSTOM_IMAGE_STORAGE_KEY);
  });

  // Update document class and localStorage when wallpaper changes
  useEffect(() => {
    // Remove all wallpaper classes
    document.body.classList.remove('wallpaper-dots', 'wallpaper-grid', 'wallpaper-waves', 'wallpaper-geometric', 'wallpaper-solid', 'wallpaper-custom');

    // Add current wallpaper class
    document.body.classList.add(`wallpaper-${wallpaper}`);

    // Apply custom image to body if wallpaper is custom and image exists
    if (wallpaper === 'custom' && customImageUrl) {
      document.body.style.backgroundImage = `url(${customImageUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      // Clear custom background styles for non-custom wallpapers
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    }

    // Save to localStorage
    localStorage.setItem(WALLPAPER_STORAGE_KEY, wallpaper);
  }, [wallpaper, customImageUrl]);

  const setWallpaper = (newWallpaper: WallpaperType) => {
    setWallpaperState(newWallpaper);
  };

  const setCustomImage = (imageUrl: string | null) => {
    setCustomImageState(imageUrl);
    if (imageUrl) {
      localStorage.setItem(CUSTOM_IMAGE_STORAGE_KEY, imageUrl);
    } else {
      localStorage.removeItem(CUSTOM_IMAGE_STORAGE_KEY);
    }
  };

  return (
    <WallpaperContext.Provider value={{ wallpaper, customImageUrl, setWallpaper, setCustomImage }}>
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