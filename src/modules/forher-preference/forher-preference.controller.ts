import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerPreferenceService } from './forher-preference.service';
import {
  getForHerPreferenceQuerySchema,
  updateForHerPreferenceSchema
} from './forher-preference.types';

export class ForHerPreferenceController {
  constructor(
    private readonly forHerPreferenceService: ForHerPreferenceService
  ) {}

  getPreference = async (request: Request, response: Response): Promise<void> => {
    const parsedQuery = getForHerPreferenceQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? 'Invalid preference query',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const preference = await this.forHerPreferenceService.getPreference(
      parsedQuery.data.userId
    );

    response.status(StatusCodes.OK).json({ data: preference });
  };

  updatePreference = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const parsedBody = updateForHerPreferenceSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid preference payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const preference = await this.forHerPreferenceService.updatePreference(
      parsedBody.data
    );

    response.status(StatusCodes.OK).json({ data: preference });
  };
}
