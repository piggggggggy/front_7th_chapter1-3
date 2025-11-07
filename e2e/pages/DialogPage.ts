import { Page } from '@playwright/test';

export class DialogPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Overlap Dialog
  async getOverlapDialog() {
    return this.page.locator('[role="dialog"]:has-text("일정 겹침 경고")');
  }

  async assertOverlapDialogVisible() {
    const dialog = await this.getOverlapDialog();
    await dialog.waitFor({ state: 'visible' });
  }

  async clickOverlapCancel() {
    const dialog = await this.getOverlapDialog();
    await dialog.locator('button:has-text("취소")').click();
  }

  async clickOverlapContinue() {
    const dialog = await this.getOverlapDialog();
    await dialog.locator('button:has-text("계속 진행")').click();
  }

  async getOverlappingEventsList() {
    const dialog = await this.getOverlapDialog();
    return dialog.locator('p').allTextContents();
  }

  // Recurring Event Dialog
  async getRecurringDialog() {
    return this.page.locator('[role="dialog"]:has-text("반복 일정")');
  }

  async assertRecurringDialogVisible() {
    const dialog = await this.getRecurringDialog();
    await dialog.waitFor({ state: 'visible' });
  }

  async clickRecurringEditSingle() {
    const dialog = await this.getRecurringDialog();
    // "예" button = Edit/Delete single instance only
    await dialog.locator('button:has-text("예")').click();
  }

  async clickRecurringEditAll() {
    const dialog = await this.getRecurringDialog();
    // "아니오" button = Edit/Delete all instances in the series
    await dialog.locator('button:has-text("아니오")').click();
  }

  async clickRecurringCancel() {
    const dialog = await this.getRecurringDialog();
    await dialog.locator('button:has-text("취소")').click();
  }
}
