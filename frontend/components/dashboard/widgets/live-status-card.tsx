import type { ComponentType } from 'react';
import { Activity, CheckCircle2, Clock3, Shield, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardPageData } from '@/lib/types';

export function LiveStatusCard({ data }: { data: DashboardPageData }) {
  const latest = data.latestEvent;
  const latestStatus =
    latest?.eventType === 'ARRIVED' || latest?.eventType === 'HOME_REACHED'
      ? 'success'
      : latest?.eventType === 'DELAYED'
        ? 'caution'
        : latest?.eventType === 'SOS_TRIGGERED'
          ? 'danger'
          : 'secondary';

  return (
    <Card className="card-surface">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-5 w-5 text-primary" />
          Latest Update
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest ? (
          <div className="soft-section p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="pill-label">Current pulse</p>
                <p className="mt-2 text-2xl font-semibold text-plumInk">
                  {latest.eventType}
                </p>
                <p className="mt-3 text-sm leading-7 text-cocoa">{latest.title}</p>
              </div>
              <Badge variant={latestStatus} className="rounded-full">
                {latest.eventType === 'DELAYED'
                  ? 'Caution'
                  : latest.eventType === 'SOS_TRIGGERED'
                    ? 'Emergency'
                    : 'Safe'}
              </Badge>
            </div>
            {latest.description ? (
              <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-muted-foreground">
                {latest.description}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="soft-section flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            No live event has been recorded yet. Updates will appear here as the trip progresses.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStatus icon={CheckCircle2} label="Check-ins" value="Auto-on" />
          <MiniStatus
            icon={Clock3}
            label="Last update"
            value={
              latest
                ? new Date(latest.occurredAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : 'Pending'
            }
          />
          <MiniStatus icon={Shield} label="Coverage" value="Shared" />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStatus({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/80 bg-white px-3 py-3">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        <span className="pill-label tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-plumInk">{value}</p>
    </div>
  );
}
