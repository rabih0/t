document.addEventListener('DOMContentLoaded', () => {
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addAppointmentModal = document.getElementById('add-appointment-modal');
    const addAppointmentForm = document.getElementById('add-appointment-form');
    const appointmentList = document.getElementById('appointment-list');
    const tabBar = document.querySelector('.tab-bar');
    // People / owner elements
    const managePeopleBtn = document.getElementById('manage-people-btn');
    const managePeopleModal = document.getElementById('manage-people-modal');
    const closePeopleModalBtn = document.getElementById('close-people-modal-btn');
    const peopleListEl = document.getElementById('people-list');
    const addPersonForm = document.getElementById('add-person-form');
    const personNameInput = document.getElementById('person-name');
    const appointmentPersonSelect = document.getElementById('appointment-person');

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    // store family members / people (owners)
    let people = JSON.parse(localStorage.getItem('people')) || [];
    let currentTab = 'current';

    const saveAppointments = () => {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    };

    const savePeople = () => {
        localStorage.setItem('people', JSON.stringify(people));
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

    // Render people list in manage people modal
    const renderPeople = () => {
        // list in modal
        peopleListEl.innerHTML = '';
        if (people.length === 0) {
            const empty = document.createElement('li');
            empty.textContent = 'Keine Personen';
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--secondary-text-color)';
            peopleListEl.appendChild(empty);
        } else {
            people.forEach((p, idx) => {
                const li = document.createElement('li');
                li.className = 'person-item';
                li.innerHTML = `
                    <span class="person-name">${p}</span>
                    <button class="remove-person-btn" data-index="${idx}"><img src="delete.svg" alt="Remove"></button>
                `;
                peopleListEl.appendChild(li);
            });
        }

        // render the select in appointment form
        appointmentPersonSelect.innerHTML = '';
        if (people.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Keine Person';
            appointmentPersonSelect.appendChild(opt);
            appointmentPersonSelect.required = false;
        } else {
            people.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                appointmentPersonSelect.appendChild(opt);
            });
            appointmentPersonSelect.required = true;
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
            // set selected person if present
            if (appointment.person) {
                appointmentPersonSelect.value = appointment.person;
            }
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
        const person = document.getElementById('appointment-person').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const mode = addAppointmentForm.dataset.mode;
        const index = addAppointmentForm.dataset.index;

        if (mode === 'edit') {
            appointments[index] = { title, date, time, person };
        } else {
            appointments.push({ title, date, time, person });
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
    // people management wiring
    managePeopleBtn.addEventListener('click', () => {
        if (managePeopleModal.style.display === 'block') {
            managePeopleModal.style.display = 'none';
        } else {
            renderPeople();
            managePeopleModal.style.display = 'block';
        }
    });

    closePeopleModalBtn.addEventListener('click', () => {
        if (managePeopleModal.style.display === 'block') {
            managePeopleModal.style.display = 'none';
        }
    });

    addPersonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = personNameInput.value.trim();
        if (!name) return;
        people.push(name);
        savePeople();
        personNameInput.value = '';
        renderPeople();
    });

    // handle remove person buttons using event delegation
    peopleListEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-person-btn');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        if (!Number.isNaN(idx)) {
            // remove any appointments referencing this person
            const removed = people.splice(idx, 1)[0];
            appointments = appointments.map(a => a.person === removed ? { ...a, person: '' } : a);
            savePeople();
            saveAppointments();
            renderPeople();
            renderAppointments();
        }
    });

    // initial render of people select
    renderPeople();
});