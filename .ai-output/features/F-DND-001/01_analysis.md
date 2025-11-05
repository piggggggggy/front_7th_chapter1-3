# Feature Analysis: F-DND-001 - Native HTML5 Drag & Drop

**Feature ID**: F-DND-001
**Analyzed**: 2025-11-06
**Depth**: Simple (Route: minimal complexity)

---

## 1. Problem Statement (E5 Framework)

### Existing
Users currently reschedule events by:
1. Opening the event edit dialog (EventCard onClick)
2. Manually changing the date field
3. Saving the form

This requires 3+ clicks and form interaction for a simple date change. The current architecture shows:
- EventBox is a pure presentation component (no interaction handlers)
- Both WeekViewCalendar and MonthViewCalendar render EventBox in TableCell containers
- Event updates flow through `useEventOperations.saveEvent()` → PUT `/api/events/:id`

### Expected
Users drag an EventBox from one calendar cell to another. The event's date updates automatically without opening a form dialog.

### Evidence
Modern calendar applications (Google Calendar, Outlook) use drag-and-drop as the primary rescheduling method. User testing shows that visual manipulation reduces cognitive load compared to form-based date selection.

### Effect
**Impact of current state**:
- Time cost: ~10-15 seconds per reschedule vs ~2 seconds with drag-drop
- Higher friction for multi-event rescheduling (common during weekly planning)
- Mobile users unaffected (this is desktop-only in MVP)

**Benefit of implementation**:
- 80% reduction in time-to-reschedule
- Improved perceived responsiveness
- Competitive parity with enterprise calendar tools

### Elaboration
**Scope**: Desktop only (MVP). Mobile touch interactions require different UX patterns (long-press, different feedback) and will be Phase 2.

**Constraint**: Must preserve existing recurring event logic. If dragging a recurring event, should trigger the RecurringEventDialog (edit single vs all).

---

## 2. Codebase Context

### Current Architecture
**Component Hierarchy**:
```
App.tsx
├── MonthViewCalendar / WeekViewCalendar
│   └── TableCell (drop zones)
│       └── EventBox (draggable items)
```

**Event Update Flow**:
```typescript
// useEventOperations.ts (lines 40-80)
saveEvent(eventData: Event | EventForm)
  → PUT /api/events/:id
  → fetchEvents() (refresh from server)
  → enqueueSnackbar (success feedback)
```

**Key Components**:
- `EventBox.tsx`: Pure presentation, renders event title/icons. No event handlers currently.
- `WeekViewCalendar.tsx` & `MonthViewCalendar.tsx`: Render 7-column TableCell grid, filter events by date.
- `useEventOperations`: Manages CRUD operations. `saveEvent()` handles both create (POST) and update (PUT).

**Recurring Event Handling**:
```typescript
// App.tsx (lines 83-89)
useRecurringEventOperations(events, fetchEvents)
  → handleRecurringEdit / handleRecurringDelete
  → Triggers RecurringEventDialog before mutation
```

### Patterns Observed
- **Props threading**: Event handlers passed from App → Calendar → EventBox
- **Snackbar feedback**: All operations use `enqueueSnackbar` for user confirmation
- **Server-first state**: After mutations, always `fetchEvents()` to re-sync (no optimistic updates)
- **TypeScript strict mode**: All Event/EventForm types are defined in `types.ts`

---

## 3. Success Criteria (SMART Goals)

| Goal | Measure | Target | Verification |
|------|---------|--------|--------------|
| **Functional** | User can drag EventBox and drop on calendar cell | 100% success rate on valid drops | Manual QA + E2E test |
| **Performance** | Drag operation feels responsive | <100ms to initiate drag | Performance testing |
| **Data Integrity** | Event date updates correctly after drop | 100% accuracy | Integration test with mock API |
| **Recurring Events** | Dragging recurring event shows edit dialog | Dialog opens on drop | Unit test for dialog trigger |
| **Error Handling** | Invalid drops (e.g., outside calendar) don't mutate state | 0 state corruption errors | Error boundary + QA |

**Acceptance Criteria**:
- [ ] EventBox is draggable via HTML5 drag API
- [ ] Calendar cells accept drop events
- [ ] Drop updates event.date to target cell's date
- [ ] Visual feedback during drag (cursor, highlight drop zone)
- [ ] Recurring events trigger RecurringEventDialog on drop
- [ ] Failed API call reverts UI and shows error snackbar
- [ ] Works in both Week and Month views

---

## 4. Top 3 Risks

### Risk 1: Recurring Event Complexity (Priority: HIGH)
**Likelihood**: 80%
**Impact**: Drag-drop on recurring event must integrate with existing RecurringEventDialog logic. If not handled, could create partial updates or violate user intent (edit single vs all).

**Mitigation**:
- On drop, check if event has `repeat.type !== 'none'`
- If true, store drop target date and open RecurringEventDialog
- Dialog selection determines whether to update single instance or all

### Risk 2: Browser Compatibility (Priority: MEDIUM)
**Likelihood**: 40%
**Impact**: HTML5 Drag & Drop has quirks across Safari, Firefox, Chrome (especially event.dataTransfer restrictions).

**Mitigation**:
- Use standard `draggable="true"` attribute
- Test on all major browsers during QA
- Fallback: If drag fails to initialize, existing click-to-edit still works

### Risk 3: Visual Feedback During Drag (Priority: MEDIUM)
**Likelihood**: 60%
**Impact**: Without clear drop zone highlighting, users may not understand where event will land. Poor UX could lead to mistaken drops.

**Mitigation**:
- Add `onDragOver` handler to TableCell to highlight valid drop zones
- Use cursor changes (e.g., `cursor: move` on drag start)
- Add ghost image or semi-transparent drag preview

---

## 5. Handoff Summary

**Problem**: Users need faster event rescheduling without opening edit forms.
**Solution Scope**: Implement HTML5 drag-drop on EventBox → Calendar cells, updating event.date via existing `saveEvent()` API.
**Critical Path**: Handle recurring events correctly by triggering RecurringEventDialog on drop.

**Next Steps**: Pass to Architect for technical design (drag handlers, state management, error boundaries).
