import type {
  ConsentRecord,
  CreateConsentRepositoryInput,
  GuardianOwnerRecord,
  TripOwnerRecord
} from './trip-sharing.types';

export interface TripSharingRepository {
  findTripOwnerByTripId(tripId: string): Promise<TripOwnerRecord | null>;
  findGuardianOwnerByGuardianId(guardianId: string): Promise<GuardianOwnerRecord | null>;
  createConsent(data: CreateConsentRepositoryInput): Promise<ConsentRecord>;
}
