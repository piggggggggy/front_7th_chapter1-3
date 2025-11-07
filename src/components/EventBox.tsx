import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { DragEvent } from 'react';

import { Event } from '../types';
import { getRepeatTypeLabel } from '../utils/repeatUtils';

interface EventBoxProps {
  event: Event;
  isNotified: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, event: Event) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
}

const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

export function EventBox({ event, isNotified, onDragStart, onDragEnd }: EventBoxProps) {
  const isRepeating = event.repeat.type !== 'none';

  return (
    <Box
      data-testid="event-box"
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(e, event) : undefined}
      onDragEnd={onDragEnd}
      sx={{
        ...eventBoxStyles.common,
        ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
        cursor: onDragStart ? 'grab' : 'default',
        '&:active': onDragStart ? { cursor: 'grabbing' } : {},
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRepeating && (
          <Tooltip
            title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
              event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
            }`}
          >
            <Repeat fontSize="small" />
          </Tooltip>
        )}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
}
