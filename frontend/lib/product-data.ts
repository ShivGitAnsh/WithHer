import type { BadgeVariant } from '@/lib/types';

const now = new Date();
const day = 24 * 60 * 60 * 1000;

export const saraUserProfile = {
  id: 'demo-user-001',
  name: 'Sana Rao',
  role: 'Solo traveller and product design lead',
  email: 'sana.rao@example.com',
  city: 'Bengaluru, India',
  membership: 'SARA Plus'
};

export const saraGuardianProfiles = [
  {
    id: 'g-1',
    fullName: 'Asha Nair',
    relationship: 'Mother',
    phoneNumber: '+91 98123 45678',
    primary: true,
    description:
      'Receives live trip visibility, latest timeline updates, and immediate SOS alerts.'
  },
  {
    id: 'g-2',
    fullName: 'Rahul Menon',
    relationship: 'Brother',
    phoneNumber: '+91 99001 12233',
    primary: false,
    description:
      'Shares the trip dashboard link and acts as the second escalation contact.'
  }
];

export const saraEmergencyContacts = [
  {
    id: 'ec-1',
    userId: 'demo-user-001',
    fullName: 'Nikita Shah',
    relationship: 'Friend',
    phoneNumber: '+919845001122',
    isPrimary: true,
    notes: 'Lives nearby and can coordinate on-ground help quickly.'
  },
  {
    id: 'ec-2',
    userId: 'demo-user-001',
    fullName: 'Anand Rao',
    relationship: 'Father',
    phoneNumber: '+919811224466',
    isPrimary: false,
    notes: 'Backup escalation contact for late-night journeys.'
  }
] as const;

export const saraDemoConsents = [
  {
    id: 'consent-demo-1',
    userId: 'demo-user-001',
    guardianId: 'g-1',
    tripId: 'demo-trip-goa',
    status: 'ACTIVE',
    shareScopes: [
      'ITINERARY',
      'HOTEL_DETAILS',
      'FLIGHT_DETAILS',
      'CHECK_IN_UPDATES',
      'SOS_ALERTS',
      'EMERGENCY_CONTACTS'
    ],
    validFrom: new Date(now.getTime() - 2 * day).toISOString(),
    validUntil: new Date(now.getTime() + 5 * day).toISOString(),
    revokedAt: null,
    revokedReason: null,
    guardian: {
      id: 'g-1',
      fullName: 'Asha Nair',
      relationship: 'Mother',
      phoneNumber: '+919812345678',
      email: 'asha.nair@example.com'
    },
    guardianInvite: {
      id: 'invite-demo-1',
      token: 'demo-invite-accepted',
      status: 'ACCEPTED',
      expiresAt: new Date(now.getTime() + 5 * day).toISOString(),
      acceptedAt: new Date(now.getTime() - day).toISOString()
    },
    trip: {
      id: 'demo-trip-goa',
      title: 'Goa Coast Reset',
      destination: 'Goa',
      status: 'ACTIVE'
    }
  },
  {
    id: 'consent-demo-2',
    userId: 'demo-user-001',
    guardianId: 'g-2',
    tripId: 'demo-trip-goa',
    status: 'ACTIVE',
    shareScopes: ['CHECK_IN_UPDATES', 'SOS_ALERTS', 'ITINERARY'],
    validFrom: new Date(now.getTime() - day).toISOString(),
    validUntil: new Date(now.getTime() + 3 * day).toISOString(),
    revokedAt: null,
    revokedReason: null,
    guardian: {
      id: 'g-2',
      fullName: 'Rahul Menon',
      relationship: 'Brother',
      phoneNumber: '+919900112233',
      email: 'rahul.menon@example.com'
    },
    guardianInvite: {
      id: 'invite-demo-2',
      token: 'demo-invite-pending',
      status: 'PENDING',
      expiresAt: new Date(now.getTime() + 3 * day).toISOString(),
      acceptedAt: null
    },
    trip: {
      id: 'demo-trip-goa',
      title: 'Goa Coast Reset',
      destination: 'Goa',
      status: 'ACTIVE'
    }
  }
] as const;

