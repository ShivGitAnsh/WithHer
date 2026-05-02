import { StatusCodes } from 'http-status-codes';
import { TripEventType, TripStatus } from '@prisma/client';

import { AppError } from '../../shared/errors/app-error';
import type {
  ForHerSafetyScoreRepository,
  ForHerSafetyScoreResponse,
  SafetyScoreEventRecord,
  SafetyScoreRuleContext,
  SafetyScoreRuleResult
} from './forher-safety-score.types';

const SCORE_MAX = 100;
const SCORE_MIN = 0;
const RECENT_EVENT_WINDOW_HOURS = 12;
const RECENT_CHECK_IN_WINDOW_HOURS = 6;
const NIGHT_HOURS = new Set([22, 23, 0, 1, 2, 3, 4, 5]);
const NIGHT_ARRIVAL_EVENT_TYPES: TripEventType[] = [
  TripEventType.ARRIVED,
  TripEventType.CHECKED_IN,
  TripEventType.HOME_REACHED
];

export class ForHerSafetyScoreService {
  constructor(
    private readonly forHerSafetyScoreRepository: ForHerSafetyScoreRepository
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
      trip.events.find((event) => event.eventType === TripEventType.CHECKED_IN) ?? null;
    const now = new Date();

    const context: SafetyScoreRuleContext = {
      trip,
      latestEvent,
      latestCheckIn,
      now
    };

    const ruleResults = [
      this.applyActiveTripRule(context),
      this.applyRecentCheckInRule(context),
      this.applyLateArrivalRule(context),
      this.applyRecentEventRule(context)
    ];

    const score = ruleResults.reduce(
      (currentScore, result) => currentScore + result.scoreDelta,
      SCORE_MAX
    );

    return {
      score: Math.max(SCORE_MIN, Math.min(SCORE_MAX, score)),
      status: this.getSafetyStatus(score),
      reasons: ruleResults.flatMap((result) => (result.reason ? [result.reason] : []))
    };
  }

  private applyActiveTripRule(
    context: SafetyScoreRuleContext
  ): SafetyScoreRuleResult {
    if (context.trip.status !== TripStatus.ACTIVE) {
      return {
        scoreDelta: 0
      };
    }

    return {
      scoreDelta: 5,
      reason: 'Trip is currently active and being tracked.'
    };
  }

  private applyRecentCheckInRule(
    context: SafetyScoreRuleContext
  ): SafetyScoreRuleResult {
    if (!context.latestCheckIn) {
      return {
        scoreDelta: 0
      };
    }

    const hoursSinceCheckIn = this.getHoursSince(context.latestCheckIn.occurredAt, context.now);

    if (hoursSinceCheckIn > RECENT_CHECK_IN_WINDOW_HOURS) {
      return {
        scoreDelta: 0
      };
    }

    return {
      scoreDelta: 10,
      reason: 'A recent check-in was recorded for this trip.'
    };
  }

  private applyLateArrivalRule(
    context: SafetyScoreRuleContext
  ): SafetyScoreRuleResult {
    if (!context.latestEvent) {
      return {
        scoreDelta: 0
      };
    }

    const isArrivalEvent = NIGHT_ARRIVAL_EVENT_TYPES.includes(
      context.latestEvent.eventType
    );

    const eventHour = context.latestEvent.occurredAt.getHours();

    if (!isArrivalEvent || !NIGHT_HOURS.has(eventHour)) {
      return {
        scoreDelta: 0
      };
    }

    return {
      scoreDelta: -20,
      reason: 'The latest arrival-related update happened during late-night hours.'
    };
  }

  private applyRecentEventRule(
    context: SafetyScoreRuleContext
  ): SafetyScoreRuleResult {
    if (context.trip.status !== TripStatus.ACTIVE) {
      return {
        scoreDelta: 0
      };
    }

    if (!context.latestEvent) {
      return {
        scoreDelta: -25,
        reason: 'No recent trip event is available for an active trip.'
      };
    }

    const hoursSinceLatestEvent = this.getHoursSince(
      context.latestEvent.occurredAt,
      context.now
    );

    if (hoursSinceLatestEvent <= RECENT_EVENT_WINDOW_HOURS) {
      return {
        scoreDelta: 0
      };
    }

    return {
      scoreDelta: -25,
      reason: 'No recent trip event has been recorded in the last 12 hours.'
    };
  }

  private getHoursSince(date: Date, now: Date): number {
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
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
