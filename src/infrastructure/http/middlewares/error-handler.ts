import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { env } from '../../../config/env';
import { logger } from '../../../config/logger';
import { AppError } from '../../../shared/errors/app-error';
import { mapPrismaErrorToAppError } from '../../../shared/errors/map-prisma-error';

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code
      }
    });

    return;
  }

  const prismaMapped = mapPrismaErrorToAppError(error);
  if (prismaMapped) {
    response.status(prismaMapped.statusCode).json({
      error: {
        message: prismaMapped.message,
        code: prismaMapped.code
      }
    });
    return;
  }

  logger.error({ err: error }, 'Unhandled application error');

  response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: {
      message:
        env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
};
