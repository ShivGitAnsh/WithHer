import { ApiError } from '@/lib/api-error';
import type {
  CheckInEvaluationData,
  CheckInRuleData,
  ConsentData,
  CreateTripEventInput,
  CreateTripInput,
  CreateCheckInRuleInput,
  CreateConsentInput,
  CreateEmergencyContactInput,
  CreateGuardianInput,
  DashboardPageData,
  EmergencyContact,
  FamilyDashboardApiResponse,
  ForHerPreferenceData,
  Guardian,
  GuardianInviteData,
  ItineraryPlanData,
  ListingSafetyData,
  MatchingCandidateData,
  MatchingConnectData,
  MatchingProfileData,
  FlightRankingOption,
  RankedFlightOption,
  HotelRankingOption,
  RankedHotelOption,
  SafetyBriefData,
  SafetyScoreData,
  SosCaseData,
  SosTriggerData,
  TripEvent,
  TripSummary,
  TrustLogEntryData,
  UserProfileData
} from '@/lib/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

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

export function selectPrimaryTrip(trips: TripSummary[]): TripSummary | null {
  if (trips.length === 0) {
    return null;
  }

  const byPriority = ['ACTIVE', 'PLANNED', 'COMPLETED', 'CANCELLED'] as const;

  return (
    [...trips].sort((left, right) => {
      const statusRank =
        byPriority.indexOf(left.status) - byPriority.indexOf(right.status);

      if (statusRank !== 0) {
        return statusRank;
      }

      const leftDate = new Date(left.startDate ?? 0).getTime();
      const rightDate = new Date(right.startDate ?? 0).getTime();

      return rightDate - leftDate;
    })[0] ?? null
  );
}

export async function getUserProfile(userId: string): Promise<UserProfileData> {
  return fetchJson<UserProfileData>(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`);
}

export async function getTripsByUser(userId: string): Promise<TripSummary[]> {
  return fetchJson<TripSummary[]>(
    `${API_BASE_URL}/trips?userId=${encodeURIComponent(userId)}`
  );
}

export async function createTrip(input: CreateTripInput): Promise<TripSummary> {
  return fetchJson<TripSummary>(`${API_BASE_URL}/trips`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getDashboardPageData(tripId: string): Promise<DashboardPageData> {
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
}

export async function getFamilyDashboardData(
  tripId: string
): Promise<FamilyDashboardApiResponse> {
  return fetchJson<FamilyDashboardApiResponse>(
    `${API_BASE_URL}/trips/${tripId}/family-dashboard`
  );
}

export async function refreshDashboardData(tripId: string) {
  return getDashboardPageData(tripId);
}

export async function regenerateSafetyBrief(tripId: string): Promise<SafetyBriefData> {
  return fetchJson<SafetyBriefData>(`${API_BASE_URL}/trips/${tripId}/safety-brief`, {
    method: 'POST'
  });
}

export async function createTripEvent(
  tripId: string,
  input: CreateTripEventInput
): Promise<TripEvent> {
  return fetchJson<TripEvent>(`${API_BASE_URL}/trips/${encodeURIComponent(tripId)}/events`, {
    method: 'POST',
    body: JSON.stringify({
      eventType: input.eventType,
      title: input.title,
      description: input.description || undefined,
      occurredAt: input.occurredAt || undefined
    })
  });
}

export async function getLatestItineraryForTrip(
  tripId: string
): Promise<ItineraryPlanData | null> {
  return fetchJsonAllowNull<ItineraryPlanData>(
    `${API_BASE_URL}/forher/itineraries?tripId=${encodeURIComponent(tripId)}`
  );
}

export async function generateItineraryPlan(input: {
  tripId?: string;
  destination?: string;
  numberOfDays: number;
  travelersCount?: number;
}): Promise<ItineraryPlanData> {
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
  return fetchJson<ForHerPreferenceData>(
    `${API_BASE_URL}/forher/preferences?userId=${encodeURIComponent(userId)}`
  );
}

export async function updateForHerPreference(
  userId: string,
  enabled: boolean
): Promise<ForHerPreferenceData> {
  return fetchJson<ForHerPreferenceData>(`${API_BASE_URL}/forher/preferences`, {
    method: 'PUT',
    body: JSON.stringify({
      userId,
      enabled
    })
  });
}

export async function triggerSosAlert(tripId: string): Promise<SosTriggerData> {
  return fetchJson<SosTriggerData>(`${API_BASE_URL}/forher/sos/trigger`, {
    method: 'POST',
    body: JSON.stringify({
      tripId
    })
  });
}

export async function getSosCase(caseId: string): Promise<SosCaseData> {
  return fetchJson<SosCaseData>(`${API_BASE_URL}/forher/sos/${caseId}`);
}

export async function getGuardianInvite(token: string): Promise<GuardianInviteData> {
  return fetchJson<GuardianInviteData>(
    `${API_BASE_URL}/forher/guardian-invites/${encodeURIComponent(token)}`
  );
}

export async function acceptGuardianInvite(token: string): Promise<GuardianInviteData> {
  return fetchJson<GuardianInviteData>(
    `${API_BASE_URL}/forher/guardian-invites/${encodeURIComponent(token)}/accept`,
    {
      method: 'POST'
    }
  );
}

export async function getCheckInRules(tripId: string): Promise<CheckInRuleData[]> {
  return fetchJson<CheckInRuleData[]>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/check-in-rules`
  );
}

