'use client';

import type { ComponentType } from 'react';
import { useId } from 'react';
import { AlertTriangle, PhoneCall, ShieldPlus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SosCard({
  onTriggerSos,
  isLoading = false
}: {
  onTriggerSos?: () => void | Promise<void>;
  isLoading?: boolean;
}) {
  const headingId = useId();

  return (
    <Card
      className="border-[hsl(var(--danger))]/20 bg-white/92 shadow-panel"
      role="region"
      aria-labelledby={headingId}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle
            id={headingId}
            className="flex items-center gap-2 text-2xl text-plumInk"
          >
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--danger))]" aria-hidden />
            Emergency Readiness
          </CardTitle>
          <Badge variant="danger" className="rounded-full">
            Priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[1.6rem] border border-[hsl(var(--danger))]/15 bg-[hsl(var(--danger-surface))] p-5">
          <p className="text-sm leading-7 text-cocoa">
            If something feels unsafe, the emergency flow surfaces trip context, last known
            events, and escalation contacts. This supports preparedness and response—it does not
            guarantee outcomes.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile icon={ShieldPlus} title="Trusted Circle" body="Guardian alerts when configured" />
          <InfoTile icon={PhoneCall} title="Escalation" body="Fast response channel" />
        </div>

        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
          Use the floating SOS button for a confirmation step before an alert is sent.
        </p>

        {onTriggerSos ? (
          <Button
            type="button"
            variant="destructive"
            className="w-full rounded-2xl sm:w-auto"
            disabled={isLoading}
            onClick={() => void onTriggerSos()}
          >
            {isLoading ? 'Sending alert…' : 'Trigger SOS from here'}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InfoTile({
  icon: Icon,
  title,
  body
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.35rem] bg-secondary/65 px-4 py-3">
      <div className="flex items-center gap-2 text-[hsl(var(--danger))]">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-sm font-medium text-plumInk">{title}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
