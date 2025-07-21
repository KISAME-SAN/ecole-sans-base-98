export type Semester = '1' | '2';

export interface Subject {
  id: string;
  name: string;
  coefficient: number;
  classId: string;
  semester: Semester;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  type: 'devoir' | 'composition';
  number?: number; // pour devoir 1, devoir 2, etc.
  value: number;
  createdAt: string;
}

export interface SubjectFormData {
  name: string;
  coefficient: number;
}

export interface GradeEntry {
  studentId: string;
  studentName: string;
  grades: {
    [key: string]: number | null; // 'devoir_1', 'devoir_2', 'composition', etc.
  };
}