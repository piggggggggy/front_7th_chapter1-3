import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { MonthViewCalendar } from './MonthViewCalendar';
import { mockEvents } from '../stories/fixtures/mockData';

const meta: Meta<typeof MonthViewCalendar> = {
  title: 'Components/MonthViewCalendar',
  component: MonthViewCalendar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const currentDate = new Date('2025-11-15');

/**
 * Empty calendar with no events
 */
export const Empty: Story = {
  args: {
    currentDate,
    filteredEvents: [],
    notifiedEvents: [],
    holidays: {},
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Calendar with multiple events across different days
 */
export const WithEvents: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {},
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Calendar with holidays marked
 */
export const WithHolidays: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {
      '2025-11-01': '개천절',
      '2025-11-09': '한글날',
      '2025-11-25': '크리스마스',
    },
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Calendar with notified events (highlighted in red)
 */
export const WithNotifications: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: ['story-1', 'story-2'], // mockEvent and mockRecurringEvent
    holidays: {},
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Calendar with all features: events, holidays, and notifications
 */
export const AllFeatures: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: ['story-1', 'story-2'],
    holidays: {
      '2025-11-01': '개천절',
      '2025-11-09': '한글날',
      '2025-11-25': '크리스마스',
    },
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Calendar with drag and drop handlers
 */
export const WithDragAndDrop: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {},
    weekDays,
    dragHandlers: {
      handleDragStart: fn(),
      handleDragEnd: fn(),
      handleDragOver: fn(),
      handleDragLeave: fn(),
      handleDrop: fn(),
      isDragging: false,
    },
    onCellClick: fn(),
  },
};
