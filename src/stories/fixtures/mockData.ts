import { Event } from '../../types';

export const mockEvent: Event = {
  id: 'story-1',
  title: '팀 회의',
  date: '2025-11-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

export const mockRecurringEvent: Event = {
  id: 'story-2',
  title: '반복 회의',
  date: '2025-11-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '매주 반복되는 회의',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
  notificationTime: 60,
};

export const mockLongTitleEvent: Event = {
  id: 'story-3',
  title:
    '매우 긴 제목의 일정입니다. 이렇게 긴 제목이 UI에서 어떻게 표시되는지 확인하기 위한 테스트 데이터입니다.',
  date: '2025-11-16',
  startTime: '09:00',
  endTime: '10:00',
  description: '긴 제목 테스트',
  location: '온라인',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 1,
};

export const mockOverlappingEvent: Event = {
  id: 'story-4',
  title: '겹치는 일정',
  date: '2025-11-15',
  startTime: '10:30',
  endTime: '11:30',
  description: '다른 일정과 시간이 겹침',
  location: '회의실 C',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

export const mockEvents: Event[] = [
  mockEvent,
  mockRecurringEvent,
  {
    id: 'story-5',
    title: '프로젝트 리뷰',
    date: '2025-11-17',
    startTime: '15:00',
    endTime: '17:00',
    description: '분기별 프로젝트 리뷰',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 120,
  },
  {
    id: 'story-6',
    title: '개인 운동',
    date: '2025-11-18',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장',
    location: '피트니스 센터',
    category: '개인',
    repeat: { type: 'daily', interval: 1, id: 'repeat-2' },
    notificationTime: 30,
  },
  {
    id: 'story-7',
    title: '가족 저녁',
    date: '2025-11-19',
    startTime: '19:00',
    endTime: '21:00',
    description: '가족 식사',
    location: '레스토랑',
    category: '가족',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

export const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];
