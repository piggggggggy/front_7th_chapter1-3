# Component Extraction Analysis: App.tsx

**Project**: CE-APP (Component Extraction - App.tsx)
**Target File**: `/Users/Dev/plus-fe/front_7th_chapter1-3/src/App.tsx`
**Analysis Date**: 2025-11-05
**Route**: Standard
**Current Status**: All 180 tests passing ✅

---

## 1. Monolithic File Assessment

### File Metrics
- **File size**: 864 lines
- **Main component**: `App`
- **Component start line**: 109
- **Component end line**: 864
- **Cyclomatic complexity**: High (multiple conditional renders, nested logic)

### Identified Structures

#### Render Functions
1. **`renderWeekView()`** - Lines 293-373 (81 lines)
   - Renders week calendar grid with events
   - Uses: `currentDate`, `filteredEvents`, `notifiedEvents`, `weekDays`
   - Returns: Week view JSX with Table structure

2. **`renderMonthView()`** - Lines 375-478 (104 lines)
   - Renders monthly calendar grid with events
   - Uses: `currentDate`, `filteredEvents`, `notifiedEvents`, `holidays`, `weekDays`
   - Returns: Month view JSX with Table structure

#### Helper Functions
3. **`getRepeatTypeLabel(type: RepeatType)`** - Lines 94-107 (14 lines)
   - Pure utility function for repeat type labels
   - No external dependencies
   - Returns: Korean label string

4. **`isRecurringEvent(event: Event)`** - Lines 191-193 (3 lines)
   - Checks if event is recurring
   - Simple boolean check
   - Returns: boolean

#### Event Handlers
5. **`handleRecurringConfirm(editSingleOnly: boolean)`** - Lines 170-189 (20 lines)
   - Handles recurring event edit/delete confirmation
   - Complex state management
   - Multiple side effects

6. **`handleEditEvent(event: Event)`** - Lines 195-205 (11 lines)
   - Handles edit button click
   - Determines if recurring dialog needed

7. **`handleDeleteEvent(event: Event)`** - Lines 207-217 (11 lines)
   - Handles delete button click
   - Determines if recurring dialog needed

8. **`addOrUpdateEvent()`** - Lines 219-291 (73 lines)
   - Main event save/update logic
   - Complex validation and overlap checking

#### JSX Blocks (Inline Components)
9. **Event Form Section** - Lines 483-673 (191 lines)
   - Left sidebar with all form inputs
   - 12+ form fields
   - Conditional repeat form rendering

10. **Calendar View Section** - Lines 675-702 (28 lines)
   - Center section with view controls
   - Navigation buttons
   - View type selector

11. **Event List Section** - Lines 704-784 (81 lines)
   - Right sidebar with search and event list
   - Maps through filtered events
   - Edit/delete controls

12. **Event Card in List** - Lines 724-781 (58 lines)
   - Individual event display in sidebar
   - Complex nested Typography/Stack layout
   - Notification/repeat indicators

13. **Event Box in Calendar** - Lines 335-362 (28 lines) & 427-463 (37 lines)
   - Event display in calendar cells (week view)
   - Event display in calendar cells (month view)
   - Notification/repeat indicators

14. **Overlap Warning Dialog** - Lines 787-825 (39 lines)
   - Dialog for overlapping events warning
   - Inline event list display

15. **Notification Alerts** - Lines 839-859 (21 lines)
   - Fixed position notification stack
   - Maps through notifications

### State Management
- **Form state**: 18 state variables (via `useEventForm` hook)
- **Event operations**: Events array, CRUD operations (via `useEventOperations` hook)
- **View state**: View type, currentDate, holidays (via `useCalendarView` hook)
- **Search state**: searchTerm, filteredEvents (via `useSearch` hook)
- **Dialog state**: 7 local useState calls for dialogs and pending operations
- **Notification state**: Via `useNotifications` hook

### Side Effects
- Event fetching on mount (via hook)
- Notification polling (via hook)
- Holiday fetching (via hook)

### Dependencies
- **External**: MUI components (18 imports), notistack
- **Internal**: 6 custom hooks, 1 component (RecurringEventDialog), types, utilities
- **Constants**: categories, weekDays, notificationOptions, eventBoxStyles

---

## 2. Extractable Components Identified

### High Priority (Easy - Low Coupling)

#### C1: EventFormFields
- **Type**: JSX block extraction
- **Lines**: 483-673 (191 lines)
- **Purpose**: Event form input section
- **Dependencies**:
  - Props: Form state (title, date, etc.), handlers (setTitle, setDate, etc.)
  - State: editingEvent, isRepeating, repeatType, etc.
  - External: categories, notificationOptions
