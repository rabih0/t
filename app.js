document.addEventListener('DOMContentLoaded', () => {
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addAppointmentModal = document.getElementById('add-appointment-modal');
    const addAppointmentForm = document.getElementById('add-appointment-form');
    const appointmentList = document.getElementById('appointment-list');

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    const saveAppointments = () => {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    };

    const renderAppointments = () => {
        appointmentList.innerHTML = '';
        if (appointments.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Keine Termine';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--secondary-text-color)';
            appointmentList.appendChild(emptyMessage);
        } else {
            appointments.forEach((appointment, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="appointment-details">
                        <span class="appointment-title">${appointment.title}</span>
                        <span class="appointment-time">${new Date(appointment.date).toLocaleDateString('de-DE')} - ${appointment.time}</span>
                    </div>
                    <div>
                        <button class="edit-btn" data-index="${index}"><img src="edit.svg" alt="Edit"></button>
                        <button class="delete-btn" data-index="${index}"><img src="delete.svg" alt="Delete"></button>
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