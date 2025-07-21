// Main Application
class SchoolApp {
    constructor() {
        this.init();
    }

    // Initialize the application
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    // Start the application
    start() {
        console.log('🏫 École Sans Base - Application démarrée');
        
        // Initialize components
        this.initializeSettings();
        this.initializePages();
        this.initializeEventListeners();
        this.handleInitialRoute();
        
        // Show welcome message
        setTimeout(() => {
            UI.showToast('Bienvenue dans École Sans Base !', 'success');
        }, 1000);
    }

    // Initialize settings
    initializeSettings() {
        const settings = Storage.getSettings();
        this.applySettings(settings);
        
        // Initialize settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }
    }

    // Apply settings to the application
    applySettings(settings) {
        // Apply theme
        this.applyTheme(settings.theme);
        
        // Apply sidebar visibility
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (settings.sidebarVisible) {
            sidebar.style.display = 'flex';
            mainContent.style.marginLeft = '16rem';
        } else {
            sidebar.style.display = 'none';
            mainContent.style.marginLeft = '0';
        }
        
        // Update school name in sidebar
        const schoolTitle = document.querySelector('.sidebar-title');
        if (schoolTitle && settings.schoolName) {
            schoolTitle.textContent = settings.schoolName;
        }
    }

    // Apply theme
    applyTheme(theme) {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }

    // Initialize pages
    initializePages() {
        Pages.init();
    }

