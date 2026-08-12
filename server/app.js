import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { requireAdmin } from './middleware/auth.js';
import projectsRouter from './routes/projects.js';
import skillsRouter from './routes/skills.js';
import experienceRouter from './routes/experience.js';
import contactRouter from './routes/contact.js';
import authRouter from './routes/auth.js';
import adminProjectsRouter from './routes/admin/projects.js';
import adminSkillsRouter from './routes/admin/skills.js';
import adminExperienceRouter from './routes/admin/experience.js';
import adminMessagesRouter from './routes/admin/messages.js';
import adminOverviewRouter from './routes/admin/overview.js';

export function createApp() {
    const app = express();

    app.disable('x-powered-by');
    app.set('trust proxy', config.trustProxy);
    app.use(helmet());

    // Restrict CORS to the configured browser origins.
    app.use(
        cors({
            origin: (origin, cb) => {
                // Allow non-browser clients (curl, servers) with no Origin header.
                if (!origin || config.clientOrigins.includes(origin)) return cb(null, true);
                const err = new Error('Origin not allowed by CORS');
                err.status = 403;
                return cb(err);
            },
        })
    );

    app.use(express.json({ limit: '64kb' }));

    // Health check (no auth, no data — safe to expose).
    app.get('/api/health', (req, res) => {
        res.json({
            data: {
                status: 'ok',
                service: 'portfolio-api',
                env: config.env,
                time: new Date().toISOString(),
            },
        });
    });

    // ── Public routes ─────────────────────────────────────────────
    // Login is public under BOTH paths so the admin UI can use a consistent
    // /api/admin/* namespace while keeping /api/auth available to other clients.
    app.use('/api/auth', authRouter);
    app.use('/api/admin/auth', authRouter);
    app.use('/api/projects', projectsRouter);
    app.use('/api/skills', skillsRouter);
    app.use('/api/experience', experienceRouter);
    app.use('/api/contact', contactRouter);

    // ── Admin routes (JWT-protected) ──────────────────────────────
    app.use('/api/admin', requireAdmin, adminOverviewRouter); // GET /api/admin/overview
    app.use('/api/admin/projects', requireAdmin, adminProjectsRouter);
    app.use('/api/admin/skills', requireAdmin, adminSkillsRouter);
    app.use('/api/admin/experience', requireAdmin, adminExperienceRouter);
    app.use('/api/admin/messages', requireAdmin, adminMessagesRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
