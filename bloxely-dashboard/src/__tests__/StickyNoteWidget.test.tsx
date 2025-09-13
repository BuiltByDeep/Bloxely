import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import StickyNoteWidget from '../components/widgets/StickyNoteWidget';
import type { WidgetData } from '../types';

// Wrapper component for testing
const wrapper = ({ children }: { children: ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

const mockStickyNoteWidget: WidgetData = {
  id: 'sticky-note-1',
  type: 'sticky-note',
  content: {
    content: 'Test note content',
    color: { name: 'Yellow', gradient: 'linear-gradient(to bottom right, #fff59d, #fff176)' },
  },
  config: { title: 'Sticky Note' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('StickyNoteWidget', () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;
  let mockOnConfigUpdate: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnUpdate = vi.fn();
    mockOnConfigUpdate = vi.fn();
    user = userEvent.setup();
  });

  it('should display sticky note with default content and color', () => {
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const textarea = screen.getByDisplayValue('Test note content');
    expect(textarea).toBeInTheDocument();
    
    const container = textarea.closest('.sticky-note-widget');
    expect(container).toHaveStyle({ background: 'linear-gradient(to bottom right, #fff59d, #fff176)' });
  });

  it('should display placeholder when content is empty', () => {
    const emptyWidget = {
      ...mockStickyNoteWidget,
      content: { content: '', color: { name: 'Yellow', gradient: 'linear-gradient(to bottom right, #fff59d, #fff176)' } },
    };

    render(
      <StickyNoteWidget
        widget={emptyWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    expect(screen.getByPlaceholderText('Type your note here...')).toBeInTheDocument();
  });

  it('should update content in real-time when typing', async () => {
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const textarea = screen.getByDisplayValue('Test note content');
    
    // Simulate typing by directly changing the value
    fireEvent.change(textarea, { target: { value: 'Updated content' } });

    expect(mockOnUpdate).toHaveBeenCalledWith({
      content: 'Updated content',
      color: { name: 'Yellow', gradient: 'linear-gradient(to bottom right, #fff59d, #fff176)' },
    });
  });

  it('should show color picker when color button is clicked', async () => {
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const colorButton = screen.getByTitle('Change color');
    await user.click(colorButton);

    // Should show color palette
    const colorOptions = screen.getAllByRole('button');
    // Should have color button + 8 color palette options
    expect(colorOptions.length).toBeGreaterThan(8);
  });

  it('should change color when color palette option is selected', async () => {
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const colorButton = screen.getByTitle('Change color');
    await user.click(colorButton);

    // Find a different color option (pink)
    const colorOptions = screen.getAllByRole('button');
    const pinkColorOption = colorOptions.find(button => 
      button.style.background?.includes('linear-gradient') && 
      button.style.background?.includes('#f48fb1')
    );

    if (pinkColorOption) {
      await user.click(pinkColorOption);

      expect(mockOnUpdate).toHaveBeenCalledWith({
        content: 'Test note content',
        color: { name: 'Pink', gradient: 'linear-gradient(to bottom right, #f48fb1, #f06292)' },
      });
    }
  });

  it('should close color picker after selecting a color', async () => {
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const colorButton = screen.getByTitle('Change color');
    await user.click(colorButton);

    // Color picker should be open
    expect(screen.getAllByRole('button').length).toBeGreaterThan(8);

    // Click a color option
    const colorOptions = screen.getAllByRole('button');
    const firstColorOption = colorOptions[1]; // Skip the main color button
    await user.click(firstColorOption);

    // Color picker should be closed (back to just the main color button)
    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBe(1);
    });
  });

  it('should handle different background colors correctly', () => {
    const blueWidget = {
      ...mockStickyNoteWidget,
      content: { content: 'Blue note', color: { name: 'Blue', gradient: 'linear-gradient(to bottom right, #81d4fa, #4fc3f7)' } },
    };

    render(
      <StickyNoteWidget
        widget={blueWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const container = screen.getByDisplayValue('Blue note').closest('.sticky-note-widget');
    expect(container).toHaveStyle({ background: 'linear-gradient(to bottom right, #81d4fa, #4fc3f7)' });
  });

  it('should use default color when no color is specified', () => {
    const noColorWidget = {
      ...mockStickyNoteWidget,
      content: { content: 'No color note' },
    };

    render(
      <StickyNoteWidget
        widget={noColorWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const container = screen.getByDisplayValue('No color note').closest('.sticky-note-widget');
    expect(container).toHaveStyle({ background: 'linear-gradient(to bottom right, #fff59d, #fff176)' }); // Default yellow
  });

  it('should show focus ring when textarea is focused', async () => {
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const textarea = screen.getByDisplayValue('Test note content');
    
    await user.click(textarea);
    
    expect(textarea).toHaveClass('ring-2', 'ring-black/20', 'ring-inset');
  });

  it('should prevent event propagation on color picker interactions', async () => {
    const mockStopPropagation = vi.fn();
    
    render(
      <StickyNoteWidget
        widget={mockStickyNoteWidget}
        onUpdate={mockOnUpdate}
        onConfigUpdate={mockOnConfigUpdate}
      />,
      { wrapper }
    );

    const colorButton = screen.getByTitle('Change color');
    
    // Mock the event
    const clickEvent = new MouseEvent('click', { bubbles: true });
    clickEvent.stopPropagation = mockStopPropagation;
    
    fireEvent(colorButton, clickEvent);
    
    expect(mockStopPropagation).toHaveBeenCalled();
  });
});