import { ApiError } from '@/lib/api-error';
import {
  buildDemoDashboardData,
  demoDashboardData,
  demoSafetyBrief
} from '@/lib/demo-data';
import {
  demoFlightOptions,
  demoHotelOptions,
  saraDemoConsents,
  saraDemoMatchCandidates,
  saraEmergencyContacts,
  saraGuardianProfiles,
  saraHotelListings,
  saraTrustLogEntries
} from '@/lib/product-data';
import type {
  CheckInEvaluationData,
  CheckInRuleData,
  ConsentData,
  CreateCheckInRuleInput,
  CreateConsentInput,
  CreateEmergencyContactInput,
  CreateGuardianInput,
  DashboardPageData,
  EmergencyContact,
  FamilyDashboardApiResponse,
  FlightRankingOption,
  ForHerPreferenceData,
  GuardianInviteData,
  Guardian,
  HotelRankingOption,
  ItineraryPlanData,
  ListingDetail,
  ListingSafetyData,
  MatchingCandidateData,
  MatchingConnectData,
  MatchingProfileData,
  RankedFlightOption,
  RankedHotelOption,
  SafetyScoreData,
  SafetyBriefData,
  SosCaseData,
  SosTriggerData,
  TrustLogEntryData
} from '@/lib/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

const DEMO_TRIP_ID =
  process.env.NEXT_PUBLIC_DEMO_TRIP_ID || demoDashboardData.tripId;

/** IDs like `demo-trip-goa` / `demo-user-001` are not in the database — use local demo data only. */
const isDemoEntityId = (id: string | undefined): boolean =>
  typeof id === 'string' && id.startsWith('demo-');

function buildDemoDashboardForTrip(tripId: string): DashboardPageData {
  return buildDemoDashboardData(tripId);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: { message?: string; code?: string };
  };

  if (!response.ok) {
    throw new ApiError(
      payload.error?.message ?? 'API request failed',
      response.status,
      payload.error?.code
    );
  }

  if (payload.data === undefined) {
    throw new ApiError('Invalid API response: missing data', response.status);
  }

  return payload.data;
}

async function fetchJsonAllowNull<T>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T | null;
    error?: { message?: string; code?: string };
  };

  if (!response.ok) {
    throw new ApiError(
      payload.error?.message ?? 'API request failed',
      response.status,
      payload.error?.code
    );
  }

  return payload.data ?? null;
}

export async function getDashboardPageData(
  tripId = DEMO_TRIP_ID
): Promise<DashboardPageData> {
  if (isDemoEntityId(tripId)) {
    return buildDemoDashboardForTrip(tripId);
  }

  try {
    const [dashboard, safetyBrief, safetyScore, itineraryPlan] = await Promise.all([
      fetchJson<FamilyDashboardApiResponse>(`${API_BASE_URL}/trips/${tripId}/family-dashboard`),
      fetchJson<SafetyBriefData>(`${API_BASE_URL}/trips/${tripId}/safety-brief`, {
        method: 'POST'
      }),
      fetchJson<SafetyScoreData>(`${API_BASE_URL}/forher/trips/${tripId}/safety-score`),
      getLatestItineraryForTrip(tripId)
    ]);

    return {
      tripId,
      trip: dashboard.trip,
      latestEvent: dashboard.latestEvent,
      timeline: dashboard.timeline,
      guardians: dashboard.guardians,
      safetyBrief,
      safetyScore,
      itineraryPlan,
      source: 'api'
    };
  } catch {
    return demoDashboardData;
  }
}

export function getDefaultDemoTripId(): string {
  return DEMO_TRIP_ID;
}

export async function getFamilyDashboardData(
  tripId = DEMO_TRIP_ID
): Promise<FamilyDashboardApiResponse> {
  if (isDemoEntityId(tripId)) {
    const demoData = buildDemoDashboardForTrip(tripId);

    return {
      trip: demoData.trip,
      latestEvent: demoData.latestEvent,
      timeline: demoData.timeline,
      guardians: demoData.guardians
    };
  }

  return fetchJson<FamilyDashboardApiResponse>(
    `${API_BASE_URL}/trips/${tripId}/family-dashboard`
  );
}

