// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Back button functionality
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Update datetime
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const dateTimeElement = document.getElementById('datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = now.toLocaleDateString('de-DE', options);
        }
    }
    
    // Update time every minute
    updateDateTime();
    setInterval(updateDateTime, 60000);
});