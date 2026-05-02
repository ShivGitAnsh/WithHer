import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { TripSharingService } from './trip-sharing.service';
import {
  createForHerConsentSchema,
  getConsentsQuerySchema,
  createTripSharingParamsSchema,
  createTripSharingSchema,
  revokeConsentSchema,
  revokeConsentParamsSchema
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

    const consentDetails = await this.tripSharingService.getConsentDetails(consent.id);

    response.status(StatusCodes.CREATED).json({ data: consentDetails });
  };

  createForHerConsent = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = createForHerConsentSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid consent payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const consent = await this.tripSharingService.createForHerConsent(parsedBody.data);

    const consentDetails = await this.tripSharingService.getConsentDetails(consent.id);

    response.status(StatusCodes.CREATED).json({ data: consentDetails });
  };

  getConsents = async (request: Request, response: Response): Promise<void> => {
    const parsedQuery = getConsentsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? 'Invalid consent query',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const consents = await this.tripSharingService.getConsents(parsedQuery.data);

    response.status(StatusCodes.OK).json({ data: consents });
  };

  getTrustLog = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = createTripSharingParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const trustLog = await this.tripSharingService.getTrustLog(parsedParams.data.tripId);

    response.status(StatusCodes.OK).json({ data: trustLog });
  };

  revokeConsent = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = revokeConsentParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid consent id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const parsedBody = revokeConsentSchema.safeParse(request.body ?? {});

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid revoke payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const consent = await this.tripSharingService.revokeConsent(
      parsedParams.data.id,
      parsedBody.data
    );

    const consentDetails = await this.tripSharingService.getConsentDetails(consent.id);

    response.status(StatusCodes.OK).json({ data: consentDetails });
  };
}