    // Initialize global event listeners
    initializeEventListeners() {
        // Handle system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            const settings = Storage.getSettings();
            if (settings.theme === 'system') {
                this.applyTheme('system');
            }
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', Utils.throttle(() => {
            this.handleResize();
        }, 250));

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle clicks outside modals
        document.addEventListener('click', (e) => {
            this.handleOutsideClicks(e);
        });

        // Handle form submissions globally
        document.addEventListener('submit', (e) => {
            this.handleFormSubmissions(e);
        });

        // Handle storage changes (for multi-tab sync)
        window.addEventListener('storage', (e) => {
            this.handleStorageChanges(e);
        });
    }

    // Handle initial route
    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        const page = hash || 'dashboard';
        Pages.showPage(page, false);
    }

    // Handle window resize
    handleResize() {
        const isMobile = window.innerWidth < 768;
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (isMobile) {
            sidebar.classList.add('mobile');
            mainContent.style.marginLeft = '0';
        } else {
            sidebar.classList.remove('mobile');
            const settings = Storage.getSettings();
            if (settings.sidebarVisible) {
                mainContent.style.marginLeft = '16rem';
            }
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input:not([style*="display: none"])');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal-overlay');
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        }

        // Ctrl/Cmd + S to save (prevent default browser save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const activeForm = document.querySelector('.page.active form');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        }
    }

    // Handle clicks outside elements
    handleOutsideClicks(e) {
        // Close dropdowns when clicking outside
        const dropdowns = document.querySelectorAll('.dropdown.open');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // Handle form submissions globally
    handleFormSubmissions(e) {
        // Add loading state to submit buttons
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton && !submitButton.disabled) {
            UI.setLoading(submitButton, true);
            
            // Remove loading state after a delay (will be overridden by specific handlers)
            setTimeout(() => {
                UI.setLoading(submitButton, false);
            }, 5000);
        }
    }

    // Handle storage changes for multi-tab synchronization
    handleStorageChanges(e) {
        if (e.key && e.key.startsWith('school-')) {
            // Refresh current page data
            Pages.onPageShow(Pages.currentPage);
            
            // Update stats
            Pages.updateStats();
            
            // Show notification
            UI.showToast('Données mises à jour depuis un autre onglet', 'info');
        }
    }

    // Show settings modal
    showSettingsModal() {
        const settings = Storage.getSettings();
        
        const content = `
            <form id="settings-form" class="space-y-6">
                <div class="form-section">
                    <h4 class="form-section-title">Informations de l'école</h4>
                    <div class="form-group">
                        <label class="form-label">Nom de l'école</label>
                        <input type="text" name="schoolName" class="form-input" value="${settings.schoolName}" placeholder="Nom de l'école">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Lieu</label>
                        <input type="text" name="schoolLocation" class="form-input" value="${settings.schoolLocation}" placeholder="Adresse de l'école">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Numéro de téléphone</label>
                        <input type="tel" name="schoolPhone" class="form-input" value="${settings.schoolPhone}" placeholder="Numéro de téléphone">
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Apparence</h4>
                    <div class="form-group">
                        <label class="form-label">Thème</label>
                        <select name="theme" class="form-select">
                            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Clair</option>
                            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Sombre</option>
                            <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>Système</option>
                        </select>
                    </div>
                    <div class="form-checkbox">
                        <input type="checkbox" id="sidebarVisible" name="sidebarVisible" ${settings.sidebarVisible ? 'checked' : ''}>
                        <label for="sidebarVisible">Afficher la barre latérale</label>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Données</h4>
                    <div class="form-group">
                        <button type="button" class="btn btn-outline" onclick="app.exportData()">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Exporter les données
                        </button>
                    </div>
                    <div class="form-group">
                        <input type="file" id="import-file" accept=".json" style="display: none;" onchange="app.importData(this)">
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('import-file').click()">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17,8 12,3 7,8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Importer les données
                        </button>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-destructive" onclick="app.clearAllData()">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2,2h4a2,2,0,0,1,2,2V6"/>
                            </svg>
                            Effacer toutes les données
                        </button>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('modal-overlay').classList.remove('active')">Annuler</button>
                    <button type="submit" class="btn btn-primary">Sauvegarder</button>
                </div>
            </form>
        `;

        const modal = UI.showModal('Paramètres de l\'application', content);

        document.getElementById('settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = UI.getFormData(e.target);
            const success = Storage.updateSettings(formData);
            
            if (success) {
                this.applySettings(Storage.getSettings());
                modal.close();
                UI.showToast('Paramètres sauvegardés avec succès !', 'success');
            } else {
                UI.showToast('Erreur lors de la sauvegarde', 'error');
            }
        });
    }

    // Export data
    exportData() {
        try {
            const data = Storage.exportData();
            const jsonString = JSON.stringify(data, null, 2);
            const filename = `ecole-sans-base-export-${new Date().toISOString().split('T')[0]}.json`;
            
            Utils.downloadAsFile(jsonString, filename, 'application/json');
            UI.showToast('Données exportées avec succès', 'success');
        } catch (error) {
            console.error('Export error:', error);
            UI.showToast('Erreur lors de l\'export', 'error');
        }
    }

    // Import data
    async importData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const confirmed = await UI.showConfirm(
                'Cette action remplacera toutes les données actuelles. Êtes-vous sûr de vouloir continuer ?',
                'Confirmer l\'importation',
                { destructive: true, confirmText: 'Importer' }
            );

            if (confirmed) {
                const success = Storage.importData(data);
                
                if (success) {
                    // Refresh all data
                    Pages.onPageShow(Pages.currentPage);
                    Pages.updateStats();
                    Pages.updateClassOptions();
                    
                    UI.showToast('Données importées avec succès', 'success');
                } else {
                    UI.showToast('Erreur lors de l\'importation', 'error');
                }
            }
        } catch (error) {
            console.error('Import error:', error);
            UI.showToast('Fichier invalide ou corrompu', 'error');
        } finally {
            fileInput.value = ''; // Reset file input
        }
    }

    // Clear all data
    async clearAllData() {
        const confirmed = await UI.showConfirm(
            'Cette action supprimera définitivement toutes les données (élèves, professeurs, classes, etc.). Cette action est irréversible.',
            'Confirmer la suppression',
            { destructive: true, confirmText: 'Tout supprimer' }
        );

        if (confirmed) {
            const success = Storage.clear();
            
            if (success) {
                // Refresh all data
                Pages.onPageShow(Pages.currentPage);
                Pages.updateStats();
                Pages.updateClassOptions();
                
                // Close modal
                document.getElementById('modal-overlay').classList.remove('active');
                
                UI.showToast('Toutes les données ont été supprimées', 'success');
            } else {
                UI.showToast('Erreur lors de la suppression', 'error');
            }
        }
    }

    // Get application statistics
    getStats() {
        return Storage.getStatistics();
    }

    // Check application health
    checkHealth() {
        const stats = this.getStats();
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            data: stats,
            storage: {
                available: typeof Storage !== 'undefined',
                quota: this.getStorageQuota()
            }
        };

        console.log('🏥 Application Health Check:', health);
        return health;
    }

    // Get storage quota information
    getStorageQuota() {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            return {
                used: Utils.formatFileSize(used),
                available: 'Unknown' // Browser dependent
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Initialize the application
const app = new SchoolApp();

// Make app globally available for debugging
window.app = app;

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle app installation prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or notification
    UI.showToast('Cette application peut être installée sur votre appareil', 'info', 10000);
});

// Handle app installation
window.addEventListener('appinstalled', () => {
    UI.showToast('Application installée avec succès !', 'success');
    deferredPrompt = null;
});

// Export for global access
window.SchoolApp = SchoolApp;