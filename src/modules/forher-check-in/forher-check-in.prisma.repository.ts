import {
  CheckInRuleStatus,
  ConsentStatus,
  GuardianInviteStatus,
  type PrismaClient,
  type TripEventType
} from '@prisma/client';

import type { ForHerCheckInRepository } from './forher-check-in.repository';
import type {
  CheckInRuleContext,
  CheckInRuleListItem,
  CheckInRuleRecord,
  CreateCheckInRuleRepositoryInput
} from './forher-check-in.types';

export class PrismaForHerCheckInRepository implements ForHerCheckInRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async tripExists(tripId: string): Promise<boolean> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true }
    });

    return Boolean(trip);
  }

  async createCheckInRule(
    input: CreateCheckInRuleRepositoryInput
  ): Promise<CheckInRuleRecord> {
    return this.prisma.checkInRule.create({
      data: input
    });
  }

  async findCheckInRulesByTripId(tripId: string): Promise<CheckInRuleListItem[]> {
    return this.prisma.checkInRule.findMany({
      where: { tripId },
      orderBy: [{ status: 'asc' }, { expectedAt: 'asc' }],
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            status: true
          }
        }
      }
    });
  }

  async findPendingRuleIdsDueForEvaluation(currentDate: Date, limit: number): Promise<string[]> {
    const rules = await this.prisma.checkInRule.findMany({
      where: {
        status: CheckInRuleStatus.PENDING,
        expectedAt: {
          lte: currentDate
        }
      },
      orderBy: {
        expectedAt: 'asc'
      },
      take: limit,
      select: {
        id: true
      }
    });

    return rules.map((rule) => rule.id);
  }

  async findCheckInRuleContextById(
    ruleId: string,
    currentDate: Date
  ): Promise<CheckInRuleContext | null> {
    const rule = await this.prisma.checkInRule.findUnique({
      where: { id: ruleId },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            status: true,
            consents: {
              where: {
                status: ConsentStatus.ACTIVE,
                validFrom: { lte: currentDate },
                validUntil: { gt: currentDate },
                OR: [
                  {
                    guardianInvite: {
                      is: null
                    }
                  },
                  {
                    guardianInvite: {
                      is: {
                        status: GuardianInviteStatus.ACCEPTED
                      }
                    }
                  }
                ]
              },
              select: {
                guardian: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    relationship: true
                  }
                }
              }
            },
            events: {
              orderBy: { occurredAt: 'desc' },
              take: 20,
              select: {
                id: true,
                title: true,
                eventType: true,
                description: true,
                occurredAt: true
              }
            }
          }
        }
      }
    });

    if (!rule) {
      return null;
    }

    const matchingEvent =
      rule.trip.events.find(
        (event) =>
          event.eventType === rule.expectedEventType &&
          event.occurredAt >= rule.expectedAt
      ) ?? null;

    return {
      rule,
      trip: rule.trip,
      matchingEvent,
      latestEvent: rule.trip.events[0] ?? null,
      guardians: rule.trip.consents.map((consent) => consent.guardian)
    };
  }

  async updateRuleCompleted(
    ruleId: string,
    completedAt: Date,
    completedEventId: string
  ): Promise<CheckInRuleRecord> {
    return this.prisma.checkInRule.update({
      where: { id: ruleId },
      data: {
        status: CheckInRuleStatus.COMPLETED,
        lastEvaluatedAt: completedAt,
        completedAt,
        completedEventId
      }
    });
  }

  async updateRuleEscalated(ruleId: string, evaluatedAt: Date): Promise<CheckInRuleRecord> {
    return this.prisma.checkInRule.update({
      where: { id: ruleId },
      data: {
        status: CheckInRuleStatus.ESCALATED,
        lastEvaluatedAt: evaluatedAt,
        escalatedAt: evaluatedAt
      }
    });
  }

  async findPendingRulesForEvent(
    tripId: string,
    eventType: TripEventType,
    occurredAt: Date
  ): Promise<CheckInRuleRecord[]> {
    return this.prisma.checkInRule.findMany({
      where: {
        tripId,
        expectedEventType: eventType,
        status: CheckInRuleStatus.PENDING,
        expectedAt: {
          lte: occurredAt
        }
      },
      orderBy: {
        expectedAt: 'asc'
      }
    });
  }
}
