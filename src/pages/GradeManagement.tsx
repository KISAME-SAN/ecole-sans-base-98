import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { useGradeData } from "@/hooks/useGradeData";
import { Semester, SubjectFormData } from "@/types/grades";
import { Student, SchoolClass } from "@/types/school";
import { toast } from "sonner";

interface GradeManagementProps {
  classes: SchoolClass[];
  students: Student[];
  getStudentsByClass: (classId: string) => Student[];
}

export default function GradeManagement({ classes, students, getStudentsByClass }: GradeManagementProps) {
  const { 
    subjects, 
    addSubject, 
    deleteSubject, 
    getSubjectsByClassAndSemester, 
    addOrUpdateGrade, 
    getStudentGrade 
  } = useGradeData();

  const [selectedSemester, setSelectedSemester] = useState<Semester | "">("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [subjectForm, setSubjectForm] = useState<SubjectFormData>({ name: "", coefficient: 1 });
  const [devoirColumns, setDevoirColumns] = useState<number[]>([1, 2]);

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester);
    setSelectedClassId("");
    setSelectedSubjectId("");
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjectId("");
  };

  const handleCreateSubject = () => {
    if (!selectedClassId || !selectedSemester || !subjectForm.name) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    addSubject(selectedClassId, selectedSemester, subjectForm);
    setSubjectForm({ name: "", coefficient: 1 });
    setShowSubjectDialog(false);
    toast.success("Matière créée avec succès");
  };

  const handleDeleteSubject = (subjectId: string) => {
    deleteSubject(subjectId);
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId("");
    }
    toast.success("Matière supprimée avec succès");
  };

  const handleGradeChange = (studentId: string, type: 'devoir' | 'composition', value: string, number?: number) => {
    if (!selectedSubjectId) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 20) {
      toast.error("La note doit être comprise entre 0 et 20");
      return;
    }

    addOrUpdateGrade(studentId, selectedSubjectId, type, numValue, number);
  };

  const addDevoirColumn = () => {
    const nextNumber = Math.max(...devoirColumns) + 1;
    setDevoirColumns(prev => [...prev, nextNumber]);
  };

  const removeDevoirColumn = (columnNumber: number) => {
    if (devoirColumns.length <= 1) {
      toast.error("Il doit y avoir au moins une colonne de devoir");
      return;
    }
    setDevoirColumns(prev => prev.filter(num => num !== columnNumber));
  };

  const currentSubjects = selectedClassId && selectedSemester 
    ? getSubjectsByClassAndSemester(selectedClassId, selectedSemester)
    : [];

  const currentStudents = selectedClassId ? getStudentsByClass(selectedClassId) : [];

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des notes</h1>
      </div>

      {/* Sélection du semestre */}
      {!selectedSemester && (
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner le semestre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSemesterSelect("1")}
                className="h-20"
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">Premier semestre</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSemesterSelect("2")}
                className="h-20"
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">Deuxième semestre</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection de la classe */}
      {selectedSemester && !selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Sélectionner la classe - {selectedSemester === "1" ? "Premier" : "Deuxième"} semestre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedSemester("")}
                className="mb-4"
              >
                ← Retour aux semestres
              </Button>
              {classes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune classe disponible. Veuillez créer des classes d'abord.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((cls) => (
                    <Button
                      key={cls.id}
                      variant="outline"
                      size="lg"
                      onClick={() => handleClassSelect(cls.id)}
                      className="h-20 p-4"
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">{cls.name}</div>
                        <div className="text-sm text-muted-foreground">{cls.studentCount} élèves</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gestion des matières et notes */}
      {selectedSemester && selectedClassId && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Matières - {selectedClass?.name} - {selectedSemester === "1" ? "Premier" : "Deuxième"} semestre
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedClassId("")}
                  >
                    ← Retour aux classes
                  </Button>
                  <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une matière
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle matière</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subjectName">Nom de la matière</Label>
                          <Input
                            id="subjectName"
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Mathématiques"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coefficient">Coefficient</Label>
                          <Input
                            id="coefficient"
                            type="number"
                            min="1"
                            max="10"
                            value={subjectForm.coefficient}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, coefficient: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowSubjectDialog(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleCreateSubject}>
                            Créer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentSubjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune matière créée pour cette classe et ce semestre.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentSubjects.map((subject) => (
                    <Card key={subject.id} className={selectedSubjectId === subject.id ? "ring-2 ring-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{subject.name}</h3>
                            <Badge variant="secondary">Coef. {subject.coefficient}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={selectedSubjectId === subject.id ? "default" : "outline"}
                              onClick={() => setSelectedSubjectId(subject.id)}
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSubject(subject.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tableau des notes */}
          {selectedSubjectId && selectedSubject && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Notes - {selectedSubject.name}
                  </CardTitle>
                  <Button onClick={addDevoirColumn}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter Devoir {Math.max(...devoirColumns) + 1}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {currentStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun élève dans cette classe.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élève</TableHead>
                          {devoirColumns.map((num) => (
                            <TableHead key={`devoir_${num}`} className="relative">
                              <div className="flex items-center justify-between">
                                Devoir {num}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeDevoirColumn(num)}
                                  className="h-6 w-6 p-0 ml-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableHead>
                          ))}
                          <TableHead>Composition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            {devoirColumns.map((num) => (
                              <TableCell key={`${student.id}_devoir_${num}`}>
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.5"
                                  className="w-20"
                                  value={getStudentGrade(student.id, selectedSubjectId, 'devoir', num) || ""}
                                  onChange={(e) => handleGradeChange(student.id, 'devoir', e.target.value, num)}
                                  placeholder="Note"
                                />
                              </TableCell>
                            ))}
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                className="w-20"
                                value={getStudentGrade(student.id, selectedSubjectId, 'composition') || ""}
                                onChange={(e) => handleGradeChange(student.id, 'composition', e.target.value)}
                                placeholder="Note"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}