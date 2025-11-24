// Appointments Management System
class AppointmentsManager {
    constructor() {
        this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        this.currentTab = 'upcoming';
        this.init();
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
        const customerDetails = document.getElementById('customer-appointment-details').value.trim();

        if (!title || !date || !time || !category || !member) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        const appointment = {
            id: Date.now(),
            title,
            date,
            time,
            category,
            notes,
            member,
            customer: {
                name: customerName,
                address: customerAddress,
                phone: customerPhone,
                details: customerDetails
            },
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.appointments.push(appointment);
        this.saveAppointments();
        this.renderAppointments();
        this.updateNextAppointment();
        this.clearForm();
        
        // Show success message
        this.showNotification('Termin erfolgreich hinzugefügt!');
    }

    clearForm() {
        document.getElementById('appointment-form').reset();
        document.getElementById('appointment-category').selectedIndex = 0;
        document.getElementById('family-member-select').selectedIndex = 0;
    }

    deleteAppointment(id) {
        if (confirm('Termin wirklich löschen?')) {
            this.appointments = this.appointments.filter(apt => apt.id !== id);
            this.saveAppointments();
            this.renderAppointments();
            this.updateNextAppointment();
            this.showNotification('Termin gelöscht!');
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

    showNotification(message) {
        // Simple notification - you can enhance this
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-surface);
            border: 1px solid var(--glass-border);
            border-radius: var(--small-radius);
            padding: 1rem;
            color: var(--text-primary);
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveAppointments() {
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
    }
}

// Initialize appointments manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appointmentsManager = new AppointmentsManager();
});