import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { BaseWidgetProps } from '../../types/widget';
import type { KanbanData, KanbanTask } from '../../types/dashboard';

const KanbanWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate }) => {
  const kanbanData = widget.content as KanbanData;
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'normal' | 'urgent' | 'high'>('normal');
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);

  // Initialize with empty data if not provided
  const initializeData = (): KanbanData => {
    if (!kanbanData || !kanbanData.tasks) {
      return { tasks: [] };
    }
    return kanbanData;
  };

  const data = initializeData();

  const updateData = (newData: Partial<KanbanData>) => {
    onUpdate({ ...data, ...newData });
  };

  // Column configuration
  const COLUMNS = [
    { id: 'todo', title: 'To Do', color: '#8B5CF6' },
    { id: 'progress', title: 'In Progress', color: '#3B82F6' },
    { id: 'done', title: 'Done', color: '#10B981' }
  ];

  // Priority configuration
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      default: return 'text-blue-600';
    }
  };

  // Get tasks for a specific column
  const getTasksForColumn = (columnId: string) => {
    return data.tasks.filter(task => task.column === columnId);
  };

  // Add new task
  const addTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: KanbanTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      column: columnId as 'todo' | 'progress' | 'done',
      createdAt: new Date(),
    };

    const updatedTasks = [...data.tasks, newTask];
    updateData({ tasks: updatedTasks });
    
    setShowAddTask(null);
    setNewTaskTitle('');
    setNewTaskPriority('normal');
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    const updatedTasks = data.tasks.filter(task => task.id !== taskId);
    updateData({ tasks: updatedTasks });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: KanbanTask) => {
    e.stopPropagation(); // Prevent widget drag
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent widget drag
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent widget drag
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent widget drag
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent widget drag
    
    if (!draggedTask) return;

    const updatedTasks = data.tasks.map(task => 
      task.id === draggedTask.id 
        ? { ...task, column: targetColumn as 'todo' | 'progress' | 'done' }
        : task
    );

    updateData({ tasks: updatedTasks });
    setDraggedTask(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-3 gap-1 flex-1 min-h-0">
        {COLUMNS.map((column, index) => {
          const columnTasks = getTasksForColumn(column.id);
          
          return (
            <div
              key={column.id}
              className="flex flex-col h-full min-h-0"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div
                className={`p-2 text-white font-medium flex items-center justify-between text-xs ${
                  index === 0 ? 'rounded-tl-lg' : index === 2 ? 'rounded-tr-lg' : ''
                }`}
                style={{ backgroundColor: column.color }}
              >
                <div className="flex items-center gap-1">
                  <span className="font-semibold truncate">{column.title}</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddTask(column.id)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Add new task"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Task List */}
              <div 
                className={`p-2 space-y-2 bg-gray-50 dark:bg-gray-800 overflow-y-auto overflow-x-hidden ${
                  index === 0 ? 'rounded-bl-lg' : index === 2 ? 'rounded-br-lg' : ''
                }`}
                style={{ 
                  flex: '1 1 0%',
                  minHeight: '0',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#CBD5E0 transparent'
                }}
              >
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onMouseDown={(e) => {
                      // Only prevent propagation if it's actually a drag start
                      if (e.button === 0) { // Left mouse button
                        e.stopPropagation();
                      }
                    }}
                    className="bg-white dark:bg-gray-700 p-2 rounded shadow-sm cursor-move hover:shadow-md transition-all duration-200 group relative select-none"
                    style={{ userSelect: 'none' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs leading-relaxed flex-1 pr-1 break-words">
                        {task.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 rounded transition-opacity cursor-pointer"
                        title="Delete task"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Priority Label */}
                    <div className="flex justify-end">
                      <span className={`text-xs font-bold ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add Task Form */}
                {showAddTask === column.id && (
                  <div 
                    className="bg-white dark:bg-gray-700 p-2 rounded shadow-sm"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Enter task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full mb-2 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTask(column.id);
                        } else if (e.key === 'Escape') {
                          setShowAddTask(null);
                          setNewTaskTitle('');
                        }
                      }}
                      autoFocus
                    />
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as 'normal' | 'urgent' | 'high')}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full mb-2 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => addTask(column.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(null);
                          setNewTaskTitle('');
                          setNewTaskPriority('normal');
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanWidget;