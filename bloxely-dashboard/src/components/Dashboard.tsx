import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useDashboardSelectors } from '../hooks/useDashboardSelectors';
import { useDashboardActions } from '../hooks/useDashboardActions';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import FreeLayoutManager from './GridLayoutManager';
import WidgetRenderer from './WidgetRenderer';
import PersistenceStatus from './PersistenceStatus';
import ThemeToggle from './ThemeToggle';
import WallpaperSelector from './WallpaperSelector';
import WidgetDropdown from './WidgetDropdown';
import type { WidgetType } from '../types/dashboard';

const Dashboard: React.FC = () => {
  const { isLoading, persistenceEnabled } = useDashboard();
  const { hasWidgets, getWidgetCount, widgets } = useDashboardSelectors();
  const { addWidget } = useDashboardActions();
  
  // Save state before page unload
  useBeforeUnload();

  const handleAddWidget = (widgetType: WidgetType) => {
    addWidget(widgetType);
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h2 className="text-xl text-slate-800 dark:text-slate-200 mb-2">Loading Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">
            {persistenceEnabled ? 'Restoring your workspace...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/50 p-4 shadow-lg transition-colors duration-300 relative z-[100]">
        <div className="w-full px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bloxely</h1>
          <div className="flex items-center gap-3">
            <WallpaperSelector />
            <ThemeToggle />
            <WidgetDropdown onAddWidget={handleAddWidget} />
          </div>
        </div>
      </header>
      
      <main className="w-full p-0 m-0 bg-transparent min-h-screen relative z-[1]">
        {!hasWidgets ? (
          <div className="text-center py-20 w-full">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-200 mb-4 font-semibold">Your focus dashboard is ready</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Select "Add Widget" to start building your workspace</p>
            </div>
          </div>
        ) : (
          <FreeLayoutManager>
            {Object.values(widgets).map((widget) => (
              <WidgetRenderer key={widget.id} widget={widget} />
            ))}
          </FreeLayoutManager>
        )}
        
        {/* Persistence status indicator */}
        <PersistenceStatus />
      </main>
    </>
  );
};

export default Dashboard;