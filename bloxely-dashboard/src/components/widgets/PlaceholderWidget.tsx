import React from 'react';
import type { BaseWidgetProps } from '../../types/widget';

const PlaceholderWidget: React.FC<BaseWidgetProps> = ({ widget }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <div className="text-4xl mb-2">
        {widget.type === 'clock' && '🕐'}
        {widget.type === 'todo' && '📝'}
        {widget.type === 'sticky-note' && '📄'}
        {widget.type === 'pomodoro' && '⏰'}
      </div>
      <p className="text-sm text-center">
        {widget.type.charAt(0).toUpperCase() + widget.type.slice(1).replace('-', ' ')} Widget
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Coming soon...
      </p>
    </div>
  );
};

export default PlaceholderWidget;