'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { acceptGuardianInvite, getGuardianInvite } from '@/lib/api';
import type { GuardianInviteData } from '@/lib/types';
import { cn } from '@/lib/utils';

export function GuardianInviteClient({ token }: { token: string }) {
  const [invite, setInvite] = useState<GuardianInviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, startAccepting] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadInvite = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getGuardianInvite(token);

        if (!cancelled) {
          setInvite(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load invite');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInvite();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const inviteState = useMemo(() => {
    if (!invite) {
      return null;
    }

    return buildInviteState(invite);
  }, [invite]);

  const handleAccept = () => {
    startAccepting(async () => {
      try {
        const response = await acceptGuardianInvite(token);
        setInvite(response);
        toast({
          title: 'Invite accepted',
          description: `Guardian visibility is now active for ${response.trip.title}.`
        });
      } catch (acceptError) {
        toast({
          title: 'Unable to accept invite',
          description:
            acceptError instanceof Error ? acceptError.message : 'Try again in a moment.',
          variant: 'destructive'
        });
      }
    });
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-border/70 bg-white/92 p-8 shadow-panel">
        <p className="eyebrow">Guardian invite</p>
        <div className="mt-5 space-y-3">
          <div className="h-8 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-5 w-full animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-5 w-5/6 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (error || !invite || !inviteState) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-border/70 bg-white/92 p-8 shadow-panel">
        <p className="eyebrow">Guardian invite</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Invite unavailable</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          {error ?? 'This invite could not be loaded.'}
        </p>
        <div className="mt-6">
          <Link href="/guardians" className={cn(buttonVariants({ variant: 'outline' }))}>
            Back to Guardians
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <section className="rounded-[2rem] border border-border/70 bg-white/92 p-8 shadow-panel">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Guardian invite</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                Trip visibility for {invite.trip.title}
              </h1>
              <Badge variant={inviteState.badgeVariant}>{inviteState.label}</Badge>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {inviteState.description}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-border/70 bg-slate-50/90 px-4 py-3 text-sm text-slate-600">
            <div className="font-medium text-slate-900">{invite.guardian.fullName}</div>
            <div className="mt-1">{invite.guardian.relationship}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
          <p className="eyebrow">What will be shared</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {invite.consent.shareScopes.map((scope) => (
              <Badge key={scope} variant="secondary" className="bg-slate-100 text-slate-700">
                {formatScope(scope)}
              </Badge>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InviteDetail
              icon={MapPin}
              label="Destination"
              value={invite.trip.destination}
            />
            <InviteDetail
              icon={CalendarDays}
              label="Trip window"
              value={`${formatDate(invite.trip.startDate)} - ${formatDate(invite.trip.endDate)}`}
            />
            <InviteDetail
              icon={Clock3}
              label="Access valid until"
              value={formatDateTime(invite.consent.validUntil)}
            />
            <InviteDetail
              icon={UserRound}
              label="Guardian"
              value={`${invite.guardian.fullName} · ${invite.guardian.relationship}`}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Trust action</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Confirm guardian visibility
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Accepting this invite enables family visibility for this trip and allows important
              travel updates to reach the guardian.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {invite.status === 'PENDING' ? (
                <Button
                  variant="destructive"
                  disabled={isAccepting}
                  onClick={handleAccept}
                >
                  {isAccepting ? 'Accepting...' : 'Accept invite'}
                </Button>
              ) : null}
              <Link href="/guardians" className={cn(buttonVariants({ variant: 'outline' }))}>
                Back to Guardians
              </Link>
            </div>
          </div>

          {invite.acceptedAt ? (
            <div className="rounded-[1.8rem] border border-[hsl(var(--safe-surface))] bg-[hsl(var(--safe-surface))] p-6 shadow-panel">
              <div className="flex items-center gap-3 text-[hsl(var(--safe))]">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Accepted
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Guardian access became active on {formatDateTime(invite.acceptedAt)}.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function InviteDetail({
  icon: Icon,
  label,
  value
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}

function buildInviteState(invite: GuardianInviteData) {
  if (invite.status === 'ACCEPTED') {
    return {
      label: 'Accepted',
      badgeVariant: 'success' as const,
      description:
        'This guardian invite has already been accepted. Visibility remains active until the share expires or is revoked.'
    };
  }

  if (invite.status === 'PENDING') {
    return {
      label: 'Pending acceptance',
      badgeVariant: 'caution' as const,
      description:
        'This share is waiting for guardian confirmation. Access and notifications will start after the invite is accepted.'
    };
  }

  return {
    label: invite.status.charAt(0) + invite.status.slice(1).toLowerCase(),
    badgeVariant: 'outline' as const,
    description:
      'This invite is no longer actionable. A new trip share will be needed to restore guardian visibility.'
  };
}

function formatScope(scope: string) {
  return scope
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));
}
