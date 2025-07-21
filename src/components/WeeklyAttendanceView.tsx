
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from "lucide-react";
import { SchoolClass, Student } from "@/types/school";
import { useClassScheduleData } from "@/hooks/useClassScheduleData";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { ClassScheduleSlot } from "@/types/schedule";
import CourseAttendanceManager from "./CourseAttendanceManager";

interface WeeklyAttendanceViewProps {
  selectedClass: SchoolClass;
  students: Student[];
  onBack: () => void;
}

export default function WeeklyAttendanceView({ selectedClass, students, onBack }: WeeklyAttendanceViewProps) {
  const { getScheduleByClass } = useClassScheduleData();
  const { getAttendanceForSlot } = useAttendanceData();
  
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
    return startOfWeek;
  });
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ClassScheduleSlot | null>(null);

  const getDaysOfWeek = () => {
    const days = [];
    const daysNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + i);
      days.push({
        name: daysNames[i],
        date: date,
        dateString: date.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const getWeekRange = () => {
    const endOfWeek = new Date(currentWeek);
    endOfWeek.setDate(currentWeek.getDate() + 5);
    return `${currentWeek.toLocaleDateString('fr-FR')} - ${endOfWeek.toLocaleDateString('fr-FR')}`;
  };

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const handleDaySelect = (dayName: string, dateString: string) => {
    setSelectedDay(dateString);
    setSelectedSlot(null);
  };

  const getScheduleForDay = (dayName: string) => {
    return getScheduleByClass(selectedClass.id).filter(slot => slot.day === dayName);
  };

  const getAttendanceStats = (slot: ClassScheduleSlot, dateString: string) => {
    const present = students.filter(student => {
      const attendance = getAttendanceForSlot(slot.id, dateString, student.id);
      return !attendance || attendance.status === 'present';
    }).length;
    
    const absent = students.filter(student => {
      const attendance = getAttendanceForSlot(slot.id, dateString, student.id);
      return attendance && attendance.status === 'absent';
    }).length;

    const late = students.filter(student => {
      const attendance = getAttendanceForSlot(slot.id, dateString, student.id);
      return attendance && attendance.status === 'late';
    }).length;

    const dismissed = students.filter(student => {
      const attendance = getAttendanceForSlot(slot.id, dateString, student.id);
      return attendance && attendance.status === 'dismissed';
    }).length;

    return { present, absent, late, dismissed };
  };

  const days = getDaysOfWeek();
  const selectedDaySchedule = selectedDay ? getScheduleForDay(days.find(d => d.dateString === selectedDay)?.name || '') : [];

  if (selectedSlot && selectedDay) {
    return (
      <CourseAttendanceManager
        slot={selectedSlot}
        students={students}
        selectedDate={selectedDay}
        onBack={() => setSelectedSlot(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Retour aux classes
        </Button>
        <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
      </div>

      {/* Navigation de semaine */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Semaine précédente
            </Button>
            <div className="text-center">
              <div className="text-lg font-semibold">{getWeekRange()}</div>
              <div className="text-sm text-muted-foreground">Semaine du {currentWeek.toLocaleDateString('fr-FR')}</div>
            </div>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              Semaine suivante
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Vue des jours de la semaine */}
      {!selectedDay && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {days.map((day) => {
            const daySchedule = getScheduleForDay(day.name);
            return (
              <Card 
                key={day.name} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDay === day.dateString ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleDaySelect(day.name, day.dateString)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm">
                    <div>{day.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {daySchedule.length} cours
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vue des cours du jour sélectionné */}
      {selectedDay && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedDay(null)}>
              ← Retour à la semaine
            </Button>
            <h3 className="text-xl font-semibold">
              {days.find(d => d.dateString === selectedDay)?.name} - {new Date(selectedDay).toLocaleDateString('fr-FR')}
            </h3>
          </div>

          {selectedDaySchedule.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                Aucun cours prévu pour ce jour
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {selectedDaySchedule.map((slot) => {
                const stats = getAttendanceStats(slot, selectedDay);
                return (
                  <Card 
                    key={slot.id} 
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-semibold">{slot.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div className="flex gap-2 text-sm">
                            <Badge className="badge-present">
                              {stats.present} présents
                            </Badge>
                            {stats.absent > 0 && (
                              <Badge className="badge-absent">
                                {stats.absent} absents
                              </Badge>
                            )}
                            {stats.late > 0 && (
                              <Badge className="badge-late">
                                {stats.late} retards
                              </Badge>
                            )}
                            {stats.dismissed > 0 && (
                              <Badge className="badge-dismissed">
                                {stats.dismissed} renvoyés
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
