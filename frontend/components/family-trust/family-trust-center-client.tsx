'use client';

import { useEffect, useState } from 'react';

import { GuardiansCard } from '@/components/family-trust/guardians-card';
import { LatestTripStatusCard } from '@/components/family-trust/latest-trip-status-card';
import { ShareStatusCard } from '@/components/family-trust/share-status-card';
import { TimelinePreviewCard } from '@/components/family-trust/timeline-preview-card';
import { TrustLogCard } from '@/components/family-trust/trust-log-card';
import { TrustCenterError } from '@/components/family-trust/trust-center-error';
import { TrustCenterHeaderCard } from '@/components/family-trust/trust-center-header-card';
import { TrustCenterLoading } from '@/components/family-trust/trust-center-loading';
import { TrustCenterShell } from '@/components/family-trust/trust-center-shell';
import { getFamilyDashboardData, getTrustLog } from '@/lib/api';
import type { FamilyDashboardApiResponse, TrustLogEntryData } from '@/lib/types';

export function FamilyTrustCenterClient({
  tripId
}: {
  tripId: string;
}) {
  const [data, setData] = useState<FamilyDashboardApiResponse | null>(null);
  const [trustLog, setTrustLog] = useState<TrustLogEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [response, trustLogResponse] = await Promise.all([
          getFamilyDashboardData(tripId),
          getTrustLog(tripId)
        ]);

        if (!isActive) {
          return;
        }

        setData(response);
        setTrustLog(trustLogResponse);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load the Family Trust Center.'
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [reloadKey, tripId]);

  if (isLoading) {
    return <TrustCenterLoading />;
  }

  if (error || !data) {
    return (
      <TrustCenterError
        description={error ?? 'No family trust data is available for this trip.'}
        onRetry={() => {
          setData(null);
          setError(null);
          setIsLoading(true);
          setReloadKey((current) => current + 1);
        }}
      />
    );
  }

  return (
    <TrustCenterShell>
      <div className="space-y-6">
        <TrustCenterHeaderCard data={data} />

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <GuardiansCard guardians={data.guardians} />
          <div className="space-y-6">
            <ShareStatusCard data={data} />
            <LatestTripStatusCard latestEvent={data.latestEvent} />
          </div>
        </div>

        <TimelinePreviewCard timeline={data.timeline} />
        <TrustLogCard entries={trustLog} />
      </div>
    </TrustCenterShell>
  );
}
