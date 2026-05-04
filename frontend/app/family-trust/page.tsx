import { FamilyTrustCenterClient } from '@/components/family-trust/family-trust-center-client';
import { DataStatePanel } from '@/components/sara/data-state-panel';
import { getTripsByUser, selectPrimaryTrip } from '@/lib/api';
import { getConfiguredUserId } from '@/lib/runtime-config';

export default async function FamilyTrustPage({
  searchParams
}: {
  searchParams?: Promise<{ tripId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const userId = getConfiguredUserId();

  if (!userId) {
    return (
      <DataStatePanel
        eyebrow="Setup required"
        title="Family Trust Center needs a configured user"
        description="Set NEXT_PUBLIC_DEFAULT_USER_ID in frontend/.env.local so mySaathi can resolve a real trip and guardian trust state."
      />
    );
  }

  const trips = await getTripsByUser(userId);
  const primaryTrip = selectPrimaryTrip(trips);
  const tripId = params.tripId || primaryTrip?.id;

  if (!tripId) {
    return (
      <DataStatePanel
        eyebrow="No live trip"
        title="No trip is available for guardian visibility yet"
        description="Create a trip and share it with a guardian to activate the Family Trust Center."
      />
    );
  }

  return <FamilyTrustCenterClient tripId={tripId} />;
}