export async function refreshDashboardData(tripId: string) {
  return getDashboardPageData(tripId);
}

export async function regenerateSafetyBrief(tripId: string): Promise<SafetyBriefData> {
  if (isDemoEntityId(tripId)) {
    return { ...demoSafetyBrief, fallbackUsed: false };
  }

  try {
    return await fetchJson<SafetyBriefData>(`${API_BASE_URL}/trips/${tripId}/safety-brief`, {
      method: 'POST'
    });
  } catch {
    return {
      ...demoSafetyBrief,
      fallbackUsed: true
    };
  }
}

export async function getLatestItineraryForTrip(
  tripId: string
): Promise<ItineraryPlanData | null> {
  if (isDemoEntityId(tripId)) {
    return buildDemoDashboardForTrip(tripId).itineraryPlan;
  }

  try {
    return await fetchJsonAllowNull<ItineraryPlanData>(
      `${API_BASE_URL}/forher/itineraries?tripId=${encodeURIComponent(tripId)}`
    );
  } catch {
    return null;
  }
}

export async function generateItineraryPlan(input: {
  tripId?: string;
  destination?: string;
  numberOfDays: number;
  travelersCount?: number;
}): Promise<ItineraryPlanData> {
  if ((input.tripId && isDemoEntityId(input.tripId)) || (!input.tripId && input.destination)) {
    const dashboard = buildDemoDashboardForTrip(input.tripId ?? DEMO_TRIP_ID);
    const existing = dashboard.itineraryPlan;

    return {
      ...(existing ?? {
        id: `demo-itinerary-${Date.now()}`,
        tripId: input.tripId ?? null,
        destination: input.destination ?? dashboard.trip.destination,
        numberOfDays: input.numberOfDays,
        travelersCount: input.travelersCount ?? 1,
        title: `${input.destination ?? dashboard.trip.destination} Safe Itinerary`,
        overview: `A ${input.numberOfDays}-day SARA itinerary built for calm, daylight-first movement.`,
        rationale: [
          'Daylight-first sequencing reduces uncertain late movement.',
          'Shorter evening plans keep the return leg predictable.',
          'The route is grouped into fewer zones to avoid unnecessary backtracking.'
        ],
        days: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      id: existing?.id ?? `demo-itinerary-${Date.now()}`,
      tripId: input.tripId ?? existing?.tripId ?? null,
      destination: input.destination ?? existing?.destination ?? dashboard.trip.destination,
      numberOfDays: input.numberOfDays,
      travelersCount: input.travelersCount ?? existing?.travelersCount ?? 1,
      updatedAt: new Date().toISOString()
    };
  }

  return fetchJson<ItineraryPlanData>(`${API_BASE_URL}/forher/itineraries/generate`, {
    method: 'POST',
    body: JSON.stringify({
      tripId: input.tripId,
      destination: input.destination,
      numberOfDays: input.numberOfDays,
      travelersCount: input.travelersCount ?? 1
    })
  });
}

export async function getForHerPreference(
  userId: string
): Promise<ForHerPreferenceData> {
  if (isDemoEntityId(userId)) {
    return { userId, enabled: false };
  }

  return fetchJson<ForHerPreferenceData>(
    `${API_BASE_URL}/forher/preferences?userId=${encodeURIComponent(userId)}`
  );
}

export async function updateForHerPreference(
  userId: string,
  enabled: boolean
): Promise<ForHerPreferenceData> {
  if (isDemoEntityId(userId)) {
    return { userId, enabled };
  }

  return fetchJson<ForHerPreferenceData>(`${API_BASE_URL}/forher/preferences`, {
    method: 'PUT',
    body: JSON.stringify({
      userId,
      enabled
    })
  });
}

export async function triggerSosAlert(tripId: string): Promise<SosTriggerData> {
  if (isDemoEntityId(tripId)) {
    const now = new Date().toISOString();

    return {
      event: {
        id: `demo-sos-${Date.now()}`,
        tripId,
        eventType: 'SOS_TRIGGERED',
        title: 'SOS Triggered',
        description: 'Immediate SOS alert triggered from the dashboard.',
        occurredAt: now,
        createdAt: now
      },
      duplicateSuppressed: false
    };
  }

  return fetchJson<SosTriggerData>(`${API_BASE_URL}/forher/sos/trigger`, {
    method: 'POST',
    body: JSON.stringify({
      tripId
    })
  });
}

export async function getSosCase(caseId: string): Promise<SosCaseData> {
  if (isDemoEntityId(caseId)) {
    const event = {
      id: caseId,
      tripId: 'demo-trip-goa',
      eventType: 'SOS_TRIGGERED',
      title: 'SOS Triggered',
      description: 'Immediate SOS alert triggered from the dashboard.',
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return {
      caseId,
      trip: demoDashboardData.trip,
      sosEvent: event,
      latestEventBeforeSos: demoDashboardData.latestEvent,
      guardians: demoDashboardData.guardians,
      emergencyContacts: [...saraEmergencyContacts],
      localSupport: {
        destinationLabel: 'Goa',
        helplines: [
          {
            label: 'Police',
            phoneNumber: '112',
            category: 'Police',
            availability: '24x7'
          },
          {
            label: 'Women Helpline',
            phoneNumber: '1091',
            category: 'Women Helpline',
            availability: '24x7'
          },
          {
            label: 'Medical Emergency',
            phoneNumber: '108',
            category: 'Medical',
            availability: '24x7'
          },
          {
            label: 'Goa Tourist Helpline',
            phoneNumber: '1364',
            category: 'Tourist Support',
            availability: '24x7'
          }
        ],
        staySupport: {
          propertyName: 'Harbour House Panaji',
          frontDeskPhone: '+91 832 710 2233',
          supportDeskLabel: 'Airport transfer desk',
          supportDeskPhone: '+91 832 710 2299',
          addressHint: 'Central Panaji stay near the main boulevard and reception lobby',
          transferNote:
            'Ask the hotel desk for verified airport or city transfer support and avoid unplanned late-night movement.'
        }
      },
      escalationSteps: [
        {
          step: 1,
          label: 'Guardian alert sent',
          channel: 'WhatsApp',
          status: 'sent',
          description: 'Accepted guardians have already received the SOS notification and latest trip status.',
          contactName: demoDashboardData.guardians[0]?.fullName ?? null,
          contactPhone: demoDashboardData.guardians[0]?.phoneNumber ?? null
        },
        {
          step: 2,
          label: 'Primary emergency contact ready',
          channel: 'Phone',
          status: 'ready',
          description: 'Primary emergency contact is next in line for direct call and on-ground coordination.',
          contactName: saraEmergencyContacts[0]?.fullName ?? null,
          contactPhone: saraEmergencyContacts[0]?.phoneNumber ?? null
        },
        {
          step: 3,
          label: 'Front desk coordination',
          channel: 'Front Desk',
          status: 'ready',
          description: 'Property support can coordinate pickup or immediate reception-level support.',
          contactName: 'Harbour House Panaji',
          contactPhone: '+91 832 710 2233'
        },
        {
          step: 4,
          label: 'Local helpline escalation',
          channel: 'Emergency Helpline',
          status: 'ready',
          description: 'Escalate to the appropriate local helpline immediately if direct support is required.',
          contactName: 'Police',
          contactPhone: '112'
        }
      ],
      shareBundle: {
        headline: `SOS support for ${demoDashboardData.trip.title}`,
        summary: `Immediate guardian visibility has been triggered for ${demoDashboardData.trip.destination}.`,
        latestStatus: demoDashboardData.latestEvent
          ? `${demoDashboardData.latestEvent.eventType} - ${demoDashboardData.latestEvent.title}`
          : 'No previous trip update recorded',
        triggeredAt: event.occurredAt,
        guardianMessage: `SOS alert for ${demoDashboardData.trip.title}. Last known update: ${demoDashboardData.latestEvent ? `${demoDashboardData.latestEvent.eventType} - ${demoDashboardData.latestEvent.title}` : 'No previous trip update recorded'}. Stay support: Harbour House Panaji, front desk +91 832 710 2233.`,
        actionChecklist: [
          'Call the traveller directly if reachable.',
          'Coordinate with the primary emergency contact for immediate local help.',
          'Use the stay front desk for verified pickup or on-ground assistance.',
          'Escalate to local emergency services if immediate intervention is needed.'
        ]
      }
    };
  }

  return fetchJson<SosCaseData>(`${API_BASE_URL}/forher/sos/${caseId}`);
}

export async function getGuardianInvite(token: string): Promise<GuardianInviteData> {
  if (token === 'demo-invite-pending' || token === 'demo-invite-accepted') {
    const consent = saraDemoConsents.find((item) => item.guardianInvite?.token === token) ?? saraDemoConsents[0];

    return {
      id: consent.guardianInvite?.id ?? 'invite-demo-1',
      token,
      status: (consent.guardianInvite?.status ?? 'PENDING') as GuardianInviteData['status'],
      expiresAt: consent.guardianInvite?.expiresAt ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      acceptedAt: consent.guardianInvite?.acceptedAt ?? null,
      guardian: {
        id: consent.guardian.id,
        fullName: consent.guardian.fullName,
        relationship: consent.guardian.relationship,
        email: consent.guardian.email,
        phoneNumber: consent.guardian.phoneNumber
      },
      trip: {
        id: consent.trip?.id ?? demoDashboardData.trip.id,
        title: consent.trip?.title ?? demoDashboardData.trip.title,
        destination: consent.trip?.destination ?? demoDashboardData.trip.destination,
        status: (consent.trip?.status ?? demoDashboardData.trip.status) as GuardianInviteData['trip']['status'],
        startDate: demoDashboardData.trip.startDate ?? new Date().toISOString(),
        endDate: demoDashboardData.trip.endDate ?? new Date().toISOString()
      },
      consent: {
        id: consent.id,
        status: consent.status,
        shareScopes: [...consent.shareScopes],
        validUntil: consent.validUntil
      }
    };
  }

  return fetchJson<GuardianInviteData>(
    `${API_BASE_URL}/forher/guardian-invites/${encodeURIComponent(token)}`
  );
}

export async function acceptGuardianInvite(token: string): Promise<GuardianInviteData> {
  if (token === 'demo-invite-pending' || token === 'demo-invite-accepted') {
    const invite = await getGuardianInvite(token);

    return {
      ...invite,
      status: 'ACCEPTED',
      acceptedAt: invite.acceptedAt ?? new Date().toISOString()
    };
  }

  return fetchJson<GuardianInviteData>(
    `${API_BASE_URL}/forher/guardian-invites/${encodeURIComponent(token)}/accept`,
    {
      method: 'POST'
    }
  );
}

export async function getCheckInRules(tripId: string): Promise<CheckInRuleData[]> {
  if (isDemoEntityId(tripId)) {
    const now = Date.now();

    return [
      {
        id: `${tripId}-checkin-1`,
        tripId,
        title: 'Hotel arrival confirmation',
        expectedEventType: 'CHECKED_IN',
        expectedAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        graceMinutes: 45,
        status: 'PENDING',
        lastEvaluatedAt: null,
        escalatedAt: null,
        completedAt: null,
        completedEventId: null,
        createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 30 * 60 * 1000).toISOString()
      }
    ];
  }

  return fetchJson<CheckInRuleData[]>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/check-in-rules`
  );
}

export async function createCheckInRule(
  input: CreateCheckInRuleInput
): Promise<CheckInRuleData> {
  if (isDemoEntityId(input.tripId)) {
    const now = new Date().toISOString();

    return {
      id: `demo-checkin-${Date.now()}`,
      tripId: input.tripId,
      title: input.title,
      expectedEventType: input.expectedEventType,
      expectedAt: input.expectedAt,
      graceMinutes: input.graceMinutes,
      status: 'PENDING',
      lastEvaluatedAt: null,
      escalatedAt: null,
      completedAt: null,
      completedEventId: null,
      createdAt: now,
      updatedAt: now
    };
  }

  return fetchJson<CheckInRuleData>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(input.tripId)}/check-in-rules`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: input.title,
        expectedEventType: input.expectedEventType,
        expectedAt: input.expectedAt,
        graceMinutes: input.graceMinutes
      })
    }
  );
}

export async function evaluateCheckInRule(ruleId: string): Promise<CheckInEvaluationData> {
  if (ruleId.startsWith('demo-') || ruleId.includes('-checkin-')) {
    const now = new Date().toISOString();

    return {
      rule: {
        id: ruleId,
        tripId: demoDashboardData.tripId,
        title: 'Hotel arrival confirmation',
        expectedEventType: 'CHECKED_IN',
        expectedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        graceMinutes: 45,
        status: 'ESCALATED',
        lastEvaluatedAt: now,
        escalatedAt: now,
        completedAt: null,
        completedEventId: null,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: now
      },
      completed: false,
      escalated: true,
      matchedEvent: null
    };
  }

  return fetchJson<CheckInEvaluationData>(
    `${API_BASE_URL}/forher/check-in-rules/${encodeURIComponent(ruleId)}/evaluate`,
    {
      method: 'POST'
    }
  );
}

export async function optInToMatching(input: {
  tripId: string;
  displayName: string;
  city?: string;
  travelStyle?: string;
  hotelPreference?: string;
  interests: string[];
}): Promise<MatchingProfileData> {
  if (isDemoEntityId(input.tripId)) {
    return {
      id: `demo-match-profile-${input.tripId}`,
      tripId: input.tripId,
      userId: 'demo-user-001',
      displayName: input.displayName,
      city: input.city ?? 'Bengaluru',
      travelStyle: input.travelStyle ?? null,
      hotelPreference: input.hotelPreference ?? null,
      interests: [...input.interests],
      status: 'ACTIVE'
    };
  }

  return fetchJson<MatchingProfileData>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(input.tripId)}/matching/opt-in`,
    {
      method: 'POST',
      body: JSON.stringify({
        displayName: input.displayName,
        city: input.city,
        travelStyle: input.travelStyle,
        hotelPreference: input.hotelPreference,
        interests: input.interests
      })
    }
  );
}

export async function getMatchingProfile(
  tripId: string
): Promise<MatchingProfileData | null> {
  if (isDemoEntityId(tripId)) {
    return null;
  }

  return fetchJsonAllowNull<MatchingProfileData>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/matching/profile`
  );
}

