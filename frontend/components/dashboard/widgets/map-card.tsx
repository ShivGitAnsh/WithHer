import type { ComponentType } from 'react';
import { CarFront, MapPinned, Route, TrainFront } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardPageData } from '@/lib/types';

export function MapCard({ data }: { data: DashboardPageData }) {
  return (
    <Card className="card-surface overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MapPinned className="h-5 w-5 text-primary" />
            Route Overview
          </CardTitle>
          <Badge variant="outline" className="rounded-full">
            Live overview
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.96))] p-6">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-[12%] top-[22%] h-24 w-24 rounded-full border border-primary/10" />
            <div className="absolute right-[14%] top-[18%] h-32 w-32 rounded-full border border-primary/10" />
            <div className="absolute bottom-[18%] left-[28%] h-20 w-20 rounded-full border border-primary/10" />
          </div>
          <div className="relative z-10 flex min-h-[280px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <MapPinBubble label="Home" align="left" />
              <MapPinBubble label={data.trip.destination} align="right" active />
            </div>
            <div className="mx-auto flex w-full max-w-xl items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10" />
              <Route className="h-5 w-5 text-primary" />
              <div className="h-px flex-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TransportChip icon={CarFront} label="Safe transfer" value="Pre-arranged cab" />
              <TransportChip icon={TrainFront} label="Support zone" value="Central district" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <InfoStrip label="Latest event" value={data.latestEvent?.title ?? 'No live event'} />
          <InfoStrip label="Trip status" value={data.trip.status} />
          <InfoStrip label="Family view" value={`${data.guardians.length} linked guardians`} />
        </div>
      </CardContent>
    </Card>
  );
}

function MapPinBubble({
  label,
  align,
  active
}: {
  label: string;
  align: 'left' | 'right';
  active?: boolean;
}) {
  return (
    <div
      className={`max-w-[160px] rounded-[1.4rem] px-4 py-3 shadow-sm ${
        active ? 'bg-white text-plumInk' : 'bg-secondary/80 text-cocoa'
      } ${align === 'right' ? 'self-end' : ''}`}
    >
      <p className="pill-label tracking-[0.18em]">
        {active ? 'Destination' : 'Origin'}
      </p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
    </div>
  );
}

function TransportChip({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.35rem] bg-white/90 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        <span className="pill-label tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-plumInk">{value}</p>
    </div>
  );
}

function InfoStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-border/80 bg-white px-4 py-3">
      <p className="pill-label">{label}</p>
      <p className="mt-2 text-sm font-medium text-plumInk">{value}</p>
    </div>
  );
}
