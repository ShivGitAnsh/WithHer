import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerSafetyScoreService } from './forher-safety-score.service';
import { forHerSafetyScoreParamsSchema } from './forher-safety-score.types';

export class ForHerSafetyScoreController {
  constructor(
    private readonly forHerSafetyScoreService: ForHerSafetyScoreService
  ) {}

  getTripSafetyScore = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const parsedParams = forHerSafetyScoreParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const safetyScore = await this.forHerSafetyScoreService.getTripSafetyScore(
      parsedParams.data.tripId
    );

    response.status(StatusCodes.OK).json({ data: safetyScore });
  };
}
