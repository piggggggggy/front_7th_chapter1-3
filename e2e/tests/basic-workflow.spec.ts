import { test, expect } from '@playwright/test';

import { TestDataFactory } from '../fixtures/test-data';
import { CalendarPage } from '../pages/CalendarPage';
import { EventFormPage } from '../pages/EventFormPage';
import { EventListPage } from '../pages/EventListPage';
import { APIHelpers } from '../utils/api-helpers';
import { SeedHelpers } from '../utils/seed-helpers';

test.describe('기본 일정 관리 워크플로우', () => {
  let calendarPage: CalendarPage;
  let eventFormPage: EventFormPage;
  let eventListPage: EventListPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    calendarPage = new CalendarPage(page);
    eventFormPage = new EventFormPage(page);
    eventListPage = new EventListPage(page);

    // Reset database directly (no API calls)
    SeedHelpers.resetDatabase();

    // Navigate to page (database already clean)
    await calendarPage.goto();

    // Wait for initial data loading to complete
    await page.waitForLoadState('networkidle');

    // Reset test data factory
    TestDataFactory.reset();
  });

  test('TC-1.1: 사용자가 빈 날짜 셀을 클릭하여 일정을 생성할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 빈 날짜 셀 클릭 및 정보 입력
    const eventData = TestDataFactory.createBasicEvent({
      title: '팀 회의',
      date: TestDataFactory.getDateFromToday(5),
      startTime: '09:00',
      endTime: '10:00',
    });

    await calendarPage.clickDate(eventData.date);
    await eventFormPage.fillTitle(eventData.title);
    await eventFormPage.fillTime(eventData.startTime, eventData.endTime);
    await eventFormPage.submit();

    // Then: 일정이 생성되어 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(eventData.title)).toBeVisible();
    await expect(
      eventList.getByText(`${eventData.startTime} - ${eventData.endTime}`)
    ).toBeVisible();
  });

  test('TC-1.2: 사용자가 일정 양식에서 모든 필드를 입력하여 일정을 생성할 수 있다', async ({
    page,
  }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 일정 양식의 모든 필드 입력
    const eventData = TestDataFactory.createBasicEvent({
      title: '프로젝트 킥오프',
      date: TestDataFactory.getDateFromToday(3),
      startTime: '14:00',
      endTime: '16:00',
      description: '새 프로젝트 시작',
      location: '회의실 A',
      category: '업무',
    });

    await eventFormPage.fillBasicEvent(eventData);
    await eventFormPage.submit();

    // Then: 일정이 생성되어 모든 정보가 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(eventData.title)).toBeVisible();
    await eventListPage.assertEventInList(eventData.title);

    // Verify event details in list
    const details = await eventListPage.getEventDetails(eventData.title);
    expect(details.title).toContain(eventData.title);
  });

  test('TC-1.3: 사용자가 기존 일정을 수정할 수 있다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const originalEvent = TestDataFactory.createBasicEvent({
      title: '원래 회의',
      date: TestDataFactory.getDateFromToday(2),
    });

    await APIHelpers.createEvent(page, originalEvent);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: 일정 편집
    await eventListPage.clickEditButton(originalEvent.title);

    const updatedTitle = '수정된 회의';
    await eventFormPage.fillTitle(updatedTitle);
    await eventFormPage.fillTime('11:00', '12:00');
    await eventFormPage.submit();

    // Then: 일정이 수정됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(updatedTitle)).toBeVisible();
    await expect(eventList.getByText(originalEvent.title)).not.toBeVisible();
  });

  test('TC-1.4: 사용자가 기존 일정을 삭제할 수 있다', async ({ page }) => {
    // Given: 기존 일정이 있음
    const eventData = TestDataFactory.createBasicEvent({
      title: '삭제할 일정',
    });

    await APIHelpers.createEvent(page, eventData);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await eventListPage.assertEventInList(eventData.title);

    // When: 일정 삭제
    await eventListPage.clickDeleteButton(eventData.title);

    // Wait for the success notification to appear
    await page.waitForSelector('[role="alert"]:has-text("일정이 삭제되었습니다")', {
      timeout: 5000,
    });

    // Then: 일정이 삭제됨
    await eventListPage.assertEventNotInList(eventData.title);
  });

  test('TC-1.5: 필수 필드 누락 시 유효성 검증 오류가 표시된다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 제목 없이 일정 생성 시도
    await eventFormPage.fillDate(TestDataFactory.getDateFromToday(1));
    await eventFormPage.fillTime('09:00', '10:00');
    await eventFormPage.submit();

    // Then: 유효성 검증 오류 표시
    const error = await eventFormPage.getValidationError();
    await expect(error).toBeVisible();
    await expect(error).toContainText('필수 정보를 모두 입력해주세요');
  });

  test('TC-1.6: 시작 시간이 종료 시간보다 늦으면 유효성 검증 오류가 표시된다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 시작 시간이 종료 시간보다 늦게 설정
    await eventFormPage.fillTitle('잘못된 시간 일정');
    await eventFormPage.fillDate(TestDataFactory.getDateFromToday(1));
    await eventFormPage.fillTime('18:00', '09:00'); // Invalid time range
    await eventFormPage.submit();

    // Then: 유효성 검증 오류 표시
    const error = await eventFormPage.getValidationError();
    await expect(error).toBeVisible();
    await expect(error).toContainText('시간 설정을 확인해주세요');
  });

  test('TC-1.7: 월간 뷰와 주간 뷰를 전환할 수 있다', async ({ page }) => {
    // Given: 사용자가 월간 뷰에 있음
    await calendarPage.goto();
    await calendarPage.switchToMonthView();

    // When: 주간 뷰로 전환
    await calendarPage.switchToWeekView();

    // Then: 주간 뷰가 표시됨
    await expect(page.locator('[data-testid="week-view"]')).toBeVisible();

    // When: 다시 월간 뷰로 전환
    await calendarPage.switchToMonthView();

    // Then: 월간 뷰가 표시됨
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible();
  });

  test('TC-1.8: 이전/다음 달로 네비게이션할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 페이지에 있음
    await calendarPage.goto();

    // When: 다음 달로 이동
    await calendarPage.navigateToNext();

    // Then: 다음 달이 표시됨
    // Note: Verify by checking if month title changes

    // When: 이전 달로 이동
    await calendarPage.navigateToPrevious();

    // Then: 이전 달이 표시됨
    // Note: Should be back to original month

    // Then: 현재 월이 표시됨
  });
});
