
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SchoolSidebar } from "./components/SchoolSidebar";
import { useSchoolData } from "./hooks/useSchoolData";
import { useTeacherData } from "./hooks/useTeacherData";
import { useSettings } from "./hooks/useSettings";
import Registration from "./pages/Registration";
import StudentManagement from "./pages/StudentManagement";
import ClassManagement from "./pages/ClassManagement";
import TeacherRegistration from "./pages/TeacherRegistration";
import TeacherManagement from "./pages/TeacherManagement";
import GradeManagement from "./pages/GradeManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const schoolData = useSchoolData();
  const teacherData = useTeacherData();
  const { settings } = useSettings();
  const [sidebarVisible, setSidebarVisible] = useState(settings.sidebarVisible);

  useEffect(() => {
    setSidebarVisible(settings.sidebarVisible);
  }, [settings.sidebarVisible]);

  const dashboardStats = {
    studentsCount: schoolData.students.length,
    teachersCount: teacherData.teachers.length,
    classesCount: schoolData.classes.length,
  };

  const handleSidebarToggle = (visible: boolean) => {
    setSidebarVisible(visible);
  };

  return (
    <div className="min-h-screen flex w-full">
      {sidebarVisible && <SchoolSidebar onSidebarToggle={handleSidebarToggle} />}
      <main className="flex-1 bg-background">
        <Routes>
          <Route path="/" element={<Dashboard stats={dashboardStats} />} />
          <Route path="/inscription" element={
            <Registration 
              classes={schoolData.classes} 
              onAddStudent={schoolData.addStudent} 
            />
          } />
          <Route path="/students" element={
            <StudentManagement 
              students={schoolData.students}
              classes={schoolData.classes}
              onUpdateStudent={schoolData.updateStudent}
              onDeleteStudent={schoolData.deleteStudent}
              getStudentsByClass={schoolData.getStudentsByClass}
            />
          } />
          <Route path="/teacher-registration" element={
            <TeacherRegistration 
              onAddTeacher={teacherData.addTeacher}
            />
          } />
          <Route path="/teachers" element={
            <TeacherManagement 
              teachers={teacherData.teachers}
              onUpdateTeacher={teacherData.updateTeacher}
              onDeleteTeacher={teacherData.deleteTeacher}
            />
          } />
          <Route path="/classes" element={
            <ClassManagement 
              classes={schoolData.classes}
              teachers={teacherData.teachers}
              onAddClass={schoolData.addClass}
              onDeleteClass={schoolData.deleteClass}
              onUpdateClassName={schoolData.updateClassName}
            />
          } />
          <Route path="/grades" element={
            <GradeManagement 
              classes={schoolData.classes}
              students={schoolData.students}
              getStudentsByClass={schoolData.getStudentsByClass}
            />
          } />
          <Route path="/attendance" element={
            <AttendanceManagement 
              classes={schoolData.classes}
              students={schoolData.students}
              teachers={teacherData.teachers}
              getStudentsByClass={schoolData.getStudentsByClass}
            />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
