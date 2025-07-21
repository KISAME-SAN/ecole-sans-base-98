import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { Student, StudentFormData, SchoolClass } from "@/types/school";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentTableProps {
  students: Student[];
  classes: SchoolClass[];
  onUpdateStudent: (id: string, updatedData: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentTable({ 
  students, 
  classes, 
  onUpdateStudent, 
  onDeleteStudent 
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    studentNumber: "",
    parentPhone: "",
    classId: "",
    gender: "male"
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentNumber.includes(searchTerm);
    const matchesClass = selectedClass === "all" || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      birthPlace: student.birthPlace,
      studentNumber: student.studentNumber,
      parentPhone: student.parentPhone,
      classId: student.classId,
      gender: student.gender || "male"
    });
  };

  const handleSaveEdit = () => {
    if (editingStudent) {
      onUpdateStudent(editingStudent.id, formData);
      setEditingStudent(null);
      setFormData({
        firstName: "",
        lastName: "",
        birthDate: "",
        birthPlace: "",
        studentNumber: "",
        parentPhone: "",
        classId: "",
        gender: "male"
      });
    }
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : "Classe inconnue";
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher et filtrer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un étudiant (nom, prénom, numéro)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedClass !== "all" 
                ? "Aucun étudiant trouvé pour cette recherche" 
                : "Aucun étudiant inscrit"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>N° étudiant</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Date de naissance</TableHead>
                  <TableHead>Lieu de naissance</TableHead>
                  <TableHead>Téléphone parent</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.studentNumber}</TableCell>
                    <TableCell>{getClassName(student.classId)}</TableCell>
                    <TableCell>{student.birthDate}</TableCell>
                    <TableCell>{student.birthPlace}</TableCell>
                    <TableCell>{student.parentPhone}</TableCell>
                    <TableCell>
                      <Badge variant={student.gender === 'male' ? 'default' : 'secondary'}>
                        {student.gender === 'male' ? 'Garçon' : 'Fille'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'étudiant {student.firstName} {student.lastName} ? 
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteStudent(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'étudiant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
              <Input
                placeholder="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            />
            <Input
              placeholder="Lieu de naissance"
              value={formData.birthPlace}
              onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
            />
            <Input
              placeholder="N° étudiant"
              value={formData.studentNumber}
              onChange={(e) => setFormData({...formData, studentNumber: e.target.value})}
            />
            <Input
              placeholder="Téléphone parent"
              value={formData.parentPhone}
              onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
            />
            <Select value={formData.classId} onValueChange={(value) => setFormData({...formData, classId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value as 'male' | 'female'})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Garçon</SelectItem>
                <SelectItem value="female">Fille</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingStudent(null)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}