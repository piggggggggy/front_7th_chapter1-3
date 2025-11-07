import { Page, Locator } from '@playwright/test';

export class NotificationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getNotificationAlert(message: string) {
    return this.page.locator(`[role="alert"]:has-text("${message}")`);
  }

  async assertNotificationVisible(message: string) {
    const alert = await this.getNotificationAlert(message);
    await alert.waitFor({ state: 'visible' });
  }

  async assertNotificationHidden(message: string) {
    const alert = await this.getNotificationAlert(message);
    await alert.waitFor({ state: 'hidden' });
  }

  async closeNotification(message: string) {
    const alert = await this.getNotificationAlert(message);
    const closeButton = alert.locator('button[aria-label="close"]');
    await closeButton.click();
  }

  async waitForNotification(message: string, timeout = 5000) {
    const alert = await this.getNotificationAlert(message);
    await alert.waitFor({ state: 'visible', timeout });
  }
}
