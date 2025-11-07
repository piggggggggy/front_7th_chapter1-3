/**
 * Test Data Factory for E2E Tests
 * Generates unique test data to ensure test independence
 */

let eventCounter = 0;

export interface EventData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
  repeat?: {
    type: string;
    interval: number;
    endDate?: string;
  };
  notificationTime?: number;
}

export interface RecurringEventData extends EventData {
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval: number;
  repeatEndDate: string;
}

export class TestDataFactory {
  /**
   * Generates a unique event title with timestamp
   */
  static generateEventTitle(prefix = 'Event'): string {
    eventCounter++;
    return `${prefix}_${Date.now()}_${eventCounter}`;
  }

  /**
   * Generates a basic event data object
   */
  static createBasicEvent(overrides?: Partial<EventData>): EventData {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return {
      title: this.generateEventTitle('Basic'),
      date: this.formatDate(tomorrow),
      startTime: '09:00',
      endTime: '10:00',
      description: 'Test event description',
      location: 'Test location',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
      ...overrides,
    };
  }

  /**
   * Generates a recurring event data object
   */
  static createRecurringEvent(overrides?: Partial<RecurringEventData>): RecurringEventData {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const endDate = new Date(tomorrow);
    endDate.setDate(tomorrow.getDate() + 30);

    return {
      title: this.generateEventTitle('Recurring'),
      date: this.formatDate(tomorrow),
      startTime: '14:00',
      endTime: '15:00',
      description: 'Recurring event description',
      location: 'Recurring location',
      category: '개인',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: this.formatDate(endDate),
      ...overrides,
    };
  }

  /**
   * Generates event data for overlap testing
   */
  static createOverlappingEvents(baseDate: string): EventData[] {
    return [
      {
        title: this.generateEventTitle('Overlap_A'),
        date: baseDate,
        startTime: '09:00',
        endTime: '11:00',
        category: '업무',
      },
      {
        title: this.generateEventTitle('Overlap_B'),
        date: baseDate,
        startTime: '10:00',
        endTime: '12:00',
        category: '개인',
      },
    ];
  }

  /**
   * Generates event data with notification
   */
  static createEventWithNotification(
    minutesBefore: number,
    overrides?: Partial<EventData>
  ): EventData & { notificationTime: number } {
    return {
      ...this.createBasicEvent(overrides),
      notificationTime: minutesBefore,
    };
  }

  /**
   * Formats date to YYYY-MM-DD format
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets a date N days from today
   */
  static getDateFromToday(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return this.formatDate(date);
  }

  /**
   * Resets the event counter (useful for test isolation)
   */
  static reset(): void {
    eventCounter = 0;
  }
}

/**
 * Common test data constants
 */
export const TEST_DATA = {
  categories: ['업무', '개인', '가족', '기타'],
  notificationOptions: [
    { value: 1, label: '1분 전' },
    { value: 10, label: '10분 전' },
    { value: 60, label: '1시간 전' },
    { value: 120, label: '2시간 전' },
    { value: 1440, label: '1일 전' },
  ],
  repeatTypes: {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  },
};
