import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StudentFormData, SchoolClass } from "@/types/school";
import { generateStudentReceipt } from "@/utils/receiptGenerator";

interface RegistrationProps {
  classes: Array<{ id: string; name: string }>;
  onAddStudent: (studentData: StudentFormData) => void;
}

export default function Registration({ classes, onAddStudent }: RegistrationProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    studentNumber: "",
    parentPhone: "",
    classId: "",
    gender: "male",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.birthPlace || !formData.parentPhone || !formData.classId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Ajouter l'étudiant
    onAddStudent(formData);
    
    // Convertir les classes vers le format SchoolClass pour le générateur de reçu
    const schoolClasses: SchoolClass[] = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      studentCount: 0 // Valeur par défaut pour le reçu
    }));
    
    // Générer le reçu PDF
    generateStudentReceipt(formData, schoolClasses);
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      birthDate: "",
      birthPlace: "",
      studentNumber: "",
      parentPhone: "",
      classId: "",
      gender: "male",
    });
    
    toast.success("Élève inscrit avec succès ! Reçu généré.");
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Inscription d'un élève
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Prénom de l'élève"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Nom de l'élève"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Lieu de naissance *</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                  placeholder="Lieu de naissance"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Numéro d'élève</Label>
                <Input
                  id="studentNumber"
                  value={formData.studentNumber}
                  onChange={(e) => handleInputChange("studentNumber", e.target.value)}
                  placeholder="Numéro d'élève (facultatif)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Numéro parent *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="Numéro de téléphone du parent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Genre *</Label>
                <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Classe *</Label>
                <Select value={formData.classId} onValueChange={(value) => handleInputChange("classId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((schoolClass) => (
                      <SelectItem key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Inscrire l'élève
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
