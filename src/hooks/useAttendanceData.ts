import { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types/schedule';

export const useAttendanceData = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('attendance-records');
    if (saved) {
      try {
        setAttendanceRecords(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des présences:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('attendance-records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const addOrUpdateAttendance = (
    scheduleSlotId: string,
    date: string,
    status: 'present' | 'absent' | 'late' | 'dismissed',
    studentId?: string,
    teacherId?: string,
    justification?: string
  ) => {
    const existingIndex = attendanceRecords.findIndex(r =>
      r.scheduleSlotId === scheduleSlotId &&
      r.date === date &&
      r.studentId === studentId &&
      r.teacherId === teacherId
    );

    const newRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? attendanceRecords[existingIndex].id : Date.now().toString(),
      scheduleSlotId,
      date,
      status,
      studentId,
      teacherId,
      justification,
      createdAt: existingIndex >= 0 ? attendanceRecords[existingIndex].createdAt : new Date().toISOString()
    };

    if (existingIndex >= 0) {
      setAttendanceRecords(prev => prev.map((r, i) => i === existingIndex ? newRecord : r));
    } else {
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
  };

  const getAttendanceByDate = (date: string) => {
    return attendanceRecords.filter(r => r.date === date);
  };

  const getStudentAttendance = (studentId: string, date: string) => {
    return attendanceRecords.filter(r => r.studentId === studentId && r.date === date);
  };

  const getTeacherAttendance = (teacherId: string, date: string) => {
    return attendanceRecords.filter(r => r.teacherId === teacherId && r.date === date);
  };

  const getAttendanceForSlot = (scheduleSlotId: string, date: string, studentId?: string, teacherId?: string) => {
    return attendanceRecords.find(r =>
      r.scheduleSlotId === scheduleSlotId &&
      r.date === date &&
      r.studentId === studentId &&
      r.teacherId === teacherId
    );
  };

  return {
    attendanceRecords,
    addOrUpdateAttendance,
    getAttendanceByDate,
    getStudentAttendance,
    getTeacherAttendance,
    getAttendanceForSlot
  };
};