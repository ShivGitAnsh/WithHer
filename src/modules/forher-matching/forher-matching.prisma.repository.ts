import { MatchConnectionStatus, MatchProfileStatus, type PrismaClient } from '@prisma/client';

import type { ForHerMatchingRepository } from './forher-matching.repository';
import type {
  MatchCandidateProfileRecord,
  MatchConnectionRecord,
  MatchProfileRecord,
  MatchingTripContext
} from './forher-matching.types';

export class PrismaForHerMatchingRepository implements ForHerMatchingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findTripById(tripId: string): Promise<MatchingTripContext | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        userId: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        status: true
      }
    });
  }

  async findProfileByTripId(tripId: string): Promise<MatchProfileRecord | null> {
    return this.prisma.matchProfile.findUnique({
      where: {
        tripId
      }
    });
  }

  async upsertProfileByTripId(input: {
    tripId: string;
    userId: string;
    displayName: string;
    city?: string;
    travelStyle?: string;
    hotelPreference?: string;
    interests: string[];
  }): Promise<MatchProfileRecord> {
    return this.prisma.matchProfile.upsert({
      where: {
        tripId: input.tripId
      },
      update: {
        displayName: input.displayName,
        city: input.city,
        travelStyle: input.travelStyle,
        hotelPreference: input.hotelPreference,
        interests: input.interests,
        status: MatchProfileStatus.ACTIVE
      },
      create: {
        tripId: input.tripId,
        userId: input.userId,
        displayName: input.displayName,
        city: input.city,
        travelStyle: input.travelStyle,
        hotelPreference: input.hotelPreference,
        interests: input.interests,
        status: MatchProfileStatus.ACTIVE
      }
    });
  }

  async findCandidateProfiles(
    tripId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    userId: string
  ): Promise<MatchCandidateProfileRecord[]> {
    return this.prisma.matchProfile.findMany({
      where: {
        tripId: {
          not: tripId
        },
        userId: {
          not: userId
        },
        status: MatchProfileStatus.ACTIVE,
        trip: {
          destination,
          startDate: {
            lte: endDate
          },
          endDate: {
            gte: startDate
          }
        }
      },
      select: {
        id: true,
        userId: true,
        tripId: true,
        displayName: true,
        city: true,
        travelStyle: true,
        hotelPreference: true,
        interests: true,
        status: true,
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    });
  }

  async findConnectionsForSourceProfile(sourceProfileId: string): Promise<MatchConnectionRecord[]> {
    return this.prisma.matchConnection.findMany({
      where: {
        OR: [{ sourceProfileId }, { targetProfileId: sourceProfileId }]
      }
    });
  }

  async createOrUpdateConnection(
    sourceProfileId: string,
    targetProfileId: string
  ): Promise<MatchConnectionRecord> {
    return this.prisma.matchConnection.upsert({
      where: {
        sourceProfileId_targetProfileId: {
          sourceProfileId,
          targetProfileId
        }
      },
      update: {
        status: MatchConnectionStatus.CONNECTED
      },
      create: {
        sourceProfileId,
        targetProfileId,
        status: MatchConnectionStatus.CONNECTED
      }
    });
  }

  async findCandidateProfileById(profileId: string): Promise<MatchCandidateProfileRecord | null> {
    return this.prisma.matchProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        userId: true,
        tripId: true,
        displayName: true,
        city: true,
        travelStyle: true,
        hotelPreference: true,
        interests: true,
        status: true,
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    });
  }
}
