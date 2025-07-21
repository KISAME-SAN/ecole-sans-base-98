
import StudentTable from "@/components/StudentTable";
import { Student, SchoolClass } from "@/types/school";

interface StudentManagementProps {
  students: Student[];
  classes: SchoolClass[];
  onUpdateStudent: (id: string, updatedData: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  getStudentsByClass: (classId: string) => Student[];
}

export default function StudentManagement({ 
  students, 
  classes, 
  onUpdateStudent, 
  onDeleteStudent 
}: StudentManagementProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des étudiants</h1>
      </div>
      
      <StudentTable 
        students={students} 
        classes={classes} 
        onUpdateStudent={onUpdateStudent} 
        onDeleteStudent={onDeleteStudent} 
      />
    </div>
  );
}
