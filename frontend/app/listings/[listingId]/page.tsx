import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getListingSafetyScore } from '@/lib/api';

export default async function ListingDetailPage({
  params
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const safety = await getListingSafetyScore(listingId);

  if (!safety) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/92 shadow-panel">
        <div className="min-h-[240px] bg-[linear-gradient(135deg,#0f766e_0%,#155e75_38%,#f8fafc_100%)]" />
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
            <div className="flex flex-wrap gap-3">
              <Badge variant={statusBadgeVariant(safety.status)}>{safety.status}</Badge>
              <Badge variant="secondary">{safety.recommendation}</Badge>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                {safety.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {safety.neighborhood}, {safety.city}
              </p>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              This listing page is now driven entirely by the live safety API. The
              recommendation, reasons, review signals, and transfer guidance below are all
              rendered from the backend response for this listing id.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="destructive">Use for trip planning</Button>
              <Link href="/safety" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
                Learn how mySaathi scores safety
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-slate-50/85 p-6">
            <p className="eyebrow">Listing safety score</p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-semibold text-slate-950">{safety.score}</h2>
                <p className="mt-1 text-sm text-slate-500">{safety.status}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
            <Progress value={safety.score} className="mt-5 h-2.5" />
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {safety.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="eyebrow">Women traveller signals</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                Why this stay feels the way it does
              </h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {safety.womenReviewHighlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-[1.35rem] border border-border/70 bg-slate-50/90 px-5 py-4 text-sm leading-7 text-slate-600"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
            <p className="eyebrow">Nearby essentials</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {safety.nearbyEssentials.length > 0 ? (
                safety.nearbyEssentials.map((item) => (
                  <Badge key={item} variant="secondary" className="px-3 py-2 text-sm">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Nearby support points are limited, so this stay needs tighter planning.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
            <p className="eyebrow">Transfer guidance</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Arrival and return recommendation
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {safety.transferGuidance}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function statusBadgeVariant(status: string): 'success' | 'caution' | 'danger' {
  if (status === 'Safe') {
    return 'success';
  }

  if (status === 'Moderate') {
    return 'caution';
  }

  return 'danger';
}
