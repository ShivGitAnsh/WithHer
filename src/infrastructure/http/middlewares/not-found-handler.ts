import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const notFoundHandler = (request: Request, response: Response): void => {
  response.status(StatusCodes.NOT_FOUND).json({
    error: {
      message: `Route not found: ${request.method} ${request.originalUrl}`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
};
