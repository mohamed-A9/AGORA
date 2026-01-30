/**
 * Server-side input sanitization utilities
 * Protects against XSS, SQL injection, and other malicious input
 */

/**
 * Sanitize a string to prevent XSS attacks
 * Removes or escapes potentially dangerous characters and patterns
 */
export function sanitizeString(input: string | null | undefined): string {
    if (!input) return "";

    let sanitized = input
        // Remove null bytes
        .replace(/\0/g, '')
        // Escape HTML entities
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        // Remove potential script injections
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=, onload=
        // Trim whitespace
        .trim();

    return sanitized;
}

/**
 * Sanitize a URL to ensure it's safe
 * Only allows http, https protocols
 */
export function sanitizeUrl(input: string | null | undefined): string {
    if (!input) return "";

    const trimmed = input.trim();

    // Allow empty strings
    if (!trimmed) return "";

    // Check for dangerous protocols
    const lowerUrl = trimmed.toLowerCase();
    if (lowerUrl.startsWith('javascript:') ||
        lowerUrl.startsWith('data:') ||
        lowerUrl.startsWith('vbscript:')) {
        return "";
    }

    // If it's a relative URL or starts with http/https, it's okay
    if (trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://')) {
        return trimmed;
    }

    // If no protocol, assume https
    if (!trimmed.includes('://')) {
        return `https://${trimmed}`;
    }

    return trimmed;
}

/**
 * Sanitize a phone number - only allow digits and basic formatting
 */
export function sanitizePhone(input: string | null | undefined): string {
    if (!input) return "";
    // Only allow digits, spaces, dashes, parentheses, and plus
    return input.replace(/[^\d\s\-\(\)\+]/g, '').trim();
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(input: string | null | undefined): string {
    if (!input) return "";
    // Basic email sanitization - trim and lowercase
    const sanitized = input.trim().toLowerCase();
    // Simple email pattern check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(sanitized)) {
        return ""; // Invalid email
    }
    return sanitized;
}

/**
 * Sanitize all venue data fields
 */
export function sanitizeVenueData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
            sanitized[key] = value;
            continue;
        }

        // Handle different field types
        switch (key) {
            // URL fields
            case 'website':
            case 'instagramUrl':
            case 'tiktokUrl':
            case 'wazeUrl':
            case 'locationUrl':
            case 'menuUrl':
            case 'reservationUrl':
            case 'coverImageUrl':
                sanitized[key] = sanitizeUrl(value);
                break;

            // Phone fields
            case 'phone':
            case 'reservationPhoneNumber':
                sanitized[key] = sanitizePhone(value);
                break;

            // Email fields
            case 'email':
                sanitized[key] = sanitizeEmail(value);
                break;

            // String fields that need basic XSS protection
            case 'name':
            case 'description':
            case 'tagline':
            case 'address':
            case 'neighborhood':
                sanitized[key] = sanitizeString(value);
                break;

            // Arrays - sanitize each string element
            case 'cuisines':
            case 'vibes':
            case 'musicTypes':
            case 'facilities':
            case 'paymentMethods':
                if (Array.isArray(value)) {
                    sanitized[key] = value.map(item =>
                        typeof item === 'string' ? sanitizeString(item) : item
                    );
                } else {
                    sanitized[key] = value;
                }
                break;

            // Pass through other values (booleans, numbers, nested objects)
            default:
                sanitized[key] = value;
        }
    }

    return sanitized;
}
