import { TripEventType, TripStatus, type Trip, type TripEvent } from '@prisma/client';
import { z } from 'zod';

export const forHerSafetyScoreParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export type ForHerSafetyScoreParams = z.infer<typeof forHerSafetyScoreParamsSchema>;

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

export const RECENT_CHECK_IN_EVENT_TYPES: TripEventType[] = [TripEventType.CHECKED_IN];
export const NIGHT_ARRIVAL_EVENT_TYPES: TripEventType[] = [
  TripEventType.ARRIVED,
  TripEventType.CHECKED_IN,
  TripEventType.HOME_REACHED
];
export const ACTIVE_TRIP_STATUSES: TripStatus[] = [TripStatus.ACTIVE];
