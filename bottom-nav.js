// Bottom Navigation Component
class BottomNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.createBottomNav();
        this.updateActiveState();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('appointments.html')) return 'appointments';
        if (path.includes('index.html') || path === '/') return 'home';
        return 'home';
    }

    createBottomNav() {
        // Check if bottom nav already exists
        if (document.getElementById('bottom-nav')) return;

        const bottomNav = document.createElement('div');
        bottomNav.id = 'bottom-nav';
        bottomNav.className = 'bottom-navigation';
        bottomNav.innerHTML = `
            <a href="index.html" class="nav-item" data-page="home">
                <i class="bi bi-house-fill"></i>
                <span>Startseite</span>
            </a>
            <a href="appointments.html" class="nav-item" data-page="appointments">
                <i class="bi bi-calendar-fill"></i>
                <span>Alle Termine</span>
            </a>
            <button class="nav-item" id="nav-members-btn" data-page="members">
                <i class="bi bi-people-fill"></i>
                <span>Personen</span>
            </button>
            <button class="nav-item" id="nav-ai-btn" data-page="ai">
                <i class="bi bi-robot"></i>
                <span>KI-Assistent</span>
            </button>
            <button class="nav-item" id="nav-settings-btn" data-page="settings">
                <i class="bi bi-gear-fill"></i>
                <span>Einstellungen</span>
            </button>
        `;

        document.body.appendChild(bottomNav);
        this.bindEvents();
    }

    bindEvents() {
        // Members button
        document.getElementById('nav-members-btn').addEventListener('click', () => {
            if (window.membersManager) {
                window.membersManager.toggleMembersList();
            }
        });

        // AI Assistant button
        document.getElementById('nav-ai-btn').addEventListener('click', () => {
            if (window.aiAssistant) {
                window.aiAssistant.openAIChat();
            }
        });
        
        // Settings button
        document.getElementById('nav-settings-btn').addEventListener('click', () => {
            if (window.settingsManager) {
                window.settingsManager.openSettings();
            }
        });
    }

    updateActiveState() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }
}

// Add CSS for bottom navigation
const bottomNavStyles = document.createElement('style');
bottomNavStyles.textContent = `
    .bottom-navigation {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--glass-surface);
        backdrop-filter: blur(20px);
        border-top: 1px solid var(--glass-border);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: env(safe-area-inset-bottom, 0.5rem) 0.5rem 0.5rem 0.5rem;
        z-index: 1000;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem;
        border-radius: var(--small-radius);
        text-decoration: none;
        color: var(--text-secondary);
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 60px;
        font-size: 0.75rem;
        font-family: var(--font-family);
    }

    .nav-item i {
        font-size: 1.2rem;
    }

    .nav-item:hover,
    .nav-item.active {
        color: var(--gold-start);
        background: var(--brown-glass);
        transform: translateY(-2px);
    }

    .nav-item span {
        font-size: 0.7rem;
        font-weight: 500;
    }

    /* Adjust container padding for bottom nav */
    .container {
        padding-bottom: calc(env(safe-area-inset-bottom, 0.5rem) + 80px) !important;
    }

    @media (max-width: 480px) {
        .nav-item span {
            font-size: 0.65rem;
        }
        
        .nav-item i {
            font-size: 1.1rem;
        }
    }
`;
document.head.appendChild(bottomNavStyles);

// Initialize bottom navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bottomNavigation = new BottomNavigation();
});