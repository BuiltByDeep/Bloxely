import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WallpaperProvider } from '../context/WallpaperContext';
import WallpaperSelector from '../components/WallpaperSelector';
import { beforeEach } from 'node:test';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WallpaperProvider>{children}</WallpaperProvider>
);

describe('WallpaperSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render wallpaper button', () => {
    render(<WallpaperSelector />, { wrapper });
    
    expect(screen.getByRole('button', { name: /wallpaper/i })).toBeInTheDocument();
    expect(screen.getByText('Wallpaper')).toBeInTheDocument();
  });

  it('should show dropdown when clicked', () => {
    render(<WallpaperSelector />, { wrapper });
    
    const button = screen.getByRole('button', { name: /wallpaper/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Background Style')).toBeInTheDocument();
    expect(screen.getByText('Dots')).toBeInTheDocument();
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Waves')).toBeInTheDocument();
    expect(screen.getByText('Geometric')).toBeInTheDocument();
    expect(screen.getByText('Solid')).toBeInTheDocument();
    expect(screen.getByText('Custom Image')).toBeInTheDocument();
  });

  it('should change wallpaper when option is selected', () => {
    render(<WallpaperSelector />, { wrapper });
    
    const button = screen.getByRole('button', { name: /wallpaper/i });
    fireEvent.click(button);
    
    const gridOption = screen.getByText('Grid');
    fireEvent.click(gridOption);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('bloxely-wallpaper', 'grid');
  });

  it('should close dropdown when backdrop is clicked', () => {
    render(<WallpaperSelector />, { wrapper });
    
    const button = screen.getByRole('button', { name: /wallpaper/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Background Style')).toBeInTheDocument();
    
    // Click backdrop
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    expect(screen.queryByText('Background Style')).not.toBeInTheDocument();
  });
});