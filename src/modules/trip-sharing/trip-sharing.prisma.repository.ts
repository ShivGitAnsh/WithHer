import type { PrismaClient } from '@prisma/client';

import type { TripSharingRepository } from './trip-sharing.repository';
import type {
  ConsentRecord,
  CreateConsentRepositoryInput,
  GuardianOwnerRecord,
  TripOwnerRecord
} from './trip-sharing.types';

export class PrismaTripSharingRepository implements TripSharingRepository {
  constructor(private readonly prisma: PrismaClient) {}

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

  async createConsent(data: CreateConsentRepositoryInput): Promise<ConsentRecord> {
    return this.prisma.consent.create({
      data
    });
  }
}
