# Component Structure Analysis - COMPONENT-1

**Project**: COMPONENT-1
**Scope**: /Users/Dev/plus-fe/front_7th_chapter1-3/src/
**Type**: components
**Route**: simple
**Date**: 2025-11-05

## 1. Current Structure Assessment

### Directory Tree
```
src/
├── App.tsx                           (865 lines - MONOLITHIC)
├── main.tsx                          (entry point)
├── types.ts                          (shared types)
├── setupTests.ts                     (test setup)
├── vite-env.d.ts                     (vite types)
├── components/
│   └── RecurringEventDialog.tsx     (1 dialog component)
├── hooks/
│   ├── useEventForm.ts
│   ├── useEventOperations.ts
│   ├── useRecurringEventOperations.ts
│   ├── useCalendarView.ts
│   ├── useNotifications.ts
│   └── useSearch.ts
├── utils/
│   ├── dateUtils.ts
│   ├── eventUtils.ts
│   ├── eventOverlap.ts
│   ├── notificationUtils.ts
│   ├── generateRepeatEvents.ts
│   └── timeValidation.ts
├── apis/
│   └── fetchHolidays.ts
├── __mocks__/
│   ├── handlers.ts
│   ├── handlersUtils.ts
│   └── response/
└── __tests__/
    ├── components/
    ├── hooks/
    ├── unit/
    ├── integration/
    ├── edge-cases/
    └── regression/
```

### Component Inventory
- **Pages**: 1 (App.tsx - monolithic)
- **Features**: 0 (all in App.tsx)
- **Shared**: 1 (RecurringEventDialog.tsx)
- **UI Components**: 0 (using MUI directly)
- **Hooks**: 6 files
- **Utils**: 6 files
- **APIs**: 1 file
- **Total Production Files**: ~19 files

### File Naming Conventions
**Current Patterns**:
- Hooks: `use[Feature].ts` (camelCase)
- Utils: `[feature]Utils.ts` or `[feature].ts`
- Components: PascalCase (RecurringEventDialog.tsx)
- Tests: `[easy|medium].[name].spec.ts[x]` (complexity prefixes)

**Issues**:
- Inconsistent: some utils use suffix "Utils" (dateUtils, eventUtils), others don't (eventOverlap, timeValidation)
- Test files use complexity prefixes (easy/medium) which is unconventional
- No clear component file organization

### Import Patterns
**Common Structures**:
```typescript
// App.tsx has deep imports from multiple directories
import RecurringEventDialog from './components/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { formatDate, formatMonth } from './utils/dateUtils.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';

// Hooks import from utils and types
import { Event, EventForm } from '../types';
import { generateRepeatEvents } from '../utils/generateRepeatEvents';

// Relative imports with explicit extensions (.ts, .tsx)
```

**Depth**: Maximum 2 levels (e.g., `../../types`)
**Coupling**: High - App.tsx imports from 6 hooks + 3 utils directly

## 2. Issues Identified

### Structural Problems
1. **Monolithic App.tsx (865 lines)**: Contains all UI, business logic, state management, and rendering
   - Event form UI (lines 484-673)
   - Calendar view rendering (lines 293-478)
   - Event list rendering (lines 704-784)
   - Dialog management (lines 787-859)
   - Multiple render functions mixed with state management

2. **Single Component Directory**: Only 1 component (RecurringEventDialog) - no UI component library
   - All MUI components used directly in App.tsx
   - No reusable UI patterns extracted
   - Calendar rendering duplicated in renderWeekView/renderMonthView

3. **No Feature-Based Organization**: Everything in flat structure
   - hooks/ directory mixes unrelated concerns (form, calendar, notifications, search)
   - utils/ directory has 6 different utilities with no grouping
   - No clear domain boundaries

4. **Test Organization Not Aligned with Source**:
   - Tests organized by type (unit/integration/regression)
   - Source organized by technical layer (hooks/utils/components)
   - Makes refactoring difficult - need to update multiple test directories

