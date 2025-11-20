document.addEventListener('DOMContentLoaded', () => {
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addAppointmentModal = document.getElementById('add-appointment-modal');
    const addAppointmentForm = document.getElementById('add-appointment-form');
    const appointmentList = document.getElementById('appointment-list');
    const tabBar = document.querySelector('.tab-bar');

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    let currentTab = 'current';

    const saveAppointments = () => {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    };

    tabBar.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn) {
            currentTab = tabBtn.dataset.tab;
            document.querySelector('.tab-btn.active').classList.remove('active');
            tabBtn.classList.add('active');
            renderAppointments();
        }
    });


    const renderAppointments = () => {
        appointmentList.innerHTML = '';

        // Sort appointments by date and time
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filteredAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            if (currentTab === 'previous') {
                return appointmentDate < today;
            } else if (currentTab === 'upcoming') {
                return appointmentDate > today;
            } else { // current
                return appointmentDate.getTime() === today.getTime();
            }
        });

        if (filteredAppointments.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Keine Termine';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--secondary-text-color)';
            appointmentList.appendChild(emptyMessage);
        } else {
            filteredAppointments.forEach(appointment => {
                const originalIndex = appointments.indexOf(appointment);
                const li = document.createElement('li');
                const date = new Date(`${appointment.date}T${appointment.time}`);
                const formattedDate = date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const formattedTime = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

                li.innerHTML = `
                    <div class="appointment-details">
                        <span class="appointment-title">${appointment.title}</span>
                        <span class="appointment-time">${formattedDate} - ${formattedTime}</span>
                    </div>
                    <div>
                        <button class="edit-btn" data-index="${originalIndex}"><img src="edit.svg" alt="Edit"></button>
                        <button class="delete-btn" data-index="${originalIndex}"><img src="delete.svg" alt="Delete"></button>
                    </div>
                `;
                appointmentList.appendChild(li);
            });
        }
    };

    const toggleModal = (mode = 'add', index = null) => {
        const modalTitle = document.querySelector('#add-appointment-modal h2');
        addAppointmentForm.dataset.mode = mode;
        addAppointmentForm.dataset.index = index;

        if (mode === 'edit') {
            modalTitle.textContent = 'Termin bearbeiten';
            const appointment = appointments[index];
            document.getElementById('appointment-title').value = appointment.title;
            document.getElementById('appointment-date').value = appointment.date;
            document.getElementById('appointment-time').value = appointment.time;
        } else {
            modalTitle.textContent = 'Neuer Termin';
            addAppointmentForm.reset();
            document.getElementById('appointment-date').value = new Date().toISOString().slice(0, 10);
        }

        if (addAppointmentModal.style.display === 'block') {
            addAppointmentModal.style.display = 'none';
        } else {
            addAppointmentModal.style.display = 'block';
        }
    };

    addAppointmentBtn.addEventListener('click', () => toggleModal('add'));
    closeModalBtn.addEventListener('click', () => {
        if (addAppointmentModal.style.display === 'block') {
            addAppointmentModal.style.display = 'none';
            addAppointmentForm.reset();
        }
    });

    addAppointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('appointment-title').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const mode = addAppointmentForm.dataset.mode;
        const index = addAppointmentForm.dataset.index;

        if (mode === 'edit') {
            appointments[index] = { title, date, time };
        } else {
            appointments.push({ title, date, time });
        }

        saveAppointments();
        renderAppointments();
        if (addAppointmentModal.style.display === 'block') {
            addAppointmentModal.style.display = 'none';
        }
        addAppointmentForm.reset();
    });

    appointmentList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');

        if (deleteBtn) {
            const index = deleteBtn.dataset.index;
            appointments.splice(index, 1);
            saveAppointments();
            renderAppointments();
        } else if (editBtn) {
            const index = editBtn.dataset.index;
            toggleModal('edit', index);
        }
    });

    renderAppointments();
});