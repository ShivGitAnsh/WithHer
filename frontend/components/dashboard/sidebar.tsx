import {
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  Eye,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  TimerReset
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DashboardPageData } from '@/lib/types';

const navigation = [
  { label: 'Route Overview', icon: MapPinned },
  { label: 'Latest Update', icon: ShieldCheck },
  { label: 'AI Brief', icon: BrainCircuit },
  { label: 'Timeline', icon: TimerReset },
  { label: 'Family Trust Center', icon: Eye, href: (tripId: string) => `/family-trust?tripId=${tripId}` },
  { label: 'Trusted Circle', icon: HeartHandshake },
  { label: 'Emergency', icon: AlertTriangle }
];

export function DashboardSidebar({
  data,
  compact = false
}: {
  data: DashboardPageData;
  compact?: boolean;
}) {
  return (
    <Card className="card-surface overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border border-border/80 bg-secondary">
            <AvatarFallback className="bg-secondary text-lg font-semibold text-plumInk">
              FH
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="pill-label text-primary">ForHer</p>
            <h2 className="text-2xl font-semibold text-plumInk">Travel Safety</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Calm visibility for each step of the journey
            </p>
          </div>
        </div>

        <div className="soft-section p-5">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="rounded-full">
              Active Trip
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold text-plumInk">{data.trip.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{data.trip.destination}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricTile label="Status" value={data.trip.status} />
            <MetricTile label="Guardians" value={String(data.guardians.length)} />
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            const href = item.href ? item.href(data.tripId) : '#';

            return (
              <Link
                key={item.label}
                href={href}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-cocoa transition hover:bg-secondary"
              >
                <span className="rounded-xl bg-white p-2 text-primary shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {!compact ? (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="pill-label">Trusted Circle</p>
              {data.guardians.length ? (
                data.guardians.slice(0, 3).map((guardian) => (
                  <div
                    key={guardian.id}
                    className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-plumInk">
                        {guardian.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {guardian.relationship}
                      </p>
                    </div>
                    <Badge variant="success" className="rounded-full">
                      Active
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground">
                  No guardians linked yet.
                </div>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-white/90 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-plumInk">{value}</p>
    </div>
  );
}