### Component Coupling
1. **App.tsx is God Component**:
   - Imports 6 custom hooks directly
   - Imports 3 utility functions
   - Manages 10+ pieces of local state
   - 4 dialog/modal states
   - Handles all business logic

2. **Tight Hook Dependencies**:
   - useEventOperations depends on useSnackbar (notistack)
   - useRecurringEventOperations needs events from useEventOperations
   - useSearch needs events and view state from other hooks
   - No clear separation of concerns

3. **Props Drilling Pattern**:
   ```typescript
   // App.tsx passes callbacks through multiple layers
   const { events, saveEvent } = useEventOperations(editing, () => setEditingEvent(null));
   const { handleRecurringEdit } = useRecurringEventOperations(events, async () => {
     await fetchEvents();
   });
   ```

### Naming Inconsistencies
1. **Utility Files**:
   - `dateUtils.ts` vs `eventOverlap.ts` (utils suffix inconsistent)
   - `notificationUtils.ts` vs `timeValidation.ts`

2. **Hook Responsibilities**:
   - useEventForm: Form state only
   - useEventOperations: API calls + state
   - useRecurringEventOperations: Business logic only
   - No consistent pattern

3. **Test Files**:
   - Prefixes like `easy.`, `medium.` are non-standard
   - Mixing integration tests with unit tests in same directory

### Code Duplication
1. **Calendar Rendering**:
   - `renderWeekView()` and `renderMonthView()` share 80% similar JSX structure
   - Event box styling duplicated (lines 334-362 and 427-464)
   - Notification/repeat icon rendering duplicated

2. **Event Display Logic**:
   - Event card rendering in calendar views vs event list (3 places)
   - Notification badge logic repeated
   - Recurring event tooltip repeated

3. **Style Objects**:
   - `eventBoxStyles` defined in App.tsx (lines 73-92) but could be shared
   - Inline styles scattered throughout

## 3. Improvement Opportunities

### Priority P0: Critical
1. **Extract Feature Domains from App.tsx**:
   - Event Form → EventForm component
   - Calendar View → CalendarView component
   - Event List → EventList component
   - Create features/ directory with domain-based organization

2. **Create UI Component Library**:
   - EventCard (shared display component)
   - CalendarCell (shared calendar rendering)
   - NotificationBadge (reusable indicator)
   - Extract MUI wrappers into design system

3. **Standardize File Naming**:
   - All utils should have consistent suffix: `[domain]Utils.ts` OR drop suffix entirely
   - Remove complexity prefixes from test files
   - Align test structure with source structure

### Priority P1: High-Value
1. **Feature-Based Organization**:
   ```
   src/
   ├── features/
   │   ├── events/
   │   │   ├── components/
   │   │   ├── hooks/
   │   │   └── utils/
   │   ├── calendar/
   │   │   ├── components/
   │   │   ├── hooks/
   │   │   └── utils/
   │   └── notifications/
   │       ├── components/
   │       ├── hooks/
   │       └── utils/
   ├── shared/
   │   ├── components/
   │   ├── hooks/
   │   └── types/
   └── lib/ (external API wrappers)
   ```

2. **Decouple Hook Dependencies**:
   - Create dependency injection pattern for snackbar
   - Use context providers for shared state
   - Reduce cross-hook dependencies

3. **Extract Reusable Components**:
   - EventCard (used in 3 places)
   - CalendarGrid (shared by week/month views)
   - EventForm (currently embedded in App.tsx)

### Priority P2: Nice-to-Have
1. **Type Organization**:
   - Move from single types.ts to domain-specific types
   - Create shared/ directory for common types

2. **API Layer**:
   - Create proper API client abstraction
   - Currently fetch() calls scattered in hooks

3. **Style Management**:
   - Extract style constants to shared theme
   - Use MUI theme system consistently
   - Create styled components library

## 4. Refactoring Strategy

### Target Structure
**Approach**: Feature-based (domain-driven) with shared UI library

