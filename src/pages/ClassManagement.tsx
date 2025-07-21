import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Plus, Trash2, Pencil, Calendar } from "lucide-react";
import { toast } from "sonner";
import { SchoolClass } from "@/types/school";
import { Teacher } from "@/types/teacher";
import { ClassScheduleSlot } from "@/types/schedule";
import { useClassScheduleData } from "@/hooks/useClassScheduleData";
import { ScheduleCreator } from "@/components/ScheduleCreator";

interface ClassManagementProps {
  classes: SchoolClass[];
  teachers: Teacher[];
  onAddClass: (className: string) => void;
  onDeleteClass: (classId: string) => void;
  onUpdateClassName: (classId: string, newName: string) => void;
}

export default function ClassManagement({ classes, teachers, onAddClass, onDeleteClass, onUpdateClassName }: ClassManagementProps) {
  const { addClassScheduleSlots, getScheduleByClass } = useClassScheduleData();
  const [newClassName, setNewClassName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [showScheduleCreator, setShowScheduleCreator] = useState(false);
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState<SchoolClass | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClassName.trim()) {
      toast.error("Veuillez saisir un nom de classe");
      return;
    }

    if (classes.some(c => c.name.toLowerCase() === newClassName.toLowerCase())) {
      toast.error("Cette classe existe déjà");
      return;
    }

    onAddClass(newClassName.trim());
    setNewClassName("");
    setIsDialogOpen(false);
    toast.success("Classe créée avec succès !");
  };

  const handleDelete = (classId: string, className: string, studentCount: number) => {
    if (studentCount > 0) {
      toast.error(`Impossible de supprimer la classe ${className} car elle contient ${studentCount} élève(s)`);
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer la classe ${className} ?`)) {
      onDeleteClass(classId);
      toast.success("Classe supprimée avec succès");
    }
  };

  const handleEdit = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setEditClassName(schoolClass.name);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    if (!editClassName.trim()) {
      toast.error("Veuillez saisir un nom de classe");
      return;
    }

    if (classes.some(c => c.id !== editingClass.id && c.name.toLowerCase() === editClassName.toLowerCase())) {
      toast.error("Cette classe existe déjà");
      return;
    }

    onUpdateClassName(editingClass.id, editClassName.trim());
    setEditingClass(null);
    toast.success("Classe modifiée avec succès");
  };

  const handleCreateSchedule = (schoolClass: SchoolClass) => {
    setSelectedClassForSchedule(schoolClass);
    setShowScheduleCreator(true);
  };

  const handleSaveSchedule = (classId: string, slots: Omit<ClassScheduleSlot, 'id' | 'classId'>[]) => {
    addClassScheduleSlots(classId, slots);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Gestion des classes
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Créer une classe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle classe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Nom de la classe *</Label>
                    <Input
                      id="className"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Ex: 6ème A, CP1, etc."
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Créer la classe
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Aucune classe créée
              </p>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première classe
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une classe
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de la classe</TableHead>
                    <TableHead>Nombre d'élèves</TableHead>
                    <TableHead>Emploi du temps</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((schoolClass) => (
                    <TableRow key={schoolClass.id}>
                      <TableCell className="font-medium">
                        {schoolClass.name}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          schoolClass.studentCount > 0 
                            ? "bg-success/10 text-success" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {schoolClass.studentCount} élève{schoolClass.studentCount !== 1 ? 's' : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateSchedule(schoolClass)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Gérer l'emploi du temps
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(schoolClass)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier la classe</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editClassName">Nom de la classe *</Label>
                                  <Input
                                    id="editClassName"
                                    value={editClassName}
                                    onChange={(e) => setEditClassName(e.target.value)}
                                    placeholder="Ex: 6ème A, CP1, etc."
                                    autoFocus
                                  />
                                </div>
                                <Button type="submit" className="w-full">
                                  Modifier la classe
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(schoolClass.id, schoolClass.name, schoolClass.studentCount)}
                            disabled={schoolClass.studentCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour la création d'emploi du temps */}
      {showScheduleCreator && selectedClassForSchedule && (
        <Dialog open={showScheduleCreator} onOpenChange={setShowScheduleCreator}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <ScheduleCreator
              classId={selectedClassForSchedule.id}
              className={selectedClassForSchedule.name}
              teachers={teachers}
              existingSchedule={getScheduleByClass(selectedClassForSchedule.id)}
              onSaveSchedule={handleSaveSchedule}
              onClose={() => {
                setShowScheduleCreator(false);
                setSelectedClassForSchedule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}