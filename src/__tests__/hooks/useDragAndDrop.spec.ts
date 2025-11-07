import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';

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
  } as unknown as React.DragEvent;
};

describe('useDragAndDrop', () => {
  let onDrop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onDrop = vi.fn().mockResolvedValue(undefined);
  });

  describe('초기 상태', () => {
    it('초기 상태에서 isDragging은 false이어야 한다', () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('드래그 라이프사이클', () => {
    it('handleDragStart 호출 시 isDragging이 true로 설정된다', () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const mockData = { id: '1', title: 'Test Item' };
      const dragEvent = createDragEvent('dragstart');

      act(() => {
        result.current.handleDragStart(dragEvent, mockData);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('handleDragStart는 데이터를 dataTransfer에 JSON으로 설정한다', () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const mockData = { id: 'item-123', value: 42 };
      const dragEvent = createDragEvent('dragstart');

      act(() => {
        result.current.handleDragStart(dragEvent, mockData);
      });

      expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(mockData)
      );
    });

    it('handleDragEnd 호출 시 isDragging이 false로 재설정된다', () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const mockData = { id: '1' };
      const dragStartEvent = createDragEvent('dragstart');
      const dragEndEvent = createDragEvent('dragend');

      act(() => {
        result.current.handleDragStart(dragStartEvent, mockData);
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.handleDragEnd(dragEndEvent);
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('드롭 처리', () => {
    it('데이터를 드롭하면 onDrop 콜백이 호출된다', async () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const mockData = { id: '1', title: 'Test' };
      const dropTarget = { targetId: 'target-1' };
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(mockData));

      await act(async () => {
        await result.current.handleDrop(dragEvent, dropTarget);
      });

      expect(onDrop).toHaveBeenCalledWith(mockData, dropTarget);
    });

    it('handleDrop은 preventDefault를 호출한다', async () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const mockData = { id: '1' };
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(mockData));

      await act(async () => {
        await result.current.handleDrop(dragEvent, { target: 'test' });
      });

      expect(dragEvent.preventDefault).toHaveBeenCalled();
    });

    it('드롭 완료 후 isDragging이 false로 재설정된다', async () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const mockData = { id: '1' };
      const dragStartEvent = createDragEvent('dragstart');
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(mockData));

      act(() => {
        result.current.handleDragStart(dragStartEvent, mockData);
      });

      expect(result.current.isDragging).toBe(true);

      await act(async () => {
        await result.current.handleDrop(dragEvent, { target: 'test' });
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('드래그 오버 처리', () => {
    it('handleDragOver는 preventDefault를 호출하여 드롭을 활성화한다', () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const dragEvent = createDragEvent('dragover');

      result.current.handleDragOver(dragEvent);

      expect(dragEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('onDrop 실패 시에도 isDragging이 false로 재설정된다', async () => {
      const failingDrop = vi.fn().mockRejectedValue(new Error('API error'));
      const { result } = renderHook(() => useDragAndDrop({ onDrop: failingDrop }));

      const mockData = { id: '1' };
      const dragStartEvent = createDragEvent('dragstart');
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(mockData));

      act(() => {
        result.current.handleDragStart(dragStartEvent, mockData);
      });

      expect(result.current.isDragging).toBe(true);

      await act(async () => {
        try {
          await result.current.handleDrop(dragEvent, { target: 'test' });
          // Wait for async operations to complete
          await new Promise((resolve) => setTimeout(resolve, 0));
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('유효하지 않은 dataTransfer 데이터는 무시된다', async () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue('invalid json');

      await act(async () => {
        await result.current.handleDrop(dragEvent, { target: 'test' });
      });

      expect(onDrop).not.toHaveBeenCalled();
    });

    it('빈 dataTransfer 데이터는 무시된다', async () => {
      const { result } = renderHook(() => useDragAndDrop({ onDrop }));

      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue('');

      await act(async () => {
        await result.current.handleDrop(dragEvent, { target: 'test' });
      });

      expect(onDrop).not.toHaveBeenCalled();
    });
  });

  describe('제네릭 타입 지원', () => {
    it('캘린더 use case: Event와 Date 타입을 사용할 수 있다', async () => {
      interface Event {
        id: string;
        title: string;
        date: string;
      }

      const calendarOnDrop = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDragAndDrop<Event, Date>({ onDrop: calendarOnDrop }));

      const event: Event = { id: '1', title: 'Meeting', date: '2025-10-15' };
      const targetDate = new Date('2025-10-20');
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(event));

      await act(async () => {
        await result.current.handleDrop(dragEvent, targetDate);
      });

      expect(calendarOnDrop).toHaveBeenCalledWith(event, targetDate);
    });

    it('칸반 보드 use case: Task와 복잡한 target 객체를 사용할 수 있다', async () => {
      interface Task {
        id: number;
        title: string;
      }
      interface KanbanTarget {
        columnId: string;
        index: number;
      }

      const kanbanOnDrop = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useDragAndDrop<Task, KanbanTarget>({ onDrop: kanbanOnDrop })
      );

      const task: Task = { id: 123, title: 'Implement feature' };
      const target: KanbanTarget = { columnId: 'done', index: 2 };
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(task));

      await act(async () => {
        await result.current.handleDrop(dragEvent, target);
      });

      expect(kanbanOnDrop).toHaveBeenCalledWith(task, target);
    });

    it('파일 업로드 use case: File과 폴더 ID를 사용할 수 있다', async () => {
      interface FileData {
        name: string;
        size: number;
      }
      interface UploadTarget {
        folderId: string;
      }

      const uploadOnDrop = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useDragAndDrop<FileData, UploadTarget>({ onDrop: uploadOnDrop })
      );

      const file: FileData = { name: 'document.pdf', size: 1024 };
      const target: UploadTarget = { folderId: 'folder-123' };
      const dragEvent = createDragEvent('drop');
      dragEvent.dataTransfer.getData.mockReturnValue(JSON.stringify(file));

      await act(async () => {
        await result.current.handleDrop(dragEvent, target);
      });

      expect(uploadOnDrop).toHaveBeenCalledWith(file, target);
    });
  });
});
