import { logger } from '../../config/logger';
import { TwilioService } from '../../infrastructure/communications/twilio/twilio.service';

import type { SendTripEventNotificationInput } from './notification.types';

export class NotificationService {
  constructor(private readonly twilioService: TwilioService) {}

  async sendTripEventNotification({
    recipients,
    payload
  }: SendTripEventNotificationInput): Promise<void> {
    await Promise.all(
      recipients.map(async (recipient) => {
        if (!recipient.phoneNumber) {
          logger.warn(
            { guardianId: recipient.guardianId, fullName: recipient.fullName },
            'Trip event WhatsApp skipped: guardian has no phoneNumber'
          );
          return;
        }

        const message = this.buildTripEventMessage(payload);

        try {
          await this.twilioService.sendWhatsAppMessage({
            to: recipient.phoneNumber,
            body: message
          });

          logger.info(
            {
              guardianId: recipient.guardianId,
              eventType: payload.eventType,
              tripTitle: payload.tripTitle
            },
            'Trip event WhatsApp message sent'
          );
        } catch (error) {
          logger.error(
            {
              err: error,
              guardianId: recipient.guardianId,
              guardianName: recipient.fullName,
              phoneNumber: recipient.phoneNumber
            },
            'Trip event WhatsApp send failed'
          );
        }
      })
    );
  }

  private buildTripEventMessage(
    payload: SendTripEventNotificationInput['payload']
  ): string {
    const formattedTime = new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(payload.timestamp));

    const messageLines = [
      payload.headline ?? '🚨 Travel Update',
      `Event: ${payload.eventType}`,
      `Trip: ${payload.tripTitle}`
    ];

    if (payload.lastEventSummary) {
      messageLines.push(`Last Update: ${payload.lastEventSummary}`);
    }

    messageLines.push(`Time: ${formattedTime}`);

    return messageLines.join('\n');
  }
}
