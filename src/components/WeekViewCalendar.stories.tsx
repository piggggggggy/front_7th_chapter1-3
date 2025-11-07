import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { WeekViewCalendar } from './WeekViewCalendar';
import { mockEvents } from '../stories/fixtures/mockData';

const meta: Meta<typeof WeekViewCalendar> = {
  title: 'Components/WeekViewCalendar',
  component: WeekViewCalendar,
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
 * Empty week view with no events
 */
export const Empty: Story = {
  args: {
    currentDate,
    filteredEvents: [],
    notifiedEvents: [],
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Week view with multiple events
 */
export const WithEvents: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: [],
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Week view with notified events (highlighted in red)
 */
export const WithNotifications: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: ['story-1', 'story-2'], // mockEvent and mockRecurringEvent
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Week view with all features: events and notifications
 */
export const AllFeatures: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: ['story-1', 'story-2'],
    weekDays,
    onCellClick: fn(),
  },
};

/**
 * Week view with drag and drop handlers
 */
export const WithDragAndDrop: Story = {
  args: {
    currentDate,
    filteredEvents: mockEvents,
    notifiedEvents: [],
    weekDays,
    dragHandlers: {
      handleDragStart: fn(),
      handleDragEnd: fn(),
      handleDragOver: fn(),
      handleDragLeave: fn(),
      handleDrop: fn(),
    },
    onCellClick: fn(),
  },
};

/**
 * Week view with many events on a single day
 */
export const DenseDay: Story = {
  args: {
    currentDate,
    filteredEvents: [
      ...mockEvents,
      {
        id: 'dense-1',
        title: '아침 미팅',
        date: '2025-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '아침 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'dense-2',
        title: '점심 약속',
        date: '2025-11-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'dense-3',
        title: '오후 회의',
        date: '2025-11-15',
        startTime: '15:00',
        endTime: '16:00',
        description: '오후 회의',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    weekDays,
    onCellClick: fn(),
  },
};
