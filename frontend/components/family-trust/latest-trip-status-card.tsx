import { Activity, CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripEvent } from '@/lib/types';

export function LatestTripStatusCard({
  latestEvent
}: {
  latestEvent: TripEvent | null;
}) {
  const statusVariant =
    latestEvent?.eventType === 'DELAYED'
      ? 'caution'
      : latestEvent?.eventType === 'SOS_TRIGGERED'
        ? 'danger'
        : 'success';

  return (
    <Card className="card-surface">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-5 w-5 text-primary" />
          Latest Trip Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestEvent ? (
          <div className="rounded-[1.5rem] border border-border/80 bg-white/92 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="pill-label">Most recent event</p>
                <p className="mt-2 text-2xl font-semibold text-plumInk">
                  {latestEvent.eventType}
                </p>
              </div>
              <Badge variant={statusVariant} className="rounded-full">
                {latestEvent.eventType === 'DELAYED'
                  ? 'Caution'
                  : latestEvent.eventType === 'SOS_TRIGGERED'
                    ? 'Emergency'
                    : 'Safe'}
              </Badge>
            </div>

            <p className="mt-4 text-sm font-medium text-cocoa">{latestEvent.title}</p>
            {latestEvent.description ? (
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {latestEvent.description}
              </p>
            ) : null}
            <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Updated{' '}
              {new Date(latestEvent.occurredAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-dashed border-border bg-secondary/35 px-5 py-6 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            No trip status has been shared yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
