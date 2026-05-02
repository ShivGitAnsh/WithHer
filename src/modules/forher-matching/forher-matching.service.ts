import { MatchConnectionStatus, type MatchConnection } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerMatchingRepository } from './forher-matching.repository';
import type {
  MatchingConnectResponse,
  MatchingCandidateResponse,
  MatchingOptInInput,
  MatchingProfileResponse
} from './forher-matching.types';

export class ForHerMatchingService {
  constructor(private readonly repository: ForHerMatchingRepository) {}

  async getProfile(tripId: string): Promise<MatchingProfileResponse | null> {
    const profile = await this.repository.findProfileByTripId(tripId);

    if (!profile) {
      return null;
    }

    return this.toProfileResponse(profile);
  }

  async optIn(tripId: string, input: MatchingOptInInput): Promise<MatchingProfileResponse> {
    const trip = await this.repository.findTripById(tripId);

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const profile = await this.repository.upsertProfileByTripId({
      tripId: trip.id,
      userId: trip.userId,
      displayName: input.displayName,
      city: input.city,
      travelStyle: input.travelStyle,
      hotelPreference: input.hotelPreference,
      interests: input.interests
    });

    return this.toProfileResponse(profile);
  }

  async getCandidates(tripId: string): Promise<MatchingCandidateResponse[]> {
    const trip = await this.repository.findTripById(tripId);

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const currentProfile = await this.repository.findProfileByTripId(tripId);

    if (!currentProfile) {
      return [];
    }

    const [candidates, connections] = await Promise.all([
      this.repository.findCandidateProfiles(
        trip.id,
        trip.destination,
        trip.startDate,
        trip.endDate,
        trip.userId
      ),
      this.repository.findConnectionsForSourceProfile(currentProfile.id)
    ]);

    return candidates
      .map((candidate) => {
        const overlapDays = this.computeOverlapDays(
          trip.startDate,
          trip.endDate,
          candidate.trip.startDate,
          candidate.trip.endDate
        );

        const reasons: string[] = [];
        let score = 45;

        if (overlapDays > 0) {
          score += Math.min(20, overlapDays * 5);
          reasons.push(`${overlapDays} day overlap in ${trip.destination}.`);
        }

        if (
          currentProfile.travelStyle &&
          candidate.travelStyle &&
          currentProfile.travelStyle.toLowerCase() === candidate.travelStyle.toLowerCase()
        ) {
          score += 12;
          reasons.push('Similar travel style.');
        }

        if (
          currentProfile.hotelPreference &&
          candidate.hotelPreference &&
          currentProfile.hotelPreference.toLowerCase() === candidate.hotelPreference.toLowerCase()
        ) {
          score += 10;
          reasons.push('Hotel area preference lines up.');
        }

        const sharedInterests = currentProfile.interests.filter((interest) =>
          candidate.interests.some(
            (candidateInterest) =>
              candidateInterest.toLowerCase() === interest.toLowerCase()
          )
        );

        if (sharedInterests.length > 0) {
          score += Math.min(18, sharedInterests.length * 6);
          reasons.push(`Shared interests: ${sharedInterests.join(', ')}.`);
        }

        const connection = this.findConnectionStatus(connections, currentProfile.id, candidate.id);

        return {
          matchId: candidate.id,
          profileId: candidate.id,
          tripId: candidate.trip.id,
          displayName: candidate.displayName,
          city: candidate.city,
          travelStyle: candidate.travelStyle,
          hotelPreference: candidate.hotelPreference,
          interests: [...candidate.interests],
          destination: candidate.trip.destination,
          tripTitle: candidate.trip.title,
          overlapDays,
          compatibilityScore: Math.max(0, Math.min(100, score)),
          reasons: reasons.length > 0 ? reasons : ['Similar destination window.'],
          connectionStatus: connection ?? 'AVAILABLE'
        } satisfies MatchingCandidateResponse;
      })
      .sort((left, right) => right.compatibilityScore - left.compatibilityScore);
  }

  async connect(tripId: string, matchId: string): Promise<MatchingConnectResponse> {
    const currentProfile = await this.repository.findProfileByTripId(tripId);

    if (!currentProfile) {
      throw new AppError(
        'Opt in to matching before connecting',
        StatusCodes.BAD_REQUEST,
        'MATCHING_NOT_ENABLED'
      );
    }

    const candidateProfile = await this.repository.findCandidateProfileById(matchId);

    if (!candidateProfile) {
      throw new AppError('Match candidate not found', StatusCodes.NOT_FOUND, 'MATCH_NOT_FOUND');
    }

    if (candidateProfile.id === currentProfile.id) {
      throw new AppError('Cannot connect with your own profile', StatusCodes.BAD_REQUEST, 'INVALID_MATCH');
    }

    const connection = await this.repository.createOrUpdateConnection(
      currentProfile.id,
      candidateProfile.id
    );

    return {
      connection,
      sourceProfileId: currentProfile.id,
      targetProfileId: candidateProfile.id
    };
  }

  private toProfileResponse(profile: {
    id: string;
    tripId: string;
    userId: string;
    displayName: string;
    city: string | null;
    travelStyle: string | null;
    hotelPreference: string | null;
    interests: string[];
    status: string;
  }): MatchingProfileResponse {
    return {
      id: profile.id,
      tripId: profile.tripId,
      userId: profile.userId,
      displayName: profile.displayName,
      city: profile.city,
      travelStyle: profile.travelStyle,
      hotelPreference: profile.hotelPreference,
      interests: [...profile.interests],
      status: profile.status as MatchingProfileResponse['status']
    };
  }

  private computeOverlapDays(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date
  ): number {
    const start = Math.max(startA.getTime(), startB.getTime());
    const end = Math.min(endA.getTime(), endB.getTime());

    if (end < start) {
      return 0;
    }

    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }

  private findConnectionStatus(
    connections: MatchConnection[],
    sourceProfileId: string,
    targetProfileId: string
  ): MatchConnectionStatus | null {
    const connection = connections.find(
      (item) =>
        (item.sourceProfileId === sourceProfileId && item.targetProfileId === targetProfileId) ||
        (item.sourceProfileId === targetProfileId && item.targetProfileId === sourceProfileId)
    );

    return connection?.status ?? null;
  }
}
