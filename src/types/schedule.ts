export interface ClassScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  classId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  teacherId?: string;
  scheduleSlotId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'dismissed';
  justification?: string;
  createdAt: string;
}

export const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi'
];

export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];