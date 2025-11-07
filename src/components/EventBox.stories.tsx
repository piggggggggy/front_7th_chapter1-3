import type { Meta, StoryObj } from '@storybook/react';

import { EventBox } from './EventBox';
import { mockEvent, mockRecurringEvent, mockLongTitleEvent } from '../stories/fixtures/mockData';

const meta: Meta<typeof EventBox> = {
  title: 'Components/EventBox',
  component: EventBox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default event box without notification or repeat
 */
export const Default: Story = {
  args: {
    event: mockEvent,
    isNotified: false,
  },
};

/**
 * Event box with notification indicator (red background, bold text)
 */
export const WithNotification: Story = {
  args: {
    event: mockEvent,
    isNotified: true,
  },
};

/**
 * Event box with recurring event icon and tooltip
 */
export const RecurringEvent: Story = {
  args: {
    event: mockRecurringEvent,
    isNotified: false,
  },
};

/**
 * Long title with text truncation (ellipsis)
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
