import { useState } from 'react';
import { Subject, Grade, Semester, SubjectFormData } from '@/types/grades';

export const useGradeData = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const addSubject = (classId: string, semester: Semester, subjectData: SubjectFormData) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      classId,
      semester,
      ...subjectData
    };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject.id;
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setGrades(prev => prev.filter(g => g.subjectId !== subjectId));
  };

  const getSubjectsByClassAndSemester = (classId: string, semester: Semester) => {
    return subjects.filter(s => s.classId === classId && s.semester === semester);
  };

  const addOrUpdateGrade = (studentId: string, subjectId: string, type: 'devoir' | 'composition', value: number, number?: number) => {
    const existingGradeIndex = grades.findIndex(g => 
      g.studentId === studentId && 
      g.subjectId === subjectId && 
      g.type === type && 
      g.number === number
    );

    if (existingGradeIndex >= 0) {
      setGrades(prev => prev.map((g, index) => 
        index === existingGradeIndex ? { ...g, value } : g
      ));
    } else {
      const newGrade: Grade = {
        id: Date.now().toString(),
        studentId,
        subjectId,
        type,
        number,
        value,
        createdAt: new Date().toISOString()
      };
      setGrades(prev => [...prev, newGrade]);
    }
  };

  const getGradesBySubject = (subjectId: string) => {
    return grades.filter(g => g.subjectId === subjectId);
  };

  const getStudentGrade = (studentId: string, subjectId: string, type: 'devoir' | 'composition', number?: number) => {
    const grade = grades.find(g => 
      g.studentId === studentId && 
      g.subjectId === subjectId && 
      g.type === type && 
      g.number === number
    );
    return grade?.value || null;
  };

  return {
    subjects,
    grades,
    addSubject,
    deleteSubject,
    getSubjectsByClassAndSemester,
    addOrUpdateGrade,
    getGradesBySubject,
    getStudentGrade
  };
};