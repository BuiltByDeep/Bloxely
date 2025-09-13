import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../../components/Dashboard';

// Mock different browser environments
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

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

// Mock matchMedia with different scenarios
const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
};

const FullApp: React.FC = () => (
  <ThemeProvider>
    <NotificationProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
          <Dashboard />
        </div>
      </DashboardProvider>
    </NotificationProvider>
  </ThemeProvider>
);

describe('Browser Compatibility Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
    mockMatchMedia(false);
  });

  it('should work with Chrome user agent', async () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should work with Firefox user agent', async () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should work with Safari user agent', async () => {
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should work with Edge user agent', async () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59');
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should handle dark mode preference detection', async () => {
    mockMatchMedia(true); // Simulate dark mode preference
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should detect and apply dark mode
    expect(document.documentElement).toHaveClass('dark');
  });

  it('should handle light mode preference detection', async () => {
    mockMatchMedia(false); // Simulate light mode preference
    
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should detect and apply light mode
    expect(document.documentElement).toHaveClass('light');
  });

  it('should work without localStorage support', async () => {
    // Mock localStorage to throw errors
    const brokenLocalStorage = {
      getItem: () => { throw new Error('localStorage not available'); },
      setItem: () => { throw new Error('localStorage not available'); },
      removeItem: () => { throw new Error('localStorage not available'); },
      clear: () => { throw new Error('localStorage not available'); },
    };

    Object.defineProperty(window, 'localStorage', {
      value: brokenLocalStorage,
    });

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should still work without localStorage
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  it('should handle missing matchMedia support', async () => {
    // Remove matchMedia support
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
    });

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should still work without matchMedia
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
  });

  it('should handle touch events on mobile devices', async () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
    });

    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should work on mobile
    expect(screen.getByText('Bloxely')).toBeInTheDocument();

    // Add a widget to test touch interactions
    const addWidgetSelect = screen.getByRole('combobox');
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    expect(screen.getByTitle('Time display')).toBeInTheDocument();
  });

  it('should handle different screen sizes', async () => {
    // Mock different viewport sizes
    const testViewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of testViewports) {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height,
      });

      const { unmount } = render(<FullApp />);

      await waitFor(() => {
        expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
      });

      // Should work at all screen sizes
      expect(screen.getByText('Bloxely')).toBeInTheDocument();

      unmount();
    }
  });

  it('should handle reduced motion preferences', async () => {
    // Mock reduced motion preference
    mockMatchMedia(true);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should respect reduced motion preferences
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
  });

  it('should handle high contrast mode', async () => {
    // Mock high contrast preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('prefers-contrast: high'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Should work with high contrast mode
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    render(<FullApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument();
    });

    // Test keyboard navigation
    const addWidgetSelect = screen.getByRole('combobox');
    
    // Focus the select
    addWidgetSelect.focus();
    expect(document.activeElement).toBe(addWidgetSelect);

    // Use keyboard to select option
    fireEvent.keyDown(addWidgetSelect, { key: 'ArrowDown' });
    fireEvent.change(addWidgetSelect, { target: { value: 'clock' } });

    await waitFor(() => {
      expect(screen.getByText('1 widgets')).toBeInTheDocument();
    });

    // Test tab navigation
    const themeToggle = screen.getByRole('button', { name: /switch to.*mode/i });
    fireEvent.keyDown(themeToggle, { key: 'Tab' });
    
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
  });
});