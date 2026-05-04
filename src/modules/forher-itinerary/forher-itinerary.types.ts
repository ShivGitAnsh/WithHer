import { type ItineraryPlan, type Trip } from '@prisma/client';
import { z } from 'zod';

export const generateItinerarySchema = z
  .object({
    tripId: z.string().min(1, 'Trip id is required').optional(),
    destination: z.string().min(1, 'Destination is required').optional(),
    numberOfDays: z.coerce.number().int().min(1, 'Number of days must be at least 1'),
    travelersCount: z.coerce.number().int().min(1).max(12).default(1)
  })
  .refine((value) => Boolean(value.tripId || value.destination), {
    message: 'Either tripId or destination is required'
  });

export const itineraryIdParamsSchema = z.object({
  id: z.string().min(1, 'Itinerary id is required')
});

export const itineraryTripQuerySchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
export type ItineraryIdParams = z.infer<typeof itineraryIdParamsSchema>;
export type ItineraryTripQuery = z.infer<typeof itineraryTripQuerySchema>;

export const itineraryPlanItemSchema = z.object({
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  title: z.string().min(1, 'Item title is required'),
  description: z.string().min(1, 'Item description is required'),
  safetyNote: z.string().min(1, 'Safety note is required')
});

export const itineraryPlanDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, 'Day title is required'),
  focus: z.string().min(1, 'Day focus is required'),
  items: z.array(itineraryPlanItemSchema).min(1, 'Each day needs at least one item')
});

export const storedItineraryPayloadSchema = z.object({
  rationale: z.array(z.string().min(1)).min(1, 'At least one rationale point is required'),
  days: z.array(itineraryPlanDaySchema).min(1, 'At least one day is required')
});

export type ItineraryPlanItem = z.infer<typeof itineraryPlanItemSchema>;
export type ItineraryPlanDay = z.infer<typeof itineraryPlanDaySchema>;
export type StoredItineraryPayload = z.infer<typeof storedItineraryPayloadSchema>;

export interface GenerateItineraryRepositoryInput {
  tripId?: string;
  destination: string;
  numberOfDays: number;
  travelersCount: number;
  title: string;
  overview: string;
  generatedPlan: StoredItineraryPayload;
}

export type ItineraryTripContext = Pick<
  Trip,
  'id' | 'title' | 'destination' | 'startDate' | 'endDate' | 'status'
>;

export interface ItineraryLlmInput {
  tripTitle?: string;
  destination: string;
  tripStatus?: string;
  startDate?: string;
  endDate?: string;
  numberOfDays: number;
  travelersCount: number;
}

export interface ItineraryLlmOutput {
  title: string;
  overview: string;
  generatedPlan: StoredItineraryPayload;
}

export interface ItineraryLlmService {
  generateItinerary(input: ItineraryLlmInput): Promise<ItineraryLlmOutput>;
}

export type ItineraryPlanRecord = Pick<
  ItineraryPlan,
  | 'id'
  | 'tripId'
  | 'destination'
  | 'numberOfDays'
  | 'travelersCount'
  | 'title'
  | 'overview'
  | 'createdAt'
  | 'updatedAt'
> & {
  generatedPlan: StoredItineraryPayload;
};

export interface ItineraryPlanResponse {
  id: string;
  tripId?: string | null;
  destination: string;
  numberOfDays: number;
  travelersCount: number;
  title: string;
  overview: string;
  rationale: string[];
  days: ItineraryPlanDay[];
  generationSource: 'llm';
  createdAt: Date;
  updatedAt: Date;
}

export interface ForHerItineraryRepository {
  findTripContextById(tripId: string): Promise<ItineraryTripContext | null>;
  createItineraryPlan(input: GenerateItineraryRepositoryInput): Promise<ItineraryPlanRecord>;
  findItineraryPlanById(id: string): Promise<ItineraryPlanRecord | null>;
  findLatestItineraryPlanByTripId(tripId: string): Promise<ItineraryPlanRecord | null>;
}
