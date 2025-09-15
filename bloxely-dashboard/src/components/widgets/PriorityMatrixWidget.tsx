import React, { useState, useEffect, useCallback } from 'react';
import type { BaseWidgetProps } from '../../types/widget';

interface Task {
  id: string;
  content: string;
  quadrant: 'do-first' | 'schedule' | 'delegate' | 'eliminate';
}

interface QuadrantProps {
  id: 'do-first' | 'schedule' | 'delegate' | 'eliminate';
  title: string;
  description: string;
  color: string;
  tasks: Task[];
  onAddTask: (quadrant: string, content: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDrop: (taskId: string, targetQuadrant: string) => void;
  onDragStart: (taskId: string) => void;
}

const Quadrant: React.FC<QuadrantProps> = ({
  id,
  title,
  description,
  color,
  tasks,
  onAddTask,
  onDeleteTask,
  onDrop,
  onDragStart
}) => {
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleAddTask = useCallback(() => {
    if (newTaskContent.trim()) {
      onAddTask(id, newTaskContent.trim());
      setNewTaskContent('');
      setIsAdding(false);
    }
  }, [newTaskContent, onAddTask, id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setNewTaskContent('');
      setIsAdding(false);
    }
  }, [handleAddTask]);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDrop(taskId, id);
    }
  };

  return (
    <div
      className={`flex flex-col rounded-lg shadow-lg overflow-hidden transition-all ${isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 transform scale-105' : ''}`}
      style={{ backgroundColor: color }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-black/10">
        <h3 className="font-bold text-sm text-gray-900">{title}</h3>
        <p className="text-xs text-gray-700">{description}</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-96 p-2 space-y-2 min-h-32">
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-8">
            Drop tasks here or add new ones below
          </div>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      <div className="p-2 border-t border-black/10">
        {isAdding ? (
          <div className="flex gap-1">
            <input
              ref={inputRef}
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  if (newTaskContent.trim()) {
                    handleAddTask();
                  } else {
                    setNewTaskContent('');
                    setIsAdding(false);
                  }
                }, 200);
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add a task..."
            />
            <button
              onClick={handleAddTask}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-2 py-1 text-xs text-gray-700 hover:bg-black/5 rounded transition-colors"
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(task.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded p-2 shadow-sm cursor-move hover:shadow-md transition-all border border-gray-200 hover:border-gray-300 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-800 flex-1 pr-2">{task.content}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="ml-2 text-gray-400 hover:text-red-500 text-xs flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const PriorityMatrixWidget: React.FC<BaseWidgetProps> = ({ widget }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem(`priority-matrix-${widget.id}`);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  }, [widget.id]);

  useEffect(() => {
    localStorage.setItem(`priority-matrix-${widget.id}`, JSON.stringify(tasks));
  }, [tasks, widget.id]);

  const handleAddTask = useCallback((quadrant: string, content: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      content,
      quadrant: quadrant as Task['quadrant'],
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const handleDrop = useCallback((taskId: string, targetQuadrant: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, quadrant: targetQuadrant as Task['quadrant'] } : task
      )
    );
  }, []);

  const handleDragStart = useCallback((_taskId: string) => {
    // Handle drag start if needed
  }, []);

  const getTasksByQuadrant = (quadrant: Task['quadrant']) => {
    return tasks.filter(task => task.quadrant === quadrant);
  };

  const quadrants = [
    {
      id: 'do-first' as const,
      title: 'Do First',
      description: 'Urgent + Important',
      color: '#FEE2E2', // Light red
    },
    {
      id: 'schedule' as const,
      title: 'Schedule',
      description: 'Not Urgent + Important',
      color: '#FED7AA', // Light orange
    },
    {
      id: 'delegate' as const,
      title: 'Delegate',
      description: 'Urgent + Not Important',
      color: '#FEF3C7', // Light yellow
    },
    {
      id: 'eliminate' as const,
      title: 'Eliminate',
      description: 'Not Urgent + Not Important',
      color: '#F3F4F6', // Light gray
    },
  ];

  return (
    <div className="h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full p-2">
        {quadrants.map((quadrant) => (
          <Quadrant
            key={quadrant.id}
            id={quadrant.id}
            title={quadrant.title}
            description={quadrant.description}
            color={quadrant.color}
            tasks={getTasksByQuadrant(quadrant.id)}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default PriorityMatrixWidget;