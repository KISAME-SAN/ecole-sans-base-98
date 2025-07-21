
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Eye } from "lucide-react";
import { Student } from "@/types/school";
import { ClassScheduleSlot } from "@/types/schedule";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { toast } from "sonner";

interface CourseAttendanceManagerProps {
  slot: ClassScheduleSlot;
  students: Student[];
  selectedDate: string;
  onBack: () => void;
}

export default function CourseAttendanceManager({ slot, students, selectedDate, onBack }: CourseAttendanceManagerProps) {
  const { addOrUpdateAttendance, getAttendanceForSlot } = useAttendanceData();
  const [showJustificationDialog, setShowJustificationDialog] = useState(false);
  const [viewJustificationDialog, setViewJustificationDialog] = useState(false);
  const [currentJustification, setCurrentJustification] = useState('');
  const [selectedAttendance, setSelectedAttendance] = useState<{
    studentId: string;
    status: 'absent' | 'late' | 'dismissed';
    existingJustification?: string;
  } | null>(null);

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'dismissed') => {
    if (status === 'present') {
      addOrUpdateAttendance(slot.id, selectedDate, status, studentId);
      toast.success('Présence marquée');
    } else {
      const existingRecord = getAttendanceForSlot(slot.id, selectedDate, studentId);
      setSelectedAttendance({
        studentId,
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
        slot.id,
        selectedDate,
        selectedAttendance.status,
        selectedAttendance.studentId,
        undefined,
        currentJustification
      );
      setShowJustificationDialog(false);
      setSelectedAttendance(null);
      setCurrentJustification('');
      toast.success('Présence mise à jour');
    }
  };

  const viewJustification = (studentId: string) => {
    const record = getAttendanceForSlot(slot.id, selectedDate, studentId);
    if (record?.justification) {
      setCurrentJustification(record.justification);
      setViewJustificationDialog(true);
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = getAttendanceForSlot(slot.id, selectedDate, studentId);
    return record?.status || 'present';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="badge-present">Présent</Badge>;
      case 'absent':
        return <Badge className="badge-absent">Absent</Badge>;
      case 'late':
        return <Badge className="badge-late">Retard</Badge>;
      case 'dismissed':
        return <Badge className="badge-dismissed">Renvoyé</Badge>;
      default:
        return <Badge className="badge-present">Présent</Badge>;
    }
  };

  const getStats = () => {
    const stats = { present: 0, absent: 0, late: 0, dismissed: 0 };
    students.forEach(student => {
      const status = getAttendanceStatus(student.id);
      stats[status as keyof typeof stats]++;
    });
    return stats;
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Retour aux cours
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{slot.subject}</h2>
          <p className="text-muted-foreground">
            {new Date(selectedDate).toLocaleDateString('fr-FR')} • {slot.startTime} - {slot.endTime}
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Statistiques de présence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Badge className="badge-present">
              {stats.present} Présents
            </Badge>
            <Badge className="badge-absent">
              {stats.absent} Absents
            </Badge>
            <Badge className="badge-late">
              {stats.late} Retards
            </Badge>
            <Badge className="badge-dismissed">
              {stats.dismissed} Renvoyés
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Liste des étudiants */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Justification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const status = getAttendanceStatus(student.id);
                const record = getAttendanceForSlot(slot.id, selectedDate, student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === 'present' ? 'default' : 'outline'}
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                        >
                          Présent
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'late' ? 'default' : 'outline'}
                          onClick={() => handleAttendanceChange(student.id, 'late')}
                        >
                          Retard
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'dismissed' ? 'default' : 'outline'}
                          onClick={() => handleAttendanceChange(student.id, 'dismissed')}
                        >
                          Renvoyé
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record?.justification && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewJustification(student.id)}
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
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier justification */}
      <Dialog open={showJustificationDialog} onOpenChange={setShowJustificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justification requise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="justification">
                Justification pour {selectedAttendance?.status === 'absent' ? 'absence' : 
                selectedAttendance?.status === 'late' ? 'retard' : 'renvoi'}
              </Label>
              <Textarea
                id="justification"
                value={currentJustification}
                onChange={(e) => setCurrentJustification(e.target.value)}
                placeholder="Saisir la justification..."
                rows={4}
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
              <Button onClick={handleJustificationSubmit}>
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour voir justification */}
      <Dialog open={viewJustificationDialog} onOpenChange={setViewJustificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p>{currentJustification}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setViewJustificationDialog(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
