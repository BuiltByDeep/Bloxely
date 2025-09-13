import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getStorageInfo } from '../utils/persistence';

const PersistenceStatus: React.FC = () => {
  const { persistenceEnabled, forceSave } = useDashboard();
  const [showStatus, setShowStatus] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    sizeKB: number;
    timestamp: number | null;
  }>({ sizeKB: 0, timestamp: null });

  // Update storage info periodically
  useEffect(() => {
    const updateStorageInfo = () => {
      const info = getStorageInfo();
      setStorageInfo({
        sizeKB: info.sizeKB,
        timestamp: info.timestamp
      });
    };

    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Show status temporarily when persistence state changes
  useEffect(() => {
    if (persistenceEnabled) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [persistenceEnabled]);

  const handleForceSave = () => {
    const success = forceSave();
    if (success) {
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
    }
  };

  const formatLastSaved = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!persistenceEnabled) {
    return (
      <div className="fixed bottom-4 right-4 bg-amber-100 dark:bg-amber-900/90 backdrop-blur-sm border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl text-sm shadow-xl">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>Auto-save disabled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status indicator */}
      {showStatus && (
        <div className="bg-emerald-100 dark:bg-emerald-900/90 backdrop-blur-sm border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl text-sm shadow-xl mb-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Dashboard saved</span>
          </div>
        </div>
      )}

      {/* Persistence info button */}
      <div className="group relative">
        <button
          onClick={handleForceSave}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 p-3 rounded-full shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700/90 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
          title="Force save dashboard"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>

        {/* Tooltip with storage info */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-4 py-3 whitespace-nowrap shadow-xl">
            <div className="font-medium">Auto-save: Enabled</div>
            <div>Size: {storageInfo.sizeKB} KB</div>
            <div>Last saved: {formatLastSaved(storageInfo.timestamp)}</div>
            <div className="text-slate-500 dark:text-slate-400 mt-2 text-xs">Click to force save</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistenceStatus;