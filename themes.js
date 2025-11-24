// Theme Management System
class ThemeManager {
    constructor() {
        this.themes = {
            'brown-gold': {
                name: 'Braun & Gold (Standard)',
                colors: {
                    '--background': '#1c1612',
                    '--text-primary': 'rgba(218, 165, 32, 0.9)',
                    '--text-secondary': 'rgba(184, 134, 11, 0.7)',
                    '--glass-surface': 'rgba(139, 117, 93, 0.08)',
                    '--glass-border': 'rgba(218, 165, 32, 0.25)',
                    '--gold-start': 'rgba(218, 165, 32, 0.95)',
                    '--gold-end': 'rgba(184, 134, 11, 0.9)',
                    '--brown-glass': 'rgba(139, 117, 93, 0.15)',
                    '--rose-color': 'rgba(205, 133, 63, 0.8)'
                }
            },
            'blue-silver': {
                name: 'Blau & Silber',
                colors: {
                    '--background': '#0f1419',
                    '--text-primary': 'rgba(135, 206, 235, 0.9)',
                    '--text-secondary': 'rgba(70, 130, 180, 0.7)',
                    '--glass-surface': 'rgba(70, 130, 180, 0.08)',
                    '--glass-border': 'rgba(135, 206, 235, 0.25)',
                    '--gold-start': 'rgba(135, 206, 235, 0.95)',
                    '--gold-end': 'rgba(70, 130, 180, 0.9)',
                    '--brown-glass': 'rgba(70, 130, 180, 0.15)',
                    '--rose-color': 'rgba(255, 99, 132, 0.8)'
                }
            },
            'green-emerald': {
                name: 'Grün & Smaragd',
                colors: {
                    '--background': '#0d1b0d',
                    '--text-primary': 'rgba(144, 238, 144, 0.9)',
                    '--text-secondary': 'rgba(34, 139, 34, 0.7)',
                    '--glass-surface': 'rgba(34, 139, 34, 0.08)',
                    '--glass-border': 'rgba(144, 238, 144, 0.25)',
                    '--gold-start': 'rgba(144, 238, 144, 0.95)',
                    '--gold-end': 'rgba(34, 139, 34, 0.9)',
                    '--brown-glass': 'rgba(34, 139, 34, 0.15)',
                    '--rose-color': 'rgba(255, 105, 180, 0.8)'
                }
            },
            'purple-violet': {
                name: 'Lila & Violett',
                colors: {
                    '--background': '#1a0d1a',
                    '--text-primary': 'rgba(186, 85, 211, 0.9)',
                    '--text-secondary': 'rgba(138, 43, 226, 0.7)',
                    '--glass-surface': 'rgba(138, 43, 226, 0.08)',
                    '--glass-border': 'rgba(186, 85, 211, 0.25)',
                    '--gold-start': 'rgba(186, 85, 211, 0.95)',
                    '--gold-end': 'rgba(138, 43, 226, 0.9)',
                    '--brown-glass': 'rgba(138, 43, 226, 0.15)',
                    '--rose-color': 'rgba(255, 20, 147, 0.8)'
                }
            },
            'red-crimson': {
                name: 'Rot & Karmesin',
                colors: {
                    '--background': '#1a0a0a',
                    '--text-primary': 'rgba(220, 20, 60, 0.9)',
                    '--text-secondary': 'rgba(178, 34, 34, 0.7)',
                    '--glass-surface': 'rgba(178, 34, 34, 0.08)',
                    '--glass-border': 'rgba(220, 20, 60, 0.25)',
                    '--gold-start': 'rgba(220, 20, 60, 0.95)',
                    '--gold-end': 'rgba(178, 34, 34, 0.9)',
                    '--brown-glass': 'rgba(178, 34, 34, 0.15)',
                    '--rose-color': 'rgba(255, 69, 0, 0.8)'
                }
            }
        };
        
        this.currentTheme = localStorage.getItem('selectedTheme') || 'brown-gold';
        this.darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeSelector();
        this.bindEvents();
    }

