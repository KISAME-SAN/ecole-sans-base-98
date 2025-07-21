
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@/types/schedule";
import { ScheduleSlot } from "@/hooks/useScheduleData";
import { toast } from "sonner";

interface TeacherScheduleCreatorProps {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
  addScheduleSlots: (teacherId: string, slots: Omit<ScheduleSlot, 'id' | 'teacherId'>[]) => void;
  getScheduleByTeacher: (teacherId: string) => ScheduleSlot[];
}

export default function TeacherScheduleCreator({ 
  teacherId, 
  teacherName, 
  onClose, 
  addScheduleSlots, 
  getScheduleByTeacher 
}: TeacherScheduleCreatorProps) {
  const [scheduleSlots, setScheduleSlots] = useState<Omit<ScheduleSlot, 'id' | 'teacherId'>[]>([]);
  
  const existingSchedule = getScheduleByTeacher(teacherId);
  console.log('🔍 Emploi du temps existant récupéré pour', teacherId, ':', existingSchedule);

  const addScheduleSlot = () => {
    setScheduleSlots([...scheduleSlots, {
      day: '',
      startTime: '',
      endTime: '',
      className: ''
    }]);
  };

  const updateScheduleSlot = (index: number, field: keyof Omit<ScheduleSlot, 'id' | 'teacherId'>, value: string) => {
    const updated = [...scheduleSlots];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleSlots(updated);
  };

  const removeScheduleSlot = (index: number) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validSlots = scheduleSlots.filter(slot => 
      slot.day && slot.startTime && slot.endTime && slot.className
    );

    if (validSlots.length === 0) {
      toast.error("Veuillez ajouter au moins un créneau valide");
      return;
    }

    console.log('💾 Tentative de sauvegarde des créneaux:', validSlots);
    addScheduleSlots(teacherId, validSlots);
    toast.success("Emploi du temps sauvegardé avec succès");
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emploi du temps - {teacherName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {existingSchedule.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Emploi du temps actuel</h4>
            <div className="grid gap-2">
              {existingSchedule.map((slot) => (
                <div key={slot.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge>{slot.day}</Badge>
                  <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                  <span className="text-sm font-medium">{slot.className}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Nouvel emploi du temps</h4>
            <Button onClick={addScheduleSlot} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un créneau
            </Button>
          </div>

          <div className="space-y-4">
            {scheduleSlots.map((slot, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Jour</Label>
                    <Select 
                      value={slot.day} 
                      onValueChange={(value) => updateScheduleSlot(index, 'day', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Heure de début</Label>
                    <Select 
                      value={slot.startTime} 
                      onValueChange={(value) => updateScheduleSlot(index, 'startTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Début" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Heure de fin</Label>
                    <Select 
                      value={slot.endTime} 
                      onValueChange={(value) => updateScheduleSlot(index, 'endTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Classe</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nom de la classe"
                        value={slot.className}
                        onChange={(e) => updateScheduleSlot(index, 'className', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeScheduleSlot(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Sauvegarder l'emploi du temps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
