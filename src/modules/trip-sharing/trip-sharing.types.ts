import {
  ConsentAuditAction,
  ConsentAuditActorType,
  GuardianInviteStatus,
  ShareScope,
  type Consent
} from '../../infrastructure/database/prisma/generated-client';
import { z } from 'zod';

export const createTripSharingParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const createTripSharingSchema = z.object({
  guardianId: z.string().min(1, 'Guardian id is required'),
  shareScopes: z
    .array(z.nativeEnum(ShareScope))
    .min(1, 'At least one share scope is required'),
  validUntil: z.coerce.date()
});

export const createForHerConsentSchema = createTripSharingSchema.extend({
  tripId: z.string().min(1, 'Trip id is required')
});

export const revokeConsentParamsSchema = z.object({
  id: z.string().min(1, 'Consent id is required')
});

export const revokeConsentSchema = z.object({
  reason: z.string().trim().min(1).max(240).optional()
});

export const getConsentsQuerySchema = z
  .object({
    userId: z.string().min(1, 'User id is required').optional(),
    tripId: z.string().min(1, 'Trip id is required').optional()
  })
  .refine((value) => Boolean(value.userId || value.tripId), {
    message: 'Either userId or tripId is required'
  });

export type CreateTripSharingParams = z.infer<typeof createTripSharingParamsSchema>;
export type CreateTripSharingInput = z.infer<typeof createTripSharingSchema>;
export type CreateForHerConsentInput = z.infer<typeof createForHerConsentSchema>;
export type RevokeConsentParams = z.infer<typeof revokeConsentParamsSchema>;
export type RevokeConsentInput = z.infer<typeof revokeConsentSchema>;
export type GetConsentsQuery = z.infer<typeof getConsentsQuerySchema>;

export interface TripOwnerRecord {
  id: string;
  userId: string;
}

export interface GuardianOwnerRecord {
  id: string;
  userId: string;
}

export interface ConsentListRecord {
  id: string;
  userId: string;
  guardianId: string;
  tripId: string | null;
  status: Consent['status'];
  shareScopes: ShareScope[];
  validFrom: Date;
  validUntil: Date;
  revokedAt: Date | null;
  revokedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  guardian: {
    id: string;
    fullName: string;
    relationship: string;
    phoneNumber: string | null;
    email: string | null;
  };
  guardianInvite: {
    id: string;
    token: string;
    status: GuardianInviteStatus;
    expiresAt: Date;
    acceptedAt: Date | null;
  } | null;
  trip: {
    id: string;
    title: string;
    destination: string;
    status: string;
  } | null;
}

export interface CreateConsentRepositoryInput {
  userId: string;
  guardianId: string;
  tripId: string;
  shareScopes: ShareScope[];
  validFrom: Date;
  validUntil: Date;
  inviteToken: string;
  inviteExpiresAt: Date;
}

export interface TrustLogEntryRecord {
  id: string;
  consentId: string;
  tripId: string | null;
  guardianId: string | null;
  actorType: ConsentAuditActorType;
  action: ConsentAuditAction;
  message: string;
  metadata: unknown;
  createdAt: Date;
  guardian: {
    id: string;
    fullName: string;
    relationship: string;
  } | null;
}

export interface CreateTrustLogEntryInput {
  consentId: string;
  tripId?: string | null;
  guardianId?: string | null;
  actorType: ConsentAuditActorType;
  action: ConsentAuditAction;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export type ConsentRecord = Consent;
export type ConsentList = ConsentListRecord[];
