import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { EventCard } from './EventCard';
import {
  mockEvent,
  mockRecurringEvent,
  mockLongTitleEvent,
  notificationOptions,
} from '../stories/fixtures/mockData';

const meta: Meta<typeof EventCard> = {
  title: 'Components/EventCard',
  component: EventCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onEdit: fn(),
    onDelete: fn(),
    notificationOptions,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default event card without notification
 */
export const Default: Story = {
  args: {
    event: mockEvent,
    isNotified: false,
  },
};

/**
 * Event card with notification (red text, bold, notification icon)
 */
export const WithNotification: Story = {
  args: {
    event: mockEvent,
    isNotified: true,
  },
};

/**
 * Recurring event card with repeat icon and details
 */
export const RecurringEvent: Story = {
  args: {
    event: mockRecurringEvent,
    isNotified: false,
  },
};

/**
 * Long title with proper wrapping/truncation
 */
export const LongTitle: Story = {
  args: {
    event: mockLongTitleEvent,
    isNotified: false,
  },
};

/**
 * Short title event
 */
export const ShortTitle: Story = {
  args: {
    event: {
      ...mockEvent,
      title: '회의',
    },
    isNotified: false,
  },
};

/**
 * Recurring event with notification
 */
export const RecurringWithNotification: Story = {
  args: {
    event: mockRecurringEvent,
    isNotified: true,
  },
};

/**
 * Long title with notification
 */
export const LongTitleWithNotification: Story = {
  args: {
    event: mockLongTitleEvent,
    isNotified: true,
  },
};

/**
 * Event with all fields filled
 */
export const FullyFilled: Story = {
  args: {
    event: {
      ...mockEvent,
      description: '상세한 설명이 포함된 일정입니다. 여러 줄의 내용이 들어갈 수 있습니다.',
      location: '서울시 강남구 테헤란로 123 빌딩 5층 회의실 A',
    },
    isNotified: false,
  },
};
