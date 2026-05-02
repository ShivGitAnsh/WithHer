import { FamilyTrustCenterClient } from '@/components/family-trust/family-trust-center-client';
import { getDefaultDemoTripId } from '@/lib/api';

export default async function FamilyTrustPage({
  searchParams
}: {
  searchParams?: Promise<{ tripId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const tripId = params.tripId || getDefaultDemoTripId();

  return <FamilyTrustCenterClient tripId={tripId} />;
}
