import { notFound } from 'next/navigation';

import { TripDetailClient } from '@/components/sara/trip-detail-client';
import {
  getCheckInRules,
  getDashboardPageData,
  getEmergencyContacts,
  getMatchingCandidates,
  getMatchingProfile,
  getPreferredUserId
} from '@/lib/api';

export default async function TripDetailPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const data = await getDashboardPageData(tripId);
  const fallbackUserId =
    data.trip.userId && !data.trip.userId.startsWith('demo-')
      ? data.trip.userId
      : await getPreferredUserId();
  const [emergencyContacts, checkInRules, matchingProfile, matchingCandidates] = await Promise.all([
    getEmergencyContacts(fallbackUserId),
    getCheckInRules(tripId),
    getMatchingProfile(tripId),
    getMatchingCandidates(tripId)
  ]);

  if (!data) {
    notFound();
  }

  return (
    <TripDetailClient
      initialData={data}
      emergencyContacts={emergencyContacts}
      initialCheckInRules={checkInRules}
      initialMatchingProfile={matchingProfile}
      initialMatchingCandidates={matchingCandidates}
    />
  );
}
