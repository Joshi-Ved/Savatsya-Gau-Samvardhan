/**
 * Zod-based request validation middleware.
 *
 * Usage:
 *   import { z } from 'zod';
 *   import { validate } from '../middleware/validate.js';
 *
 *   const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
 *   router.post('/register', validate(schema), handler);
 *
 * By default validates req.body. Pass { source: 'query' } or { source: 'params' }
 * as the second argument to validate other parts of the request.
 */

export function validate(schema, { source = 'body' } = {}) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    // Replace raw input with parsed (and potentially transformed) data
    req[source] = result.data;
    return next();
  };
}