- **Coupling**: Medium (many props but clear interface)
- **Extraction difficulty**: Moderate
- **Reason**: Clear boundary, single responsibility (form inputs)

#### C2: EventList
- **Type**: JSX block extraction
- **Lines**: 704-784 (81 lines)
- **Purpose**: Event search and list display
- **Dependencies**:
  - Props: filteredEvents, searchTerm, setSearchTerm, notifiedEvents
  - Handlers: handleEditEvent, handleDeleteEvent
  - External: notificationOptions
- **Coupling**: Low (few props)
- **Extraction difficulty**: Easy
- **Reason**: Isolated, minimal dependencies

#### C3: EventCard
- **Type**: JSX block extraction (reusable)
- **Lines**: 724-781 (58 lines per instance)
- **Purpose**: Display single event in list
- **Dependencies**:
  - Props: event, isNotified, onEdit, onDelete
  - External: notificationOptions, getRepeatTypeLabel
- **Coupling**: Low
- **Extraction difficulty**: Easy
- **Reason**: Highly reusable, clear props interface

#### C4: CalendarHeader
- **Type**: JSX block extraction
- **Lines**: 675-698 (24 lines)
- **Purpose**: Calendar navigation and view controls
- **Dependencies**:
  - Props: view, setView, navigate (prev/next)
- **Coupling**: Low
- **Extraction difficulty**: Easy
- **Reason**: Minimal dependencies, clear UI section

#### C5: WeekViewCalendar
- **Type**: Render function extraction
- **Lines**: 293-373 (81 lines)
- **Purpose**: Week view calendar grid
- **Dependencies**:
  - Props: currentDate, filteredEvents, notifiedEvents
  - External: weekDays, formatWeek, getWeekDates, eventBoxStyles
- **Coupling**: Medium
- **Extraction difficulty**: Moderate
- **Reason**: Self-contained render logic

#### C6: MonthViewCalendar
- **Type**: Render function extraction
- **Lines**: 375-478 (104 lines)
- **Purpose**: Month view calendar grid
- **Dependencies**:
  - Props: currentDate, filteredEvents, notifiedEvents, holidays
  - External: weekDays, formatMonth, getWeeksAtMonth, getEventsForDay, eventBoxStyles
- **Coupling**: Medium
- **Extraction difficulty**: Moderate
- **Reason**: Self-contained render logic

#### C7: EventBox
- **Type**: JSX block extraction (reusable)
- **Lines**: 335-362, 427-463 (combined ~65 lines)
- **Purpose**: Event display in calendar cells
- **Dependencies**:
  - Props: event, isNotified
  - External: eventBoxStyles, getRepeatTypeLabel
- **Coupling**: Low
- **Extraction difficulty**: Easy
- **Reason**: Highly reusable across both views

#### C8: OverlapWarningDialog
- **Type**: JSX block extraction
- **Lines**: 787-825 (39 lines)
- **Purpose**: Warning dialog for overlapping events
- **Dependencies**:
  - Props: open, onClose, overlappingEvents, onConfirm
  - State: Form state to save event on confirm
- **Coupling**: Medium
- **Extraction difficulty**: Moderate
- **Reason**: Self-contained dialog logic

#### C9: NotificationAlerts
- **Type**: JSX block extraction
- **Lines**: 839-859 (21 lines)
- **Purpose**: Fixed notification display
- **Dependencies**:
  - Props: notifications, setNotifications
- **Coupling**: Low
- **Extraction difficulty**: Easy
- **Reason**: Minimal dependencies, clear boundary

### Low Priority (Utility Functions)

#### U1: getRepeatTypeLabel
- **Type**: Utility function
- **Lines**: 94-107 (14 lines)
- **Purpose**: Convert repeat type to Korean label
- **Location**: Move to utils/repeatUtils.ts
- **Difficulty**: Easy

#### U2: isRecurringEvent
- **Type**: Utility function
- **Lines**: 191-193 (3 lines)
- **Purpose**: Check if event is recurring
- **Location**: Move to utils/eventUtils.ts
- **Difficulty**: Easy

**Total Components Identified**: 9 components + 2 utilities = 11 extractions

---

## 3. Extraction Strategy

### Phase 1: Utilities & Simple Components (Low Risk)
**Order**: Extract least coupled first to minimize test breakage

