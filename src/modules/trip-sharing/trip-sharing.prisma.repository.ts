import {
  ConsentStatus,
  type Prisma,
  type PrismaClient
} from '../../infrastructure/database/prisma/generated-client';

import type { TripSharingRepository } from './trip-sharing.repository';
import type {
  ConsentList,
  ConsentRecord,
  CreateTrustLogEntryInput,
  CreateConsentRepositoryInput,
  GuardianOwnerRecord,
  TrustLogEntryRecord,
  TripOwnerRecord
} from './trip-sharing.types';

export class PrismaTripSharingRepository implements TripSharingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly consentSelect = {
    id: true,
    userId: true,
    guardianId: true,
    tripId: true,
    status: true,
    shareScopes: true,
    validFrom: true,
    validUntil: true,
    revokedAt: true,
    revokedReason: true,
    createdAt: true,
    updatedAt: true,
    guardian: {
      select: {
        id: true,
        fullName: true,
        relationship: true,
        phoneNumber: true,
        email: true
      }
    },
    guardianInvite: {
      select: {
        id: true,
        token: true,
        status: true,
        expiresAt: true,
        acceptedAt: true
      }
    },
    trip: {
      select: {
        id: true,
        title: true,
        destination: true,
        status: true
      }
    }
  } as const;

  private readonly trustLogSelect = {
    id: true,
    consentId: true,
    tripId: true,
    guardianId: true,
    actorType: true,
    action: true,
    message: true,
    metadata: true,
    createdAt: true,
    guardian: {
      select: {
        id: true,
        fullName: true,
        relationship: true
      }
    }
  } as const;

  async findTripOwnerByTripId(tripId: string): Promise<TripOwnerRecord | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        userId: true
      }
    });
  }

  async findGuardianOwnerByGuardianId(guardianId: string): Promise<GuardianOwnerRecord | null> {
    return this.prisma.guardian.findUnique({
      where: { id: guardianId },
      select: {
        id: true,
        userId: true
      }
    });
  }

  async findConsentById(consentId: string): Promise<ConsentRecord | null> {
    return this.prisma.consent.findUnique({
      where: { id: consentId }
    });
  }

  async findConsentDetailsById(consentId: string): Promise<ConsentList[number] | null> {
    return this.prisma.consent.findUnique({
      where: { id: consentId },
      select: this.consentSelect
    });
  }

  async findConsentsByUserId(userId: string): Promise<ConsentList> {
    return this.prisma.consent.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { validUntil: 'desc' }],
      select: this.consentSelect
    });
  }

  async findConsentsByTripId(tripId: string): Promise<ConsentList> {
    return this.prisma.consent.findMany({
      where: { tripId },
      orderBy: [{ status: 'asc' }, { validUntil: 'desc' }],
      select: this.consentSelect
    });
  }

  async findTrustLogByTripId(tripId: string): Promise<TrustLogEntryRecord[]> {
    return this.prisma.consentAuditLog.findMany({
      where: { tripId },
      orderBy: {
        createdAt: 'desc'
      },
      select: this.trustLogSelect
    });
  }

  async createConsent(data: CreateConsentRepositoryInput): Promise<ConsentRecord> {
    return this.prisma.consent.create({
      data: {
        userId: data.userId,
        guardianId: data.guardianId,
        tripId: data.tripId,
        shareScopes: data.shareScopes,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        guardianInvite: {
          create: {
            guardianId: data.guardianId,
            tripId: data.tripId,
            token: data.inviteToken,
            expiresAt: data.inviteExpiresAt
          }
        }
      }
    });
  }

  async createTrustLogEntry(data: CreateTrustLogEntryInput): Promise<void> {
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

  async revokeConsent(
    consentId: string,
    revokedAt: Date,
    revokedReason?: string
  ): Promise<ConsentRecord> {
    return this.prisma.consent.update({
      where: { id: consentId },
      data: {
        status: ConsentStatus.REVOKED,
        revokedAt,
        revokedReason
      }
    });
  }
}
