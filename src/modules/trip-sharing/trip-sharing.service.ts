import { StatusCodes } from 'http-status-codes';
import type { Consent } from '@prisma/client';

import { AppError } from '../../shared/errors/app-error';
import type { TripSharingRepository } from './trip-sharing.repository';
import type { CreateTripSharingInput } from './trip-sharing.types';

export class TripSharingService {
  constructor(private readonly tripSharingRepository: TripSharingRepository) {}

  async createConsent(tripId: string, input: CreateTripSharingInput): Promise<Consent> {
    const trip = await this.tripSharingRepository.findTripOwnerByTripId(tripId);

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const guardian = await this.tripSharingRepository.findGuardianOwnerByGuardianId(input.guardianId);

    if (!guardian) {
      throw new AppError('Guardian not found', StatusCodes.NOT_FOUND, 'GUARDIAN_NOT_FOUND');
    }

    if (guardian.userId !== trip.userId) {
      throw new AppError(
        'Guardian does not belong to the trip owner',
        StatusCodes.BAD_REQUEST,
        'GUARDIAN_USER_MISMATCH'
      );
    }

    const validFrom = new Date();

    if (input.validUntil <= validFrom) {
      throw new AppError(
        'validUntil must be a future date',
        StatusCodes.BAD_REQUEST,
        'INVALID_VALID_UNTIL'
      );
    }

    return this.tripSharingRepository.createConsent({
      userId: trip.userId,
      guardianId: guardian.id,
      tripId: trip.id,
      shareScopes: input.shareScopes,
      validFrom,
      validUntil: input.validUntil
    });
  }
}
