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
    const trip = await this.tripRepository.findSafetyBriefByTripId(tripId);

    if (!trip) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    const latestEvent = trip.events[0] ?? null;
    const llmInput = {
      tripTitle: trip.title,
      destination: trip.destination,
      tripStatus: trip.status,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
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

      return {
        brief,
        fallbackUsed: false
      };
    } catch (error) {
      logger.error(
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
    latestEvent: {
      eventType: string;
      title: string;
      description?: string | null;
      occurredAt: Date;
    } | null;
  }): string {
    if (input.latestEvent) {
      const formattedTime = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(input.latestEvent.occurredAt);

      return [
        `This trip is for ${input.destination} and the latest recorded update is ${input.latestEvent.eventType} at ${formattedTime}.`,
        `The current update is "${input.latestEvent.title}".`,
        'This summary is based only on the trip details and latest recorded event.'
      ].join(' ');
    }

    return [
      `This trip is planned for ${input.destination}.`,
      'There is no travel update recorded yet.',
      'This summary is based only on the trip details currently available.'
    ].join(' ');
  }
}