export const saraTrustLogEntries = [
  {
    id: 'trust-log-1',
    consentId: 'consent-demo-1',
    tripId: 'demo-trip-goa',
    guardianId: 'g-1',
    actorType: 'TRAVELLER',
    action: 'CONSENT_CREATED',
    message: 'Trip visibility created for a guardian.',
    metadata: {
      shareScopes: ['ITINERARY', 'HOTEL_DETAILS', 'FLIGHT_DETAILS', 'CHECK_IN_UPDATES', 'SOS_ALERTS', 'EMERGENCY_CONTACTS']
    },
    createdAt: new Date(now.getTime() - 2 * day).toISOString(),
    guardian: {
      id: 'g-1',
      fullName: 'Asha Nair',
      relationship: 'Mother'
    }
  },
  {
    id: 'trust-log-2',
    consentId: 'consent-demo-1',
    tripId: 'demo-trip-goa',
    guardianId: 'g-1',
    actorType: 'SYSTEM',
    action: 'INVITE_CREATED',
    message: 'Guardian invite generated and awaiting acceptance.',
    metadata: {
      expiresAt: new Date(now.getTime() + 5 * day).toISOString()
    },
    createdAt: new Date(now.getTime() - 2 * day + 5 * 60 * 1000).toISOString(),
    guardian: {
      id: 'g-1',
      fullName: 'Asha Nair',
      relationship: 'Mother'
    }
  },
  {
    id: 'trust-log-3',
    consentId: 'consent-demo-1',
    tripId: 'demo-trip-goa',
    guardianId: 'g-1',
    actorType: 'GUARDIAN',
    action: 'INVITE_ACCEPTED',
    message: 'Guardian accepted the trip visibility invite.',
    metadata: null,
    createdAt: new Date(now.getTime() - day).toISOString(),
    guardian: {
      id: 'g-1',
      fullName: 'Asha Nair',
      relationship: 'Mother'
    }
  },
  {
    id: 'trust-log-4',
    consentId: 'consent-demo-2',
    tripId: 'demo-trip-goa',
    guardianId: 'g-2',
    actorType: 'TRAVELLER',
    action: 'CONSENT_CREATED',
    message: 'Trip visibility created for a guardian.',
    metadata: {
      shareScopes: ['CHECK_IN_UPDATES', 'SOS_ALERTS', 'ITINERARY']
    },
    createdAt: new Date(now.getTime() - day).toISOString(),
    guardian: {
      id: 'g-2',
      fullName: 'Rahul Menon',
      relationship: 'Brother'
    }
  },
  {
    id: 'trust-log-5',
    consentId: 'consent-demo-2',
    tripId: 'demo-trip-goa',
    guardianId: 'g-2',
    actorType: 'SYSTEM',
    action: 'INVITE_CREATED',
    message: 'Guardian invite generated and awaiting acceptance.',
    metadata: {
      expiresAt: new Date(now.getTime() + 3 * day).toISOString()
    },
    createdAt: new Date(now.getTime() - day + 5 * 60 * 1000).toISOString(),
    guardian: {
      id: 'g-2',
      fullName: 'Rahul Menon',
      relationship: 'Brother'
    }
  }
] as const;

export const saraTripCatalog = [
  {
    id: 'demo-trip-goa',
    title: 'Goa Coast Reset',
    destination: 'Goa',
    status: 'ACTIVE',
    description:
      'A four-day solo reset planned around daylight arrivals, easy transfers, and visible guardian check-ins.',
    startDate: new Date(now.getTime()).toISOString(),
    endDate: new Date(now.getTime() + 3 * day).toISOString(),
    dateLabel: 'May 12 - May 16',
    safetyTone: 'Shared with guardians',
    nextAction: 'Track arrival updates',
    shareState: '2 guardians linked',
    coverClass:
      'bg-[linear-gradient(135deg,#164e63_0%,#0f766e_48%,#f0fdfa_100%)]'
  },
  {
    id: 'demo-trip-udaipur',
    title: 'Udaipur Heritage Weekend',
    destination: 'Udaipur',
    status: 'PLANNED',
    description:
      'Hotel-led stay with airport pickup, quiet lakefront routes, and clear timeline checkpoints.',
    startDate: new Date(now.getTime() + 14 * day).toISOString(),
    endDate: new Date(now.getTime() + 17 * day).toISOString(),
    dateLabel: 'May 28 - Jun 1',
    safetyTone: 'Brief ready',
    nextAction: 'Share trip with family',
    shareState: 'Consent draft ready',
    coverClass:
      'bg-[linear-gradient(135deg,#1d4ed8_0%,#7c3aed_45%,#f5f3ff_100%)]'
  },
  {
    id: 'demo-trip-kasol',
    title: 'Kasol Mountain Pause',
    destination: 'Kasol',
    status: 'COMPLETED',
    description:
      'A completed hillside stay with tracked movement, calm family updates, and a successful home return.',
    startDate: new Date(now.getTime() - 12 * day).toISOString(),
    endDate: new Date(now.getTime() - 8 * day).toISOString(),
    dateLabel: 'Apr 18 - Apr 22',
    safetyTone: 'Completed safely',
    nextAction: 'Reuse as template',
    shareState: 'Archived visibility',
    coverClass:
      'bg-[linear-gradient(135deg,#334155_0%,#0f766e_48%,#ecfeff_100%)]'
  }
] as const;

