import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerMatchingService } from './forher-matching.service';
import {
  connectMatchSchema,
  matchIdParamsSchema,
  matchingOptInSchema,
  tripMatchingParamsSchema
} from './forher-matching.types';

export class ForHerMatchingController {
  constructor(private readonly service: ForHerMatchingService) {}

  getProfile = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripMatchingParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const profile = await this.service.getProfile(parsedParams.data.tripId);
    response.status(StatusCodes.OK).json({ data: profile });
  };

  optIn = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripMatchingParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const parsedBody = matchingOptInSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid matching opt-in payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const profile = await this.service.optIn(parsedParams.data.tripId, parsedBody.data);
    response.status(StatusCodes.OK).json({ data: profile });
  };

  getCandidates = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripMatchingParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const candidates = await this.service.getCandidates(parsedParams.data.tripId);
    response.status(StatusCodes.OK).json({ data: candidates });
  };

  connect = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = matchIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid match id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const parsedBody = connectMatchSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid connect payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const result = await this.service.connect(parsedBody.data.tripId, parsedParams.data.matchId);
    response.status(StatusCodes.OK).json({ data: result });
  };
}
