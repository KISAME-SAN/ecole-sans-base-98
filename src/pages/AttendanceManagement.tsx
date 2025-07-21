
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { SchoolClass, Student } from "@/types/school";
import { Teacher } from "@/types/teacher";
import WeeklyAttendanceView from "@/components/WeeklyAttendanceView";
import CourseAttendanceManager from "@/components/CourseAttendanceManager";
import { ClassScheduleSlot } from "@/types/schedule";
import TeacherAttendanceManager from "@/components/TeacherAttendanceManager";

interface AttendanceManagementProps {
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  getStudentsByClass: (classId: string) => Student[];
}

export default function AttendanceManagement({ 
  classes, 
  students, 
  teachers, 
  getStudentsByClass 
}: AttendanceManagementProps) {
  const [attendanceType, setAttendanceType] = useState<'student' | 'teacher' | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<ClassScheduleSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleAttendanceTypeSelect = (type: 'student' | 'teacher') => {
    setAttendanceType(type);
    setSelectedClassId('');
    setSelectedSlot(null);
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleSlotSelect = (slot: ClassScheduleSlot, date: string) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = selectedClassId ? getStudentsByClass(selectedClassId) : [];

  // Vue de gestion détaillée d'un cours
  if (selectedSlot && selectedClass) {
    return (
      <div className="container mx-auto p-6">
        <CourseAttendanceManager
          slot={selectedSlot}
          students={classStudents}
          selectedDate={selectedDate}
          onBack={() => setSelectedSlot(null)}
        />
      </div>
    );
  }

  // Vue hebdomadaire d'une classe
  if (attendanceType === 'student' && selectedClassId && selectedClass) {
    return (
      <div className="container mx-auto p-6">
        <WeeklyAttendanceView
          selectedClass={selectedClass}
          students={classStudents}
          onBack={() => setSelectedClassId('')}
        />
      </div>
    );
  }

  // Vue de gestion des présences des professeurs
  if (attendanceType === 'teacher') {
    return (
      <div className="container mx-auto p-6">
        <TeacherAttendanceManager
          teachers={teachers}
          onBack={() => setAttendanceType('')}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Gestion des présences
        </h1>
      </div>

      {/* Sélection du type de présence */}
      {!attendanceType && (
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-2xl text-center text-primary">
              Sélectionner le type de présence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleAttendanceTypeSelect('student')}
                className="h-40 flex flex-col gap-4 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 hover:scale-105 transition-all duration-300 group"
              >
                <Users className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">Présence des élèves</div>
                  <div className="text-sm text-muted-foreground mt-2">Gérer la présence des élèves par classe et cours</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleAttendanceTypeSelect('teacher')}
                className="h-40 flex flex-col gap-4 border-2 border-accent/20 hover:border-accent hover:bg-accent/5 hover:scale-105 transition-all duration-300 group"
              >
                <UserCheck className="h-16 w-16 text-accent group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">Présence des professeurs</div>
                  <div className="text-sm text-muted-foreground mt-2">Gérer la présence du corps enseignant</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection de la classe pour les élèves */}
      {attendanceType === 'student' && !selectedClassId && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2 text-primary text-xl">
              <Users className="h-6 w-6" />
              Sélectionner une classe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                onClick={() => setAttendanceType('')}
                className="mb-4 hover:bg-primary/10 text-primary"
              >
                ← Retour au choix du type
              </Button>
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune classe disponible</h3>
                  <p className="text-muted-foreground">Veuillez d'abord créer des classes dans la section Gestion des classes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((cls) => (
                    <Button
                      key={cls.id}
                      variant="outline"
                      size="lg"
                      onClick={() => handleClassSelect(cls.id)}
                      className="h-24 p-6 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 hover:scale-105 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary group-hover:scale-110 transition-transform">{cls.name}</div>
                        <div className="text-sm text-muted-foreground mt-2">{cls.studentCount} élèves inscrits</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
