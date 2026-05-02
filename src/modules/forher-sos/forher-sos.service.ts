import { StatusCodes } from 'http-status-codes';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import { NotificationService } from '../notification/notification.service';
import type { ForHerSosRepository } from './forher-sos.repository';
import {
  SOS_EVENT_TYPE,
  toNotificationRecipients,
  type SosCaseDetails,
  type SosTripContext,
  type SosTriggerResult
} from './forher-sos.types';

const SOS_IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;

export class ForHerSosService {
  constructor(
    private readonly forHerSosRepository: ForHerSosRepository,
    private readonly notificationService: NotificationService
  ) {}

  async triggerSos(tripId: string): Promise<SosTriggerResult> {
    const now = new Date();
    const duplicateThreshold = new Date(now.getTime() - SOS_IDEMPOTENCY_WINDOW_MS);

    const recentSosEvent = await this.forHerSosRepository.findRecentSosEventByTripId(
      tripId,
      duplicateThreshold
    );

    if (recentSosEvent) {
      return {
        event: recentSosEvent,
        duplicateSuppressed: true
      };
    }

    const tripContext = await this.forHerSosRepository.findTripContextByTripId(tripId, now);

    if (!tripContext) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const sosEvent = await this.forHerSosRepository.createSosEvent({
      tripId,
      occurredAt: now
    });

    await this.sendSosNotifications(tripContext, sosEvent.occurredAt);

    return {
      event: sosEvent,
      duplicateSuppressed: false
    };
  }

  async getSosCase(caseId: string): Promise<SosCaseDetails> {
    const sosCase = await this.forHerSosRepository.findSosCaseById(caseId, new Date());

    if (!sosCase) {
      throw new AppError('SOS case not found', StatusCodes.NOT_FOUND, 'SOS_CASE_NOT_FOUND');
    }

    return sosCase;
  }

  private async sendSosNotifications(
    tripContext: SosTripContext,
    triggeredAt: Date
  ): Promise<void> {
    const recipients = toNotificationRecipients(
      this.getUniqueGuardians(tripContext.guardians)
    );

    if (recipients.length === 0) {
      logger.warn(
        { tripId: tripContext.trip.id },
        'SOS notification skipped: no guardians with active consent found for trip'
      );
      return;
    }

    try {
      await this.notificationService.sendTripEventNotification({
        recipients,
        payload: {
          headline: '🚨 SOS Alert',
          eventType: SOS_EVENT_TYPE,
          tripTitle: tripContext.trip.title,
          lastEventSummary: this.buildLastEventSummary(tripContext.latestEvent),
          timestamp: triggeredAt.toISOString()
        }
      });
    } catch (error) {
      logger.error(
        {
          err: error,
          tripId: tripContext.trip.id
        },
        'Failed to send SOS notifications'
      );
    }
  }

  private getUniqueGuardians(guardians: SosTripContext['guardians']): SosTripContext['guardians'] {
    return [...new Map(guardians.map((guardian) => [guardian.id, guardian])).values()];
  }

  private buildLastEventSummary(latestEvent: SosTripContext['latestEvent']): string {
    if (!latestEvent) {
      return 'No previous trip update recorded';
    }

    return latestEvent.title.trim().length > 0
      ? `${latestEvent.eventType} - ${latestEvent.title}`
      : latestEvent.eventType;
  }
}
