import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerItineraryRepository } from './forher-itinerary.repository';
import type {
  GenerateItineraryInput,
  ItineraryPlanDay,
  ItineraryPlanResponse,
  ItineraryTripContext,
  StoredItineraryPayload
} from './forher-itinerary.types';

const dayFocusTemplates = [
  {
    title: 'Arrival and local grounding',
    focus: 'Keep movement short and settle into a known base.',
    items: [
      {
        timeOfDay: 'Morning' as const,
        startTime: '09:00',
        endTime: '11:00',
        title: 'Arrival buffer and hotel check-in',
        description: 'Use this window to settle in, confirm bookings, and orient yourself nearby.',
        safetyNote: 'Choose verified transfer or hotel pickup before leaving the arrival point.'
      },
      {
        timeOfDay: 'Afternoon' as const,
        startTime: '13:00',
        endTime: '16:00',
        title: 'Central area orientation',
        description: 'Visit one well-reviewed zone close to your stay to build route familiarity.',
        safetyNote: 'Keep the first outing within one primary neighborhood.'
      },
      {
        timeOfDay: 'Evening' as const,
        startTime: '17:30',
        endTime: '19:30',
        title: 'Early dinner and return',
        description: 'End the day with an early meal and return before the late evening window.',
        safetyNote: 'Avoid adding extra transfers after dark on the first day.'
      }
    ]
  },
  {
    title: 'Daylight exploration',
    focus: 'Cluster experiences to reduce backtracking and uncertain transfers.',
    items: [
      {
        timeOfDay: 'Morning' as const,
        startTime: '08:30',
        endTime: '11:30',
        title: 'Primary sightseeing block',
        description: 'Use the best daylight window for the main destination experience.',
        safetyNote: 'Start earlier to avoid ending key movement after sunset.'
      },
      {
        timeOfDay: 'Afternoon' as const,
        startTime: '13:00',
        endTime: '15:30',
        title: 'Lunch and nearby secondary stop',
        description: 'Keep the second stop close to the first to avoid fragmented routing.',
        safetyNote: 'Use one known transport mode instead of switching repeatedly.'
      },
      {
        timeOfDay: 'Evening' as const,
        startTime: '17:00',
        endTime: '19:00',
        title: 'Calm return window',
        description: 'Leave enough time to get back before the late evening transit period.',
        safetyNote: 'Pre-book the return if the area is quieter in the evening.'
      }
    ]
  },
  {
    title: 'Reliable local rhythm',
    focus: 'Balance activity with predictability and clear check-in moments.',
    items: [
      {
        timeOfDay: 'Morning' as const,
        startTime: '09:00',
        endTime: '11:00',
        title: 'Slow start and planned outing',
        description: 'Use a structured morning start and confirm the day’s route before leaving.',
        safetyNote: 'Share the planned zone with guardians if movement will be extended.'
      },
      {
        timeOfDay: 'Afternoon' as const,
        startTime: '12:30',
        endTime: '15:30',
        title: 'Trusted venue block',
        description: 'Focus on well-rated cafés, museums, or activity spaces with stable footfall.',
        safetyNote: 'Avoid isolated detours between venues.'
      },
      {
        timeOfDay: 'Evening' as const,
        startTime: '17:00',
        endTime: '19:00',
        title: 'Short evening plan',
        description: 'Use the evening for one compact plan instead of a multi-stop route.',
        safetyNote: 'Keep the final stop close to your stay.'
      }
    ]
  }
];

export class ForHerItineraryService {
  constructor(private readonly itineraryRepository: ForHerItineraryRepository) {}

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

    const payload = this.buildPlanPayload(destination, input.numberOfDays, input.travelersCount);
    const title = tripContext
      ? `${tripContext.title} - Safe Itinerary`
      : `${destination} Safe Itinerary`;
    const overview = this.buildOverview(destination, input.numberOfDays, input.travelersCount);

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

  private buildPlanPayload(
    destination: string,
    numberOfDays: number,
    travelersCount: number
  ): StoredItineraryPayload {
    const days: ItineraryPlanDay[] = Array.from({ length: numberOfDays }, (_, index) => {
      const template = dayFocusTemplates[index % dayFocusTemplates.length];

      return {
        dayNumber: index + 1,
        title:
          index === 0
            ? `Day ${index + 1}: Arrive and settle in`
            : `Day ${index + 1}: ${template.title}`,
        focus: template.focus,
        items: template.items.map((item) => ({
          ...item,
          title:
            item.timeOfDay === 'Morning'
              ? `${destination} ${item.title}`
              : item.title
        }))
      };
    });

    return {
      rationale: [
        'Daylight-first sequencing reduces late transfers and uncertain arrival windows.',
        'Each day clusters activity into fewer zones to reduce unnecessary backtracking.',
        travelersCount > 1
          ? 'The plan keeps regrouping points simple so the trip stays coordinated for the full group.'
          : 'The plan leaves clear return windows so solo movement stays predictable.',
        'Evening blocks are intentionally shorter to keep the return leg calm and easier to verify.'
      ],
      days
    };
  }

  private buildOverview(
    destination: string,
    numberOfDays: number,
    travelersCount: number
  ): string {
    const travelerText = travelersCount === 1 ? 'solo traveller' : `${travelersCount} travellers`;

    return `A ${numberOfDays}-day SARA itinerary for ${destination}, designed for ${travelerText} with daylight-first movement, shorter transfers, and reliable return windows.`;
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
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }
}
