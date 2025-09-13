import { useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';

/**
 * Hook to save dashboard state before page unload
 * Ensures data is persisted even if user closes browser suddenly
 */
export const useBeforeUnload = () => {
  const { forceSave, persistenceEnabled } = useDashboard();

  useEffect(() => {
    if (!persistenceEnabled) return;

    const handleBeforeUnload = (_event: BeforeUnloadEvent) => {
      // Force save the current state
      try {
        forceSave();
        console.log('Dashboard state saved before page unload');
      } catch (error) {
        console.error('Failed to save state before unload:', error);
      }

      // Note: We don't prevent the unload, just ensure data is saved
      // Modern browsers ignore custom messages in beforeunload anyway
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden (tab switch, minimize, etc.)
        try {
          forceSave();
          console.log('Dashboard state saved on visibility change');
        } catch (error) {
          console.error('Failed to save state on visibility change:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceSave, persistenceEnabled]);
};