import { logger } from '../../config/logger';
import { NotificationService } from '../notification/notification.service';

import type {
  TripEventNotificationHandler,
  TripEventNotificationRepository
} from './trip-event-notification.types';
import {
  toNotificationRecipients,
  toTripEventNotificationPayload
} from './trip-event-notification.types';

export class TripEventNotificationHandlerService
  implements TripEventNotificationHandler
{
  constructor(
    private readonly tripEventNotificationRepository: TripEventNotificationRepository,
    private readonly notificationService: NotificationService
  ) {}

  async handleTripEventCreated(eventId: string): Promise<void> {
    const context =
      await this.tripEventNotificationRepository.findTripNotificationContextByEventId(eventId);

    if (!context) {
      logger.warn({ eventId }, 'Skipping trip event notification because event context was not found');
      return;
    }

    const now = new Date();
    const activeConsents = await this.tripEventNotificationRepository.findActiveConsentsByTripId(
      context.trip.id,
      now
    );

    if (activeConsents.length === 0) {
      logger.warn(
        { tripId: context.trip.id, eventId },
        'Trip event notification skipped: no active consents for trip (status, tripId, or validFrom/validUntil window)'
      );
      return;
    }

    const guardianIds = [...new Set(activeConsents.map((consent) => consent.guardianId))];
    const guardians = await this.tripEventNotificationRepository.findGuardiansByIds(guardianIds);

    if (guardians.length === 0) {
      logger.warn({ tripId: context.trip.id, eventId, guardianIds }, 'Trip event notification skipped: no guardian rows');
      return;
    }

    await this.notificationService.sendTripEventNotification({
      recipients: toNotificationRecipients(guardians),
      payload: toTripEventNotificationPayload(context)
    });
  }
}
