import { ConsentStatus, type PrismaClient, type Trip, type TripEvent } from '@prisma/client';

import type { TripRepository } from './trip.repository';
import type {
  CreateTripEventRepositoryInput,
  CreateTripRepositoryInput,
  TripSafetyBriefRecord,
  TripFamilyDashboardRecord,
  TripWithEvents
} from './trip.types';

export class PrismaTripRepository implements TripRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    return Boolean(user);
  }

  async tripExists(tripId: string): Promise<boolean> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true }
    });

    return Boolean(trip);
  }

  async createTrip(data: CreateTripRepositoryInput): Promise<Trip> {
    return this.prisma.trip.create({
      data
    });
  }

  async findTripById(tripId: string): Promise<TripWithEvents | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        events: {
          orderBy: {
            occurredAt: 'asc'
          }
        }
      }
    });
  }

  async findSafetyBriefByTripId(tripId: string): Promise<TripSafetyBriefRecord | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        title: true,
        destination: true,
        status: true,
        startDate: true,
        endDate: true,
        events: {
          orderBy: {
            occurredAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            eventType: true,
            title: true,
            description: true,
            occurredAt: true
          }
        }
      }
    });
  }

  async findFamilyDashboardByTripId(
    tripId: string,
    currentDate: Date
  ): Promise<TripFamilyDashboardRecord | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        userId: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        events: {
          orderBy: {
            occurredAt: 'asc'
          },
          select: {
            id: true,
            tripId: true,
            eventType: true,
            title: true,
            description: true,
            occurredAt: true,
            createdAt: true
          }
        },
        consents: {
          where: {
            status: ConsentStatus.ACTIVE,
            validFrom: {
              lte: currentDate
            },
            validUntil: {
              gt: currentDate
            }
          },
          select: {
            id: true,
            guardianId: true,
            tripId: true,
            status: true,
            shareScopes: true,
            validFrom: true,
            validUntil: true,
            guardian: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                relationship: true,
                email: true,
                phoneNumber: true,
                isPrimary: true
              }
            }
          }
        }
      }
    });
  }

  async createTripEvent(data: CreateTripEventRepositoryInput): Promise<TripEvent> {
    return this.prisma.tripEvent.create({
      data
    });
  }
}
