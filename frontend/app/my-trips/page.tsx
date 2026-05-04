import { DataStatePanel } from '@/components/sara/data-state-panel';
import { MyTripsPageClient } from '@/components/sara/my-trips-page-client';
import { getTripsByUser } from '@/lib/api';
import { getConfiguredUserId } from '@/lib/runtime-config';

export default async function MyTripsPage() {
  const userId = getConfiguredUserId();

  if (!userId) {
    return (
      <DataStatePanel
        eyebrow="Setup required"
        title="No traveller account configured"
        description="Set NEXT_PUBLIC_DEFAULT_USER_ID in frontend/.env.local so My Trips can load from the real database."
      />
    );
  }

  const trips = await getTripsByUser(userId);

  return <MyTripsPageClient userId={userId} initialTrips={trips} />;
}
