/**
 * File Upload Security Validation
 * Validates file types, sizes, and content to prevent malicious uploads
 */

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
];

export const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime', // .mov
];

export const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
];

export const ALL_ALLOWED_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOCUMENT_TYPES,
];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
    image: 10 * 1024 * 1024,      // 10MB
    video: 100 * 1024 * 1024,     // 100MB
    document: 20 * 1024 * 1024,   // 20MB
};

// Dangerous file extensions that should NEVER be allowed
const DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.msi', '.dll',
    '.js', '.jsx', '.ts', '.tsx',
    '.php', '.asp', '.aspx', '.jsp',
    '.sh', '.bash', '.ps1', '.psm1',
    '.py', '.rb', '.pl',
    '.html', '.htm', '.xhtml',
    '.svg', // Can contain JavaScript
    '.scr', '.pif', '.application',
    '.jar', '.jnlp',
    '.vbs', '.vbe', '.ws', '.wsf', '.wsc',
];

// Magic bytes for file type verification
const FILE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'video/mp4': [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]], // ftyp
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

export interface FileValidationResult {
    valid: boolean;
    error?: string;
    sanitizedName?: string;
}

/**
 * Validate a file for upload
 */
export function validateFile(
    file: File,
    allowedTypes: string[] = ALL_ALLOWED_TYPES
): FileValidationResult {
    // 1. Check file exists
    if (!file || !file.name) {
        return { valid: false, error: 'No file provided' };
    }

    // 2. Sanitize and validate filename
    const sanitizedName = sanitizeFileName(file.name);
    if (!sanitizedName) {
        return { valid: false, error: 'Invalid filename' };
    }

    // 3. Check for dangerous extensions
    const lowerName = sanitizedName.toLowerCase();
    for (const ext of DANGEROUS_EXTENSIONS) {
        if (lowerName.endsWith(ext)) {
            return { valid: false, error: `File type ${ext} is not allowed` };
        }
    }

    // 4. Check MIME type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed. Allowed: ${allowedTypes.join(', ')}`
        };
    }

    // 5. Check file size
    const sizeLimit = getFileSizeLimit(file.type);
    if (file.size > sizeLimit) {
        const limitMB = Math.round(sizeLimit / 1024 / 1024);
        return { valid: false, error: `File too large. Maximum size: ${limitMB}MB` };
    }

    // 6. Check for empty files
    if (file.size === 0) {
        return { valid: false, error: 'File is empty' };
    }

    return { valid: true, sanitizedName };
}

/**
 * Validate file content by checking magic bytes
 * Call this after reading the file
 */
export async function validateFileContent(file: File): Promise<FileValidationResult> {
    try {
        const buffer = await file.slice(0, 12).arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Check if file content matches declared MIME type
        const signatures = FILE_SIGNATURES[file.type];
        if (signatures) {
            const matches = signatures.some(sig =>
                sig.every((byte, index) => bytes[index] === byte)
            );
            if (!matches) {
                return {
                    valid: false,
                    error: 'File content does not match declared type'
                };
            }
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: 'Failed to validate file content' };
    }
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFileName(filename: string): string {
    if (!filename) return '';

    // Remove path components
    let sanitized = filename.replace(/^.*[\\\/]/, '');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');

    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');

    // Limit length
    if (sanitized.length > 200) {
        const ext = sanitized.split('.').pop() || '';
        const name = sanitized.slice(0, 195 - ext.length);
        sanitized = `${name}.${ext}`;
    }

    // Ensure it's not empty after sanitization
    if (!sanitized || sanitized === '.') {
        return '';
    }

    return sanitized;
}

/**
 * Get file size limit based on MIME type
 */
function getFileSizeLimit(mimeType: string): number {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        return FILE_SIZE_LIMITS.image;
    }
    if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
        return FILE_SIZE_LIMITS.video;
    }
    if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
        return FILE_SIZE_LIMITS.document;
    }
    return FILE_SIZE_LIMITS.image; // Default
}

/**
 * Generate a safe, unique filename
 */
export function generateSafeFileName(originalName: string): string {
    const sanitized = sanitizeFileName(originalName);
    const ext = sanitized.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}.${ext}`;
}
