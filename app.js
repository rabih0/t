document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentTitleInput = document.getElementById('appointment-title');
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentTimeInput = document.getElementById('appointment-time');
    const appointmentCategoryInput = document.getElementById('appointment-category');
    const familyMemberSelect = document.getElementById('family-member-select');
    
    const addMemberBtn = document.getElementById('add-member-btn');
    const addMemberForm = document.getElementById('add-member-form');
    const newMemberNameInput = document.getElementById('new-member-name');
    const cancelAddMemberBtn = document.getElementById('cancel-add-member');

    const nextAppointmentSection = document.getElementById('next-appointment-section');
    
    const tabs = document.querySelector('.tabs');
    const upcomingList = document.getElementById('upcoming-list');
    const completedList = document.getElementById('completed-list');

    // --- State ---
    let appointments = JSON.parse(localStorage.getItem('familyAppointments')) || [];
    let familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || ['Rabih Alahmad', 'Aischa Almuschhan', 'Nouralahuda Alahmad', 'Taim Alahmad'];
    let currentTab = 'upcoming';
    let editMode = { active: false, appointmentId: null };

    // --- Functions ---

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
            default: return 'bi-calendar-event';
        }
    };

    const renderAppointments = () => {
        upcomingList.innerHTML = '';
        completedList.innerHTML = '';

        const now = new Date();
        
        const upcoming = appointments.filter(a => !a.completed);
        const completed = appointments.filter(a => a.completed);

        // Sort upcoming appointments by date
        upcoming.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

        if (upcoming.length === 0) {
            upcomingList.innerHTML = '<li>Keine anstehenden Termine.</li>';
        } else {
            upcoming.forEach(app => upcomingList.appendChild(createAppointmentElement(app)));
        }

        if (completed.length === 0) {
            completedList.innerHTML = '<li>Keine erledigten Termine.</li>';
        } else {
            completed.forEach(app => completedList.appendChild(createAppointmentElement(app)));
        }
        
        updateNextAppointmentCard(upcoming);
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
                <button class="edit-btn"><i class="bi bi-pencil"></i></button>
                <button class="delete-btn"><i class="bi bi-trash"></i></button>
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

        if (!title || !date || !time || !category || !member) return;

        if (editMode.active) {
            // Update existing appointment
            const index = appointments.findIndex(a => a.id === editMode.appointmentId);
            if (index > -1) {
                appointments[index] = { ...appointments[index], title, date, time, category, member };
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
                completed: false,
            };
            appointments.push(newAppointment);
        }

        saveState();
        renderAppointments();
        appointmentForm.reset();
        setDefaultDateTime();
    };

    const handleListClick = (e) => {
        const target = e.target;
        const item = target.closest('.appointment-item');
        if (!item) return;
        const id = Number(item.dataset.id);

        if (target.closest('.delete-btn')) {
            appointments = appointments.filter(a => a.id !== id);
        } else if (target.closest('.complete-btn')) {
            const index = appointments.findIndex(a => a.id === id);
            if (index > -1) appointments[index].completed = true;
        } else if (target.closest('.edit-btn')) {
            const appToEdit = appointments.find(a => a.id === id);
            if (appToEdit) {
                appointmentTitleInput.value = appToEdit.title;
                appointmentDateInput.value = appToEdit.date;
                appointmentTimeInput.value = appToEdit.time;
                appointmentCategoryInput.value = appToEdit.category;
                familyMemberSelect.value = appToEdit.member;
                
                editMode = { active: true, appointmentId: id };
                appointmentForm.querySelector('.add-btn').textContent = 'Termin speichern';
                appointmentTitleInput.focus();
            }
            return; // Prevent re-rendering just yet
        }
        
        saveState();
        renderAppointments();
    };

    const handleTabClick = (e) => {
        const target = e.target.closest('.tab-btn');
        if (!target) return;

        document.querySelector('.tab-btn.active').classList.remove('active');
        target.classList.add('active');
        
        currentTab = target.dataset.tab;

        if (currentTab === 'upcoming') {
            upcomingList.classList.remove('hidden');
            completedList.classList.add('hidden');
        } else {
            upcomingList.classList.add('hidden');
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
    completedList.addEventListener('click', handleListClick);
    tabs.addEventListener('click', handleTabClick);

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

    // --- Initialisation ---
    const init = () => {
        renderFamilyMembers();
        renderAppointments();
        setDefaultDateTime();
    };

    init();
});
