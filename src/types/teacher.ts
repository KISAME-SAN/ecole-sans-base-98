
export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  residence: string;
  address?: string;
  city?: string;
  qualification?: string;
  schedule?: TeacherSchedule[];
}

export interface TeacherSchedule {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  className: string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  residence: string;
}

export interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
}
