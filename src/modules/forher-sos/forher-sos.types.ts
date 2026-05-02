import {
  TripEventType,
  type EmergencyContact,
  type Guardian,
  type Trip,
  type TripEvent
} from '@prisma/client';
import { z } from 'zod';

import type { NotificationRecipient } from '../notification/notification.types';

export const triggerSosSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const getSosCaseParamsSchema = z.object({
  caseId: z.string().min(1, 'SOS case id is required')
});

export type TriggerSosInput = z.infer<typeof triggerSosSchema>;
export type GetSosCaseParams = z.infer<typeof getSosCaseParamsSchema>;

export interface SosTripContext {
  trip: Pick<Trip, 'id' | 'title'>;
  latestEvent: Pick<
    TripEvent,
    'id' | 'eventType' | 'title' | 'description' | 'occurredAt'
  > | null;
  guardians: Array<Pick<Guardian, 'id' | 'fullName' | 'email' | 'phoneNumber'>>;
}

export interface CreateSosEventRepositoryInput {
  tripId: string;
  occurredAt: Date;
}

export interface SosTriggerResult {
  event: Pick<
    TripEvent,
    'id' | 'tripId' | 'eventType' | 'title' | 'description' | 'occurredAt' | 'createdAt'
  >;
  duplicateSuppressed: boolean;
}

export interface SosCaseDetails {
  caseId: string;
  trip: Pick<Trip, 'id' | 'title' | 'destination' | 'status'>;
  sosEvent: Pick<
    TripEvent,
    'id' | 'tripId' | 'eventType' | 'title' | 'description' | 'occurredAt' | 'createdAt'
  >;
  latestEventBeforeSos: Pick<
    TripEvent,
    'id' | 'eventType' | 'title' | 'description' | 'occurredAt'
  > | null;
  guardians: Array<Pick<Guardian, 'id' | 'fullName' | 'relationship' | 'email' | 'phoneNumber'>>;
  emergencyContacts: Array<
    Pick<EmergencyContact, 'id' | 'fullName' | 'relationship' | 'phoneNumber' | 'isPrimary' | 'notes'>
  >;
  localSupport: {
    destinationLabel: string;
    helplines: Array<{
      label: string;
      phoneNumber: string;
      category: 'Police' | 'Women Helpline' | 'Medical' | 'Tourist Support';
      availability: string;
    }>;
    staySupport: {
      propertyName: string;
      frontDeskPhone: string;
      supportDeskLabel: string;
      supportDeskPhone?: string | null;
      addressHint: string;
      transferNote: string;
    };
  };
  escalationSteps: Array<{
    step: number;
    label: string;
    channel: 'WhatsApp' | 'Phone' | 'Front Desk' | 'Emergency Helpline';
    status: 'sent' | 'ready';
    description: string;
    contactName?: string | null;
    contactPhone?: string | null;
  }>;
  shareBundle: {
    headline: string;
    summary: string;
    latestStatus: string;
    triggeredAt: string;
    guardianMessage: string;
    actionChecklist: string[];
  };
}

export interface ForHerSosRepository {
  findTripContextByTripId(tripId: string, currentDate: Date): Promise<SosTripContext | null>;
  findRecentSosEventByTripId(
    tripId: string,
    occurredAfter: Date
  ): Promise<SosTriggerResult['event'] | null>;
  createSosEvent(input: CreateSosEventRepositoryInput): Promise<SosTriggerResult['event']>;
  findSosCaseById(caseId: string, currentDate: Date): Promise<SosCaseDetails | null>;
}

export const toNotificationRecipients = (
  guardians: SosTripContext['guardians']
): NotificationRecipient[] =>
  guardians.map((guardian) => ({
    guardianId: guardian.id,
    fullName: guardian.fullName,
    email: guardian.email,
    phoneNumber: guardian.phoneNumber
  }));

export const SOS_EVENT_TYPE = TripEventType.SOS_TRIGGERED;
