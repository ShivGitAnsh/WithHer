import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerBookingSafetyService } from './forher-booking-safety.service';
import {
  rankFlightOptionsSchema,
  rankHotelOptionsSchema
} from './forher-booking-safety.types';

export class ForHerBookingSafetyController {
  constructor(private readonly forHerBookingSafetyService: ForHerBookingSafetyService) {}

  rankFlightOptions = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = rankFlightOptionsSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid flight ranking payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const options = this.forHerBookingSafetyService.rankFlightOptions(parsedBody.data.options);

    response.status(StatusCodes.OK).json({ data: options });
  };

  rankHotelOptions = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = rankHotelOptionsSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid hotel ranking payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const options = this.forHerBookingSafetyService.rankHotelOptions(parsedBody.data.options);

    response.status(StatusCodes.OK).json({ data: options });
  };
}
