
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

interface SettingsProps {
  onSidebarToggle: (visible: boolean) => void;
}

export function Settings({ onSidebarToggle }: SettingsProps) {
  const { settings, updateSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    updateSettings(formData);
    onSidebarToggle(formData.sidebarVisible);
    toast.success("Paramètres sauvegardés avec succès !");
    setOpen(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4" />
          <span>Paramètres</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Paramètres de l'application</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de l'école</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nom de l'école</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  placeholder="Nom de l'école"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schoolLocation">Lieu</Label>
                <Input
                  id="schoolLocation"
                  value={formData.schoolLocation}
                  onChange={(e) => handleInputChange("schoolLocation", e.target.value)}
                  placeholder="Adresse de l'école"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schoolPhone">Numéro de téléphone</Label>
                <Input
                  id="schoolPhone"
                  value={formData.schoolPhone}
                  onChange={(e) => handleInputChange("schoolPhone", e.target.value)}
                  placeholder="Numéro de téléphone"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apparence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select 
                  value={formData.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'system') => handleInputChange("theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le thème" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sidebarVisible">Afficher la barre latérale</Label>
                <Switch
                  id="sidebarVisible"
                  checked={formData.sidebarVisible}
                  onCheckedChange={(checked) => handleInputChange("sidebarVisible", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