export async function getMatchingCandidates(
  tripId: string
): Promise<MatchingCandidateData[]> {
  if (isDemoEntityId(tripId)) {
    return (saraDemoMatchCandidates[tripId as keyof typeof saraDemoMatchCandidates] ?? []).map(
      (candidate) => ({
        ...candidate,
        interests: [...candidate.interests],
        reasons: [...candidate.reasons]
      })
    );
  }

  return fetchJson<MatchingCandidateData[]>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/matching/candidates`
  );
}

export async function connectMatch(input: {
  tripId: string;
  matchId: string;
}): Promise<MatchingConnectData> {
  if (isDemoEntityId(input.tripId) || input.matchId.startsWith('demo-match-')) {
    const now = new Date().toISOString();

    return {
      connection: {
        id: `demo-connection-${Date.now()}`,
        sourceProfileId: `demo-match-profile-${input.tripId}`,
        targetProfileId: input.matchId,
        status: 'CONNECTED',
        createdAt: now,
        updatedAt: now
      },
      sourceProfileId: `demo-match-profile-${input.tripId}`,
      targetProfileId: input.matchId
    };
  }

  return fetchJson<MatchingConnectData>(
    `${API_BASE_URL}/forher/matches/${encodeURIComponent(input.matchId)}/connect`,
    {
      method: 'POST',
      body: JSON.stringify({
        tripId: input.tripId
      })
    }
  );
}

export async function getGuardians(userId: string): Promise<Guardian[]> {
  if (isDemoEntityId(userId)) {
    return saraGuardianProfiles.map((guardian) => ({
      id: guardian.id,
      fullName: guardian.fullName,
      relationship: guardian.relationship,
      phoneNumber: guardian.phoneNumber.replaceAll(' ', ''),
      email: `${guardian.fullName.toLowerCase().replaceAll(' ', '.')}@example.com`
    }));
  }

  return fetchJson<Guardian[]>(
    `${API_BASE_URL}/forher/guardians?userId=${encodeURIComponent(userId)}`
  );
}

export async function createGuardian(input: CreateGuardianInput): Promise<Guardian> {
  if (isDemoEntityId(input.userId)) {
    return {
      id: `demo-guardian-${Date.now()}`,
      fullName: input.fullName,
      relationship: input.relationship,
      phoneNumber: input.phoneNumber ?? null,
      email: input.email ?? null
    };
  }

  return fetchJson<Guardian>(`${API_BASE_URL}/forher/guardians`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  if (isDemoEntityId(userId)) {
    return [...saraEmergencyContacts];
  }

  return fetchJson<EmergencyContact[]>(
    `${API_BASE_URL}/forher/emergency-contacts?userId=${encodeURIComponent(userId)}`
  );
}

export async function createEmergencyContact(
  input: CreateEmergencyContactInput
): Promise<EmergencyContact> {
  if (isDemoEntityId(input.userId)) {
    return {
      id: `demo-contact-${Date.now()}`,
      userId: input.userId,
      fullName: input.fullName,
      relationship: input.relationship,
      phoneNumber: input.phoneNumber,
      isPrimary: input.isPrimary ?? false,
      notes: input.notes ?? null
    };
  }

  return fetchJson<EmergencyContact>(`${API_BASE_URL}/forher/emergency-contacts`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
  if (isDemoEntityId(contactId)) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/forher/emergency-contacts/${contactId}`, {
    method: 'DELETE',
    cache: 'no-store'
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };

    throw new ApiError(
      payload.error?.message ?? 'Unable to delete emergency contact',
      response.status,
      payload.error?.code
    );
  }
}

