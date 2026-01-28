import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { error, ErrorCodes } from './response.js';
import { RequestWithId } from './request-logger.js';

/**
 * Format Zod validation errors into a readable structure
 */
function formatZodErrors(zodError: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join('.') || 'root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return errors;
}

/**
 * Generic validation middleware factory
 * Validates a specific part of the request against a Zod schema
 */
export function validate<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'params' | 'query'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const requestId = (req as RequestWithId).requestId;

      error(
        res,
        ErrorCodes.VALIDATION_ERROR,
        `Invalid ${source} parameters`,
        400,
        formatZodErrors(result.error),
        requestId
      );
      return;
    }

    // Replace the source with the parsed (and potentially transformed) data
    req[source] = result.data;
    next();
  };
}

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return validate(schema, 'body');
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return validate(schema, 'params');
}

/**
 * Validate request query against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return validate(schema, 'query');
}
