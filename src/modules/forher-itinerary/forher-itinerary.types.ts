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

export interface ItineraryPlanItem {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  safetyNote: string;
}

export interface ItineraryPlanDay {
  dayNumber: number;
  title: string;
  focus: string;
  items: ItineraryPlanItem[];
}

export interface StoredItineraryPayload {
  rationale: string[];
  days: ItineraryPlanDay[];
  fallbackUsed?: boolean;
}

export interface GeneratedItineraryLlmOutput {
  overview: string;
  rationale: string[];
  days: ItineraryPlanDay[];
}

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
  destination: string;
  numberOfDays: number;
  travelersCount: number;
  tripTitle?: string;
  tripStatus?: Trip['status'];
  startDate?: string;
  endDate?: string;
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
  fallbackUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForHerItineraryRepository {
  findTripContextById(tripId: string): Promise<ItineraryTripContext | null>;
  createItineraryPlan(input: GenerateItineraryRepositoryInput): Promise<ItineraryPlanRecord>;
  findItineraryPlanById(id: string): Promise<ItineraryPlanRecord | null>;
  findLatestItineraryPlanByTripId(tripId: string): Promise<ItineraryPlanRecord | null>;
}

export interface ItineraryLlmService {
  generateItinerary(input: ItineraryLlmInput): Promise<GeneratedItineraryLlmOutput>;
}
