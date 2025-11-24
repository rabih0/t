// AI Assistant Integration
class AIAssistant {
    constructor() {
        this.isEnabled = false;
        this.apiKey = localStorage.getItem('aiApiKey') || '';
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.createAIInterface();
        this.bindEvents();
    }

    createAIInterface() {
        // Add AI assistant button to navigation
        const navSection = document.querySelector('.list-section .search-wrapper').parentElement;
        if (!document.getElementById('ai-assistant-btn') && navSection) {
            const aiButton = document.createElement('button');
            aiButton.id = 'ai-assistant-btn';
            aiButton.className = 'nav-btn';
            aiButton.innerHTML = '🤖 KI-Assistent';
            aiButton.style.marginBottom = '1rem';
            navSection.insertBefore(aiButton, navSection.firstChild);
        }

        // Create AI chat modal
        if (!document.getElementById('ai-chat-modal')) {
            const aiModal = document.createElement('div');
            aiModal.id = 'ai-chat-modal';
            aiModal.className = 'modal-overlay hidden';
            aiModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px; height: 70vh; display: flex; flex-direction: column;">
                    <button id="ai-modal-close" class="modal-close-btn">×</button>
                    <h3 style="color: var(--gold-start); margin-bottom: 1rem;">🤖 KI-Assistent</h3>
                    
                    <div id="ai-setup" class="ai-setup" style="display: ${this.apiKey ? 'none' : 'block'};">
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                            Verbinden Sie sich mit einem KI-Service für intelligente Terminvorschläge und Unterstützung.
                        </p>
                        <div class="form-row">
                            <select id="ai-provider">
                                <option value="">KI-Anbieter wählen</option>
                                <option value="gemini" selected>Google Gemini</option>
                                <option value="openai">OpenAI (ChatGPT)</option>
                                <option value="local">Lokale KI</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <input type="password" id="ai-api-key" placeholder="API-Schlüssel eingeben" value="${this.apiKey}">
                        </div>
                        <button id="ai-connect-btn" class="add-btn">Verbinden</button>
                    </div>

                    <div id="ai-chat" class="ai-chat" style="display: ${this.apiKey ? 'flex' : 'none'}; flex-direction: column; flex: 1;">
                        <div id="ai-chat-messages" style="
                            flex: 1; 
                            overflow-y: auto; 
                            padding: 1rem; 
                            background: var(--brown-glass); 
                            border-radius: var(--inner-radius); 
                            margin-bottom: 1rem;
                            max-height: 300px;
                        ">
                            <div class="ai-message ai-assistant">
                                <strong>🤖 KI-Assistent:</strong> Hallo! Ich kann Ihnen bei der Terminplanung helfen. Fragen Sie mich nach Terminvorschlägen, Optimierungen oder allgemeinen Tipps.
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <input type="text" id="ai-input" placeholder="Frage an die KI stellen..." style="flex: 1;">
                            <button id="ai-send-btn" class="icon-btn">📤</button>
                        </div>
                        
                        <div class="ai-quick-actions" style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                            <button class="ai-quick-btn" data-prompt="Analysiere meine Termine und gib Optimierungsvorschläge">📊 Termine analysieren</button>
                            <button class="ai-quick-btn" data-prompt="Schlage optimale Zeiten für neue Termine vor">⏰ Beste Zeiten</button>
                            <button class="ai-quick-btn" data-prompt="Erstelle eine Zusammenfassung meiner Woche">📋 Wochenzusammenfassung</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(aiModal);
        }
    }

