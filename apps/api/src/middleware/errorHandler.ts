import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/helpers.js';

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a structured JSON response.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('❌ Unhandled Error:', err.message);
  console.error(err.stack);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json(
    errorResponse(err.message || 'Internal Server Error')
  );
}

/**
 * 404 Not Found handler for undefined routes.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorResponse('Route not found'));
}
