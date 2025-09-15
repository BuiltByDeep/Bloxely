import React, { useState } from 'react';
import { widgetFactory } from '../services/WidgetFactory';
import { Clock, CheckSquare, StickyNote, Timer, KanbanSquare, Image, Calendar } from 'lucide-react';
import type { WidgetType } from '../types/dashboard';

interface WidgetDropdownProps {
  onAddWidget: (widgetType: WidgetType) => void;
}

const WidgetDropdown: React.FC<WidgetDropdownProps> = ({ onAddWidget }) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableWidgets = widgetFactory.getAvailableWidgets().filter(widget => widget.type !== 'custom-wallpaper');

  const iconMap: Record<string, React.ReactNode> = {
    '🕐': <Clock size={20} />,
    '📝': <CheckSquare size={20} />,
    '📄': <StickyNote size={20} />,
    '⏰': <Timer size={20} />,
    '📋': <KanbanSquare size={20} />,
    '🖼️': <Image size={20} />,
    '📅': <Calendar size={20} />,
  };

  const handleSelectWidget = (widgetType: WidgetType) => {
    onAddWidget(widgetType);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600/80 px-4 py-2 rounded-lg transition-all duration-200 border border-slate-300 dark:border-slate-600/50 cursor-pointer text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center gap-2 min-w-[140px]"
      >
        <span>Add Widget</span>
        <svg className="w-4 h-4 ml-auto transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="py-2 max-h-64 overflow-y-auto">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => handleSelectWidget(widget.type)}
                className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 flex items-center gap-3 group"
              >
                <div className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 flex-shrink-0">
                  {iconMap[widget.icon] || widget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 dark:text-slate-100 font-medium text-sm truncate">
                    {widget.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {widget.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WidgetDropdown;