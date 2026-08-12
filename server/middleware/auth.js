import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Access denied. No active token provided.',
            },
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.auth.jwtSecret);
        if (decoded.email !== config.auth.adminEmail) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient administrative privileges.',
                },
            });
        }
        req.admin = decoded;
        next();
    } catch {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid or expired session token. Please log in again.',
            },
        });
    }
}
