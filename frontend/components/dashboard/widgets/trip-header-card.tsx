'use client';

import { BellRing, CalendarDays, RefreshCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardPageData } from '@/lib/types';

export function TripHeaderCard({
  data,
  isRefreshing,
  isGeneratingBrief,
  onRefresh,
  onGenerateBrief
}: {
  data: DashboardPageData;
  isRefreshing: boolean;
  isGeneratingBrief: boolean;
  onRefresh: () => void;
  onGenerateBrief: () => void;
}) {
  const dateLabel = formatTripDates(data.trip.startDate, data.trip.endDate);

  return (
    <Card className="card-surface overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full">
                Premium Safety Dashboard
              </Badge>
              <Badge
                variant={data.trip.status === 'ACTIVE' ? 'success' : 'secondary'}
                className="rounded-full"
              >
                {data.trip.status}
              </Badge>
            </div>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-plumInk md:text-4xl xl:text-[2.8rem]">
                {data.trip.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-cocoa md:text-base">
                A clear, shared travel safety view for the traveller and her trusted
                circle. Stay aligned on status, confidence, and next steps at a glance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <CalendarDays className="h-4 w-4 text-primary" />
                {dateLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                {data.trip.destination}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="rounded-2xl" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isRefreshing ? 'Refreshing...' : 'Refresh Dashboard'}
            </Button>
            <Link
              href={`/family-trust?tripId=${data.tripId}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white/90 px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary"
            >
              Family Trust Center
            </Link>
            <Button className="rounded-2xl sm:col-span-2" onClick={onGenerateBrief} disabled={isGeneratingBrief}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGeneratingBrief ? 'Generating...' : 'Refresh AI Brief'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatBlock label="Destination" value={data.trip.destination} />
          <StatBlock
            label="Latest Update"
            value={data.latestEvent?.eventType ?? 'Awaiting update'}
          />
          <StatBlock label="Guardians Tracking" value={String(data.guardians.length)} />
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm text-cocoa">
          <BellRing className="h-4 w-4 text-primary" />
          Family notifications are currently active for this trip timeline.
        </div>
      </CardContent>
    </Card>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-border/80 bg-white px-4 py-4">
      <p className="pill-label">{label}</p>
      <p className="mt-2 text-lg font-medium text-plumInk">{value}</p>
    </div>
  );
}

function formatTripDates(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return 'Dates unavailable';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return `${start.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })} - ${end.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })}`;
}
