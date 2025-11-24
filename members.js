// Members management functionality
class MembersManager {
    constructor() {
        this.members = JSON.parse(localStorage.getItem('familyMembers')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateMemberSelect();
        this.renderMembersList();
    }

    bindEvents() {
        // Add member button
        document.getElementById('add-member-btn')?.addEventListener('click', () => {
            this.showAddMemberForm();
        });

        // Cancel add member
        document.getElementById('cancel-add-member')?.addEventListener('click', () => {
            this.hideAddMemberForm();
        });

        // Add member form submit
        document.getElementById('add-member-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMember();
        });

        // Show members list
        document.getElementById('show-members-btn')?.addEventListener('click', () => {
            this.toggleMembersList();
        });

        // Close members list
        document.getElementById('manage-members-btn')?.addEventListener('click', () => {
            this.hideMembersList();
        });
    }

    showAddMemberForm() {
        document.getElementById('add-member-form').classList.remove('hidden');
        document.getElementById('new-member-name').focus();
    }

    hideAddMemberForm() {
        document.getElementById('add-member-form').classList.add('hidden');
        document.getElementById('new-member-name').value = '';
    }

    toggleMembersList() {
        const membersList = document.getElementById('members-list');
        membersList.classList.toggle('hidden');
        this.renderMembersList();
    }

    hideMembersList() {
        document.getElementById('members-list').classList.add('hidden');
    }

    addMember() {
        const nameInput = document.getElementById('new-member-name');
        const name = nameInput.value.trim();
        
        if (name && !this.members.includes(name)) {
            this.members.push(name);
            this.saveMembers();
            this.updateMemberSelect();
            this.renderMembersList();
            this.hideAddMemberForm();
        }
    }

    editMember(oldName, newName) {
        const index = this.members.indexOf(oldName);
        if (index !== -1 && newName.trim() && !this.members.includes(newName.trim())) {
            this.members[index] = newName.trim();
            this.saveMembers();
            this.updateMemberSelect();
            this.renderMembersList();
        }
    }

    deleteMember(name) {
        if (confirm(`Person "${name}" wirklich löschen?`)) {
            this.members = this.members.filter(member => member !== name);
            this.saveMembers();
            this.updateMemberSelect();
            this.renderMembersList();
        }
    }

    updateMemberSelect() {
        const select = document.getElementById('family-member-select');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Add members as options
        this.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            select.appendChild(option);
        });
    }

    renderMembersList() {
        const container = document.getElementById('members-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.members.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Keine Personen hinzugefügt</p>';
            return;
        }

        this.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <span class="member-name">${member}</span>
                <div class="member-actions">
                    <button onclick="membersManager.editMemberPrompt('${member}')" title="Bearbeiten">✏️</button>
                    <button onclick="membersManager.deleteMember('${member}')" class="delete-btn" title="Löschen">🗑️</button>
                </div>
            `;
            container.appendChild(memberItem);
        });
    }

    editMemberPrompt(oldName) {
        const newName = prompt(`Name bearbeiten:`, oldName);
        if (newName !== null) {
            this.editMember(oldName, newName);
        }
    }

    saveMembers() {
        localStorage.setItem('familyMembers', JSON.stringify(this.members));
    }
}

// Initialize members manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.membersManager = new MembersManager();
});