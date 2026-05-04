import type { PrismaClient } from '@prisma/client';

import type {
  ForHerSafetyScoreRepository,
  TripSafetyScoreRecord
} from './forher-safety-score.types';

export class PrismaForHerSafetyScoreRepository
  implements ForHerSafetyScoreRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findTripSafetyScoreByTripId(
    tripId: string
  ): Promise<TripSafetyScoreRecord | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        title: true,
        destination: true,
        status: true,
        startDate: true,
        endDate: true
      }
    });
  }
}
