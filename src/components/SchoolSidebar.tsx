
import { UserPlus, Users, GraduationCap, BarChart3, UserCheck, UsersRound, BookOpen, ClipboardCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Settings } from "./Settings";
import { useSettings } from "@/hooks/useSettings";

const navigationItems = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Inscription élève",
    url: "/inscription",
    icon: UserPlus,
  },
  {
    title: "Gestion des élèves",
    url: "/students",
    icon: Users,
  },
  {
    title: "Inscription professeur",
    url: "/teacher-registration",
    icon: UserCheck,
  },
  {
    title: "Gestion des professeurs",
    url: "/teachers",
    icon: UsersRound,
  },
  {
    title: "Gestion des classes",
    url: "/classes",
    icon: GraduationCap,
  },
  {
    title: "Gestion des notes",
    url: "/grades",
    icon: BookOpen,
  },
  {
    title: "Gestion des présences",
    url: "/attendance",
    icon: ClipboardCheck,
  },
];

interface SchoolSidebarProps {
  onSidebarToggle: (visible: boolean) => void;
}

export function SchoolSidebar({ onSidebarToggle }: SchoolSidebarProps) {
  const { settings } = useSettings();

  return (
    <Sidebar className="w-64 border-r">
      <SidebarContent>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            {settings.schoolName}
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Gestion d'établissement
          </p>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto p-4 border-t">
          <Settings onSidebarToggle={onSidebarToggle} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
