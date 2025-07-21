// Local Storage Management
const Storage = {
    // Keys for different data types
    KEYS: {
        STUDENTS: 'school-students',
        TEACHERS: 'school-teachers',
        CLASSES: 'school-classes',
        GRADES: 'school-grades',
        ATTENDANCE: 'school-attendance',
        SETTINGS: 'school-settings'
    },

    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set data to localStorage
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all data
    clear() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Students management
    getStudents() {
        return this.get(this.KEYS.STUDENTS) || [];
    },

    setStudents(students) {
        return this.set(this.KEYS.STUDENTS, students);
    },

    addStudent(student) {
        const students = this.getStudents();
        student.id = student.id || Utils.generateId();
        student.createdAt = new Date().toISOString();
        students.push(student);
        return this.setStudents(students);
    },

    updateStudent(id, updatedData) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData, updatedAt: new Date().toISOString() };
            return this.setStudents(students);
        }
        return false;
    },

    deleteStudent(id) {
        const students = this.getStudents();
        const filtered = students.filter(s => s.id !== id);
        return this.setStudents(filtered);
    },

    // Teachers management
    getTeachers() {
        return this.get(this.KEYS.TEACHERS) || [];
    },

    setTeachers(teachers) {
        return this.set(this.KEYS.TEACHERS, teachers);
    },

    addTeacher(teacher) {
        const teachers = this.getTeachers();
        teacher.id = teacher.id || Utils.generateId();
        teacher.createdAt = new Date().toISOString();
        teachers.push(teacher);
        return this.setTeachers(teachers);
    },

    updateTeacher(id, updatedData) {
        const teachers = this.getTeachers();
        const index = teachers.findIndex(t => t.id === id);
        if (index !== -1) {
            teachers[index] = { ...teachers[index], ...updatedData, updatedAt: new Date().toISOString() };
            return this.setTeachers(teachers);
        }
        return false;
    },

    deleteTeacher(id) {
        const teachers = this.getTeachers();
        const filtered = teachers.filter(t => t.id !== id);
        return this.setTeachers(filtered);
    },

    // Classes management
    getClasses() {
        return this.get(this.KEYS.CLASSES) || [];
    },

    setClasses(classes) {
        return this.set(this.KEYS.CLASSES, classes);
    },

    addClass(className) {
        const classes = this.getClasses();
        const newClass = {
            id: Utils.generateId(),
            name: className,
            studentCount: 0,
            createdAt: new Date().toISOString()
        };
        classes.push(newClass);
        return this.setClasses(classes) ? newClass.id : null;
    },

    updateClass(id, updatedData) {
        const classes = this.getClasses();
        const index = classes.findIndex(c => c.id === id);
        if (index !== -1) {
            classes[index] = { ...classes[index], ...updatedData, updatedAt: new Date().toISOString() };
            return this.setClasses(classes);
        }
        return false;
    },

    deleteClass(id) {
        const classes = this.getClasses();
        const filtered = classes.filter(c => c.id !== id);
        // Also remove students from this class
        const students = this.getStudents();
        const filteredStudents = students.filter(s => s.classId !== id);
        this.setStudents(filteredStudents);
        return this.setClasses(filtered);
    },

    // Update class student counts
    updateClassStudentCounts() {
        const classes = this.getClasses();
        const students = this.getStudents();
        
        classes.forEach(cls => {
            cls.studentCount = students.filter(s => s.classId === cls.id).length;
        });
        
        return this.setClasses(classes);
    },

    // Settings management
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {
            schoolName: 'École Sans Base',
            schoolLocation: '',
            schoolPhone: '',
            theme: 'system',
            sidebarVisible: true
        };
    },

    setSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    },

    updateSettings(updatedSettings) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...updatedSettings };
        return this.setSettings(newSettings);
    },

    // Data export/import
    exportData() {
        const data = {
            students: this.getStudents(),
            teachers: this.getTeachers(),
            classes: this.getClasses(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return data;
    },

    importData(data) {
        try {
            if (data.students) this.setStudents(data.students);
            if (data.teachers) this.setTeachers(data.teachers);
            if (data.classes) this.setClasses(data.classes);
            if (data.settings) this.setSettings(data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    // Data validation
    validateStudentData(student) {
        const required = ['firstName', 'lastName', 'birthDate', 'birthPlace', 'parentPhone', 'classId', 'gender'];
        return required.every(field => student[field] && student[field].toString().trim());
    },

    validateTeacherData(teacher) {
        const required = ['firstName', 'lastName', 'subject', 'phone', 'email', 'birthDate', 'gender', 'residence'];
        return required.every(field => teacher[field] && teacher[field].toString().trim()) &&
               Utils.isValidEmail(teacher.email);
    },

    validateClassData(className) {
        return className && className.trim().length > 0;
    },

    // Search functionality
    searchStudents(searchTerm, classFilter = 'all') {
        let students = this.getStudents();
        
        if (classFilter !== 'all') {
            students = students.filter(s => s.classId === classFilter);
        }
        
        if (searchTerm) {
            students = Utils.filterBySearch(students, searchTerm, [
                'firstName', 'lastName', 'studentNumber'
            ]);
        }
        
        return students;
    },

    searchTeachers(searchTerm) {
        const teachers = this.getTeachers();
        
        if (searchTerm) {
            return Utils.filterBySearch(teachers, searchTerm, [
                'firstName', 'lastName', 'subject', 'email'
            ]);
        }
        
        return teachers;
    },

    // Statistics
    getStatistics() {
        const students = this.getStudents();
        const teachers = this.getTeachers();
        const classes = this.getClasses();
        
        return {
            studentsCount: students.length,
            teachersCount: teachers.length,
            classesCount: classes.length,
            studentsPerClass: classes.map(cls => ({
                className: cls.name,
                count: students.filter(s => s.classId === cls.id).length
            })),
            genderDistribution: {
                male: students.filter(s => s.gender === 'male').length,
                female: students.filter(s => s.gender === 'female').length
            }
        };
    }
};

// Export for use in other files
window.Storage = Storage;