'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Copy, Phone, ShieldAlert, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { SosCaseData } from '@/lib/types';

export function SosCaseClient({ data }: { data: SosCaseData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<'message' | null>(null);

  const handleCopyGuardianMessage = async () => {
    try {
      await navigator.clipboard.writeText(data.shareBundle.guardianMessage);
      setCopiedField('message');
      toast({
        title: 'Copied guardian update',
        description: 'The SOS share message is ready to paste into any call or chat handoff.'
      });
    } catch {
      toast({
        title: 'Copy unavailable',
        description: 'Clipboard access is not available right now.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-[2rem] border border-[hsl(var(--danger))]/20 bg-white/92 px-6 py-7 shadow-panel sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="danger">SOS Active</Badge>
              <Badge variant="outline">Case {data.caseId.slice(0, 8)}</Badge>
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
              SOS support for {data.trip.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Guardian alerts have been sent. This screen packages the next escalation path,
              stay support details, and destination helplines into one place.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">Situation</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Metric title="Destination" value={data.trip.destination} />
              <Metric title="Triggered" value={formatDateTime(data.shareBundle.triggeredAt)} />
              <Metric
                title="Last known update"
                value={data.shareBundle.latestStatus}
                spanClassName="sm:col-span-2"
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Escalation path</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  What happens next
                </h2>
              </div>
              <ShieldAlert className="h-5 w-5 text-[hsl(var(--danger))]" />
            </div>
            <div className="mt-5 space-y-4">
              {data.escalationSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-[1.35rem] border border-border/70 bg-slate-50/85 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {step.step}. {step.label}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{step.channel}</p>
                    </div>
                    <Badge variant={step.status === 'sent' ? 'danger' : 'caution'}>
                      {step.status === 'sent' ? 'In motion' : 'Ready'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                  {step.contactName || step.contactPhone ? (
                    <p className="mt-3 text-sm font-medium text-slate-900">
                      {step.contactName ?? 'Contact'}{step.contactPhone ? ` · ${step.contactPhone}` : ''}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Share bundle</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Guardian handoff message
                </h2>
              </div>
              <Button variant="outline" onClick={() => void handleCopyGuardianMessage()}>
                <Copy className="mr-2 h-4 w-4" />
                {copiedField === 'message' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="mt-4 rounded-[1.35rem] border border-border/70 bg-slate-50/85 p-4 text-sm leading-7 text-slate-700">
              {data.shareBundle.guardianMessage}
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {data.shareBundle.actionChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">People on this case</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Guardians and contacts</h2>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {data.guardians.map((guardian) => (
                <ContactRow
                  key={`guardian-${guardian.id}`}
                  title={guardian.fullName}
                  subtitle={guardian.relationship}
                  phone={guardian.phoneNumber ?? undefined}
                  badge="Guardian"
                  badgeVariant="secondary"
                />
              ))}
              {data.emergencyContacts.map((contact) => (
                <ContactRow
                  key={`emergency-${contact.id}`}
                  title={contact.fullName}
                  subtitle={contact.relationship}
                  phone={contact.phoneNumber}
                  badge={contact.isPrimary ? 'Primary emergency' : 'Emergency'}
                  badgeVariant={contact.isPrimary ? 'danger' : 'outline'}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">Stay support</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {data.localSupport.staySupport.propertyName}
                </h2>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <p>{data.localSupport.staySupport.addressHint}</p>
              <SupportLine label="Front desk" value={data.localSupport.staySupport.frontDeskPhone} />
              {data.localSupport.staySupport.supportDeskPhone ? (
                <SupportLine
                  label={data.localSupport.staySupport.supportDeskLabel}
                  value={data.localSupport.staySupport.supportDeskPhone}
                />
              ) : null}
              <p>{data.localSupport.staySupport.transferNote}</p>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">Local helplines</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {data.localSupport.destinationLabel} response numbers
                </h2>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {data.localSupport.helplines.map((helpline) => (
                <div
                  key={`${helpline.label}-${helpline.phoneNumber}`}
                  className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{helpline.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{helpline.category}</p>
                    </div>
                    <Badge variant="outline">{helpline.availability}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">{helpline.phoneNumber}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  spanClassName
}: {
  title: string;
  value: string;
  spanClassName?: string;
}) {
  return (
    <div className={`rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4 ${spanClassName ?? ''}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function ContactRow({
  title,
  subtitle,
  phone,
  badge,
  badgeVariant
}: {
  title: string;
  subtitle: string;
  phone?: string;
  badge: string;
  badgeVariant: 'secondary' | 'outline' | 'danger';
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      {phone ? <p className="mt-3 text-sm font-medium text-slate-900">{phone}</p> : null}
    </div>
  );
}

function SupportLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-slate-50/85 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
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
