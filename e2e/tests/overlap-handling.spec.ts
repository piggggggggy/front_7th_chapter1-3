import { test, expect } from '@playwright/test';

import { TestDataFactory } from '../fixtures/test-data';
import { CalendarPage } from '../pages/CalendarPage';
import { DialogPage } from '../pages/DialogPage';
import { EventFormPage } from '../pages/EventFormPage';
import { EventListPage } from '../pages/EventListPage';
import { APIHelpers } from '../utils/api-helpers';
import { SeedHelpers } from '../utils/seed-helpers';

test.describe('일정 겹침 처리', () => {
  let calendarPage: CalendarPage;
  let eventFormPage: EventFormPage;
  let dialogPage: DialogPage;
  let eventListPage: EventListPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    eventFormPage = new EventFormPage(page);
    dialogPage = new DialogPage(page);
    eventListPage = new EventListPage(page);

    SeedHelpers.resetDatabase();
    await calendarPage.goto();
    await page.waitForLoadState('networkidle');
    TestDataFactory.reset();
  });

  test('TC-3.1: 겹치는 일정 생성 시 경고 다이얼로그가 표시된다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(3);
    const existingEvent = TestDataFactory.createBasicEvent({
      title: '기존 회의',
      date: testDate,
      startTime: '10:00',
      endTime: '11:00',
    });

    await APIHelpers.createEvent(page, existingEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 겹치는 시간에 새 일정 생성 시도
    await eventFormPage.fillTitle('겹치는 회의');
    await eventFormPage.fillDate(testDate);
    await eventFormPage.fillTime('10:30', '11:30'); // Overlaps with existing event
    await eventFormPage.submit();

    // Then: 겹침 경고 다이얼로그 표시
    await dialogPage.assertOverlapDialogVisible();

    // Verify overlapping event is listed
    const overlappingEvents = await dialogPage.getOverlappingEventsList();
    const hasExistingEvent = overlappingEvents.some((text) => text.includes(existingEvent.title));
    expect(hasExistingEvent).toBeTruthy();
  });

  test('TC-3.2: 겹침 경고에서 "취소"를 선택하면 일정이 생성되지 않는다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(3);
    const existingEvent = TestDataFactory.createBasicEvent({
      title: '기존 미팅',
      date: testDate,
      startTime: '14:00',
      endTime: '15:00',
    });

    await APIHelpers.createEvent(page, existingEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 겹치는 일정 생성 시도 후 취소
    const newEventTitle = '취소될 미팅';
    await eventFormPage.fillTitle(newEventTitle);
    await eventFormPage.fillDate(testDate);
    await eventFormPage.fillTime('14:30', '15:30');
    await eventFormPage.submit();

    await dialogPage.assertOverlapDialogVisible();
    await dialogPage.clickOverlapCancel();

    // Then: 새 일정이 생성되지 않음
    await expect(page.getByText(newEventTitle)).not.toBeVisible();
    // 기존 일정은 여전히 존재
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(existingEvent.title)).toBeVisible();
  });

  test('TC-3.3: 겹침 경고에서 "계속 진행"을 선택하면 일정이 생성된다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(4);
    const existingEvent = TestDataFactory.createBasicEvent({
      title: '기존 세션',
      date: testDate,
      startTime: '09:00',
      endTime: '10:00',
    });

    await APIHelpers.createEvent(page, existingEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 겹치는 일정 생성 후 계속 진행
    const newEventTitle = '진행할 세션';
    await eventFormPage.fillTitle(newEventTitle);
    await eventFormPage.fillDate(testDate);
    await eventFormPage.fillTime('09:30', '10:30');
    await eventFormPage.submit();

    await dialogPage.assertOverlapDialogVisible();
    await dialogPage.clickOverlapContinue();

    // Then: 두 일정 모두 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(newEventTitle)).toBeVisible();
    await expect(eventList.getByText(existingEvent.title)).toBeVisible();
  });

  test('TC-3.4: 완전히 겹치는 일정도 경고를 표시한다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(5);
    const existingEvent = TestDataFactory.createBasicEvent({
      title: '완전 겹침 원본',
      date: testDate,
      startTime: '13:00',
      endTime: '14:00',
    });

    await APIHelpers.createEvent(page, existingEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 완전히 동일한 시간에 일정 생성
    await eventFormPage.fillTitle('완전 겹침 복사본');
    await eventFormPage.fillDate(testDate);
    await eventFormPage.fillTime('13:00', '14:00'); // Exact same time
    await eventFormPage.submit();

    // Then: 겹침 경고 다이얼로그 표시
    await dialogPage.assertOverlapDialogVisible();
  });

  test('TC-3.5: 부분적으로 겹치는 일정도 경고를 표시한다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(6);
    const existingEvent = TestDataFactory.createBasicEvent({
      title: '부분 겹침 원본',
      date: testDate,
      startTime: '15:00',
      endTime: '17:00',
    });

    await APIHelpers.createEvent(page, existingEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 부분적으로 겹치는 일정 생성 (끝 시간만 겹침)
    await eventFormPage.fillTitle('부분 겹침 새 일정');
    await eventFormPage.fillDate(testDate);
    await eventFormPage.fillTime('16:30', '18:00'); // Partial overlap
    await eventFormPage.submit();

    // Then: 겹침 경고 다이얼로그 표시
    await dialogPage.assertOverlapDialogVisible();
  });

  test('TC-3.6: 드래그 앤 드롭으로 겹치는 위치에 일정 이동 시 경고가 표시된다', async ({
    page,
  }) => {
    // Given: 두 개의 서로 다른 날짜에 일정이 있음
    const date1 = TestDataFactory.getDateFromToday(7);
    const date2 = TestDataFactory.getDateFromToday(8);

    const event1 = TestDataFactory.createBasicEvent({
      title: '고정 일정',
      date: date1,
      startTime: '10:00',
      endTime: '11:00',
    });

    const event2 = TestDataFactory.createBasicEvent({
      title: '이동할 일정',
      date: date2,
      startTime: '10:00',
      endTime: '11:00',
    });

    await APIHelpers.createEvent(page, event1);
    await APIHelpers.createEvent(page, event2);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: event2를 event1의 날짜로 드래그
    await calendarPage.dragEventToDate(event2.title, date1);

    // Then: 겹침 경고 다이얼로그 표시
    await dialogPage.assertOverlapDialogVisible();
  });

  test('TC-3.7: 일정 수정 시 다른 일정과 겹치면 경고가 표시된다', async ({ page }) => {
    // Given: 두 개의 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(9);

    const event1 = TestDataFactory.createBasicEvent({
      title: '고정된 일정',
      date: testDate,
      startTime: '09:00',
      endTime: '10:00',
    });

    const event2 = TestDataFactory.createBasicEvent({
      title: '수정할 일정',
      date: testDate,
      startTime: '11:00',
      endTime: '12:00',
    });

    await APIHelpers.createEvent(page, event1);
    await APIHelpers.createEvent(page, event2);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: event2의 시간을 event1과 겹치도록 수정
    await eventListPage.clickEditButton(event2.title);
    await eventFormPage.fillTime('09:30', '10:30'); // Now overlaps with event1
    await eventFormPage.submit();

    // Then: 겹침 경고 다이얼로그 표시
    await dialogPage.assertOverlapDialogVisible();
  });

  test('TC-3.8: 겹치지 않는 일정은 경고 없이 생성된다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const testDate = TestDataFactory.getDateFromToday(10);
    const existingEvent = TestDataFactory.createBasicEvent({
      title: '아침 일정',
      date: testDate,
      startTime: '09:00',
      endTime: '10:00',
    });

    await APIHelpers.createEvent(page, existingEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 겹치지 않는 시간에 일정 생성
    const newEventTitle = '오후 일정';
    await eventFormPage.fillTitle(newEventTitle);
    await eventFormPage.fillDate(testDate);
    await eventFormPage.fillTime('14:00', '15:00'); // No overlap
    await eventFormPage.submit();

    // Then: 경고 없이 일정 생성됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(newEventTitle)).toBeVisible();

    // Verify overlap dialog was not shown
    const overlapDialog = await dialogPage.getOverlapDialog();
    await expect(overlapDialog).not.toBeVisible();
  });
});
