// Appointments Management System
class AppointmentsManager {
    constructor() {
        this.appointments = this.loadAppointments();
        this.currentTab = 'upcoming';
        this.autoSaveInterval = null;
        this.init();
        this.setupAutoSave();
    }

    init() {
        this.bindEvents();
        this.renderAppointments();
        this.updateNextAppointment();
    }

    bindEvents() {
        // Appointment form submit
        const appointmentForm = document.getElementById('appointment-form');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAppointment();
            });
        }

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchAppointments(e.target.value);
            });
        }

        // Modal close
        const modalCloseBtn = document.getElementById('modal-close-btn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Click outside modal to close
        const modalOverlay = document.getElementById('appointment-details-modal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Next appointment card click
        const nextAppointmentCard = document.querySelector('.next-appointment-card');
        if (nextAppointmentCard) {
            nextAppointmentCard.addEventListener('click', () => {
                const nextAppointment = this.getNextAppointment();
                if (nextAppointment) {
                    this.showAppointmentDetails(nextAppointment);
                }
            });
        }
    }

    addAppointment() {
        const title = document.getElementById('appointment-title').value.trim();
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const category = document.getElementById('appointment-category').value;
        const notes = document.getElementById('appointment-notes').value.trim();
        const member = document.getElementById('family-member-select').value;
        
        // Customer details
        const customerName = document.getElementById('customer-name').value.trim();
        const customerAddress = document.getElementById('customer-address').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const customerDetails = '';

        if (!title || !date || !time || !category || !member) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        const appointment = {
            id: Date.now() + Math.random(), // More unique ID
            title: title.substring(0, 100), // Limit title length
            date,
            time,
            category,
            notes: notes.substring(0, 500), // Limit notes length
            member,
            customer: {
                name: customerName.substring(0, 100),
                address: customerAddress.substring(0, 200),
                phone: customerPhone.substring(0, 50),
                details: customerDetails.substring(0, 500)
            },
            completed: false,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Validate appointment data
        if (this.validateAppointment(appointment)) {
            this.appointments.push(appointment);
            
            // Immediate save with validation
            const saveSuccess = this.saveAppointments();
            if (saveSuccess !== false) {
                this.renderAppointments();
                this.updateNextAppointment();
                this.clearForm();
                this.showNotification('Termin erfolgreich hinzugefügt!');
            } else {
                // Remove the appointment if save failed
                this.appointments.pop();
                this.showNotification('Fehler beim Speichern des Termins!');
            }
        } else {
            this.showNotification('Ungültige Termindaten!');
        }
    }

    clearForm() {
        document.getElementById('appointment-form').reset();
        document.getElementById('appointment-category').selectedIndex = 0;
        document.getElementById('family-member-select').selectedIndex = 0;
    }

    deleteAppointment(id) {
        const appointment = this.appointments.find(apt => apt.id == id);
        if (!appointment) {
            this.showNotification('Termin nicht gefunden!');
            return;
        }
        
        if (confirm(`Termin "${appointment.title}" wirklich löschen?\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`)) {
            // Create backup before deletion
            const backup = [...this.appointments];
            
            this.appointments = this.appointments.filter(apt => apt.id != id);
            
            const saveSuccess = this.saveAppointments();
            if (saveSuccess !== false) {
                this.renderAppointments();
                this.updateNextAppointment();
                this.showNotification('Termin gelöscht!');
            } else {
                // Restore if save failed
                this.appointments = backup;
                this.showNotification('Fehler beim Löschen des Termins!');
            }
        }
    }

    toggleAppointmentStatus(id) {
        const appointment = this.appointments.find(apt => apt.id === id);
        if (appointment) {
            appointment.completed = !appointment.completed;
            this.saveAppointments();
            this.renderAppointments();
            this.updateNextAppointment();
            
            const status = appointment.completed ? 'als erledigt markiert' : 'als offen markiert';
            this.showNotification(`Termin ${status}!`);
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show/hide appointment lists
        document.querySelectorAll('.appointment-list').forEach(list => {
            list.classList.add('hidden');
        });
        document.getElementById(`${tabName}-list`).classList.remove('hidden');
        
        this.renderAppointments();
    }

    renderAppointments() {
        const upcomingList = document.getElementById('upcoming-list');
        const workList = document.getElementById('work-list');
        const completedList = document.getElementById('completed-list');

        if (upcomingList) upcomingList.innerHTML = '';
        if (workList) workList.innerHTML = '';
        if (completedList) completedList.innerHTML = '';

        const now = new Date();
        
        this.appointments.forEach(appointment => {
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
            const listItem = this.createAppointmentElement(appointment);
            
            if (appointment.completed) {
                if (completedList) completedList.appendChild(listItem);
            } else if (appointment.category === 'work') {
                if (workList) workList.appendChild(listItem);
            } else {
                if (upcomingList) upcomingList.appendChild(listItem);
            }
        });

        // Show empty state if no appointments
        this.showEmptyStateIfNeeded();
    }

    createAppointmentElement(appointment) {
        const li = document.createElement('li');
        li.className = 'appointment-item';
        
        const categoryIcons = {
            doctor: '🏥',
            school: '🎓',
            work: '💼',
            leisure: '🎯',
            other: '📅'
        };

        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const formattedDate = appointmentDate.toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        li.innerHTML = `
            <div class="icon">${categoryIcons[appointment.category] || '📅'}</div>
            <div class="details">
                <div class="title">${appointment.title}</div>
                <div class="meta">
                    ${formattedDate} um ${formattedTime} • ${appointment.member}
                    ${appointment.notes ? ` • ${appointment.notes}` : ''}
                </div>
            </div>
            <div class="actions">
                <button onclick="appointmentsManager.showAppointmentDetails(${appointment.id})" title="Details anzeigen">👁️</button>
                <button onclick="appointmentsManager.toggleAppointmentStatus(${appointment.id})" title="${appointment.completed ? 'Als offen markieren' : 'Als erledigt markieren'}">
                    ${appointment.completed ? '↩️' : '✅'}
                </button>
                <button onclick="appointmentsManager.deleteAppointment(${appointment.id})" class="delete-btn" title="Löschen">🗑️</button>
            </div>
        `;

        // Add click handler for appointment details
        li.addEventListener('click', (e) => {
            if (!e.target.closest('.actions')) {
                this.showAppointmentDetails(appointment);
            }
        });

        return li;
    }

    showAppointmentDetails(appointmentOrId) {
        let appointment;
        if (typeof appointmentOrId === 'number') {
            appointment = this.appointments.find(apt => apt.id === appointmentOrId);
        } else {
            appointment = appointmentOrId;
        }

        if (!appointment) return;

        const modal = document.getElementById('appointment-details-modal');
        const modalBody = document.getElementById('modal-body');
        
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const formattedDate = appointmentDate.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const categoryNames = {
            doctor: 'Arzt',
            school: 'Schule',
            work: 'Arbeit',
            leisure: 'Freizeit',
            other: 'Sonstiges'
        };

        modalBody.innerHTML = `
            <h3>${appointment.title}</h3>
            <div class="meta-item">
                <i class="bi bi-calendar"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="meta-item">
                <i class="bi bi-clock"></i>
                <span>${formattedTime}</span>
            </div>
            <div class="meta-item">
                <i class="bi bi-tag"></i>
                <span>${categoryNames[appointment.category]}</span>
            </div>
            <div class="meta-item">
                <i class="bi bi-person"></i>
                <span>${appointment.member}</span>
            </div>
            ${appointment.notes ? `
                <div class="meta-item">
                    <i class="bi bi-note"></i>
                    <span>${appointment.notes}</span>
                </div>
            ` : ''}
            <div class="meta-item">
                <i class="bi bi-check-circle"></i>
                <span>${appointment.completed ? 'Erledigt' : 'Offen'}</span>
            </div>
            ${this.renderCustomerDetails(appointment.customer)}
        `;

        modal.classList.remove('hidden');
    }

    renderCustomerDetails(customer) {
        if (!customer.name && !customer.address && !customer.phone && !customer.details) {
            return '';
        }

        return `
            <div class="customer-details-modal">
                <h4>Kundendetails</h4>
                ${customer.name ? `
                    <div class="meta-item">
                        <i class="bi bi-person-badge"></i>
                        <span>${customer.name}</span>
                    </div>
                ` : ''}
                ${customer.address ? `
                    <div class="meta-item">
                        <i class="bi bi-geo-alt"></i>
                        <span>${customer.address}</span>
                    </div>
                ` : ''}
                ${customer.phone ? `
                    <div class="meta-item">
                        <i class="bi bi-telephone"></i>
                        <span>${customer.phone}</span>
                    </div>
                ` : ''}
                ${customer.details ? `
                    <div class="meta-item">
                        <i class="bi bi-info-circle"></i>
                        <span>${customer.details}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    closeModal() {
        document.getElementById('appointment-details-modal').classList.add('hidden');
    }

    searchAppointments(query) {
        const appointments = document.querySelectorAll('.appointment-item');
        appointments.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    getNextAppointment() {
        const now = new Date();
        const upcomingAppointments = this.appointments
            .filter(apt => !apt.completed)
            .filter(apt => new Date(`${apt.date}T${apt.time}`) > now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        return upcomingAppointments[0] || null;
    }

    updateNextAppointment() {
        const nextAppointmentSection = document.getElementById('next-appointment-section');
        if (!nextAppointmentSection) return;

        const nextAppointment = this.getNextAppointment();
        
        if (nextAppointment) {
            const appointmentDate = new Date(`${nextAppointment.date}T${nextAppointment.time}`);
            const formattedDate = appointmentDate.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit'
            });
            const formattedTime = appointmentDate.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            nextAppointmentSection.innerHTML = `
                <h3>Nächster Termin</h3>
                <p><strong>${nextAppointment.title}</strong></p>
                <p>${formattedDate} um ${formattedTime}</p>
                <p>mit ${nextAppointment.member}</p>
            `;
        } else {
            nextAppointmentSection.innerHTML = `
                <h3>Nächster Termin</h3>
                <p>Keine anstehenden Termine</p>
            `;
        }
    }

    showEmptyStateIfNeeded() {
        const lists = ['upcoming-list', 'work-list', 'completed-list'];
        lists.forEach(listId => {
            const list = document.getElementById(listId);
            if (list && list.children.length === 0) {
                const emptyMessage = document.createElement('li');
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.color = 'var(--text-secondary)';
                emptyMessage.style.padding = '2rem';
                emptyMessage.textContent = 'Keine Termine vorhanden';
                list.appendChild(emptyMessage);
            }
        });
    }

    validateAppointment(appointment) {
        // Check required fields
        if (!appointment.title || !appointment.date || !appointment.time || 
            !appointment.category || !appointment.member) {
            return false;
        }
        
        // Validate date format
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        if (isNaN(appointmentDate.getTime())) {
            return false;
        }
        
        // Check if date is not too far in the past (more than 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (appointmentDate < oneYearAgo) {
            return false;
        }
        
        return true;
    }

    showNotification(message) {
        // Enhanced notification with better styling
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-surface);
            border: 1px solid var(--glass-border);
            border-radius: var(--small-radius);
            padding: 1rem 1.5rem;
            color: var(--text-primary);
            z-index: 10000;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation keyframes
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    loadAppointments() {
        try {
            const saved = localStorage.getItem('appointments');
            if (saved) {
                const appointments = JSON.parse(saved);
                // Validate data structure
                if (Array.isArray(appointments)) {
                    return appointments.filter(apt => apt && apt.id && apt.title);
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Termine:', error);
            this.showNotification('Fehler beim Laden der gespeicherten Termine');
        }
        return [];
    }

    saveAppointments() {
        try {
            // Create backup before saving
            const backup = localStorage.getItem('appointments');
            if (backup) {
                localStorage.setItem('appointments_backup', backup);
            }
            
            // Validate data before saving
            const validAppointments = this.appointments.filter(apt => this.validateAppointment(apt));
            if (validAppointments.length !== this.appointments.length) {
                console.warn(`${this.appointments.length - validAppointments.length} ungültige Termine entfernt`);
                this.appointments = validAppointments;
            }
            
            // Save current appointments
            const dataToSave = JSON.stringify(this.appointments);
            localStorage.setItem('appointments', dataToSave);
            
            // Verify the save was successful
            const savedData = localStorage.getItem('appointments');
            if (savedData !== dataToSave) {
                throw new Error('Daten wurden nicht korrekt gespeichert');
            }
            
            // Also save to sessionStorage as additional backup
            sessionStorage.setItem('appointments_session', dataToSave);
            
            console.log(`${this.appointments.length} Termine erfolgreich gespeichert`);
            return true;
        } catch (error) {
            console.error('Fehler beim Speichern der Termine:', error);
            
            // Check if it's a quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Speicher voll! Bitte löschen Sie alte Termine.');
            } else {
                this.showNotification('Fehler beim Speichern! Bitte versuchen Sie es erneut.');
            }
            
            // Try to restore from backup
            this.restoreFromBackup();
            return false;
        }
    }

    restoreFromBackup() {
        try {
            const backup = localStorage.getItem('appointments_backup');
            const sessionBackup = sessionStorage.getItem('appointments_session');
            
            if (sessionBackup) {
                this.appointments = JSON.parse(sessionBackup);
                this.showNotification('Termine aus Session-Backup wiederhergestellt');
            } else if (backup) {
                this.appointments = JSON.parse(backup);
                this.showNotification('Termine aus Backup wiederhergestellt');
            }
        } catch (error) {
            console.error('Fehler beim Wiederherstellen:', error);
        }
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.appointments.length > 0) {
                this.saveAppointments();
            }
        }, 30000);
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveAppointments();
        });
        
        // Save when page becomes hidden (mobile app switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveAppointments();
            }
        });
    }
}

// Initialize appointments manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appointmentsManager = new AppointmentsManager();
});