export async function getConsents(input: {
  userId?: string;
  tripId?: string;
}): Promise<ConsentData[]> {
  if (
    (input.userId && isDemoEntityId(input.userId)) ||
    (input.tripId && isDemoEntityId(input.tripId))
  ) {
    return saraDemoConsents
      .filter((consent) => {
        if (input.userId && consent.userId !== input.userId) {
          return false;
        }

        if (input.tripId && consent.tripId !== input.tripId) {
          return false;
        }

        return true;
      })
      .map((consent) => ({
        ...consent,
        shareScopes: [...consent.shareScopes]
      }));
  }

  const searchParams = new URLSearchParams();

  if (input.userId) {
    searchParams.set('userId', input.userId);
  }

  if (input.tripId) {
    searchParams.set('tripId', input.tripId);
  }

  return fetchJson<ConsentData[]>(`${API_BASE_URL}/forher/consents?${searchParams.toString()}`);
}

export async function getTrustLog(tripId: string): Promise<TrustLogEntryData[]> {
  if (isDemoEntityId(tripId)) {
    return saraTrustLogEntries
      .filter((entry) => entry.tripId === tripId)
      .map((entry) => ({
        ...entry,
        metadata: entry.metadata ? { ...entry.metadata } : null
      }));
  }

  return fetchJson<TrustLogEntryData[]>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/trust-log`
  );
}

export async function createConsent(input: CreateConsentInput): Promise<ConsentData> {
  if (isDemoEntityId(input.tripId) || isDemoEntityId(input.guardianId)) {
    const guardian =
      saraDemoConsents.find((consent) => consent.guardianId === input.guardianId)?.guardian ??
      {
        id: input.guardianId,
        fullName: 'Guardian',
        relationship: 'Guardian',
        phoneNumber: null,
        email: null
      };

    return {
      id: `demo-consent-${Date.now()}`,
      userId: 'demo-user-001',
      guardianId: input.guardianId,
      tripId: input.tripId,
      status: 'ACTIVE',
      shareScopes: input.shareScopes,
      validFrom: new Date().toISOString(),
      validUntil: input.validUntil,
      revokedAt: null,
      guardian,
      trip: demoDashboardData.trip
    };
  }

  return fetchJson<ConsentData>(`${API_BASE_URL}/forher/consents`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function revokeConsent(
  consentId: string,
  reason?: string
): Promise<ConsentData> {
  if (isDemoEntityId(consentId) || consentId.startsWith('demo-consent-')) {
    const existing = saraDemoConsents.find((consent) => consent.id === consentId);

    return {
      ...(existing ?? saraDemoConsents[0]),
      shareScopes: [...(existing ?? saraDemoConsents[0]).shareScopes],
      id: consentId,
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      revokedReason: reason ?? 'Revoked by traveller.'
    };
  }

  return fetchJson<ConsentData>(`${API_BASE_URL}/forher/consents/${consentId}`, {
    method: 'DELETE',
    body: JSON.stringify(
      reason
        ? {
            reason
          }
        : {}
    )
  });
}

export async function rankFlightOptions(
  options: FlightRankingOption[]
): Promise<RankedFlightOption[]> {
  if (options.every((option) => isDemoEntityId(option.id))) {
    return rankFlightOptionsLocally(options);
  }

  try {
    return await fetchJson<RankedFlightOption[]>(`${API_BASE_URL}/forher/flight-options/rank`, {
      method: 'POST',
      body: JSON.stringify({ options })
    });
  } catch {
    return rankFlightOptionsLocally(options);
  }
}

export async function rankHotelOptions(
  options: HotelRankingOption[]
): Promise<RankedHotelOption[]> {
  if (options.every((option) => isDemoEntityId(option.id))) {
    return rankHotelOptionsLocally(options);
  }

  try {
    return await fetchJson<RankedHotelOption[]>(`${API_BASE_URL}/forher/hotel-options/rank`, {
      method: 'POST',
      body: JSON.stringify({ options })
    });
  } catch {
    return rankHotelOptionsLocally(options);
  }
}

export function getListingDetails(listingId: string): ListingDetail | null {
  const listing = saraHotelListings.find((item) => item.id === listingId);

  return listing
    ? {
        ...listing,
        womenReviewHighlights: [...listing.womenReviewHighlights],
        nearbyEssentials: [...listing.nearbyEssentials]
      }
    : null;
}

export async function getListingSafetyScore(
  listingId: string
): Promise<ListingSafetyData | null> {
  const listing = getListingDetails(listingId);

  if (!listing) {
    return null;
  }

  try {
    return await fetchJson<ListingSafetyData>(
      `${API_BASE_URL}/forher/listings/${encodeURIComponent(listingId)}/safety-score`
    );
  } catch {
    const ranked = rankHotelOptionsLocally([
      {
        id: listing.id,
        name: listing.name,
        neighborhood: listing.neighborhood,
        womenReviewScore: listing.womenReviewScore,
        verified: listing.verified,
        transportAvailability: listing.transportAvailability,
        nearPharmacy: listing.nearPharmacy,
        nearHospital: listing.nearHospital,
        nearPoliceStation: listing.nearPoliceStation,
        convenience24x7: listing.convenience24x7
      }
    ])[0];

    return {
      listingId: listing.id,
      name: listing.name,
      neighborhood: listing.neighborhood,
      city: listing.city,
      score: ranked.safetyScore,
      status:
        ranked.safetyScore >= 80
          ? 'Safe'
          : ranked.safetyScore >= 60
            ? 'Moderate'
            : 'Risky',
      recommendation: ranked.recommendation,
      reasons: ranked.reasons,
      womenReviewHighlights: [...listing.womenReviewHighlights],
      nearbyEssentials: [...listing.nearbyEssentials],
      transferGuidance: listing.transferGuidance
    };
  }
}

export async function getExploreSafetyPreview(): Promise<{
  flights: RankedFlightOption[];
  hotels: RankedHotelOption[];
}> {
  const flights = await rankFlightOptions(
    demoFlightOptions.map((option) => ({ ...option }))
  );
  const hotels = await rankHotelOptions(
    demoHotelOptions.map((option) => ({ ...option }))
  );

  return { flights, hotels };
}

function rankFlightOptionsLocally(options: FlightRankingOption[]): RankedFlightOption[] {
  return [...options]
    .map((option) => {
      const arrivalHour = new Date(option.arrivalAt).getHours();
      const reasons: string[] = [];
      let safetyScore = 100;

      if ([22, 23, 0, 1, 2, 3, 4, 5].includes(arrivalHour)) {
        safetyScore -= 35;
        reasons.push('Arrival happens during late-night hours.');
      } else {
        reasons.push('Arrival happens in a safer daytime or early-evening window.');
      }

      if (option.stops >= 2) {
        safetyScore -= 15;
        reasons.push('Multiple stops can increase transfer risk.');
      } else if (option.stops === 1) {
        safetyScore -= 6;
        reasons.push('One stop adds some transfer complexity.');
      } else {
        reasons.push('Direct routing keeps the journey simpler.');
      }

      return {
        ...option,
        safetyScore: Math.max(0, Math.min(100, safetyScore)),
        recommendation:
          safetyScore >= 80
            ? 'Recommended'
            : safetyScore >= 60
              ? 'Late arrival, use caution'
              : 'Not recommended for solo arrival',
        reasons,
        saferTransferHint:
          safetyScore >= 80
            ? 'Use verified airport pickup or hotel transfer for a smoother arrival.'
            : 'Pre-book an airport pickup or hotel transfer before arrival.'
      } satisfies RankedFlightOption;
    })
    .sort((left, right) => right.safetyScore - left.safetyScore);
}

function rankHotelOptionsLocally(options: HotelRankingOption[]): RankedHotelOption[] {
  return [...options]
    .map((option) => {
      const reasons: string[] = [];
      let safetyScore = 55;

      if (typeof option.womenReviewScore === 'number') {
        safetyScore += Math.round(option.womenReviewScore * 7);
        reasons.push(`Women traveller review score is ${option.womenReviewScore.toFixed(1)} / 5.`);
      }

      if (option.verified) {
        safetyScore += 12;
        reasons.push('Property is verified.');
      }

      if (option.transportAvailability === 'HIGH') {
        safetyScore += 10;
        reasons.push('Reliable transport availability nearby.');
      } else if (option.transportAvailability === 'LOW') {
        safetyScore -= 10;
        reasons.push('Transport availability nearby is limited.');
      }

      const nearbyEssentials = [
        option.nearPharmacy,
        option.nearHospital,
        option.nearPoliceStation,
        option.convenience24x7
      ].filter(Boolean).length;

      safetyScore += nearbyEssentials * 4;
      reasons.push(
        nearbyEssentials > 0
          ? `Nearby essentials coverage is available for ${nearbyEssentials} key support points.`
          : 'Nearby essentials coverage is limited.'
      );

      return {
        ...option,
        safetyScore: Math.max(0, Math.min(100, safetyScore)),
        recommendation:
          safetyScore >= 80 ? 'Recommended' : safetyScore >= 60 ? 'Use caution' : 'Not recommended',
        reasons
      } satisfies RankedHotelOption;
    })
    .sort((left, right) => right.safetyScore - left.safetyScore);
}

export { ApiError };
