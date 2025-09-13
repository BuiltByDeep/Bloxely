import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoWidget from '../components/widgets/TodoWidget';
import type { WidgetData } from '../types/dashboard';

// Mock widget data
const mockTodoWidget: WidgetData = {
  id: 'todo-1',
  type: 'todo',
  content: { tasks: [] },
  config: { title: 'Todo List' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTodoWidgetWithTasks: WidgetData = {
  id: 'todo-2',
  type: 'todo',
  content: {
    tasks: [
      {
        id: '1',
        text: 'Complete project',
        completed: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        text: 'Review code',
        completed: true,
        createdAt: new Date(),
      },
    ],
  },
  config: { title: 'Todo List' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TodoWidget', () => {
  const mockOnUpdate = vi.fn();
  const mockOnConfigUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when no tasks exist', () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('No tasks in your Todo List yet')).toBeInTheDocument();
    expect(screen.getByText('Add a task above to get started')).toBeInTheDocument();
  });

  it('should display input field and add button', () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should add a new task when typing and pressing enter', async () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        tasks: [
          expect.objectContaining({
            text: 'New task',
            completed: false,
            id: expect.any(String),
            createdAt: expect.any(Date),
          }),
        ],
      });
    });
  });

  it('should add a new task when clicking add button', async () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        tasks: [
          expect.objectContaining({
            text: 'New task',
            completed: false,
            id: expect.any(String),
            createdAt: expect.any(Date),
          }),
        ],
      });
    });
  });

  it('should not add empty tasks', () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should display existing tasks with correct completion status', () => {
    render(
      <TodoWidget
        widget={mockTodoWidgetWithTasks}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('Review code')).toBeInTheDocument();

    // Check that completed task has strikethrough styling
    const completedTask = screen.getByText('Review code');
    expect(completedTask).toHaveClass('line-through');
  });

  it('should toggle task completion when clicking checkbox', async () => {
    render(
      <TodoWidget
        widget={mockTodoWidgetWithTasks}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const checkboxes = screen.getAllByRole('button');
    const firstTaskCheckbox = checkboxes.find(button => 
      button.closest('.task-item')?.textContent?.includes('Complete project')
    );

    fireEvent.click(firstTaskCheckbox!);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        tasks: [
          expect.objectContaining({
            id: '1',
            text: 'Complete project',
            completed: true,
          }),
          expect.objectContaining({
            id: '2',
            text: 'Review code',
            completed: true,
          }),
        ],
      });
    });
  });

  it('should delete task when clicking delete button', async () => {
    render(
      <TodoWidget
        widget={mockTodoWidgetWithTasks}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    // Find delete button for first task
    const taskItem = screen.getByText('Complete project').closest('.task-item');
    const deleteButton = taskItem?.querySelector('button[title="Delete task"]');

    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        tasks: [
          expect.objectContaining({
            id: '2',
            text: 'Review code',
            completed: true,
          }),
        ],
      });
    });
  });

  it('should clear input field after adding task', async () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const input = screen.getByPlaceholderText('Add a new task...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should disable add button when input is empty', () => {
    render(
      <TodoWidget
        widget={mockTodoWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'New task' } });
    expect(addButton).not.toBeDisabled();
  });

  it('should display tasks without header', () => {
    render(
      <TodoWidget
        widget={mockTodoWidgetWithTasks}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />
    );

    // Should not have header with task count
    expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('1/2 completed')).not.toBeInTheDocument();
  });
});