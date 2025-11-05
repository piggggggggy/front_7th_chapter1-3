import { act, renderHook } from '@testing-library/react';
import { DragEvent } from 'react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { Event } from '../../types';

/**
 * Mock event factory for creating test events
 */
const createMockEvent = (overrides?: Partial<Event>): Event => {
  return {
    id: '1',
    title: 'Test Event',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: 'Test description',
    location: 'Test location',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...overrides,
  };
};

/**
 * Mock drag event factory for creating React.DragEvent mocks
 */
const createDragEvent = (type: string) => {
  const setDataMock = vi.fn();
  const getDataMock = vi.fn().mockReturnValue('');

  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      setData: setDataMock,
      getData: getDataMock,
      effectAllowed: 'move',
      dropEffect: 'move',
    },
  } as unknown as DragEvent<HTMLDivElement>;
};

describe('useDragAndDrop', () => {
  let onEventUpdate: ReturnType<typeof vi.fn>;
  let onRecurringEventDrop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onEventUpdate = vi.fn().mockResolvedValue(undefined);
    onRecurringEventDrop = vi.fn();
  });

  describe('초기 상태', () => {
    it('초기 상태에서 isDragging은 false이어야 한다', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('드래그 라이프사이클', () => {
    it('handleDragStart 호출 시 isDragging이 true로 설정된다', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent();
      const dragEvent = createDragEvent('dragstart');

      act(() => {
        result.current.handleDragStart(dragEvent, mockEvent);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('handleDragStart는 event 데이터를 dataTransfer에 JSON으로 설정한다', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent({ id: 'event-123' });
      const dragEvent = createDragEvent('dragstart');

      act(() => {
        result.current.handleDragStart(dragEvent, mockEvent);
      });

      expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(mockEvent)
      );
    });

    it('handleDragEnd 호출 시 isDragging이 false로 재설정된다', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent();
      const dragStartEvent = createDragEvent('dragstart');
      const dragEndEvent = createDragEvent('dragend');

      act(() => {
        result.current.handleDragStart(dragStartEvent, mockEvent);
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.handleDragEnd(dragEndEvent);
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('드롭 처리 - 비반복 일정', () => {
    it('비반복 일정을 새 날짜에 드롭하면 onEventUpdate가 호출된다', async () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent({
        id: '1',
        date: '2025-10-15',
        repeat: { type: 'none', interval: 0 },
      });
      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as Mock).mockReturnValue(JSON.stringify(mockEvent));

      await act(async () => {
        result.current.handleDrop(dragEvent, new Date('2025-10-20'));
      });

      expect(onEventUpdate).toHaveBeenCalledWith(mockEvent, '2025-10-20');
    });

    it('같은 날짜에 드롭하면 onEventUpdate가 호출되지 않는다', async () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent({ date: '2025-10-15' });
      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as Mock).mockReturnValue(JSON.stringify(mockEvent));

      await act(async () => {
        result.current.handleDrop(dragEvent, new Date('2025-10-15'));
      });

      expect(onEventUpdate).not.toHaveBeenCalled();
    });

    it('handleDrop은 preventDefault를 호출한다', async () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent();
      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as Mock).mockReturnValue(JSON.stringify(mockEvent));

      await act(async () => {
        result.current.handleDrop(dragEvent, new Date('2025-10-20'));
      });

      expect(dragEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('드롭 처리 - 반복 일정', () => {
    it('반복 일정을 드롭하면 onRecurringEventDrop이 호출된다', async () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent({
        date: '2025-10-15',
        repeat: { type: 'weekly', interval: 1 },
      });
      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as Mock).mockReturnValue(JSON.stringify(mockEvent));

      await act(async () => {
        result.current.handleDrop(dragEvent, new Date('2025-10-20'));
      });

      expect(onRecurringEventDrop).toHaveBeenCalledWith(mockEvent, '2025-10-20');
    });

    it('반복 일정을 드롭하면 onEventUpdate는 호출되지 않는다', async () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent({
        repeat: { type: 'daily', interval: 1 },
      });
      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as Mock).mockReturnValue(JSON.stringify(mockEvent));

      await act(async () => {
        result.current.handleDrop(dragEvent, new Date('2025-10-20'));
      });

      expect(onEventUpdate).not.toHaveBeenCalled();
    });
  });

  describe('드래그 오버 처리', () => {
    it('handleDragOver는 preventDefault를 호출하여 드롭을 활성화한다', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const dragEvent = createDragEvent('dragover');

      result.current.handleDragOver(dragEvent);

      expect(dragEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('onEventUpdate 실패 시에도 isDragging이 false로 재설정된다', async () => {
      const failingUpdate = vi.fn().mockRejectedValue(new Error('API error'));
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate: failingUpdate,
          onRecurringEventDrop,
        })
      );

      const mockEvent = createMockEvent({
        date: '2025-10-15',
        repeat: { type: 'none', interval: 0 },
      });
      const dragStartEvent = createDragEvent('dragstart');
      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as unknown as Mock).mockReturnValue(
        JSON.stringify(mockEvent)
      );

      act(() => {
        result.current.handleDragStart(dragStartEvent, mockEvent);
      });

      expect(result.current.isDragging).toBe(true);

      await act(async () => {
        try {
          result.current.handleDrop(dragEvent, new Date('2025-10-20'));
          // Wait for async operations to complete
          await new Promise((resolve) => setTimeout(resolve, 0));
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('유효하지 않은 dataTransfer 데이터는 무시된다', async () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onEventUpdate,
          onRecurringEventDrop,
        })
      );

      const dragEvent = createDragEvent('drop');
      (dragEvent.dataTransfer.getData as Mock).mockReturnValue('invalid json');

      await act(async () => {
        result.current.handleDrop(dragEvent, new Date('2025-10-20'));
      });

      expect(onEventUpdate).not.toHaveBeenCalled();
      expect(onRecurringEventDrop).not.toHaveBeenCalled();
    });
  });
});
