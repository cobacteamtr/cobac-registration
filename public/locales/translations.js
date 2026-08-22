window.TRANSLATIONS = {};

// Default language (change or make dynamic as needed)
window.currentLang = window.currentLang || 'tr';

// Global translation function for Alpine.js x-text="t('key')"
window.t = function(key) {
    const langData = window.TRANSLATIONS[window.currentLang] || {};
    return langData[key] || key; // Falls back to the key name if missing
};
