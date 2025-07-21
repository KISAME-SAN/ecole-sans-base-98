
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Calendar, UserCheck } from "lucide-react";
import { Teacher } from "@/types/teacher";
import { TeacherEditDialog } from "@/components/TeacherEditDialog";
import TeacherScheduleCreator from "@/components/TeacherScheduleCreator";
import { useScheduleData } from "@/hooks/useScheduleData";
import { toast } from "sonner";

interface TeacherManagementProps {
  teachers: Teacher[];
  onUpdateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
}

export default function TeacherManagement({ teachers, onUpdateTeacher, onDeleteTeacher }: TeacherManagementProps) {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [schedulingTeacher, setSchedulingTeacher] = useState<Teacher | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Pour forcer la mise à jour
  const { getScheduleByTeacher, addScheduleSlots } = useScheduleData();

  const handleDelete = (teacher: Teacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.firstName} ${teacher.lastName} ?`)) {
      onDeleteTeacher(teacher.id);
      toast.success("Professeur supprimé avec succès");
    }
  };

  const getScheduleCount = (teacherId: string) => {
    return getScheduleByTeacher(teacherId).length;
  };

  const handleScheduleDialogClose = () => {
    console.log('🔄 Fermeture du dialogue d\'emploi du temps');
    setScheduleDialogOpen(false);
    setSchedulingTeacher(null);
    // Forcer une re-render en changeant la clé au lieu de recharger la page
    setRefreshKey(prev => prev + 1);
  };

  const handleScheduleDialogOpen = (teacher: Teacher) => {
    console.log('📅 Ouverture du dialogue d\'emploi du temps pour:', teacher.firstName, teacher.lastName);
    setSchedulingTeacher(teacher);
    setScheduleDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des professeurs</h1>
        <div className="text-sm text-muted-foreground">
          {teachers.length} professeur(s) enregistré(s)
        </div>
      </div>

      {teachers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun professeur enregistré</h3>
            <p className="text-muted-foreground">
              Commencez par inscrire des professeurs pour les gérer ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {teachers.map((teacher) => {
            const scheduleCount = getScheduleCount(teacher.id);
            return (
              <Card key={teacher.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div>
                        <div className="text-xl">{teacher.firstName} {teacher.lastName}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {teacher.subject}
                        </div>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={scheduleCount > 0 ? "default" : "secondary"}>
                        {scheduleCount} créneau(x)
                      </Badge>
                      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleScheduleDialogOpen(teacher)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Emploi du temps
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Gestion de l'emploi du temps</DialogTitle>
                          </DialogHeader>
                          {schedulingTeacher && (
                            <TeacherScheduleCreator
                              teacherId={schedulingTeacher.id}
                              teacherName={`${schedulingTeacher.firstName} ${schedulingTeacher.lastName}`}
                              onClose={handleScheduleDialogClose}
                              addScheduleSlots={addScheduleSlots}
                              getScheduleByTeacher={getScheduleByTeacher}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTeacher(teacher)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(teacher)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <div className="text-muted-foreground">{teacher.email}</div>
                    </div>
                    <div>
                      <span className="font-medium">Téléphone:</span>
                      <div className="text-muted-foreground">{teacher.phone}</div>
                    </div>
                    <div>
                      <span className="font-medium">Date de naissance:</span>
                      <div className="text-muted-foreground">
                        {new Date(teacher.birthDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Résidence:</span>
                      <div className="text-muted-foreground">{teacher.residence}</div>
                    </div>
                    {teacher.address && (
                      <div>
                        <span className="font-medium">Adresse:</span>
                        <div className="text-muted-foreground">{teacher.address}</div>
                      </div>
                    )}
                    {teacher.city && (
                      <div>
                        <span className="font-medium">Ville:</span>
                        <div className="text-muted-foreground">{teacher.city}</div>
                      </div>
                    )}
                    {teacher.qualification && (
                      <div>
                        <span className="font-medium">Qualification:</span>
                        <div className="text-muted-foreground">{teacher.qualification}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editingTeacher && (
        <TeacherEditDialog
          open={true}
          onClose={() => setEditingTeacher(null)}
          teacher={editingTeacher}
          onSave={(updatedTeacher) => {
            onUpdateTeacher(editingTeacher.id, updatedTeacher);
            setEditingTeacher(null);
            toast.success("Professeur modifié avec succès");
          }}
        />
      )}
    </div>
  );
}
