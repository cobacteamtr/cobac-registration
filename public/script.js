// ==========================================
// 1. SAFE LOCALSTORAGE WRAPPER
// ==========================================
const safeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error("Storage access error:", e);
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error("Storage write error:", e);
        }
    },
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error("Storage delete error:", e);
        }
    }
};

// ==========================================
// 2. SECURITY & VALIDATION MODULES
// ==========================================
const VALIDATION_REGEX = {
    // Allows letters, spaces, hyphens, and apostrophes (supports international names)
    name: /^[\p{L}\s'-]{2,50}$/u,

    // Standard RFC-compliant email pattern check
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // International phone number check (allows optional + and digits, spaces, dashes)
    phone: /^\+?[0-9\s\-()]{7,20}$/,

    // City / Country text check (supports letters, spaces, commas, periods, hyphens)
    cityCountry: /^[\p{L}\s,.-]{2,100}$/u
};

/**
 * Sanitizes generic string inputs by trimming and escaping HTML special characters.
 */
function sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

/**
 * Specifically sanitizes and normalizes email inputs.
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

/**
 * Sanitizes phone numbers by keeping only valid structural characters.
 */
function sanitizePhone(phone) {
    if (typeof phone !== 'string') return '';
    return phone.replace(/[^\+\d\s\-()]/g, '').trim();
}

/**
 * Sanitizes the complete form payload object.
 */
function sanitizeFormData(data) {
    return {
        name: sanitizeString(data.name),
        cityCountry: sanitizeString(data.cityCountry),
        email: sanitizeEmail(data.email),
        phone: sanitizePhone(data.phone),
        job: sanitizeString(data.job || ''), // Handled safely even if left blank
        company: sanitizeString(data.company),
        invoiceAddress: sanitizeString(data.invoiceAddress),
        membership: sanitizeString(data.membership),
        source: sanitizeString(data.source)
    };
}

// ==========================================
// 3. ALPINE.JS FORM CONTROLLER COMPONENT
// ==========================================
function cobacForm() {
    return {
        currentStep: 1,
        submitted: false,
        kvkkAccepted: false,

        // Internationalization State
        currentLang: safeStorage.getItem('cobac_lang') || 'en',

        switchLanguage(lang) {
            this.currentLang = lang;
            safeStorage.setItem('cobac_lang', lang);
        },

        t(key) {
            if (window.TRANSLATIONS && window.TRANSLATIONS[this.currentLang] && window.TRANSLATIONS[this.currentLang][key]) {
                return window.TRANSLATIONS[this.currentLang][key];
            }
            return key; // Fallback
        },

        formData: {
            name: '',
            cityCountry: '',
            email: '',
            phone: '',
            job: '',
            company: '',
            invoiceAddress: '',
            membership: 'day_pass',
            source: '',
            photoConsent: false // Added photo & video consent state
        },

        init() {
            // Load drafts from localStorage safely
            const savedDraft = safeStorage.getItem('cobac_form_draft_red');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    // Merge to ensure backward compatibility with older saved drafts missing photoConsent
                    this.formData = {...this.formData, ...parsed };
                } catch (e) {
                    console.error("Draft parse error:", e);
                }
            }

            // Auto-save watch
            this.$watch('formData', (value) => {
                safeStorage.setItem('cobac_form_draft_red', JSON.stringify(value));
            }, { deep: true });
        },

        getStepTitle() {
            switch (this.currentStep) {
                case 1:
                    return 'Personal Details';
                case 2:
                    return 'Job & Billing';
                case 3:
                    return 'Membership Selection';
                default:
                    return '';
            }
        },

        nextStep() {
            if (this.currentStep === 1) {
                if (!this.formData.name || !this.formData.cityCountry || !this.formData.email || !this.formData.phone) {
                    alert("Please fill out all required fields (*).");
                    return;
                }
                if (!VALIDATION_REGEX.name.test(this.formData.name)) {
                    alert("Please enter a valid name (2-50 characters, letters only).");
                    return;
                }
                if (!VALIDATION_REGEX.cityCountry.test(this.formData.cityCountry)) {
                    alert("Please enter a valid city or country name.");
                    return;
                }
                if (!VALIDATION_REGEX.email.test(this.formData.email)) {
                    alert("Please enter a valid email address format.");
                    return;
                }
                if (!VALIDATION_REGEX.phone.test(this.formData.phone)) {
                    alert("Please enter a valid phone number.");
                    return;
                }
            } else if (this.currentStep === 2) {
                if (!this.formData.invoiceAddress) {
                    alert("Please enter your invoice address.");
                    return;
                }
            }

            if (this.currentStep < 3) {
                this.currentStep++;
            }
        },

        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        },

        getMembershipLabel(code) {
            const labels = {
                'day_pass': 'Day Pass',
                'hot_desk': 'Hot Desk',
                'dedicated_desk': 'Dedicated Desk',
                'virtual_office': 'Virtual Office',
                'private_office': 'Private Office',
                'flexi_membership': 'Flexi Membership'
            };
            return labels[code] || code;
        },

        getTodayDate() {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const locale = this.currentLang === 'tr' ? 'tr-TR' : 'en-US';
            return new Date().toLocaleDateString(locale, options);
        },

        async submitForm() {
            if (!this.kvkkAccepted) {
                alert("Please accept the terms of membership & privacy policy.");
                return;
            }

            // Sanitize string fields before final payload execution
            const cleanedData = sanitizeFormData(this.formData);

            // Re-attach boolean consent fields safely
            const payload = {
                ...cleanedData,
                photoConsent: Boolean(this.formData.photoConsent)
            };

            try {
                let endpoint = '/api/submit-form';
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    endpoint = 'http://localhost:3327/api/submit-form';
                } else {
                    endpoint = '/api/submit-form';                }
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.success) {
                    this.submitted = true;
                    // Clear saved draft on success
                    safeStorage.removeItem('cobac_form_draft_red');
                } else {
                    alert("Submission failed: " + (result.error || "Please try again."));
                }
            } catch (error) {
                console.error("Network or server connection error:", error);
                alert("Could not reach the server. Please ensure your backend service is running.");
            }
        },

        resetForm() {
            this.formData = {
                name: '',
                cityCountry: '',
                email: '',
                phone: '',
                job: '',
                company: '',
                invoiceAddress: '',
                membership: 'day_pass',
                source: '',
                photoConsent: false
            };
            this.currentStep = 1;
            this.submitted = false;
            this.kvkkAccepted = false;
            safeStorage.removeItem('cobac_form_draft_red');
        }
    };
}