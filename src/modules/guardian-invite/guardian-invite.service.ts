import {
  ConsentAuditAction,
  ConsentAuditActorType,
  ConsentStatus,
  GuardianInviteStatus
} from '../../infrastructure/database/prisma/generated-client';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { GuardianInviteRepository } from './guardian-invite.repository';
import type { GuardianInviteDetails } from './guardian-invite.types';

export class GuardianInviteService {
  constructor(private readonly repository: GuardianInviteRepository) {}

  async getInviteByToken(token: string): Promise<GuardianInviteDetails> {
    const invite = await this.repository.findInviteByToken(token);

    if (!invite) {
      throw new AppError('Invite not found', StatusCodes.NOT_FOUND, 'INVITE_NOT_FOUND');
    }

    return this.normalizeInvite(invite);
  }

  async acceptInvite(token: string): Promise<GuardianInviteDetails> {
    const invite = await this.repository.findInviteByToken(token);

    if (!invite) {
      throw new AppError('Invite not found', StatusCodes.NOT_FOUND, 'INVITE_NOT_FOUND');
    }

    const normalizedInvite = await this.normalizeInvite(invite);

    if (normalizedInvite.status === GuardianInviteStatus.ACCEPTED) {
      return normalizedInvite;
    }

    if (normalizedInvite.status !== GuardianInviteStatus.PENDING) {
      throw new AppError(
        'Invite can no longer be accepted',
        StatusCodes.BAD_REQUEST,
        'INVITE_NOT_ACTIONABLE'
      );
    }

    if (normalizedInvite.consent.status !== ConsentStatus.ACTIVE) {
      throw new AppError(
        'The related trip share is no longer active',
        StatusCodes.BAD_REQUEST,
        'CONSENT_NOT_ACTIVE'
      );
    }

    const acceptedInvite = await this.repository.acceptInvite(normalizedInvite.id, new Date());

    await this.repository.createTrustLogEntry({
      consentId: acceptedInvite.consent.id,
      tripId: acceptedInvite.consent.tripId,
      guardianId: acceptedInvite.consent.guardianId,
      actorType: ConsentAuditActorType.GUARDIAN,
      action: ConsentAuditAction.INVITE_ACCEPTED,
      message: 'Guardian accepted the trip visibility invite.'
    });

    return acceptedInvite;
  }

  private async normalizeInvite(invite: GuardianInviteDetails): Promise<GuardianInviteDetails> {
    if (
      invite.status === GuardianInviteStatus.PENDING &&
      (invite.expiresAt <= new Date() || invite.consent.status !== ConsentStatus.ACTIVE)
    ) {
      const expiredInvite = await this.repository.expireInvite(invite.id);

      await this.repository.createTrustLogEntry({
        consentId: expiredInvite.consent.id,
        tripId: expiredInvite.consent.tripId,
        guardianId: expiredInvite.consent.guardianId,
        actorType: ConsentAuditActorType.SYSTEM,
        action: ConsentAuditAction.INVITE_EXPIRED,
        message: 'Guardian invite expired before acceptance.'
      });

      return expiredInvite;
    }

    return invite;
  }
}
