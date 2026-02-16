/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 * In development, includes the stack trace for debugging.
 */

// eslint-disable-next-line no-unused-vars
export function globalErrorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  // Log the error (full details server-side only)
  console.error(`[error] ${req.method} ${req.originalUrl} — ${statusCode}:`, err.message);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Custom operational error class.
 * Use this to throw predictable errors that should be forwarded to the client.
 * Example: throw new AppError('Product not found', 404);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps an async route handler so that rejected promises are forwarded to
 * Express's error-handling pipeline instead of crashing the process.
 *
 * Usage:
 *   router.get('/foo', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
