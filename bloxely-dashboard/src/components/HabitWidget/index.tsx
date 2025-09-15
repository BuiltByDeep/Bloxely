import React, { useState, useEffect } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import { generateDateRange, getTodayString } from './utils';

interface Habit {
  id: string;
  name: string;
  currentStreak: number;
  bestStreak: number;
  completions: Record<string, boolean>;
}

interface HabitWidgetProps extends BaseWidgetProps {}

const HabitWidget: React.FC<HabitWidgetProps> = ({ widget, onUpdate }) => {
  const [habits, setHabits] = useState<Habit[]>(widget.content?.habits || []);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const daysToShow = 7; // Show last 7 days
  const dateRange = generateDateRange(daysToShow).reverse(); // Most recent first

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      currentStreak: 0,
      bestStreak: 0,
      completions: {}
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setShowAddInput(false);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const newCompletions = { ...h.completions };

        if (newCompletions[date]) {
          delete newCompletions[date];
        } else {
          newCompletions[date] = true;
        }

        const currentStreak = calculateStreakForBoolean(newCompletions);
        const bestStreak = Math.max(h.bestStreak, currentStreak);

        return {
          ...h,
          completions: newCompletions,
          currentStreak,
          bestStreak
        };
      }
      return h;
    });

    setHabits(updatedHabits);
  };

  const calculateStreakForBoolean = (completions: Record<string, boolean>): number => {
    const completionDates = Object.keys(completions)
      .filter(date => completions[date])
      .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

    if (completionDates.length === 0) return 0;

    let streak = 0;
    const today = getTodayString();
    let currentDate = today;

    // Check if today is completed, if not start from yesterday
    if (!completionDates.includes(today)) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      currentDate = yesterday.toISOString().split('T')[0];
    }

    // Count consecutive days backwards from current date
    while (completionDates.includes(currentDate)) {
      streak++;
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = prevDate.toISOString().split('T')[0];
    }

    return streak;
  };

  const isCompleted = (habitId: string, date: string): boolean => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.completions[date] || false;
  };

  const getTodayProgress = (): number => {
    if (habits.length === 0) return 0;

    const today = getTodayString();
    const completedToday = habits.filter(habit => habit.completions[today]).length;
    return Math.round((completedToday / habits.length) * 100);
  };

  const getLongestStreak = (): number => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.bestStreak));
  };

  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === getTodayString()) return 'Today';
    if (dateString === yesterday.toISOString().split('T')[0]) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    onUpdate({ habits });
  }, [habits, onUpdate]);

  return (
    <div className="habit-widget minimalist">
      <div className="habit-header">
        <div className="habit-stats">
          <div className="stat-item">
            <span className="stat-value">{getTodayProgress()}%</span>
            <span className="stat-label">Today</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">🔥 {getLongestStreak()}</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${getTodayProgress()}%` }}
          />
        </div>
      </div>

      <div className="habits-list">
        {habits.map(habit => (
          <div key={habit.id} className="habit-row">
            <div className="habit-info">
              <span className="habit-name">{habit.name}</span>
              {habit.currentStreak > 0 && (
                <span className="streak-badge">🔥 {habit.currentStreak}</span>
              )}
            </div>

            <div className="habit-days">
              {dateRange.map(date => (
                <button
                  key={date}
                  className={`day-circle ${isCompleted(habit.id, date) ? 'completed' : ''} ${date === getTodayString() ? 'today' : ''}`}
                  onClick={() => toggleCompletion(habit.id, date)}
                  title={`${habit.name} - ${formatDateShort(date)}`}
                  aria-label={`Mark ${habit.name} as ${isCompleted(habit.id, date) ? 'incomplete' : 'complete'} for ${formatDateShort(date)}`}
                >
                  {isCompleted(habit.id, date) ? '✔️' : ''}
                </button>
              ))}
            </div>

            <button
              className="delete-habit"
              onClick={() => deleteHabit(habit.id)}
              title="Delete habit"
              aria-label="Delete habit"
            >
              ×
            </button>
          </div>
        ))}

        {habits.length === 0 && (
          <div className="empty-state">
            <p>No habits yet. Add your first habit to get started!</p>
          </div>
        )}
      </div>

      <div className="habit-footer">
        {showAddInput ? (
          <div className="add-habit-form">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter habit name..."
              className="habit-input"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            />
            <div className="add-buttons">
              <button onClick={addHabit} className="add-btn">Add</button>
              <button onClick={() => {
                setShowAddInput(false);
                setNewHabitName('');
              }} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            className="add-habit-trigger"
            onClick={() => setShowAddInput(true)}
          >
            + Add Habit
          </button>
        )}
      </div>
    </div>
  );
};

export default HabitWidget;