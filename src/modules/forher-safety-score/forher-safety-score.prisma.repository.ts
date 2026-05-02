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
        status: true,
        startDate: true,
        endDate: true,
        events: {
          orderBy: {
            occurredAt: 'desc'
          },
          select: {
            id: true,
            tripId: true,
            eventType: true,
            title: true,
            occurredAt: true
          }
        }
      }
    });
  }
}
