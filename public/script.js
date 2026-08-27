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
// Comprehensive World Country Codes Array (Flag & Dial Code only)
const COUNTRY_CODES = [
    { code: "AF", dial_code: "+93", flag: "https://flagcdn.com/w40/af.png" },
    { code: "AL", dial_code: "+355", flag: "https://flagcdn.com/w40/al.png" },
    { code: "DZ", dial_code: "+213", flag: "https://flagcdn.com/w40/dz.png" },
    { code: "AD", dial_code: "+376", flag: "https://flagcdn.com/w40/ad.png" },
    { code: "AO", dial_code: "+244", flag: "https://flagcdn.com/w40/ao.png" },
    { code: "AR", dial_code: "+54", flag: "https://flagcdn.com/w40/ar.png" },
    { code: "AM", dial_code: "+374", flag: "https://flagcdn.com/w40/am.png" },
    { code: "AU", dial_code: "+61", flag: "https://flagcdn.com/w40/au.png" },
    { code: "AT", dial_code: "+43", flag: "https://flagcdn.com/w40/at.png" },
    { code: "AZ", dial_code: "+994", flag: "https://flagcdn.com/w40/az.png" },

    { code: "BH", dial_code: "+973", flag: "https://flagcdn.com/w40/bh.png" },
    { code: "BD", dial_code: "+880", flag: "https://flagcdn.com/w40/bd.png" },
    { code: "BY", dial_code: "+375", flag: "https://flagcdn.com/w40/by.png" },
    { code: "BE", dial_code: "+32", flag: "https://flagcdn.com/w40/be.png" },
    { code: "BZ", dial_code: "+501", flag: "https://flagcdn.com/w40/bz.png" },
    { code: "BJ", dial_code: "+229", flag: "https://flagcdn.com/w40/bj.png" },
    { code: "BO", dial_code: "+591", flag: "https://flagcdn.com/w40/bo.png" },
    { code: "BA", dial_code: "+387", flag: "https://flagcdn.com/w40/ba.png" },
    { code: "BR", dial_code: "+55", flag: "https://flagcdn.com/w40/br.png" },
    { code: "BG", dial_code: "+359", flag: "https://flagcdn.com/w40/bg.png" },

    { code: "CA", dial_code: "+1", flag: "https://flagcdn.com/w40/ca.png" },
    { code: "CL", dial_code: "+56", flag: "https://flagcdn.com/w40/cl.png" },
    { code: "CN", dial_code: "+86", flag: "https://flagcdn.com/w40/cn.png" },
    { code: "CO", dial_code: "+57", flag: "https://flagcdn.com/w40/co.png" },
    { code: "CR", dial_code: "+506", flag: "https://flagcdn.com/w40/cr.png" },
    { code: "HR", dial_code: "+385", flag: "https://flagcdn.com/w40/hr.png" },
    { code: "CY", dial_code: "+357", flag: "https://flagcdn.com/w40/cy.png" },
    { code: "CZ", dial_code: "+420", flag: "https://flagcdn.com/w40/cz.png" },

    { code: "DK", dial_code: "+45", flag: "https://flagcdn.com/w40/dk.png" },
    { code: "DO", dial_code: "+1", flag: "https://flagcdn.com/w40/do.png" },
    { code: "EC", dial_code: "+593", flag: "https://flagcdn.com/w40/ec.png" },
    { code: "EG", dial_code: "+20", flag: "https://flagcdn.com/w40/eg.png" },
    { code: "EE", dial_code: "+372", flag: "https://flagcdn.com/w40/ee.png" },

    { code: "FI", dial_code: "+358", flag: "https://flagcdn.com/w40/fi.png" },
    { code: "FR", dial_code: "+33", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "GE", dial_code: "+995", flag: "https://flagcdn.com/w40/ge.png" },
    { code: "DE", dial_code: "+49", flag: "https://flagcdn.com/w40/de.png" },
    { code: "GR", dial_code: "+30", flag: "https://flagcdn.com/w40/gr.png" },

    { code: "HK", dial_code: "+852", flag: "https://flagcdn.com/w40/hk.png" },
    { code: "HU", dial_code: "+36", flag: "https://flagcdn.com/w40/hu.png" },
    { code: "IS", dial_code: "+354", flag: "https://flagcdn.com/w40/is.png" },
    { code: "IN", dial_code: "+91", flag: "https://flagcdn.com/w40/in.png" },
    { code: "ID", dial_code: "+62", flag: "https://flagcdn.com/w40/id.png" },
    { code: "IR", dial_code: "+98", flag: "https://flagcdn.com/w40/ir.png" },
    { code: "IQ", dial_code: "+964", flag: "https://flagcdn.com/w40/iq.png" },
    { code: "IE", dial_code: "+353", flag: "https://flagcdn.com/w40/ie.png" },
    { code: "IL", dial_code: "+972", flag: "https://flagcdn.com/w40/il.png" },
    { code: "IT", dial_code: "+39", flag: "https://flagcdn.com/w40/it.png" },

    { code: "JP", dial_code: "+81", flag: "https://flagcdn.com/w40/jp.png" },
    { code: "JO", dial_code: "+962", flag: "https://flagcdn.com/w40/jo.png" },
    { code: "KZ", dial_code: "+7", flag: "https://flagcdn.com/w40/kz.png" },
    { code: "KE", dial_code: "+254", flag: "https://flagcdn.com/w40/ke.png" },
    { code: "KW", dial_code: "+965", flag: "https://flagcdn.com/w40/kw.png" },

    { code: "LV", dial_code: "+371", flag: "https://flagcdn.com/w40/lv.png" },
    { code: "LB", dial_code: "+961", flag: "https://flagcdn.com/w40/lb.png" },
    { code: "LY", dial_code: "+218", flag: "https://flagcdn.com/w40/ly.png" },
    { code: "LT", dial_code: "+370", flag: "https://flagcdn.com/w40/lt.png" },
    { code: "LU", dial_code: "+352", flag: "https://flagcdn.com/w40/lu.png" },

    { code: "MY", dial_code: "+60", flag: "https://flagcdn.com/w40/my.png" },
    { code: "MX", dial_code: "+52", flag: "https://flagcdn.com/w40/mx.png" },
    { code: "MA", dial_code: "+212", flag: "https://flagcdn.com/w40/ma.png" },
    { code: "NL", dial_code: "+31", flag: "https://flagcdn.com/w40/nl.png" },
    { code: "NZ", dial_code: "+64", flag: "https://flagcdn.com/w40/nz.png" },
    { code: "NG", dial_code: "+234", flag: "https://flagcdn.com/w40/ng.png" },
    { code: "NO", dial_code: "+47", flag: "https://flagcdn.com/w40/no.png" },
    { code: "OM", dial_code: "+968", flag: "https://flagcdn.com/w40/om.png" },

    { code: "PK", dial_code: "+92", flag: "https://flagcdn.com/w40/pk.png" },
    { code: "PS", dial_code: "+970", flag: "https://flagcdn.com/w40/ps.png" },
    { code: "PH", dial_code: "+63", flag: "https://flagcdn.com/w40/ph.png" },
    { code: "PL", dial_code: "+48", flag: "https://flagcdn.com/w40/pl.png" },
    { code: "PT", dial_code: "+351", flag: "https://flagcdn.com/w40/pt.png" },
    { code: "QA", dial_code: "+974", flag: "https://flagcdn.com/w40/qa.png" },
    { code: "RO", dial_code: "+40", flag: "https://flagcdn.com/w40/ro.png" },
    { code: "RU", dial_code: "+7", flag: "https://flagcdn.com/w40/ru.png" },

    { code: "SA", dial_code: "+966", flag: "https://flagcdn.com/w40/sa.png" },
    { code: "SG", dial_code: "+65", flag: "https://flagcdn.com/w40/sg.png" },
    { code: "SK", dial_code: "+421", flag: "https://flagcdn.com/w40/sk.png" },
    { code: "SI", dial_code: "+386", flag: "https://flagcdn.com/w40/si.png" },
    { code: "ZA", dial_code: "+27", flag: "https://flagcdn.com/w40/za.png" },
    { code: "KR", dial_code: "+82", flag: "https://flagcdn.com/w40/kr.png" },
    { code: "ES", dial_code: "+34", flag: "https://flagcdn.com/w40/es.png" },
    { code: "SE", dial_code: "+46", flag: "https://flagcdn.com/w40/se.png" },
    { code: "CH", dial_code: "+41", flag: "https://flagcdn.com/w40/ch.png" },
    { code: "SY", dial_code: "+963", flag: "https://flagcdn.com/w40/sy.png" },
    { code: "TW", dial_code: "+886", flag: "https://flagcdn.com/w40/tw.png" },
    { code: "TH", dial_code: "+66", flag: "https://flagcdn.com/w40/th.png" },
    { code: "TN", dial_code: "+216", flag: "https://flagcdn.com/w40/tn.png" },
    { code: "TR", dial_code: "+90", flag: "https://flagcdn.com/w40/tr.png" },
    { code: "UA", dial_code: "+380", flag: "https://flagcdn.com/w40/ua.png" },
    { code: "AE", dial_code: "+971", flag: "https://flagcdn.com/w40/ae.png" },
    { code: "GB", dial_code: "+44", flag: "https://flagcdn.com/w40/gb.png" },
    { code: "US", dial_code: "+1", flag: "https://flagcdn.com/w40/us.png" },
    { code: "UY", dial_code: "+598", flag: "https://flagcdn.com/w40/uy.png" },
    { code: "UZ", dial_code: "+998", flag: "https://flagcdn.com/w40/uz.png" },
    { code: "VE", dial_code: "+58", flag: "https://flagcdn.com/w40/ve.png" },
    { code: "VN", dial_code: "+84", flag: "https://flagcdn.com/w40/vn.png" },
    { code: "YE", dial_code: "+967", flag: "https://flagcdn.com/w40/ye.png" }
];

