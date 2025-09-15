import { describe, it, expect } from 'vitest';
import { widgetRegistry } from '../services/WidgetRegistry';
import { widgetFactory } from '../services/WidgetFactory';
import type { WidgetType } from '../types';

describe('New Widget Types Integration', () => {
  const newWidgetTypes: WidgetType[] = [
    'music-player',
    'habit-tracker',
    'image-collector'
  ];

  describe('Widget Registry', () => {
    it('should have all new widget types registered', () => {
      newWidgetTypes.forEach(type => {
        expect(widgetRegistry.has(type)).toBe(true);
      });
    });

    it('should return correct widget definitions for new types', () => {
      const musicPlayer = widgetRegistry.get('music-player');
      expect(musicPlayer).toBeDefined();
      expect(musicPlayer?.name).toBe('Lo-fi Music Player');
      expect(musicPlayer?.icon).toBe('🎵');
      expect(musicPlayer?.defaultSize.w).toBe(4);
      expect(musicPlayer?.defaultSize.h).toBe(3);

      
      const habitTracker = widgetRegistry.get('habit-tracker');
      expect(habitTracker).toBeDefined();
      expect(habitTracker?.name).toBe('Habit Streak Tracker');
      expect(habitTracker?.defaultSize.w).toBe(5);

      const imageCollector = widgetRegistry.get('image-collector');
      expect(imageCollector).toBeDefined();
      expect(imageCollector?.name).toBe('Image & Screenshot Collector');
      expect(imageCollector?.defaultSize.w).toBe(4);
    });

    it('should have correct default content for new widgets', () => {
      const musicPlayer = widgetRegistry.get('music-player');
      expect(musicPlayer?.defaultContent).toEqual({
        currentStation: null,
        volume: 0.7,
        isPlaying: false,
        isMinimized: false,
        sleepTimer: { enabled: false, duration: 30, remaining: 0 },
        favoriteStations: []
      });

      
      const habitTracker = widgetRegistry.get('habit-tracker');
      expect(habitTracker?.defaultContent).toEqual({
        habits: [],
        completions: [],
        streaks: {}
      });

      const imageCollector = widgetRegistry.get('image-collector');
      expect(imageCollector?.defaultContent).toEqual({
        images: [],
        maxImages: 20,
        thumbnailSize: 150
      });
    });
  });

  describe('Widget Factory', () => {
    it('should support all new widget types', () => {
      newWidgetTypes.forEach(type => {
        expect(widgetFactory.isSupported(type)).toBe(true);
      });
    });

    it('should create default widget data for new types', () => {
      newWidgetTypes.forEach(type => {
        const widgetData = widgetFactory.getDefaultWidgetData(type, 'test-id');
        expect(widgetData).toBeDefined();
        expect(widgetData?.type).toBe(type);
        expect(widgetData?.id).toBe('test-id');
        expect(widgetData?.createdAt).toBeInstanceOf(Date);
        expect(widgetData?.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should return correct default sizes for new widgets', () => {
      const musicPlayerSize = widgetFactory.getDefaultSize('music-player');
      expect(musicPlayerSize).toEqual({ w: 4, h: 3, minW: 3, minH: 2, maxW: 6, maxH: 4 });

      
      const habitTrackerSize = widgetFactory.getDefaultSize('habit-tracker');
      expect(habitTrackerSize).toEqual({ w: 5, h: 4, minW: 4, minH: 3, maxW: 6, maxH: 5 });

      const imageCollectorSize = widgetFactory.getDefaultSize('image-collector');
      expect(imageCollectorSize).toEqual({ w: 4, h: 4, minW: 3, minH: 3, maxW: 6, maxH: 6 });
    });
  });

  describe('Widget Type System', () => {
    it('should include new widget types in available widgets list', () => {
      const availableWidgets = widgetRegistry.getAvailable();
      const availableTypes = availableWidgets.map(w => w.type);
      
      newWidgetTypes.forEach(type => {
        expect(availableTypes).toContain(type);
      });
    });

    it('should maintain proper widget count after adding new types', () => {
      const allWidgets = widgetRegistry.getAll();
      // Should have original 6 widgets + 4 new widgets = 10 total
      expect(allWidgets.length).toBe(10);
    });
  });
});