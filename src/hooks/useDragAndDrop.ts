import React, { useState } from 'react';

/**
 * Constants for drag and drop data transfer
 */
const DRAG_DATA_FORMAT = 'application/json';

/**
 * Parses data from drag data transfer string
 * @param dataString - JSON string from dataTransfer
 * @returns Parsed object or null if invalid JSON
 */
function parseDataFromTransfer<T>(dataString: string): T | null {
  try {
    return JSON.parse(dataString);
  } catch {
    return null;
  }
}

/**
 * Parameters for useDragAndDrop hook
 */
export interface UseDragAndDropParams<TDragData, TDropTarget> {
  /**
   * Callback when an item is dragged
   * @param event - React drag event
   * @param data - Data being dragged
   */
  onDragStart?: (event: React.DragEvent, dragData: TDragData) => void;
  /**
   * Callback when an item is dropped
   * @param draggedData - The data that was being dragged
   * @param dropTarget - The target where item was dropped
   */
  onDrop: (draggedData: TDragData, dropTarget: TDropTarget) => Promise<void> | void;
}

/**
 * Return type for useDragAndDrop hook
 */
export interface DragAndDropHandlers<TDragData, TDropTarget> {
  /**
   * Handler for drag start event
   * @param event - React drag event
   * @param data - Data being dragged
   */
  handleDragStart: (event: React.DragEvent, data: TDragData) => void;

  /**
   * Handler for drag end event
   * @param event - React drag event
   */
  handleDragEnd: (event: React.DragEvent) => void;

  /**
   * Handler for drag over event on drop zone
   * Prevents default to enable drop
   * @param event - React drag event
   */
  handleDragOver: (event: React.DragEvent) => void;

  /**
   * Handler for drag leave event on drop zone
   * @param event - React drag event
   */
  handleDragLeave: (event: React.DragEvent) => void;

  /**
   * Handler for drop event
   * @param event - React drag event
   * @param dropTarget - Target where item was dropped
   */
  handleDrop: (event: React.DragEvent, dropTarget: TDropTarget) => Promise<void>;

  /**
   * State indicating if an item is currently being dragged
   */
  isDragging: boolean;
}

/**
 * Custom hook for managing drag-and-drop functionality
 * Completely generic and agnostic to business logic
 *
 * This hook only handles HTML5 Drag & Drop API mechanics:
 * - Storing/retrieving data in dataTransfer
 * - Managing drag state
 * - Preventing default behaviors
 *
 * All business logic (validation, API calls, etc.) should be in onDrop callback
 *
 * @param params - Configuration callbacks
 * @returns Handlers and state for drag-drop interactions
 *
 * @example Calendar use case
 * ```tsx
 * const dragHandlers = useDragAndDrop<Event, Date>({
 *   onDrop: async (event, targetDate) => {
 *     await updateEvent(event, targetDate);
 *   }
 * });
 *
 * <EventBox onDragStart={(e) => dragHandlers.handleDragStart(e, event)} />
 * <TableCell onDrop={(e) => dragHandlers.handleDrop(e, cellDate)} />
 * ```
 *
 * @example Kanban board use case
 * ```tsx
 * const dragHandlers = useDragAndDrop<Task, { columnId: string, index: number }>({
 *   onDrop: async (task, target) => {
 *     await moveTask(task, target.columnId, target.index);
 *   }
 * });
 * ```
 *
 * @example File upload use case
 * ```tsx
 * const dragHandlers = useDragAndDrop<File, { folderId: string }>({
 *   onDrop: async (file, target) => {
 *     await uploadFile(file, target.folderId);
 *   }
 * });
 * ```
 */
export function useDragAndDrop<TDragData, TDropTarget>(
  params: UseDragAndDropParams<TDragData, TDropTarget>
): DragAndDropHandlers<TDragData, TDropTarget> {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent, data: TDragData): void => {
    // Store data in dataTransfer as JSON
    event.dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';

    // Set dragging state for visual feedback
    setIsDragging(true);

    params.onDragStart?.(event, data);
  };

  const handleDragEnd = (_: React.DragEvent): void => {
    // Reset dragging state
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent): void => {
    // Prevent default to enable drop
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (_: React.DragEvent): void => {
    // No-op for now - visual feedback can be added later if needed
  };

  const handleDrop = async (event: React.DragEvent, dropTarget: TDropTarget): Promise<void> => {
    // Prevent default browser behavior
    event.preventDefault();

    try {
      // Extract and parse data from dataTransfer
      const dataString = event.dataTransfer.getData(DRAG_DATA_FORMAT);
      const draggedData = parseDataFromTransfer<TDragData>(dataString);

      // Handle invalid JSON gracefully
      if (!draggedData) {
        return;
      }

      // Delegate to business logic callback
      await params.onDrop(draggedData, dropTarget);
    } catch (error) {
      // Error handling delegated to parent component
      // Just ensure state cleanup happens in finally
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
