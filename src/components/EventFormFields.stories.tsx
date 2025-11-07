import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { EventFormFields } from './EventFormFields';
import { notificationOptions } from '../stories/fixtures/mockData';

const meta: Meta<typeof EventFormFields> = {
  title: 'Components/EventFormFields',
  component: EventFormFields,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const categories = ['업무', '개인', '가족', '기타'];

/**
 * Empty form for creating a new event
 */
export const Empty: Story = {
  args: {
    editingEvent: false,
    basicInfo: {
      title: '',
      setTitle: fn(),
      date: '',
      setDate: fn(),
      description: '',
      setDescription: fn(),
      location: '',
      setLocation: fn(),
      category: '업무',
      setCategory: fn(),
    },
    time: {
      startTime: '',
      endTime: '',
      handleStartTimeChange: fn(),
      handleEndTimeChange: fn(),
      startTimeError: null,
      endTimeError: null,
    },
    repeat: {
      isRepeating: false,
      setIsRepeating: fn(),
      repeatType: 'none',
      setRepeatType: fn(),
      repeatInterval: 1,
      setRepeatInterval: fn(),
      repeatEndDate: '',
      setRepeatEndDate: fn(),
    },
    notification: {
      notificationTime: 10,
      setNotificationTime: fn(),
    },
    config: {
      categories,
      notificationOptions,
    },
    onSubmit: fn(),
  },
};

/**
 * Filled form with valid data
 */
export const Filled: Story = {
  args: {
    editingEvent: false,
    basicInfo: {
      title: '팀 회의',
      setTitle: fn(),
      date: '2025-11-15',
      setDate: fn(),
      description: '주간 팀 미팅',
      setDescription: fn(),
      location: '회의실 A',
      setLocation: fn(),
      category: '업무',
      setCategory: fn(),
    },
    time: {
      startTime: '10:00',
      endTime: '11:00',
      handleStartTimeChange: fn(),
      handleEndTimeChange: fn(),
      startTimeError: null,
      endTimeError: null,
    },
    repeat: {
      isRepeating: false,
      setIsRepeating: fn(),
      repeatType: 'none',
      setRepeatType: fn(),
      repeatInterval: 1,
      setRepeatInterval: fn(),
      repeatEndDate: '',
      setRepeatEndDate: fn(),
    },
    notification: {
      notificationTime: 10,
      setNotificationTime: fn(),
    },
    config: {
      categories,
      notificationOptions,
    },
    onSubmit: fn(),
  },
};

/**
 * Form with validation errors
 */
export const WithErrors: Story = {
  args: {
    editingEvent: false,
    basicInfo: {
      title: '팀 회의',
      setTitle: fn(),
      date: '2025-11-15',
      setDate: fn(),
      description: '주간 팀 미팅',
      setDescription: fn(),
      location: '회의실 A',
      setLocation: fn(),
      category: '업무',
      setCategory: fn(),
    },
    time: {
      startTime: '14:00',
      endTime: '12:00',
      handleStartTimeChange: fn(),
      handleEndTimeChange: fn(),
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다',
    },
    repeat: {
      isRepeating: false,
      setIsRepeating: fn(),
      repeatType: 'none',
      setRepeatType: fn(),
      repeatInterval: 1,
      setRepeatInterval: fn(),
      repeatEndDate: '',
      setRepeatEndDate: fn(),
    },
    notification: {
      notificationTime: 10,
      setNotificationTime: fn(),
    },
    config: {
      categories,
      notificationOptions,
    },
    onSubmit: fn(),
  },
};

/**
 * Edit mode (no repeat checkbox visible)
 */
export const EditMode: Story = {
  args: {
    editingEvent: true,
    basicInfo: {
      title: '팀 회의',
      setTitle: fn(),
      date: '2025-11-15',
      setDate: fn(),
      description: '주간 팀 미팅',
      setDescription: fn(),
      location: '회의실 A',
      setLocation: fn(),
      category: '업무',
      setCategory: fn(),
    },
    time: {
      startTime: '10:00',
      endTime: '11:00',
      handleStartTimeChange: fn(),
      handleEndTimeChange: fn(),
      startTimeError: null,
      endTimeError: null,
    },
    repeat: {
      isRepeating: false,
      setIsRepeating: fn(),
      repeatType: 'none',
      setRepeatType: fn(),
      repeatInterval: 1,
      setRepeatInterval: fn(),
      repeatEndDate: '',
      setRepeatEndDate: fn(),
    },
    notification: {
      notificationTime: 10,
      setNotificationTime: fn(),
    },
    config: {
      categories,
      notificationOptions,
    },
    onSubmit: fn(),
  },
};

/**
 * Form with repeating event enabled
 */
export const WithRepeating: Story = {
  args: {
    editingEvent: false,
    basicInfo: {
      title: '반복 회의',
      setTitle: fn(),
      date: '2025-11-15',
      setDate: fn(),
      description: '매주 반복되는 회의',
      setDescription: fn(),
      location: '회의실 B',
      setLocation: fn(),
      category: '업무',
      setCategory: fn(),
    },
    time: {
      startTime: '14:00',
      endTime: '15:00',
      handleStartTimeChange: fn(),
      handleEndTimeChange: fn(),
      startTimeError: null,
      endTimeError: null,
    },
    repeat: {
      isRepeating: true,
      setIsRepeating: fn(),
      repeatType: 'weekly',
      setRepeatType: fn(),
      repeatInterval: 1,
      setRepeatInterval: fn(),
      repeatEndDate: '2025-12-31',
      setRepeatEndDate: fn(),
    },
    notification: {
      notificationTime: 60,
      setNotificationTime: fn(),
    },
    config: {
      categories,
      notificationOptions,
    },
    onSubmit: fn(),
  },
};
