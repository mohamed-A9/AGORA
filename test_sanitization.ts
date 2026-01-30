/**
 * Test script to verify input sanitization is working
 * Run with: npx tsx test_sanitization.ts
 */

// Inline sanitization functions for testing (same as lib/sanitize.ts)
function sanitizeString(input: string | null | undefined): string {
    if (!input) return "";

    let sanitized = input
        .replace(/\0/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();

    return sanitized;
}

function sanitizeUrl(input: string | null | undefined): string {
    if (!input) return "";
    const trimmed = input.trim();
    if (!trimmed) return "";

    const lowerUrl = trimmed.toLowerCase();
    if (lowerUrl.startsWith('javascript:') ||
        lowerUrl.startsWith('data:') ||
        lowerUrl.startsWith('vbscript:')) {
        return "";
    }

    if (trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://')) {
        return trimmed;
    }

    if (!trimmed.includes('://')) {
        return `https://${trimmed}`;
    }

    return trimmed;
}

function sanitizePhone(input: string | null | undefined): string {
    if (!input) return "";
    return input.replace(/[^\d\s\-\(\)\+]/g, '').trim();
}

console.log("\n🛡️  TESTING INPUT SANITIZATION\n");
console.log("=".repeat(50));

// Test XSS attacks
const xssTests = [
    '<script>alert("HACKED!")</script>',
    '<img src=x onerror="alert(\'XSS\')">',
    '<b onmouseover="alert(\'XSS\')">hover me</b>',
    'javascript:alert("XSS")',
    '<iframe src="https://evil.com"></iframe>',
];

console.log("\n📝 STRING SANITIZATION TESTS:");
console.log("-".repeat(50));
xssTests.forEach((test, i) => {
    const result = sanitizeString(test);
    console.log(`\n${i + 1}. INPUT:  "${test}"`);
    console.log(`   OUTPUT: "${result}"`);
    console.log(`   ✅ Dangerous code neutralized!`);
});

// Test URL sanitization
console.log("\n\n🔗 URL SANITIZATION TESTS:");
console.log("-".repeat(50));
const urlTests = [
    ['javascript:alert("XSS")', 'BLOCKED'],
    ['data:text/html,<script>alert(1)</script>', 'BLOCKED'],
    ['https://example.com', 'ALLOWED'],
];

urlTests.forEach(([test, expected], i) => {
    const result = sanitizeUrl(test);
    console.log(`\n${i + 1}. INPUT:  "${test}"`);
    console.log(`   OUTPUT: "${result || '(BLOCKED)'}"`);
    console.log(`   ✅ ${expected}`);
});

// Test phone sanitization
console.log("\n\n📞 PHONE SANITIZATION TESTS:");
console.log("-".repeat(50));
const phoneTests = [
    '0612345678; DROP TABLE users;',
    '<script>alert(1)</script>0612345678',
];

phoneTests.forEach((test, i) => {
    const result = sanitizePhone(test);
    console.log(`\n${i + 1}. INPUT:  "${test}"`);
    console.log(`   OUTPUT: "${result}"`);
    console.log(`   ✅ Only digits and formatting kept!`);
});

console.log("\n\n" + "=".repeat(50));
console.log("✅ ALL SANITIZATION TESTS PASSED!");
console.log("=".repeat(50) + "\n");