    createThemeSelector() {
        // Add theme selector to settings
        if (document.getElementById('theme-selector')) return;

        const themeSection = document.createElement('div');
        themeSection.id = 'theme-selector';
        themeSection.className = 'members-list';
        themeSection.style.marginTop = '1rem';
        themeSection.innerHTML = `
            <h3>🎨 Design-Einstellungen</h3>
            <div class="form-row">
                <select id="theme-select">
                    ${Object.entries(this.themes).map(([key, theme]) => 
                        `<option value="${key}" ${key === this.currentTheme ? 'selected' : ''}>${theme.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-row">
                <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                    <input type="checkbox" id="dark-mode-toggle" ${this.darkMode ? 'checked' : ''}>
                    🌙 Dunkler Modus
                </label>
            </div>
            <div class="form-row">
                <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                    Textgröße:
                    <input type="range" id="font-size-slider" min="12" max="20" value="${this.getFontSize()}" style="flex: 1;">
                    <span id="font-size-display">${this.getFontSize()}px</span>
                </label>
            </div>
        `;

        // Add to main container
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(themeSection);
        }
    }

    bindEvents() {
        document.addEventListener('change', (e) => {
            if (e.target.id === 'theme-select') {
                this.changeTheme(e.target.value);
            } else if (e.target.id === 'dark-mode-toggle') {
                this.toggleDarkMode(e.target.checked);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'font-size-slider') {
                this.changeFontSize(e.target.value);
            }
        });
    }

    applyTheme(themeKey) {
        const theme = this.themes[themeKey];
        if (!theme) return;

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        this.currentTheme = themeKey;
        localStorage.setItem('selectedTheme', themeKey);
    }

    changeTheme(themeKey) {
        this.applyTheme(themeKey);
        
        // Show notification
        const themeName = this.themes[themeKey]?.name || themeKey;
        if (window.appointmentsManager) {
            window.appointmentsManager.showNotification(`Design geändert zu: ${themeName}`);
        }
    }

    toggleDarkMode(enabled) {
        this.darkMode = enabled;
        localStorage.setItem('darkMode', JSON.stringify(enabled));

        const root = document.documentElement;
        if (enabled) {
            // Make background darker
            const currentBg = getComputedStyle(root).getPropertyValue('--background');
            root.style.setProperty('--background', this.darkenColor(currentBg));
            
            // Increase glass opacity
            root.style.setProperty('--glass-surface', 'rgba(0, 0, 0, 0.3)');
        } else {
            // Restore original theme
            this.applyTheme(this.currentTheme);
        }

        if (window.appointmentsManager) {
            window.appointmentsManager.showNotification(`Dunkler Modus ${enabled ? 'aktiviert' : 'deaktiviert'}`);
        }
    }

    darkenColor(color) {
        // Simple color darkening - can be enhanced
        if (color.includes('#')) {
            return color.replace(/[0-9a-f]/gi, (match) => {
                const num = parseInt(match, 16);
                return Math.max(0, num - 2).toString(16);
            });
        }
        return color;
    }

    getFontSize() {
        return parseInt(localStorage.getItem('fontSize')) || 16;
    }

    changeFontSize(size) {
        document.documentElement.style.fontSize = size + 'px';
        localStorage.setItem('fontSize', size);
        
        const display = document.getElementById('font-size-display');
        if (display) {
            display.textContent = size + 'px';
        }

        if (window.appointmentsManager) {
            window.appointmentsManager.showNotification(`Textgröße: ${size}px`);
        }
    }

    // Apply saved font size on load
    applySavedFontSize() {
        const savedSize = this.getFontSize();
        document.documentElement.style.fontSize = savedSize + 'px';
    }
}

// Initialize theme manager
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.themeManager.applySavedFontSize();
});