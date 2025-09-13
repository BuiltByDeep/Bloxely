import React, { useState, useRef } from 'react';
import type { BaseWidgetProps } from '../../types/widget';
import type { TodoData, Task } from '../../types/dashboard';

const TodoWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const todoData = widget.content as TodoData;
  const [newTaskText, setNewTaskText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle adding a new task
  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date(),
      };

      onUpdate({
        ...todoData,
        tasks: [...(todoData.tasks || []), newTask],
      });

      setNewTaskText('');
      inputRef.current?.focus();
    }
  };

  // Handle Enter key press in input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  // Handle task completion toggle
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = (todoData.tasks || []).map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    onUpdate({
      ...todoData,
      tasks: updatedTasks,
    });
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = (todoData.tasks || []).filter(task => task.id !== taskId);

    onUpdate({
      ...todoData,
      tasks: updatedTasks,
    });
  };

  const tasks = todoData.tasks || [];

  return (
    <div className="todo-widget h-full flex flex-col bg-transparent">
      {/* Add task input */}
      <div className="todo-input p-3 border-b border-slate-200 dark:border-slate-600/30">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-700/50 placeholder-slate-500 dark:placeholder-slate-400"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskText.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="todo-list flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            <div className="mb-3 text-2xl">📝</div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">No tasks in your Todo List yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Add a task above to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 group transition-all duration-200 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'border-slate-400 dark:border-slate-500 hover:border-emerald-400 hover:bg-emerald-400/10'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Task text */}
                <span
                  className={`flex-1 text-sm font-medium ${
                    task.completed
                      ? 'line-through text-slate-500 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {task.text}
                </span>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoWidget;