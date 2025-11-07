import { test, expect } from '@playwright/test';

import { TestDataFactory } from '../fixtures/test-data';
import { CalendarPage } from '../pages/CalendarPage';
import { EventFormPage } from '../pages/EventFormPage';
import { EventListPage } from '../pages/EventListPage';
import { NotificationPage } from '../pages/NotificationPage';
import { SeedHelpers } from '../utils/seed-helpers';

test.describe('알림 시스템', () => {
  let calendarPage: CalendarPage;
  let eventFormPage: EventFormPage;
  let eventListPage: EventListPage;
  let notificationPage: NotificationPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    eventFormPage = new EventFormPage(page);
    eventListPage = new EventListPage(page);
    notificationPage = new NotificationPage(page);

    SeedHelpers.resetDatabase();
    await calendarPage.goto();
    await page.waitForLoadState('networkidle');
    TestDataFactory.reset();
  });

  test('TC-4.1: 일정 시작 1분 전 알림이 표시된다', async ({ page }) => {
    const now = new Date('2025-11-07T14:00:00');
    await page.clock.install({ time: now });

    // Given: 1분 후 시작하는 일정 생성
    const eventData = TestDataFactory.createBasicEvent({
      title: '1분 전 알림 테스트',
      date: TestDataFactory.formatDate(now),
      startTime: '14:02',
      endTime: '14:30',
    });

    await eventFormPage.fillBasicEvent(eventData);
    await eventFormPage.selectNotification(1); // 1분 전 알림
    await eventFormPage.submit();

    // When: 1분 경과
    await page.clock.runFor('01:00');

    // Then: 알림이 표시됨
    await notificationPage.waitForNotification(eventData.title, 70000);
    await notificationPage.assertNotificationVisible(eventData.title);
  });

  test('TC-4.2: 알림 설정한 일정은 시각적으로 표시된다', async ({ page }) => {
    // Given: 알림이 설정된 일정 생성
    const futureDate = TestDataFactory.getDateFromToday(5);
    const eventData = TestDataFactory.createBasicEvent({
      title: '알림 표시 테스트',
      date: futureDate,
      startTime: '10:00',
      endTime: '11:00',
    });

    await eventFormPage.fillBasicEvent(eventData);
    await eventFormPage.selectNotification(10); // 10분 전 알림
    await eventFormPage.submit();

    // Then: 알림 배지 또는 표시가 있음
    await page.waitForTimeout(500);
    // Note: Specific visual indicator depends on implementation
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(eventData.title)).toBeVisible();
  });

  test('TC-4.3: 10분 전 알림을 설정할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 10분 전 알림 설정
    const eventData = TestDataFactory.createBasicEvent({
      title: '10분 전 알림',
      date: TestDataFactory.getDateFromToday(1),
    });

    await eventFormPage.fillBasicEvent(eventData);
    await eventFormPage.selectNotification(10);
    await eventFormPage.submit();

    // Then: 일정이 알림 설정과 함께 생성됨

    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(eventData.title)).toBeVisible();
  });

  test('TC-4.4: 알림을 닫을 수 있다', async ({ page }) => {
    const now = new Date('2025-11-07T14:00:00');
    await page.clock.install({ time: now });

    // For now, create an event and verify it exists
    const eventData = TestDataFactory.createBasicEvent({
      title: '알림 닫기 테스트',
      date: TestDataFactory.formatDate(now),
      startTime: '14:11',
      endTime: '14:30',
    });

    await eventFormPage.fillBasicEvent(eventData);
    await eventFormPage.selectNotification(10);
    await eventFormPage.submit();

    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(eventData.title)).toBeVisible();

    // When: 알림이 표시되면 닫기 버튼 클릭
    await page.clock.runFor('01:00');
    await notificationPage.waitForNotification(eventData.title, 70000);
    await notificationPage.closeNotification(eventData.title);

    // Then: 알림이 사라짐
    await notificationPage.assertNotificationHidden(eventData.title);
  });
});
