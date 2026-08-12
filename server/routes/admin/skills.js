import { Router } from 'express';
import { readDataFile, writeDataFile } from '../../utils/data.js';
import { asyncHandler } from '../../middleware/errors.js';
import { sanitize } from '../../middleware/validate.js';

const router = Router();

const FILE = 'skills.json';

const load = () => readDataFile(FILE);
const save = (data) => writeDataFile(FILE, data);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * GET /api/admin/skills — full grouped skills object
 * Optional query: ?search=
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        let skills = load();
        const { search } = req.query;

        if (search) {
            const q = search.toLowerCase();
            const filtered = {};
            for (const [category, list] of Object.entries(skills)) {
                const matched = list.filter((s) => s.name.toLowerCase().includes(q));
                if (matched.length > 0) filtered[category] = matched;
            }
            skills = filtered;
        }

        res.json({ data: skills });
    })
);

/**
 * POST /api/admin/skills — add a skill
 * Body: { category, name, icon?, level? } (level like "75%")
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const body = req.body ?? {};
        const name = sanitize(body.name);
        const category = sanitize(body.category);

        if (!name || !category) {
            return res.status(400).json({
                error: { code: 'VALIDATION_ERROR', message: 'Skill name and category are required.' },
            });
        }

        const skills = load();
        if (!skills[category]) skills[category] = [];
        if (skills[category].some((s) => s.name.toLowerCase() === name.toLowerCase())) {
            return res.status(409).json({ error: { code: 'CONFLICT', message: 'This skill already exists in the category.' } });
        }

        const skill = {
            id: slug(name),
            name,
            icon: sanitize(body.icon) || 'fas fa-code',
            level: /^\d{1,3}%$/.test(String(body.level || '')) ? String(body.level) : '60%',
        };
        skills[category].push(skill);
        save(skills);
        res.status(201).json({ data: skill, meta: { message: 'Skill added.' } });
    })
);

/**
 * PUT /api/admin/skills/:id — update a skill (can move between categories).
 * Body: { category, name?, icon?, level? }
 */
router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const skills = load();
        const body = req.body ?? {};

        // Locate the skill by id across all categories
        let owner = null;
        let index = -1;
        for (const [category, list] of Object.entries(skills)) {
            const i = list.findIndex((s) => s.id === req.params.id);
            if (i !== -1) {
                owner = category;
                index = i;
                break;
            }
        }
        if (owner === null || index === -1) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found.' } });
        }

        const current = skills[owner][index];
        const name = body.name !== undefined ? sanitize(body.name) : current.name;
        if (!name) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Skill name cannot be empty.' } });
        }

        const updated = {
            ...current,
            name,
            icon: body.icon !== undefined ? sanitize(body.icon) : current.icon,
            level: body.level !== undefined ? (/^\d{1,3}%$/.test(String(body.level)) ? String(body.level) : current.level) : current.level,
        };

        const targetCategory = body.category !== undefined ? sanitize(body.category) : owner;
        if (!skills[targetCategory]) skills[targetCategory] = [];

        // Refuse renames that collide with an existing skill in the target category.
        const collides =
            skills[targetCategory].some(
                (s) => s.id !== req.params.id && s.name.toLowerCase() === name.toLowerCase()
            );
        if (collides) {
            return res.status(409).json({
                error: { code: 'CONFLICT', message: 'A skill with this name already exists in the target category.' },
            });
        }

        // Remove from old location, push to new
        skills[owner].splice(index, 1);
        if (skills[owner].length === 0) delete skills[owner];
        skills[targetCategory].push(updated);
        save(skills);

        res.json({ data: updated, meta: { message: 'Skill updated.' } });
    })
);

/**
 * DELETE /api/admin/skills/:id — remove a skill.
 */
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const skills = load();
        let removed = false;
        for (const [category, list] of Object.entries(skills)) {
            const filtered = list.filter((s) => s.id !== req.params.id);
            if (filtered.length !== list.length) {
                if (filtered.length === 0) delete skills[category];
                else skills[category] = filtered;
                removed = true;
                break;
            }
        }
        if (!removed) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found.' } });
        }
        save(skills);
        res.json({ data: { id: req.params.id }, meta: { message: 'Skill deleted.' } });
    })
);

/**
 * POST /api/admin/skills/categories — add an empty category.
 * Body: { name }
 */
router.post(
    '/categories',
    asyncHandler(async (req, res) => {
        const name = sanitize(req.body?.name);
        if (!name) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Category name is required.' } });
        }
        const skills = load();
        if (skills[name]) {
            return res.status(409).json({ error: { code: 'CONFLICT', message: 'Category already exists.' } });
        }
        skills[name] = [];
        save(skills);
        res.status(201).json({ data: { name }, meta: { message: 'Category added.' } });
    })
);

/**
 * DELETE /api/admin/skills/categories/:name — remove a category and its skills.
 */
router.delete(
    '/categories/:name',
    asyncHandler(async (req, res) => {
        const skills = load();
        const name = decodeURIComponent(req.params.name);
        if (!skills[name]) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found.' } });
        }
        delete skills[name];
        save(skills);
        res.json({ data: { name }, meta: { message: 'Category deleted.' } });
    })
);

export default router;
