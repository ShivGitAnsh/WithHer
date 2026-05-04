'use client';

import { type FormEvent, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createTrip } from '@/lib/api';
import { getApiErrorMessage, getApiErrorTitle } from '@/lib/api-error';
import type { TripSummary } from '@/lib/types';

export function MyTripsPageClient({
  userId,
  initialTrips
}: {
  userId: string;
  initialTrips: TripSummary[];
}) {
  const [trips, setTrips] = useState(initialTrips);
  const [isCreatingTrip, startCreateTrip] = useTransition();
  const [tripForm, setTripForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();

  const sortedTrips = useMemo(
    () =>
      [...trips].sort((left, right) => {
        const priority = ['ACTIVE', 'PLANNED', 'COMPLETED', 'CANCELLED'] as const;
        const statusRank = priority.indexOf(left.status) - priority.indexOf(right.status);

        if (statusRank !== 0) {
          return statusRank;
        }

        return (
          new Date(right.startDate ?? 0).getTime() - new Date(left.startDate ?? 0).getTime()
        );
      }),
    [trips]
  );

  const handleCreateTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startCreateTrip(async () => {
      try {
        const trip = await createTrip({
          userId,
          title: tripForm.title.trim(),
          destination: tripForm.destination.trim(),
          startDate: new Date(tripForm.startDate).toISOString(),
          endDate: new Date(tripForm.endDate).toISOString()
        });

        setTrips((current) => [trip, ...current.filter((item) => item.id !== trip.id)]);
        setTripForm({
          title: '',
          destination: '',
          startDate: '',
          endDate: ''
        });
        toast({
          title: 'Trip created',
          description: `${trip.title} is now available in the travel workspace.`
        });
      } catch (error) {
        toast({
          title: getApiErrorTitle(error, { base: 'Unable to create trip' }),
          description: getApiErrorMessage(error, 'Check the trip dates and try again.'),
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-white/88 px-6 py-7 shadow-panel sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">My Trips</p>
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
            Journeys organised with safety visibility built in
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            These trips come directly from your backend account. Open any trip to see
            the live timeline, safety brief, trust center, and SOS flow.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-white/92 p-6 shadow-panel sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">Create trip</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Add a new trip from the frontend
            </h2>
          </div>
        </div>
        <form onSubmit={handleCreateTrip} className="mt-6 grid gap-4 lg:grid-cols-2">
          <Field
            label="Trip title"
            placeholder="Goa getaway"
            value={tripForm.title}
            onChange={(value) => setTripForm((current) => ({ ...current, title: value }))}
          />
          <Field
            label="Destination"
            placeholder="Goa"
            value={tripForm.destination}
            onChange={(value) =>
              setTripForm((current) => ({ ...current, destination: value }))
            }
          />
          <Field
            label="Start date"
            type="date"
            value={tripForm.startDate}
            onChange={(value) =>
              setTripForm((current) => ({ ...current, startDate: value }))
            }
          />
          <Field
            label="End date"
            type="date"
            value={tripForm.endDate}
            onChange={(value) => setTripForm((current) => ({ ...current, endDate: value }))}
          />
          <div className="lg:col-span-2">
            <Button variant="destructive" type="submit" disabled={isCreatingTrip}>
              {isCreatingTrip ? 'Creating trip...' : 'Create trip'}
            </Button>
          </div>
        </form>
      </section>

      {sortedTrips.length > 0 ? (
        <div className="grid gap-5">
          {sortedTrips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="group overflow-hidden rounded-[1.9rem] border border-border/70 bg-white/92 shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
            >
              <div className="flex flex-col justify-between gap-6 p-6 lg:p-7">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={tripStatusBadgeVariant(trip.status)}>{trip.status}</Badge>
                    <Badge variant="secondary">{trip.destination}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-950">{trip.title}</h2>
                    <p className="text-sm leading-7 text-slate-600">
                      Open the trip to manage guardians, timeline events, itinerary, check-ins,
                      matching, and the Family Trust Center.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TripMeta
                      icon={CalendarDays}
                      label="Travel window"
                      value={formatDateRange(trip.startDate, trip.endDate)}
                    />
                    <TripMeta icon={ShieldCheck} label="Destination" value={trip.destination} />
                    <TripMeta icon={ArrowRight} label="Next step" value="Open trip detail" />
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition group-hover:text-slate-950">
                    Open trip
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-border/80 bg-white/86 px-6 py-6 text-sm leading-7 text-slate-600 shadow-panel">
          No trips are available for this user yet. Use the create trip form above to
          start the first live journey.
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        required
      />
    </label>
  );
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
