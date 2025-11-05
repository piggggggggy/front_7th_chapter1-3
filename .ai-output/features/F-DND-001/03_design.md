# Technical Design: F-DND-001 - Native HTML5 Drag & Drop

**Feature ID**: F-DND-001
**Designed**: 2025-11-06
**Depth**: Simple
**Architect**: Claude Code

---

## 1. Codebase Context

### Existing Architecture

**Component Structure**:
- `EventBox`: Pure presentation component rendering event title with icons (Notifications, Repeat)
- `WeekViewCalendar` & `MonthViewCalendar`: Render 7-column TableCell grids, filter events by date
- No existing drag handlers or event propagation patterns observed

**Props Flow Pattern**:
```
App.tsx (state container)
  → Calendar Views (WeekViewCalendar, MonthViewCalendar)
    → TableCell (rendering container)
      → EventBox (presentation component)
```

**Event Update Flow**:
```typescript
useEventOperations.saveEvent(eventData)
  → PUT /api/events/:id (for existing events)
  → POST /api/events (for new events)
  → fetchEvents() (server-first re-sync)
  → enqueueSnackbar (user feedback)
```

**Hook Usage Patterns**:
- Custom hooks isolated in `/src/hooks/` directory
- Hooks return handlers and state (e.g., `useEventOperations` returns `{ saveEvent, deleteEvent, ... }`)
- `useSnackbar` from notistack used for all user feedback
- All hooks use TypeScript strict mode with explicit interface definitions

**Recurring Event Handling**:
- `useRecurringEventOperations` provides `handleRecurringEdit` and `handleRecurringDelete`
- `RecurringEventDialog` component controls single vs. all edit selection
- App.tsx orchestrates dialog flow: `setPendingRecurringEdit` → `setIsRecurringDialogOpen` → `handleRecurringConfirm`

**Naming Conventions**:
- Event handlers: `handle{Action}` (e.g., handleEditEvent, handleRecurringConfirm)
- State setters: `set{StateName}` (e.g., setIsRecurringDialogOpen)
- Custom hooks: `use{Capability}` (e.g., useEventOperations)

---

## 2. API Contracts

### useDragAndDrop Hook

```typescript
// src/hooks/useDragAndDrop.ts

interface DragAndDropHandlers {
  // EventBox handlers (draggable)
  handleDragStart: (event: React.DragEvent<HTMLDivElement>, eventData: Event) => void;
  handleDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;

  // TableCell handlers (drop zone)
  handleDragOver: (event: React.DragEvent<HTMLTableCellElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLTableCellElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLTableCellElement>, targetDate: Date) => void;

  // State
  isDragging: boolean;
}

interface UseDragAndDropParams {
  onEventUpdate: (event: Event, newDate: string) => Promise<void>;
  onRecurringEventDrop: (event: Event, newDate: string) => void;
}

export function useDragAndDrop(params: UseDragAndDropParams): DragAndDropHandlers;
```

### Component Prop Extensions

**EventBox.tsx**:
```typescript
interface EventBoxProps {
  event: Event;
  isNotified: boolean;
  // NEW: Drag handlers
  onDragStart?: (event: React.DragEvent<HTMLDivElement>, eventData: Event) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}
```

**WeekViewCalendar.tsx** & **MonthViewCalendar.tsx**:
```typescript
interface CalendarViewProps {
  // ... existing props ...
  // NEW: Drop handlers
  onEventDrop?: (event: Event, newDate: string) => Promise<void>;
  onRecurringEventDrop?: (event: Event, newDate: string) => void;
}
```

### Event Handler Signatures

```typescript
// App.tsx additions
const handleEventDrop = async (event: Event, newDate: string): Promise<void> => {
  const updatedEvent = { ...event, date: newDate };
  await saveEvent(updatedEvent);
};

const handleRecurringEventDropIntent = (event: Event, newDate: string): void => {
  setPendingRecurringEdit({ ...event, date: newDate });
  setRecurringDialogMode('edit');
  setIsRecurringDialogOpen(true);
};
```

