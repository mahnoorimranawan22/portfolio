/** Not-found handler for unknown API routes — always JSON, never HTML. */
export function notFound(req, res) {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `No route for ${req.method} ${req.originalUrl}`,
        },
    });
}

/** Central error handler — logs server-side, returns a safe JSON envelope. */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const isServerError = status >= 500;

    if (isServerError) {
        // Never leak stack traces or internals to the client.
        console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
        if (err.stack && process.env.NODE_ENV !== 'production') {
            console.error(err.stack);
        }
    }

    // Malformed JSON bodies — respond generically instead of echoing parser internals.
    const isParseError = err.type === 'entity.parse.failed';

    res.status(status).json({
        error: {
            code: isParseError ? 'INVALID_JSON' : err.code || (isServerError ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
            message: isParseError
                ? 'Request body must be valid JSON.'
                : isServerError
                    ? 'Internal server error'
                    : err.message,
            // Field-level validation details (only for 4xx validation failures)
            ...(err.details ? { details: err.details } : {}),
        },
    });
}

/** Wrap an async handler so rejected promises reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
