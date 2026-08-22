export const VALIDATION_REGEX = {
    // Allows letters, spaces, hyphens, and apostrophes (supports international names)
    name: /^[p{L}\s'-]{2,50}$/u,

    // Standard RFC-compliant email pattern check
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // International phone number check (allows optional + and digits, spaces, dashes)
    phone: /^\+?[0-9\s\-()]{7,20}$/,

    // General text (prevents extreme script injection characters in standard inputs)
    generalText: /^[^<>#]*$/,

    // City / Country text check
    cityCountry: /^[p{L}\s,.-]{2,100}$/u
};