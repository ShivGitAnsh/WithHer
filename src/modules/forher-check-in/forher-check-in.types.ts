import { TripEventType, type CheckInRule, type Guardian, type Trip, type TripEvent } from '@prisma/client';
import { z } from 'zod';

import type { NotificationRecipient } from '../notification/notification.types';

export const tripCheckInRuleParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const createCheckInRuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  expectedEventType: z.nativeEnum(TripEventType),
  expectedAt: z.coerce.date(),
  graceMinutes: z.coerce.number().int().min(5).max(720).default(30)
});

export const checkInRuleIdParamsSchema = z.object({
  id: z.string().min(1, 'Check-in rule id is required')
});

export type TripCheckInRuleParams = z.infer<typeof tripCheckInRuleParamsSchema>;
export type CreateCheckInRuleInput = z.infer<typeof createCheckInRuleSchema>;
export type CheckInRuleIdParams = z.infer<typeof checkInRuleIdParamsSchema>;

export interface CreateCheckInRuleRepositoryInput {
  tripId: string;
  title: string;
  expectedEventType: TripEventType;
  expectedAt: Date;
  graceMinutes: number;
}

export type CheckInRuleRecord = CheckInRule;

export interface CheckInRuleContext {
  rule: CheckInRule;
  trip: Pick<Trip, 'id' | 'title' | 'destination' | 'status'>;
  matchingEvent: Pick<TripEvent, 'id' | 'title' | 'eventType' | 'description' | 'occurredAt'> | null;
  latestEvent: Pick<TripEvent, 'id' | 'title' | 'eventType' | 'description' | 'occurredAt'> | null;
  guardians: Array<Pick<Guardian, 'id' | 'fullName' | 'email' | 'phoneNumber' | 'relationship'>>;
}

export interface CheckInRuleListItem extends CheckInRuleRecord {
  trip: Pick<Trip, 'id' | 'title' | 'destination' | 'status'>;
}

export interface CheckInEvaluationResponse {
  rule: CheckInRuleRecord;
  completed: boolean;
  escalated: boolean;
  matchedEvent: CheckInRuleContext['matchingEvent'];
}

export interface ForHerCheckInRepository {
  tripExists(tripId: string): Promise<boolean>;
  createCheckInRule(input: CreateCheckInRuleRepositoryInput): Promise<CheckInRuleRecord>;
  findCheckInRulesByTripId(tripId: string): Promise<CheckInRuleListItem[]>;
  findPendingRuleIdsDueForEvaluation(currentDate: Date, limit: number): Promise<string[]>;
  findCheckInRuleContextById(ruleId: string, currentDate: Date): Promise<CheckInRuleContext | null>;
  updateRuleCompleted(
    ruleId: string,
    completedAt: Date,
    completedEventId: string
  ): Promise<CheckInRuleRecord>;
  updateRuleEscalated(ruleId: string, evaluatedAt: Date): Promise<CheckInRuleRecord>;
  findPendingRulesForEvent(
    tripId: string,
    eventType: TripEventType,
    occurredAt: Date
  ): Promise<CheckInRuleRecord[]>;
}

export const toCheckInNotificationRecipients = (
  guardians: CheckInRuleContext['guardians']
): NotificationRecipient[] =>
  guardians.map((guardian) => ({
    guardianId: guardian.id,
    fullName: guardian.fullName,
    email: guardian.email,
    phoneNumber: guardian.phoneNumber
  }));

export interface CheckInSchedulerRunSummary {
  scanned: number;
  completed: number;
  escalated: number;
  pending: number;
  errors: number;
}
