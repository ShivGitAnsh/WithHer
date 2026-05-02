import type { PrismaClient } from '@prisma/client';

import type { UserRepository } from './user.repository';
import type { UserProfileResponse, UserTestingContextResponse } from './user.types';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserById(userId: string): Promise<UserProfileResponse | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findTestingContext(): Promise<UserTestingContextResponse | null> {
    const latestTrip = await this.prisma.trip.findFirst({
      orderBy: [{ createdAt: 'desc' }, { startDate: 'desc' }],
      select: {
        userId: true
      }
    });

    if (!latestTrip) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: latestTrip.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        trips: {
          orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            userId: true,
            title: true,
            destination: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!user || user.trips.length === 0) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      trips: user.trips
    };
  }
}
