import { Eye, Share2, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FamilyDashboardApiResponse } from '@/lib/types';

export function ShareStatusCard({
  data
}: {
  data: FamilyDashboardApiResponse;
}) {
  const isShared = data.guardians.length > 0;
  const latestUpdateLabel = data.latestEvent
    ? new Date(data.latestEvent.occurredAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Awaiting first update';

  return (
    <Card className="card-surface">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Share2 className="h-5 w-5 text-primary" />
          Share Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="soft-section p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="pill-label">Visibility</p>
              <p className="mt-2 text-xl font-semibold text-plumInk">
                {isShared ? 'Shared with trusted circle' : 'Not shared'}
              </p>
            </div>
            <Badge variant={isShared ? 'success' : 'outline'} className="rounded-full">
              {isShared ? 'Visible' : 'Private'}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-7 text-cocoa">
            {isShared
              ? `${data.guardians.length} guardian${data.guardians.length === 1 ? '' : 's'} can currently follow this trip.`
              : 'No guardian currently has visibility for this trip.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MiniTile icon={Eye} label="Linked guardians" value={String(data.guardians.length)} />
          <MiniTile icon={Shield} label="Last visibility signal" value={latestUpdateLabel} />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniTile({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/80 bg-white px-4 py-4">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        <span className="pill-label tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-plumInk">{value}</p>
    </div>
  );
}
