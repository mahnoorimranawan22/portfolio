import { Router } from 'express';
import { config } from '../../config.js';
import { asyncHandler } from '../../middleware/errors.js';
import { createMessageStore } from '../../utils/messageStore.js';

const router = Router();

const store = createMessageStore(config.contact.messagesFile, config.contact.maxMessages);

/**
 * GET /api/admin/messages
 * Optional query: ?search=&status=read|unread
 * NOTE: the visitor's IP is stored for abuse auditing and only exposed here
 * to the authenticated admin — never via the public contact endpoint.
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        let messages = store.list();
        const { search, status } = req.query;

        if (status === 'read') messages = messages.filter((m) => m.read);
        if (status === 'unread') messages = messages.filter((m) => !m.read);

        if (search) {
            const q = search.toLowerCase();
            messages = messages.filter(
                (m) =>
                    m.name.toLowerCase().includes(q) ||
                    m.email.toLowerCase().includes(q) ||
                    (m.subject || '').toLowerCase().includes(q) ||
                    m.message.toLowerCase().includes(q)
            );
        }

        res.json({ data: messages, meta: { count: messages.length } });
    })
);

/**
 * GET /api/admin/messages/:id — single message.
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const message = store.get(req.params.id);
        if (!message) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Message not found.' } });
        }
        res.json({ data: message });
    })
);

/**
 * PATCH /api/admin/messages/:id/read — mark read/unread.
 * Body: { read: boolean }
 */
router.patch(
    '/:id/read',
    asyncHandler(async (req, res) => {
        const read = req.body?.read !== false;
        const updated = store.markRead(req.params.id, read);
        if (!updated) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Message not found.' } });
        }
        res.json({ data: updated, meta: { message: read ? 'Marked as read.' : 'Marked as unread.' } });
    })
);

/**
 * DELETE /api/admin/messages/:id — remove a message.
 */
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const before = store.list().length;
        store.delete(req.params.id);
        const after = store.list().length;
        if (after === before) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Message not found.' } });
        }
        res.json({ data: { id: req.params.id }, meta: { message: 'Message deleted.' } });
    })
);

export default router;
