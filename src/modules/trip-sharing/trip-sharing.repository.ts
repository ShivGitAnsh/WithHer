import type {
  ConsentList,
  ConsentRecord,
  CreateTrustLogEntryInput,
  CreateConsentRepositoryInput,
  GuardianOwnerRecord,
  TrustLogEntryRecord,
  TripOwnerRecord
} from './trip-sharing.types';

export interface TripSharingRepository {
  findTripOwnerByTripId(tripId: string): Promise<TripOwnerRecord | null>;
  findGuardianOwnerByGuardianId(guardianId: string): Promise<GuardianOwnerRecord | null>;
  findConsentById(consentId: string): Promise<ConsentRecord | null>;
  findConsentDetailsById(consentId: string): Promise<ConsentList[number] | null>;
  findConsentsByUserId(userId: string): Promise<ConsentList>;
  findConsentsByTripId(tripId: string): Promise<ConsentList>;
  findTrustLogByTripId(tripId: string): Promise<TrustLogEntryRecord[]>;
  createConsent(data: CreateConsentRepositoryInput): Promise<ConsentRecord>;
  createTrustLogEntry(data: CreateTrustLogEntryInput): Promise<void>;
  revokeConsent(consentId: string, revokedAt: Date, revokedReason?: string): Promise<ConsentRecord>;
}
