// Page Management and Specific Page Logic
const Pages = {
    currentPage: 'dashboard',
    
    // Initialize all pages
    init() {
        this.initNavigation();
        this.initDashboard();
        this.initStudentRegistration();
        this.initStudentManagement();
        this.initTeacherRegistration();
        this.initTeacherManagement();
        this.initClassManagement();
        this.updateStats();
    },

    // Navigation handling
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
            this.showPage(page, false);
        });
    },

    // Show specific page
    showPage(pageId, updateHistory = true) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;

            // Update navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');

            // Update browser history
            if (updateHistory) {
                history.pushState({ page: pageId }, '', `#${pageId}`);
            }

            // Page-specific initialization
            this.onPageShow(pageId);
        }
    },

    // Handle page-specific logic when shown
    onPageShow(pageId) {
        switch (pageId) {
            case 'dashboard':
                this.updateStats();
                break;
            case 'students':
                this.refreshStudentsList();
                break;
            case 'teachers':
                this.refreshTeachersList();
                break;
            case 'classes':
                this.refreshClassesList();
                break;
        }
    },

    // Dashboard initialization
    initDashboard() {
        this.updateStats();
    },

    // Update dashboard statistics
    updateStats() {
        const stats = Storage.getStatistics();
        
        document.getElementById('students-count').textContent = stats.studentsCount;
        document.getElementById('teachers-count').textContent = stats.teachersCount;
        document.getElementById('classes-count').textContent = stats.classesCount;
    },

    // Student Registration
    initStudentRegistration() {
        const form = document.getElementById('student-form');
        const classSelect = document.getElementById('student-class');

        // Populate class options
        this.updateClassOptions();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const validation = UI.validateForm(form);
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    UI.showToast(error, 'error');
                });
                return;
            }

            const formData = UI.getFormData(form);
            
            // Additional validation
            if (!Storage.validateStudentData(formData)) {
                UI.showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            UI.setLoading(form.querySelector('button[type="submit"]'), true);

            try {
                // Add student
                const success = Storage.addStudent(formData);
                
                if (success) {
                    // Update class student counts
                    Storage.updateClassStudentCounts();
                    
                    // Generate receipt
                    this.generateStudentReceipt(formData);
                    
                    // Reset form
                    UI.resetForm(form);
                    
                    // Update stats
                    this.updateStats();
                    
                    UI.showToast('Élève inscrit avec succès ! Reçu généré.', 'success');
                } else {
                    UI.showToast('Erreur lors de l\'inscription', 'error');
                }
            } catch (error) {
                console.error('Error adding student:', error);
                UI.showToast('Erreur lors de l\'inscription', 'error');
            } finally {
                UI.setLoading(form.querySelector('button[type="submit"]'), false);
            }
        });
    },

    // Generate student receipt
    generateStudentReceipt(studentData) {
        const classes = Storage.getClasses();
        const className = classes.find(c => c.id === studentData.classId)?.name || 'Classe inconnue';
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR');
        const timeStr = now.toLocaleTimeString('fr-FR');

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reçu d'inscription</title>
                <style>
                    body { font-family: Arial, sans-serif; width: 300px; margin: 0; padding: 15px; font-size: 12px; line-height: 1.4; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                    .subtitle { font-size: 10px; color: #666; }
                    .content { margin-bottom: 15px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .label { font-weight: bold; }
                    .footer { border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 10px; color: #666; }
                    .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">ÉCOLE</div>
                    <div class="subtitle">Reçu d'inscription</div>
                </div>
                <div class="content">
                    <div class="row"><span class="label">Élève:</span><span>${studentData.firstName} ${studentData.lastName}</span></div>
                    <div class="row"><span class="label">Classe:</span><span>${className}</span></div>
                    <div class="row"><span class="label">Genre:</span><span>${studentData.gender === 'male' ? 'Garçon' : 'Fille'}</span></div>
                    <div class="row"><span class="label">Date de naissance:</span><span>${studentData.birthDate}</span></div>
                    <div class="row"><span class="label">Lieu de naissance:</span><span>${studentData.birthPlace}</span></div>
                    <div class="row"><span class="label">Téléphone parent:</span><span>${studentData.parentPhone}</span></div>
                </div>
                <div class="total">INSCRIPTION CONFIRMÉE</div>
                <div class="footer">
                    <div>Date: ${dateStr}</div>
                    <div>Heure: ${timeStr}</div>
                    <div>Merci de votre confiance</div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(receiptHTML);
            printWindow.document.close();
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            };
        }
    },

    // Student Management
    initStudentManagement() {
        const searchInput = document.getElementById('students-search');
        const classFilter = document.getElementById('students-class-filter');

        // Update class filter options
        this.updateClassFilterOptions();

        // Setup search
        UI.createDebouncedSearch(searchInput, (searchTerm) => {
            this.refreshStudentsList(searchTerm, classFilter.value);
        });

        // Setup class filter
        classFilter.addEventListener('change', () => {
            this.refreshStudentsList(searchInput.value, classFilter.value);
        });

        // Initial load
        this.refreshStudentsList();
    },

    // Refresh students list
    refreshStudentsList(searchTerm = '', classFilter = 'all') {
        const students = Storage.searchStudents(searchTerm, classFilter);
        const classes = Storage.getClasses();
        const tbody = document.querySelector('#students-table tbody');
        const noStudents = document.getElementById('no-students');
        const countDisplay = document.getElementById('students-count-display');

        countDisplay.textContent = students.length;

        if (students.length === 0) {
            tbody.innerHTML = '';
            noStudents.style.display = 'block';
            return;
        }

        noStudents.style.display = 'none';

        tbody.innerHTML = students.map(student => {
            const className = classes.find(c => c.id === student.classId)?.name || 'Classe inconnue';
            return `
                <tr>
                    <td class="font-medium">${Utils.formatName(student.firstName, student.lastName)}</td>
                    <td>${UI.formatStudentNumber(student.studentNumber)}</td>
                    <td>${className}</td>
                    <td>${Utils.formatDate(student.birthDate)}</td>
                    <td>${student.birthPlace}</td>
                    <td>${student.parentPhone}</td>
                    <td>${UI.createBadge(UI.formatGender(student.gender), student.gender === 'male' ? 'default' : 'secondary')}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="Pages.editStudent('${student.id}')" title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-destructive" onclick="Pages.deleteStudent('${student.id}')" title="Supprimer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Edit student
    async editStudent(id) {
        const student = Storage.getStudents().find(s => s.id === id);
        if (!student) return;

        const classes = Storage.getClasses();
        const classOptions = classes.map(c => 
            `<option value="${c.id}" ${c.id === student.classId ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        const content = `
            <form id="edit-student-form" class="space-y-4">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Prénom *</label>
                        <input type="text" name="firstName" class="form-input" value="${student.firstName}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nom *</label>
                        <input type="text" name="lastName" class="form-input" value="${student.lastName}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Date de naissance *</label>
                    <input type="date" name="birthDate" class="form-input" value="${student.birthDate}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Lieu de naissance *</label>
                    <input type="text" name="birthPlace" class="form-input" value="${student.birthPlace}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Numéro d'élève</label>
                    <input type="text" name="studentNumber" class="form-input" value="${student.studentNumber || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Téléphone parent *</label>
                    <input type="tel" name="parentPhone" class="form-input" value="${student.parentPhone}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Classe *</label>
                    <select name="classId" class="form-select" required>
                        ${classOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Genre *</label>
                    <select name="gender" class="form-select" required>
                        <option value="male" ${student.gender === 'male' ? 'selected' : ''}>Homme</option>
                        <option value="female" ${student.gender === 'female' ? 'selected' : ''}>Femme</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('modal-overlay').classList.remove('active')">Annuler</button>
                    <button type="submit" class="btn btn-primary">Sauvegarder</button>
                </div>
            </form>
        `;

        const modal = UI.showModal('Modifier l\'étudiant', content);

        document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = UI.getFormData(e.target);
            const validation = UI.validateForm(e.target);
            
            if (!validation.isValid) {
                validation.errors.forEach(error => UI.showToast(error, 'error'));
                return;
            }

            const success = Storage.updateStudent(id, formData);
            if (success) {
                Storage.updateClassStudentCounts();
                this.refreshStudentsList();
                this.updateStats();
                modal.close();
                UI.showToast('Étudiant modifié avec succès', 'success');
            } else {
                UI.showToast('Erreur lors de la modification', 'error');
            }
        });
    },

    // Delete student
    async deleteStudent(id) {
        const student = Storage.getStudents().find(s => s.id === id);
        if (!student) return;

        const confirmed = await UI.showConfirm(
            `Êtes-vous sûr de vouloir supprimer l'étudiant ${student.firstName} ${student.lastName} ? Cette action est irréversible.`,
            'Confirmer la suppression',
            { destructive: true, confirmText: 'Supprimer' }
        );

        if (confirmed) {
            const success = Storage.deleteStudent(id);
            if (success) {
                Storage.updateClassStudentCounts();
                this.refreshStudentsList();
                this.updateStats();
                UI.showToast('Étudiant supprimé avec succès', 'success');
            } else {
                UI.showToast('Erreur lors de la suppression', 'error');
            }
        }
    },

    // Teacher Registration
    initTeacherRegistration() {
        const form = document.getElementById('teacher-form');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const validation = UI.validateForm(form);
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    UI.showToast(error, 'error');
                });
                return;
            }

            const formData = UI.getFormData(form);
            
            if (!Storage.validateTeacherData(formData)) {
                UI.showToast('Veuillez remplir tous les champs obligatoires avec des données valides', 'error');
                return;
            }

            UI.setLoading(form.querySelector('button[type="submit"]'), true);

            try {
                const success = Storage.addTeacher(formData);
                
                if (success) {
                    UI.resetForm(form);
                    this.updateStats();
                    UI.showToast('Professeur inscrit avec succès !', 'success');
                } else {
                    UI.showToast('Erreur lors de l\'inscription', 'error');
                }
            } catch (error) {
                console.error('Error adding teacher:', error);
                UI.showToast('Erreur lors de l\'inscription', 'error');
            } finally {
                UI.setLoading(form.querySelector('button[type="submit"]'), false);
            }
        });
    },

    // Teacher Management
    initTeacherManagement() {
        this.refreshTeachersList();
    },

    // Refresh teachers list
    refreshTeachersList() {
        const teachers = Storage.getTeachers();
        const container = document.getElementById('teachers-container');
        const noTeachers = document.getElementById('no-teachers');
        const countDisplay = document.getElementById('teachers-count-display');

        countDisplay.textContent = teachers.length;

        if (teachers.length === 0) {
            container.innerHTML = '';
            noTeachers.style.display = 'block';
            return;
        }

        noTeachers.style.display = 'none';

        container.innerHTML = teachers.map(teacher => `
            <div class="teacher-card">
                <div class="teacher-header">
                    <div class="teacher-info">
                        <div class="teacher-details">
                            <h3>${Utils.formatName(teacher.firstName, teacher.lastName)}</h3>
                            <div class="teacher-subject">${teacher.subject}</div>
                        </div>
                        <div class="teacher-actions">
                            ${UI.createBadge('0 créneau(x)', 'secondary')}
                            <button class="btn btn-sm btn-outline" onclick="Pages.editTeacher('${teacher.id}')" title="Modifier">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-destructive" onclick="Pages.deleteTeacher('${teacher.id}')" title="Supprimer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2,2h4a2,2,0,0,1,2,2V6"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="teacher-content">
                    <div class="teacher-grid">
                        <div class="teacher-field">
                            <div class="teacher-label">Email:</div>
                            <div class="teacher-value">${teacher.email}</div>
                        </div>
                        <div class="teacher-field">
                            <div class="teacher-label">Téléphone:</div>
                            <div class="teacher-value">${teacher.phone}</div>
                        </div>
                        <div class="teacher-field">
                            <div class="teacher-label">Date de naissance:</div>
                            <div class="teacher-value">${Utils.formatDate(teacher.birthDate)}</div>
                        </div>
                        <div class="teacher-field">
                            <div class="teacher-label">Résidence:</div>
                            <div class="teacher-value">${teacher.residence}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Edit teacher
    async editTeacher(id) {
        const teacher = Storage.getTeachers().find(t => t.id === id);
        if (!teacher) return;

        const content = `
            <form id="edit-teacher-form" class="space-y-4">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Prénom *</label>
                        <input type="text" name="firstName" class="form-input" value="${teacher.firstName}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nom *</label>
                        <input type="text" name="lastName" class="form-input" value="${teacher.lastName}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Matière enseignée *</label>
                        <input type="text" name="subject" class="form-input" value="${teacher.subject}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Téléphone *</label>
                        <input type="tel" name="phone" class="form-input" value="${teacher.phone}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Email *</label>
                        <input type="email" name="email" class="form-input" value="${teacher.email}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date de naissance *</label>
                        <input type="date" name="birthDate" class="form-input" value="${teacher.birthDate}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Genre *</label>
                        <select name="gender" class="form-select" required>
                            <option value="male" ${teacher.gender === 'male' ? 'selected' : ''}>Homme</option>
                            <option value="female" ${teacher.gender === 'female' ? 'selected' : ''}>Femme</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Résidence *</label>
                        <input type="text" name="residence" class="form-input" value="${teacher.residence}" required>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('modal-overlay').classList.remove('active')">Annuler</button>
                    <button type="submit" class="btn btn-primary">Sauvegarder</button>
                </div>
            </form>
        `;

        const modal = UI.showModal('Modifier le professeur', content);

        document.getElementById('edit-teacher-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = UI.getFormData(e.target);
            const validation = UI.validateForm(e.target);
            
            if (!validation.isValid) {
                validation.errors.forEach(error => UI.showToast(error, 'error'));
                return;
            }

            const success = Storage.updateTeacher(id, formData);
            if (success) {
                this.refreshTeachersList();
                this.updateStats();
                modal.close();
                UI.showToast('Professeur modifié avec succès', 'success');
            } else {
                UI.showToast('Erreur lors de la modification', 'error');
            }
        });
    },

    // Delete teacher
    async deleteTeacher(id) {
        const teacher = Storage.getTeachers().find(t => t.id === id);
        if (!teacher) return;

        const confirmed = await UI.showConfirm(
            `Êtes-vous sûr de vouloir supprimer ${teacher.firstName} ${teacher.lastName} ?`,
            'Confirmer la suppression',
            { destructive: true, confirmText: 'Supprimer' }
        );

        if (confirmed) {
            const success = Storage.deleteTeacher(id);
            if (success) {
                this.refreshTeachersList();
                this.updateStats();
                UI.showToast('Professeur supprimé avec succès', 'success');
            } else {
                UI.showToast('Erreur lors de la suppression', 'error');
            }
        }
    },

    // Class Management
    initClassManagement() {
        const addButton = document.getElementById('add-class-btn');
        
        addButton.addEventListener('click', () => {
            this.showAddClassModal();
        });

        this.refreshClassesList();
    },

    // Show add class modal
    showAddClassModal() {
        const content = `
            <form id="add-class-form" class="space-y-4">
                <div class="form-group">
                    <label class="form-label">Nom de la classe *</label>
                    <input type="text" name="className" class="form-input" placeholder="Ex: 6ème A, CP1, etc." required autofocus>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('modal-overlay').classList.remove('active')">Annuler</button>
                    <button type="submit" class="btn btn-primary">Créer la classe</button>
                </div>
            </form>
        `;

        const modal = UI.showModal('Créer une nouvelle classe', content);

        document.getElementById('add-class-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = UI.getFormData(e.target);
            const className = formData.className.trim();
            
            if (!className) {
                UI.showToast('Veuillez saisir un nom de classe', 'error');
                return;
            }

            // Check if class already exists
            const existingClasses = Storage.getClasses();
            if (existingClasses.some(c => c.name.toLowerCase() === className.toLowerCase())) {
                UI.showToast('Cette classe existe déjà', 'error');
                return;
            }

            const classId = Storage.addClass(className);
            if (classId) {
                this.refreshClassesList();
                this.updateClassOptions();
                this.updateStats();
                modal.close();
                UI.showToast('Classe créée avec succès !', 'success');
            } else {
                UI.showToast('Erreur lors de la création', 'error');
            }
        });
    },

    // Refresh classes list
    refreshClassesList() {
        const classes = Storage.getClasses();
        const tbody = document.querySelector('#classes-table tbody');
        const noClasses = document.getElementById('no-classes');

        if (classes.length === 0) {
            tbody.innerHTML = '';
            noClasses.style.display = 'block';
            return;
        }

        noClasses.style.display = 'none';

        tbody.innerHTML = classes.map(cls => `
            <tr>
                <td class="font-medium">${cls.name}</td>
                <td>
                    <span class="badge ${cls.studentCount > 0 ? 'badge-present' : 'badge-secondary'}">
                        ${cls.studentCount} élève${cls.studentCount !== 1 ? 's' : ''}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="Pages.manageSchedule('${cls.id}')" title="Gérer l'emploi du temps">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Gérer l'emploi du temps
                    </button>
                </td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-outline" onclick="Pages.editClass('${cls.id}')" title="Modifier">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-destructive" 
                            onclick="Pages.deleteClass('${cls.id}')" 
                            ${cls.studentCount > 0 ? 'disabled title="Impossible de supprimer une classe avec des élèves"' : 'title="Supprimer"'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2,2h4a2,2,0,0,1,2,2V6"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Edit class
    async editClass(id) {
        const cls = Storage.getClasses().find(c => c.id === id);
        if (!cls) return;

        const content = `
            <form id="edit-class-form" class="space-y-4">
                <div class="form-group">
                    <label class="form-label">Nom de la classe *</label>
                    <input type="text" name="className" class="form-input" value="${cls.name}" required autofocus>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('modal-overlay').classList.remove('active')">Annuler</button>
                    <button type="submit" class="btn btn-primary">Modifier la classe</button>
                </div>
            </form>
        `;

        const modal = UI.showModal('Modifier la classe', content);

        document.getElementById('edit-class-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = UI.getFormData(e.target);
            const className = formData.className.trim();
            
            if (!className) {
                UI.showToast('Veuillez saisir un nom de classe', 'error');
                return;
            }

            // Check if class name already exists (excluding current class)
            const existingClasses = Storage.getClasses();
            if (existingClasses.some(c => c.id !== id && c.name.toLowerCase() === className.toLowerCase())) {
                UI.showToast('Cette classe existe déjà', 'error');
                return;
            }

            const success = Storage.updateClass(id, { name: className });
            if (success) {
                this.refreshClassesList();
                this.updateClassOptions();
                modal.close();
                UI.showToast('Classe modifiée avec succès', 'success');
            } else {
                UI.showToast('Erreur lors de la modification', 'error');
            }
        });
    },

    // Delete class
    async deleteClass(id) {
        const cls = Storage.getClasses().find(c => c.id === id);
        if (!cls) return;

        if (cls.studentCount > 0) {
            UI.showToast(`Impossible de supprimer la classe ${cls.name} car elle contient ${cls.studentCount} élève(s)`, 'error');
            return;
        }

        const confirmed = await UI.showConfirm(
            `Êtes-vous sûr de vouloir supprimer la classe ${cls.name} ?`,
            'Confirmer la suppression',
            { destructive: true, confirmText: 'Supprimer' }
        );

        if (confirmed) {
            const success = Storage.deleteClass(id);
            if (success) {
                this.refreshClassesList();
                this.updateClassOptions();
                this.updateStats();
                UI.showToast('Classe supprimée avec succès', 'success');
            } else {
                UI.showToast('Erreur lors de la suppression', 'error');
            }
        }
    },

    // Manage class schedule
    manageSchedule(classId) {
        UI.showToast('Fonctionnalité en développement', 'info');
    },

    // Update class options in forms
    updateClassOptions() {
        const classes = Storage.getClasses();
        const selects = document.querySelectorAll('#student-class, #students-class-filter');
        
        selects.forEach(select => {
            const currentValue = select.value;
            const isFilter = select.id === 'students-class-filter';
            
            select.innerHTML = isFilter ? '<option value="all">Toutes les classes</option>' : '<option value="">Sélectionner une classe</option>';
            
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                if (currentValue === cls.id) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        });
    },

    // Update class filter options
    updateClassFilterOptions() {
        const classes = Storage.getClasses();
        const select = document.getElementById('students-class-filter');
        
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="all">Toutes les classes</option>';
            
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                if (currentValue === cls.id) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
    }
};

// Export for use in other files
window.Pages = Pages;