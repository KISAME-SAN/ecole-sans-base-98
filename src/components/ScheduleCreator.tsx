import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2 } from "lucide-react";
import { DAYS_OF_WEEK, TIME_SLOTS, ClassScheduleSlot } from "@/types/schedule";
import { Teacher } from "@/types/teacher";
import { toast } from "sonner";

interface ScheduleCreatorProps {
  classId: string;
  className: string;
  teachers: Teacher[];
  existingSchedule: ClassScheduleSlot[];
  onSaveSchedule: (classId: string, slots: Omit<ClassScheduleSlot, 'id' | 'classId'>[]) => void;
  onClose: () => void;
}

interface ScheduleSlotForm {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
}

export function ScheduleCreator({ 
  classId, 
  className, 
  teachers, 
  existingSchedule, 
  onSaveSchedule, 
  onClose 
}: ScheduleCreatorProps) {
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotForm[]>(() => {
    return existingSchedule.map(slot => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject,
      teacherId: slot.teacherId
    }));
  });
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSlot, setNewSlot] = useState<ScheduleSlotForm>({
    day: '',
    startTime: '',
    endTime: '',
    subject: '',
    teacherId: ''
  });

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime || !newSlot.subject || !newSlot.teacherId) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    // Vérifier les conflits
    const hasConflict = scheduleSlots.some(slot => 
      slot.day === newSlot.day &&
      ((newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
       (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
       (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime))
    );

    if (hasConflict) {
      toast.error("Conflit horaire détecté pour ce jour");
      return;
    }

    setScheduleSlots(prev => [...prev, newSlot]);
    setNewSlot({
      day: '',
      startTime: '',
      endTime: '',
      subject: '',
      teacherId: ''
    });
    setShowAddDialog(false);
    toast.success("Créneau ajouté");
  };

  const handleRemoveSlot = (index: number) => {
    setScheduleSlots(prev => prev.filter((_, i) => i !== index));
    toast.success("Créneau supprimé");
  };

  const handleSave = () => {
    if (scheduleSlots.length === 0) {
      toast.error("Veuillez ajouter au moins un créneau");
      return;
    }
    
    onSaveSchedule(classId, scheduleSlots);
    toast.success("Emploi du temps sauvegardé");
    onClose();
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Inconnu';
  };

  // Organiser les créneaux par jour
  const scheduleByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = scheduleSlots
      .filter(slot => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, ScheduleSlotForm[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Emploi du temps - {className}</h2>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un créneau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un créneau</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Jour</Label>
                  <Select value={newSlot.day} onValueChange={(value) => setNewSlot(prev => ({ ...prev, day: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heure de début</Label>
                    <Select value={newSlot.startTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, startTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Début" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Heure de fin</Label>
                    <Select value={newSlot.endTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, endTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Matière</Label>
                  <Input
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Mathématiques"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Professeur</Label>
                  <Select value={newSlot.teacherId} onValueChange={(value) => setNewSlot(prev => ({ ...prev, teacherId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un professeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddSlot}>
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emploi du temps hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map(day => (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {scheduleByDay[day].length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucun cours</p>
                  ) : (
                    <div className="space-y-2">
                      {scheduleByDay[day].map((slot, index) => {
                        const globalIndex = scheduleSlots.findIndex(s => 
                          s.day === slot.day && 
                          s.startTime === slot.startTime && 
                          s.subject === slot.subject
                        );
                        return (
                          <div key={index} className="border rounded p-2 text-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                                <div className="text-muted-foreground">{slot.subject}</div>
                                <div className="text-xs text-muted-foreground">
                                  {getTeacherName(slot.teacherId)}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveSlot(globalIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}