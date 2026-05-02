import { StatusCodes } from 'http-status-codes';
import { TripStatus, type Trip, type TripEvent } from '@prisma/client';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import type { ForHerCheckInService } from '../forher-check-in/forher-check-in.service';
import type { TripEventNotificationHandler } from '../trip-event-notification/trip-event-notification.types';
import type { TripRepository } from './trip.repository';
import type {
  CreateTripEventInput,
  CreateTripInput,
  FamilyDashboardResponse,
  SafetyBriefLlmService,
  SafetyBriefResponse,
  TripListItem,
  TripWithEvents
} from './trip.types';

export class TripService {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly tripEventNotificationHandler?: TripEventNotificationHandler,
    private readonly safetyBriefLlmService?: SafetyBriefLlmService,
    private readonly forHerCheckInService?: ForHerCheckInService
  ) {}

  async createTrip(input: CreateTripInput): Promise<Trip> {
    const userExists = await this.tripRepository.userExists(input.userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.tripRepository.createTrip({
      userId: input.userId,
      title: input.title,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      status: TripStatus.PLANNED
    });
  }

  async getTripById(tripId: string): Promise<TripWithEvents> {
    const trip = await this.tripRepository.findTripById(tripId);

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    return trip;
  }

  async getTripsByUserId(userId: string): Promise<TripListItem[]> {
    const userExists = await this.tripRepository.userExists(userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.tripRepository.findTripsByUserId(userId);
  }

  async getFamilyDashboard(tripId: string): Promise<FamilyDashboardResponse> {
    const trip = await this.tripRepository.findFamilyDashboardByTripId(tripId, new Date());

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const latestEvent = trip.events.at(-1) ?? null;
    const guardiansById = new Map(trip.consents.map((consent) => [consent.guardian.id, consent.guardian]));

    return {
      trip: {
        id: trip.id,
        userId: trip.userId,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        status: trip.status,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt
      },
      latestEvent,
      timeline: trip.events,
      guardians: [...guardiansById.values()]
    };
  }

  async generateSafetyBrief(tripId: string): Promise<SafetyBriefResponse> {
    const trip = await this.tripRepository.findSafetyBriefByTripId(tripId, new Date());

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const latestEvent = trip.events[0] ?? null;
    const tripDurationDays = Math.max(
      1,
      Math.ceil(
        (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );
    const activeGuardianCount = trip.consents.length;
    const primaryGuardianRelationship =
      trip.consents.find((consent) => consent.guardian.isPrimary)?.guardian.relationship ?? null;
    const shareScopes = [...new Set(trip.consents.flatMap((consent) => consent.shareScopes))];
    const llmInput = {
      tripTitle: trip.title,
      destination: trip.destination,
      tripStatus: trip.status,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      tripDurationDays,
      activeGuardianCount,
      primaryGuardianRelationship,
      shareScopes,
      upcomingCheckIns: trip.checkInRules.map((rule) => ({
        title: rule.title,
        expectedEventType: rule.expectedEventType,
        expectedAt: rule.expectedAt.toISOString(),
        status: rule.status,
        graceMinutes: rule.graceMinutes
      })),
      recentEvents: trip.events.map((event) => ({
        eventType: event.eventType,
        title: event.title,
        description: event.description,
        occurredAt: event.occurredAt.toISOString()
      })),
      latestEvent: latestEvent
        ? {
            eventType: latestEvent.eventType,
            title: latestEvent.title,
            description: latestEvent.description,
            occurredAt: latestEvent.occurredAt.toISOString()
          }
        : null
    };

    try {
      const brief = await this.safetyBriefLlmService?.generateSafetyBrief(llmInput);

      if (!brief) {
        throw new Error('Safety brief LLM returned an empty response');
      }

      if (!this.isDetailedSafetyBrief(brief)) {
        throw new Error('Safety brief LLM returned a brief that was too thin to be useful');
      }

      return {
        brief,
        fallbackUsed: false
      };
    } catch (error) {
      logger.warn(
        {
          err: error,
          tripId
        },
        'Failed to generate LLM safety brief'
      );

      return {
        brief: this.buildFallbackSafetyBrief({
          tripTitle: trip.title,
          destination: trip.destination,
          tripStatus: trip.status,
          startDate: trip.startDate,
          endDate: trip.endDate,
          tripDurationDays,
          activeGuardianCount,
          primaryGuardianRelationship,
          shareScopes,
          upcomingCheckInsCount: trip.checkInRules.length,
          latestEvent
        }),
        fallbackUsed: true
      };
    }
  }

  async addTripEvent(tripId: string, input: CreateTripEventInput): Promise<TripEvent> {
    const tripExists = await this.tripRepository.tripExists(tripId);

    if (!tripExists) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const tripEvent = await this.tripRepository.createTripEvent({
      tripId,
      eventType: input.eventType,
      title: input.title,
      description: input.description,
      occurredAt: input.occurredAt ?? new Date()
    });

    try {
      await this.tripEventNotificationHandler?.handleTripEventCreated(tripEvent.id);
    } catch (error) {
        logger.error(
          {
            err: error,
            tripEventId: tripEvent.id,
            tripId
          },
          'Failed to process trip event notifications'
        );
    }

    try {
      await this.forHerCheckInService?.completeMatchingRulesForEvent(tripEvent);
    } catch (error) {
      logger.error(
        {
          err: error,
          tripEventId: tripEvent.id,
          tripId
        },
        'Failed to complete matching check-in rules for trip event'
      );
    }

    return tripEvent;
  }

  private buildFallbackSafetyBrief(input: {
    tripTitle: string;
    destination: string;
    tripStatus: string;
    startDate: Date;
    endDate: Date;
    tripDurationDays: number;
    activeGuardianCount: number;
    primaryGuardianRelationship: string | null;
    shareScopes: string[];
    upcomingCheckInsCount: number;
    latestEvent: {
      eventType: string;
      title: string;
      description?: string | null;
      occurredAt: Date;
    } | null;
  }): string {
    const dateRange = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short'
    }).formatRange(input.startDate, input.endDate);
    const sharingSummary =
      input.activeGuardianCount === 0
        ? 'No guardian sharing is active yet.'
        : input.primaryGuardianRelationship
          ? `${input.activeGuardianCount} guardian${input.activeGuardianCount > 1 ? 's are' : ' is'} active, including a primary ${input.primaryGuardianRelationship.toLowerCase()}.`
          : `${input.activeGuardianCount} guardian${input.activeGuardianCount > 1 ? 's are' : ' is'} active for this trip.`;
    const checkInSummary =
      input.upcomingCheckInsCount > 0
        ? `${input.upcomingCheckInsCount} check-in milestone${input.upcomingCheckInsCount > 1 ? 's are' : ' is'} already configured.`
        : 'No automated check-in milestones have been configured yet.';
    const scopeSummary =
      input.shareScopes.length > 0
        ? `Shared coverage includes ${input.shareScopes
            .map((scope) => this.formatShareScope(scope))
            .join(', ')}.`
        : 'No trip detail scopes have been shared yet.';

    if (input.latestEvent) {
      const formattedTime = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(input.latestEvent.occurredAt);

      return [
        `${input.tripTitle} is a ${input.tripDurationDays}-day ${input.destination} trip scheduled for ${dateRange} and it is currently marked ${input.tripStatus.toLowerCase()}.`,
        `${sharingSummary} ${checkInSummary} ${scopeSummary}`,
        `The latest recorded trip update is "${input.latestEvent.title}" at ${formattedTime}.`
      ].join(' ');
    }

    return [
      `${input.tripTitle} is a ${input.tripDurationDays}-day ${input.destination} trip scheduled for ${dateRange} and it is currently marked ${input.tripStatus.toLowerCase()}.`,
      `${sharingSummary} ${checkInSummary} ${scopeSummary}`,
      'No live travel milestone has been recorded yet, so this brief is based on the setup that is already configured for the trip.'
    ].join(' ');
  }

  private formatShareScope(scope: string): string {
    switch (scope) {
      case 'ITINERARY':
        return 'itinerary details';
      case 'HOTEL_DETAILS':
        return 'hotel details';
      case 'FLIGHT_DETAILS':
        return 'flight details';
      case 'LIVE_LOCATION':
        return 'live location';
      case 'CHECK_IN_UPDATES':
        return 'check-in updates';
      case 'EMERGENCY_CONTACTS':
        return 'emergency contacts';
      case 'SOS_ALERTS':
        return 'SOS alerts';
      default:
        return scope.toLowerCase().replace(/_/g, ' ');
    }
  }

  private isDetailedSafetyBrief(brief: string): boolean {
    const normalized = brief.trim();

    if (normalized.length < 90) {
      return false;
    }

    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    return sentences.length >= 2;
  }
}
