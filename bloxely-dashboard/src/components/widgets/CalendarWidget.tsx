import React, { useState } from 'react';
import type { BaseWidgetProps } from '../../types';
import type { CalendarData, CalendarTask } from '../../types/dashboard';

const CalendarWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState<'normal' | 'emergency'>('normal');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const calendarData: CalendarData = widget.content || {
    currentDate: new Date().toISOString().split('T')[0],
    tasks: []
  };

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarData.tasks.filter(task => task.date === dateString);
  };

  const formatTasksForDisplay = (tasks: CalendarTask[]) => {
    if (tasks.length === 0) return '';

    return tasks.map(task => {
      const emoji = task.type === 'emergency' ? '🔴' : '🟢';
      return `${emoji} ${task.content}`;
    }).join('\n');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setShowTaskModal(true);
    setNewTaskText('');
    setNewTaskType('normal');
  };

  const addTask = () => {
    if (!selectedDate || !newTaskText.trim()) return;

    const newTask: CalendarTask = {
      id: Date.now().toString(),
      content: newTaskText.trim(),
      type: newTaskType,
      date: selectedDate
    };

    const updatedTasks = [...calendarData.tasks, newTask];
    onUpdate({
      ...calendarData,
      tasks: updatedTasks
    });

    setShowTaskModal(false);
    setNewTaskText('');
    setSelectedDate(null);
  };

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayAbbreviation = (index: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  const isToday = (date: Date) => {
    return date.toISOString().split('T')[0] === todayString;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full h-full flex flex-col text-slate-800 dark:text-slate-200 p-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-center">
          {getMonthYear(currentMonth)}
        </h2>

        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
            {getDayAbbreviation(day)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const tasks = getTasksForDate(date);
          const hasNormalTask = tasks.some(task => task.type === 'normal');
          const hasEmergencyTask = tasks.some(task => task.type === 'emergency');
          const isTodayDate = isToday(date);

          return (
            <div key={date.toISOString()} className="aspect-square relative group">
              <button
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(date.toISOString().split('T')[0])}
                onMouseLeave={() => setHoveredDate(null)}
                className={`
                  w-full h-full rounded-lg flex flex-col items-center justify-center
                  text-sm font-medium transition-all duration-200 relative
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  ${isTodayDate ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                `}
              >
                <span>{date.getDate()}</span>

                {/* Task indicators */}
                <div className="flex gap-1 mt-1">
                  {hasNormalTask && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  )}
                  {hasEmergencyTask && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </button>

              {/* Hover tooltip */}
              {tasks.length > 0 && hoveredDate === date.toISOString().split('T')[0] && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                  <div className="bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg p-3 min-w-[200px] max-w-[250px] shadow-xl border border-slate-700">
                    <div className="font-semibold mb-2 text-center">
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="space-y-1">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5">
                            {task.type === 'emergency' ? '🔴' : '🟢'}
                          </span>
                          <span className="text-xs leading-tight">{task.content}</span>
                        </div>
                      ))}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-slate-800 dark:border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTaskModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              Add Task for {selectedDate && new Date(selectedDate).toLocaleDateString()}
            </h3>

            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Task Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="taskType"
                    checked={newTaskType === 'normal'}
                    onChange={() => setNewTaskType('normal')}
                    className="mr-2"
                  />
                  <span className="text-sm">Normal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="taskType"
                    checked={newTaskType === 'emergency'}
                    onChange={() => setNewTaskType('emergency')}
                    className="mr-2"
                  />
                  <span className="text-sm">Emergency</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;