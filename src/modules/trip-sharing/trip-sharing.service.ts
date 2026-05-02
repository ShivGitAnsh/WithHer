import { StatusCodes } from 'http-status-codes';
import {
  ConsentAuditAction,
  ConsentAuditActorType,
  ConsentStatus,
  type Consent
} from '../../infrastructure/database/prisma/generated-client';
import { randomUUID } from 'node:crypto';

import { AppError } from '../../shared/errors/app-error';
import type { TripSharingRepository } from './trip-sharing.repository';
import type {
  ConsentList,
  CreateForHerConsentInput,
  CreateTripSharingInput,
  GetConsentsQuery,
  RevokeConsentInput,
  TrustLogEntryRecord
} from './trip-sharing.types';

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

    const consent = await this.tripSharingRepository.createConsent({
      userId: trip.userId,
      guardianId: guardian.id,
      tripId: trip.id,
      shareScopes: input.shareScopes,
      validFrom,
      validUntil: input.validUntil,
      inviteToken: randomUUID(),
      inviteExpiresAt: input.validUntil
    });

    await this.tripSharingRepository.createTrustLogEntry({
      consentId: consent.id,
      tripId: trip.id,
      guardianId: guardian.id,
      actorType: ConsentAuditActorType.TRAVELLER,
      action: ConsentAuditAction.CONSENT_CREATED,
      message: 'Trip visibility created for a guardian.',
      metadata: {
        shareScopes: input.shareScopes,
        validUntil: input.validUntil.toISOString()
      }
    });
    await this.tripSharingRepository.createTrustLogEntry({
      consentId: consent.id,
      tripId: trip.id,
      guardianId: guardian.id,
      actorType: ConsentAuditActorType.SYSTEM,
      action: ConsentAuditAction.INVITE_CREATED,
      message: 'Guardian invite generated and awaiting acceptance.',
      metadata: {
        expiresAt: input.validUntil.toISOString()
      }
    });

    return consent;
  }

  async createForHerConsent(input: CreateForHerConsentInput): Promise<Consent> {
    return this.createConsent(input.tripId, input);
  }

  async getConsentDetails(consentId: string): Promise<ConsentList[number]> {
    const consent = await this.tripSharingRepository.findConsentDetailsById(consentId);

    if (!consent) {
      throw new AppError('Consent not found', StatusCodes.NOT_FOUND, 'CONSENT_NOT_FOUND');
    }

    return consent;
  }

  async getConsents(query: GetConsentsQuery): Promise<ConsentList> {
    if (query.tripId) {
      return this.tripSharingRepository.findConsentsByTripId(query.tripId);
    }

    if (query.userId) {
      return this.tripSharingRepository.findConsentsByUserId(query.userId);
    }

    throw new AppError(
      'Either userId or tripId is required',
      StatusCodes.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }

  async getTrustLog(tripId: string): Promise<TrustLogEntryRecord[]> {
    const trip = await this.tripSharingRepository.findTripOwnerByTripId(tripId);

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    return this.tripSharingRepository.findTrustLogByTripId(tripId);
  }

  async revokeConsent(consentId: string, input?: RevokeConsentInput): Promise<Consent> {
    const consent = await this.tripSharingRepository.findConsentById(consentId);

    if (!consent) {
      throw new AppError('Consent not found', StatusCodes.NOT_FOUND, 'CONSENT_NOT_FOUND');
    }

    if (consent.status === ConsentStatus.REVOKED) {
      return consent;
    }

    const revokedConsent = await this.tripSharingRepository.revokeConsent(
      consentId,
      new Date(),
      input?.reason
    );

    await this.tripSharingRepository.createTrustLogEntry({
      consentId: revokedConsent.id,
      tripId: revokedConsent.tripId,
      guardianId: revokedConsent.guardianId,
      actorType: ConsentAuditActorType.TRAVELLER,
      action: ConsentAuditAction.CONSENT_REVOKED,
      message: input?.reason
        ? `Trip visibility revoked. Reason: ${input.reason}`
        : 'Trip visibility revoked by traveller.',
      metadata: input?.reason
        ? {
            reason: input.reason
          }
        : null
    });

    return revokedConsent;
  }
}
