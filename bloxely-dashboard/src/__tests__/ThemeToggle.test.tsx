import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  const renderThemeToggle = () => {
    return render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  };

  it('should render theme toggle button', () => {
    renderThemeToggle();
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('should toggle theme when clicked', () => {
    renderThemeToggle();
    
    const toggleButton = screen.getByRole('button');
    
    // Initially should be light mode
    expect(toggleButton).toHaveAttribute('title', 'Switch to dark mode');
    
    // Click to switch to dark mode
    fireEvent.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('title', 'Switch to light mode');
    expect(document.documentElement).toHaveClass('dark');
    
    // Click again to switch back to light mode
    fireEvent.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('title', 'Switch to dark mode');
    expect(document.documentElement).toHaveClass('light');
  });

  it('should save theme preference to localStorage', () => {
    renderThemeToggle();
    
    const toggleButton = screen.getByRole('button');
    
    // Switch to dark mode
    fireEvent.click(toggleButton);
    
    expect(localStorage.getItem('bloxely-theme')).toBe('dark');
    
    // Switch back to light mode
    fireEvent.click(toggleButton);
    
    expect(localStorage.getItem('bloxely-theme')).toBe('light');
  });

  it('should restore theme from localStorage', () => {
    // Set dark theme in localStorage
    localStorage.setItem('bloxely-theme', 'dark');
    
    renderThemeToggle();
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('title', 'Switch to light mode');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('should have proper accessibility attributes', () => {
    renderThemeToggle();
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(toggleButton).toHaveAttribute('title', 'Switch to dark mode');
  });
});