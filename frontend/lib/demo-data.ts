import type { DashboardPageData, ItineraryPlanData, SafetyBriefData } from '@/lib/types';
import { saraGuardianProfiles, saraTripCatalog } from '@/lib/product-data';

const hour = 60 * 60 * 1000;

export const demoSafetyBrief: SafetyBriefData = {
  brief:
    'She is travelling with a visible route, trusted guardian access, and a recent safe-arrival update already recorded. The current trip context shows active sharing and a clear escalation path if support is needed.',
  fallbackUsed: false
};

function buildItineraryPlan(tripId: string, destination: string): ItineraryPlanData {
  return {
    id: `demo-itinerary-${tripId}`,
    tripId,
    destination,
    numberOfDays: 3,
    travelersCount: 1,
    title: `${destination} Safe Itinerary`,
    overview: `A 3-day SARA itinerary for ${destination} with daylight-first movement and shorter evening plans.`,
    rationale: [
      'Daylight-first sequencing reduces uncertain late movement.',
      'Each day groups activities into fewer zones for easier route clarity.',
      'Evening plans stay short so the return leg remains predictable.'
    ],
    days: [
      {
        dayNumber: 1,
        title: 'Day 1: Arrive and settle in',
        focus: 'Keep the first day simple and close to your stay.',
        items: [
          {
            timeOfDay: 'Morning',
            startTime: '09:00',
            endTime: '11:00',
            title: `${destination} arrival and hotel check-in`,
            description: 'Settle in, confirm bookings, and stay within the main hotel zone.',
            safetyNote: 'Use a verified transfer or pre-booked hotel pickup.'
          },
          {
            timeOfDay: 'Afternoon',
            startTime: '13:00',
            endTime: '15:30',
            title: 'Short central-area orientation',
            description: 'Visit one known area close to the stay for route familiarity.',
            safetyNote: 'Avoid adding a second neighborhood on arrival day.'
          },
          {
            timeOfDay: 'Evening',
            startTime: '17:30',
            endTime: '19:00',
            title: 'Early dinner and return',
            description: 'Keep the evening compact and return before late-night movement begins.',
            safetyNote: 'End the day with one direct return route.'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Day 2: Main exploration block',
        focus: 'Use the best daylight hours for the primary experience.',
        items: [
          {
            timeOfDay: 'Morning',
            startTime: '08:30',
            endTime: '11:30',
            title: 'Primary sightseeing window',
            description: 'Cover the key destination activity while the area is active and visible.',
            safetyNote: 'Start early so the main route finishes before evening.'
          },
          {
            timeOfDay: 'Afternoon',
            startTime: '13:00',
            endTime: '15:30',
            title: 'Nearby café or museum stop',
            description: 'Layer one secondary stop close to the main plan.',
            safetyNote: 'Use one transport mode instead of switching repeatedly.'
          },
          {
            timeOfDay: 'Evening',
            startTime: '17:00',
            endTime: '19:00',
            title: 'Calm return window',
            description: 'Leave enough buffer for a steady return before dark.',
            safetyNote: 'Pre-book the return if the area gets quiet early.'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Day 3: Light final day and departure prep',
        focus: 'Keep movement lighter so departure stays controlled.',
        items: [
          {
            timeOfDay: 'Morning',
            startTime: '09:30',
            endTime: '11:00',
            title: 'Breakfast and local stop',
            description: 'Use the morning for one easy plan near the stay.',
            safetyNote: 'Avoid starting a long route before departure day packing.'
          },
          {
            timeOfDay: 'Afternoon',
            startTime: '12:30',
            endTime: '14:30',
            title: 'Packing and check-out prep',
            description: 'Create a calm buffer for logistics and final confirmations.',
            safetyNote: 'Reconfirm transfer timing before leaving the property.'
          },
          {
            timeOfDay: 'Evening',
            startTime: '16:00',
            endTime: '18:00',
            title: 'Departure window',
            description: 'Head out with enough time to avoid rushed transfers.',
            safetyNote: 'Use a verified route for the final outbound leg.'
          }
        ]
      }
    ],
    createdAt: new Date(Date.now() - hour).toISOString(),
    updatedAt: new Date(Date.now() - hour).toISOString()
  };
}

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
              ]
    },
    itineraryPlan: buildItineraryPlan(trip.id, trip.destination),
    source: 'demo'
  };
}

export const demoDashboardData = buildDemoDashboardData('demo-trip-goa');