---

## 3. Architecture Decisions

### ADR-001: Custom Hook for Drag-Drop Logic Isolation

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Drag-and-drop requires coordinating state across EventBox (draggable) and TableCell (drop zone). Need to manage drag state, data transfer, and event handlers.

**Decision**: Create `useDragAndDrop` custom hook that encapsulates all drag-drop logic and returns handlers for both source and target components.

**Rationale**:
- Follows existing codebase pattern of isolating logic in custom hooks (`useEventOperations`, `useRecurringEventOperations`)
- Keeps EventBox and Calendar components as presentation-focused
- Centralizes drag state management (e.g., `isDragging` for visual feedback)
- Easier to test in isolation

**Consequences**:
- Hook must be called at App.tsx level and handlers passed down via props
- Adds props threading through Calendar → EventBox layers
- Single source of truth for drag-drop behavior

**Alternatives Considered**:
- Inline handlers in App.tsx: Clutters main component
- Context API: Overkill for single-feature state

---

### ADR-002: Native HTML5 Drag & Drop vs Library

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Need drag-drop functionality. Options: (1) Native HTML5 API, (2) Library like react-dnd or dnd-kit.

**Decision**: Use native HTML5 Drag & Drop API with `draggable` attribute and event handlers.

**Rationale**:
- Zero dependencies: Codebase already minimal (no large UI libraries beyond MUI)
- Simple use case: Single drag source (EventBox) → single drop target type (TableCell)
- Performance: Native browser implementation is fastest
- Mobile note: This is desktop-only in MVP (per analysis doc), touch support deferred to Phase 2

**Consequences**:
- Need to handle browser quirks (Safari dataTransfer restrictions)
- Manual visual feedback (no library-provided drag layer)
- Testing requires DOM event simulation

**Alternatives Considered**:
- react-dnd: 130KB+ bundle size for minimal feature gain
- dnd-kit: Better touch support, but not needed in MVP

---

### ADR-003: Props Threading for Handlers

**Status**: Accepted
**Date**: 2025-11-06

**Context**: EventBox needs drag handlers, but is 3 levels deep: App → Calendar → TableCell → EventBox.

**Decision**: Pass drag handlers explicitly via props at each level.

**Rationale**:
- Matches existing codebase pattern (e.g., `onEdit` and `onDelete` handlers passed to EventList → EventCard)
- Explicit data flow: Easy to trace handler origin
- TypeScript enforces contract at each boundary
- No global state pollution

**Consequences**:
- Props drilling through Calendar and TableCell layers
- Each intermediate component must forward handlers
- Prop interfaces need to be extended

**Alternatives Considered**:
- Context API: Violates existing pattern, adds complexity
- Callbacks via refs: Non-idiomatic in React

---

### ADR-004: Recurring Event Integration Strategy

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Dragging a recurring event requires user intent (edit single vs. all), but drop event is immediate.

**Decision**: On drop of recurring event, store target date in pending state and trigger RecurringEventDialog (same flow as edit button click).

**Rationale**:
- Reuses existing RecurringEventDialog and orchestration logic in App.tsx
- Consistent UX: Same dialog appears whether user clicks edit or drags recurring event
- No special-case logic in drag-drop hook
- Preserves existing `handleRecurringEdit` mutation flow

**Consequences**:
- Drag-drop doesn't immediately update recurring events (dialog interrupts)
- Need separate handler: `onRecurringEventDrop` passed to hook
- Drop handler must check `event.repeat.type !== 'none'` before updating

**Alternatives Considered**:
- Auto-edit single instance: Violates user agency
- Disable drag for recurring events: Poor UX, confusing

---

## 4. Test Architecture

### Test Structure

**Unit Tests**: `src/__tests__/hooks/useDragAndDrop.spec.ts`
- Test hook in isolation using `@testing-library/react-hooks`
- Mock callback functions (`onEventUpdate`, `onRecurringEventDrop`)

