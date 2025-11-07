import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import RecurringEventDialog from './RecurringEventDialog';
import { mockRecurringEvent } from '../stories/fixtures/mockData';

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onConfirm: fn(),
    event: mockRecurringEvent,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Dialog closed (not visible)
 */
export const Closed: Story = {
  args: {
    open: false,
    mode: 'edit',
  },
};

/**
 * Edit mode dialog - asks if user wants to edit only this event
 */
export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
  },
};

/**
 * Delete mode dialog - asks if user wants to delete only this event
 */
export const DeleteMode: Story = {
  args: {
    open: true,
    mode: 'delete',
  },
};
