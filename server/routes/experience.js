import { Router } from 'express';
import { dataFiles, writeDataFile } from '../utils/data.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

/** GET /api/experience — education & journey timeline. */
router.get('/', (req, res) => {
    res.json({ data: dataFiles.experience() });
});

// POST /api/experience - Add experience milestone (Admin only)
router.post('/', requireAdmin, (req, res) => {
    const experience = dataFiles.experience();
    const newItem = {
        tag: req.body.tag || '',
        title: req.body.title || '',
        description: req.body.description || '',
        orderIndex: req.body.orderIndex !== undefined ? Number(req.body.orderIndex) : experience.length
    };
    experience.push(newItem);
    experience.sort((a, b) => a.orderIndex - b.orderIndex);
    writeDataFile('experience.json', experience);
    res.status(201).json({ data: newItem });
});

// PUT /api/experience/:index - Edit experience milestone by array index (Admin only)
router.put('/:index', requireAdmin, (req, res) => {
    const experience = dataFiles.experience();
    const index = Number(req.params.index);
    if (isNaN(index) || index < 0 || index >= experience.length) {
        return res.status(404).json({ error: 'Milestone index not found.' });
    }

    experience[index] = {
        ...experience[index],
        tag: req.body.tag !== undefined ? req.body.tag : experience[index].tag,
        title: req.body.title !== undefined ? req.body.title : experience[index].title,
        description: req.body.description !== undefined ? req.body.description : experience[index].description,
        orderIndex: req.body.orderIndex !== undefined ? Number(req.body.orderIndex) : experience[index].orderIndex
    };
    experience.sort((a, b) => a.orderIndex - b.orderIndex);
    writeDataFile('experience.json', experience);
    res.json({ data: experience });
});

// DELETE /api/experience/:index - Delete experience milestone by array index (Admin only)
router.delete('/:index', requireAdmin, (req, res) => {
    const experience = dataFiles.experience();
    const index = Number(req.params.index);
    if (isNaN(index) || index < 0 || index >= experience.length) {
        return res.status(404).json({ error: 'Milestone index not found.' });
    }

    experience.splice(index, 1);
    writeDataFile('experience.json', experience);
    res.json({ data: { success: true } });
});

export default router;