export const exploreCollections = [
  {
    title: 'Coastal city breaks',
    description:
      'Short-haul routes with easier airport transfers, central stays, and familiar transport options.',
    badge: 'Popular',
    tags: ['Daylight arrivals', 'Central stay', 'Quick transfers'],
    visualClass: 'bg-[linear-gradient(135deg,#0f766e_0%,#06b6d4_55%,#e0f2fe_100%)]'
  },
  {
    title: 'Heritage weekends',
    description:
      'Slow, structured itineraries with well-reviewed stays and clear movement through compact city zones.',
    badge: 'Balanced',
    tags: ['Hotel support', 'Walkable zones', 'Trusted reviews'],
    visualClass: 'bg-[linear-gradient(135deg,#1d4ed8_0%,#8b5cf6_50%,#ede9fe_100%)]'
  },
  {
    title: 'Hill retreats',
    description:
      'Rest-led journeys where timing, arrival windows, and route visibility matter more than volume.',
    badge: 'Calm',
    tags: ['Early arrivals', 'Route clarity', 'Lower night movement'],
    visualClass: 'bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_48%,#ecfeff_100%)]'
  }
];

export const recommendedTrips: Array<{
  id: string;
  title: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  summary: string;
}> = [
  {
    id: 'demo-trip-goa',
    title: 'Goa Coast Reset',
    badgeLabel: 'Live trip',
    badgeVariant: 'success',
    summary:
      'Guardian-linked arrival flow with an active safety score and travel updates already in motion.'
  },
  {
    id: 'demo-trip-udaipur',
    title: 'Udaipur Heritage Weekend',
    badgeLabel: 'Planned',
    badgeVariant: 'secondary',
    summary:
      'A clean, trust-first itinerary setup with room to add trip sharing and a SARA brief before departure.'
  },
  {
    id: 'demo-trip-kasol',
    title: 'Kasol Mountain Pause',
    badgeLabel: 'Template',
    badgeVariant: 'outline',
    summary:
      'A previously completed solo trip that can be reused as a starting structure for similar travel.'
  }
];

export const demoFlightOptions = [
  {
    id: 'flt-goa-day',
    airline: 'IndiGo',
    departureAt: '2026-05-12T09:10:00+05:30',
    arrivalAt: '2026-05-12T11:20:00+05:30',
    origin: 'BLR',
    destination: 'GOI',
    stops: 0,
    price: 6200
  },
  {
    id: 'flt-goa-evening',
    airline: 'Air India Express',
    departureAt: '2026-05-12T18:35:00+05:30',
    arrivalAt: '2026-05-12T22:45:00+05:30',
    origin: 'BLR',
    destination: 'GOI',
    stops: 1,
    price: 5400
  },
  {
    id: 'flt-goa-late',
    airline: 'SpiceJet',
    departureAt: '2026-05-12T21:40:00+05:30',
    arrivalAt: '2026-05-13T01:05:00+05:30',
    origin: 'BLR',
    destination: 'GOI',
    stops: 1,
    price: 5100
  }
] as const;

export const demoHotelOptions = [
  {
    id: 'htl-panaji',
    name: 'Harbour House Panaji',
    neighborhood: 'Fontainhas',
    womenReviewScore: 4.7,
    verified: true,
    transportAvailability: 'HIGH' as const,
    nearPharmacy: true,
    nearHospital: true,
    nearPoliceStation: true,
    convenience24x7: true
  },
  {
    id: 'htl-calangute',
    name: 'Calangute Palm Stay',
    neighborhood: 'Calangute',
    womenReviewScore: 4.1,
    verified: true,
    transportAvailability: 'MEDIUM' as const,
    nearPharmacy: true,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: true
  },
  {
    id: 'htl-outskirts',
    name: 'Cliffline Quiet Retreat',
    neighborhood: 'North Goa outskirts',
    womenReviewScore: 3.6,
    verified: false,
    transportAvailability: 'LOW' as const,
    nearPharmacy: false,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: false
  }
] as const;