**Integration Tests**: `src/__tests__/integration/dragAndDropCalendar.spec.tsx`
- Render full App component
- Simulate drag events on EventBox and drop on TableCell
- Verify event date updates and server calls

### What to Test

**Hook Behavior**:
- `handleDragStart` sets `isDragging` to true and stores event data in dataTransfer
- `handleDragEnd` resets `isDragging` to false
- `handleDrop` calls `onEventUpdate` for non-recurring events
- `handleDrop` calls `onRecurringEventDrop` for recurring events (type !== 'none')
- `handleDragOver` prevents default to enable drop

**Event Updates**:
- Drop on new date updates event.date via `saveEvent` API
- Failed API call shows error snackbar
- Successful update shows success snackbar

**Recurring Event Flow**:
- Drop recurring event opens RecurringEventDialog
- Dialog selection triggers `handleRecurringEdit` with updated date

**Visual Feedback**:
- `isDragging` state can be used for opacity changes or cursor styling
- Drop zone highlight on `handleDragOver`

### Example Test Cases

**Happy Path**:
```typescript
describe('useDragAndDrop - Happy Path', () => {
  it('should update event date when dropped on new cell in week view', async () => {
    const onEventUpdate = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onEventUpdate, onRecurringEventDrop: vi.fn() }));

    const mockEvent: Event = { id: '1', title: 'Meeting', date: '2025-11-01', ... };
    const dragEvent = createDragEvent('dragstart');

    act(() => result.current.handleDragStart(dragEvent, mockEvent));

    const targetDate = new Date('2025-11-05');
    const dropEvent = createDragEvent('drop');

    await act(async () => result.current.handleDrop(dropEvent, targetDate));

    expect(onEventUpdate).toHaveBeenCalledWith(mockEvent, '2025-11-05');
  });
});
```

**Error Case**:
```typescript
describe('useDragAndDrop - Error Handling', () => {
  it('should trigger recurring dialog when dropping recurring event', async () => {
    const onRecurringEventDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onEventUpdate: vi.fn(), onRecurringEventDrop }));

    const recurringEvent: Event = { id: '2', title: 'Weekly', repeat: { type: 'weekly', interval: 1 }, ... };
    const dragEvent = createDragEvent('dragstart');

    act(() => result.current.handleDragStart(dragEvent, recurringEvent));

    const targetDate = new Date('2025-11-06');
    const dropEvent = createDragEvent('drop');

    await act(async () => result.current.handleDrop(dropEvent, targetDate));

    expect(onRecurringEventDrop).toHaveBeenCalledWith(recurringEvent, '2025-11-06');
  });
});
```

**Edge Case**:
```typescript
describe('useDragAndDrop - Edge Cases', () => {
  it('should not trigger update when dropped on same date', async () => {
    const onEventUpdate = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onEventUpdate, onRecurringEventDrop: vi.fn() }));

    const mockEvent: Event = { id: '1', title: 'Meeting', date: '2025-11-01', ... };
    const dragEvent = createDragEvent('dragstart');

    act(() => result.current.handleDragStart(dragEvent, mockEvent));

    const sameDate = new Date('2025-11-01');
    const dropEvent = createDragEvent('drop');

    await act(async () => result.current.handleDrop(dropEvent, sameDate));

    expect(onEventUpdate).not.toHaveBeenCalled();
  });
});
```

---

## 5. Implementation Strategy

### Phase 1: Create useDragAndDrop Hook (1-2 hours)

**File**: `src/hooks/useDragAndDrop.ts`

**Tasks**:
- Define `UseDragAndDropParams` and `DragAndDropHandlers` interfaces
- Implement `handleDragStart`: Set dataTransfer with event ID, update `isDragging` state
- Implement `handleDragEnd`: Reset `isDragging` state
- Implement `handleDrop`: Extract event data, check if recurring, call appropriate callback
- Implement `handleDragOver`: Prevent default to enable drop
- Implement `handleDragLeave`: Clear drop zone highlight state (if needed)

