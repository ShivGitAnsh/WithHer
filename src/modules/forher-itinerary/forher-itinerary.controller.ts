import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerItineraryService } from './forher-itinerary.service';
import {
  generateItinerarySchema,
  itineraryIdParamsSchema,
  itineraryTripQuerySchema
} from './forher-itinerary.types';

export class ForHerItineraryController {
  constructor(private readonly itineraryService: ForHerItineraryService) {}

  generateItinerary = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = generateItinerarySchema.safeParse(request.body);

    if (!parsedBody.success) {
      const issue = parsedBody.error.issues[0];
      const path = issue?.path?.length ? String(issue.path.join('.')) : 'body';
      const message = issue?.message ?? 'Invalid itinerary payload';
      throw new AppError(`${path}: ${message}`, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const itinerary = await this.itineraryService.generateItinerary(parsedBody.data);

    response.status(StatusCodes.CREATED).json({ data: itinerary });
  };

  getItineraryById = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = itineraryIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid itinerary id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const itinerary = await this.itineraryService.getItineraryById(parsedParams.data.id);

    response.status(StatusCodes.OK).json({ data: itinerary });
  };

  getLatestItineraryByTripId = async (request: Request, response: Response): Promise<void> => {
    const parsedQuery = itineraryTripQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? 'Invalid itinerary query',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const itinerary = await this.itineraryService.getLatestItineraryByTripId(
      parsedQuery.data.tripId
    );

    response.status(StatusCodes.OK).json({ data: itinerary });
  };
}
