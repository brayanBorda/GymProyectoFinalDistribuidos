import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  static handle = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error details
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, {
      error: err.message,
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Don't expose stack trace in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
      error: this.getErrorMessage(statusCode),
      message,
      ...(isDevelopment && { stack: err.stack }),
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(req.body && { requestBody: req.body }),
    });
  };

  static notFound = (req: Request, res: Response): void => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  };

  private static getErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable Entity';
      case 500:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};