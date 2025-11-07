import { Page, Locator } from '@playwright/test';

import { simulateHTML5DragAndDrop } from '../utils/html5-dnd-helper';

export class CalendarPage {
  readonly page: Page;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.prevButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToMonthView() {
    // Find the combobox that has "Month" or "Week" as value
    const viewSelect = this.page.locator('[role="combobox"]').filter({ hasText: /Month|Week/ });
    await viewSelect.click();
    await this.page.getByRole('option', { name: 'Month' }).click();
    await this.page.waitForSelector('[data-testid="month-view"]');
  }

  async switchToWeekView() {
    const viewSelect = this.page.locator('[role="combobox"]').filter({ hasText: /Month|Week/ });
    await viewSelect.click();
    await this.page.getByRole('option', { name: 'Week' }).click();
    await this.page.waitForSelector('[data-testid="week-view"]');
  }

  async navigateToPrevious() {
    await this.prevButton.click();
  }

  async navigateToNext() {
    await this.nextButton.click();
  }

  async clickDate(dateString: string) {
    // Find the cell containing the specific date
    const date = new Date(dateString);
    const day = date.getDate();

    // Click on the cell with the day number
    await this.page.locator(`td:has-text("${day}")`).first().click();
  }

  async getEventBox(title: string) {
    return this.page.locator(`[data-testid="event-box"]:has-text("${title}")`);
  }

  // async dragEventToDate(eventTitle: string, targetDateString: string) {
  //   const targetDate = new Date(targetDateString);
  //   const targetDay = targetDate.getDate();

  //   const eventBox = await this.getEventBox(eventTitle);
  //   console.log('eventBox', eventBox);
  //   const targetCell = this.page.locator(`td:has-text("${targetDay}")`).first();
  //   console.log('targetCell', targetCell);

  //   await eventBox.dragTo(targetCell, {
  //     force: true,
  //     timeout: 10000,
  //   });
  // }
  async dragEventToDate(eventTitle: string, targetDateString: string) {
    const targetDate = new Date(targetDateString);
    const targetDay = targetDate.getDate();

    const eventBox = await this.getEventBox(eventTitle);
    const targetCell = this.page.locator(`td:has-text("${targetDay}")`).first();
    await simulateHTML5DragAndDrop(this.page, eventBox, targetCell, eventTitle);
  }

  async assertEventDisplayed(title: string, date?: string) {
    const eventBox = await this.getEventBox(title);
    await eventBox.waitFor({ state: 'visible' });
  }

  async assertEventNotDisplayed(title: string) {
    const eventBox = await this.getEventBox(title);
    await eventBox.waitFor({ state: 'hidden' });
  }

  async getHolidayText(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate();

    const cell = this.page.locator(`td:has-text("${day}")`).first();
    return cell.locator('p[color="error"]');
  }
}
