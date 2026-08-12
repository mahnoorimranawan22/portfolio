import { Router } from 'express';
import { config } from '../../config.js';
import { asyncHandler } from '../../middleware/errors.js';
import { readDataFile } from '../../utils/data.js';
import { createMessageStore } from '../../utils/messageStore.js';

const router = Router();

/**
 * GET /api/admin/overview
 * Aggregates counts + recent data for the dashboard's Overview page.
 */
router.get(
    '/overview',
    asyncHandler(async (req, res) => {
        const projects = readDataFile('projects.json');
        const skills = readDataFile('skills.json');
        const experience = readDataFile('experience.json');
        const messages = createMessageStore(config.contact.messagesFile, config.contact.maxMessages).list();

        const skillCount = Object.values(skills).reduce((sum, list) => sum + list.length, 0);
        const unread = messages.filter((m) => !m.read).length;

        res.json({
            data: {
                counts: {
                    projects: projects.length,
                    skills: skillCount,
                    skillCategories: Object.keys(skills).length,
                    experience: experience.length,
                    messages: messages.length,
                    unreadMessages: unread,
                },
                projectsByCategory: projects.reduce((acc, p) => {
                    acc[p.category] = (acc[p.category] || 0) + 1;
                    return acc;
                }, {}),
                recentMessages: messages.slice(0, 5).map(({ id, name, email, subject, read, receivedAt }) => ({
                    id, name, email, subject, read, receivedAt,
                })),
                recentProjects: projects.slice(0, 4).map(({ id, title, category, featured }) => ({ id, title, category, featured })),
            },
        });
    })
);

export default router;
