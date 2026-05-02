import { ConsentStatus, GuardianInviteStatus, type PrismaClient } from '@prisma/client';

import type {
  ActiveTripConsent,
  GuardianRecipientRecord,
  TripEventNotificationRepository,
  TripNotificationContext
} from './trip-event-notification.types';

export class PrismaTripEventNotificationRepository
  implements TripEventNotificationRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findTripNotificationContextByEventId(
    eventId: string
  ): Promise<TripNotificationContext | null> {
    const tripEvent = await this.prisma.tripEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        tripId: true,
        eventType: true,
        occurredAt: true,
        trip: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!tripEvent) {
      return null;
    }

    return {
      trip: tripEvent.trip,
      event: {
        id: tripEvent.id,
        tripId: tripEvent.tripId,
        eventType: tripEvent.eventType,
        occurredAt: tripEvent.occurredAt
      }
    };
  }

  async findActiveConsentsByTripId(
    tripId: string,
    currentDate: Date
  ): Promise<ActiveTripConsent[]> {
    return this.prisma.consent.findMany({
      where: {
        tripId,
        status: ConsentStatus.ACTIVE,
        validFrom: {
          lte: currentDate
        },
        validUntil: {
          gt: currentDate
        },
        OR: [
          {
            guardianInvite: {
              is: null
            }
          },
          {
            guardianInvite: {
              is: {
                status: GuardianInviteStatus.ACCEPTED
              }
            }
          }
        ]
      },
      select: {
        id: true,
        guardianId: true,
        tripId: true,
        status: true,
        validFrom: true,
        validUntil: true
      }
    }) as Promise<ActiveTripConsent[]>;
  }

  async findGuardiansByIds(guardianIds: string[]): Promise<GuardianRecipientRecord[]> {
    if (guardianIds.length === 0) {
      return [];
    }

    return this.prisma.guardian.findMany({
      where: {
        id: {
          in: guardianIds
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true
      }
    });
  }
}