export const saraHotelListings = [
  {
    id: 'htl-panaji',
    name: 'Harbour House Panaji',
    city: 'Goa',
    neighborhood: 'Fontainhas',
    summary:
      'A central heritage stay that works well for short walking plans, early dinners, and clear transfer logistics.',
    coverClass:
      'bg-[linear-gradient(135deg,#0f766e_0%,#155e75_45%,#f0fdfa_100%)]',
    womenReviewHighlights: [
      'Guests say the lane feels active without becoming chaotic in the evening.',
      'Hotel staff are frequently praised for helping arrange verified cabs and airport pickup.',
      'Solo travellers describe it as easy to navigate for compact city plans.'
    ],
    transferGuidance:
      'Use hotel-arranged pickup or a verified app cab and keep first-night movement within Panaji centre.',
    nearbyEssentials: [
      'Pharmacy nearby',
      'Hospital nearby',
      'Police support nearby',
      '24x7 convenience nearby'
    ],
    womenReviewScore: 4.7,
    verified: true,
    transportAvailability: 'HIGH' as const,
    nearPharmacy: true,
    nearHospital: true,
    nearPoliceStation: true,
    convenience24x7: true
  },
  {
    id: 'htl-calangute',
    name: 'Calangute Palm Stay',
    city: 'Goa',
    neighborhood: 'Calangute',
    summary:
      'A busier beach-area stay that works best when movement stays structured and return legs are planned early.',
    coverClass:
      'bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_45%,#eff6ff_100%)]',
    womenReviewHighlights: [
      'Travellers liked the convenience of the main road and nearby activity options.',
      'The area can feel crowded later at night, so early return plans work better.'
    ],
    transferGuidance:
      'Book direct pickup and avoid leaving late-evening return decisions to on-street availability.',
    nearbyEssentials: ['Pharmacy nearby', '24x7 convenience nearby'],
    womenReviewScore: 4.1,
    verified: true,
    transportAvailability: 'MEDIUM' as const,
    nearPharmacy: true,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: true
  },
  {
    id: 'htl-outskirts',
    name: 'Cliffline Quiet Retreat',
    city: 'Goa',
    neighborhood: 'North Goa outskirts',
    summary:
      'A remote, scenic stay that needs stricter planning because transport flexibility and support points are limited.',
    coverClass:
      'bg-[linear-gradient(135deg,#334155_0%,#475569_48%,#f8fafc_100%)]',
    womenReviewHighlights: [
      'Travellers liked the quiet setting but repeatedly noted that the area feels isolated after sunset.',
      'Transport availability usually needs advance planning rather than last-minute booking.'
    ],
    transferGuidance:
      'Only choose this if every airport, dinner, and return transfer is pre-booked in advance.',
    nearbyEssentials: [],
    womenReviewScore: 3.6,
    verified: false,
    transportAvailability: 'LOW' as const,
    nearPharmacy: false,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: false
  }
] as const;

export const saraDemoMatchCandidates = {
  'demo-trip-goa': [
    {
      matchId: 'demo-match-1',
      profileId: 'demo-profile-1',
      tripId: 'demo-trip-goa-candidate-1',
      displayName: 'Mira Khanna',
      city: 'Mumbai',
      travelStyle: 'Slow travel',
      hotelPreference: 'Panaji centre',
      interests: ['cafes', 'heritage walks', 'sunset spots'],
      destination: 'Goa',
      tripTitle: 'Goa Heritage Escape',
      overlapDays: 2,
      compatibilityScore: 86,
      reasons: [
        '2 day overlap in Goa.',
        'Similar travel style.',
        'Shared interests: cafes, heritage walks.'
      ],
      connectionStatus: 'AVAILABLE'
    },
    {
      matchId: 'demo-match-2',
      profileId: 'demo-profile-2',
      tripId: 'demo-trip-goa-candidate-2',
      displayName: 'Rhea Das',
      city: 'Pune',
      travelStyle: 'Structured weekends',
      hotelPreference: 'North Goa',
      interests: ['beaches', 'food trails'],
      destination: 'Goa',
      tripTitle: 'Goa Weekend Reset',
      overlapDays: 1,
      compatibilityScore: 72,
      reasons: ['1 day overlap in Goa.', 'Hotel area preference lines up.'],
      connectionStatus: 'AVAILABLE'
    }
  ],
  'demo-trip-udaipur': [
    {
      matchId: 'demo-match-3',
      profileId: 'demo-profile-3',
      tripId: 'demo-trip-udaipur-candidate-1',
      displayName: 'Anika Verma',
      city: 'Delhi',
      travelStyle: 'Calm city breaks',
      hotelPreference: 'Lake Pichola side',
      interests: ['museums', 'cafes'],
      destination: 'Udaipur',
      tripTitle: 'Udaipur Long Weekend',
      overlapDays: 2,
      compatibilityScore: 81,
      reasons: ['2 day overlap in Udaipur.', 'Similar travel style.'],
      connectionStatus: 'AVAILABLE'
    }
  ]
} as const;
