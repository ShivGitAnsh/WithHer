import { StatusCodes } from 'http-status-codes';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import type { ForHerItineraryRepository } from './forher-itinerary.repository';
import type {
  GenerateItineraryInput,
  ItineraryLlmInput,
  ItineraryLlmService,
  ItineraryPlanResponse,
  ItineraryTripContext,
  StoredItineraryPayload
} from './forher-itinerary.types';

export class ForHerItineraryService {
  constructor(
    private readonly itineraryRepository: ForHerItineraryRepository,
    private readonly itineraryLlmService?: ItineraryLlmService
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

    const llmInput: ItineraryLlmInput = {
      tripTitle: tripContext?.title,
      destination,
      tripStatus: tripContext?.status,
      startDate: tripContext?.startDate.toISOString(),
      endDate: tripContext?.endDate.toISOString(),
      numberOfDays: input.numberOfDays,
      travelersCount: input.travelersCount
    };

    try {
      const generated = await this.itineraryLlmService?.generateItinerary(llmInput);

      if (!generated) {
        throw new Error('Itinerary LLM returned an empty response');
      }
      const plan = await this.itineraryRepository.createItineraryPlan({
        tripId: tripContext?.id,
        destination,
        numberOfDays: input.numberOfDays,
        travelersCount: input.travelersCount,
        title: generated.title,
        overview: generated.overview,
        generatedPlan: generated.generatedPlan
      });

      return this.toResponse(plan);
    } catch (error) {
      logger.error(
        {
          err: error,
          tripId: tripContext?.id,
          destination,
          numberOfDays: input.numberOfDays
        },
        'Failed to generate LLM itinerary'
      );

      throw new AppError(
        'Unable to generate itinerary right now',
        StatusCodes.BAD_GATEWAY,
        'ITINERARY_GENERATION_FAILED'
      );
    }
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
      generationSource: 'llm',
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }
}
