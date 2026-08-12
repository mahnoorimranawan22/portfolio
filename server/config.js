import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Split a comma-separated env list into trimmed, non-empty entries. */
const splitList = (value) =>
    (value || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const DEFAULT_JWT_SECRET = 'mahnoor-portfolio-deepmind-secret-key-2026';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

if (isProduction) {
    // Fail fast instead of serving a dashboard with publicly-known secrets.
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
        throw new Error('JWT_SECRET must be set to a strong random value in production.');
    }
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD must be overridden in production.');
    }
}

export const config = {
    env,
    isProduction,
    port: Number(process.env.PORT) || 4000,

    /** Allowed browser origins for CORS. */
    clientOrigins: splitList(
        process.env.CLIENT_ORIGIN ||
        'http://localhost:5173,http://localhost:5174,http://localhost:5175'
    ),

    // Set to the number of proxy hops (e.g. 1) when deployed behind
    // Railway/Vercel so rate limiting keys on the real client IP.
    trustProxy: Number(process.env.TRUST_PROXY) || 0,

    contact: {
        maxMessages: Number(process.env.MAX_MESSAGES) || 200,
        rateLimit: {
            max: Number(process.env.CONTACT_RATE_LIMIT_MAX) || 5,
            windowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        },
        // Resolved relative to server/ so it works regardless of cwd.
        messagesFile: path.resolve(
            __dirname,
            process.env.MESSAGES_FILE || './storage/messages.json'
        ),
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
        adminEmail: process.env.ADMIN_EMAIL || 'mahnoorimranawan22@gmail.com',
        adminPassword: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    },
    admin: {
        // Limits for admin list endpoints
        maxPageSize: Number(process.env.ADMIN_MAX_PAGE_SIZE) || 100,
    },
};