function cobacForm() {
    return {
        currentStep: 1,
        submitted: false,
        kvkkAccepted: false,

        // Internationalization
        currentLang: safeStorage.getItem('cobac_lang') || 'en',

        // Phone Input
        selectedCountryCode: '+90',
        selectedCountryISO: 'TR',
        rawPhoneNumber: '',

        countryCodes: COUNTRY_CODES,

        isOpen: false,
        searchQuery: '',

        get filteredCountries() {
            const query = this.searchQuery.trim().toLowerCase();

            if (!query) {
                return this.countryCodes;
            }

            return this.countryCodes.filter(country =>
                country.dial_code.includes(query) ||
                country.code.toLowerCase().includes(query)
            );
        },

        get selectedCountryObj() {
            return this.countryCodes.find(
                country => country.code === this.selectedCountryISO
            ) || this.countryCodes.find(
                country => country.code === 'TR'
            );
        },

        selectCountry(country) {
            this.selectedCountryCode = country.dial_code;
            this.selectedCountryISO = country.code;

            this.isOpen = false;
            this.searchQuery = '';

            this.updateFullPhone();
        },

        updateFullPhone() {
            const sanitizedDigits = (this.rawPhoneNumber || '')
                .replace(/\D/g, '');

            this.formData.phone = sanitizedDigits ?
                `${this.selectedCountryCode}${sanitizedDigits}` :
                '';
        },

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
            phone: '', // Populated dynamically via updateFullPhone()
            job: '',
            company: '',
            invoiceAddress: '',
            membership: 'day_pass',
            source: '',
            photoConsent: false
        },

        init() {
            // Load drafts from localStorage safely
            const savedDraft = safeStorage.getItem('cobac_form_draft_red');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    this.formData = {...this.formData, ...parsed };

                    // Restore split phone state if draft had a full phone number
                    if (this.formData.phone) {
                        const matchedCode = this.countryCodes
                            .map(c => c.dial_code)
                            .sort((a, b) => b.length - a.length) // Match longer codes first (+971 before +9)
                            .find(code => this.formData.phone.startsWith(code));

                        if (matchedCode) {
                            this.selectedCountryCode = matchedCode;
                            this.rawPhoneNumber = this.formData.phone.slice(matchedCode.length);
                        } else {
                            this.rawPhoneNumber = this.formData.phone;
                        }
                    }
                } catch (e) {
                    console.error("Draft parse error:", e);
                }
            }

            // Auto-save watch
            this.$watch('formData', (value) => {
                safeStorage.setItem('cobac_form_draft_red', JSON.stringify(value));
            }, { deep: true });

            // Watch UI phone model changes to keep formData.phone updated instantly
            this.$watch('rawPhoneNumber', () => this.updateFullPhone());
            this.$watch('selectedCountryCode', () => this.updateFullPhone());
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

            const cleanedData = sanitizeFormData(this.formData);

            const payload = {
                ...cleanedData,
                photoConsent: Boolean(this.formData.photoConsent)
            };

            try {
                let endpoint = '/api/submit-form';
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    endpoint = 'http://localhost:3327/api/submit-form';
                } else {
                    endpoint = '/api/submit-form';
                }
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
            this.selectedCountryCode = '+90';
            this.rawPhoneNumber = '';
            this.isOpen = false;
            this.searchQuery = '';
            this.currentStep = 1;
            this.submitted = false;
            this.kvkkAccepted = false;
            safeStorage.removeItem('cobac_form_draft_red');
        }
    };
}
