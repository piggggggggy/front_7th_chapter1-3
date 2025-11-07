import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = () => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('[4-2.1] 월간뷰에서 캘린더 날짜 클릭 시 왼쪽 폼에 날짜 반영해서 추가', () => {
  it('월간뷰의 빈 날짜 셀을 클릭하면 EventForm에 해당 날짜가 자동으로 입력된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup();

    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    const dateCells = within(monthView).getAllByRole('cell');
    const targetCell = dateCells.find((cell) => cell.textContent?.includes('15'));

    expect(targetCell).toBeDefined();
    await user.click(targetCell!);

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;

    expect(dateInput.value).toMatch(/\d{4}-\d{2}-15/);
  });

  it('월간뷰에서 날짜 클릭 후 일정 정보를 입력하고 저장하면 새 일정이 추가된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup();

    const monthView = await screen.findByTestId('month-view');
    const dateCells = within(monthView).getAllByRole('cell');
    const targetCell = dateCells.find((cell) => cell.textContent?.includes('20'));

    await user.click(targetCell!);

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toMatch(/\d{4}-\d{2}-20/);

    await user.type(screen.getByLabelText('제목'), '월간뷰 클릭 테스트');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '날짜 클릭으로 생성');
    await user.type(screen.getByLabelText('위치'), '회의실');

    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('월간뷰 클릭 테스트')).toBeInTheDocument();
    expect(eventList.getByText('날짜 클릭으로 생성')).toBeInTheDocument();
  });
});

describe('[4-2.2] 주간뷰에서 캘린더 날짜 클릭 시 왼쪽 폼에 날짜 반영해서 추가', () => {
  it('주간뷰로 전환 후 날짜 셀을 클릭하면 EventForm에 해당 날짜가 자동으로 입력된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup();

    const viewSelect = within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox');
    await user.click(viewSelect);
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    const dateTableRows = within(weekView).getByTestId('week-view-table-body');
    const dateCells = within(dateTableRows).getAllByRole('cell');
    const firstDateCell = dateCells[0];

    await user.click(firstDateCell);

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;

    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInput.value).not.toBe('');
  });

  it('주간뷰에서 날짜 클릭 후 일정 정보를 입력하고 저장하면 새 일정이 추가된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup();

    const viewSelect = within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox');
    await user.click(viewSelect);
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = await screen.findByTestId('week-view');
    const dateTableRows = within(weekView).getByTestId('week-view-table-body');
    const dateCells = within(dateTableRows).getAllByRole('cell');
    const secondDateCell = dateCells[1];

    await user.click(secondDateCell);

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInput.value).not.toBe('');

    await user.type(screen.getByLabelText('제목'), '주간뷰 클릭 테스트');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '주간뷰에서 날짜 클릭');
    await user.type(screen.getByLabelText('위치'), '강의실');

    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('주간뷰 클릭 테스트')).toBeInTheDocument();
    expect(eventList.getByText('주간뷰에서 날짜 클릭')).toBeInTheDocument();
  });
});
