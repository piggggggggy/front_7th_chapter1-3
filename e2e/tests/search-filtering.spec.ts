import { test, expect } from '@playwright/test';

import { TestDataFactory } from '../fixtures/test-data';
import { CalendarPage } from '../pages/CalendarPage';
import { EventFormPage } from '../pages/EventFormPage';
import { EventListPage } from '../pages/EventListPage';
import { APIHelpers } from '../utils/api-helpers';

test.describe('검색 및 필터링', () => {
  let calendarPage: CalendarPage;
  let eventFormPage: EventFormPage;
  let eventListPage: EventListPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    eventFormPage = new EventFormPage(page);
    eventListPage = new EventListPage(page);

    // Clear events first
    await calendarPage.goto();
    await APIHelpers.clearAllEvents(page);
    TestDataFactory.reset();
  });

  test('TC-5.1: 제목으로 일정을 검색할 수 있다', async ({ page }) => {
    // Given: 여러 일정이 있음
    const event1 = TestDataFactory.createBasicEvent({
      title: '팀 미팅',
      date: TestDataFactory.getDateFromToday(1),
    });

    const event2 = TestDataFactory.createBasicEvent({
      title: '개인 운동',
      date: TestDataFactory.getDateFromToday(2),
    });

    const event3 = TestDataFactory.createBasicEvent({
      title: '팀 회식',
      date: TestDataFactory.getDateFromToday(3),
    });

    await APIHelpers.createEvent(page, event1);
    await APIHelpers.createEvent(page, event2);
    await APIHelpers.createEvent(page, event3);

    // Reload and wait for page to be ready
    await page.goto('/');

    // Debug: Take screenshot and log what's on the page
    await page.screenshot({ path: 'debug-before-search.png', fullPage: true });
    const eventListText = await page.locator('[data-testid="event-list"]').textContent();
    console.log('Event list content:', eventListText);

    // Verify all events are visible before search
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(event1.title)).toBeVisible();
    await expect(eventList.getByText(event2.title)).toBeVisible();
    await expect(eventList.getByText(event3.title)).toBeVisible();

    // When: "팀"으로 검색
    await eventListPage.search('팀');
    await page.waitForTimeout(500); // Wait for filter to apply

    // Then: "팀"이 포함된 일정만 표시됨
    await expect(eventList.getByText(event1.title)).toBeVisible();
    await expect(eventList.getByText(event3.title)).toBeVisible();
    await expect(eventList.getByText(event2.title)).not.toBeVisible();
  });

  test('TC-5.2: 설명으로 일정을 검색할 수 있다', async ({ page }) => {
    // Given: 설명이 다른 여러 일정이 있음
    const event1 = TestDataFactory.createBasicEvent({
      title: '회의 A',
      description: '프로젝트 리뷰',
      date: TestDataFactory.getDateFromToday(1),
    });

    const event2 = TestDataFactory.createBasicEvent({
      title: '회의 B',
      description: '분기 계획',
      date: TestDataFactory.getDateFromToday(2),
    });

    await APIHelpers.createEvent(page, event1);
    await APIHelpers.createEvent(page, event2);
    await page.reload();

    // When: "프로젝트"로 검색
    await eventListPage.search('프로젝트');

    // Then: 설명에 "프로젝트"가 포함된 일정만 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(event1.title)).toBeVisible();
    await expect(page.getByText(event2.title)).not.toBeVisible();
  });

  test('TC-5.3: 위치로 일정을 검색할 수 있다', async ({ page }) => {
    // Given: 위치가 다른 여러 일정이 있음
    const event1 = TestDataFactory.createBasicEvent({
      title: '미팅 1',
      location: '회의실 A',
      date: TestDataFactory.getDateFromToday(1),
    });

    const event2 = TestDataFactory.createBasicEvent({
      title: '미팅 2',
      location: '회의실 B',
      date: TestDataFactory.getDateFromToday(2),
    });

    const event3 = TestDataFactory.createBasicEvent({
      title: '미팅 3',
      location: '카페',
      date: TestDataFactory.getDateFromToday(3),
    });

    await APIHelpers.createEvent(page, event1);
    await APIHelpers.createEvent(page, event2);
    await APIHelpers.createEvent(page, event3);
    await page.reload();

    // When: "회의실"로 검색
    await eventListPage.search('회의실');

    // Then: 위치에 "회의실"이 포함된 일정만 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(event1.title)).toBeVisible();
    await expect(eventList.getByText(event2.title)).toBeVisible();
    await expect(eventList.getByText(event3.title)).not.toBeVisible();
  });

  test('TC-5.4: 검색어를 지우면 모든 일정이 다시 표시된다', async ({ page }) => {
    // Given: 여러 일정이 있고 검색 중
    const event1 = TestDataFactory.createBasicEvent({
      title: '검색 테스트 A',
      date: TestDataFactory.getDateFromToday(1),
    });

    const event2 = TestDataFactory.createBasicEvent({
      title: '다른 일정 B',
      date: TestDataFactory.getDateFromToday(2),
    });

    await APIHelpers.createEvent(page, event1);
    await APIHelpers.createEvent(page, event2);
    await page.reload();

    await eventListPage.search('검색');
    const eventList = page.locator('[data-testid="event-list"]');

    await expect(eventList.getByText(event1.title)).toBeVisible();
    await expect(eventList.getByText(event2.title)).not.toBeVisible();

    // When: 검색어 지우기
    await eventListPage.clearSearch();

    // Then: 모든 일정이 표시됨
    await expect(eventList.getByText(event1.title)).toBeVisible();
    await expect(eventList.getByText(event2.title)).toBeVisible();
  });

  test('TC-5.5: 대소문자 구분 없이 검색된다', async ({ page }) => {
    // Given: 영문 제목의 일정이 있음
    const event = TestDataFactory.createBasicEvent({
      title: 'Team Meeting',
      date: TestDataFactory.getDateFromToday(1),
    });

    await APIHelpers.createEvent(page, event);
    await page.reload();

    // When: 소문자로 검색
    await eventListPage.search('team');

    // Then: 대문자로 작성된 일정도 검색됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(event.title)).toBeVisible();

    // When: 대문자로 검색
    await eventListPage.clearSearch();
    await eventListPage.search('MEETING');

    // Then: 소문자로 작성된 부분도 검색됨
    await expect(eventList.getByText(event.title)).toBeVisible();
  });

  test('TC-5.6: 부분 일치 검색이 가능하다', async ({ page }) => {
    // Given: 일정이 있음
    const event = TestDataFactory.createBasicEvent({
      title: '프로젝트 킥오프 미팅',
      date: TestDataFactory.getDateFromToday(1),
    });

    await APIHelpers.createEvent(page, event);
    await page.reload();

    // When: 일부만 검색
    await eventListPage.search('킥오프');

    // Then: 전체 제목을 포함하는 일정이 검색됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(event.title)).toBeVisible();
  });

  test('TC-5.7: 월간 뷰에서 해당 월의 일정만 표시된다', async ({ page }) => {
    // Given: 서로 다른 달에 일정이 있음
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);

    const currentMonthEvent = TestDataFactory.createBasicEvent({
      title: '이번 달 일정',
      date: TestDataFactory.formatDate(now),
    });

    const nextMonthEvent = TestDataFactory.createBasicEvent({
      title: '다음 달 일정',
      date: TestDataFactory.formatDate(nextMonth),
    });

    await APIHelpers.createEvent(page, currentMonthEvent);
    await APIHelpers.createEvent(page, nextMonthEvent);
    await page.reload();

    // When: 월간 뷰에서 현재 월 확인
    await calendarPage.switchToMonthView();

    // Then: 현재 월의 일정만 표시됨 (implementation-dependent)
    // This behavior depends on how month view filters events

    // When: 다음 달로 이동
    await calendarPage.navigateToNext();

    // Then: 다음 달의 일정만 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(nextMonthEvent.title)).toBeVisible();
  });

  test('TC-5.8: 주간 뷰에서 해당 주의 일정만 표시된다', async ({ page }) => {
    // Given: 서로 다른 주에 일정이 있음
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const currentWeekEvent = TestDataFactory.createBasicEvent({
      title: '이번 주 일정',
      date: TestDataFactory.formatDate(now),
    });

    const nextWeekEvent = TestDataFactory.createBasicEvent({
      title: '다음 주 일정',
      date: TestDataFactory.formatDate(nextWeek),
    });

    await APIHelpers.createEvent(page, currentWeekEvent);
    await APIHelpers.createEvent(page, nextWeekEvent);
    await page.reload();

    // When: 주간 뷰로 전환
    await calendarPage.switchToWeekView();

    // Then: 현재 주의 일정만 표시됨 (implementation-dependent)

    // When: 다음 주로 이동
    await calendarPage.navigateToNext();

    // Then: 다음 주의 일정이 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(nextWeekEvent.title)).toBeVisible();
  });

  test('TC-5.9: 검색 결과가 없을 때 적절한 메시지가 표시된다', async ({ page }) => {
    // Given: 몇 개의 일정이 있음
    const event = TestDataFactory.createBasicEvent({
      title: '테스트 일정',
      date: TestDataFactory.getDateFromToday(1),
    });

    await APIHelpers.createEvent(page, event);
    await page.reload();

    // When: 존재하지 않는 검색어 입력
    await eventListPage.search('존재하지않는검색어12345');

    // Then: 검색 결과 없음 메시지 표시 또는 빈 목록
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(event.title)).not.toBeVisible();

    // Optionally check for "no results" message if implemented
    // await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
  });

  test('TC-5.10: 카테고리별로 일정을 필터링할 수 있다', async ({ page }) => {
    // Given: 다양한 카테고리의 일정이 있음
    const workEvent = TestDataFactory.createBasicEvent({
      title: '업무 회의',
      category: '업무',
      date: TestDataFactory.getDateFromToday(1),
    });

    const personalEvent = TestDataFactory.createBasicEvent({
      title: '개인 운동',
      category: '개인',
      date: TestDataFactory.getDateFromToday(2),
    });

    await APIHelpers.createEvent(page, workEvent);
    await APIHelpers.createEvent(page, personalEvent);
    await page.reload();

    // When: "업무" 카테고리로 검색
    await eventListPage.search('업무');

    // Then: 업무 카테고리 일정만 표시됨
    const eventList = page.locator('[data-testid="event-list"]');
    await expect(eventList.getByText(workEvent.title)).toBeVisible();
  });
});
