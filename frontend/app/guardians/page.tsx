import { DataStatePanel } from '@/components/sara/data-state-panel';
import { GuardiansPageClient } from '@/components/sara/guardians-page-client';
import {
  getConsents,
  getFamilyDashboardData,
  getGuardians,
  getTripsByUser,
  getUserProfile,
  selectPrimaryTrip,
  getTrustLog
} from '@/lib/api';
import { getConfiguredUserId } from '@/lib/runtime-config';

export default async function GuardiansPage() {
  const userId = getConfiguredUserId();

  if (!userId) {
    return (
      <DataStatePanel
        eyebrow="Setup required"
        title="Guardians needs a real user id"
        description="Set NEXT_PUBLIC_DEFAULT_USER_ID in frontend/.env.local to manage guardians and trip visibility using live backend data."
      />
    );
  }

  const [profile, guardians, trips] = await Promise.all([
    getUserProfile(userId),
    getGuardians(userId),
    getTripsByUser(userId)
  ]);
  const primaryTrip = selectPrimaryTrip(trips);
  const [trustData, consents, trustLog] = primaryTrip
    ? await Promise.all([
        getFamilyDashboardData(primaryTrip.id),
        getConsents({ tripId: primaryTrip.id }),
        getTrustLog(primaryTrip.id)
      ])
    : [null, [], []];

  return (
    <GuardiansPageClient
      userId={profile.id}
      trip={trustData?.trip ?? null}
      initialGuardians={guardians}
      initialConsents={consents}
      initialTrustLog={trustLog}
    />
  );
}
