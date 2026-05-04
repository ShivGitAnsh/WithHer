import { StatusCodes } from 'http-status-codes';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import { resolveWomenTravellerReviewSet } from './forher-safety-score.review-catalog';
import type {
  ForHerSafetyScoreRepository,
  ForHerSafetyScoreResponse,
  SafetyScoreLlmService
} from './forher-safety-score.types';

export class ForHerSafetyScoreService {
  constructor(
    private readonly forHerSafetyScoreRepository: ForHerSafetyScoreRepository,
    private readonly safetyScoreLlmService?: SafetyScoreLlmService
  ) {}

  async getTripSafetyScore(tripId: string): Promise<ForHerSafetyScoreResponse> {
    const trip = await this.forHerSafetyScoreRepository.findTripSafetyScoreByTripId(
      tripId
    );

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const reviewSet = resolveWomenTravellerReviewSet(trip.destination);

    try {
      const generated = await this.safetyScoreLlmService?.generateSafetyScore({
        tripTitle: trip.title,
        destination: trip.destination,
        tripStatus: trip.status,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        reviewSetLabel: reviewSet.destinationLabel,
        reviews: reviewSet.reviews
      });

      if (!generated) {
        throw new Error('Safety score LLM returned an empty response');
      }

      const score = Math.max(0, Math.min(100, generated.score));

      return {
        score,
        status: this.getSafetyStatus(score),
        reasons: generated.reasons
      };
    } catch (error) {
      logger.error(
        {
          err: error,
          tripId,
          destination: trip.destination
        },
        'Failed to generate LLM safety score'
      );

      throw new AppError(
        'Unable to generate safety score right now',
        StatusCodes.BAD_GATEWAY,
        'SAFETY_SCORE_GENERATION_FAILED'
      );
    }
  }

  private getSafetyStatus(score: number): 'Safe' | 'Moderate' | 'Risky' {
    if (score >= 80) {
      return 'Safe';
    }

    if (score >= 60) {
      return 'Moderate';
    }

    return 'Risky';
  }
}
