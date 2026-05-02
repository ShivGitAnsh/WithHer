import { GuardiansPageClient } from '@/components/sara/guardians-page-client';
import {
  getConsents,
  getDefaultDemoTripId,
  getFamilyDashboardData,
  getGuardians,
  getTrustLog
} from '@/lib/api';
import { saraUserProfile } from '@/lib/product-data';

export default async function GuardiansPage() {
  const tripId = getDefaultDemoTripId();
  const [trustData, guardians, consents, trustLog] = await Promise.all([
    getFamilyDashboardData(tripId),
    getGuardians(saraUserProfile.id),
    getConsents({ tripId }),
    getTrustLog(tripId)
  ]);

  return (
    <GuardiansPageClient
      userId={saraUserProfile.id}
      trip={trustData.trip}
      initialGuardians={guardians}
      initialConsents={consents}
      initialTrustLog={trustLog}
    />
  );
}
