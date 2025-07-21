
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Teacher } from "@/types/teacher";

interface TeacherEditDialogProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher;
  onSave: (updatedTeacher: Partial<Teacher>) => void;
}

export function TeacherEditDialog({ open, onClose, teacher, onSave }: TeacherEditDialogProps) {
  const [formData, setFormData] = useState({
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    subject: teacher.subject,
    phone: teacher.phone,
    email: teacher.email,
    birthDate: teacher.birthDate,
    gender: teacher.gender,
    residence: teacher.residence,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.subject || 
        !formData.phone || !formData.email || !formData.birthDate || !formData.residence) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    onSave(formData);
    toast.success("Professeur modifié avec succès !");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le professeur</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
