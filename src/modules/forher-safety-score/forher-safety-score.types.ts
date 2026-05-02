import { TripEventType, TripStatus, type Trip, type TripEvent } from '@prisma/client';
import { z } from 'zod';

export const forHerSafetyScoreParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

const safetyScoreEventInputSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  title: z.string().min(1, 'Event title is required'),
  occurredAt: z.coerce.date()
});

export const generateSafetyScoreSchema = z
  .object({
    tripId: z.string().min(1, 'Trip id is required').optional(),
    tripTitle: z.string().min(1, 'Trip title is required').optional(),
    destination: z.string().min(1, 'Destination is required'),
    tripStatus: z.nativeEnum(TripStatus),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    recentEvents: z.array(safetyScoreEventInputSchema).max(12).default([]),
    latestEvent: safetyScoreEventInputSchema.nullish(),
    latestCheckIn: safetyScoreEventInputSchema.nullish()
  })
  .superRefine((value, context) => {
    if (value.endDate < value.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after start date',
        path: ['endDate']
      });
    }
  });

export type ForHerSafetyScoreParams = z.infer<typeof forHerSafetyScoreParamsSchema>;
export type GenerateSafetyScoreInput = z.infer<typeof generateSafetyScoreSchema>;

export type SafetyScoreTripRecord = Pick<
  Trip,
  'id' | 'status' | 'startDate' | 'endDate'
>;

export type SafetyScoreEventRecord = Pick<
  TripEvent,
  'id' | 'tripId' | 'eventType' | 'title' | 'occurredAt'
>;

export type TripSafetyScoreRecord = SafetyScoreTripRecord & {
  events: SafetyScoreEventRecord[];
};

export interface ForHerSafetyScoreResponse {
  score: number;
  status: 'Safe' | 'Moderate' | 'Risky';
  reasons: string[];
  fallbackUsed: boolean;
}

export interface SafetyScoreLlmInput {
  tripId: string;
  tripTitle?: string;
  destination?: string;
  tripStatus: TripStatus;
  startDate: string;
  endDate: string;
  recentEvents: Array<{
    eventType: string;
    title: string;
    occurredAt: string;
  }>;
  latestEvent: {
    eventType: string;
    title: string;
    occurredAt: string;
  } | null;
  latestCheckIn: {
    eventType: string;
    title: string;
    occurredAt: string;
  } | null;
}

export interface SafetyScoreRuleContext {
  trip: SafetyScoreTripRecord;
  latestEvent: SafetyScoreEventRecord | null;
  latestCheckIn: SafetyScoreEventRecord | null;
  now: Date;
}

export interface SafetyScoreRuleResult {
  scoreDelta: number;
  reason?: string;
}

export interface ForHerSafetyScoreRepository {
  findTripSafetyScoreByTripId(tripId: string): Promise<TripSafetyScoreRecord | null>;
}

export interface SafetyScoreLlmService {
  generateSafetyScore(input: SafetyScoreLlmInput): Promise<ForHerSafetyScoreResponse>;
}

export const RECENT_CHECK_IN_EVENT_TYPES: TripEventType[] = [TripEventType.CHECKED_IN];
export const NIGHT_ARRIVAL_EVENT_TYPES: TripEventType[] = [
  TripEventType.ARRIVED,
  TripEventType.CHECKED_IN,
  TripEventType.HOME_REACHED
];
export const ACTIVE_TRIP_STATUSES: TripStatus[] = [TripStatus.ACTIVE];
