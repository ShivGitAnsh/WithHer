import type { DashboardPageData, SafetyBriefData } from '@/lib/types';
import { saraGuardianProfiles, saraTripCatalog } from '@/lib/product-data';

const hour = 60 * 60 * 1000;

export const demoSafetyBrief: SafetyBriefData = {
  brief:
    'She is travelling with a visible route, trusted guardian access, and a recent safe-arrival update already recorded. The current trip context shows active sharing and a clear escalation path if support is needed.',
  fallbackUsed: true
};

function buildTimeline(tripId: string, status: string) {
  const baseTitle = tripId === 'demo-trip-udaipur' ? 'Udaipur' : tripId === 'demo-trip-kasol' ? 'Kasol' : 'Goa';

  if (status === 'PLANNED') {
    return [
      {
        id: `${tripId}-evt-1`,
        tripId,
        eventType: 'BOOKED',
        title: 'Trip confirmed',
        description: 'Flights and hotel booking were locked with safety preferences applied.',
        occurredAt: new Date(Date.now() - 4 * hour).toISOString()
      }
    ];
  }

  if (status === 'COMPLETED') {
    return [
      {
        id: `${tripId}-evt-1`,
        tripId,
        eventType: 'DEPARTED',
        title: `Left for ${baseTitle}`,
        description: 'Outbound journey started in daylight.',
        occurredAt: new Date(Date.now() - 72 * hour).toISOString()
      },
      {
        id: `${tripId}-evt-2`,
        tripId,
        eventType: 'CHECKED_IN',
        title: 'Checked into stay',
        description: 'Hotel arrival and first reassurance update sent.',
        occurredAt: new Date(Date.now() - 66 * hour).toISOString()
      },
      {
        id: `${tripId}-evt-3`,
        tripId,
        eventType: 'HOME_REACHED',
        title: 'Reached home safely',
        description: 'Trip completed and visibility closed successfully.',
        occurredAt: new Date(Date.now() - 48 * hour).toISOString()
      }
    ];
  }

  return [
    {
      id: `${tripId}-evt-1`,
      tripId,
      eventType: 'BOOKED',
      title: 'Trip confirmed',
      description: 'Flights and stay have been booked successfully.',
      occurredAt: new Date(Date.now() - 8 * hour).toISOString()
    },
    {
      id: `${tripId}-evt-2`,
      tripId,
      eventType: 'DEPARTED',
      title: 'Left for airport',
      description: 'Journey to airport started during daylight hours.',
      occurredAt: new Date(Date.now() - 3 * hour).toISOString()
    },
    {
      id: `${tripId}-evt-3`,
      tripId,
      eventType: 'ARRIVED',
      title: 'Reached destination and checked in with family',
      description: 'Airport transfer completed and first reassurance ping sent.',
      occurredAt: new Date().toISOString()
    }
  ];
}

export function buildDemoDashboardData(tripId: string): DashboardPageData {
  const trip = saraTripCatalog.find((item) => item.id === tripId) ?? saraTripCatalog[0];
  const timeline = buildTimeline(trip.id, trip.status);
  const latestEvent = timeline.at(-1) ?? null;

  return {
    tripId: trip.id,
    trip: {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      status: trip.status,
      userId: 'demo-user-001',
      startDate: trip.startDate,
      endDate: trip.endDate
    },
    latestEvent,
    timeline,
    guardians: saraGuardianProfiles.map((guardian) => ({
      id: guardian.id,
      fullName: guardian.fullName,
      relationship: guardian.relationship,
      phoneNumber: guardian.phoneNumber.replaceAll(' ', ''),
      email: `${guardian.fullName.toLowerCase().replaceAll(' ', '.')}@example.com`
    })),
    safetyBrief: demoSafetyBrief,
    safetyScore: {
      score: trip.status === 'ACTIVE' ? 84 : trip.status === 'PLANNED' ? 78 : 89,
      status: trip.status === 'ACTIVE' ? 'Safe' : trip.status === 'PLANNED' ? 'Moderate' : 'Safe',
      reasons:
        trip.status === 'ACTIVE'
          ? [
              'Trip is actively shared with a trusted circle.',
              'Latest arrival update was recorded successfully.',
              'The current trip window has active guardian visibility.'
            ]
          : trip.status === 'PLANNED'
            ? [
                'Travel has been booked and is ready for safety sharing.',
                'Guardian visibility can be activated before departure.',
                'A pre-trip brief can improve clarity before travel begins.'
              ]
            : [
                'The previous trip completed with a recorded home return.',
                'No risk flags were raised during the final trip window.',
                'Guardian communication remained active through the journey.'
              ],
      fallbackUsed: true
    },
    itineraryPlan: null,
    source: 'demo'
  };
}

export const demoDashboardData = buildDemoDashboardData('demo-trip-goa');
