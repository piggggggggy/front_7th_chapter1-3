# Implementation: F-DND-001 - Native HTML5 Drag & Drop

**Feature ID**: F-DND-001
**Implemented**: 2025-11-06
**Developer**: Claude Code
**Status**: GREEN ✅

---

## 1. Codebase Context

### Existing Hook Patterns Observed

**State Management**:
- `useState` for local state (e.g., `isDragging`)
- Clean, simple state updates in handlers

**Callback Patterns**:
- Hooks receive callbacks via parameters (e.g., `onEventUpdate`, `onRecurringEventDrop`)
- Async callbacks wrapped in try-catch-finally
- Callbacks called conditionally based on business logic

**Error Handling**:
- Try-catch blocks around async operations
- `enqueueSnackbar` used for user feedback (not in this hook, delegated to parent)
- Console.error for debugging

**Code Organization**:
- Interface definitions at top of file
- Constants for error messages
- Pure functions for calculations
- Hook returns object with handlers and state

**From useEventOperations.ts**:
- Async handlers use try-catch
- State updates after successful API calls
- Callbacks invoked after state updates (`onSave?.()`)

**From useSearch.ts**:
- Simple hooks with minimal state
- useMemo for derived state
- Return object with state and setters

---

## 2. Test Analysis

### Test Requirements (12 tests total)

**Initial State (1 test)**:
- isDragging starts as false ✓

**Drag Lifecycle (3 tests)**:
- handleDragStart sets isDragging to true
- handleDragStart serializes event to dataTransfer (JSON format)
- handleDragEnd resets isDragging to false

**Drop Handling - Non-Recurring (3 tests)**:
- Drop on new date calls onEventUpdate with (event, newDate)
- Drop on same date does NOT call onEventUpdate
- handleDrop calls preventDefault()

**Drop Handling - Recurring (2 tests)**:
- Drop recurring event calls onRecurringEventDrop
- Drop recurring event does NOT call onEventUpdate

**Drag Over (1 test)**:
- handleDragOver calls preventDefault() to enable drop

**Error Handling (2 tests)**:
- isDragging resets to false even if onEventUpdate fails
- Invalid JSON in dataTransfer is ignored (no callbacks)

---

## 3. Implementation Strategy

### Key Requirements

**Data Transfer Format**:
- Serialize entire Event object as JSON
- Use 'application/json' as data type
- Parse JSON on drop, handle invalid JSON gracefully

**Date Handling**:
- Convert Date to YYYY-MM-DD: `targetDate.toISOString().split('T')[0]`
- Compare dates as strings to detect same-date drops

**Recurring Event Detection**:
- Check `event.repeat.type !== 'none'` to identify recurring events
- Route to appropriate callback (onEventUpdate vs onRecurringEventDrop)

**State Management**:
- Set isDragging in handleDragStart
- Reset isDragging in handleDragEnd
- Also reset isDragging after drop completes (success or error)

**Error Resilience**:
- Wrap async callbacks in try-catch-finally
- Always reset isDragging in finally block
- Silently ignore invalid dataTransfer data

---

## 4. Code Implementation

### Implementation Details

**handleDragStart**:
1. Store event data in dataTransfer as JSON
2. Set isDragging to true

**handleDragEnd**:
1. Reset isDragging to false

**handleDragOver**:
1. Call preventDefault() to enable drop

**handleDragLeave**:
1. No-op for now (visual feedback can be added later)

**handleDrop**:
1. Call preventDefault()
2. Extract JSON from dataTransfer
3. Parse JSON, catch errors
4. If invalid JSON, return early
5. Format targetDate as YYYY-MM-DD
6. Check if same date, return early if so
7. Check if recurring event (repeat.type !== 'none')
8. Call appropriate callback
9. Reset isDragging after callback completes (in finally)

---

## 5. Test Execution Results

### Pre-Implementation Status
- Total Tests: 12
- Passed: 1 (initial state test)
- Failed: 11 (NotImplementedError)

### First Run (After Implementation)

**Command**:
```bash
nvm use 22
npm test src/__tests__/hooks/useDragAndDrop.spec.ts
```

**Results**: ALL 12 TESTS PASSED ✅

**Output**:
```
✓ src/__tests__/hooks/useDragAndDrop.spec.ts (12 tests) 45ms

Test Files  1 passed (1)
     Tests  12 passed (12)
```

**Test Breakdown**:

✓ 초기 상태
  ✓ 초기 상태에서 isDragging은 false이어야 한다

✓ 드래그 라이프사이클
  ✓ handleDragStart 호출 시 isDragging이 true로 설정된다
  ✓ handleDragStart는 event 데이터를 dataTransfer에 JSON으로 설정한다
  ✓ handleDragEnd 호출 시 isDragging이 false로 재설정된다

✓ 드롭 처리 - 비반복 일정
  ✓ 비반복 일정을 새 날짜에 드롭하면 onEventUpdate가 호출된다
  ✓ 같은 날짜에 드롭하면 onEventUpdate가 호출되지 않는다
  ✓ handleDrop은 preventDefault를 호출한다

✓ 드롭 처리 - 반복 일정
  ✓ 반복 일정을 드롭하면 onRecurringEventDrop이 호출된다
  ✓ 반복 일정을 드롭하면 onEventUpdate는 호출되지 않는다

✓ 드래그 오버 처리
  ✓ handleDragOver는 preventDefault를 호출하여 드롭을 활성화한다

✓ 에러 처리
  ✓ onEventUpdate 실패 시에도 isDragging이 false로 재설정된다
  ✓ 유효하지 않은 dataTransfer 데이터는 무시된다

**Test Duration**: 45ms
**No errors or warnings**

---

## 6. Implementation Notes

### Key Decisions

**Date Formatting**:
- Used `toISOString().split('T')[0]` for consistent YYYY-MM-DD format
- Matches existing date format in codebase

**Error Handling**:
- Try-catch-finally pattern ensures isDragging always resets
- Invalid JSON silently ignored (no user-facing error)
- Error propagation handled by parent component

**Callback Execution**:
- Async callbacks awaited to ensure proper sequencing
- State reset happens in finally block regardless of success/failure

**Code Simplicity**:
- Minimal logic in each handler
- No premature optimization
- No unnecessary state

### Patterns Followed

**From useEventOperations**:
- Try-catch-finally for async operations
- Optional callback invocation with `?.()` (not needed here)

**From useSearch**:
- Simple return object with handlers and state
- No unnecessary complexity

**Hook Conventions**:
- TypeScript interfaces for parameters and return types
- JSDoc comments for public API
- Descriptive handler names

---

## 7. Handoff Summary

**Status**: GREEN PHASE COMPLETE ✅
All 12 tests passing. Hook ready for integration into App.tsx and Calendar components.

**Next Steps** (for integration):
1. Import useDragAndDrop in App.tsx
2. Create handleEventDrop and handleRecurringEventDropIntent callbacks
3. Pass handlers to Calendar components via props
4. Wire up EventBox draggable props
5. Wire up TableCell drop zone props

**Files Modified**:
- `/Users/Dev/plus-fe/front_7th_chapter1-3/src/hooks/useDragAndDrop.ts` - Complete implementation

**Test File**:
- `/Users/Dev/plus-fe/front_7th_chapter1-3/src/__tests__/hooks/useDragAndDrop.spec.ts` - All passing
