import { Router } from 'express';
import { readDataFile, writeDataFile } from '../../utils/data.js';
import { asyncHandler } from '../../middleware/errors.js';
import { sanitize } from '../../middleware/validate.js';

const router = Router();

const FILE = 'experience.json';

const load = () => readDataFile(FILE);
const save = (data) => writeDataFile(FILE, data);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * GET /api/admin/experience — list all timeline entries.
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        res.json({ data: load() });
    })
);

/**
 * POST /api/admin/experience — add an entry.
 * Body: { tag, title, description }
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const body = req.body ?? {};
        const title = sanitize(body.title);
        const description = sanitize(body.description);

        if (!title || !description) {
            return res.status(400).json({
                error: { code: 'VALIDATION_ERROR', message: 'Title and description are required.' },
            });
        }

        const entries = load();
        const entry = {
            id: slug(title),
            period: sanitize(body.period) || sanitize(body.tag) || '—',
            tag: sanitize(body.tag) || sanitize(body.period) || 'General',
            title,
            description,
        };
        entries.push(entry);
        save(entries);
        res.status(201).json({ data: entry, meta: { message: 'Timeline entry added.' } });
    })
);

/**
 * PUT /api/admin/experience/:id — update an entry.
 */
router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const entries = load();
        const index = entries.findIndex((e) => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Timeline entry not found.' } });
        }

        const body = req.body ?? {};
        const current = entries[index];
        const title = body.title !== undefined ? sanitize(body.title) : current.title;
        const description = body.description !== undefined ? sanitize(body.description) : current.description;
        if (!title || !description) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Title and description are required.' } });
        }

        entries[index] = {
            ...current,
            title,
            description,
            period: body.period !== undefined ? sanitize(body.period) : current.period,
            tag: body.tag !== undefined ? sanitize(body.tag) : current.tag,
        };
        save(entries);
        res.json({ data: entries[index], meta: { message: 'Timeline entry updated.' } });
    })
);

/**
 * DELETE /api/admin/experience/:id — remove an entry.
 */
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const entries = load();
        const filtered = entries.filter((e) => e.id !== req.params.id);
        if (filtered.length === entries.length) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Timeline entry not found.' } });
        }
        save(filtered);
        res.json({ data: { id: req.params.id }, meta: { message: 'Timeline entry deleted.' } });
    })
);

export default router;