**Acceptance**:
- Hook compiles with no TypeScript errors
- Skeleton tests run and fail correctly (RED phase)

---

### Phase 2: Make EventBox Draggable (30 mins)

**File**: `src/components/EventBox.tsx`

**Tasks**:
- Add `draggable={true}` attribute to root Box component
- Accept `onDragStart` and `onDragEnd` props in EventBoxProps
- Wire up handlers: `onDragStart={(e) => onDragStart?.(e, event)}`
- Add cursor styling: `cursor: 'move'` when draggable

**Acceptance**:
- EventBox can be dragged (visual drag ghost appears)
- `onDragStart` fires when drag begins

---

### Phase 3: Add Drop Handlers to Calendar Cells (1 hour)

**Files**: `src/components/WeekViewCalendar.tsx`, `src/components/MonthViewCalendar.tsx`

**Tasks**:
- Import `useDragAndDrop` hook (called in App.tsx, handlers passed down)
- Add `onDragOver`, `onDragLeave`, `onDrop` handlers to TableCell
- Pass `targetDate` to `onDrop` (from `date` variable in cell render loop)
- Optional: Add CSS highlight on drag-over (border color change)
- Forward drag handlers to EventBox: `<EventBox onDragStart={...} onDragEnd={...} />`

**Acceptance**:
- Drop zones respond to drag-over (preventDefault allows drop)
- Drop event fires with correct target date
- EventBox receives and uses drag handlers

---

### Phase 4: Wire Up in App.tsx (30 mins)

**File**: `src/App.tsx`

**Tasks**:
- Import `useDragAndDrop` hook
- Create `handleEventDrop` function: Call `saveEvent` with updated date
- Create `handleRecurringEventDropIntent` function: Set pending state + open dialog
- Instantiate hook: `const dragHandlers = useDragAndDrop({ onEventUpdate: handleEventDrop, onRecurringEventDrop: handleRecurringEventDropIntent })`
- Pass `dragHandlers` to WeekViewCalendar and MonthViewCalendar as props
- Modify RecurringEventDialog logic to handle date updates from drag-drop (if pending state includes new date)

**Acceptance**:
- Dragging non-recurring event updates date and triggers save
- Dragging recurring event opens RecurringEventDialog
- Success/error snackbars appear after drop

---

## 6. Data Flow Diagram

```
User drags EventBox
  ↓
handleDragStart (useDragAndDrop)
  → Store event data in dataTransfer
  → Set isDragging = true
  ↓
User drops on TableCell
  ↓
handleDrop (useDragAndDrop)
  → Extract event data
  → Check if event.repeat.type !== 'none'
  ↓
  ├─ If NON-RECURRING:
  │    → Call onEventUpdate(event, newDate)
  │    → App.handleEventDrop()
  │    → saveEvent({ ...event, date: newDate })
  │    → PUT /api/events/:id
  │    → fetchEvents() (re-sync)
  │    → enqueueSnackbar("일정이 수정되었습니다")
  │
  └─ If RECURRING:
       → Call onRecurringEventDrop(event, newDate)
       → App.handleRecurringEventDropIntent()
       → setPendingRecurringEdit({ ...event, date: newDate })
       → setIsRecurringDialogOpen(true)
       → User selects "single" or "all"
       → handleRecurringConfirm()
       → handleRecurringEdit(updatedEvent, editSingleOnly)
       → PUT /api/events/:id or batch update
       → fetchEvents() (re-sync)
```

---

## 7. Handoff Summary

**Design Scope**: Native HTML5 drag-drop with custom `useDragAndDrop` hook. Handlers thread through App → Calendar → EventBox. Recurring events reuse existing RecurringEventDialog flow.

**Next Steps**: QA receives skeleton hook + prop interfaces. Dev implements handlers and wires up components per 4-phase plan.

**Critical Path**: Phase 4 (recurring event integration) requires careful state management—ensure dialog receives updated event with new date from drop.
