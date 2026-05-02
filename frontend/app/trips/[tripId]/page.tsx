import { notFound } from 'next/navigation';

import { TripDetailClient } from '@/components/sara/trip-detail-client';
import {
  getCheckInRules,
  getDashboardPageData,
  getEmergencyContacts,
  getMatchingCandidates,
  getMatchingProfile
} from '@/lib/api';

export default async function TripDetailPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const data = await getDashboardPageData(tripId);
  const [emergencyContacts, checkInRules, matchingProfile, matchingCandidates] = await Promise.all([
    getEmergencyContacts(data.trip.userId ?? 'demo-user-001'),
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
