// UI Components and Utilities
const UI = {
    // Toast notifications
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>`,
            error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>`,
            warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="12" r="10"/>
                     <line x1="12" y1="16" x2="12" y2="12"/>
                     <line x1="12" y1="8" x2="12.01" y2="8"/>
                   </svg>`
        };
        
        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div class="toast-content">
                <div class="toast-message">${Utils.sanitizeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        }
        
        return toast;
    },

    // Modal management
    showModal(title, content, options = {}) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        
        overlay.classList.add('active');
        
        // Handle close events
        const closeModal = () => {
            overlay.classList.remove('active');
            if (options.onClose) options.onClose();
        };
        
        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
        
        // Close on close button click
        document.getElementById('modal-close').onclick = closeModal;
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        return { close: closeModal };
    },

    // Confirmation dialog
    showConfirm(message, title = 'Confirmation', options = {}) {
        return new Promise((resolve) => {
            const content = `
                <div class="space-y-4">
                    <p>${Utils.sanitizeHtml(message)}</p>
                    <div class="form-actions">
                        <button id="confirm-cancel" class="btn btn-outline">
                            ${options.cancelText || 'Annuler'}
                        </button>
                        <button id="confirm-ok" class="btn ${options.destructive ? 'btn-destructive' : 'btn-primary'}">
                            ${options.confirmText || 'Confirmer'}
                        </button>
                    </div>
                </div>
            `;
            
            const modal = this.showModal(title, content, {
                onClose: () => resolve(false)
            });
            
            document.getElementById('confirm-cancel').onclick = () => {
                modal.close();
                resolve(false);
            };
            
            document.getElementById('confirm-ok').onclick = () => {
                modal.close();
                resolve(true);
            };
        });
    },

    // Form validation
    validateForm(formElement) {
        const errors = [];
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const label = input.previousElementSibling?.textContent || input.name || 'Champ';
            
            // Remove existing error classes
            input.classList.remove('error');
            
            if (!value) {
                errors.push(`${label} est requis`);
                input.classList.add('error');
                return;
            }
            
            // Email validation
            if (input.type === 'email' && !Utils.isValidEmail(value)) {
                errors.push(`${label} doit être une adresse email valide`);
                input.classList.add('error');
            }
            
            // Phone validation
            if (input.type === 'tel' && !Utils.isValidPhone(value)) {
                errors.push(`${label} doit être un numéro de téléphone valide`);
                input.classList.add('error');
            }
            
            // Date validation
            if (input.type === 'date' && value) {
                const date = new Date(value);
                const today = new Date();
                if (date > today) {
                    errors.push(`${label} ne peut pas être dans le futur`);
                    input.classList.add('error');
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Form data extraction
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Handle checkboxes and radio buttons
        const checkboxes = formElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });
        
        return data;
    },

    // Reset form
    resetForm(formElement) {
        formElement.reset();
        
        // Remove error classes
        const inputs = formElement.querySelectorAll('.error');
        inputs.forEach(input => input.classList.remove('error'));
        
        // Clear custom validations
        const errorMessages = formElement.querySelectorAll('.form-error');
        errorMessages.forEach(msg => msg.remove());
    },

    // Loading state
    setLoading(element, loading = true) {
        if (loading) {
            element.classList.add('form-loading');
            element.disabled = true;
            
            // Add spinner if it's a button
            if (element.tagName === 'BUTTON') {
                const originalText = element.innerHTML;
                element.dataset.originalText = originalText;
                element.innerHTML = `
                    <div class="spinner"></div>
                    <span>Chargement...</span>
                `;
            }
        } else {
            element.classList.remove('form-loading');
            element.disabled = false;
            
            // Restore button text
            if (element.tagName === 'BUTTON' && element.dataset.originalText) {
                element.innerHTML = element.dataset.originalText;
                delete element.dataset.originalText;
            }
        }
    },

    // Table utilities
    createTable(data, columns, options = {}) {
        if (!data.length) {
            return '<div class="empty-state"><p>Aucune donnée disponible</p></div>';
        }
        
        let html = '<table class="data-table">';
        
        // Header
        html += '<thead><tr>';
        columns.forEach(col => {
            html += `<th>${col.title}</th>`;
        });
        if (options.actions) {
            html += '<th>Actions</th>';
        }
        html += '</tr></thead>';
        
        // Body
        html += '<tbody>';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = Utils.getNestedValue(row, col.field);
                const displayValue = col.render ? col.render(value, row) : value;
                html += `<td>${displayValue || ''}</td>`;
            });
            
            if (options.actions) {
                html += '<td class="table-actions">';
                options.actions.forEach(action => {
                    html += `<button class="btn btn-sm ${action.class || 'btn-outline'}" 
                             onclick="${action.onclick}('${row.id}')" 
                             title="${action.title || ''}">
                             ${action.icon || action.text}
                           </button>`;
                });
                html += '</td>';
            }
            
            html += '</tr>';
        });
        html += '</tbody></table>';
        
        return html;
    },

    // Badge component
    createBadge(text, variant = 'default') {
        return `<span class="badge badge-${variant}">${Utils.sanitizeHtml(text)}</span>`;
    },

    // Status indicator
    createStatus(status, text) {
        return `<div class="table-status table-status-${status}">
                  <div class="table-status-dot"></div>
                  ${Utils.sanitizeHtml(text)}
                </div>`;
    },

    // Format gender for display
    formatGender(gender) {
        return gender === 'male' ? 'Homme' : 'Femme';
    },

    // Format student number
    formatStudentNumber(number) {
        return number || 'Non assigné';
    },

    // Create action buttons
    createActionButtons(id, actions) {
        return actions.map(action => `
            <button class="btn btn-sm ${action.variant || 'btn-outline'}" 
                    onclick="${action.onclick}('${id}')"
                    title="${action.title || ''}">
                ${action.icon}
            </button>
        `).join('');
    },

    // Pagination
    createPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';
        
        let html = '<div class="table-pagination-controls">';
        
        // Previous button
        html += `<button class="table-pagination-btn" 
                 ${currentPage === 1 ? 'disabled' : ''} 
                 onclick="${onPageChange}(${currentPage - 1})">
                 Précédent
                 </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage || 
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="table-pagination-btn ${i === currentPage ? 'active' : ''}" 
                         onclick="${onPageChange}(${i})">
                         ${i}
                         </button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span>...</span>';
            }
        }
        
        // Next button
        html += `<button class="table-pagination-btn" 
                 ${currentPage === totalPages ? 'disabled' : ''} 
                 onclick="${onPageChange}(${currentPage + 1})">
                 Suivant
                 </button>`;
        
        html += '</div>';
        return html;
    },

    // Debounced search
    createDebouncedSearch(inputElement, callback, delay = 300) {
        const debouncedCallback = Utils.debounce(callback, delay);
        inputElement.addEventListener('input', (e) => {
            debouncedCallback(e.target.value);
        });
    }
};

// Export for use in other files
window.UI = UI;