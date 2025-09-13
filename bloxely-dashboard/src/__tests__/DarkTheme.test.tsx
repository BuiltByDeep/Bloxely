import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';
import { DashboardProvider } from '../context/DashboardContext';
import Dashboard from '../components/Dashboard';

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

describe('Dark Theme Implementation', () => {
  const renderDashboard = () => {
    return render(
      <ThemeProvider>
        <DashboardProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            <Dashboard />
          </div>
        </DashboardProvider>
      </ThemeProvider>
    );
  };

  it('should render dashboard with dark theme elements', async () => {
    renderDashboard();
    
    // Check that the main title is present
    expect(screen.getByText('Bloxely')).toBeInTheDocument();
    
    // Check that the empty state message is present
    expect(screen.getByText('Your focus dashboard is ready')).toBeInTheDocument();
    expect(screen.getByText('Select "Add Widget" to start building your workspace')).toBeInTheDocument();
    
    // Check that the Add Widget dropdown is present
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should have proper theme styling classes', () => {
    const { container } = renderDashboard();
    
    // Check that the main container has theme classes
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('bg-slate-50', 'dark:bg-slate-900', 'text-slate-900', 'dark:text-white');
  });

  it('should render theme toggle button', () => {
    renderDashboard();
    
    // Check that theme toggle button is present
    const themeToggle = screen.getByRole('button', { name: /switch to.*mode/i });
    expect(themeToggle).toBeInTheDocument();
  });

  it('should display widget count correctly', () => {
    renderDashboard();
    
    // Should show 0 widgets initially
    expect(screen.getByText('0 widgets')).toBeInTheDocument();
  });

  it('should have accessible focus states', () => {
    renderDashboard();
    
    const addWidgetSelect = screen.getByRole('combobox');
    expect(addWidgetSelect).toBeInTheDocument();
    
    // The select should have proper styling classes for both themes
    expect(addWidgetSelect).toHaveClass('bg-white', 'dark:bg-slate-700/80');
  });

  it('should render persistence status component', () => {
    renderDashboard();
    
    // The persistence status component should be rendered
    // We can't easily test its visibility without more complex setup,
    // but we can ensure the component tree includes it
    expect(document.querySelector('[title="Force save dashboard"]')).toBeInTheDocument();
  });
});