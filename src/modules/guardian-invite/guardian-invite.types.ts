import {
  ConsentAuditAction,
  ConsentAuditActorType,
  GuardianInviteStatus,
  ShareScope,
  type TripStatus
} from '../../infrastructure/database/prisma/generated-client';
import { z } from 'zod';

export const guardianInviteTokenParamsSchema = z.object({
  token: z.string().min(1, 'Invite token is required')
});

export type GuardianInviteTokenParams = z.infer<typeof guardianInviteTokenParamsSchema>;

export interface GuardianInviteDetails {
  id: string;
  token: string;
  status: GuardianInviteStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  guardian: {
    id: string;
    fullName: string;
    relationship: string;
    email: string | null;
    phoneNumber: string | null;
  };
  trip: {
    id: string;
    title: string;
    destination: string;
    status: TripStatus;
    startDate: Date;
    endDate: Date;
  };
  consent: {
    id: string;
    guardianId?: string;
    tripId?: string | null;
    status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
    shareScopes: ShareScope[];
    validUntil: Date;
  };
}

export interface GuardianInviteRepository {
  findInviteByToken(token: string): Promise<GuardianInviteDetails | null>;
  acceptInvite(inviteId: string, acceptedAt: Date): Promise<GuardianInviteDetails>;
  expireInvite(inviteId: string): Promise<GuardianInviteDetails>;
  createTrustLogEntry(input: {
    consentId: string;
    tripId?: string | null;
    guardianId?: string | null;
    actorType: ConsentAuditActorType;
    action: ConsentAuditAction;
    message: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<void>;
}
