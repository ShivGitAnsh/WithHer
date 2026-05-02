import { ProfilePageClient } from '@/components/sara/profile-page-client';
import { getEmergencyContacts, getGuardians } from '@/lib/api';
import { saraTripCatalog, saraUserProfile } from '@/lib/product-data';

export default async function ProfilePage() {
  const [guardians, emergencyContacts] = await Promise.all([
    getGuardians(saraUserProfile.id),
    getEmergencyContacts(saraUserProfile.id)
  ]);

  return (
    <ProfilePageClient
      profile={saraUserProfile}
      guardians={guardians}
      initialEmergencyContacts={emergencyContacts}
      tripCount={saraTripCatalog.length}
      activeJourneyCount={saraTripCatalog.filter((trip) => trip.status === 'ACTIVE').length}
    />
  );
}
