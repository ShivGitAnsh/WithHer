import {
  GuardianInviteStatus,
  type Prisma,
  type PrismaClient
} from '../../infrastructure/database/prisma/generated-client';

import type { GuardianInviteRepository } from './guardian-invite.repository';
import type { GuardianInviteDetails } from './guardian-invite.types';

const inviteSelect = {
  id: true,
  token: true,
  status: true,
  expiresAt: true,
  acceptedAt: true,
  guardian: {
    select: {
      id: true,
      fullName: true,
      relationship: true,
      email: true,
      phoneNumber: true
    }
  },
  trip: {
    select: {
      id: true,
      title: true,
      destination: true,
      status: true,
      startDate: true,
      endDate: true
    }
  },
  consent: {
    select: {
      id: true,
      guardianId: true,
      tripId: true,
      status: true,
      shareScopes: true,
      validUntil: true
    }
  }
} as const;

export class PrismaGuardianInviteRepository implements GuardianInviteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findInviteByToken(token: string): Promise<GuardianInviteDetails | null> {
    return this.prisma.guardianInvite.findUnique({
      where: { token },
      select: inviteSelect
    });
  }

  async acceptInvite(inviteId: string, acceptedAt: Date): Promise<GuardianInviteDetails> {
    return this.prisma.guardianInvite.update({
      where: { id: inviteId },
      data: {
        status: GuardianInviteStatus.ACCEPTED,
        acceptedAt
      },
      select: inviteSelect
    });
  }

  async expireInvite(inviteId: string): Promise<GuardianInviteDetails> {
    return this.prisma.guardianInvite.update({
      where: { id: inviteId },
      data: {
        status: GuardianInviteStatus.EXPIRED
      },
      select: inviteSelect
    });
  }

  async createTrustLogEntry(data: Parameters<GuardianInviteRepository['createTrustLogEntry']>[0]): Promise<void> {
    await this.prisma.consentAuditLog.create({
      data: {
        consentId: data.consentId,
        tripId: data.tripId,
        guardianId: data.guardianId,
        actorType: data.actorType,
        action: data.action,
        message: data.message,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
  }
}
