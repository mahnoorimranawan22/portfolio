/**
 * Validation helpers.
 * Returns either `null` (valid) or an object `{ code, message, details }`
 * describing every failed field — safe to send straight to the client.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Strip HTML/script content and control chars; collapse excess whitespace. */
export function sanitize(input) {
    return String(input ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/[\p{Cc}\p{Cf}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function validateContact(body) {
    const details = [];

    const name = sanitize(body?.name);
    if (!name) details.push({ field: 'name', message: 'Name is required.' });
    else if (name.length > 100) details.push({ field: 'name', message: 'Name must be 100 characters or fewer.' });

    const email = sanitize(body?.email);
    if (!email) details.push({ field: 'email', message: 'Email is required.' });
    else if (email.length > 254 || !EMAIL_RE.test(email))
        details.push({ field: 'email', message: 'A valid email address is required.' });

    const subject = sanitize(body?.subject);
    if (subject.length > 200) details.push({ field: 'subject', message: 'Subject must be 200 characters or fewer.' });

    const message = sanitize(body?.message);
    if (!message) details.push({ field: 'message', message: 'Message is required.' });
    else if (message.length < 10) details.push({ field: 'message', message: 'Message must be at least 10 characters.' });
    else if (message.length > 5000) details.push({ field: 'message', message: 'Message must be 5000 characters or fewer.' });

    if (details.length > 0) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Please fix the highlighted fields.', details } };
    }

    return { value: { name, email, subject, message } };
}

/** Validate GET query params shared by list endpoints. */
export function validateQuery(query) {
    const { category, limit } = query;
    const errors = [];

    if (category !== undefined && !['ai', 'fullstack', 'frontend', 'all'].includes(category)) {
        errors.push({ field: 'category', message: 'category must be one of: ai, fullstack, frontend, all.' });
    }

    let parsedLimit = undefined;
    if (limit !== undefined) {
        parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
            errors.push({ field: 'limit', message: 'limit must be an integer between 1 and 50.' });
        }
    }

    if (errors.length > 0) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters.', details: errors } };
    }
    return { value: { category, limit: parsedLimit } };
}
