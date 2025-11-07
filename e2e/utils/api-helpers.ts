/**
 * API helpers for test setup and teardown
 * Uses Playwright's request context to interact with API
 */

import { Page } from '@playwright/test';

export interface Event {
  id?: string;
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

const API_BASE_URL = 'http://localhost:3000';

export class APIHelpers {
  /**
   * Creates an event via API
   */
  static async createEvent(page: Page, event: Event): Promise<Event> {
    const response = await page.request.post(`${API_BASE_URL}/api/events`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: event,
    });
    return await response.json();
  }

  /**
   * Gets all events via API
   */
  static async getAllEvents(page: Page): Promise<Event[]> {
    const response = await page.request.get(`${API_BASE_URL}/api/events`);
    const data = await response.json();
    return data.events || [];
  }

  /**
   * Deletes an event via API
   */
  static async deleteEvent(page: Page, eventId: string): Promise<void> {
    await page.request.delete(`${API_BASE_URL}/api/events/${eventId}`);
  }

  /**
   * Updates an event via API
   */
  static async updateEvent(page: Page, event: Event): Promise<Event> {
    const response = await page.request.put(`${API_BASE_URL}/api/events/${event.id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: event,
    });
    return await response.json();
  }
}
