import { StatusCodes } from 'http-status-codes';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import type { ForHerItineraryRepository } from './forher-itinerary.repository';
import type {
  GenerateItineraryInput,
  ItineraryLlmService,
  ItineraryPlanResponse,
  ItineraryTripContext,
  StoredItineraryPayload
} from './forher-itinerary.types';

export class ForHerItineraryService {
  constructor(
    private readonly itineraryRepository: ForHerItineraryRepository,
    private readonly itineraryLlmService: ItineraryLlmService
  ) {}

  async generateItinerary(
    input: GenerateItineraryInput
  ): Promise<ItineraryPlanResponse> {
    let tripContext: ItineraryTripContext | null = null;

    if (input.tripId) {
      tripContext = await this.itineraryRepository.findTripContextById(input.tripId);

      if (!tripContext) {
        throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
      }
    }

    const destination = tripContext?.destination ?? input.destination;

    if (!destination) {
      throw new AppError(
        'Destination is required',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    let generated: StoredItineraryPayload & { overview: string };

    try {
      const llmResult = await this.itineraryLlmService.generateItinerary({
        destination,
        numberOfDays: input.numberOfDays,
        travelersCount: input.travelersCount,
        tripTitle: tripContext?.title,
        tripStatus: tripContext?.status,
        startDate: tripContext?.startDate.toISOString(),
        endDate: tripContext?.endDate.toISOString()
      });

      generated = {
        overview: llmResult.overview,
        rationale: llmResult.rationale,
        days: llmResult.days,
        fallbackUsed: false
      };
    } catch (error) {
      logger.warn(
        {
          err: error,
          tripId: tripContext?.id ?? null,
          destination
        },
        'Failed to generate Gemini itinerary'
      );

      generated = this.buildFallbackItinerary({
        destination,
        numberOfDays: input.numberOfDays,
        travelersCount: input.travelersCount,
        tripTitle: tripContext?.title
      });
    }

    const payload: StoredItineraryPayload = {
      rationale: generated.rationale,
      days: generated.days,
      fallbackUsed: generated.fallbackUsed
    };
    const title = tripContext
      ? `${tripContext.title} - Safe Itinerary`
      : `${destination} Safe Itinerary`;
    const overview = generated.overview;

    const plan = await this.itineraryRepository.createItineraryPlan({
      tripId: tripContext?.id,
      destination,
      numberOfDays: input.numberOfDays,
      travelersCount: input.travelersCount,
      title,
      overview,
      generatedPlan: payload
    });

    return this.toResponse(plan);
  }

  async getItineraryById(id: string): Promise<ItineraryPlanResponse> {
    const plan = await this.itineraryRepository.findItineraryPlanById(id);

    if (!plan) {
      throw new AppError('Itinerary not found', StatusCodes.NOT_FOUND, 'ITINERARY_NOT_FOUND');
    }

    return this.toResponse(plan);
  }

  async getLatestItineraryByTripId(tripId: string): Promise<ItineraryPlanResponse | null> {
    const plan = await this.itineraryRepository.findLatestItineraryPlanByTripId(tripId);

    if (!plan) {
      return null;
    }

    return this.toResponse(plan);
  }
  private toResponse(plan: {
    id: string;
    tripId: string | null;
    destination: string;
    numberOfDays: number;
    travelersCount: number;
    title: string;
    overview: string;
    generatedPlan: StoredItineraryPayload;
    createdAt: Date;
    updatedAt: Date;
  }): ItineraryPlanResponse {
    return {
      id: plan.id,
      tripId: plan.tripId,
      destination: plan.destination,
      numberOfDays: plan.numberOfDays,
      travelersCount: plan.travelersCount,
      title: plan.title,
      overview: plan.overview,
      rationale: plan.generatedPlan.rationale,
      days: plan.generatedPlan.days,
      fallbackUsed: plan.generatedPlan.fallbackUsed ?? false,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }

  private buildFallbackItinerary(input: {
    destination: string;
    numberOfDays: number;
    travelersCount: number;
    tripTitle?: string;
  }): StoredItineraryPayload & { overview: string } {
    const days = Array.from({ length: input.numberOfDays }, (_, index) => {
      const dayNumber = index + 1;
      const isArrivalDay = dayNumber === 1;
      const isFinalDay = dayNumber === input.numberOfDays;

      return {
        dayNumber,
        title: isArrivalDay
          ? `Day ${dayNumber}: Arrival and route familiarity`
          : isFinalDay
            ? `Day ${dayNumber}: Light plans and smooth return`
            : `Day ${dayNumber}: Main daylight exploration`,
        focus: isArrivalDay
          ? 'Keep the first day close to the stay and build route confidence early.'
          : isFinalDay
            ? 'Protect the return leg with shorter plans and a predictable departure window.'
            : 'Use the strongest daylight hours for the main movement block and avoid late detours.',
        items: [
          {
            timeOfDay: 'Morning' as const,
            startTime: '09:00',
            endTime: '11:00',
            title: isArrivalDay
              ? `${input.destination} arrival and setup`
              : 'Primary activity block',
            description: isArrivalDay
              ? 'Settle in, confirm bookings, and use the first movement window to get comfortable with the immediate area.'
              : 'Use the earliest busy hours for the main plan so the route finishes well before evening.',
            safetyNote: isArrivalDay
              ? 'Use a verified transfer or pre-booked pickup for the first leg.'
              : 'Start early and keep the outbound route straightforward.'
          },
          {
            timeOfDay: 'Afternoon' as const,
            startTime: '13:00',
            endTime: '15:30',
            title: isFinalDay ? 'Packing and transfer preparation' : 'Nearby secondary stop',
            description: isFinalDay
              ? 'Create a buffer for logistics, packing, and any final confirmations before the return movement starts.'
              : 'Add one nearby stop that does not require switching across multiple zones or transport modes.',
            safetyNote: isFinalDay
              ? 'Reconfirm transport timing before leaving the stay.'
              : 'Limit the plan to one nearby area and one clear return route.'
          },
          {
            timeOfDay: 'Evening' as const,
            startTime: '17:00',
            endTime: '18:30',
            title: isFinalDay ? 'Departure window' : 'Early return and check-in',
            description: isFinalDay
              ? 'Leave with enough buffer for a calm, direct transfer without needing a rushed change of plans.'
              : 'Wrap the day early and keep the final movement window direct and predictable.',
            safetyNote: isFinalDay
              ? 'Use a verified outbound route for the final leg.'
              : 'Avoid late exploratory detours after the main route ends.'
          }
        ]
      };
    });

    return {
      overview: `A ${input.numberOfDays}-day fallback itinerary for ${input.tripTitle ?? input.destination}, keeping movement daylight-first and return windows predictable while Gemini generation is unavailable.`,
      rationale: [
        'Daylight-first sequencing reduces uncertain late movement.',
        'Each day is grouped into a smaller route footprint to keep transfers easier to follow.',
        'Evening plans stay short so the return leg remains predictable when AI generation is unavailable.'
      ],
      days,
      fallbackUsed: true
    };
  }
}
