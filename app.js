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
            emptyMessage.textContent = 'لا توجد مواعيد';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--secondary-text-color)';
            appointmentList.appendChild(emptyMessage);
        } else {
            appointments.forEach((appointment, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="appointment-details">
                        <span class="appointment-title">${appointment.title}</span>
                        <span class="appointment-time">${new Date(appointment.date).toLocaleDateString('ar-SA')} - ${appointment.time}</span>
                    </div>
                    <button class="delete-btn" data-index="${index}"><img src="delete.svg" alt="Delete"></button>
                `;
                appointmentList.appendChild(li);
            });
        }
    };

    const toggleModal = () => {
        if (addAppointmentModal.style.display === 'block') {
            addAppointmentModal.style.display = 'none';
        } else {
            addAppointmentModal.style.display = 'block';
        }
    };

    addAppointmentBtn.addEventListener('click', toggleModal);
    closeModalBtn.addEventListener('click', toggleModal);

    addAppointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('appointment-title').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;

        appointments.push({ title, date, time });
        saveAppointments();
        renderAppointments();
        toggleModal();
        addAppointmentForm.reset();
    });

    appointmentList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            appointments.splice(index, 1);
            saveAppointments();
            renderAppointments();
        }
    });

    renderAppointments();
});