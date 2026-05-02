import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerListingSafetyService } from './forher-listing-safety.service';
import { listingSafetyParamsSchema } from './forher-listing-safety.types';

export class ForHerListingSafetyController {
  constructor(private readonly service: ForHerListingSafetyService) {}

  getListingSafetyScore = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = listingSafetyParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid listing id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const result = await this.service.getListingSafetyScore(parsedParams.data.listingId);

    response.status(StatusCodes.OK).json({ data: result });
  };
}
