import { ConsentStatus, type Consent, type Guardian, type Trip, type TripEvent } from '@prisma/client';

import type { NotificationRecipient, TripEventNotificationPayload } from '../notification/notification.types';

export interface TripNotificationContext {
  trip: Pick<Trip, 'id' | 'title'>;
  event: Pick<TripEvent, 'id' | 'tripId' | 'eventType' | 'occurredAt'>;
}

export interface ActiveTripConsent extends Pick<Consent, 'id' | 'guardianId' | 'tripId' | 'status' | 'validFrom' | 'validUntil'> {
  status: ConsentStatus.ACTIVE;
}

export type GuardianRecipientRecord = Pick<
  Guardian,
  'id' | 'fullName' | 'email' | 'phoneNumber'
>;

export interface TripEventNotificationRepository {
  findTripNotificationContextByEventId(eventId: string): Promise<TripNotificationContext | null>;
  findActiveConsentsByTripId(tripId: string, currentDate: Date): Promise<ActiveTripConsent[]>;
  findGuardiansByIds(guardianIds: string[]): Promise<GuardianRecipientRecord[]>;
}

export interface TripEventNotificationHandler {
  handleTripEventCreated(eventId: string): Promise<void>;
}

export const toNotificationRecipients = (
  guardians: GuardianRecipientRecord[]
): NotificationRecipient[] =>
  guardians.map((guardian) => ({
    guardianId: guardian.id,
    fullName: guardian.fullName,
    email: guardian.email,
    phoneNumber: guardian.phoneNumber
  }));

export const toTripEventNotificationPayload = (
  context: TripNotificationContext
): TripEventNotificationPayload => ({
  eventType: context.event.eventType,
  tripTitle: context.trip.title,
  timestamp: context.event.occurredAt.toISOString()
});
