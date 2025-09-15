import React from 'react';
import type { BaseWidgetProps } from '../../types';

const YouTubePlayerWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const videoId = widget.content?.videoId || 'sF80I-TQiW0';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&controls=1&loop=1&playlist=${videoId}`;

  const togglePlay = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    onUpdate({
      ...widget.content,
      isPlaying: newPlayingState
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-black rounded-lg overflow-hidden">
      <div className="flex-1 relative">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Lofi Music Player"
        />
      </div>
      <div className="p-3 bg-gray-900 flex items-center justify-between">
        <button
          onClick={togglePlay}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <span className="text-white text-sm">Lofi Music</span>
      </div>
    </div>
  );
};

export default YouTubePlayerWidget;