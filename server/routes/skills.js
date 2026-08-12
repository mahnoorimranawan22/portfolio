import { Router } from 'express';
import { dataFiles, writeDataFile } from '../utils/data.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

/** GET /api/skills — grouped by category. */
router.get('/', (req, res) => {
    res.json({ data: dataFiles.skills() });
});

// PUT /api/skills - Overwrite skills group schema (Admin only)
router.put('/', requireAdmin, (req, res) => {
    const skills = req.body;
    if (!skills || typeof skills !== 'object') {
        return res.status(400).json({ error: 'Invalid skills payload structure.' });
    }
    writeDataFile('skills.json', skills);
    res.json({ data: skills });
});

export default router;