1. **U1: getRepeatTypeLabel** → `src/utils/repeatUtils.ts`
   - Pure function, zero dependencies
   - Update imports in App.tsx
   - Risk: None
   - Estimated: 15 minutes

2. **U2: isRecurringEvent** → `src/utils/eventUtils.ts`
   - Pure function, minimal dependencies
   - Risk: None
   - Estimated: 10 minutes

3. **C7: EventBox** → `src/components/EventBox.tsx`
   - Reusable across views
   - Props: event, isNotified
   - Risk: Low
   - Estimated: 30 minutes

4. **C3: EventCard** → `src/components/EventCard.tsx`
   - Used in EventList
   - Props: event, isNotified, onEdit, onDelete
   - Risk: Low
   - Estimated: 30 minutes

### Phase 2: Isolated Sections (Low-Medium Risk)

5. **C9: NotificationAlerts** → `src/components/NotificationAlerts.tsx`
   - Fixed position notification stack
   - Props: notifications, setNotifications
   - Risk: Low
   - Estimated: 20 minutes

6. **C4: CalendarHeader** → `src/components/CalendarHeader.tsx`
   - Navigation controls
   - Props: view, setView, navigate
   - Risk: Low
   - Estimated: 25 minutes

7. **C8: OverlapWarningDialog** → `src/components/OverlapWarningDialog.tsx`
   - Dialog for overlap warnings
   - Props: open, onClose, overlappingEvents, onConfirm
   - Risk: Medium (needs form state access)
   - Estimated: 40 minutes

### Phase 3: Calendar Views (Medium Risk)

8. **C5: WeekViewCalendar** → `src/components/WeekViewCalendar.tsx`
   - Week view grid
   - Use extracted EventBox component
   - Props: currentDate, filteredEvents, notifiedEvents
   - Risk: Medium (complex rendering)
   - Estimated: 45 minutes

9. **C6: MonthViewCalendar** → `src/components/MonthViewCalendar.tsx`
   - Month view grid
   - Use extracted EventBox component
   - Props: currentDate, filteredEvents, notifiedEvents, holidays
   - Risk: Medium (complex rendering)
   - Estimated: 45 minutes

### Phase 4: Form & List Sections (Medium-High Risk)

10. **C2: EventList** → `src/components/EventList.tsx`
    - Event list with search
    - Use extracted EventCard component
    - Props: filteredEvents, searchTerm, setSearchTerm, notifiedEvents, onEdit, onDelete
    - Risk: Medium
    - Estimated: 40 minutes

11. **C1: EventFormFields** → `src/components/EventFormFields.tsx`
    - Large form section
    - Many props (form state + handlers)
    - Props: 18+ props for form fields
    - Risk: Medium-High (many dependencies)
    - Estimated: 60 minutes

### Total Estimated Time: ~6 hours

---

## 4. Dependency Management Plan

### Shared State Handling

#### Form State
- **Current**: useEventForm hook provides all form state
- **Strategy**: Pass as props to EventFormFields component
- **Props interface**: EventFormFieldsProps with all form fields + handlers
- **Alternative**: Context API if props become unwieldy (not needed for single level)

#### Event Operations
- **Current**: useEventOperations hook provides events array + CRUD
- **Strategy**: Pass events array and handlers to child components
- **Affected components**: EventList, WeekViewCalendar, MonthViewCalendar

#### View State
- **Current**: useCalendarView hook provides view/date/holidays/navigate
- **Strategy**: Pass relevant pieces to calendar components
- **Affected components**: CalendarHeader, WeekViewCalendar, MonthViewCalendar

### Shared Handlers

#### handleEditEvent & handleDeleteEvent
- **Current**: Defined in App component
- **Strategy**: Keep in App, pass as props to EventList and EventCard
- **Reason**: Needs access to recurring dialog state

#### addOrUpdateEvent
- **Current**: Defined in App component
- **Strategy**: Keep in App, pass as onSubmit prop to EventFormFields
- **Reason**: Complex logic with multiple hook interactions

### Shared Types
- **Current**: Imported from types.ts
- **Strategy**: No changes needed, all components import from types.ts
- **Types needed**: Event, EventForm, RepeatType

### Shared Constants

#### Extract to separate files:
1. **Form constants** → `src/constants/formConstants.ts`
   - categories
   - notificationOptions
   - Shared across EventFormFields, EventCard

2. **Calendar constants** → `src/constants/calendarConstants.ts`
   - weekDays
   - eventBoxStyles
   - Shared across calendar views

3. **Repeat utilities** → `src/utils/repeatUtils.ts`
   - getRepeatTypeLabel
   - Shared across EventBox, EventCard, form

