import twilio, { type Twilio } from 'twilio';

import { env } from '../../../config/env';

export interface SendWhatsAppMessageInput {
  to: string;
  body: string;
}

export class TwilioService {
  private readonly client: Twilio | null;
  private readonly fromWhatsAppNumber?: string;

  constructor() {
    const isConfigured =
      Boolean(env.TWILIO_ACCOUNT_SID) &&
      Boolean(env.TWILIO_AUTH_TOKEN) &&
      Boolean(env.TWILIO_WHATSAPP_NUMBER);

    this.client = isConfigured
      ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
      : null;
    this.fromWhatsAppNumber = env.TWILIO_WHATSAPP_NUMBER;
  }

  async sendWhatsAppMessage({
    to,
    body
  }: SendWhatsAppMessageInput): Promise<void> {
    if (!this.client || !this.fromWhatsAppNumber) {
      throw new Error('Twilio WhatsApp Sandbox is not configured');
    }

    await this.client.messages.create({
      from: this.fromWhatsAppNumber,
      to: this.normalizeWhatsAppRecipient(to),
      body
    });
  }

  private normalizeWhatsAppRecipient(to: string): string {
    return to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  }
}
