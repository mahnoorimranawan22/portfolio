import { Router } from 'express';
import { readDataFile, writeDataFile } from '../../utils/data.js';
import { asyncHandler } from '../../middleware/errors.js';
import { sanitize } from '../../middleware/validate.js';

const router = Router();

const FILE = 'projects.json';

const load = () => readDataFile(FILE);
const save = (data) => writeDataFile(FILE, data);

/**
 * GET /api/admin/projects
 * Optional query: ?search=&category=ai|fullstack|frontend&featured=true
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        let projects = load();
        const { search, category, featured } = req.query;

        if (category && category !== 'all') {
            projects = projects.filter((p) => p.category === category);
        }
        if (featured === 'true') projects = projects.filter((p) => p.featured);
        if (featured === 'false') projects = projects.filter((p) => !p.featured);
        if (search) {
            const q = search.toLowerCase();
            projects = projects.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    (p.description || '').toLowerCase().includes(q) ||
                    (p.tech || []).some((t) => t.toLowerCase().includes(q))
            );
        }

        res.json({ data: projects, meta: { count: projects.length } });
    })
);

/**
 * POST /api/admin/projects — create a project (admin only).
 * Body: title (required, unique), category, icon, featured, description,
 *       repo, demo, coverImage, tech[], features[], caseStudy?
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const body = req.body ?? {};
        const title = sanitize(body.title);

        if (!title) {
            return res.status(400).json({
                error: { code: 'VALIDATION_ERROR', message: 'Project title is required.', details: [{ field: 'title', message: 'Title is required.' }] },
            });
        }

        const projects = load();
        if (projects.some((p) => p.title.toLowerCase() === title.toLowerCase())) {
            return res.status(409).json({
                error: { code: 'CONFLICT', message: 'A project with this title already exists.' },
            });
        }

        const project = {
            id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
            title,
            icon: sanitize(body.icon) || '🚀',
            category: ['ai', 'fullstack', 'frontend'].includes(body.category) ? body.category : 'frontend',
            featured: Boolean(body.featured),
            description: sanitize(body.description),
            repo: sanitize(body.repo),
            demo: body.demo ? sanitize(body.demo) : null,
            coverImage: body.coverImage ? sanitize(body.coverImage) : null,
            tech: Array.isArray(body.tech) ? body.tech.map((t) => sanitize(t)).filter(Boolean) : [],
            features: Array.isArray(body.features) ? body.features.map((f) => sanitize(f)).filter(Boolean) : [],
            ...(body.caseStudy && typeof body.caseStudy === 'object' ? { caseStudy: body.caseStudy } : {}),
        };

        projects.push(project);
        save(projects);
        res.status(201).json({ data: project, meta: { message: 'Project created.' } });
    })
);

/**
 * PUT /api/admin/projects/:id — update a project (admin only).
 */
router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const projects = load();
        const index = projects.findIndex((p) => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found.' } });
        }

        const body = req.body ?? {};
        const current = projects[index];
        const title = body.title !== undefined ? sanitize(body.title) : current.title;
        if (!title) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Project title cannot be empty.' } });
        }

        const updated = {
            ...current,
            ...body,
            id: current.id,
            title,
            icon: body.icon !== undefined ? sanitize(body.icon) : current.icon,
            category: body.category !== undefined ? (['ai', 'fullstack', 'frontend'].includes(body.category) ? body.category : current.category) : current.category,
            featured: body.featured !== undefined ? Boolean(body.featured) : current.featured,
            description: body.description !== undefined ? sanitize(body.description) : current.description,
            repo: body.repo !== undefined ? sanitize(body.repo) : current.repo,
            demo: body.demo !== undefined ? (body.demo ? sanitize(body.demo) : null) : current.demo,
            coverImage: body.coverImage !== undefined ? (body.coverImage ? sanitize(body.coverImage) : null) : current.coverImage,
            tech: Array.isArray(body.tech) ? body.tech.map((t) => sanitize(t)).filter(Boolean) : current.tech,
            features: Array.isArray(body.features) ? body.features.map((f) => sanitize(f)).filter(Boolean) : current.features,
        };
        if (body.caseStudy !== undefined) {
            updated.caseStudy = body.caseStudy && typeof body.caseStudy === 'object' ? body.caseStudy : undefined;
        }

        projects[index] = updated;
        save(projects);
        res.json({ data: updated, meta: { message: 'Project updated.' } });
    })
);

/**
 * DELETE /api/admin/projects/:id — remove a project (admin only).
 */
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const projects = load();
        const filtered = projects.filter((p) => p.id !== req.params.id);
        if (filtered.length === projects.length) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found.' } });
        }
        save(filtered);
        res.json({ data: { id: req.params.id }, meta: { message: 'Project deleted.' } });
    })
);

export default router;
