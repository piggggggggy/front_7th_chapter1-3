import { test, expect } from '@playwright/test';

import { TestDataFactory } from '../fixtures/test-data';
import { CalendarPage } from '../pages/CalendarPage';
import { DialogPage } from '../pages/DialogPage';
import { EventFormPage } from '../pages/EventFormPage';
import { EventListPage } from '../pages/EventListPage';
import { SeedHelpers } from '../utils/seed-helpers';

test.describe('반복 일정 관리 워크플로우', () => {
  let calendarPage: CalendarPage;
  let eventFormPage: EventFormPage;
  let eventListPage: EventListPage;
  let dialogPage: DialogPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    eventFormPage = new EventFormPage(page);
    eventListPage = new EventListPage(page);
    dialogPage = new DialogPage(page);

    SeedHelpers.resetDatabase();
    await calendarPage.goto();
    await page.waitForLoadState('networkidle');
    TestDataFactory.reset();
  });

  test('TC-2.1: 매일 반복되는 일정을 생성할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 매일 반복 일정 생성
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '매일 스탠드업',
      repeatType: 'daily',
      repeatInterval: 1,
      date: TestDataFactory.getDateFromToday(1),
      repeatEndDate: TestDataFactory.getDateFromToday(7),
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();

    // Then: 반복 일정이 여러 날짜에 표시됨
    await expect(page.getByText(recurringData.title).first()).toBeVisible();

    // Verify multiple instances created
    const allText = await page.textContent('body');
    const matches = (allText || '').match(new RegExp(recurringData.title, 'g'));
    expect(matches).toBeTruthy();
    expect((matches || []).length).toBeGreaterThan(1);
  });

  test('TC-2.2: 매주 반복되는 일정을 생성할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 매주 반복 일정 생성
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '주간 회의',
      repeatType: 'weekly',
      repeatInterval: 1,
      date: TestDataFactory.getDateFromToday(1),
      repeatEndDate: TestDataFactory.getDateFromToday(21),
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();

    // Then: 반복 일정이 생성됨
    await expect(page.getByText(recurringData.title).first()).toBeVisible();
  });

  test('TC-2.3: 매월 반복되는 일정을 생성할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 매월 반복 일정 생성
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '월간 보고',
      repeatType: 'monthly',
      repeatInterval: 1,
      date: TestDataFactory.getDateFromToday(5),
      repeatEndDate: TestDataFactory.getDateFromToday(90),
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();

    // Then: 반복 일정이 생성됨
    await expect(page.getByText(recurringData.title).first()).toBeVisible();
  });

  test('TC-2.4: 반복 일정의 단일 인스턴스만 수정할 수 있다', async ({ page }) => {
    // Given: 매주 반복 일정이 있음
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '반복 회의',
      repeatType: 'weekly',
      repeatInterval: 1,
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();
    await page.reload();

    // When: 반복 일정 편집 시도
    await eventListPage.clickEditButton(recurringData.title);

    // Then: 반복 일정 다이얼로그 표시
    await dialogPage.assertRecurringDialogVisible();

    // When: 단일 인스턴스만 수정 선택
    await dialogPage.clickRecurringEditSingle();

    // Then: 일정 양식이 표시되고 수정 가능
    const updatedTitle = '수정된 회의';
    await eventFormPage.fillTitle(updatedTitle);
    await eventFormPage.submit();

    // Then: 수정된 인스턴스가 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(updatedTitle)).toBeVisible();
    // 원래 반복 일정도 여전히 존재
    await expect(eventList.getByText(recurringData.title).first()).toBeVisible();
  });

  test('TC-2.5: 반복 일정의 모든 인스턴스를 수정할 수 있다', async ({ page }) => {
    // Given: 매주 반복 일정이 있음
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '전체 수정 회의',
      repeatType: 'weekly',
      repeatInterval: 1,
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();
    await page.reload();

    // When: 반복 일정 편집 시도
    await eventListPage.clickEditButton(recurringData.title);
    await dialogPage.assertRecurringDialogVisible();

    // When: 모든 인스턴스 수정 선택
    await dialogPage.clickRecurringEditAll();

    // Then: 일정 양식이 표시되고 수정 가능
    const updatedTitle = '전체 수정된 회의';
    await eventFormPage.fillTitle(updatedTitle);
    await eventFormPage.submit();

    // Then: 모든 인스턴스가 수정됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(updatedTitle).first()).toBeVisible();
    await expect(eventList.getByText(updatedTitle).last()).toBeVisible();
    // 원래 제목은 더 이상 보이지 않음
    await expect(eventList.getByText(recurringData.title)).not.toBeVisible();
  });

  test('TC-2.6: 반복 일정의 단일 인스턴스만 삭제할 수 있다', async ({ page }) => {
    // Given: 매일 반복 일정이 있음
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '단일 삭제 일정',
      repeatType: 'daily',
      repeatInterval: 1,
      date: TestDataFactory.getDateFromToday(1),
      repeatEndDate: TestDataFactory.getDateFromToday(5),
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialCount = await page.getByText(recurringData.title).count();

    // When: 반복 일정 삭제 시도
    await eventListPage.clickDeleteButton(recurringData.title);
    await dialogPage.assertRecurringDialogVisible();

    // When: 단일 인스턴스만 삭제 선택
    await dialogPage.clickRecurringEditSingle();

    // Then: 단일 인스턴스만 삭제됨
    await page.waitForTimeout(500);
    const finalCount = await page.getByText(recurringData.title).count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('TC-2.7: 반복 일정의 모든 인스턴스를 삭제할 수 있다', async ({ page }) => {
    // Given: 매주 반복 일정이 있음
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '전체 삭제 일정',
      repeatType: 'weekly',
      repeatInterval: 1,
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();
    await page.reload();

    // When: 반복 일정 삭제 시도
    await eventListPage.clickDeleteButton(recurringData.title);
    await dialogPage.assertRecurringDialogVisible();

    // When: 모든 인스턴스 삭제 선택
    await dialogPage.clickRecurringEditAll();
    await page.waitForTimeout(500);

    // Then: 모든 인스턴스가 삭제됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(recurringData.title)).not.toBeVisible();
  });

  test('TC-2.8: 반복 간격을 2 이상으로 설정할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 2주마다 반복되는 일정 생성
    const recurringData = TestDataFactory.createRecurringEvent({
      title: '격주 회의',
      repeatType: 'weekly',
      repeatInterval: 2, // Every 2 weeks
      date: TestDataFactory.getDateFromToday(1),
      repeatEndDate: TestDataFactory.getDateFromToday(28),
    });

    await eventFormPage.fillRecurringEvent(recurringData);
    await eventFormPage.submit();

    // Then: 반복 일정이 생성됨
    await expect(page.getByText(recurringData.title).first()).toBeVisible();
  });
});
