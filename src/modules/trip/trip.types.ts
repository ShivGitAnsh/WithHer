import {
  type Consent,
  type Guardian,
  TripEventType,
  TripStatus,
  type Trip,
  type TripEvent
} from '@prisma/client';
import { z } from 'zod';

export const tripIdParamsSchema = z.object({
  id: z.string().min(1, 'Trip id is required')
});

export const tripFamilyDashboardParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const tripSafetyBriefParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const createTripSchema = z
  .object({
    userId: z.string().min(1, 'User id is required'),
    title: z.string().min(1, 'Title is required'),
    destination: z.string().min(1, 'Destination is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
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

export const createTripEventSchema = z.object({
  eventType: z.nativeEnum(TripEventType),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1).optional(),
  occurredAt: z.coerce.date().optional()
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CreateTripEventInput = z.infer<typeof createTripEventSchema>;
export type TripIdParams = z.infer<typeof tripIdParamsSchema>;
export type TripFamilyDashboardParams = z.infer<typeof tripFamilyDashboardParamsSchema>;
export type TripSafetyBriefParams = z.infer<typeof tripSafetyBriefParamsSchema>;

export interface CreateTripRepositoryInput {
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: TripStatus;
}

export interface CreateTripEventRepositoryInput {
  tripId: string;
  eventType: TripEventType;
  title: string;
  description?: string;
  occurredAt: Date;
}

export type TripWithEvents = Trip & {
  events: TripEvent[];
};

export type FamilyDashboardTrip = Pick<
  Trip,
  'id' | 'userId' | 'title' | 'destination' | 'startDate' | 'endDate' | 'status' | 'createdAt' | 'updatedAt'
>;

export type FamilyDashboardEvent = Pick<
  TripEvent,
  'id' | 'tripId' | 'eventType' | 'title' | 'description' | 'occurredAt' | 'createdAt'
>;

export type FamilyDashboardGuardian = Pick<
  Guardian,
  'id' | 'userId' | 'fullName' | 'relationship' | 'email' | 'phoneNumber' | 'isPrimary'
>;

export type ActiveConsentWithGuardian = Pick<
  Consent,
  'id' | 'guardianId' | 'tripId' | 'status' | 'shareScopes' | 'validFrom' | 'validUntil'
> & {
  guardian: FamilyDashboardGuardian;
};

export type TripFamilyDashboardRecord = FamilyDashboardTrip & {
  events: FamilyDashboardEvent[];
  consents: ActiveConsentWithGuardian[];
};

export interface FamilyDashboardResponse {
  trip: FamilyDashboardTrip;
  latestEvent: FamilyDashboardEvent | null;
  timeline: FamilyDashboardEvent[];
  guardians: FamilyDashboardGuardian[];
}

export type SafetyBriefTrip = Pick<
  Trip,
  'id' | 'title' | 'destination' | 'status' | 'startDate' | 'endDate'
>;

export type SafetyBriefLatestEvent = Pick<
  TripEvent,
  'id' | 'eventType' | 'title' | 'description' | 'occurredAt'
>;

export type TripSafetyBriefRecord = SafetyBriefTrip & {
  events: SafetyBriefLatestEvent[];
};

export interface SafetyBriefLlmInput {
  tripTitle: string;
  destination: string;
  tripStatus: TripStatus;
  startDate: string;
  endDate: string;
  latestEvent: {
    eventType: string;
    title: string;
    description?: string | null;
    occurredAt: string;
  } | null;
}

export interface SafetyBriefResponse {
  brief: string;
  fallbackUsed: boolean;
}

export interface SafetyBriefLlmService {
  generateSafetyBrief(input: SafetyBriefLlmInput): Promise<string>;
}
