import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { asyncHandler } from '../middleware/errors.js';

const router = Router();

// Precompute the admin password hash ONCE at startup (not per request).
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(config.auth.adminPassword, 10);

// Brute-force guard: max 10 login attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again later.',
        },
    },
});

/**
 * POST /api/admin/auth/login
 * Body: { email, password }
 * Returns a short-lived JWT when credentials match the configured admin account.
 */
router.post(
    '/login',
    loginLimiter,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body ?? {};

        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required.',
                },
            });
        }

        // Constant-time-ish compare: always hash, then compare against the fixed hash.
        const emailOk = email.trim().toLowerCase() === config.auth.adminEmail.toLowerCase();
        const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

        if (!emailOk || !passwordOk) {
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password.',
                },
            });
        }

        const token = jwt.sign({ email: config.auth.adminEmail }, config.auth.jwtSecret, {
            expiresIn: config.auth.jwtExpiresIn,
        });

        res.json({
            data: {
                token,
                email: config.auth.adminEmail,
                expiresIn: config.auth.jwtExpiresIn,
            },
            meta: { message: 'Authentication successful.' },
        });
    })
);

export default router;
