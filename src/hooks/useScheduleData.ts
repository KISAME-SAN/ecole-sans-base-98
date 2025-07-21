
import { useState, useEffect } from 'react';

export interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  className: string;
  teacherId: string;
}

export const useScheduleData = () => {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);

  // Charger les emplois du temps depuis le localStorage au démarrage
  useEffect(() => {
    console.log('🔄 Chargement des emplois du temps depuis localStorage...');
    const savedSchedules = localStorage.getItem('school-schedules');
    if (savedSchedules) {
      try {
        const parsed = JSON.parse(savedSchedules);
        console.log('✅ Emplois du temps chargés:', parsed);
        setSchedules(parsed);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des emplois du temps:', error);
      }
    } else {
      console.log('ℹ️ Aucun emploi du temps trouvé dans localStorage');
    }
  }, []);

  // Sauvegarder dans le localStorage à chaque modification
  useEffect(() => {
    console.log('💾 Sauvegarde des emplois du temps:', schedules);
    localStorage.setItem('school-schedules', JSON.stringify(schedules));
  }, [schedules]);

  const addScheduleSlots = (teacherId: string, slots: Omit<ScheduleSlot, 'id' | 'teacherId'>[]) => {
    console.log('➕ Ajout d\'emploi du temps pour le professeur:', teacherId);
    console.log('📋 Créneaux à ajouter:', slots);
    
    const newSlots = slots.map(slot => ({
      ...slot,
      id: `${teacherId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teacherId
    }));
    
    console.log('🆕 Nouveaux créneaux générés:', newSlots);
    
    setSchedules(prev => {
      // Supprimer les anciens créneaux de ce professeur
      const filtered = prev.filter(s => s.teacherId !== teacherId);
      console.log('🗑️ Anciens créneaux supprimés, créneaux restants:', filtered);
      
      const updated = [...filtered, ...newSlots];
      console.log('✨ Nouvel emploi du temps complet:', updated);
      
      return updated;
    });
  };

  const getScheduleByTeacher = (teacherId: string) => {
    const teacherSchedule = schedules.filter(s => s.teacherId === teacherId);
    console.log(`📚 Emploi du temps du professeur ${teacherId}:`, teacherSchedule);
    return teacherSchedule;
  };

  const deleteTeacherSchedule = (teacherId: string) => {
    console.log('🗑️ Suppression de l\'emploi du temps du professeur:', teacherId);
    setSchedules(prev => prev.filter(s => s.teacherId !== teacherId));
  };

  return {
    schedules,
    addScheduleSlots,
    getScheduleByTeacher,
    deleteTeacherSchedule
  };
};