### Import Updates

#### Files importing App.tsx
- **Check**: Search codebase for App.tsx imports
- **Update**: Import paths for extracted components
- **Risk**: Low (App is entry component, unlikely to be imported elsewhere)

---

## 5. Risk Assessment

### High Risk Extractions
None identified - app is well-structured with clear boundaries

### Medium Risk Extractions

#### C1: EventFormFields (191 lines)
- **Risk factors**:
  - 18+ props required
  - Complex conditional rendering (repeat fields)
  - Form validation state
- **Mitigation**:
  - Create comprehensive TypeScript interface
  - Extract after utilities and simple components
  - Test form submission thoroughly
  - Consider props grouping with object destructuring

#### C5 & C6: Calendar Views
- **Risk factors**:
  - Complex rendering logic
  - Multiple utility function dependencies
  - Event filtering and mapping
- **Mitigation**:
  - Extract EventBox first for reuse
  - Test both views after extraction
  - Verify event display in all scenarios

#### C8: OverlapWarningDialog
- **Risk factors**:
  - Needs form state for onConfirm callback
  - Inline event saving logic
- **Mitigation**:
  - Pass form data as prop
  - Extract save logic to callback prop
  - Test overlap detection flow

### Low Risk Extractions

#### C2: EventList, C3: EventCard, C4: CalendarHeader, C7: EventBox, C9: NotificationAlerts
- **Risk factors**: Minimal
- **Reason**: Clear boundaries, few dependencies, simple props

#### U1 & U2: Utility functions
- **Risk factors**: None
- **Reason**: Pure functions, zero state dependencies

---

## 6. Expected Outcome

### Size Reduction
- **Original file**: 864 lines
- **Target main component**: ~200-250 lines
- **Breakdown after extraction**:
  - App.tsx: ~250 lines (hooks, handlers, layout orchestration)
  - EventFormFields: ~190 lines
  - MonthViewCalendar: ~100 lines
  - WeekViewCalendar: ~80 lines
  - EventList: ~80 lines
  - EventCard: ~60 lines
  - EventBox: ~35 lines
  - OverlapWarningDialog: ~45 lines
  - CalendarHeader: ~30 lines
  - NotificationAlerts: ~25 lines
  - Constants files: ~50 lines
  - Utility files: ~30 lines

- **Total new component files**: 9 component files + 2 constant files + 2 utility files = 13 files
- **Estimated reduction**: 71% (864 → 250 lines in App.tsx)

### Test Changes Needed
- **Import updates**: Update imports in integration tests
- **Component tests**: No new component tests needed (testing via integration)
- **Existing tests**: Should pass without changes (same behavior)
- **Test count**: 180 tests should remain passing

### Code Quality Improvements
1. **Separation of concerns**: Each component has single responsibility
2. **Reusability**: EventBox, EventCard are reusable
3. **Maintainability**: Smaller files easier to understand
4. **Testability**: Components can be unit tested independently
5. **Type safety**: Explicit TypeScript interfaces for all props

### File Structure
```
src/
├── App.tsx (~250 lines)
├── components/
│   ├── RecurringEventDialog.tsx (existing)
│   ├── EventFormFields.tsx (new)
│   ├── EventList.tsx (new)
│   ├── EventCard.tsx (new)
│   ├── CalendarHeader.tsx (new)
│   ├── WeekViewCalendar.tsx (new)
│   ├── MonthViewCalendar.tsx (new)
│   ├── EventBox.tsx (new)
│   ├── OverlapWarningDialog.tsx (new)
│   └── NotificationAlerts.tsx (new)
├── constants/
│   ├── formConstants.ts (new)
│   └── calendarConstants.ts (new)
└── utils/
    ├── repeatUtils.ts (new)
    └── eventUtils.ts (enhanced)
```

---

## 7. Handoff Summary

**Analysis complete**: App.tsx (864 lines) analyzed and 11 extractable units identified (9 components + 2 utilities). Extraction strategy designed in 4 phases with low-to-medium risk profile. Expected 71% size reduction (864 → 250 lines). All 180 tests currently passing. Ready for extraction workflow execution.

**Next Steps**:
1. Begin Phase 1 extraction (utilities + simple components)
2. Run tests after each extraction
3. Commit incrementally per component
4. Proceed to Phase 2-4 based on test results

**Key Success Metrics**:
- All 180 tests remain passing
- App.tsx reduced to ~250 lines
- 13 new well-typed files created
- No behavior changes (refactor only)
