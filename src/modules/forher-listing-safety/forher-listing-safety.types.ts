import { z } from 'zod';

export const listingSafetyParamsSchema = z.object({
  listingId: z.string().min(1, 'Listing id is required')
});

export type ListingSafetyParams = z.infer<typeof listingSafetyParamsSchema>;

export interface ListingSafetyCatalogRecord {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  womenReviewScore?: number;
  verified?: boolean;
  transportAvailability?: 'LOW' | 'MEDIUM' | 'HIGH';
  nearPharmacy?: boolean;
  nearHospital?: boolean;
  nearPoliceStation?: boolean;
  convenience24x7?: boolean;
  womenReviewHighlights: string[];
  transferGuidance: string;
}

export interface ListingSafetyResponse {
  listingId: string;
  name: string;
  neighborhood: string;
  city: string;
  score: number;
  status: 'Safe' | 'Moderate' | 'Risky';
  recommendation: 'Recommended' | 'Use caution' | 'Not recommended';
  reasons: string[];
  womenReviewHighlights: string[];
  nearbyEssentials: string[];
  transferGuidance: string;
}

export interface ForHerListingSafetyRepository {
  findListingById(listingId: string): Promise<ListingSafetyCatalogRecord | null>;
}
