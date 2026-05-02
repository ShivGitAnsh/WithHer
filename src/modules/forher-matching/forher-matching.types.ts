import {
  MatchConnectionStatus,
  MatchProfileStatus,
  type MatchConnection,
  type MatchProfile,
  type Trip,
  type User
} from '@prisma/client';
import { z } from 'zod';

export const tripMatchingParamsSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export const matchingOptInSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  city: z.string().min(1).optional(),
  travelStyle: z.string().min(1).optional(),
  hotelPreference: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).max(8).default([])
});

export const matchIdParamsSchema = z.object({
  matchId: z.string().min(1, 'Match id is required')
});

export const connectMatchSchema = z.object({
  tripId: z.string().min(1, 'Trip id is required')
});

export type TripMatchingParams = z.infer<typeof tripMatchingParamsSchema>;
export type MatchingOptInInput = z.infer<typeof matchingOptInSchema>;
export type MatchIdParams = z.infer<typeof matchIdParamsSchema>;
export type ConnectMatchInput = z.infer<typeof connectMatchSchema>;

export type MatchingTripContext = Pick<
  Trip,
  'id' | 'userId' | 'title' | 'destination' | 'startDate' | 'endDate' | 'status'
>;

export type MatchingUserContext = Pick<User, 'id' | 'fullName'>;

export type MatchProfileRecord = MatchProfile;
export type MatchConnectionRecord = MatchConnection;

export type MatchCandidateProfileRecord = Pick<
  MatchProfile,
  | 'id'
  | 'userId'
  | 'tripId'
  | 'displayName'
  | 'city'
  | 'travelStyle'
  | 'hotelPreference'
  | 'interests'
  | 'status'
> & {
  trip: Pick<Trip, 'id' | 'title' | 'destination' | 'startDate' | 'endDate' | 'status'>;
};

export interface MatchingCandidateResponse {
  matchId: string;
  profileId: string;
  tripId: string;
  displayName: string;
  city?: string | null;
  travelStyle?: string | null;
  hotelPreference?: string | null;
  interests: string[];
  destination: string;
  tripTitle: string;
  overlapDays: number;
  compatibilityScore: number;
  reasons: string[];
  connectionStatus: MatchConnectionStatus | 'AVAILABLE';
}

export interface MatchingProfileResponse {
  id: string;
  tripId: string;
  userId: string;
  displayName: string;
  city?: string | null;
  travelStyle?: string | null;
  hotelPreference?: string | null;
  interests: string[];
  status: MatchProfileStatus;
}

export interface MatchingConnectResponse {
  connection: MatchConnectionRecord;
  sourceProfileId: string;
  targetProfileId: string;
}

export interface ForHerMatchingRepository {
  findTripById(tripId: string): Promise<MatchingTripContext | null>;
  findProfileByTripId(tripId: string): Promise<MatchProfileRecord | null>;
  upsertProfileByTripId(input: {
    tripId: string;
    userId: string;
    displayName: string;
    city?: string;
    travelStyle?: string;
    hotelPreference?: string;
    interests: string[];
  }): Promise<MatchProfileRecord>;
  findCandidateProfiles(
    tripId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    userId: string
  ): Promise<MatchCandidateProfileRecord[]>;
  findConnectionsForSourceProfile(sourceProfileId: string): Promise<MatchConnectionRecord[]>;
  createOrUpdateConnection(
    sourceProfileId: string,
    targetProfileId: string
  ): Promise<MatchConnectionRecord>;
  findCandidateProfileById(profileId: string): Promise<MatchCandidateProfileRecord | null>;
}

export const ACTIVE_MATCHING_STATUS = MatchProfileStatus.ACTIVE;
