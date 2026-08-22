/**
 * Sanitizes generic string inputs by trimming and stripping HTML tags.
 */
export function sanitizeString(input) {
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
export function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

/**
 * Sanitizes phone numbers by keeping only valid characters.
 */
export function sanitizePhone(phone) {
    if (typeof phone !== 'string') return '';
    return phone.replace(/[^\+\d\s\-()]/g, '').trim();
}

/**
 * Sanitizes an entire form data object.
 */
export function sanitizeFormData(data) {
    return {
        name: sanitizeString(data.name),
        cityCountry: sanitizeString(data.cityCountry),
        email: sanitizeEmail(data.email),
        phone: sanitizePhone(data.phone),
        job: sanitizeString(data.job),
        company: sanitizeString(data.company),
        invoiceAddress: sanitizeString(data.invoiceAddress),
        membership: sanitizeString(data.membership),
        source: sanitizeString(data.source)
    };
}