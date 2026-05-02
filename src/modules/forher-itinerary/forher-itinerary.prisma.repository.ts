import { type Prisma, type PrismaClient } from '@prisma/client';

import type { ForHerItineraryRepository } from './forher-itinerary.repository';
import type {
  GenerateItineraryRepositoryInput,
  ItineraryPlanRecord,
  ItineraryTripContext,
  StoredItineraryPayload
} from './forher-itinerary.types';

const itineraryPlanSelect = {
  id: true,
  tripId: true,
  destination: true,
  numberOfDays: true,
  travelersCount: true,
  title: true,
  overview: true,
  generatedPlan: true,
  createdAt: true,
  updatedAt: true
} as const;

export class PrismaForHerItineraryRepository implements ForHerItineraryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findTripContextById(tripId: string): Promise<ItineraryTripContext | null> {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        status: true
      }
    });
  }

  async createItineraryPlan(
    input: GenerateItineraryRepositoryInput
  ): Promise<ItineraryPlanRecord> {
    const plan = await this.prisma.itineraryPlan.create({
      data: {
        tripId: input.tripId,
        destination: input.destination,
        numberOfDays: input.numberOfDays,
        travelersCount: input.travelersCount,
        title: input.title,
        overview: input.overview,
        generatedPlan: input.generatedPlan as unknown as Prisma.InputJsonValue
      },
      select: itineraryPlanSelect
    });

    return this.toRecord(plan);
  }

  async findItineraryPlanById(id: string): Promise<ItineraryPlanRecord | null> {
    const plan = await this.prisma.itineraryPlan.findUnique({
      where: { id },
      select: itineraryPlanSelect
    });

    return plan ? this.toRecord(plan) : null;
  }

  async findLatestItineraryPlanByTripId(
    tripId: string
  ): Promise<ItineraryPlanRecord | null> {
    const plan = await this.prisma.itineraryPlan.findFirst({
      where: { tripId },
      orderBy: {
        createdAt: 'desc'
      },
      select: itineraryPlanSelect
    });

    return plan ? this.toRecord(plan) : null;
  }

  private toRecord(
    plan: Prisma.ItineraryPlanGetPayload<{ select: typeof itineraryPlanSelect }>
  ): ItineraryPlanRecord {
    return {
      ...plan,
      generatedPlan: plan.generatedPlan as unknown as StoredItineraryPayload
    };
  }
}
