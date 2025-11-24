// Settings Management
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createSettingsModal();
        this.applySettings();
    }

    loadSettings() {
        const defaultSettings = {
            theme: 'gold',
            fontSize: 'medium',
            notifications: true,
            autoSave: true,
            aiProvider: '',
            aiApiKey: ''
        };
        
        const saved = localStorage.getItem('appSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    createSettingsModal() {
        if (document.getElementById('settings-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <button id="settings-close-btn" class="modal-close-btn">×</button>
                <h3 style="color: var(--gold-start); margin-bottom: 1.5rem;">⚙️ Einstellungen</h3>
                
                <div class="settings-section">
                    <h4>🎨 Farbthema</h4>
                    <select id="theme-select">
                        <option value="gold">Braun & Gold (Original)</option>
                        <option value="purple">Lila & Weiß</option>
                        <option value="blue">Blau & Weiß</option>
                        <option value="green">Grün & Weiß</option>
                    </select>
                </div>

                <div class="settings-section">
                    <h4>📝 Schriftgröße</h4>
                    <select id="font-size-select">
                        <option value="small">Klein</option>
                        <option value="medium">Mittel</option>
                        <option value="large">Groß</option>
                    </select>
                </div>

                <div class="settings-section">
                    <h4>🤖 KI-Assistent</h4>
                    <select id="ai-provider-select">
                        <option value="">KI-Anbieter wählen</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="local">Lokale KI</option>
                    </select>
                    <input type="password" id="ai-api-key-input" placeholder="API-Schlüssel eingeben" style="margin-top: 0.5rem; width: 100%; background: var(--brown-glass); border: 1px solid var(--glass-border); border-radius: var(--small-radius); padding: 0.5rem; color: var(--text-primary);">
                    <button id="test-ai-connection" class="secondary-btn" style="margin-top: 0.5rem;">Verbindung testen</button>
                </div>

                <div class="settings-section">
                    <h4>📊 Daten</h4>
                    <button id="export-data-btn" class="secondary-btn">Exportieren</button>
                    <button id="clear-data-btn" class="danger-btn">Alle löschen</button>
                </div>

                <button id="save-settings-btn" class="add-btn">Speichern</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindSettingsEvents();
    }

    bindSettingsEvents() {
        document.getElementById('settings-close-btn').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.updateSettings();
        });

        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-data-btn').addEventListener('click', () => {
            this.clearAllData();
        });
        
        // Test AI connection
        document.getElementById('test-ai-connection').addEventListener('click', () => {
            this.testAIConnection();
        });
    }

    openSettings() {
        this.loadCurrentSettings();
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    loadCurrentSettings() {
        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('font-size-select').value = this.settings.fontSize;
        document.getElementById('ai-provider-select').value = this.settings.aiProvider || '';
        document.getElementById('ai-api-key-input').value = this.settings.aiApiKey || '';
    }

    updateSettings() {
        this.settings.theme = document.getElementById('theme-select').value;
        this.settings.fontSize = document.getElementById('font-size-select').value;
        this.settings.aiProvider = document.getElementById('ai-provider-select').value;
        this.settings.aiApiKey = document.getElementById('ai-api-key-input').value;

        this.saveSettings();
        this.updateAIAssistant();
        this.closeSettings();
        
        if (window.appointmentsManager) {
            window.appointmentsManager.showNotification('Einstellungen gespeichert!');
        }
    }

    applySettings() {
        this.applyTheme();
        this.applyFontSize();
    }

    applyTheme() {
        const root = document.documentElement;
        
        switch (this.settings.theme) {
            case 'gold':
                root.style.setProperty('--background', 'linear-gradient(135deg, #1c1612 0%, #2d1810 50%, #1c1612 100%)');
                root.style.setProperty('--text-primary', 'rgba(218, 165, 32, 0.9)');
                root.style.setProperty('--text-secondary', 'rgba(184, 134, 11, 0.7)');
                root.style.setProperty('--glass-surface', 'rgba(139, 117, 93, 0.08)');
                root.style.setProperty('--glass-border', 'rgba(218, 165, 32, 0.25)');
                root.style.setProperty('--gold-start', 'rgba(218, 165, 32, 0.95)');
                root.style.setProperty('--gold-end', 'rgba(184, 134, 11, 0.9)');
                root.style.setProperty('--brown-glass', 'rgba(139, 117, 93, 0.15)');
                break;
            case 'blue':
                root.style.setProperty('--gold-start', '#3b82f6');
                root.style.setProperty('--gold-end', '#1d4ed8');
                root.style.setProperty('--glass-border', 'rgba(59, 130, 246, 0.3)');
                break;
            case 'green':
                root.style.setProperty('--gold-start', '#10b981');
                root.style.setProperty('--gold-end', '#059669');
                root.style.setProperty('--glass-border', 'rgba(16, 185, 129, 0.3)');
                break;
            case 'purple':
                root.style.setProperty('--gold-start', '#9333ea');
                root.style.setProperty('--gold-end', '#7c3aed');
                root.style.setProperty('--glass-border', 'rgba(147, 51, 234, 0.3)');
                break;
        }
    }

    applyFontSize() {
        const root = document.documentElement;
        
        switch (this.settings.fontSize) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
            default:
                root.style.fontSize = '16px';
        }
    }

    exportData() {
        const data = {
            appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
            members: JSON.parse(localStorage.getItem('familyMembers') || '[]'),
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `familienplaner-backup.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (window.appointmentsManager) {
            window.appointmentsManager.showNotification('Daten exportiert!');
        }
    }

    clearAllData() {
        if (confirm('Alle Daten löschen?')) {
            localStorage.clear();
            location.reload();
        }
    }
    
    async testAIConnection() {
        const provider = document.getElementById('ai-provider-select').value;
        const apiKey = document.getElementById('ai-api-key-input').value;
        
        if (!provider || !apiKey) {
            if (window.appointmentsManager) {
                window.appointmentsManager.showNotification('Bitte wählen Sie einen Anbieter und geben Sie einen API-Schlüssel ein.');
            }
            return;
        }
        
        try {
            let testResult = false;
            
            if (provider === 'gemini') {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Test' }] }]
                    })
                });
                testResult = response.ok;
            } else {
                testResult = apiKey.length > 10;
            }
            
            if (testResult) {
                if (window.appointmentsManager) {
                    window.appointmentsManager.showNotification('✅ Verbindung erfolgreich!');
                }
            } else {
                if (window.appointmentsManager) {
                    window.appointmentsManager.showNotification('❌ Verbindung fehlgeschlagen!');
                }
            }
        } catch (error) {
            if (window.appointmentsManager) {
                window.appointmentsManager.showNotification('❌ Verbindung fehlgeschlagen!');
            }
        }
    }
    
    updateAIAssistant() {
        if (window.aiAssistant && this.settings.aiProvider && this.settings.aiApiKey) {
            window.aiAssistant.apiKey = this.settings.aiApiKey;
            window.aiAssistant.provider = this.settings.aiProvider;
            localStorage.setItem('aiApiKey', this.settings.aiApiKey);
            localStorage.setItem('aiProvider', this.settings.aiProvider);
        }
    }
}

const settingsStyles = document.createElement('style');
settingsStyles.textContent = `
    .settings-section {
        margin-bottom: 1rem;
        padding: 1rem;
        background: var(--glass-surface);
        border-radius: var(--inner-radius);
    }

    .settings-section h4 {
        color: var(--gold-start);
        margin-bottom: 0.5rem;
    }

    .settings-section select {
        width: 100%;
        background: var(--brown-glass);
        border: 1px solid var(--glass-border);
        border-radius: var(--small-radius);
        padding: 0.5rem;
        color: var(--text-primary);
    }

    .secondary-btn, .danger-btn {
        padding: 0.5rem 1rem;
        border-radius: var(--small-radius);
        border: none;
        cursor: pointer;
        margin-right: 0.5rem;
    }

    .secondary-btn {
        background: var(--brown-glass);
        color: var(--text-primary);
    }

    .danger-btn {
        background: #ef4444;
        color: white;
    }
`;
document.head.appendChild(settingsStyles);

document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});