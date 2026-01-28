import { Response } from 'express';

/**
 * Standard API Response Envelope
 * All API responses follow this consistent structure
 */

/**
 * Success response data type
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

/**
 * Error response data type
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

/**
 * Send a success response with consistent envelope
 */
export function success<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send an error response with consistent envelope
 */
export function error(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: unknown,
  requestId?: string
): Response {
  const response: ApiError = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a "Not Implemented" response for stub endpoints
 */
export function notImplemented(
  res: Response,
  endpoint: string,
  requestId?: string
): Response {
  return error(
    res,
    'NOT_IMPLEMENTED',
    `Endpoint '${endpoint}' is not yet implemented`,
    501,
    { endpoint },
    requestId
  );
}

/**
 * Common error codes for consistency
 */
export const ErrorCodes = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
