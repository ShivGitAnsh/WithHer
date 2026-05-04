import { DataStatePanel } from '@/components/sara/data-state-panel';
import { ProfilePageClient } from '@/components/sara/profile-page-client';
import { getEmergencyContacts, getGuardians, getTripsByUser, getUserProfile } from '@/lib/api';
import { getConfiguredUserId } from '@/lib/runtime-config';

export default async function ProfilePage() {
  const userId = getConfiguredUserId();

  if (!userId) {
    return (
      <DataStatePanel
        eyebrow="Setup required"
        title="Profile needs a real user id"
        description="Set NEXT_PUBLIC_DEFAULT_USER_ID in frontend/.env.local to load profile, guardians, and emergency contacts from the database."
      />
    );
  }

  const [profile, guardians, emergencyContacts, trips] = await Promise.all([
    getUserProfile(userId),
    getGuardians(userId),
    getEmergencyContacts(userId),
    getTripsByUser(userId)
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