export async function createCheckInRule(
  input: CreateCheckInRuleInput
): Promise<CheckInRuleData> {
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
  return fetchJsonAllowNull<MatchingProfileData>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/matching/profile`
  );
}

export async function getMatchingCandidates(
  tripId: string
): Promise<MatchingCandidateData[]> {
  return fetchJson<MatchingCandidateData[]>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/matching/candidates`
  );
}

export async function connectMatch(input: {
  tripId: string;
  matchId: string;
}): Promise<MatchingConnectData> {
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
  return fetchJson<Guardian[]>(
    `${API_BASE_URL}/forher/guardians?userId=${encodeURIComponent(userId)}`
  );
}

export async function createGuardian(input: CreateGuardianInput): Promise<Guardian> {
  return fetchJson<Guardian>(`${API_BASE_URL}/forher/guardians`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  return fetchJson<EmergencyContact[]>(
    `${API_BASE_URL}/forher/emergency-contacts?userId=${encodeURIComponent(userId)}`
  );
}

export async function createEmergencyContact(
  input: CreateEmergencyContactInput
): Promise<EmergencyContact> {
  return fetchJson<EmergencyContact>(`${API_BASE_URL}/forher/emergency-contacts`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
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
  return fetchJson<TrustLogEntryData[]>(
    `${API_BASE_URL}/forher/trips/${encodeURIComponent(tripId)}/trust-log`
  );
}

export async function createConsent(input: CreateConsentInput): Promise<ConsentData> {
  return fetchJson<ConsentData>(`${API_BASE_URL}/forher/consents`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function revokeConsent(
  consentId: string,
  reason?: string
): Promise<ConsentData> {
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

export async function getListingSafetyScore(
  listingId: string
): Promise<ListingSafetyData | null> {
  return fetchJsonAllowNull<ListingSafetyData>(
    `${API_BASE_URL}/forher/listings/${encodeURIComponent(listingId)}/safety-score`
  );
}

export async function rankFlightOptions(
  options: FlightRankingOption[]
): Promise<RankedFlightOption[]> {
  return fetchJson<RankedFlightOption[]>(`${API_BASE_URL}/forher/flight-options/rank`, {
    method: 'POST',
    body: JSON.stringify({ options })
  });
}

export async function rankHotelOptions(
  options: HotelRankingOption[]
): Promise<RankedHotelOption[]> {
  return fetchJson<RankedHotelOption[]>(`${API_BASE_URL}/forher/hotel-options/rank`, {
    method: 'POST',
    body: JSON.stringify({ options })
  });
}

export { ApiError };
