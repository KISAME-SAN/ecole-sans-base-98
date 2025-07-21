import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, UserPlus, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">École Sans Base</h1>
          <p className="text-xl text-muted-foreground">
            Système de gestion d'établissement scolaire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/inscription">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <UserPlus className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Inscription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Inscrire de nouveaux élèves dans l'établissement
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/students">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Gestion des élèves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Consulter, modifier et supprimer les élèves par classe
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/classes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Gestion des classes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Créer et gérer les classes de l'établissement
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-lg p-6">
            <BookOpen className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Données temporaires</h3>
            <p className="text-muted-foreground">
              Les données sont conservées en mémoire tant que l'application reste ouverte.
              Fermez et rouvrez l'application pour réinitialiser les données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
