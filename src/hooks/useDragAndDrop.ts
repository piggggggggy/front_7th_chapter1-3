import { useState, DragEvent } from 'react';

import { Event } from '../types';

/**
 * Constants for drag and drop data transfer
 */
const DRAG_DATA_FORMAT = 'application/json';
const NO_REPEAT = 'none';

/**
 * Formats a Date object to YYYY-MM-DD string format
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parses event data from drag data transfer string
 * @param dataString - JSON string from dataTransfer
 * @returns Parsed Event object or null if invalid JSON
 */
function parseEventFromDragData(dataString: string): Event | null {
  try {
    return JSON.parse(dataString);
  } catch {
    return null;
  }
}

/**
 * Parameters for useDragAndDrop hook
 */
export interface UseDragAndDropParams {
  /**
   * Callback when a non-recurring event is dropped on a new date
   * @param event - The event being moved
   * @param newDate - Target date in YYYY-MM-DD format
   */
  onEventUpdate: (event: Event, newDate: string) => Promise<void>;

  /**
   * Callback when a recurring event is dropped (triggers dialog for single vs. all edit)
   * @param event - The recurring event being moved
   * @param newDate - Target date in YYYY-MM-DD format
   */
  onRecurringEventDrop: (event: Event, newDate: string) => void;
}

/**
 * Return type for useDragAndDrop hook
 */
export interface DragAndDropHandlers {
  /**
   * Handler for drag start event on EventBox
   * @param event - React drag event
   * @param eventData - Event data being dragged
   */
  handleDragStart: (event: DragEvent<HTMLElement>, eventData: Event) => void;

  /**
   * Handler for drag end event on EventBox
   * @param event - React drag event
   */
  handleDragEnd: (event: DragEvent<HTMLElement>) => void;

  /**
   * Handler for drag over event on TableCell (drop zone)
   * Prevents default to enable drop
   * @param event - React drag event
   */
  handleDragOver: (event: DragEvent<HTMLElement>) => void;

  /**
   * Handler for drag leave event on TableCell (drop zone)
   * @param event - React drag event
   */
  handleDragLeave: (event: DragEvent<HTMLElement>) => void;

  /**
   * Handler for drop event on TableCell
   * @param event - React drag event
   * @param targetDate - Date of the cell where event was dropped
   */
  handleDrop: (event: DragEvent<HTMLElement>, targetDate: Date) => Promise<void>;

  /**
   * State indicating if an event is currently being dragged
   */
  isDragging: boolean;
}

/**
 * Custom hook for managing drag-and-drop functionality in calendar
 * Encapsulates HTML5 Drag & Drop API logic for moving events between calendar cells
 *
 * @param params - Configuration callbacks for event updates
 * @returns Handlers and state for drag-drop interactions
 *
 * @example
 * ```tsx
 * const dragHandlers = useDragAndDrop({
 *   onEventUpdate: async (event, newDate) => {
 *     await saveEvent({ ...event, date: newDate });
 *   },
 *   onRecurringEventDrop: (event, newDate) => {
 *     openRecurringDialog(event, newDate);
 *   }
 * });
 *
 * // Pass handlers to components
 * <EventBox onDragStart={dragHandlers.handleDragStart} onDragEnd={dragHandlers.handleDragEnd} />
 * <TableCell onDrop={(e) => dragHandlers.handleDrop(e, cellDate)} onDragOver={dragHandlers.handleDragOver} />
 * ```
 */
export function useDragAndDrop(params: UseDragAndDropParams): DragAndDropHandlers {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: DragEvent<HTMLElement>, eventData: Event): void => {
    // Store event data in dataTransfer as JSON
    event.dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(eventData));
    event.dataTransfer.effectAllowed = 'move';

    // Set dragging state for visual feedback
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEvent<HTMLElement>): void => {
    // Reset dragging state
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>): void => {
    // Prevent default to enable drop
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>): void => {
    // No-op for now - visual feedback can be added later if needed
  };

  const handleDrop = async (event: DragEvent<HTMLElement>, targetDate: Date): Promise<void> => {
    // Prevent default browser behavior
    event.preventDefault();

    try {
      // Extract and parse event data from dataTransfer
      const eventDataStr = event.dataTransfer.getData(DRAG_DATA_FORMAT);
      const eventData = parseEventFromDragData(eventDataStr);

      // Handle invalid JSON gracefully
      if (!eventData) {
        return;
      }

      // Format target date as YYYY-MM-DD
      const newDate = formatDateString(targetDate);

      // No-op if dropped on same date
      if (eventData.date === newDate) {
        return;
      }

      // Route to appropriate callback based on event type
      if (eventData.repeat.type !== NO_REPEAT) {
        // Recurring event - trigger dialog
        params.onRecurringEventDrop(eventData, newDate);
      } else {
        // Non-recurring event - update directly
        try {
          await params.onEventUpdate(eventData, newDate);
        } catch (error) {
          // Error handling delegated to parent component
          // Just ensure state cleanup happens in finally
        }
      }
    } finally {
      // Always reset dragging state, even on error
      setIsDragging(false);
    }
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
  };
}
