import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WallpaperProvider, useWallpaper } from '../context/WallpaperContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the wallpaper context
const TestComponent = () => {
  const { wallpaper, setWallpaper } = useWallpaper();
  
  return (
    <div>
      <span data-testid="current-wallpaper">{wallpaper}</span>
      <button onClick={() => setWallpaper('grid')}>Set Grid</button>
      <button onClick={() => setWallpaper('waves')}>Set Waves</button>
    </div>
  );
};

describe('WallpaperContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Clear body classes
    document.body.className = '';
  });

  it('should provide default wallpaper value', () => {
    render(
      <WallpaperProvider>
        <TestComponent />
      </WallpaperProvider>
    );
    
    expect(screen.getByTestId('current-wallpaper')).toHaveTextContent('dots');
  });

  it('should load saved wallpaper from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('grid');
    
    render(
      <WallpaperProvider>
        <TestComponent />
      </WallpaperProvider>
    );
    
    expect(screen.getByTestId('current-wallpaper')).toHaveTextContent('grid');
  });

  it('should update wallpaper and save to localStorage', () => {
    render(
      <WallpaperProvider>
        <TestComponent />
      </WallpaperProvider>
    );
    
    fireEvent.click(screen.getByText('Set Grid'));
    
    expect(screen.getByTestId('current-wallpaper')).toHaveTextContent('grid');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('bloxely-wallpaper', 'grid');
  });

  it('should update body class when wallpaper changes', () => {
    render(
      <WallpaperProvider>
        <TestComponent />
      </WallpaperProvider>
    );
    
    // Initial state should have dots class
    expect(document.body.classList.contains('wallpaper-dots')).toBe(true);
    
    fireEvent.click(screen.getByText('Set Waves'));
    
    expect(document.body.classList.contains('wallpaper-waves')).toBe(true);
    expect(document.body.classList.contains('wallpaper-dots')).toBe(false);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useWallpaper must be used within a WallpaperProvider');
    
    consoleSpy.mockRestore();
  });
});