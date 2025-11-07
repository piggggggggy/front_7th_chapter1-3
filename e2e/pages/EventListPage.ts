import { Page, Locator } from '@playwright/test';

export class EventListPage {
  readonly page: Page;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // Try multiple selectors: id, placeholder, or label
    this.searchInput = page
      .locator('input#search, input[placeholder="검색어를 입력하세요"]')
      .first();
  }

  async search(term: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill(term);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getEventListItem(title: string) {
    // EventCard는 Box로 렌더링되고 title이 Typography에 있음
    return this.page
      .locator(`[data-testid="event-list"]`)
      .locator('div')
      .filter({ hasText: title })
      .first();
  }

  async clickEditButton(title: string) {
    // title을 포함하는 Box 내의 Edit 버튼 클릭 (event-list 내에서만 검색)
    const eventList = this.page.locator('[data-testid="event-list"]');
    const eventBox = eventList.locator('div').filter({ hasText: title }).first();
    await eventBox.locator('button[aria-label="Edit event"]').click();
  }

  async clickDeleteButton(title: string) {
    // title을 포함하는 Box 내의 Delete 버튼 클릭 (event-list 내에서만 검색)
    const eventList = this.page.locator('[data-testid="event-list"]');
    const eventBox = eventList.locator('div').filter({ hasText: title }).first();
    await eventBox.locator('button[aria-label="Delete event"]').click();
  }

  async assertEventInList(title: string) {
    await this.page
      .locator(`[data-testid="event-list"]`)
      .locator('text=' + title)
      .waitFor({ state: 'visible' });
  }

  async assertEventNotInList(title: string) {
    const eventList = this.page.locator(`[data-testid="event-list"]`);
    await eventList.waitFor({ state: 'visible' });
    // Check that the title is not in the event list
    const count = await eventList.locator('text=' + title).count();
    if (count > 0) {
      throw new Error(`Event "${title}" should not be in list but was found`);
    }
  }

  async getEventDetails(title: string) {
    const eventList = this.page.locator('[data-testid="event-list"]');
    const eventBox = eventList.locator('div').filter({ hasText: title }).first();
    const allText = await eventBox.textContent();
    return {
      title: title,
      fullText: allText,
    };
  }

  async assertNotificationBadge(title: string) {
    const eventList = this.page.locator('[data-testid="event-list"]');
    const eventBox = eventList.locator('div').filter({ hasText: title }).first();
    // Notification icon is present when isNotified is true
    const notificationIcon = eventBox.locator('[data-testid="NotificationsIcon"]');
    await notificationIcon.waitFor({ state: 'visible' });
  }
}
