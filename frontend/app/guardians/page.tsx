import { GuardiansPageClient } from '@/components/sara/guardians-page-client';
import {
  getConsents,
  getFamilyDashboardData,
  getGuardians,
  getTrustLog,
  getUiTestingContext
} from '@/lib/api';

export default async function GuardiansPage() {
  const { profile, primaryTripId } = await getUiTestingContext();
  const [trustData, guardians, consents, trustLog] = await Promise.all([
    getFamilyDashboardData(primaryTripId),
    getGuardians(profile.id),
    getConsents({ tripId: primaryTripId }),
    getTrustLog(primaryTripId)
  ]);

  return (
    <GuardiansPageClient
      userId={profile.id}
      trip={trustData.trip}
      initialGuardians={guardians}
      initialConsents={consents}
      initialTrustLog={trustLog}
    />
  );
}
