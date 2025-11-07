import { test } from '@playwright/test';

import { TestDataFactory } from '../fixtures/test-data';
import { CalendarPage } from '../pages/CalendarPage';
import { SeedHelpers } from '../utils/seed-helpers';

test.describe('D&D 성공 시나리오', () => {
  let calendarPage: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    // eventFormPage = new EventFormPage(page);
    // dialogPage = new DialogPage(page);

    SeedHelpers.resetDatabase();
    await calendarPage.goto();
    await page.waitForLoadState('networkidle');
    TestDataFactory.reset();
  });

  // test('TC-6.1: 월간뷰에서 D&D로 일정을 옮기면, 일정이 수정된다', async ({ page }) => {
  //   // Given: 월간뷰에서 일정이 있음
  //   await calendarPage.switchToMonthView();

  //   const originalDate = TestDataFactory.getDateFromToday(5);
  //   const targetDate = TestDataFactory.getDateFromToday(15);

  //   const event = TestDataFactory.createBasicEvent({
  //     title: '월간뷰 D&D 테스트',
  //     date: originalDate,
  //     startTime: '10:00',
  //     endTime: '11:00',
  //     description: '이동할 일정',
  //     location: '회의실 A',
  //     category: '개인',
  //   });

  //   await APIHelpers.createEvent(page, event);
  //   await page.reload();
  //   await page.waitForLoadState('networkidle');

  //   // When: 일정을 다른 날짜로 드래그앤드롭
  //   await calendarPage.dragEventToDate(event.title, targetDate);

  //   // 겹침 다이얼로그가 뜰 수 있으므로 처리
  //   await page.waitForTimeout(500);
  //   const overlapDialog = await dialogPage.getOverlapDialog();
  //   const isOverlapVisible = await overlapDialog.isVisible().catch(() => false);

  //   if (isOverlapVisible) {
  //     await dialogPage.clickOverlapContinue();
  //   }

  //   // Wait for update
  //   await page.waitForTimeout(2000);

  //   // Then: 일정이 새 날짜에 표시됨
  //   const eventList = page.locator('[data-testid="event-list"]');
  //   const eventCard = eventList.locator(`text=${event.title}`).locator('../..');

  //   // Verify the date was updated in the event list
  //   const dateText = await eventCard.locator('p').nth(1).textContent();
  //   expect(dateText).toContain(targetDate);
  // });

  // test('TC-6.2: 주간뷰에서 D&D로 일정을 옮기면, 일정이 수정된다', async ({ page }) => {
  //   // Given: 주간뷰로 전환하고 일정이 있음
  //   const originalDate = TestDataFactory.getDateFromToday(1);
  //   const targetDate = TestDataFactory.getDateFromToday(3);

  //   const event = TestDataFactory.createBasicEvent({
  //     title: '주간뷰 D&D 테스트',
  //     date: originalDate,
  //     startTime: '14:00',
  //     endTime: '15:00',
  //     description: '주간뷰에서 이동',
  //     location: '강의실 B',
  //     category: '개인',
  //   });

  //   await APIHelpers.createEvent(page, event);
  //   await page.reload();
  //   await page.waitForLoadState('networkidle');

  //   await calendarPage.switchToWeekView();
  //   await page.waitForTimeout(500);

  //   // When: 일정을 다른 날짜로 드래그앤드롭
  //   await calendarPage.dragEventToDate(event.title, targetDate);

  //   // 겹침 다이얼로그가 뜰 수 있으므로 처리
  //   await page.waitForTimeout(500);
  //   const overlapDialog = await dialogPage.getOverlapDialog();
  //   const isOverlapVisible = await overlapDialog.isVisible().catch(() => false);

  //   if (isOverlapVisible) {
  //     await dialogPage.clickOverlapContinue();
  //   }

  //   // Wait for update
  //   await page.waitForTimeout(2000);

  //   // Then: 일정이 새 날짜에 표시됨
  //   const eventList = page.locator('[data-testid="event-list"]');
  //   const eventCard = eventList.locator(`text=${event.title}`).locator('../..');

  //   // Verify the date was updated
  //   const dateText = await eventCard.locator('p').nth(1).textContent();
  //   expect(dateText).toContain(targetDate);
  // });

  // test('TC-6.3: D&D로 반복일정을 옮기면, 단일 일정으로 수정된다', async ({ page }) => {
  //   // Given: 반복 일정이 있음
  //   const originalDate = TestDataFactory.getDateFromToday(2);
  //   const targetDate = TestDataFactory.getDateFromToday(12);

  //   const recurringEvent = TestDataFactory.createRecurringEvent({
  //     title: '반복 일정 D&D 테스트',
  //     date: originalDate,
  //     startTime: '09:00',
  //     endTime: '10:00',
  //     description: '매주 반복',
  //     location: '온라인',
  //     category: '개인',
  //     repeat: {
  //       type: 'weekly',
  //       interval: 1,
  //       endDate: TestDataFactory.getDateFromToday(30),
  //     },
  //   });

  //   await APIHelpers.createEvent(page, recurringEvent);
  //   await page.reload();
  //   await page.waitForLoadState('networkidle');

  //   await calendarPage.switchToMonthView();

  //   // When: 반복 일정의 한 인스턴스를 드래그앤드롭
  //   await calendarPage.dragEventToDate(recurringEvent.title, targetDate);

  //   // Then: 반복 일정 편집 다이얼로그가 표시됨
  //   await expect(page.getByText(/반복 일정 편집/i)).toBeVisible({ timeout: 5000 });

  //   // Select "이 일정만 수정" (single instance)
  //   await page.getByRole('button', { name: /이 일정만/i }).click();

  //   // 겹침 다이얼로그가 뜰 수 있으므로 처리
  //   await page.waitForTimeout(500);
  //   const overlapDialog = await dialogPage.getOverlapDialog();
  //   const isOverlapVisible = await overlapDialog.isVisible().catch(() => false);

  //   if (isOverlapVisible) {
  //     await dialogPage.clickOverlapContinue();
  //   }

  //   // Wait for update
  //   await page.waitForTimeout(2000);

  //   // Then: 일정이 새 날짜로 이동됨
  //   const eventList = page.locator('[data-testid="event-list"]');

  //   // Find the moved event at target date
  //   const targetEventCard = eventList
  //     .locator(`text=${recurringEvent.title}`)
  //     .locator('../..')
  //     .filter({ hasText: targetDate });

  //   await expect(targetEventCard).toBeVisible();

  //   // Verify it doesn't have repeat information anymore
  //   await expect(targetEventCard.getByText(/반복:/)).not.toBeVisible();
  // });
});
