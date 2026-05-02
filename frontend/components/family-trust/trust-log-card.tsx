import { History, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrustLogEntryData } from '@/lib/types';

export function TrustLogCard({
  entries
}: {
  entries: TrustLogEntryData[];
}) {
  return (
    <Card className="card-surface">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <History className="h-5 w-5 text-primary" />
          Trust Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-[1.3rem] border border-dashed border-border/80 bg-secondary/35 px-4 py-5 text-sm text-cocoa">
            No trust events have been recorded for this trip yet.
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.35rem] border border-border/70 bg-white px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-plumInk">{entry.message}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {entry.guardian
                          ? `${entry.guardian.fullName} · ${entry.guardian.relationship}`
                          : formatActor(entry.actorType)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={trustLogVariant(entry.action)} className="rounded-full">
                    {formatAction(entry.action)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-cocoa">{formatDateTime(entry.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatAction(action: TrustLogEntryData['action']) {
  return action
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatActor(actor: TrustLogEntryData['actorType']) {
  if (actor === 'TRAVELLER') {
    return 'Traveller action';
  }

  if (actor === 'GUARDIAN') {
    return 'Guardian action';
  }

  return 'System action';
}

function trustLogVariant(action: TrustLogEntryData['action']) {
  if (action === 'INVITE_ACCEPTED') {
    return 'success' as const;
  }

  if (action === 'CONSENT_REVOKED' || action === 'INVITE_EXPIRED') {
    return 'outline' as const;
  }

  return 'secondary' as const;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));
}
