import { useEffect, useRef, useCallback } from 'react';
import { saveDashboardState } from '../utils/persistence';
import type { DashboardState } from '../types/dashboard';

interface UseDebouncedPersistenceOptions {
  delay?: number;
  enabled?: boolean;
}

/**
 * Hook for debounced persistence of dashboard state to localStorage
 * Prevents excessive writes while ensuring data is saved
 */
export const useDebouncedPersistence = (
  state: DashboardState,
  options: UseDebouncedPersistenceOptions = {}
) => {
  const { delay = 1000, enabled = true } = options;
  const timeoutRef = useRef<number | null>(null);
  const lastSavedStateRef = useRef<string>('');
  const saveCountRef = useRef(0);

  const debouncedSave = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      const currentStateString = JSON.stringify(state);
      
      // Only save if state has actually changed
      if (currentStateString !== lastSavedStateRef.current) {
        const success = saveDashboardState(state);
        
        if (success) {
          lastSavedStateRef.current = currentStateString;
          saveCountRef.current += 1;
          console.log(`Dashboard state persisted (save #${saveCountRef.current})`);
        }
      }
    }, delay);
  }, [state, delay, enabled]);

  // Save state when it changes
  useEffect(() => {
    debouncedSave();
  }, [debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Force immediate save (useful for critical operations)
  const forceSave = useCallback(() => {
    if (!enabled) return false;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const success = saveDashboardState(state);
    if (success) {
      lastSavedStateRef.current = JSON.stringify(state);
      saveCountRef.current += 1;
      console.log(`Dashboard state force-saved (save #${saveCountRef.current})`);
    }
    return success;
  }, [state, enabled]);

  return {
    forceSave,
    saveCount: saveCountRef.current
  };
};