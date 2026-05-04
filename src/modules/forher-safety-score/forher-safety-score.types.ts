import { TripStatus, type Trip } from '@prisma/client';
import { z } from 'zod';

export const forHerSafetyScoreParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export type ForHerSafetyScoreParams = z.infer<typeof forHerSafetyScoreParamsSchema>;

export type SafetyScoreTripRecord = Pick<
  Trip,
  'id' | 'title' | 'destination' | 'status' | 'startDate' | 'endDate'
>;

export type TripSafetyScoreRecord = SafetyScoreTripRecord;

export interface ForHerSafetyScoreResponse {
  score: number;
  status: 'Safe' | 'Moderate' | 'Risky';
  reasons: string[];
}

export interface WomenTravellerReview {
  reviewerLabel: string;
  travelContext: 'Solo' | 'Duo' | 'Friends';
  sentiment: 'Positive' | 'Mixed' | 'Cautious';
  rating: number;
  review: string;
  tags: string[];
}

export interface WomenTravellerReviewSet {
  destinationLabel: string;
  destinationKeywords: string[];
  reviews: WomenTravellerReview[];
}

export interface SafetyScoreLlmInput {
  tripTitle: string;
  destination: string;
  tripStatus: TripStatus;
  startDate: string;
  endDate: string;
  reviewSetLabel: string;
  reviews: WomenTravellerReview[];
}

export const llmSafetyScoreOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  reasons: z.array(z.string().min(1)).min(1).max(4)
});

export type SafetyScoreLlmOutput = z.infer<typeof llmSafetyScoreOutputSchema>;

export interface SafetyScoreLlmService {
  generateSafetyScore(input: SafetyScoreLlmInput): Promise<SafetyScoreLlmOutput>;
}

export interface ForHerSafetyScoreRepository {
  findTripSafetyScoreByTripId(tripId: string): Promise<TripSafetyScoreRecord | null>;
}
