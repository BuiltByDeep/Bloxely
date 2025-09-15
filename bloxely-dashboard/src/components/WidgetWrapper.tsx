import React from 'react';
import { useDashboardActions } from '../hooks/useDashboardActions';
import type { WidgetData } from '../types/dashboard';

interface WidgetWrapperProps {
  widget: WidgetData;
  children: React.ReactNode;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, children }) => {
  const { removeWidget } = useDashboardActions();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeWidget(widget.id);
  };

  // Prevent widget drag when clicking on interactive elements
  const handleInteractiveElementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Special handling for clock, sticky-note, pomodoro, habit-tracker, personal-image, priority-matrix, youtube-player, calendar, and voice-text-notes widgets - minimal wrapper styling
  if (widget.type === 'clock' || widget.type === 'sticky-note' || widget.type === 'pomodoro' || widget.type === 'habit-tracker' || widget.type === 'personal-image' || widget.type === 'priority-matrix' || widget.type === 'youtube-player' || widget.type === 'calendar' || widget.type === 'voice-text-notes') {
    // For sticky notes and priority matrix, don't use flex layout to allow proper resizing
    const isStickyNote = widget.type === 'sticky-note';
    const isPriorityMatrix = widget.type === 'priority-matrix';

    return (
      <div
        key={widget.id}
        id={`widget-${widget.id}`}
        className="widget-wrapper h-full w-full relative"
      >
        {/* Close button */}
        <button
          onClick={handleRemove}
          onMouseDown={handleInteractiveElementClick}
          className="absolute top-2 right-2 z-10 text-white/80 hover:text-red-400 transition-all duration-200 p-1 rounded-full hover:bg-black/20 clickable"
          title="Remove widget"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Widget Content - full height and width */}
        <div className={`h-full w-full overflow-hidden ${isStickyNote || isPriorityMatrix ? '' : 'flex items-center justify-center'}`}>
          {children}
        </div>
      </div>
    );
  }

  // Default wrapper for other widgets
  return (
    <div
      key={widget.id}
      id={`widget-${widget.id}`}
      className="widget-wrapper h-full w-full flex flex-col bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600/50"
    >
      {/* Widget Header */}
      <div className="widget-header bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-600/30 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {widget.config.title || 'Widget'}
        </h3>
        <button
          onClick={handleRemove}
          onMouseDown={handleInteractiveElementClick}
          className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/50 clickable"
          title="Remove widget"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      
      {/* Widget Content */}
      <div className="widget-content flex-1 p-4 overflow-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default WidgetWrapper;