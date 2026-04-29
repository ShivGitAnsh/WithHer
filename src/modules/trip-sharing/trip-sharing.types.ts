import type { Consent, Prisma } from '@prisma/client';
import { z } from 'zod';

export const createTripSharingParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const createTripSharingSchema = z.object({
  guardianId: z.string().min(1, 'Guardian id is required'),
  shareScopes: z.array(z.string().min(1, 'Share scopes must not be empty')).min(1, 'At least one share scope is required'),
  validUntil: z.coerce.date()
});

export type CreateTripSharingParams = z.infer<typeof createTripSharingParamsSchema>;
export type CreateTripSharingInput = z.infer<typeof createTripSharingSchema>;

export interface TripOwnerRecord {
  id: string;
  userId: string;
}

export interface GuardianOwnerRecord {
  id: string;
  userId: string;
}

export interface CreateConsentRepositoryInput {
  userId: string;
  guardianId: string;
  tripId: string;
  shareScopes: Prisma.InputJsonValue;
  validFrom: Date;
  validUntil: Date;
}

export type ConsentRecord = Consent;
