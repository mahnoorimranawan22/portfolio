import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { validateContact } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errors.js';
import { createMessageStore } from '../utils/messageStore.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const store = createMessageStore(config.contact.messagesFile, config.contact.maxMessages);

// GET /api/contact - list inbox contact feedback messages (Admin view only)
router.get(
    '/',
    requireAdmin,
    asyncHandler(async (req, res) => {
        res.json({ data: store.list() });
    })
);

// DELETE /api/contact/:id - delete a contact message (Admin view only)
router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
        store.delete(req.params.id);
        res.json({ data: { success: true }, meta: { message: 'Message removed successfully.' } });
    })
);

// Per-IP rate limit for the contact endpoint (spam / abuse guard).
const contactLimiter = rateLimit({
    windowMs: config.contact.rateLimit.windowMs,
    max: config.contact.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many messages sent. Please try again later.',
        },
    },
});

/**
 * POST /api/contact
 * Body: { name, email, subject?, message }
 * Validates + sanitizes, then persists to the file-backed store.
 */
router.post(
    '/',
    contactLimiter,
    asyncHandler(async (req, res) => {
        const { error, value } = validateContact(req.body);
        if (error) return res.status(400).json({ error });

        const saved = store.add({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: value.name,
            email: value.email,
            subject: value.subject,
            message: value.message,
            ip: req.ip, // stored for abuse auditing only — never exposed via API
            receivedAt: new Date().toISOString(),
        });

        res.status(201).json({
            data: {
                id: saved.id,
                receivedAt: saved.receivedAt,
            },
            meta: { message: 'Message received — thank you for reaching out!' },
        });
    })
);

export default router;
