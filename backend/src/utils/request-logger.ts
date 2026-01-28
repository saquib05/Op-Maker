import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Extended Request interface with request ID
 */
export interface RequestWithId extends Request {
  requestId: string;
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Request logging middleware
 * Adds a unique request ID and logs request details
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = generateRequestId();
  (req as RequestWithId).requestId = requestId;

  // Set request ID header for tracing
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();
  const { method, url } = req;

  // Log request start
  console.log(`[${requestId}] --> ${method} ${url}`);

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    console.log(`[${requestId}] <-- ${method} ${url} ${statusCode} ${duration}ms`);
  });

  next();
}
