import { FamilyTrustCenterClient } from '@/components/family-trust/family-trust-center-client';
import { getUiTestingContext } from '@/lib/api';

export default async function FamilyTrustPage({
  searchParams
}: {
  searchParams?: Promise<{ tripId?: string }>;
}) {
  const params = (await searchParams) ?? {};

  let tripId = params.tripId;

  if (!tripId) {
    const { primaryTripId } = await getUiTestingContext();
    tripId = primaryTripId;
  }

  return <FamilyTrustCenterClient tripId={tripId} />;
}