```
src/
├── features/
│   ├── event-management/
│   │   ├── components/
│   │   │   ├── EventForm/
│   │   │   │   ├── EventForm.tsx
│   │   │   │   ├── EventFormFields.tsx
│   │   │   │   └── RecurringEventFields.tsx
│   │   │   ├── EventList/
│   │   │   │   ├── EventList.tsx
│   │   │   │   └── EventListItem.tsx
│   │   │   └── RecurringEventDialog.tsx (moved)
│   │   ├── hooks/
│   │   │   ├── useEventForm.ts (moved)
│   │   │   ├── useEventOperations.ts (moved)
│   │   │   └── useRecurringEventOperations.ts (moved)
│   │   └── utils/
│   │       ├── eventOverlap.ts (moved)
│   │       └── generateRepeatEvents.ts (moved)
│   │
│   ├── calendar/
│   │   ├── components/
│   │   │   ├── CalendarView/
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── WeekView.tsx
│   │   │   │   ├── MonthView.tsx
│   │   │   │   └── CalendarCell.tsx
│   │   │   └── CalendarControls.tsx
│   │   ├── hooks/
│   │   │   ├── useCalendarView.ts (moved)
│   │   │   └── useSearch.ts (moved)
│   │   └── utils/
│   │       ├── dateUtils.ts (moved)
│   │       └── eventUtils.ts (moved)
│   │
│   └── notifications/
│       ├── components/
│       │   └── NotificationStack.tsx
│       ├── hooks/
│       │   └── useNotifications.ts (moved)
│       └── utils/
│           └── notificationUtils.ts (moved)
│
├── shared/
│   ├── components/
│   │   ├── EventCard/
│   │   │   ├── EventCard.tsx (NEW - extracted)
│   │   │   └── EventCardBadges.tsx (NEW)
│   │   └── Layout/
│   │       └── PageLayout.tsx (NEW)
│   ├── hooks/
│   │   └── (common hooks if needed)
│   ├── types/
│   │   ├── event.types.ts (from types.ts)
│   │   └── calendar.types.ts (from types.ts)
│   └── utils/
│       └── timeValidation.ts (moved - shared utility)
│
├── lib/
│   ├── api/
│   │   └── events.api.ts (NEW - API client)
│   └── holidays/
│       └── fetchHolidays.ts (moved from apis/)
│
├── App.tsx (REFACTORED - orchestration only)
└── main.tsx
```

### Migration Plan
**Phase 1: Extract UI Components (Safe, Low Risk)**
1. Create `shared/components/EventCard/`
   - Extract event display logic from 3 places in App.tsx
   - Create EventCard.tsx with props interface
   - Create EventCardBadges.tsx for notification/repeat icons
   - Update App.tsx to use EventCard component
   - Run tests to verify no breakage

2. Create `features/calendar/components/CalendarView/`
   - Extract renderWeekView → WeekView.tsx
   - Extract renderMonthView → MonthView.tsx
   - Create shared CalendarCell.tsx
   - Update App.tsx to use new components
   - Run tests

3. Create `features/event-management/components/EventForm/`
   - Extract event form section (lines 484-673) → EventForm.tsx
   - Split into EventFormFields.tsx and RecurringEventFields.tsx
   - Update App.tsx to use EventForm component
   - Run tests

