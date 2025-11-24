document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentTitleInput = document.getElementById('appointment-title');
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentTimeInput = document.getElementById('appointment-time');
    const appointmentCategoryInput = document.getElementById('appointment-category');
    const appointmentNotesInput = document.getElementById('appointment-notes');
    const familyMemberSelect = document.getElementById('family-member-select');
    const datetimeDiv = document.getElementById('datetime');
    const searchInput = document.getElementById('search-input');

    const addMemberBtn = document.getElementById('add-member-btn');
    const addMemberForm = document.getElementById('add-member-form');
    const newMemberNameInput = document.getElementById('new-member-name');
    const cancelAddMemberBtn = document.getElementById('cancel-add-member');

    const nextAppointmentSection = document.getElementById('next-appointment-section');

    const tabs = document.querySelector('.tabs');
    const upcomingList = document.getElementById('upcoming-list');
    const workList = document.getElementById('work-list');
    const completedList = document.getElementById('completed-list');

    const modalOverlay = document.getElementById('appointment-details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBody = document.getElementById('modal-body');
    const customerDetailsSection = document.getElementById('customer-details-section');
    const customerNameInput = document.getElementById('customer-name');
    const customerAddressInput = document.getElementById('customer-address');
    const customerPhoneInput = document.getElementById('customer-phone');
    const customerAppointmentDetailsInput = document.getElementById('customer-appointment-details');

    // --- State ---
    let appointments = JSON.parse(localStorage.getItem('familyAppointments')) || [];
    let familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || ['Rabih Alahmad', 'Aischa Almuschhan', 'Nouralahuda Alahmad', 'Taim Alahmad'];
    let currentTab = 'upcoming';
    let editMode = { active: false, appointmentId: null };

    // --- Functions ---

    const updateDateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        if (datetimeDiv) {
            datetimeDiv.textContent = now.toLocaleDateString('de-DE', options);
        }
    };

    const saveState = () => {
        localStorage.setItem('familyAppointments', JSON.stringify(appointments));
        localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    };

    const renderFamilyMembers = () => {
        familyMemberSelect.innerHTML = '<option value="" disabled selected>Person</option>';
        familyMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            familyMemberSelect.appendChild(option);
        });
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'doctor': return 'bi-heart-pulse';
            case 'school': return 'bi-book';
            case 'leisure': return 'bi-dribbble';
            case 'work': return 'bi-briefcase';
            default: return 'bi-calendar-event';
        }
    };

    const renderAppointments = (searchTerm = '') => {
        upcomingList.innerHTML = '';
        workList.innerHTML = '';
        completedList.innerHTML = '';

        let filteredAppointments = appointments;
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredAppointments = appointments.filter(app => 
                app.title.toLowerCase().includes(lowercasedTerm) ||
                app.member.toLowerCase().includes(lowercasedTerm) ||
                (app.notes && app.notes.toLowerCase().includes(lowercasedTerm))
            );
        }

        const upcoming = filteredAppointments.filter(a => !a.completed && a.category !== 'work');
        const work = filteredAppointments.filter(a => !a.completed && a.category === 'work');
        const completed = filteredAppointments.filter(a => a.completed);

        // Sort upcoming appointments by date
        upcoming.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
        work.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

        if (upcoming.length === 0) {
            upcomingList.innerHTML = '<li>Keine passenden Termine gefunden.</li>';
        } else {
            upcoming.forEach(app => upcomingList.appendChild(createAppointmentElement(app)));
        }

        if (work.length === 0) {
            workList.innerHTML = '<li>Keine passenden Termine gefunden.</li>';
        } else {
            work.forEach(app => workList.appendChild(createAppointmentElement(app)));
        }

        if (completed.length === 0) {
            completedList.innerHTML = '<li>Keine passenden Termine gefunden.</li>';
        } else {
            completed.forEach(app => completedList.appendChild(createAppointmentElement(app)));
        }

        // The next appointment card should not be affected by search
        const allUpcoming = appointments.filter(a => !a.completed).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
        updateNextAppointmentCard(allUpcoming);
    };


    const createAppointmentElement = (appointment) => {
        const item = document.createElement('li');
        item.className = 'appointment-item';
        item.dataset.id = appointment.id;

        const date = new Date(`${appointment.date}T${appointment.time}`);
        const formattedDate = date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
        const formattedTime = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="icon"><i class="bi ${getCategoryIcon(appointment.category)}"></i></div>
            <div class="details">
                <div class="title">${appointment.title}</div>
                <div class="meta">${appointment.member} • ${formattedDate}, ${formattedTime} Uhr</div>
            </div>
            <div class="actions">
                ${!appointment.completed ? `<button class="complete-btn"><i class="bi bi-check-lg"></i></button>` : ''}
                <button class="edit-btn"><img src="edit.svg" alt="Edit"></button>
                <button class="delete-btn"><img src="delete.svg" alt="Delete"></button>
            </div>
        `;
        return item;
    };

    const updateNextAppointmentCard = (upcoming) => {
        if (upcoming.length > 0) {
            const nextApp = upcoming[0];
            const date = new Date(`${nextApp.date}T${nextApp.time}`);
            const formattedDate = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
            nextAppointmentSection.innerHTML = `
                <h3>Nächster Termin</h3>
                <p>${nextApp.title} (${nextApp.member})</p>
                <p>${formattedDate} um ${nextApp.time} Uhr</p>
            `;
        } else {
            nextAppointmentSection.innerHTML = '<p>Keine anstehenden Termine.</p>';
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const title = appointmentTitleInput.value.trim();
        const date = appointmentDateInput.value;
        const time = appointmentTimeInput.value;
        const category = appointmentCategoryInput.value;
        const member = familyMemberSelect.value;
        const notes = appointmentNotesInput.value.trim();

        if (!title || !date || !time || !category || !member) return;

        let customerDetails = {};
        if (category === 'work') {
            customerDetails = {
                name: customerNameInput.value.trim(),
                address: customerAddressInput.value.trim(),
                phone: customerPhoneInput.value.trim(),
                details: customerAppointmentDetailsInput.value.trim()
            };
        }

        if (editMode.active) {
            // Update existing appointment
            const index = appointments.findIndex(a => a.id === editMode.appointmentId);
            if (index > -1) {
                appointments[index] = { ...appointments[index], title, date, time, category, member, notes, customerDetails };
            }
            editMode = { active: false, appointmentId: null };
            appointmentForm.querySelector('.add-btn').textContent = 'Termin hinzufügen';
        } else {
            // Add new appointment
            const newAppointment = {
                id: Date.now(),
                title,
                date,
                time,
                category,
                member,
                notes,
                completed: false,
                customerDetails
            };
            appointments.push(newAppointment);
        }

        saveState();
        renderAppointments(searchInput.value);
        appointmentForm.reset();
        customerNameInput.value = '';
        customerAddressInput.value = '';
        customerPhoneInput.value = '';
        customerAppointmentDetailsInput.value = '';
        customerDetailsSection.classList.add('hidden');
        setDefaultDateTime();
    };

    const handleListClick = (e) => {
        const target = e.target;
        const item = target.closest('.appointment-item');
        if (!item) return;
        const id = Number(item.dataset.id);

        if (target.closest('.delete-btn')) {
            if (confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
                appointments = appointments.filter(a => a.id !== id);
                saveState();
                renderAppointments(searchInput.value);
            }
        } else if (target.closest('.complete-btn')) {
            if (confirm('Sind Sie sicher, dass Sie diesen Termin als erledigt markieren möchten?')) {
                const index = appointments.findIndex(a => a.id === id);
                if (index > -1) appointments[index].completed = true;
                saveState();
                renderAppointments(searchInput.value);
            }
        } else if (target.closest('.edit-btn')) {
            const appToEdit = appointments.find(a => a.id === id);
            if (appToEdit) {
                appointmentTitleInput.value = appToEdit.title;
                appointmentDateInput.value = appToEdit.date;
                appointmentTimeInput.value = appToEdit.time;
                appointmentCategoryInput.value = appToEdit.category;
                familyMemberSelect.value = appToEdit.member;
                appointmentNotesInput.value = appToEdit.notes;

                if (appToEdit.category === 'work' && appToEdit.customerDetails) {
                    customerNameInput.value = appToEdit.customerDetails.name || '';
                    customerAddressInput.value = appToEdit.customerDetails.address || '';
                    customerPhoneInput.value = appToEdit.customerDetails.phone || '';
                    customerAppointmentDetailsInput.value = appToEdit.customerDetails.details || '';
                    customerDetailsSection.classList.remove('hidden');
                } else {
                    customerDetailsSection.classList.add('hidden');
                }

                editMode = { active: true, appointmentId: id };
                appointmentForm.querySelector('.add-btn').textContent = 'Termin speichern';
                appointmentTitleInput.focus();
            }
        } else {
            const appointment = appointments.find(a => a.id === id);
            if (appointment) {
                openModal(appointment);
            }
        }
    };

    const openModal = (appointment) => {
        const date = new Date(`${appointment.date}T${appointment.time}`);
        const formattedDate = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        let customerHtml = '';
        if (appointment.category === 'work' && appointment.customerDetails) {
            const address = appointment.customerDetails.address;
            const phone = appointment.customerDetails.phone;

            const addressHtml = address ? `<a href="https://www.google.com/maps?q=${encodeURIComponent(address)}" target="_blank" rel="noopener noreferrer">${address}</a>` : 'N/A';
            const phoneHtml = phone ? `<a href="tel:${phone}">${phone}</a>` : 'N/A';

            customerHtml = `
                <div class="customer-details-modal">
                    <h4>Kundeninformationen</h4>
                    <p><strong>Name:</strong> ${appointment.customerDetails.name || 'N/A'}</p>
                    <p><strong>Adresse:</strong> ${addressHtml}</p>
                    <p><strong>Telefon:</strong> ${phoneHtml}</p>
                    <p><strong>Details:</strong> ${appointment.customerDetails.details || 'N/A'}</p>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <h3>${appointment.title}</h3>
            <div class="meta-item">
                <i class="bi bi-person"></i>
                <p>${appointment.member}</p>
            </div>
            <div class="meta-item">
                <i class="bi bi-calendar-event"></i>
                <p>${formattedDate}</p>
            </div>
            <div class="meta-item">
                <i class="bi bi-clock"></i>
                <p>${formattedTime} Uhr</p>
            </div>
            <div class="meta-item">
                <i class="bi ${getCategoryIcon(appointment.category)}"></i>
                <p>${appointment.category.charAt(0).toUpperCase() + appointment.category.slice(1)}</p>
            </div>
            <div class="notes-section">
                <h4>Notizen:</h4>
                <p>${appointment.notes || 'Keine Notizen vorhanden.'}</p>
            </div>
            ${customerHtml}
        `;
        modalOverlay.classList.remove('hidden');
    };

    const closeModal = () => {
        modalOverlay.classList.add('hidden');
    };

    const handleTabClick = (e) => {
        const target = e.target.closest('.tab-btn');
        if (!target) return;

        document.querySelector('.tab-btn.active').classList.remove('active');
        target.classList.add('active');

        currentTab = target.dataset.tab;

        upcomingList.classList.add('hidden');
        workList.classList.add('hidden');
        completedList.classList.add('hidden');

        if (currentTab === 'upcoming') {
            upcomingList.classList.remove('hidden');
        } else if (currentTab === 'work') {
            workList.classList.remove('hidden');
        } else {
            completedList.classList.remove('hidden');
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        const newName = newMemberNameInput.value.trim();
        if (newName && !familyMembers.includes(newName)) {
            familyMembers.push(newName);
            saveState();
            renderFamilyMembers();
            familyMemberSelect.value = newName; // Select the new member
        }
        newMemberNameInput.value = '';
        addMemberForm.classList.add('hidden');
        appointmentForm.classList.remove('hidden');
    };

    const setDefaultDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        appointmentDateInput.value = now.toISOString().slice(0,10);
        appointmentTimeInput.value = now.toTimeString().slice(0,5);
    };

    // --- Event Listeners ---
    appointmentForm.addEventListener('submit', handleFormSubmit);
    upcomingList.addEventListener('click', handleListClick);
    workList.addEventListener('click', handleListClick);
    completedList.addEventListener('click', handleListClick);
    tabs.addEventListener('click', handleTabClick);
    searchInput.addEventListener('input', (e) => {
        renderAppointments(e.target.value);
    });
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    addMemberBtn.addEventListener('click', () => {
        addMemberForm.classList.remove('hidden');
        appointmentForm.classList.add('hidden');
        newMemberNameInput.focus();
    });

    cancelAddMemberBtn.addEventListener('click', () => {
        addMemberForm.classList.add('hidden');
        appointmentForm.classList.remove('hidden');
    });

    addMemberForm.addEventListener('submit', handleAddMember);

    appointmentCategoryInput.addEventListener('change', (e) => {
        if (e.target.value === 'work') {
            customerDetailsSection.classList.remove('hidden');
        } else {
            customerDetailsSection.classList.add('hidden');
        }
    });

    // --- Initialisation ---
    const init = () => {
        renderFamilyMembers();
        renderAppointments();
        setDefaultDateTime();
        updateDateTime();
        setInterval(updateDateTime, 1000);
    };



    init();
});
