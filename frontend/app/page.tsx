import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';

import { DataStatePanel } from '@/components/sara/data-state-panel';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getTripsByUser, selectPrimaryTrip } from '@/lib/api';
import { getConfiguredUserId } from '@/lib/runtime-config';
import { cn } from '@/lib/utils';

export default async function ExplorePage() {
  const userId = getConfiguredUserId();

  if (!userId) {
    return (
      <DataStatePanel
        eyebrow="Setup required"
        title="Connect mySaathi to a real traveller account"
        description="Set NEXT_PUBLIC_DEFAULT_USER_ID in frontend/.env.local with a real user id from your database. Once that is configured, Explore will use live trips and trust data only."
      />
    );
  }

  const trips = await getTripsByUser(userId);
  const primaryTrip = selectPrimaryTrip(trips);

  return (
    <div className="space-y-10 pb-8">
      <section className="hero-panel overflow-hidden rounded-[2rem] border border-white/70 px-6 py-7 shadow-panel sm:px-8 sm:py-9 lg:px-10 lg:py-11">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge className="bg-white/80 text-slate-700">mySaathi by MakeMyTrip</Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Travel with clarity, trusted visibility, and calmer safety support.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  mySaathi now runs on live trip data only. Every trust signal, guardian update,
                  and safety surface reflects your actual backend records.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/my-trips"
                className={cn(buttonVariants({ variant: 'destructive', size: 'lg' }), 'rounded-[1.25rem] px-6')}
              >
                View Trips
              </Link>
              <Link
                href="/guardians"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-[1.25rem] px-6')}
              >
                Manage Guardians
              </Link>
              <Link
                href="/profile"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-[1.25rem] px-6')}
              >
                Profile
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-panel backdrop-blur">
            {primaryTrip ? (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Live trip linked</Badge>
                  <Badge variant="secondary">Guardian visibility ready</Badge>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                    Current focus
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    {primaryTrip.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {primaryTrip.destination} • {formatDateRange(primaryTrip.startDate, primaryTrip.endDate)}
                  </p>
                </div>
                <Link
                  href={`/trips/${primaryTrip.id}`}
                  className={cn(buttonVariants({ variant: 'outline' }), 'rounded-[1.2rem]')}
                >
                  Open Trip Detail
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Current focus</p>
                <h2 className="text-2xl font-semibold text-slate-950">No live trips yet</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Create a trip in the backend to activate the trip detail, trust center,
                  safety score, and SOS flows from the UI.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
          <p className="eyebrow">My Trips</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Live journeys from your account
          </h2>
          <div className="mt-6 space-y-4">
            {trips.length > 0 ? (
              trips.slice(0, 4).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-border/70 bg-slate-50/85 px-5 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{trip.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {trip.destination} • {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                  <Badge variant={trip.status === 'ACTIVE' ? 'success' : trip.status === 'PLANNED' ? 'secondary' : 'outline'}>
                    {trip.status}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="rounded-[1.4rem] border border-dashed border-border/80 bg-slate-50/70 px-5 py-6 text-sm leading-7 text-slate-600">
                No trips are available for this user yet.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/92 shadow-panel">
          <div className="border-b border-border/70 px-7 py-6">
            <p className="eyebrow">Travel with Confidence</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Live product surfaces now connected to backend data
            </h2>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: 'Safety score', body: 'Trip safety signals now come directly from the backend rule engine.' },
              { icon: Sparkles, title: 'mySaathi brief', body: 'The safety brief is generated from actual trip and latest-event context.' },
              { icon: Users, title: 'Trusted circle', body: 'Guardians, consents, and invite status are loaded from live records.' },
              { icon: ArrowRight, title: 'Trip detail', body: 'Timeline, check-ins, SOS, itinerary, and matching all use real trip ids.' }
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border-t border-border/70 px-7 py-6 text-sm leading-7 text-slate-600 sm:border-l odd:sm:border-l-0"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return 'Dates unavailable';
  }

  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}
