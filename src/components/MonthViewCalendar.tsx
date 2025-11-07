import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { DragAndDropHandlers } from '../hooks/useDragAndDrop';
import { Event } from '../types';
import { EventBox } from './EventBox';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../utils/dateUtils';

interface MonthViewCalendarProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  weekDays: string[];
  dragHandlers?: DragAndDropHandlers<Event, string>;
  onCellClick?: (date: string) => void;
}

export function MonthViewCalendar({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  weekDays,
  dragHandlers,
  onCellClick,
}: MonthViewCalendarProps) {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];

                  return (
                    <TableCell
                      key={dayIndex}
                      onDragOver={dragHandlers?.handleDragOver}
                      onDragLeave={dragHandlers?.handleDragLeave}
                      onDrop={
                        dragHandlers && dateString
                          ? (e) => dragHandlers.handleDrop(e, dateString)
                          : undefined
                      }
                      onClick={
                        onCellClick && dateString ? () => onCellClick(dateString) : undefined
                      }
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: onCellClick && day ? 'pointer' : 'default',
                        '&:hover':
                          onCellClick && day
                            ? {
                                backgroundColor: '#f5f5f5',
                              }
                            : {},
                      }}
                    >
                      {day && (
                        <>
                          <Typography variant="body2" fontWeight="bold">
                            {day}
                          </Typography>
                          {holiday && (
                            <Typography variant="body2" color="error">
                              {holiday}
                            </Typography>
                          )}
                          {getEventsForDay(filteredEvents, day).map((event) => {
                            const isNotified = notifiedEvents.includes(event.id);

                            return (
                              <EventBox
                                key={event.id}
                                event={event}
                                isNotified={isNotified}
                                onDragStart={
                                  dragHandlers
                                    ? (e) => dragHandlers.handleDragStart(e, event)
                                    : undefined
                                }
                                onDragEnd={dragHandlers?.handleDragEnd}
                              />
                            );
                          })}
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
