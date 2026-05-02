export type TripStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TripSummary {
  id: string;
  title: string;
  destination: string;
  status: TripStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UiTestingContextData {
  profile: {
    id: string;
    name: string;
    role: string;
    email: string;
    city: string;
    membership: string;
  };
  trips: TripSummary[];
  primaryTripId: string;
  source: 'api' | 'demo';
}

export interface TripEvent {
  id: string;
  tripId: string;
  eventType: string;
  title: string;
  description?: string | null;
  occurredAt: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  relationship: string;
  phoneNumber?: string | null;
  email?: string | null;
}

export type ShareScope =
  | 'ITINERARY'
  | 'HOTEL_DETAILS'
  | 'FLIGHT_DETAILS'
  | 'LIVE_LOCATION'
  | 'CHECK_IN_UPDATES'
  | 'EMERGENCY_CONTACTS'
  | 'SOS_ALERTS';

export interface ConsentData {
  id: string;
  userId: string;
  guardianId: string;
  tripId: string | null;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  shareScopes: ShareScope[];
  validFrom: string;
  validUntil: string;
  revokedAt?: string | null;
  revokedReason?: string | null;
  guardian: Guardian;
  guardianInvite?: {
    id: string;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    expiresAt: string;
    acceptedAt?: string | null;
  } | null;
  trip: TripSummary | null;
}

export interface TrustLogEntryData {
  id: string;
  consentId: string;
  tripId: string | null;
  guardianId: string | null;
  actorType: 'TRAVELLER' | 'GUARDIAN' | 'SYSTEM';
  action:
    | 'CONSENT_CREATED'
    | 'INVITE_CREATED'
    | 'INVITE_ACCEPTED'
    | 'INVITE_EXPIRED'
    | 'CONSENT_REVOKED';
  message: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  guardian: {
    id: string;
    fullName: string;
    relationship: string;
  } | null;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
  notes?: string | null;
}

export interface SafetyBriefData {
  brief: string;
  fallbackUsed: boolean;
}

export interface SafetyScoreData {
  score: number;
  status: 'Safe' | 'Moderate' | 'Risky';
  reasons: string[];
  fallbackUsed?: boolean;
}

export interface ItineraryPlanItem {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  safetyNote: string;
}

export interface ItineraryPlanDay {
  dayNumber: number;
  title: string;
  focus: string;
  items: ItineraryPlanItem[];
}

export interface ItineraryPlanData {
  id: string;
  tripId?: string | null;
  destination: string;
  numberOfDays: number;
  travelersCount: number;
  title: string;
  overview: string;
  rationale: string[];
  days: ItineraryPlanDay[];
  fallbackUsed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'caution'
  | 'danger';

export interface DashboardPageData {
  tripId: string;
  trip: TripSummary;
  latestEvent: TripEvent | null;
  timeline: TripEvent[];
  guardians: Guardian[];
  safetyBrief: SafetyBriefData;
  safetyScore: SafetyScoreData;
  itineraryPlan: ItineraryPlanData | null;
  source: 'api' | 'demo';
}

export interface ForHerPreferenceData {
  userId: string;
  enabled: boolean;
}

export interface CreateGuardianInput {
  userId: string;
  fullName: string;
  relationship: string;
  phoneNumber?: string;
  email?: string;
}

export interface CreateEmergencyContactInput {
  userId: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface CreateConsentInput {
  tripId: string;
  guardianId: string;
  shareScopes: ShareScope[];
  validUntil: string;
}

export interface SosTriggerData {
  event: {
    id: string;
    tripId: string;
    eventType: string;
    title: string;
    description?: string | null;
    occurredAt: string;
    createdAt: string;
  };
  duplicateSuppressed: boolean;
}

export interface FamilyDashboardApiResponse {
  trip: TripSummary;
  latestEvent: TripEvent | null;
  timeline: TripEvent[];
  guardians: Guardian[];
}

export interface SosCaseData {
  caseId: string;
  trip: TripSummary;
  sosEvent: SosTriggerData['event'];
  latestEventBeforeSos: TripEvent | null;
  guardians: Guardian[];
  emergencyContacts: EmergencyContact[];
  localSupport: {
    destinationLabel: string;
    helplines: Array<{
      label: string;
      phoneNumber: string;
      category: 'Police' | 'Women Helpline' | 'Medical' | 'Tourist Support';
      availability: string;
    }>;
    staySupport: {
      propertyName: string;
      frontDeskPhone: string;
      supportDeskLabel: string;
      supportDeskPhone?: string | null;
      addressHint: string;
      transferNote: string;
    };
  };
  escalationSteps: Array<{
    step: number;
    label: string;
    channel: 'WhatsApp' | 'Phone' | 'Front Desk' | 'Emergency Helpline';
    status: 'sent' | 'ready';
    description: string;
    contactName?: string | null;
    contactPhone?: string | null;
  }>;
  shareBundle: {
    headline: string;
    summary: string;
    latestStatus: string;
    triggeredAt: string;
    guardianMessage: string;
    actionChecklist: string[];
  };
}

export interface CheckInRuleData {
  id: string;
  tripId: string;
  title: string;
  expectedEventType: string;
  expectedAt: string;
  graceMinutes: number;
  status: 'PENDING' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED';
  lastEvaluatedAt?: string | null;
  escalatedAt?: string | null;
  completedAt?: string | null;
  completedEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckInRuleInput {
  tripId: string;
  title: string;
  expectedEventType: string;
  expectedAt: string;
  graceMinutes: number;
}

export interface CheckInEvaluationData {
  rule: CheckInRuleData;
  completed: boolean;
  escalated: boolean;
  matchedEvent: TripEvent | null;
}

export interface MatchingProfileData {
  id: string;
  tripId: string;
  userId: string;
  displayName: string;
  city?: string | null;
  travelStyle?: string | null;
  hotelPreference?: string | null;
  interests: string[];
  status: 'ACTIVE' | 'PAUSED';
}

export interface MatchingCandidateData {
  matchId: string;
  profileId: string;
  tripId: string;
  displayName: string;
  city?: string | null;
  travelStyle?: string | null;
  hotelPreference?: string | null;
  interests: string[];
  destination: string;
  tripTitle: string;
  overlapDays: number;
  compatibilityScore: number;
  reasons: string[];
  connectionStatus: 'PENDING' | 'CONNECTED' | 'DECLINED' | 'AVAILABLE';
}

export interface MatchingConnectData {
  connection: {
    id: string;
    sourceProfileId: string;
    targetProfileId: string;
    status: 'PENDING' | 'CONNECTED' | 'DECLINED';
    createdAt: string;
    updatedAt: string;
  };
  sourceProfileId: string;
  targetProfileId: string;
}

export interface GuardianInviteData {
  id: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  acceptedAt?: string | null;
  guardian: {
    id: string;
    fullName: string;
    relationship: string;
    email?: string | null;
    phoneNumber?: string | null;
  };
  trip: {
    id: string;
    title: string;
    destination: string;
    status: TripStatus;
    startDate: string;
    endDate: string;
  };
  consent: {
    id: string;
    status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
    shareScopes: ShareScope[];
    validUntil: string;
  };
}

export interface FlightRankingOption {
  id: string;
  airline: string;
  departureAt: string;
  arrivalAt: string;
  origin: string;
  destination: string;
  stops: number;
  price?: number;
}

export interface RankedFlightOption extends FlightRankingOption {
  safetyScore: number;
  recommendation: 'Recommended' | 'Late arrival, use caution' | 'Not recommended for solo arrival';
  reasons: string[];
  saferTransferHint: string;
}

export interface HotelRankingOption {
  id: string;
  name: string;
  neighborhood: string;
  womenReviewScore?: number;
  verified?: boolean;
  transportAvailability?: 'LOW' | 'MEDIUM' | 'HIGH';
  nearPharmacy?: boolean;
  nearHospital?: boolean;
  nearPoliceStation?: boolean;
  convenience24x7?: boolean;
}

export interface RankedHotelOption extends HotelRankingOption {
  safetyScore: number;
  recommendation: 'Recommended' | 'Use caution' | 'Not recommended';
  reasons: string[];
}

export interface ListingDetail {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  summary: string;
  coverClass: string;
  womenReviewHighlights: string[];
  transferGuidance: string;
  nearbyEssentials: string[];
  womenReviewScore?: number;
  verified?: boolean;
  transportAvailability?: 'LOW' | 'MEDIUM' | 'HIGH';
  nearPharmacy?: boolean;
  nearHospital?: boolean;
  nearPoliceStation?: boolean;
  convenience24x7?: boolean;
}

export interface ListingSafetyData {
  listingId: string;
  name: string;
  neighborhood: string;
  city: string;
  score: number;
  status: 'Safe' | 'Moderate' | 'Risky';
  recommendation: 'Recommended' | 'Use caution' | 'Not recommended';
  reasons: string[];
  womenReviewHighlights: string[];
  nearbyEssentials: string[];
  transferGuidance: string;
}
