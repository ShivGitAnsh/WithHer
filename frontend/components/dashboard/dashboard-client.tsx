'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { FloatingSosButton } from '@/components/dashboard/floating-sos-button';
import { ForHerToggle } from '@/components/dashboard/forher-toggle';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { AiSafetyBriefCard } from '@/components/dashboard/widgets/ai-safety-brief-card';
import { LiveStatusCard } from '@/components/dashboard/widgets/live-status-card';
import { MapCard } from '@/components/dashboard/widgets/map-card';
import { SafetyScoreCard } from '@/components/dashboard/widgets/safety-score-card';
import { SosCard } from '@/components/dashboard/widgets/sos-card';
import { TimelineCard } from '@/components/dashboard/widgets/timeline-card';
import { TripHeaderCard } from '@/components/dashboard/widgets/trip-header-card';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';
import { triggerSosAlert } from '@/lib/api';
import { generateSafetyBriefAction, refreshDashboardAction } from '@/lib/actions';
import type { DashboardPageData } from '@/lib/types';

export function DashboardClient({
  initialData
}: {
  initialData: DashboardPageData;
}) {
  const [data, setData] = useState(initialData);
  const [isForHerEnabled, setIsForHerEnabled] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [isGeneratingBrief, startBriefGeneration] = useTransition();
  const [isTriggeringSos, startSosTrigger] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const handleForHerError = useCallback(
    (description: string) => {
      toast({
        title: 'ForHer preference unavailable',
        description
      });
    },
    [toast]
  );

  const handleRefresh = () => {
    startRefresh(async () => {
      const nextData = await refreshDashboardAction(data.tripId);
      setData(nextData);
      toast({
        title: 'Dashboard refreshed',
        description: 'Latest trip updates are now visible.'
      });
    });
  };

  const handleGenerateBrief = () => {
    startBriefGeneration(async () => {
      try {
        const safetyBrief = await generateSafetyBriefAction(data.tripId);
        setData((current) => ({ ...current, safetyBrief }));
        toast({
          title: 'Safety brief updated',
          description: 'AI safety brief regenerated successfully.'
        });
      } catch (error) {
        toast({
          title: 'Unable to generate safety brief',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleSos = async () => {
    return new Promise<void>((resolve) => {
      startSosTrigger(async () => {
        try {
          const result = await triggerSosAlert(data.tripId);

          if (!result.duplicateSuppressed) {
            setData((current) => ({
              ...current,
              latestEvent: {
                id: result.event.id,
                tripId: result.event.tripId,
                eventType: result.event.eventType,
                title: result.event.title,
                description: result.event.description,
                occurredAt: result.event.occurredAt
              },
              timeline: [
                ...current.timeline,
                {
                  id: result.event.id,
                  tripId: result.event.tripId,
                  eventType: result.event.eventType,
                  title: result.event.title,
                  description: result.event.description,
                  occurredAt: result.event.occurredAt
                }
              ]
            }));
          }

          toast({
            title: result.duplicateSuppressed ? 'SOS already active' : 'SOS alert sent',
            description: result.duplicateSuppressed
              ? 'A recent SOS alert already exists for this trip, so a duplicate was avoided.'
              : 'Guardians have been notified immediately.',
            variant: 'destructive'
          });
          router.push(`/sos/${result.event.id}`);
        } catch (error) {
          toast({
            title: 'SOS alert failed',
            description: getApiErrorMessage(error, 'Unable to trigger the SOS alert right now.'),
            variant: 'destructive'
          });
        } finally {
          resolve();
        }
      });
    });
  };

  return (
    <DashboardShell
      forHerEnabled={isForHerEnabled}
      sidebar={
        <>
          <div className="hidden lg:block">
            <DashboardSidebar data={data} />
          </div>
          <div className="lg:hidden">
            <MobileSidebar>
              <DashboardSidebar data={data} compact />
            </MobileSidebar>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        <ForHerToggle
          userId={data.trip.userId}
          onChange={setIsForHerEnabled}
          onError={handleForHerError}
        />

        <TripHeaderCard
          data={data}
          isRefreshing={isRefreshing}
          isGeneratingBrief={isGeneratingBrief}
          onRefresh={handleRefresh}
          onGenerateBrief={handleGenerateBrief}
        />

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <MapCard data={data} />
          <div className="space-y-6">
            <LiveStatusCard data={data} />
            <SafetyScoreCard data={data} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AiSafetyBriefCard
            data={data}
            isGenerating={isGeneratingBrief}
            onGenerateBrief={handleGenerateBrief}
          />
          <SosCard
            onTriggerSos={handleSos}
            isLoading={isTriggeringSos}
          />
        </div>

        <TimelineCard data={data} />
      </div>
      <FloatingSosButton onTrigger={handleSos} isLoading={isTriggeringSos} />
    </DashboardShell>
  );
}
