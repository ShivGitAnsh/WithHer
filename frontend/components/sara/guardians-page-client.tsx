'use client';

import { type FormEvent, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Phone, Share2, ShieldCheck } from 'lucide-react';

import { TrustLogCard } from '@/components/family-trust/trust-log-card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  createConsent,
  createGuardian,
  revokeConsent
} from '@/lib/api';
import { getApiErrorMessage, getApiErrorTitle } from '@/lib/api-error';
import type {
  ConsentData,
  Guardian,
  ShareScope,
  TripSummary,
  TrustLogEntryData
} from '@/lib/types';
import { cn } from '@/lib/utils';

const shareScopeOptions: Array<{ value: ShareScope; label: string }> = [
  { value: 'ITINERARY', label: 'Itinerary' },
  { value: 'HOTEL_DETAILS', label: 'Hotel' },
  { value: 'FLIGHT_DETAILS', label: 'Flight' },
  { value: 'CHECK_IN_UPDATES', label: 'Check-ins' },
  { value: 'EMERGENCY_CONTACTS', label: 'Emergency contacts' },
  { value: 'SOS_ALERTS', label: 'SOS alerts' }
];

export function GuardiansPageClient({
  userId,
  trip,
  initialGuardians,
  initialConsents,
  initialTrustLog
}: {
  userId: string;
  trip: TripSummary | null;
  initialGuardians: Guardian[];
  initialConsents: ConsentData[];
  initialTrustLog: TrustLogEntryData[];
}) {
  const [guardians, setGuardians] = useState(initialGuardians);
  const [consents, setConsents] = useState(initialConsents);
  const [trustLog, setTrustLog] = useState(initialTrustLog);
  const [guardianForm, setGuardianForm] = useState({
    fullName: '',
    relationship: '',
    phoneNumber: '',
    email: ''
  });
  const [shareGuardianId, setShareGuardianId] = useState(initialGuardians[0]?.id ?? '');
  const [shareScopes, setShareScopes] = useState<ShareScope[]>([
    'ITINERARY',
    'CHECK_IN_UPDATES',
    'SOS_ALERTS'
  ]);
  const [validUntil, setValidUntil] = useState(defaultValidUntil());
  const [isCreatingGuardian, startCreateGuardian] = useTransition();
  const [isSharingTrip, startSharingTrip] = useTransition();
  const [revokingConsentId, setRevokingConsentId] = useState<string | null>(null);
  const [revokeDialog, setRevokeDialog] = useState<{
    consentId: string;
    guardianName: string;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const { toast } = useToast();

  const acceptedConsents = useMemo(
    () =>
      consents.filter(
        (consent) =>
          consent.status === 'ACTIVE' &&
          (!consent.guardianInvite || consent.guardianInvite.status === 'ACCEPTED')
      ),
    [consents]
  );

  const pendingInviteConsents = useMemo(
    () =>
      consents.filter(
        (consent) =>
          consent.status === 'ACTIVE' && consent.guardianInvite?.status === 'PENDING'
      ),
    [consents]
  );

  const handleGuardianSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startCreateGuardian(async () => {
      try {
        const guardian = await createGuardian({
          userId,
          fullName: guardianForm.fullName.trim(),
          relationship: guardianForm.relationship.trim(),
          phoneNumber: guardianForm.phoneNumber.trim() || undefined,
          email: guardianForm.email.trim() || undefined
        });

        setGuardians((current) => [guardian, ...current]);
        setShareGuardianId((current) => current || guardian.id);
        setGuardianForm({
          fullName: '',
          relationship: '',
          phoneNumber: '',
          email: ''
        });
        toast({
          title: 'Guardian added',
          description: `${guardian.fullName} is now available for trip sharing.`
        });
      } catch (error) {
        toast({
          title: getApiErrorTitle(error, {
            base: 'Unable to add guardian',
            duplicate: 'Guardian already added'
          }),
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleShareTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startSharingTrip(async () => {
      try {
        if (!trip) {
          throw new Error('No trip is available to share right now.');
        }

        const consent = await createConsent({
          tripId: trip.id,
          guardianId: shareGuardianId,
          shareScopes,
          validUntil: new Date(validUntil).toISOString()
        });

        setConsents((current) => [consent, ...current.filter((item) => item.id !== consent.id)]);
        setTrustLog((current) => [
          buildTrustLogEntry(consent, 'CONSENT_CREATED', 'TRAVELLER', 'Trip visibility created for a guardian.'),
          buildTrustLogEntry(consent, 'INVITE_CREATED', 'SYSTEM', 'Guardian invite generated and awaiting acceptance.'),
          ...current
        ]);
        toast({
          title: 'Trip sharing created',
          description: `${consent.guardian.fullName} can view this trip after accepting the invite.`
        });
      } catch (error) {
        toast({
          title: getApiErrorTitle(error, {
            base: 'Unable to share trip',
            duplicate: 'Sharing already exists'
          }),
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleRevokeConsent = (consentId: string, reason?: string) => {
    setRevokingConsentId(consentId);

    void revokeConsent(consentId, reason)
      .then((consent) => {
        setConsents((current) =>
          current.map((item) => (item.id === consentId ? { ...item, ...consent } : item))
        );
        setTrustLog((current) => [
          buildTrustLogEntry(
            consent,
            'CONSENT_REVOKED',
            'TRAVELLER',
            reason ? `Trip visibility revoked. Reason: ${reason}` : 'Trip visibility revoked by traveller.'
          ),
          ...current
        ]);
        toast({
          title: 'Sharing revoked',
          description: 'Guardian visibility for this consent has been turned off.'
        });
      })
      .catch((error) => {
        toast({
          title: getApiErrorTitle(error, { base: 'Unable to revoke sharing' }),
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      })
      .finally(() => {
        setRevokingConsentId(null);
        setRevokeDialog(null);
        setRevokeReason('');
      });
  };

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-[2rem] border border-border/70 bg-white/90 px-6 py-7 shadow-panel sm:px-8">
        <p className="eyebrow">Guardians</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
          Keep your trusted circle close without making travel feel heavy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          mySaathi keeps sharing deliberate. Add the people you trust, choose what they
          can see, and keep trip visibility time-bounded.
        </p>
      </section>

      {!trip ? (
        <div className="rounded-[1.8rem] border border-dashed border-border/80 bg-white/86 px-6 py-6 text-sm leading-7 text-slate-600 shadow-panel">
          Guardian records are live, but trip sharing will stay unavailable until this user has at least one real trip.
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <form
            onSubmit={handleGuardianSubmit}
            className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Add guardian</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Set up a trusted contact
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={guardianForm.fullName}
                onChange={(value) => setGuardianForm((current) => ({ ...current, fullName: value }))}
                placeholder="Asha Nair"
              />
              <Field
                label="Relationship"
                value={guardianForm.relationship}
                onChange={(value) =>
                  setGuardianForm((current) => ({ ...current, relationship: value }))
                }
                placeholder="Mother"
              />
              <Field
                label="Phone number"
                value={guardianForm.phoneNumber}
                onChange={(value) =>
                  setGuardianForm((current) => ({ ...current, phoneNumber: value }))
                }
                placeholder="+91 98..."
              />
              <Field
                label="Email"
                value={guardianForm.email}
                onChange={(value) => setGuardianForm((current) => ({ ...current, email: value }))}
                placeholder="name@example.com"
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="submit" variant="destructive" disabled={isCreatingGuardian}>
                {isCreatingGuardian ? 'Adding guardian...' : 'Add guardian'}
              </Button>
            </div>
          </form>

          {guardians.map((guardian, index) => (
            <div
              key={guardian.id}
              className="rounded-[1.7rem] border border-border/70 bg-white/92 p-6 shadow-panel"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">{guardian.fullName}</h2>
                    <Badge variant={index === 0 ? 'success' : 'secondary'}>
                      {index === 0 ? 'Primary contact' : 'Guardian'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{guardian.relationship}</p>
                  <p className="text-sm leading-7 text-slate-600">
                    Receives only the visibility you explicitly approve for a given trip.
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {guardian.phoneNumber ?? guardian.email ?? 'Contact detail pending'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Share2 className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Share status</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {acceptedConsents.length} accepted visibility grants
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {trip ? (
                <>
                  Current trip: <span className="font-medium text-slate-900">{trip.title}</span>.
                  Sharing stays revocable and expires automatically.
                </>
              ) : (
                'No live trip is available yet, so guardian visibility is waiting on the first trip.'
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="rounded-full bg-slate-100 px-3 py-1.5">
                {acceptedConsents.length} accepted
              </div>
              <div className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                {pendingInviteConsents.length} pending acceptance
              </div>
            </div>
            {trip ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/family-trust?tripId=${trip.id}`}
                  className={cn(buttonVariants({ variant: 'destructive' }))}
                >
                  Open Family Trust Center
                </Link>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleShareTrip}
            className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel"
          >
            <p className="eyebrow">Share current trip</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {trip ? 'Choose who can see this journey' : 'Trip sharing unlocks when a trip exists'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {trip
                ? `Current trip: ${trip.title}. Sharing stays revocable and expires automatically.`
                : 'Create a trip first, then return here to grant time-bounded guardian visibility.'}
            </p>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Guardian</span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  value={shareGuardianId}
                  onChange={(event) => setShareGuardianId(event.target.value)}
                  disabled={!trip}
                >
                  {guardians.map((guardian) => (
                    <option key={guardian.id} value={guardian.id}>
                      {guardian.fullName} · {guardian.relationship}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Visible until</span>
                <input
                  type="datetime-local"
                  className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  disabled={!trip}
                />
              </label>

              <div className="space-y-3">
                <span className="text-sm font-medium text-slate-700">Share scopes</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {shareScopeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-[1rem] border border-border/70 bg-slate-50/85 px-4 py-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={shareScopes.includes(option.value)}
                        onChange={() =>
                          setShareScopes((current) =>
                            current.includes(option.value)
                              ? current.filter((scope) => scope !== option.value)
                              : [...current, option.value]
                          )
                        }
                        disabled={!trip}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                type="submit"
                variant="destructive"
                disabled={isSharingTrip || !trip || !shareGuardianId || shareScopes.length === 0}
              >
                {isSharingTrip ? 'Sharing trip...' : 'Share trip'}
              </Button>
            </div>
          </form>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">Active permissions</p>
            <div className="mt-4 space-y-4">
              {consents.length === 0 ? (
                <div className="rounded-[1.3rem] border border-dashed border-border/70 bg-slate-50/85 px-4 py-4 text-sm text-slate-500">
                  No active or historical consents yet.
                </div>
              ) : (
                consents.map((consent) => (
                  <div
                    key={consent.id}
                    className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {consent.guardian.fullName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {consent.trip?.title ?? 'Trip visibility'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={consent.status === 'ACTIVE' ? 'success' : 'outline'}>
                          {consent.status}
                        </Badge>
                        {consent.guardianInvite ? (
                          <Badge variant={getInviteBadgeVariant(consent.guardianInvite.status)}>
                            Invite {formatInviteStatus(consent.guardianInvite.status)}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {consent.shareScopes.join(', ')}
                    </p>
                    {consent.guardianInvite?.status === 'PENDING' ? (
                      <p className="mt-2 text-sm text-amber-700">
                        Guardian access is pending until the invite is accepted.
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Valid until {formatDateTime(consent.validUntil)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {consent.guardianInvite?.status === 'PENDING' ? (
                        <Link
                          href={`/invites/${consent.guardianInvite.token}`}
                          className={cn(buttonVariants({ variant: 'outline' }))}
                        >
                          Review invite
                        </Link>
                      ) : null}
                      {consent.status === 'ACTIVE' ? (
                        <Button
                          variant="outline"
                          disabled={revokingConsentId === consent.id}
                          onClick={() =>
                            setRevokeDialog({
                              consentId: consent.id,
                              guardianName: consent.guardian.fullName
                            })
                          }
                        >
                          {revokingConsentId === consent.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">What guardians receive</p>
            <div className="mt-4 space-y-4">
              <GuardianSignal
                icon={ShieldCheck}
                title="Trip status visibility"
                body="Latest travel update, destination context, and structured timeline."
              />
              <GuardianSignal
                icon={Phone}
                title="Immediate SOS alerts"
                body="WhatsApp alerts go out immediately for active trip-sharing grants."
              />
            </div>
          </div>

          <TrustLogCard entries={trustLog} />
        </div>
      </section>

      {revokeDialog ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4 pt-10 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-md rounded-[1.75rem] border border-border/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <h3 className="text-lg font-semibold text-slate-950">Revoke trip visibility?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will remove current visibility for {revokeDialog.guardianName}. Add a reason to
              keep the trust log clear for later review.
            </p>
            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-slate-700">Revocation reason</span>
              <textarea
                value={revokeReason}
                onChange={(event) => setRevokeReason(event.target.value)}
                placeholder="Trip plans changed"
                className="min-h-[110px] w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setRevokeDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={revokingConsentId === revokeDialog.consentId}
                onClick={() =>
                  handleRevokeConsent(
                    revokeDialog.consentId,
                    revokeReason.trim() || undefined
                  )
                }
              >
                {revokingConsentId === revokeDialog.consentId ? 'Revoking...' : 'Confirm revoke'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function GuardianSignal({
  icon: Icon,
  title,
  body
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
        <Icon className="h-4 w-4 text-slate-500" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function defaultValidUntil() {
  const nextDay = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const timezoneOffset = nextDay.getTimezoneOffset() * 60 * 1000;
  return new Date(nextDay.getTime() - timezoneOffset).toISOString().slice(0, 16);
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

function getInviteBadgeVariant(status: ConsentData['guardianInvite'] extends infer T
  ? T extends { status: infer S }
    ? S
    : never
  : never) {
  if (status === 'ACCEPTED') {
    return 'success' as const;
  }

  if (status === 'PENDING') {
    return 'caution' as const;
  }

  return 'outline' as const;
}

function formatInviteStatus(status: NonNullable<ConsentData['guardianInvite']>['status']) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function buildTrustLogEntry(
  consent: ConsentData,
  action: TrustLogEntryData['action'],
  actorType: TrustLogEntryData['actorType'],
  message: string
): TrustLogEntryData {
  return {
    id: `trust-log-${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    consentId: consent.id,
    tripId: consent.tripId,
    guardianId: consent.guardianId,
    actorType,
    action,
    message,
    metadata: null,
    createdAt: new Date().toISOString(),
    guardian: {
      id: consent.guardian.id,
      fullName: consent.guardian.fullName,
      relationship: consent.guardian.relationship
    }
  };
}
