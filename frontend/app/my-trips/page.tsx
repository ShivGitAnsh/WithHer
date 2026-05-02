import Link from 'next/link';
import { ArrowRight, CalendarDays, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { getUiTestingContext } from '@/lib/api';
import type { TripSummary } from '@/lib/types';

const tripCoverGradients = [
  'bg-[linear-gradient(135deg,#164e63_0%,#0f766e_48%,#f0fdfa_100%)]',
  'bg-[linear-gradient(135deg,#1d4ed8_0%,#0891b2_50%,#ecfeff_100%)]',
  'bg-[linear-gradient(135deg,#7c2d12_0%,#f97316_52%,#fff7ed_100%)]',
  'bg-[linear-gradient(135deg,#312e81_0%,#6366f1_50%,#eef2ff_100%)]'
];

export default async function MyTripsPage() {
  const { trips, source } = await getUiTestingContext();

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-white/88 px-6 py-7 shadow-panel sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">My Trips</p>
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
            Journeys organised with safety visibility built in
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Each trip keeps travel details, trusted-circle visibility, and SARA safety
            support in one place.
          </p>
        </div>
      </section>

      <div className="grid gap-5">
        {trips.map((trip, index) => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="group overflow-hidden rounded-[1.9rem] border border-border/70 bg-white/92 shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          >
            <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className={`min-h-[220px] ${tripCoverGradients[index % tripCoverGradients.length]}`} />
              <div className="flex flex-col justify-between gap-6 p-6 lg:p-7">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={tripStatusBadgeVariant(trip.status)}>{trip.status}</Badge>
                    <Badge variant="secondary">
                      {source === 'api' ? 'Database trip' : 'Demo trip'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-950">{trip.title}</h2>
                    <p className="text-sm leading-7 text-slate-600">
                      {buildTripDescription(trip, source)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TripMeta
                      icon={CalendarDays}
                      label="Travel window"
                      value={formatTravelWindow(trip)}
                    />
                    <TripMeta
                      icon={ShieldCheck}
                      label="Safety pulse"
                      value={getSafetyTone(trip.status)}
                    />
                    <TripMeta
                      icon={ArrowRight}
                      label="Next step"
                      value={getNextStepLabel(trip.status)}
                    />
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition group-hover:text-slate-950">
                    Open trip
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatTravelWindow(trip: TripSummary): string {
  if (!trip.startDate || !trip.endDate) {
    return 'Dates syncing';
  }

  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return `${formatter.format(new Date(trip.startDate))} - ${formatter.format(new Date(trip.endDate))}`;
}

function buildTripDescription(trip: TripSummary, source: 'api' | 'demo'): string {
  if (source === 'api') {
    return `Real booking data for ${trip.destination}. Open this trip to test live guardians, safety scoring, safety brief generation, and itinerary generation.`;
  }

  return `Demo journey for ${trip.destination}. Open it to preview the full SARA travel safety flow before wiring a real database user.`;
}

function getSafetyTone(status: TripSummary['status']): string {
  if (status === 'ACTIVE') {
    return 'Live monitoring active';
  }

  if (status === 'PLANNED') {
    return 'Ready for trip setup';
  }

  if (status === 'COMPLETED') {
    return 'Journey archived';
  }

  return 'Review required';
}

function getNextStepLabel(status: TripSummary['status']): string {
  if (status === 'ACTIVE') {
    return 'Track live updates';
  }

  if (status === 'PLANNED') {
    return 'Open trip dashboard';
  }

  if (status === 'COMPLETED') {
    return 'Review trip summary';
  }

  return 'Check trip status';
}

function tripStatusBadgeVariant(status: string): 'secondary' | 'success' | 'outline' | 'caution' {
  if (status === 'ACTIVE') {
    return 'success';
  }

  if (status === 'PLANNED') {
    return 'secondary';
  }

  if (status === 'COMPLETED') {
    return 'outline';
  }

  return 'caution';
}

function TripMeta({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
