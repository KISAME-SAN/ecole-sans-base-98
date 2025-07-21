
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Eye, UserCheck, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Teacher } from "@/types/teacher";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useScheduleData } from "@/hooks/useScheduleData";
import { toast } from "sonner";

interface TeacherAttendanceManagerProps {
  teachers: Teacher[];
  onBack: () => void;
}

export default function TeacherAttendanceManager({ teachers, onBack }: TeacherAttendanceManagerProps) {
  const { addOrUpdateAttendance, getAttendanceForSlot } = useAttendanceData();
  const { getScheduleByTeacher } = useScheduleData();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
    return startOfWeek;
  });

  const [showJustificationDialog, setShowJustificationDialog] = useState(false);
  const [viewJustificationDialog, setViewJustificationDialog] = useState(false);
  const [currentJustification, setCurrentJustification] = useState('');
  const [selectedAttendance, setSelectedAttendance] = useState<{
    teacherId: string;
    slotId: string;
    status: 'absent' | 'late' | 'dismissed';
    existingJustification?: string;
  } | null>(null);

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
    setSelectedDate(newWeek.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
    setSelectedDate(newWeek.toISOString().split('T')[0]);
  };

  const handleAttendanceChange = (teacherId: string, slotId: string, status: 'present' | 'absent' | 'late' | 'dismissed') => {
    if (status === 'present') {
      addOrUpdateAttendance(slotId, selectedDate, status, undefined, teacherId);
      toast.success('Présence marquée');
    } else {
      const existingRecord = getAttendanceForSlot(slotId, selectedDate, undefined, teacherId);
      setSelectedAttendance({
        teacherId,
        slotId,
        status,
        existingJustification: existingRecord?.justification || ''
      });
      setCurrentJustification(existingRecord?.justification || '');
      setShowJustificationDialog(true);
    }
  };

  const handleJustificationSubmit = () => {
    if (selectedAttendance) {
      addOrUpdateAttendance(
        selectedAttendance.slotId,
        selectedDate,
        selectedAttendance.status,
        undefined,
        selectedAttendance.teacherId,
        currentJustification
      );
      setShowJustificationDialog(false);
      setSelectedAttendance(null);
      setCurrentJustification('');
      toast.success('Présence mise à jour');
    }
  };

  const viewJustification = (teacherId: string, slotId: string) => {
    const record = getAttendanceForSlot(slotId, selectedDate, undefined, teacherId);
    if (record?.justification) {
      setCurrentJustification(record.justification);
      setViewJustificationDialog(true);
    }
  };

  const getAttendanceStatus = (teacherId: string, slotId: string) => {
    const record = getAttendanceForSlot(slotId, selectedDate, undefined, teacherId);
    return record?.status || 'present';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success text-success-foreground">Présent</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-warning text-warning-foreground">Retard</Badge>;
      case 'dismissed':
        return <Badge className="bg-orange-500 text-white">Parti tôt</Badge>;
      default:
        return <Badge className="bg-success text-success-foreground">Présent</Badge>;
    }
  };

  const getTeacherScheduleForDate = (teacherId: string) => {
    const schedule = getScheduleByTeacher(teacherId);
    console.log(`📅 Emploi du temps récupéré pour le professeur ${teacherId}:`, schedule);
    
    const dayName = new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long' });
    console.log(`📅 Jour sélectionné: ${dayName} (${selectedDate})`);
    
    const dayNameMap: { [key: string]: string } = {
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi'
    };
    
    const mappedDay = dayNameMap[dayName.toLowerCase()];
    console.log(`📅 Jour mappé: ${mappedDay}`);
    
    const filteredSchedule = schedule.filter(slot => slot.day === mappedDay);
    console.log(`📅 Cours filtrés pour ${mappedDay}:`, filteredSchedule);
    
    return filteredSchedule;
  };

  const getStats = () => {
    const stats = { present: 0, absent: 0, late: 0, dismissed: 0 };
    
    teachers.forEach(teacher => {
      const teacherSchedule = getTeacherScheduleForDate(teacher.id);
      teacherSchedule.forEach(slot => {
        const status = getAttendanceStatus(teacher.id, slot.id);
        stats[status as keyof typeof stats]++;
      });
    });
    
    return stats;
  };

  const days = getDaysOfWeek();
  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="hover:bg-secondary">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour au choix du type
        </Button>
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestion des présences des professeurs
          </h2>
          <p className="text-muted-foreground mt-2">
            Suivi quotidien de la présence du corps enseignant
          </p>
        </div>
      </div>

      {/* Navigation de semaine */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="hover:bg-primary hover:text-primary-foreground">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Semaine précédente
            </Button>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{getWeekRange()}</div>
              <div className="text-sm text-muted-foreground">Semaine du {currentWeek.toLocaleDateString('fr-FR')}</div>
            </div>
            <Button variant="outline" size="sm" onClick={goToNextWeek} className="hover:bg-primary hover:text-primary-foreground">
              Semaine suivante
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sélection du jour */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Calendar className="h-5 w-5" />
            Sélectionner un jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {days.map((day) => (
              <Button
                key={day.name}
                variant={selectedDate === day.dateString ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 transition-all duration-200 ${
                  selectedDate === day.dateString 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                    : 'hover:bg-primary/10 hover:border-primary'
                }`}
                onClick={() => setSelectedDate(day.dateString)}
              >
                <div className="font-semibold">{day.name}</div>
                <div className="text-xs opacity-75">
                  {day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card className="border-success/20">
        <CardHeader className="bg-gradient-to-r from-success/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-success">
            <UserCheck className="h-5 w-5" />
            Statistiques de présence - {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">{stats.present}</div>
              <div className="text-sm text-success">Présents</div>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
              <div className="text-sm text-destructive">Absents</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="text-2xl font-bold text-warning">{stats.late}</div>
              <div className="text-sm text-warning">Retards</div>
            </div>
            <div className="text-center p-4 bg-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.dismissed}</div>
              <div className="text-sm text-orange-600">Partis tôt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des professeurs et leurs cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Professeurs et leurs cours - {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {teachers.map((teacher) => {
              const teacherSchedule = getTeacherScheduleForDate(teacher.id);
              
              if (teacherSchedule.length === 0) {
                return (
                  <div key={teacher.id} className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{teacher.firstName} {teacher.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                      </div>
                      <Badge variant="secondary">Aucun cours prévu</Badge>
                    </div>
                  </div>
                );
              }

              return (
                <div key={teacher.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 p-4 border-b">
                    <h3 className="text-lg font-semibold text-primary">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horaire</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Justification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherSchedule.map((slot) => {
                        const status = getAttendanceStatus(teacher.id, slot.id);
                        const record = getAttendanceForSlot(slot.id, selectedDate, undefined, teacher.id);
                        
                        return (
                          <TableRow key={slot.id}>
                            <TableCell className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </TableCell>
                            <TableCell>{slot.className}</TableCell>
                            <TableCell>
                              {getStatusBadge(status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant={status === 'present' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(teacher.id, slot.id, 'present')}
                                  className="hover:bg-success hover:text-success-foreground"
                                >
                                  Présent
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'absent' ? 'destructive' : 'outline'}
                                  onClick={() => handleAttendanceChange(teacher.id, slot.id, 'absent')}
                                >
                                  Absent
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'late' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(teacher.id, slot.id, 'late')}
                                  className={status === 'late' ? 'bg-warning text-warning-foreground' : 'hover:bg-warning hover:text-warning-foreground'}
                                >
                                  Retard
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'dismissed' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(teacher.id, slot.id, 'dismissed')}
                                  className={status === 'dismissed' ? 'bg-orange-500 text-white' : 'hover:bg-orange-500 hover:text-white'}
                                >
                                  Parti tôt
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {record?.justification && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewJustification(teacher.id, slot.id)}
                                  className="hover:bg-primary hover:text-primary-foreground"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier justification */}
      <Dialog open={showJustificationDialog} onOpenChange={setShowJustificationDialog}>
        <DialogContent className="border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary">Justification requise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="justification">
                Justification pour {selectedAttendance?.status === 'absent' ? 'absence' : 
                selectedAttendance?.status === 'late' ? 'retard' : 'départ anticipé'}
              </Label>
              <Textarea
                id="justification"
                value={currentJustification}
                onChange={(e) => setCurrentJustification(e.target.value)}
                placeholder="Saisir la justification..."
                rows={4}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowJustificationDialog(false);
                  setSelectedAttendance(null);
                  setCurrentJustification('');
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleJustificationSubmit} className="bg-primary hover:bg-primary/90">
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour voir justification */}
      <Dialog open={viewJustificationDialog} onOpenChange={setViewJustificationDialog}>
        <DialogContent className="border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary">Justification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-primary/20">
              <p>{currentJustification}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setViewJustificationDialog(false)} className="bg-primary hover:bg-primary/90">
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
