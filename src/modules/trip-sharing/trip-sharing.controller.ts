import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { TripSharingService } from './trip-sharing.service';
import {
  createTripSharingParamsSchema,
  createTripSharingSchema
} from './trip-sharing.types';

export class TripSharingController {
  constructor(private readonly tripSharingService: TripSharingService) {}

  createConsent = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = createTripSharingParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const parsedBody = createTripSharingSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid trip sharing payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const consent = await this.tripSharingService.createConsent(
      parsedParams.data.tripId,
      parsedBody.data
    );

    response.status(StatusCodes.CREATED).json({ data: consent });
  };
}