    bindEvents() {
        // AI assistant button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-assistant-btn') {
                this.openAIChat();
            } else if (e.target.id === 'ai-modal-close') {
                this.closeAIChat();
            } else if (e.target.id === 'ai-connect-btn') {
                this.connectAI();
            } else if (e.target.id === 'ai-send-btn') {
                this.sendMessage();
            } else if (e.target.classList.contains('ai-quick-btn')) {
                this.sendQuickMessage(e.target.dataset.prompt);
            }
        });

        // Enter key in AI input
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'ai-input' && e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-chat-modal') {
                this.closeAIChat();
            }
        });
    }

    openAIChat() {
        document.getElementById('ai-chat-modal').classList.remove('hidden');
        if (this.apiKey) {
            document.getElementById('ai-input').focus();
        }
    }

    closeAIChat() {
        document.getElementById('ai-chat-modal').classList.add('hidden');
    }

    async connectAI() {
        const provider = document.getElementById('ai-provider').value;
        const apiKey = document.getElementById('ai-api-key').value.trim();

        if (!provider || !apiKey) {
            this.showAIMessage('Bitte wählen Sie einen Anbieter und geben Sie einen API-Schlüssel ein.', 'error');
            return;
        }

        // Test connection
        try {
            const testResult = await this.testConnection(provider, apiKey);
            if (testResult) {
                this.apiKey = apiKey;
                this.provider = provider;
                localStorage.setItem('aiApiKey', apiKey);
                localStorage.setItem('aiProvider', provider);
                
                document.getElementById('ai-setup').style.display = 'none';
                document.getElementById('ai-chat').style.display = 'flex';
                
                this.showAIMessage('✅ Erfolgreich mit KI verbunden!', 'success');
                this.isEnabled = true;
            }
        } catch (error) {
            this.showAIMessage('❌ Verbindung fehlgeschlagen. Überprüfen Sie Ihren API-Schlüssel.', 'error');
        }
    }

    async testConnection(provider, apiKey) {
        if (provider === 'gemini') {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Test' }] }]
                    })
                });
                return response.ok;
            } catch {
                return false;
            }
        }
        return apiKey.length > 10;
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessageToChat(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessageToChat(response, 'assistant');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessageToChat('Entschuldigung, es gab einen Fehler bei der Kommunikation mit der KI.', 'error');
        }
    }

    sendQuickMessage(prompt) {
        document.getElementById('ai-input').value = prompt;
        this.sendMessage();
    }

    async getAIResponse(message) {
        const appointments = window.appointmentsManager?.appointments || [];
        
        if (this.provider === 'gemini') {
            return await this.callGeminiAPI(message, appointments);
        } else {
            // Fallback to smart response
            return this.generateSmartResponse(message, appointments);
        }
    }
    
    async callGeminiAPI(message, appointments) {
        try {
            const context = this.buildAppointmentContext(appointments);
            const prompt = `Du bist ein KI-Assistent für einen Familienplaner. Hier ist der Kontext:

${context}

Benutzer fragt: ${message}

Antworte auf Deutsch, hilfreich und freundlich. Gib konkrete Tipps zur Terminplanung.`;
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Keine Antwort erhalten');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            return this.generateSmartResponse(message, appointments);
        }
    }
    
    buildAppointmentContext(appointments) {
        const now = new Date();
        const upcoming = appointments.filter(apt => !apt.completed && new Date(`${apt.date}T${apt.time}`) > now);
        const completed = appointments.filter(apt => apt.completed);
        
        return `Termine insgesamt: ${appointments.length}
Anstehende Termine: ${upcoming.length}
Erledigte Termine: ${completed.length}
Kategorien: ${[...new Set(appointments.map(apt => apt.category))].join(', ')}`;
    }

    buildContext(appointments, message) {
        const now = new Date();
        const upcomingAppointments = appointments
            .filter(apt => !apt.completed && new Date(`${apt.date}T${apt.time}`) > now)
            .slice(0, 10);

        return {
            totalAppointments: appointments.length,
            upcomingCount: upcomingAppointments.length,
            completedCount: appointments.filter(apt => apt.completed).length,
            categories: [...new Set(appointments.map(apt => apt.category))],
            members: [...new Set(appointments.map(apt => apt.member))],
            message: message
        };
    }

    generateSmartResponse(message, appointments) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('analys') || lowerMessage.includes('optimier')) {
            return this.generateAnalysisResponse(appointments);
        } else if (lowerMessage.includes('zeit') || lowerMessage.includes('wann')) {
            return this.generateTimeResponse(appointments);
        } else if (lowerMessage.includes('zusammenfassung') || lowerMessage.includes('woche')) {
            return this.generateSummaryResponse(appointments);
        } else if (lowerMessage.includes('vorschlag') || lowerMessage.includes('empfehlung')) {
            return this.generateSuggestionResponse(appointments);
        } else {
            return this.generateGeneralResponse(message, appointments);
        }
    }

    generateAnalysisResponse(appointments) {
        const now = new Date();
        const upcoming = appointments.filter(apt => !apt.completed && new Date(`${apt.date}T${apt.time}`) > now);
        const categories = {};
        
        appointments.forEach(apt => {
            categories[apt.category] = (categories[apt.category] || 0) + 1;
        });

        const mostCommon = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        
        return `📊 **Terminanalyse:**

• Gesamt: ${appointments.length} Termine
• Anstehend: ${upcoming.length} Termine
• Abgeschlossen: ${appointments.filter(apt => apt.completed).length} Termine

🏆 **Häufigste Kategorie:** ${mostCommon ? mostCommon[0] : 'Keine'} (${mostCommon ? mostCommon[1] : 0} Termine)

💡 **Empfehlung:** ${upcoming.length > 10 ? 'Sie haben viele anstehende Termine. Erwägen Sie eine Priorisierung.' : 'Ihre Terminlast ist gut managebar.'}`;
    }

    generateTimeResponse(appointments) {
        const timeSlots = {};
        appointments.forEach(apt => {
            const hour = parseInt(apt.time.split(':')[0]);
            const slot = hour < 12 ? 'Vormittag' : hour < 17 ? 'Nachmittag' : 'Abend';
            timeSlots[slot] = (timeSlots[slot] || 0) + 1;
        });

        const bestTime = Object.entries(timeSlots).sort((a, b) => a[1] - b[1])[0];
        
        return `⏰ **Optimale Terminzeiten:**

📈 **Ihre Präferenzen:**
${Object.entries(timeSlots).map(([time, count]) => `• ${time}: ${count} Termine`).join('\n')}

💡 **Empfehlung:** ${bestTime ? `${bestTime[0]} scheint weniger belegt zu sein. Neue Termine könnten hier gut passen.` : 'Verteilen Sie Termine gleichmäßig über den Tag.'}`;
    }

    generateSummaryResponse(appointments) {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= weekStart && aptDate <= weekEnd;
        });

        return `📋 **Wochenzusammenfassung:**

📅 **Diese Woche:** ${weekAppointments.length} Termine
✅ **Erledigt:** ${weekAppointments.filter(apt => apt.completed).length}
⏳ **Ausstehend:** ${weekAppointments.filter(apt => !apt.completed).length}

🎯 **Status:** ${weekAppointments.filter(apt => apt.completed).length / Math.max(weekAppointments.length, 1) * 100}% abgeschlossen

💪 **Motivation:** ${weekAppointments.filter(apt => apt.completed).length > weekAppointments.length / 2 ? 'Großartige Woche! Sie sind sehr produktiv.' : 'Bleiben Sie dran! Sie schaffen das.'}`;
    }

    generateSuggestionResponse(appointments) {
        const suggestions = [
            '🔔 Aktivieren Sie Erinnerungen für wichtige Termine',
            '📱 Nutzen Sie wiederkehrende Termine für regelmäßige Aufgaben',
            '🎨 Probieren Sie verschiedene Farbthemen aus',
            '📊 Exportieren Sie Ihre Daten regelmäßig als Backup',
            '⏰ Planen Sie Pufferzeiten zwischen Terminen ein'
        ];

        const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);

        return `💡 **Persönliche Empfehlungen:**

${randomSuggestions.map(suggestion => suggestion).join('\n\n')}

🚀 **Tipp:** Nutzen Sie die Suchfunktion, um schnell bestimmte Termine zu finden!`;
    }

    generateGeneralResponse(message, appointments) {
        const responses = [
            `Ich verstehe Ihre Frage zu "${message}". Mit ${appointments.length} Terminen in Ihrem System kann ich Ihnen bei der Organisation helfen.`,
            `Bezüglich "${message}" - lassen Sie mich Ihre Termine analysieren und passende Vorschläge machen.`,
            `Ihre Anfrage zu "${message}" ist interessant. Bei ${appointments.filter(apt => !apt.completed).length} anstehenden Terminen gibt es sicher Optimierungsmöglichkeiten.`
        ];

        return responses[Math.floor(Math.random() * responses.length)] + '\n\n💬 Stellen Sie spezifischere Fragen für detailliertere Hilfe!';
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${sender}`;
        
        const senderIcon = sender === 'user' ? '👤' : sender === 'assistant' ? '🤖' : '⚠️';
        const senderName = sender === 'user' ? 'Sie' : sender === 'assistant' ? 'KI-Assistent' : 'System';
        
        messageDiv.innerHTML = `
            <strong>${senderIcon} ${senderName}:</strong>
            <div style="margin-top: 0.5rem; white-space: pre-wrap;">${message}</div>
        `;
        
        messageDiv.style.cssText = `
            margin-bottom: 1rem;
            padding: 0.75rem;
            border-radius: var(--small-radius);
            background: ${sender === 'user' ? 'var(--glass-border)' : 'var(--glass-surface)'};
            color: var(--text-primary);
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.style.cssText = `
            padding: 0.75rem;
            color: var(--text-secondary);
            font-style: italic;
        `;
        indicator.textContent = '🤖 KI tippt...';
        
        document.getElementById('ai-chat-messages').appendChild(indicator);
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showAIMessage(message, type) {
        if (window.appointmentsManager) {
            window.appointmentsManager.showNotification(message);
        }
    }
}

// Add CSS for AI quick buttons
const aiStyles = document.createElement('style');
aiStyles.textContent = `
    .ai-quick-btn {
        padding: 0.5rem 0.75rem;
        background: var(--brown-glass);
        border: 1px solid var(--glass-border);
        border-radius: var(--small-radius);
        color: var(--text-primary);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .ai-quick-btn:hover {
        background: var(--glass-border);
        transform: scale(1.02);
    }
`;
document.head.appendChild(aiStyles);

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});