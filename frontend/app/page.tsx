import Link from 'next/link';
import { ArrowRight, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { getExploreSafetyPreview } from '@/lib/api';
import { exploreCollections, recommendedTrips, saraTripCatalog } from '@/lib/product-data';
import { cn } from '@/lib/utils';

export default async function ExplorePage() {
  const { flights, hotels } = await getExploreSafetyPreview();

  return (
    <div className="space-y-12 pb-8">
      <section className="hero-panel overflow-hidden rounded-[2rem] border border-white/70 px-6 py-7 shadow-[0_24px_54px_rgba(4,24,52,0.22)] sm:px-8 sm:py-9 lg:px-10 lg:py-11">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge className="bg-white/80 text-slate-700">SARA Travel Companion</Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Travel smarter, safer, and with the confidence of a trusted companion.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  SARA helps solo travellers plan clear journeys, keep family visibility
                  simple, and carry safety support through every stage of the trip.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white/92 p-3 shadow-[0_20px_45px_rgba(6,24,44,0.2)] backdrop-blur">
              <div className="grid gap-3 md:grid-cols-[1.25fr_0.95fr_0.6fr_auto]">
                <SearchField label="Where to?" value="Goa" />
                <SearchField label="Dates" value="May 12 - May 16" />
                <SearchField label="Trip type" value="Solo" />
                <Button
                  variant="default"
                  size="lg"
                  className="h-14 rounded-[1.35rem] px-6"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <QuickAction href={`/trips/${saraTripCatalog[0].id}`} label="Start a Journey" />
              <QuickAction href="/my-trips" label="View Trips" secondary />
              <QuickAction href="/guardians" label="Add Guardian" secondary />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-panel backdrop-blur">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#03214a_0%,#0a58ca_48%,#18b8ff_100%)] px-6 py-7 text-white">
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]" />
              <div className="relative space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/18 text-white backdrop-blur">Trusted circle linked</Badge>
                  <Badge className="bg-white/18 text-white backdrop-blur">SARA brief ready</Badge>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/72">
                    This week&apos;s confidence route
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">Goa Coast Reset</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/78">
                    Daylight arrivals, visible check-ins, and a softer travel planning flow
                    for travellers who want both freedom and reassurance.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatPill icon={MapPin} label="Destination" value="Goa" />
                  <StatPill icon={ShieldCheck} label="Safety Score" value="84 / 100" />
                  <StatPill icon={Users} label="Guardians" value="2 linked" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Explore</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Destinations with clearer travel confidence
            </h2>
          </div>
          <Link
            href="/safety"
            className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex sm:items-center sm:gap-2"
          >
            Learn about safety signals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {exploreCollections.map((collection) => (
            <article
              key={collection.title}
              className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-white/88 shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
            >
              <div className={`h-48 ${collection.visualClass}`} />
              <div className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{collection.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {collection.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {collection.badge}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {collection.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1.5 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 rounded-[2rem] border border-border/70 bg-white/88 p-7 shadow-panel">
          <div>
            <p className="eyebrow">Recommended Trips</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Journeys built for both momentum and peace of mind
            </h2>
          </div>
          <div className="space-y-4">
            {recommendedTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-start justify-between gap-4 rounded-[1.4rem] border border-border/70 bg-slate-50/85 px-5 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-950">{trip.title}</h3>
                    <Badge variant={trip.badgeVariant}>{trip.badgeLabel}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{trip.summary}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/88 shadow-panel">
          <div className="border-b border-border/70 px-7 py-6">
            <p className="eyebrow">Travel with Confidence</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Safety support, designed to feel invisible until it matters
            </h2>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            {[
              'Live family visibility with trip context that stays readable and calm.',
              'SARA Safety Briefs written in plain language for guardians and travellers.',
              'Clear check-in history with timeline-based travel reassurance.',
              'SOS escalation designed to move immediately without cluttering the journey.'
            ].map((item, index) => (
              <div
                key={item}
                className="border-t border-border/70 px-7 py-6 text-sm leading-7 text-slate-600 sm:border-l odd:sm:border-l-0"
              >
                <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {`0${index + 1}`}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Safer Flight Picks</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Arrival-time aware recommendations
              </h2>
            </div>
            <Badge variant="secondary">Rule engine</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="rounded-[1.45rem] border border-border/70 bg-slate-50/90 px-5 py-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-950">{flight.airline}</p>
                      <Badge variant={flightBadgeVariant(flight.recommendation)}>
                        {flight.recommendation}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {flight.origin} to {flight.destination} • {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-slate-900">{flight.safetyScore}/100</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Arrives {formatTimeLabel(flight.arrivalAt)}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                  {flight.reasons.slice(0, 2).map((reason) => (
                    <li key={reason} className="flex items-start gap-3">
                      <Clock3 className="mt-1 h-4 w-4 text-slate-400" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-[1.1rem] bg-white px-4 py-3 text-sm text-slate-600">
                  {flight.saferTransferHint}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Safer Stay Picks</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Hotel visibility with safety reasons
              </h2>
            </div>
            <Badge variant="secondary">Women review aware</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="rounded-[1.45rem] border border-border/70 bg-slate-50/90 px-5 py-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-950">{hotel.name}</p>
                      <Badge variant={hotelBadgeVariant(hotel.recommendation)}>
                        {hotel.recommendation}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{hotel.neighborhood}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{hotel.safetyScore}/100</p>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                  {hotel.reasons.slice(0, 2).map((reason) => (
                    <li key={reason} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/listings/${hotel.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                >
                  View safety details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SearchField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  label,
  secondary = false
}: {
  href: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: secondary ? 'outline' : 'default',
          size: 'lg',
          className: 'rounded-[1.15rem] px-5'
        })
      )}
    >
      {label}
    </Link>
  );
}

function StatPill({
  icon: Icon,
  label,
  value
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/18 bg-white/12 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/86">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.24em]">{label}</span>
      </div>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function flightBadgeVariant(
  recommendation: 'Recommended' | 'Late arrival, use caution' | 'Not recommended for solo arrival'
): 'success' | 'caution' | 'danger' {
  if (recommendation === 'Recommended') {
    return 'success';
  }

  if (recommendation === 'Late arrival, use caution') {
    return 'caution';
  }

  return 'danger';
}

function hotelBadgeVariant(
  recommendation: 'Recommended' | 'Use caution' | 'Not recommended'
): 'success' | 'caution' | 'danger' {
  if (recommendation === 'Recommended') {
    return 'success';
  }

  if (recommendation === 'Use caution') {
    return 'caution';
  }

  return 'danger';
}

function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));
}
