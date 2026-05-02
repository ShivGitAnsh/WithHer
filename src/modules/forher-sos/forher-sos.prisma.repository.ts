import { ConsentStatus, GuardianInviteStatus, TripEventType, type PrismaClient } from '@prisma/client';

import type {
  CreateSosEventRepositoryInput,
  ForHerSosRepository,
  SosCaseDetails,
  SosTripContext,
  SosTriggerResult
} from './forher-sos.types';
import { getSosSupportProfile } from './forher-sos.support-catalog';

export class PrismaForHerSosRepository implements ForHerSosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findTripContextByTripId(
    tripId: string,
    currentDate: Date
  ): Promise<SosTripContext | null> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        title: true,
        events: {
          orderBy: {
            occurredAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            eventType: true,
            title: true,
            description: true,
            occurredAt: true
          }
        },
        consents: {
          where: {
            status: ConsentStatus.ACTIVE,
            validFrom: {
              lte: currentDate
            },
            validUntil: {
              gt: currentDate
            },
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
                phoneNumber: true
              }
            }
          }
        }
      }
    });

    if (!trip) {
      return null;
    }

    return {
      trip: {
        id: trip.id,
        title: trip.title
      },
      latestEvent: trip.events[0] ?? null,
      guardians: trip.consents.map((consent) => consent.guardian)
    };
  }

  async findRecentSosEventByTripId(
    tripId: string,
    occurredAfter: Date
  ): Promise<SosTriggerResult['event'] | null> {
    return this.prisma.tripEvent.findFirst({
      where: {
        tripId,
        eventType: TripEventType.SOS_TRIGGERED,
        occurredAt: {
          gte: occurredAfter
        }
      },
      orderBy: {
        occurredAt: 'desc'
      },
      select: {
        id: true,
        tripId: true,
        eventType: true,
        title: true,
        description: true,
        occurredAt: true,
        createdAt: true
      }
    });
  }

  async createSosEvent(
    input: CreateSosEventRepositoryInput
  ): Promise<SosTriggerResult['event']> {
    return this.prisma.tripEvent.create({
      data: {
        tripId: input.tripId,
        eventType: TripEventType.SOS_TRIGGERED,
        title: 'SOS Triggered',
        description: 'Immediate SOS alert triggered from ForHer.',
        occurredAt: input.occurredAt
      },
      select: {
        id: true,
        tripId: true,
        eventType: true,
        title: true,
        description: true,
        occurredAt: true,
        createdAt: true
      }
    });
  }

  async findSosCaseById(caseId: string, currentDate: Date): Promise<SosCaseDetails | null> {
    const sosEvent = await this.prisma.tripEvent.findFirst({
      where: {
        id: caseId,
        eventType: TripEventType.SOS_TRIGGERED
      },
      select: {
        id: true,
        tripId: true,
        eventType: true,
        title: true,
        description: true,
        occurredAt: true,
        createdAt: true,
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            status: true,
            user: {
              select: {
                emergencyContacts: {
                  orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
                  select: {
                    id: true,
                    fullName: true,
                    relationship: true,
                    phoneNumber: true,
                    isPrimary: true,
                    notes: true
                  }
                }
              }
            },
            events: {
              orderBy: {
                occurredAt: 'desc'
              },
              take: 5,
              select: {
                id: true,
                eventType: true,
                title: true,
                description: true,
                occurredAt: true
              }
            },
            consents: {
              where: {
                status: ConsentStatus.ACTIVE,
                validFrom: {
                  lte: currentDate
                },
                validUntil: {
                  gt: currentDate
                },
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
                    relationship: true,
                    email: true,
                    phoneNumber: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!sosEvent) {
      return null;
    }

    const latestEventBeforeSos =
      sosEvent.trip.events.find((event) => event.id !== sosEvent.id) ?? null;
    const emergencyContacts = sosEvent.trip.user.emergencyContacts;
    const guardians = sosEvent.trip.consents.map((consent) => consent.guardian);
    const localSupport = getSosSupportProfile(sosEvent.trip.destination);
    const primaryEmergencyContact = emergencyContacts.find((contact) => contact.isPrimary) ?? emergencyContacts[0] ?? null;
    const primaryGuardian = guardians[0] ?? null;
    const latestStatus = latestEventBeforeSos
      ? `${latestEventBeforeSos.eventType} - ${latestEventBeforeSos.title}`
      : 'No previous trip update recorded';

    return {
      caseId: sosEvent.id,
      trip: {
        id: sosEvent.trip.id,
        title: sosEvent.trip.title,
        destination: sosEvent.trip.destination,
        status: sosEvent.trip.status
      },
      sosEvent: {
        id: sosEvent.id,
        tripId: sosEvent.tripId,
        eventType: sosEvent.eventType,
        title: sosEvent.title,
        description: sosEvent.description,
        occurredAt: sosEvent.occurredAt,
        createdAt: sosEvent.createdAt
      },
      latestEventBeforeSos,
      guardians,
      emergencyContacts,
      localSupport,
      escalationSteps: [
        {
          step: 1,
          label: 'Guardian alert sent',
          channel: 'WhatsApp',
          status: 'sent',
          description: 'Accepted guardians have already received the SOS notification and latest trip status.',
          contactName: primaryGuardian?.fullName ?? null,
          contactPhone: primaryGuardian?.phoneNumber ?? null
        },
        {
          step: 2,
          label: 'Primary emergency contact ready',
          channel: 'Phone',
          status: 'ready',
          description: 'Primary emergency contact is the next support layer for voice escalation and on-ground coordination.',
          contactName: primaryEmergencyContact?.fullName ?? null,
          contactPhone: primaryEmergencyContact?.phoneNumber ?? null
        },
        {
          step: 3,
          label: 'Front desk coordination',
          channel: 'Front Desk',
          status: 'ready',
          description: 'Property support can coordinate pickup, local assistance, or reception-level intervention.',
          contactName: localSupport.staySupport.propertyName,
          contactPhone: localSupport.staySupport.frontDeskPhone
        },
        {
          step: 4,
          label: 'Local helpline escalation',
          channel: 'Emergency Helpline',
          status: 'ready',
          description: 'Use the most relevant local helpline immediately if medical, police, or women-safety intervention is required.',
          contactName: localSupport.helplines[0]?.label ?? null,
          contactPhone: localSupport.helplines[0]?.phoneNumber ?? null
        }
      ],
      shareBundle: {
        headline: `SOS support for ${sosEvent.trip.title}`,
        summary: `Immediate guardian visibility has been triggered for ${sosEvent.trip.destination}.`,
        latestStatus,
        triggeredAt: sosEvent.occurredAt.toISOString(),
        guardianMessage: `SOS alert for ${sosEvent.trip.title}. Last known update: ${latestStatus}. Stay support: ${localSupport.staySupport.propertyName}, front desk ${localSupport.staySupport.frontDeskPhone}.`,
        actionChecklist: [
          'Call the traveller directly if reachable.',
          'Coordinate with the primary emergency contact for immediate local help.',
          'Use the stay front desk for verified pickup or on-ground assistance.',
          `Escalate to ${localSupport.helplines[0]?.label ?? 'local emergency services'} if immediate intervention is needed.`
        ]
      }
    };
  }
}