**Phase 2: Reorganize by Feature (Medium Risk)**
4. Create feature directories and move files:
   ```bash
   # Event Management
   mkdir -p src/features/event-management/{components,hooks,utils}
   mv src/hooks/useEventForm.ts src/features/event-management/hooks/
   mv src/hooks/useEventOperations.ts src/features/event-management/hooks/
   mv src/hooks/useRecurringEventOperations.ts src/features/event-management/hooks/
   mv src/utils/eventOverlap.ts src/features/event-management/utils/
   mv src/utils/generateRepeatEvents.ts src/features/event-management/utils/
   mv src/components/RecurringEventDialog.tsx src/features/event-management/components/

   # Calendar
   mkdir -p src/features/calendar/{components,hooks,utils}
   mv src/hooks/useCalendarView.ts src/features/calendar/hooks/
   mv src/hooks/useSearch.ts src/features/calendar/hooks/
   mv src/utils/dateUtils.ts src/features/calendar/utils/
   mv src/utils/eventUtils.ts src/features/calendar/utils/

   # Notifications
   mkdir -p src/features/notifications/{components,hooks,utils}
   mv src/hooks/useNotifications.ts src/features/notifications/hooks/
   mv src/utils/notificationUtils.ts src/features/notifications/utils/

   # Shared
   mkdir -p src/shared/{types,utils}
   # Split types.ts into domain-specific files
   mv src/utils/timeValidation.ts src/shared/utils/

   # Lib
   mkdir -p src/lib/{api,holidays}
   mv src/apis/fetchHolidays.ts src/lib/holidays/
   ```

5. Update all import paths:
   - Search and replace import paths across codebase
   - Update test imports to match new structure
   - Run tests after each batch of updates

**Phase 3: Cleanup (Low Risk)**
6. Remove old directories:
   ```bash
   rm -rf src/hooks
   rm -rf src/utils
   rm -rf src/components
   rm -rf src/apis
   ```

7. Standardize naming:
   - Rename test files to remove easy/medium prefixes
   - Ensure consistent naming: drop "Utils" suffix OR add everywhere
   - Update test suite organization

8. Create index files for clean imports:
   ```typescript
   // src/features/event-management/index.ts
   export * from './hooks';
   export * from './components';
   ```

### Import Update Strategy
**Before**:
```typescript
import { useEventForm } from './hooks/useEventForm.ts';
import { formatDate } from './utils/dateUtils.ts';
import RecurringEventDialog from './components/RecurringEventDialog.tsx';
```

**After**:
```typescript
import { useEventForm } from '@/features/event-management/hooks/useEventForm';
import { formatDate } from '@/features/calendar/utils/dateUtils';
import { RecurringEventDialog } from '@/features/event-management/components';
```

**Tool**: Use path aliases in tsconfig.json:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

**Update Process**:
1. Configure path aliases in tsconfig.json
2. Use IDE refactoring (Find & Replace with regex)
3. Update imports in batches by directory
4. Run tests after each batch

### Risk Assessment

**Low Risk Operations** (Extract to new files, keep old):
- Creating EventCard component (old code stays until verified)
- Creating CalendarView components (incremental extraction)
- Creating EventForm component (progressive enhancement)
- Moving files with clear dependencies

**Medium Risk Operations** (File moves):
- Moving hooks to feature directories (many import updates)
- Moving utils to feature directories (shared dependencies)
- Splitting types.ts (type imports everywhere)

**High Risk Operations** (None in this refactor):
- No breaking API changes
- No test rewrites needed (just import path updates)
- No logic changes

### Rollback Plan
**Git Strategy**:
1. Create feature branch: `refactor/component-structure-COMPONENT-1`
2. Each phase is a separate commit:
   - Phase 1: "refactor: extract UI components from App.tsx"
   - Phase 2: "refactor: reorganize by feature domain"
   - Phase 3: "refactor: cleanup and standardize naming"
3. If issues arise, revert specific commits

**Backup Branch**:
- Already created: `backup/component-1-20251105-225119`
- Can restore from this point

**Incremental Verification**:
- Run `npm test` after each file move
- If tests fail, rollback last operation
- Fix import paths before moving to next batch

**Test Coverage Preservation**:
- All 180 tests must pass at each phase boundary
- No test modifications needed (only import updates)
- If test count drops, investigate immediately

## 5. Handoff Summary

**Current State**: Monolithic 865-line App.tsx with flat directory structure (hooks/utils/components)
**Target State**: Feature-based architecture with extracted UI components and domain-driven organization
**Next Steps**: Begin Phase 1 - extract EventCard, CalendarView, and EventForm components from App.tsx
