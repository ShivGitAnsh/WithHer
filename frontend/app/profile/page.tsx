import { ProfilePageClient } from '@/components/sara/profile-page-client';
import { getEmergencyContacts, getGuardians, getUiTestingContext } from '@/lib/api';

export default async function ProfilePage() {
  const { profile, trips } = await getUiTestingContext();
  const [guardians, emergencyContacts] = await Promise.all([
    getGuardians(profile.id),
    getEmergencyContacts(profile.id)
  ]);

  return (
    <ProfilePageClient
      profile={profile}
      guardians={guardians}
      initialEmergencyContacts={emergencyContacts}
      tripCount={trips.length}
      activeJourneyCount={trips.filter((trip) => trip.status === 'ACTIVE').length}
    />
  );
}
