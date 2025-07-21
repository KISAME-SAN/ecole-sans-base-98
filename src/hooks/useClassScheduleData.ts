import { useState, useEffect } from 'react';
import { ClassScheduleSlot } from '@/types/schedule';

export const useClassScheduleData = () => {
  const [classSchedules, setClassSchedules] = useState<ClassScheduleSlot[]>([]);

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('class-schedules');
    if (saved) {
      try {
        setClassSchedules(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des emplois du temps:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('class-schedules', JSON.stringify(classSchedules));
  }, [classSchedules]);

  const addClassScheduleSlots = (classId: string, slots: Omit<ClassScheduleSlot, 'id' | 'classId'>[]) => {
    const newSlots = slots.map(slot => ({
      ...slot,
      id: `${classId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      classId
    }));
    
    setClassSchedules(prev => {
      // Supprimer les anciens créneaux de cette classe
      const filtered = prev.filter(s => s.classId !== classId);
      return [...filtered, ...newSlots];
    });
  };

  const getScheduleByClass = (classId: string) => {
    return classSchedules.filter(s => s.classId === classId);
  };

  const deleteClassSchedule = (classId: string) => {
    setClassSchedules(prev => prev.filter(s => s.classId !== classId));
  };

  const getAllSchedules = () => {
    return classSchedules;
  };

  const getScheduleByTeacher = (teacherId: string) => {
    return classSchedules.filter(s => s.teacherId === teacherId);
  };

  return {
    classSchedules,
    addClassScheduleSlots,
    getScheduleByClass,
    deleteClassSchedule,
    getAllSchedules,
    getScheduleByTeacher
  };
};