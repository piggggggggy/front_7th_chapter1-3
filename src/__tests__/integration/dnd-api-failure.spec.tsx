import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';

const ORIGINAL_DATE = '2025-10-15';
const NEW_DATE = '2025-10-20';

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

/**
 * D&D 시뮬레이션 헬퍼
 * 실제 D&D 이벤트를 발생시키는 것은 테스팅 라이브러리에서 어려우므로,
 * 편집 버튼을 클릭하여 일정 수정 폼을 열고 날짜를 변경하는 방식으로 시뮬레이션
 */
const simulateDragAndDrop = async (user: ReturnType<typeof userEvent.setup>) => {
  const editButton = await screen.findByLabelText('Edit event');
  await user.click(editButton);

  const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
  await user.clear(dateInput);
  await user.type(dateInput, NEW_DATE);

  return { dateInput, originalDate: ORIGINAL_DATE };
};

describe('[4-2.4] D&D 후 API 실패 시 일정 원상복구', () => {
  it('D&D로 일정을 이동했지만 API 요청이 실패하면 에러 토스트가 표시된다', async () => {
    const { user } = setup();

    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Failed to update event' }, { status: 500 });
      })
    );

    await simulateDragAndDrop(user);

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(screen.getByText(/일정 저장 실패/i)).toBeInTheDocument();
    });
  });

  it('D&D API 실패 시 일정이 원래 날짜로 유지된다', async () => {
    const { user } = setup();

    await screen.findByLabelText('Edit event');

    const originalEventList = within(screen.getByTestId('event-list'));
    const originalDateElement = await originalEventList.findByText(ORIGINAL_DATE);
    expect(originalDateElement).toBeInTheDocument();

    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Network error' }, { status: 500 });
      })
    );

    await simulateDragAndDrop(user);

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(screen.getByText(/일정 저장 실패/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText(ORIGINAL_DATE)).toBeInTheDocument();
      expect(eventList.queryByText(NEW_DATE)).not.toBeInTheDocument();
    });
  });

  it('네트워크 타임아웃 발생 시에도 에러가 처리되고 UI가 안정적으로 유지된다', async () => {
    const { user } = setup();

    server.use(
      http.put('/api/events/:id', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ error: 'Request timeout' }, { status: 408 });
      })
    );

    await simulateDragAndDrop(user);

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(
      () => {
        expect(screen.getByText(/일정 저장 실패/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByTestId('event-list')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
  });

  it('D&D 중 다른 일정과 충돌하는 경우 API 에러 발생 시 원상태로 복구된다', async () => {
    const { user } = setup();

    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Conflict detected and update failed' }, { status: 409 });
      })
    );

    const { originalDate } = await simulateDragAndDrop(user);

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(screen.getByText(/일정 저장 실패/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText(originalDate)).toBeInTheDocument();
    });
  });
});
