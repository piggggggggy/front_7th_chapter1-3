import { Page, Locator } from '@playwright/test';

export class EventFormPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly dateInput: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly descriptionInput: Locator;
  readonly locationInput: Locator;
  readonly categorySelect: Locator;
  readonly repeatCheckbox: Locator;
  readonly repeatTypeSelect: Locator;
  readonly repeatIntervalInput: Locator;
  readonly repeatEndDateInput: Locator;
  readonly notificationSelect: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel('제목');
    this.dateInput = page.getByLabel('날짜');
    this.startTimeInput = page.locator('#start-time');
    this.endTimeInput = page.locator('#end-time');
    this.descriptionInput = page.getByLabel('설명');
    this.locationInput = page.getByLabel('위치');
    this.categorySelect = page.getByLabel('카테고리');
    this.repeatCheckbox = page.getByLabel('반복 일정');
    this.repeatTypeSelect = page.getByLabel('반복 유형');
    this.repeatIntervalInput = page.getByLabel('반복 간격');
    this.repeatEndDateInput = page.getByLabel('반복 종료일');
    this.notificationSelect = page
      .locator('[role="combobox"]')
      .filter({ hasText: /1분 전|10분 전|1시간 전|2시간 전|1일 전/ });
    this.submitButton = page.getByRole('button', { name: /일정 (추가|수정)/ });
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async fillDate(date: string) {
    await this.dateInput.fill(date);
  }

  async fillTime(startTime: string, endTime: string) {
    await this.startTimeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.startTimeInput.fill(startTime);
    await this.endTimeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.endTimeInput.fill(endTime);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.descriptionInput.fill(description);
  }

  async fillLocation(location: string) {
    await this.locationInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.locationInput.fill(location);
  }

  async selectCategory(category: string) {
    await this.categorySelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.categorySelect.click();
    await this.page.getByRole('option', { name: category }).click();
  }

  async enableRepeat() {
    await this.repeatCheckbox.check();
  }

  async disableRepeat() {
    await this.repeatCheckbox.uncheck();
  }

  async selectRepeatType(type: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const repeatTypeSelect = this.page
      .locator('[role="combobox"]')
      .filter({ hasText: /매일|매주|매월|매년/ });
    await repeatTypeSelect.click();

    await this.page.getByRole('option', { name: `${type}-option` }).click();
  }

  async fillRepeatInterval(interval: number) {
    await this.repeatIntervalInput.fill(interval.toString());
  }

  async fillRepeatEndDate(endDate: string) {
    await this.repeatEndDateInput.fill(endDate);
  }

  async selectNotification(minutes: number) {
    await this.notificationSelect.click();

    // const notificationLabels: Record<number, string> = {
    //   1: '1분 전',
    //   10: '10분 전',
    //   60: '1시간 전',
    //   120: '2시간 전',
    //   1440: '1일 전',
    // };

    await this.page.getByRole('option', { name: `${minutes}-option` }).click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async fillBasicEvent(data: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
  }) {
    await this.fillTitle(data.title);
    await this.fillDate(data.date);
    await this.fillTime(data.startTime, data.endTime);

    if (data.description) {
      await this.fillDescription(data.description);
    }

    if (data.location) {
      await this.fillLocation(data.location);
    }

    if (data.category) {
      await this.selectCategory(data.category);
    }
  }

  async fillRecurringEvent(data: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatInterval: number;
    repeatEndDate: string;
    description?: string;
    location?: string;
    category?: string;
  }) {
    await this.fillBasicEvent(data);
    await this.enableRepeat();
    await this.selectRepeatType(data.repeatType);
    await this.fillRepeatInterval(data.repeatInterval);
    await this.fillRepeatEndDate(data.repeatEndDate);
  }

  async getValidationError() {
    // Get the most recent error alert (notistack shows multiple alerts)
    return this.page.locator('[role="alert"]').last();
  }
}
