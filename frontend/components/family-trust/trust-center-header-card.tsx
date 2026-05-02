import { CalendarDays, ShieldCheck, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { FamilyDashboardApiResponse } from '@/lib/types';

export function TrustCenterHeaderCard({
  data
}: {
  data: FamilyDashboardApiResponse;
}) {
  const start = data.trip.startDate
    ? new Date(data.trip.startDate).toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      })
    : null;
  const end = data.trip.endDate
    ? new Date(data.trip.endDate).toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <Card className="card-surface overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full">
                Family Trust Center
              </Badge>
              <Badge
                variant={data.trip.status === 'ACTIVE' ? 'success' : 'secondary'}
                className="rounded-full"
              >
                {data.trip.status}
              </Badge>
            </div>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-plumInk md:text-4xl">
                {data.trip.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-cocoa md:text-base">
                A single view for guardians to understand trip progress, visibility, and the
                latest reassurance signals.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoPill
              icon={CalendarDays}
              label="Trip Window"
              value={start && end ? `${start} - ${end}` : 'Dates unavailable'}
            />
            <InfoPill icon={Users} label="Visible To" value={`${data.guardians.length} guardians`} />
            <InfoPill
              icon={ShieldCheck}
              label="Latest Signal"
              value={data.latestEvent?.eventType ?? 'No update yet'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/80 bg-secondary/55 px-4 py-4">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        <span className="pill-label tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-plumInk">{value}</p>
    </div>
  );
}
