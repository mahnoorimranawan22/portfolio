import { Router } from 'express';
import { dataFiles, writeDataFile } from '../utils/data.js';
import { validateQuery } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/projects
 * Optional query params: ?category=ai|fullstack|frontend|all&limit=1..50
 */
router.get('/', (req, res) => {
    const { error, value } = validateQuery(req.query);
    if (error) return res.status(400).json({ error });

    let projects = dataFiles.projects();

    if (value.category && value.category !== 'all') {
        projects = projects.filter((p) => p.category === value.category);
    }
    if (value.limit !== undefined) {
        projects = projects.slice(0, value.limit);
    }

    res.json({ data: projects, meta: { count: projects.length } });
});

// POST /api/projects - Add new project (Admin only)
router.post('/', requireAdmin, (req, res) => {
    const projects = dataFiles.projects();
    const newProj = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: req.body.title || 'New Project',
        icon: req.body.icon || '📁',
        category: req.body.category || 'frontend',
        featured: !!req.body.featured,
        description: req.body.description || '',
        repo: req.body.repo || '',
        demo: req.body.demo || null,
        coverImage: req.body.coverImage || null,
        tech: req.body.tech || [],
        features: req.body.features || [],
        caseStudy: req.body.caseStudy || null
    };
    projects.push(newProj);
    writeDataFile('projects.json', projects);
    res.status(201).json({ data: newProj });
});

// PUT /api/projects/:id - Edit project (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
    const projects = dataFiles.projects();
    const index = projects.findIndex(p => String(p.id) === String(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    projects[index] = {
        ...projects[index],
        title: req.body.title !== undefined ? req.body.title : projects[index].title,
        icon: req.body.icon !== undefined ? req.body.icon : projects[index].icon,
        category: req.body.category !== undefined ? req.body.category : projects[index].category,
        featured: req.body.featured !== undefined ? !!req.body.featured : projects[index].featured,
        description: req.body.description !== undefined ? req.body.description : projects[index].description,
        repo: req.body.repo !== undefined ? req.body.repo : projects[index].repo,
        demo: req.body.demo !== undefined ? req.body.demo : projects[index].demo,
        coverImage: req.body.coverImage !== undefined ? req.body.coverImage : projects[index].coverImage,
        tech: req.body.tech !== undefined ? req.body.tech : projects[index].tech,
        features: req.body.features !== undefined ? req.body.features : projects[index].features,
        caseStudy: req.body.caseStudy !== undefined ? req.body.caseStudy : projects[index].caseStudy
    };

    writeDataFile('projects.json', projects);
    res.json({ data: projects[index] });
});

// DELETE /api/projects/:id - Remove project (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
    const projects = dataFiles.projects();
    const filtered = projects.filter(p => String(p.id) !== String(req.params.id));
    writeDataFile('projects.json', filtered);
    res.json({ data: { success: true } });
});

export default router;
