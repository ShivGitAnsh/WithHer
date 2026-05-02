import type { Trip, TripEvent } from '@prisma/client';

import type {
  CreateTripEventRepositoryInput,
  CreateTripRepositoryInput,
  TripListItem,
  TripSafetyBriefRecord,
  TripFamilyDashboardRecord,
  TripWithEvents
} from './trip.types';

export interface TripRepository {
  userExists(userId: string): Promise<boolean>;
  tripExists(tripId: string): Promise<boolean>;
  createTrip(data: CreateTripRepositoryInput): Promise<Trip>;
  findTripsByUserId(userId: string): Promise<TripListItem[]>;
  findTripById(tripId: string): Promise<TripWithEvents | null>;
  findSafetyBriefByTripId(tripId: string, currentDate: Date): Promise<TripSafetyBriefRecord | null>;
  findFamilyDashboardByTripId(tripId: string, currentDate: Date): Promise<TripFamilyDashboardRecord | null>;
  createTripEvent(data: CreateTripEventRepositoryInput): Promise<TripEvent>;
}
