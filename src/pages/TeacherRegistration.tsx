
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TeacherFormData } from "@/types/teacher";

interface TeacherRegistrationProps {
  onAddTeacher: (teacherData: TeacherFormData) => void;
}

export default function TeacherRegistration({ onAddTeacher }: TeacherRegistrationProps) {
  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: "",
    lastName: "",
    subject: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "male",
    residence: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.subject || 
        !formData.phone || !formData.email || !formData.birthDate || !formData.residence) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    onAddTeacher(formData);
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      subject: "",
      phone: "",
      email: "",
      birthDate: "",
      gender: "male",
      residence: "",
    });
    
    toast.success("Professeur inscrit avec succès !");
  };

  const handleInputChange = (field: keyof TeacherFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Inscription d'un professeur
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
                  placeholder="Prénom du professeur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Nom du professeur"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Matière enseignée *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Ex: Mathématiques, Français..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="adresse@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
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
                <Label htmlFor="residence">Résidence *</Label>
                <Input
                  id="residence"
                  value={formData.residence}
                  onChange={(e) => handleInputChange("residence", e.target.value)}
                  placeholder="Adresse de résidence"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Inscrire le professeur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
