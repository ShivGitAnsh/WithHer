import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { TripService } from './trip.service';
import {
  createTripEventSchema,
  createTripSchema,
  getTripsQuerySchema,
  tripFamilyDashboardParamsSchema,
  tripSafetyBriefParamsSchema,
  tripIdParamsSchema
} from './trip.types';

export class TripController {
  constructor(private readonly tripService: TripService) {}

  getTrips = async (request: Request, response: Response): Promise<void> => {
    const parsedQuery = getTripsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? 'Invalid trip query',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const trips = await this.tripService.getTripsByUserId(parsedQuery.data.userId);

    response.status(StatusCodes.OK).json({ data: trips });
  };

  createTrip = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = createTripSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(parsedBody.error.issues[0]?.message ?? 'Invalid trip payload', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const trip = await this.tripService.createTrip(parsedBody.data);

    response.status(StatusCodes.CREATED).json({ data: trip });
  };

  getTripById = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(parsedParams.error.issues[0]?.message ?? 'Invalid trip id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const trip = await this.tripService.getTripById(parsedParams.data.id);

    response.status(StatusCodes.OK).json({ data: trip });
  };

  getFamilyDashboard = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripFamilyDashboardParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const dashboard = await this.tripService.getFamilyDashboard(parsedParams.data.tripId);

    response.status(StatusCodes.OK).json({ data: dashboard });
  };

  generateSafetyBrief = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripSafetyBriefParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const safetyBrief = await this.tripService.generateSafetyBrief(parsedParams.data.tripId);

    response.status(StatusCodes.OK).json({ data: safetyBrief });
  };

  addTripEvent = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(parsedParams.error.issues[0]?.message ?? 'Invalid trip id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const parsedBody = createTripEventSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(parsedBody.error.issues[0]?.message ?? 'Invalid trip event payload', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const tripEvent = await this.tripService.addTripEvent(parsedParams.data.id, parsedBody.data);

    response.status(StatusCodes.CREATED).json({ data: tripEvent });
  };
}
