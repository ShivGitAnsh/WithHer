import { StatusCodes } from 'http-status-codes';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import type {
  ForHerSafetyScoreRepository,
  ForHerSafetyScoreResponse,
  GenerateSafetyScoreInput,
  SafetyScoreLlmService
} from './forher-safety-score.types';

export class ForHerSafetyScoreService {
  constructor(
    private readonly forHerSafetyScoreRepository: ForHerSafetyScoreRepository,
    private readonly safetyScoreLlmService: SafetyScoreLlmService
  ) {}

  async getTripSafetyScore(tripId: string): Promise<ForHerSafetyScoreResponse> {
    const trip = await this.forHerSafetyScoreRepository.findTripSafetyScoreByTripId(
      tripId
    );

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const latestEvent = trip.events[0] ?? null;
    const latestCheckIn =
      trip.events.find((event) => event.eventType === 'CHECKED_IN') ?? null;

    try {
      const result = await this.safetyScoreLlmService.generateSafetyScore({
        tripId: trip.id,
        tripStatus: trip.status,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        recentEvents: trip.events.slice(0, 6).map((event) => ({
          eventType: event.eventType,
          title: event.title,
          occurredAt: event.occurredAt.toISOString()
        })),
        latestEvent: latestEvent
          ? {
              eventType: latestEvent.eventType,
              title: latestEvent.title,
              occurredAt: latestEvent.occurredAt.toISOString()
            }
          : null,
        latestCheckIn: latestCheckIn
          ? {
              eventType: latestCheckIn.eventType,
              title: latestCheckIn.title,
              occurredAt: latestCheckIn.occurredAt.toISOString()
            }
          : null
      });

      return {
        ...result,
        fallbackUsed: false
      };
    } catch (error) {
      logger.warn(
        {
          err: error,
          tripId
        },
        'Failed to generate Gemini safety score'
      );

      return this.buildFallbackSafetyScore({
        tripStatus: trip.status,
        latestEvent,
        latestCheckIn
      });
    }
  }

  async generateSafetyScore(
    input: GenerateSafetyScoreInput
  ): Promise<ForHerSafetyScoreResponse> {
    const recentEvents = [...input.recentEvents].sort(
      (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime()
    );
    const latestEvent = input.latestEvent ?? recentEvents[0] ?? null;
    const latestCheckIn =
      input.latestCheckIn ??
      recentEvents.find((event) => event.eventType === 'CHECKED_IN') ??
      null;

    try {
      const result = await this.safetyScoreLlmService.generateSafetyScore({
        tripId:
          input.tripId ??
          `preview-${input.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        tripTitle: input.tripTitle,
        destination: input.destination,
        tripStatus: input.tripStatus,
        startDate: input.startDate.toISOString(),
        endDate: input.endDate.toISOString(),
        recentEvents: recentEvents.slice(0, 6).map((event) => ({
          eventType: event.eventType,
          title: event.title,
          occurredAt: event.occurredAt.toISOString()
        })),
        latestEvent: latestEvent
          ? {
              eventType: latestEvent.eventType,
              title: latestEvent.title,
              occurredAt: latestEvent.occurredAt.toISOString()
            }
          : null,
        latestCheckIn: latestCheckIn
          ? {
              eventType: latestCheckIn.eventType,
              title: latestCheckIn.title,
              occurredAt: latestCheckIn.occurredAt.toISOString()
            }
          : null
      });

      return {
        ...result,
        fallbackUsed: false
      };
    } catch (error) {
      logger.warn(
        {
          err: error,
          tripId: input.tripId ?? null,
          destination: input.destination
        },
        'Failed to generate Gemini preview safety score'
      );

      return this.buildFallbackSafetyScore({
        tripStatus: input.tripStatus,
        latestEvent: latestEvent
          ? {
              title: latestEvent.title
            }
          : null,
        latestCheckIn: latestCheckIn
          ? {
              title: latestCheckIn.title
            }
          : null
      });
    }
  }

  private buildFallbackSafetyScore(input: {
    tripStatus: string;
    latestEvent: { title: string } | null;
    latestCheckIn: { title: string } | null;
  }): ForHerSafetyScoreResponse {
    const scoreByStatus: Record<string, number> = {
      PLANNED: 74,
      ACTIVE: 78,
      COMPLETED: 86,
      CANCELLED: 42
    };
    const score = scoreByStatus[input.tripStatus] ?? 70;
    const status: ForHerSafetyScoreResponse['status'] =
      score >= 80 ? 'Safe' : score >= 60 ? 'Moderate' : 'Risky';
    const reasons = [
      input.latestCheckIn
        ? `Recent check-in recorded: ${input.latestCheckIn.title}.`
        : input.latestEvent
          ? `Latest recorded update: ${input.latestEvent.title}.`
          : 'No recent trip milestone has been recorded yet.',
      input.tripStatus === 'COMPLETED'
        ? 'The trip is already completed, which reduces active travel uncertainty.'
        : input.tripStatus === 'ACTIVE'
          ? 'The journey is in progress, so confidence depends on timely status updates.'
          : input.tripStatus === 'PLANNED'
            ? 'The trip is still planned, so live in-transit reassurance signals are not available yet.'
            : 'The current trip status limits how much live travel confidence can be inferred.',
      'Gemini scoring is currently unavailable for this project, so this fallback score is based on trip status and recent timeline events.'
    ];

    return {
      score,
      status,
      reasons,
      fallbackUsed: true
    };
  }
}
